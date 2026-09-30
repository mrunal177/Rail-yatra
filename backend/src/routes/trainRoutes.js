import express from 'express';
import {
  getStations,
  searchTrains,
  getTrainById,
  getSeatAvailability,
  getTrainRoute,
  getLiveTrainStatus,
  updateTrainStatusByStaff,
  getAlternativeSuggestions
} from '../controllers/trainController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Train Search & Stations
router.get('/stations', getStations);
router.get('/search', searchTrains);
router.get('/alternatives', getAlternativeSuggestions);

// Live Train Running Status (e.g. /live/22436, /live/12951)
router.get('/live/:query', getLiveTrainStatus);

// Train Details, Stoppage Route & Seat Availability
router.get('/:id', getTrainById);
router.get('/:id/availability', getSeatAvailability);
router.get('/:id/route', getTrainRoute);

// Staff / Admin Protected Route: Update Live Train Status & Delays
router.patch('/:id/status', authMiddleware, requireRole(['ADMIN', 'STAFF']), updateTrainStatusByStaff);

export default router;
