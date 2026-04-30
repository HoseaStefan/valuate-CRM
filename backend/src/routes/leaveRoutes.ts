import { Router } from 'express';
import {
  requestLeave,
  leaveApproval,
  calendarView,
  editRequestLeave,
} from '../controllers/leaveController';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';

const router = Router();

// All leave routes require authentication
router.use(authMiddleware);

// Staff: request leave
router.post('/', requestLeave);

// Manager/Admin: approve or reject a leave request
// Managers are 'staff' role but controller validates manager relationship
router.put('/:id/review', requireRole(['admin', 'staff']), leaveApproval);

// Calendar view: returns leaves for month; authenticated users can request
router.get('/calendar', calendarView);

// Admin-only: edit leave requests
router.put('/:id', requireRole(['admin']), editRequestLeave);

export default router;
