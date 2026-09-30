import express from 'express';
import { createBooking, getUserBookings, getAllBookings, cancelBooking } from '../controllers/bookingController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createBooking);
router.get('/my-bookings', authMiddleware, getUserBookings);
router.get('/all', authMiddleware, requireRole(['ADMIN', 'STAFF']), getAllBookings);
router.post('/:id/cancel', authMiddleware, cancelBooking);

export default router;
