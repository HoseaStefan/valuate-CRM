import { Router } from 'express';
import {
  addManualAdjustment,
  calculateMonthlyPayroll,
  getSalarySlip,
  updatePayrollStatus,
} from '../controllers/payrollController';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// Admin exclusive actions
router.post('/adjustments', requireRole(['admin']), addManualAdjustment);
router.post('/calculate', requireRole(['admin']), calculateMonthlyPayroll);

// Admin exclusive endpoint
router.put('/:id/status', requireRole(['admin']), updatePayrollStatus);

router.get('/slip/:month/:year', getSalarySlip);

export default router;
