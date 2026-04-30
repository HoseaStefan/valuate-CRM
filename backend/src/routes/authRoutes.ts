import { Router } from 'express';
import { login, resetPassword, changePassword } from '../controllers/authController';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);

// reset password endpoints require admin role (RBAC)
router.post('/reset-password', authMiddleware, requireRole(['admin']), resetPassword);

// change password for authenticated users
router.post('/change-password', authMiddleware, changePassword);

export default router;
