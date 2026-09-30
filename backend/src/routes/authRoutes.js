import express from 'express';
import {
  login,
  register,
  getProfile,
  logout,
  verifySession,
  getRoles,
  getAllUsers
} from '../controllers/authController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public auth endpoints
router.post('/login', login);
router.post('/register', register);
router.get('/roles', getRoles);

// Protected routes (Session validated via authMiddleware)
router.get('/verify', authMiddleware, verifySession);
router.get('/profile', authMiddleware, getProfile);
router.post('/logout', authMiddleware, logout);

// Protected RBAC Admin route: User & Role Oversight
router.get('/users', authMiddleware, requireRole(['ADMIN']), getAllUsers);

export default router;
