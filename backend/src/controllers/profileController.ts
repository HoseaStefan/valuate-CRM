import { Response } from 'express';
import { User } from '../models/users';
import { AuthRequest } from '../middleware/authMiddleware';

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

    const { fullName, phoneNumber, address } = req.body;
    let photoPath = req.body.photoPath; // Might still receive a string if no new photo uploaded

    if (req.file) {
      photoPath = `/uploads/profiles/${req.file.filename}`;
    }

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;
    if (photoPath !== undefined && photoPath !== null) user.photoPath = photoPath;

    await user.save();

    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating self profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getManagerStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized access' });
      return;
    }

    const subordinateCount = await User.count({ where: { managerId: userId } });
    res.json({ isManager: subordinateCount > 0, subordinateCount });
  } catch (error) {
    console.error('Error checking manager status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
