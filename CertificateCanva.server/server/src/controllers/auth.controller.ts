import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../types/express';
import { asyncHandler } from '../middlewares/error.middleware';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = await authService.login(req.body);

  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: { accessToken, refreshToken },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(400).json({
      success: false,
      message: 'Refresh token required',
    });
    return;
  }

  const accessToken = await authService.refresh(refreshToken);

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: { accessToken },
  });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }

  await authService.logout(req.user.id);

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const getUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await authService.getUser(req.params.id);

  res.json({
    success: true,
    data: user,
  });
});

export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }

  const user = await authService.getUser(req.user.id);

  res.json({
    success: true,
    data: user,
  });
});
