import { Request, Response, NextFunction } from 'express';
import * as verificationService from '../services/verification.service';
import { sendSuccess } from '../utils/response';

// Verify certificate by code (PUBLIC - no auth required)
export const verifyCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.params;
        const result = await verificationService.verifyCertificate(code);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
};

// Get verification status for user's canvas
export const getVerificationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { canvasId } = req.params;
        const result = await verificationService.getVerificationStatus(canvasId, userId);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
};
