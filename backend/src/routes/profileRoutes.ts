import { Router } from 'express';
import { updateSelfProfile, getManagerStatus } from '../controllers/profileController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

import { uploadProfile } from '../utils/uploadImageMiddleware';

router.get('/manager-status', getManagerStatus);
router.put('/', uploadProfile.single('photo'), updateSelfProfile);

export default router;
