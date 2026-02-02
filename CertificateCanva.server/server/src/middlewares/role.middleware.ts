import { Request, Response, NextFunction } from 'express';
import { HttpError } from './error.middleware';

// Require admin role
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  if (req.user.role !== 'admin') {
    throw new HttpError('Admin access required', 403);
  }

  next();
};

// Require user role (admins cannot access - for canvas design)
export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  if (req.user.role === 'admin') {
    throw new HttpError('Admins cannot design canvases. Please use a user account.', 403);
  }

  next();
};

// Allow both admin and user
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  next();
};
