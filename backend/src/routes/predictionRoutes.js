/**
 * RailConnect AI - Prediction API Routes
 */

import express from 'express';
import {
  estimateWaitlistProbability,
  getBookingPrediction,
  getModelArchitectureInfo
} from '../controllers/predictionController.js';

const router = express.Router();

// Public prediction estimator for train search / passenger simulation
router.post('/estimate', estimateWaitlistProbability);

// Prediction for an existing booking by bookingId
router.get('/booking/:bookingId', getBookingPrediction);

// Model metadata & ML integration details
router.get('/model-info', getModelArchitectureInfo);

export default router;
