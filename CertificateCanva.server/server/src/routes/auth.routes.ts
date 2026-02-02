import { Router } from 'express';
import * as controller from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/login', controller.login);
router.post('/refresh', controller.refresh);

// Protected routes
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.getCurrentUser);
router.get('/users/:id', authenticate, controller.getUser);

export default router;
