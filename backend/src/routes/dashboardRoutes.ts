import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Endpoint for Dashboard
router.get('/', authMiddleware, getDashboardData);

export default router;
