import dotenv from 'dotenv';
dotenv.config();

export const jwtConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET || 'fallback-access-secret',
    expiresIn: '15m',
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    expiresIn: '7d',
  },
};
