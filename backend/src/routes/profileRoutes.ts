import { Router } from 'express';
import { updateSelfProfile } from '../controllers/profileController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.put('/', updateSelfProfile);

export default router;
