import { Router } from 'express';
import { 
  createUser, 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  getManagementTree
} from '../controllers/userController';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// ONLY Admins can perform these CRUD logic
router.use(requireRole(['admin']));

router.post('/', createUser);
router.get('/', getUsers);
router.get('/tree', getManagementTree);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
