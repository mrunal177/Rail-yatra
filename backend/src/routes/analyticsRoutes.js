import express from 'express';
import { getAdminAnalytics, getPassengerIntelligence } from '../controllers/analyticsController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin', authMiddleware, requireRole(['ADMIN', 'STAFF']), getAdminAnalytics);
router.get('/passenger-intelligence', authMiddleware, getPassengerIntelligence);

export default router;
