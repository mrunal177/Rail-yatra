/**
 * RailConnect AI - Server Entry Point
 * Express API + Vite Middleware Integration
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { initDatabase } from './backend/src/config/db.js';
import { errorHandler } from './backend/src/middleware/errorHandler.js';

// Import Routes
import authRoutes from './backend/src/routes/authRoutes.js';
import trainRoutes from './backend/src/routes/trainRoutes.js';
import bookingRoutes from './backend/src/routes/bookingRoutes.js';
import paymentRoutes from './backend/src/routes/paymentRoutes.js';
import complaintRoutes from './backend/src/routes/complaintRoutes.js';
import feedbackRoutes from './backend/src/routes/feedbackRoutes.js';
import analyticsRoutes from './backend/src/routes/analyticsRoutes.js';
import predictionRoutes from './backend/src/routes/predictionRoutes.js';
import dbmsRoutes from './backend/src/routes/dbmsRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize Relational Database Pool / Store
  await initDatabase();

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/trains', trainRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/predictions', predictionRoutes);
  app.use('/api/dbms', dbmsRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'RailConnect AI',
      timestamp: new Date().toISOString()
    });
  });

  // Vite Integration (Dev mode middlewares or Static build in production)
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  // Error Handler
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚆 RailConnect AI Platform running on http://0.0.0.0:${PORT}`);
    console.log(`🤖 ML Booking Waitlist Predictor: http://0.0.0.0:${PORT}/api/predictions/estimate`);
    console.log(`📊 DBMS Explorer: http://0.0.0.0:${PORT}/api/dbms/overview`);
  });
}

startServer().catch(err => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
