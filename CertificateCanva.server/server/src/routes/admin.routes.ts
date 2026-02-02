import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// User management
router.post('/users', adminController.createUser);
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Canvas sessions (view only - admins cannot design)
router.get('/canvas-sessions', adminController.getAllCanvasSessions);
router.get('/canvas-sessions/active', adminController.getActiveCanvasSessions);

// Activity logs
router.get('/activity-logs', adminController.getCanvasActivityLogs);

// Certificates
router.get('/certificates', adminController.getAllCertificates);

// Verification links
router.get('/verification-links', adminController.getAllVerificationLinks);

// Uploaded files
router.get('/files', adminController.getAllUploadedFiles);

export default router;
