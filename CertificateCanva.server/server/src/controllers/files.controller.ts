import { Request, Response, NextFunction } from 'express';
import * as filesService from '../services/files.service';
import { sendSuccess, sendError } from '../utils/response';

// Upload file
export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const file = req.file;
        const { canvasSessionId } = req.body;

        if (!file) {
            return sendError(res, 'No file uploaded', 400);
        }

        const uploadedFile = await filesService.uploadFile(userId, file, canvasSessionId);
        sendSuccess(res, uploadedFile, 'File uploaded successfully', 201);
    } catch (error) {
        next(error);
    }
};

// Get user's files
export const getFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { canvasSessionId } = req.query;

        const files = await filesService.getUserFiles(userId, canvasSessionId as string);
        sendSuccess(res, files);
    } catch (error) {
        next(error);
    }
};

// Get single file
export const getFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;

        const file = await filesService.getFile(id, userId);
        sendSuccess(res, file);
    } catch (error) {
        next(error);
    }
};

// Delete file
export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;

        const result = await filesService.deleteFile(id, userId);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
};

// Associate file with canvas
export const associateWithCanvas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;
        const { canvasSessionId } = req.body;

        if (!canvasSessionId) {
            return sendError(res, 'Canvas session ID is required', 400);
        }

        const file = await filesService.associateFileWithCanvas(id, canvasSessionId, userId);
        sendSuccess(res, file, 'File associated with canvas');
    } catch (error) {
        next(error);
    }
};

// Get file stats
export const getFileStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const stats = await filesService.getFileStats(userId);
        sendSuccess(res, stats);
    } catch (error) {
        next(error);
    }
};
