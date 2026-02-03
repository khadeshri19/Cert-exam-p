import { Router } from 'express';
import * as canvasController from '../controllers/canvas.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All canvas routes require authentication
router.use(authenticate);

// POST /api/canvas/create
router.post('/create', canvasController.createCanvas);

// PUT /api/canvas/save/:canvasId
router.put('/save/:canvasId', canvasController.saveCanvas);

// GET /api/canvas/:canvasId
router.get('/:canvasId', canvasController.getCanvas);

// GET /api/canvas (all for user)
router.get('/', canvasController.getAllCanvases);

// DELETE /api/canvas/:canvasId
router.delete('/:canvasId', canvasController.deleteCanvasFinal);

// POST /api/canvas/:canvasId/export
router.post('/:canvasId/export', canvasController.exportCanvas);

export default router;
