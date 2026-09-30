import express from 'express';
import {
  createComplaint,
  getUserComplaints,
  getAllComplaints,
  updateComplaintStatus
} from '../controllers/complaintController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createComplaint);
router.get('/my-complaints', authMiddleware, getUserComplaints);
router.get('/all', authMiddleware, requireRole(['ADMIN', 'STAFF']), getAllComplaints);
router.patch('/:id/status', authMiddleware, requireRole(['ADMIN', 'STAFF']), updateComplaintStatus);

export default router;
