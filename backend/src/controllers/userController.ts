import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import bcrypt from 'bcryptjs';

const userRepository = AppDataSource.getRepository(User);

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      email, password, fullName, phoneNumber, 
      address, photoPath, role, managerId, baseSalary 
    } = req.body;

    if (!email || !password || !fullName || !phoneNumber || !address || !role || baseSalary === undefined) {
      res.status(400).json({ message: 'Missing required employee creation fields' });
      return;
    }

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists' });
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = userRepository.create({
      email,
      password: hashedPassword,
      fullName,
      phoneNumber,
      address,
      photoPath: photoPath || null,
      role: role as UserRole,
      managerId: managerId || null,
      baseSalary
    });

    await userRepository.save(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userRepository.find({
      select: ['id', 'email', 'fullName', 'phoneNumber', 'address', 'photoPath', 'role', 'managerId', 'baseSalary', 'createdAt', 'updatedAt']
    });
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const user = await userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'fullName', 'phoneNumber', 'address', 'photoPath', 'role', 'managerId', 'baseSalary', 'createdAt', 'updatedAt']
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

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const { 
      email, password, fullName, phoneNumber, 
      address, photoPath, role, managerId, baseSalary 
    } = req.body;

    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (email) user.email = email;
    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;
    if (photoPath !== undefined) user.photoPath = photoPath;
    if (role) user.role = role as UserRole;
    if (managerId !== undefined) user.managerId = managerId;
    if (baseSalary !== undefined) user.baseSalary = baseSalary;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await userRepository.save(user);

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await userRepository.remove(user);
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

export const getManagementTree = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userRepository.find({
      select: ['id', 'email', 'fullName', 'role', 'photoPath', 'managerId']
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
        children: []
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
