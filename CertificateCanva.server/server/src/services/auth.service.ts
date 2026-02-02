import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import {
  findUserByEmail,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshTokensByUser,
  findUserById,
  deleteRefreshToken,
} from '../repository/auth.repository';
import { comparePassword } from '../utils/hash';
import { LoginDTO, TokenPayload, TokenResponse } from '../types/auth.types';
import { HttpError } from '../middlewares/error.middleware';

export const login = async (data: LoginDTO): Promise<TokenResponse> => {
  if (!data || !data.email || !data.password) {
    throw new HttpError('Email and password are required', 400);
  }

  const user = await findUserByEmail(data.email);
  if (!user) {
    throw new HttpError('Invalid credentials', 401);
  }

  if (!user.is_active) {
    throw new HttpError('Account is deactivated', 403);
  }

  const valid = await comparePassword(data.password, user.password_hash);
  if (!valid) {
    throw new HttpError('Invalid credentials', 401);
  }

  // Generate access token
  const accessToken = jwt.sign(
    { id: user.id, role: user.role_name },
    jwtConfig.accessToken.secret,
    { expiresIn: '15m' }
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    { id: user.id },
    jwtConfig.refreshToken.secret,
    { expiresIn: '7d' }
  );

  // Save refresh token to database
  await saveRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
};

export const refresh = async (token: string): Promise<string> => {
  if (!token) {
    throw new HttpError('Refresh token is required', 400);
  }

  // Check if token exists in database
  const stored = await findRefreshToken(token);
  if (!stored) {
    throw new HttpError('Invalid or expired refresh token', 403);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, jwtConfig.refreshToken.secret) as TokenPayload;

    // Get user to include role in new token
    const user = await findUserById(decoded.id);
    if (!user) {
      throw new HttpError('User not found', 404);
    }

    if (!user.is_active) {
      throw new HttpError('Account is deactivated', 403);
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: decoded.id, role: user.role_name },
      jwtConfig.accessToken.secret,
      { expiresIn: '15m' }
    );

    return accessToken;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      await deleteRefreshToken(token);
      throw new HttpError('Refresh token expired', 401);
    }
    throw error;
  }
};

export const logout = async (userId: string): Promise<void> => {
  await deleteRefreshTokensByUser(userId);
};

export const getUser = async (id: string) => {
  const user = await findUserById(id);
  if (!user) {
    throw new HttpError('User not found', 404);
  }

  // Remove sensitive data
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
