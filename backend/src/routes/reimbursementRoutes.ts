import { Router } from 'express';
import { createReimbursement, updateReimbursementApproval, getReimbursementRequests } from '../controllers/reimbursementController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// Mobile Staff requesting reimbursement
router.post('/', createReimbursement);

// Web/Mobile Admin & Managers evaluating the submission
router.put('/:id/review', updateReimbursementApproval);

// Web/Mobile fetching all requests for dashboard review (Managers/Admins only)
router.get('/requests', getReimbursementRequests);

export default router;
