import { User } from '../models/users';

/**
 * Returns true if the user has role 'staff'.
 */
export const isStaff = async (userId: number): Promise<boolean> => {
  const user = await User.findOne({ where: { id: userId } });
  if (!user) return false;
  return user.role === 'staff';
};

/**
 * Returns true if the user manages at least one staff (i.e., any user has managerId === userId).
 */
export const isManager = async (userId: number): Promise<boolean> => {
  const count = await User.count({ where: { managerId: userId } });
  return count > 0;
};
