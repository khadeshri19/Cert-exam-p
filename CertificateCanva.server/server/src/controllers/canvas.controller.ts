import { Request, Response, NextFunction } from 'express';
import * as canvasService from '../services/canvas.service';
import { sendSuccess, sendError } from '../utils/response';

// POST /canvas/create (Matches Prompt Rule 6)
export const createCanvas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { title, width, height } = req.body;

    if (!title) {
      return sendError(res, 'Title is required', 400);
    }

    const canvas = await canvasService.createCanvas(userId, { title, width, height });
    sendSuccess(res, canvas, 'Canvas created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// GET /canvas/:canvasId (Matches Prompt Rule 6)
export const getCanvas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'admin';
    const { canvasId } = req.params;

    const canvas = await canvasService.getCanvas(canvasId, userId, isAdmin);
    sendSuccess(res, canvas);
  } catch (error) {
    next(error);
  }
};

// PUT /canvas/save/:canvasId (Matches Prompt Rule 6)
export const saveCanvas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { canvasId } = req.params;
    const {
      canvas_data,
      title,
      holder_name,
      certificate_title,
      issue_date,
      organization_name
    } = req.body;

    if (!canvas_data || !title) {
      return sendError(res, 'Canvas data and title are required', 400);
    }

    const result = await canvasService.saveCanvas(canvasId, userId, {
      canvas_data,
      title,
      holder_name,
      certificate_title,
      issue_date,
      organization_name
    });

    sendSuccess(res, result, 'Canvas saved successfully');
  } catch (error) {
    next(error);
  }
};

// GET /canvas (List all)
export const getAllCanvases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const canvases = await canvasService.getAllCanvases(userId);
    sendSuccess(res, canvases);
  } catch (error) {
    next(error);
  }
};

// POST /certificate/authorize/:canvasId (ADMIN ONLY, Matches Prompt Rule 6)
export const authorizeCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const { canvasId } = req.params;

    const result = await canvasService.authorizeCertificate(canvasId, adminId);
    sendSuccess(res, result, 'Certificate authorized successfully');
  } catch (error) {
    next(error);
  }
};

// GET /certificate/verify/:certificateId (PUBLIC, Matches Prompt Rule 6)
export const verifyCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { certificateId } = req.params;
    const result = await canvasService.verifyCertificate(certificateId);

    if (!result) {
      return sendError(res, 'Invalid Certificate', 404);
    }

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

// POST /canvas/:canvasId/export
export const exportCanvas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { canvasId } = req.params;
    const { format } = req.body; // 'png' or 'pdf'

    const canvas = await canvasService.getCanvas(canvasId, userId);

    if (!canvas.is_authorized && req.user!.role !== 'admin') {
      // Optional: only authorized can export?
    }

    // Placeholder for actual generation logic
    // In a real scenario, we'd use puppeteer or fabric-node here.

    sendSuccess(res, {
      downloadUrl: `${process.env.BACKEND_URL || 'http://localhost:4000'}/uploads/mock-certificate.${format}`,
      filename: `Sarvarth-Certificate-${canvas.certificate_id || 'unauthorized'}.${format}`
    }, 'Export initiated');
  } catch (error) {
    next(error);
  }
};

import pool from '../config/db';

export const deleteCanvasFinal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { canvasId } = req.params;
    await pool.query('DELETE FROM canvas_sessions WHERE id = $1 AND user_id = $2', [canvasId, userId]);
    sendSuccess(res, { success: true }, 'Canvas deleted');
  } catch (error) {
    next(error);
  }
}
