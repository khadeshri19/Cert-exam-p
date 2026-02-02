import { Router } from 'express';
import * as verificationController from '../controllers/verification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// PUBLIC route - no auth required
router.get('/:code', verificationController.verifyCertificate);

// Protected route - get verification status for user's own canvas
router.get('/status/:canvasId', authenticate, verificationController.getVerificationStatus);

export default router;
