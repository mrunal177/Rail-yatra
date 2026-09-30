import express from 'express';
import { getUserPayments, getAllPayments } from '../controllers/paymentController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-payments', authMiddleware, getUserPayments);
router.get('/all', authMiddleware, requireRole(['ADMIN']), getAllPayments);

export default router;
