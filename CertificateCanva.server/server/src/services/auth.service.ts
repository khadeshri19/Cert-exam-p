import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshTokensByUser,
  findUserById,
} from "../repository/auth.repository";
import { comparePassword } from "../utils/hash";

export const login = async (data: any) => {
  if (!data) throw new Error("Request body missing");

  const { email, password } = data;
  if (!email || !password) throw new Error("Email and password are required");

  const user = await findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) throw new Error("Invalid credentials");

  const accessToken = jwt.sign(
    { id: user.id, role: user.role_name },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );

  await saveRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
};

export const refresh = async (token: string) => {
  if (!token) throw new Error("Token missing");

  const stored = await findRefreshToken(token);
  if (!stored) throw new Error("Forbidden");

  const decoded: any = jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET!
  );

  return jwt.sign(
    { id: decoded.id },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );
};

export const logout = async (userId: string) => {
  await deleteRefreshTokensByUser(userId);
};

export const getUser = async (id: string) => {
  return findUserById(id);
};
