import { Router } from 'express';
import * as filesController from '../controllers/files.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../config/multer';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload file
router.post('/', upload.single('file'), filesController.uploadFile);

// Get user's files
router.get('/', filesController.getFiles);

// Get file stats
router.get('/stats', filesController.getFileStats);

// Get single file
router.get('/:id', filesController.getFile);

// Delete file
router.delete('/:id', filesController.deleteFile);

// Associate file with canvas
router.patch('/:id/canvas', filesController.associateWithCanvas);

export default router;
