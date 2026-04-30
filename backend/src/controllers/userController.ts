import { Request, Response } from 'express';
import { User } from '../models/users';
import bcrypt from 'bcryptjs';

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
    const users = await User.findAll({
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
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const user = await User.findOne({
      where: { id },
      attributes: [
        'id',
        'email',
        'username',
        'namaLengkap',
        'nomorTelepon',
        'alamat',
        'fotoPath',
        'role',
        'managerId',
        'gajiPokok',
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
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid user ID' });
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
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid user ID' });
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
  id: number;
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

    const userMap = new Map<number, UserNode>();
    const tree: UserNode[] = [];

    // Initialize map
    users.forEach((u) => {
      userMap.set(u.id, {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        photoPath: u.photoPath,
        children: [],
      });
    });

    // Construct hierarchy
    users.forEach((u) => {
      if (u.managerId) {
        const managerNode = userMap.get(u.managerId);
        if (managerNode) {
          managerNode.children.push(userMap.get(u.id)!);
        } else {
          // If manager doesn't exist, place at root level
          tree.push(userMap.get(u.id)!);
        }
      } else {
        // No manager means it's a top level node
        tree.push(userMap.get(u.id)!);
      }
    });

    res.json(tree);
  } catch (error) {
    console.error('Error getting management tree:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
