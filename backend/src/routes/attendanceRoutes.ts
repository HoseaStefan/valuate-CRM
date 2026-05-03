import { Router } from 'express';
import {
  getAttendanceHistory,
  updateAttendance,
  scanQR,
  generateQR,
  getTodayAttendanceStatus,
  getAllAttendance
} from '../controllers/attendanceController';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// View history (staff: own, admin: any)
router.get('/history', getAttendanceHistory);

// Check today's attendance status
router.get('/today-status', getTodayAttendanceStatus);

// Generate QR code for attendance
router.get('/generate-qr', requireRole(['admin']), generateQR);

// Scan QR to clock in/out
router.post('/scan', scanQR);

// Admin edits attendance
router.put('/:id', requireRole(['admin']), updateAttendance);

// Admin get all attendance records
router.get('/', requireRole(['admin']), getAllAttendance);

export default router;
