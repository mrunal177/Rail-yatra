import express from 'express';
import { getDbmsOverview, getTableData, executeQuery } from '../controllers/dbmsController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// DBMS Explorer - Accessible for project presentation & viva
router.get('/overview', getDbmsOverview);
router.get('/table/:tableName', getTableData);
router.post('/query', executeQuery);

export default router;
