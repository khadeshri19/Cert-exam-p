import fs from 'fs';
import path from 'path';
import * as imageRepo from '../repository/image.repository';
import { CreateImageDTO } from '../types/image.types';
import { HttpError } from '../middlewares/error.middleware';

export const uploadImage = async (
    userId: string,
    file: Express.Multer.File
) => {
    const imageData: CreateImageDTO = {
        user_id: userId,
        file_name: file.originalname,
        file_url: file.path.replace(/\\/g, '/'),
        file_type: file.mimetype,
        file_size: file.size,
    };

    return imageRepo.createImage(imageData);
};

export const getAllImages = async () => {
    return imageRepo.getAllImages();
};

export const getImagesByUser = async (userId: string) => {
    return imageRepo.getImagesByUser(userId);
};

export const getImageById = async (
    id: string,
    userId?: string,
    isAdmin: boolean = false
) => {
    const image = await imageRepo.getImageById(id);

    if (!image) {
        throw new HttpError('Image not found', 404);
    }

    // If not admin, verify ownership
    if (!isAdmin && userId && image.user_id !== userId) {
        throw new HttpError('Access denied', 403);
    }

    return image;
};

export const deleteImage = async (
    id: string,
    userId: string,
    isAdmin: boolean = false
) => {
    const image = await imageRepo.getImageById(id);

    if (!image) {
        throw new HttpError('Image not found', 404);
    }

    // If not admin, verify ownership
    if (!isAdmin && image.user_id !== userId) {
        throw new HttpError('Access denied', 403);
    }

    // Delete from database
    const deleted = await imageRepo.deleteImage(id);

    if (!deleted) {
        throw new HttpError('Failed to delete image', 500);
    }

    // Delete file from filesystem
    try {
        const filePath = path.resolve(image.file_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error('Failed to delete file from filesystem:', error);
        // Don't throw error as database record is already deleted
    }

    return { message: 'Image deleted successfully' };
};

export const getImageStats = async (userId?: string) => {
    return imageRepo.getImageStats(userId);
};
