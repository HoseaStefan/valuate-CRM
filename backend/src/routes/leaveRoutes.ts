import { Router } from 'express';
import {
  requestLeave,
  leaveApproval,
  calendarView,
  editRequestLeave,
  getUserRecentLeaves,
  getUserLeaveHistory,
  getLeaveRequests,
  deleteLeaveRequest,
} from '../controllers/leaveController';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';

const router = Router();

// All leave routes require authentication
router.use(authMiddleware);

// User's recent leave requests (for dashboard activities)
router.get('/recent', getUserRecentLeaves);

// User's leave history (mobile history list)
router.get('/history', getUserLeaveHistory);

// Staff: request leave
router.post('/', requestLeave);

// Manager/Admin: approve or reject a leave request
// Managers are 'staff' role but controller validates manager relationship
router.put('/:id/review', requireRole(['admin', 'staff']), leaveApproval);

// Manager/Admin: list leave requests
router.get('/requests', requireRole(['admin', 'staff']), getLeaveRequests);

router.get('/calendar', calendarView);

// Admin-only: edit leave requests
router.put('/:id', requireRole(['admin']), editRequestLeave);

// User/Admin: delete leave request
router.delete('/:id', deleteLeaveRequest);

export default router;
