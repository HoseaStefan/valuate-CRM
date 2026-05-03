import { Request, Response } from 'express';
import { User } from '../models/users';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      email,
      password,
      fullName,
      phoneNumber,
      address,
      photoPath,
      role,
      managerId,
      baseSalary,
    } = req.body;

    if (
      !email ||
      !password ||
      !fullName ||
      !phoneNumber ||
      !address ||
      !role ||
      baseSalary === undefined
    ) {
      res
        .status(400)
        .json({ message: 'Missing required employee creation fields' });
      return;
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists' });
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      fullName,
      phoneNumber,
      address,
      photoPath: photoPath || null,
      role,
      managerId: managerId || null,
      baseSalary,
    });

    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    
    let whereClause: any = {};
    if (search && typeof search === 'string') {
      whereClause = {
        [Op.or]: [
          { fullName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ],
      };
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: [
        'id',
        'email',
        'fullName',
        'phoneNumber',
        'address',
        'photoPath',
        'role',
        'managerId',
        'baseSalary',
        'createdAt',
        'updatedAt',
      ],
      order: [['fullName', 'ASC']],
    });
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id;

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(400).json({ message: 'Invalid user ID format' });
      return;
    }

    const user = await User.findOne({
      where: { id },
      attributes: [
        'id',
        'email',
        'fullName',
        'phoneNumber',
        'address',
        'photoPath',
        'role',
        'managerId',
        'baseSalary',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id;

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(400).json({ message: 'Invalid user ID format' });
      return;
    }

    const {
      email,
      password,
      fullName,
      phoneNumber,
      address,
      photoPath,
      role,
      managerId,
      baseSalary,
    } = req.body;

    const user = await User.findOne({ where: { id } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (email) user.email = email;
    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;
    if (photoPath !== undefined) user.photoPath = photoPath;
    if (role) user.role = role;
    if (managerId !== undefined) user.managerId = managerId;
    if (baseSalary !== undefined) user.baseSalary = baseSalary;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id;

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(400).json({ message: 'Invalid user ID format' });
      return;
    }

    const user = await User.findOne({ where: { id } });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ===== VIEW MANAGEMENT TREE =====

interface UserNode {
  id: string;
  id: string;
  fullName: string;
  email: string;
  role: string;
  photoPath: string | null;
  children: UserNode[];
}

export const getManagementTree = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'fullName', 'role', 'photoPath', 'managerId'],
    });

    // Map DB users to the frontend/mock shape: { id, name, role, managerId, avatar }
    const mapped = users.map((u) => ({
      id: u.id,
      name: u.fullName || u.email,
      role: u.role,
      managerId: u.managerId || null,
      avatar: u.photoPath || null,
    }));

    res.json(mapped);
  } catch (error) {
    console.error('Error getting management tree:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
