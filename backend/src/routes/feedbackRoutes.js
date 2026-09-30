import express from 'express';
import { submitFeedback, getAllFeedback, getTrainFeedback } from '../controllers/feedbackController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, submitFeedback);
router.get('/all', authMiddleware, requireRole(['ADMIN', 'STAFF']), getAllFeedback);
router.get('/train/:trainId', getTrainFeedback);

export default router;
