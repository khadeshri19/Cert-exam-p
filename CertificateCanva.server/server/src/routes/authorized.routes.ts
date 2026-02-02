import { Router } from 'express';
import * as authorizedController from '../controllers/authorized.controller';

const router = Router();

// PUBLIC route - Get authorized certificate by ID (no login required)
// GET /api/authorized/:id
router.get('/:id', authorizedController.getAuthorizedCertificate);

export default router;
