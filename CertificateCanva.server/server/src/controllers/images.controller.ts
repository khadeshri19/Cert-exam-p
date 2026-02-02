import { Response } from 'express';
import * as imageService from '../services/images.service';
import { AuthRequest } from '../types/express';
import { asyncHandler, HttpError } from '../middlewares/error.middleware';

export const upload = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }

  if (!req.file) {
    throw new HttpError('No file uploaded', 400);
  }

  const image = await imageService.uploadImage(req.user.id, req.file);

  res.status(201).json({
    success: true,
    message: 'Image uploaded successfully',
    data: image,
  });
});

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }

  const isAdmin = req.user.role === 'admin';

  // Admins see all images, users see only their own
  const images = isAdmin
    ? await imageService.getAllImages()
    : await imageService.getImagesByUser(req.user.id);

  res.json({
    success: true,
    data: images,
  });
});

export const getOne = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }

  const isAdmin = req.user.role === 'admin';
  const image = await imageService.getImageById(
    req.params.id,
    req.user.id,
    isAdmin
  );

  res.json({
    success: true,
    data: image,
  });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }

  const isAdmin = req.user.role === 'admin';
  await imageService.deleteImage(req.params.id, req.user.id, isAdmin);

  res.json({
    success: true,
    message: 'Image deleted successfully',
  });
});

export const getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }

  const isAdmin = req.user.role === 'admin';
  const stats = await imageService.getImageStats(isAdmin ? undefined : req.user.id);

  res.json({
    success: true,
    data: stats,
  });
});
