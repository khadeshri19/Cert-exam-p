import { Router } from 'express';
import * as canvasController from '../controllers/canvas.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireUser } from '../middlewares/role.middleware';

const router = Router();

// All routes require authentication and user role (admins cannot design)
router.use(authenticate);
router.use(requireUser);

// Canvas session routes
router.post('/session', canvasController.createCanvas);
router.get('/session', canvasController.getAllCanvases);
router.get('/session/:id', canvasController.getCanvas);
router.patch('/session/:id', canvasController.updateCanvas);
router.delete('/session/:id', canvasController.deleteCanvas);

// Save canvas - generates verification link
router.post('/session/:id/save', canvasController.saveCanvas);

// Export check and logging
router.get('/session/:id/export', canvasController.checkExport);
router.post('/session/:id/export', canvasController.logExport);

// Activity tracking
router.post('/session/:id/activity', canvasController.updateActivity);
router.post('/session/:id/end', canvasController.endSession);

export default router;
