import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';
import { sendSuccess, sendError } from '../utils/response';

// Create user
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, username, email, password, role_id } = req.body;

    if (!name || !username || !email || !password) {
      return sendError(res, 'Name, username, email and password are required', 400);
    }

    const user = await adminService.createUser({
      name,
      username,
      email,
      password,
      role_id: role_id || 2, // Default to user role
    });
    sendSuccess(res, user, 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await adminService.getAllUsers();
    sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await adminService.getUserById(id);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

// Update user
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, username, email, password, role_id, is_active } = req.body;

    const user = await adminService.updateUser(id, {
      name,
      username,
      email,
      password,
      role_id,
      is_active,
    });
    sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    const result = await adminService.deleteUser(id, adminId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

// Get all canvas sessions (admin view only)
export const getAllCanvasSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await adminService.getAllCanvasSessions();
    sendSuccess(res, sessions);
  } catch (error) {
    next(error);
  }
};

// Get active canvas sessions (real-time tracking)
export const getActiveCanvasSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await adminService.getActiveCanvasSessions();
    sendSuccess(res, sessions);
  } catch (error) {
    next(error);
  }
};

// Get canvas activity logs
export const getCanvasActivityLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { canvasSessionId } = req.query;
    const logs = await adminService.getCanvasActivityLogs(canvasSessionId as string);
    sendSuccess(res, logs);
  } catch (error) {
    next(error);
  }
};

// Get all certificates
export const getAllCertificates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const certificates = await adminService.getAllCertificates();
    sendSuccess(res, certificates);
  } catch (error) {
    next(error);
  }
};

// Get all verification links
export const getAllVerificationLinks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const links = await adminService.getAllVerificationLinks();
    sendSuccess(res, links);
  } catch (error) {
    next(error);
  }
};

// Get all uploaded files
export const getAllUploadedFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = await adminService.getAllUploadedFiles();
    sendSuccess(res, files);
  } catch (error) {
    next(error);
  }
};
