import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { AuthRequest } from '../middleware/authMiddleware';

const userRepository = AppDataSource.getRepository(User);

export const updateSelfProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized access' });
      return;
    }

    const { phoneNumber, address, photoPath } = req.body;

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;
    if (photoPath !== undefined) user.photoPath = photoPath;

    await userRepository.save(user);

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating self profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
