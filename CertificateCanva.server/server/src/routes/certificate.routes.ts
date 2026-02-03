import { Router } from 'express';
import * as canvasController from '../controllers/canvas.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

// POST /api/certificate/authorize/:canvasId (ADMIN ONLY)
router.post('/authorize/:canvasId', authenticate, requireAdmin, canvasController.authorizeCertificate);

// GET /api/certificate/verify/:certificateId (PUBLIC)
router.get('/verify/:certificateId', canvasController.verifyCertificate);

export default router;
