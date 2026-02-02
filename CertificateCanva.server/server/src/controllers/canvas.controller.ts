import { Request, Response, NextFunction } from 'express';
import * as canvasService from '../services/canvas.service';
import { sendSuccess, sendError } from '../utils/response';

// Create canvas session
export const createCanvas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { title, width, height } = req.body;

    if (!title) {
      return sendError(res, 'Title is required', 400);
    }

    const canvas = await canvasService.createCanvasSession(userId, { title, width, height });
    sendSuccess(res, canvas, 'Canvas session created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// Get all user's canvas sessions
export const getAllCanvases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const canvases = await canvasService.getUserCanvasSessions(userId);
    sendSuccess(res, canvases);
  } catch (error) {
    next(error);
  }
};

// Get single canvas session
export const getCanvas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const canvas = await canvasService.getCanvasWithFiles(id, userId);
    sendSuccess(res, canvas);
  } catch (error) {
    next(error);
  }
};

// Update canvas data (auto-save, no verification link)
export const updateCanvas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { canvas_data, title, background_color, background_image } = req.body;

    const canvas = await canvasService.updateCanvasData(id, userId, {
      canvas_data,
      title,
      background_color,
      background_image,
    });
    sendSuccess(res, canvas, 'Canvas updated');
  } catch (error) {
    next(error);
  }
};

// SAVE canvas - generates verification link
export const saveCanvas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { canvas_data, title, author_name } = req.body;

    if (!canvas_data || !title || !author_name) {
      return sendError(res, 'Canvas data, title, and author name are required', 400);
    }

    const result = await canvasService.saveCanvas(id, userId, {
      canvas_data,
      title,
      author_name,
    });
    sendSuccess(res, result, 'Canvas saved and verification link generated');
  } catch (error) {
    next(error);
  }
};

// Check if canvas can be exported
export const checkExport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await canvasService.canExportCanvas(id, userId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

// Log export action
export const logExport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { format } = req.body;

    // First check if can export
    await canvasService.canExportCanvas(id, userId);

    // Log the export
    await canvasService.logExport(id, userId, format || 'png');
    sendSuccess(res, { success: true }, 'Export logged');
  } catch (error) {
    next(error);
  }
};

// Delete canvas session
export const deleteCanvas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await canvasService.deleteCanvasSession(id, userId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

// Update activity (heartbeat)
export const updateActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await canvasService.updateActivity(id, userId);
    sendSuccess(res, { success: true });
  } catch (error) {
    next(error);
  }
};

// End session
export const endSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await canvasService.endSession(id, userId);
    sendSuccess(res, { success: true }, 'Session ended');
  } catch (error) {
    next(error);
  }
};
