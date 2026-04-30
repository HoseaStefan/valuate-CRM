import { Router } from 'express';
import {
  getAttendanceHistory,
  updateAttendance,
  scanQR,
} from '../controllers/attendanceController';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// View history (staff: own, admin: any)
router.get('/history', getAttendanceHistory);

// Scan QR to clock in/out
router.post('/scan', scanQR);

// Admin edits attendance
router.put('/:id', requireRole(['admin']), updateAttendance);

export default router;
