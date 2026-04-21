import { Router } from 'express';
import { addManualAdjustment, calculateMonthlyPayroll, getSalarySlip, updatePayrollStatus } from '../controllers/payrollController';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Staff authentication enforced
router.use(authMiddleware);

// Admin exclusive actions restricting external modification vectors
router.post('/adjustments', requireRole(['admin']), addManualAdjustment);
router.post('/calculate', requireRole(['admin']), calculateMonthlyPayroll);

// Admin exclusive endpoint to finalize real-world money transfers
router.put('/:id/status', requireRole(['admin']), updatePayrollStatus);

// All valid staff can pull their distinct records isolating access
router.get('/slip/:month/:year', getSalarySlip);

export default router;
