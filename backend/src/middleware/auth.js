/**
 * RailConnect AI - Authentication & RBAC Middleware
 */

import crypto from 'crypto';
import { getFallbackStore } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'railconnect_jwt_secret_key_2026';

// Lightweight secure HMAC token generator & verifier without external dependency headaches
export function createToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  })).toString('base64url');

  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');

  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Missing or invalid Bearer token.'
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid token. Please log in again.'
    });
  }

  const store = getFallbackStore();
  const user = store.users.find(u => u.user_id === payload.userId);

  if (!user || !user.is_active) {
    return res.status(401).json({
      success: false,
      message: 'User account is inactive or not found.'
    });
  }

  const role = store.roles.find(r => r.role_id === user.role_id) || { role_name: 'PASSENGER' };

  req.user = {
    userId: user.user_id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    roleId: user.role_id,
    roleName: role.role_name
  };

  next();
}

// Optional Auth (for public search that can personalize if token provided)
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) {
      const store = getFallbackStore();
      const user = store.users.find(u => u.user_id === payload.userId);
      if (user) {
        const role = store.roles.find(r => r.role_id === user.role_id) || { role_name: 'PASSENGER' };
        req.user = {
          userId: user.user_id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          roleId: user.role_id,
          roleName: role.role_name
        };
      }
    }
  }
  next();
}

// RBAC Role Gatekeeper
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.roleName)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.roleName}`
      });
    }

    next();
  };
}
