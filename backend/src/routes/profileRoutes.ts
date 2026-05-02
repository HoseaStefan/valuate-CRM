import { Router } from 'express';
import { updateSelfProfile, getManagerStatus } from '../controllers/profileController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/manager-status', getManagerStatus);
router.put('/', updateSelfProfile);

export default router;
