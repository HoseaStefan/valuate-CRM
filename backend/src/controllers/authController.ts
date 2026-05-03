import { Request, Response } from 'express';
import { User } from '../models/users';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Find user by email (used as username here)
    const user = await User.findOne({ where: { email: username } });
    
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username } = req.body as any;

        if (!username) {
            res.status(400).json({ message: 'username (email) is required' });
            return;
        }

        const user = await User.findOne({ where: { email: username } });
        if (!user) {
            // Do not reveal whether user exists; respond generically
            res.status(200).json({ message: 'If the email exists, the password has been reset' });
            return;
        }

        const defaultPassword = process.env.DEFAULT_RESET_PASSWORD || 'pass123';
        const hashed = await bcrypt.hash(defaultPassword, 10);
        user.password = hashed;
        await user.save();

        res.status(200).json({ message: 'Password has been reset to default' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Allow authenticated users to change their own password
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { currentPassword, newPassword } = req.body as any;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ message: 'currentPassword and newPassword are required' });
            return;
        }

        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            res.status(400).json({ message: 'Current password is incorrect' });
            return;
        }

        if (typeof newPassword !== 'string' || newPassword.length < 6) {
          res.status(400).json({ message: 'New password must be at least 6 characters' });
            return;
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};