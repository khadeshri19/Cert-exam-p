import { Router } from 'express';
import * as controller from '../controllers/images.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../config/multer';

const router = Router();

// All image routes require authentication
router.use(authenticate);

// Image routes (per strict spec)
// POST /api/images - Upload image
router.post('/', upload.single('image'), controller.upload);

// GET /api/images - Get all images
router.get('/', controller.getAll);

// GET /api/images/:id - Get single image
router.get('/:id', controller.getOne);

// DELETE /api/images/:id - Delete image
router.delete('/:id', controller.remove);

export default router;

