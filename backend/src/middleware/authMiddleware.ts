import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

import { User } from '../models/users';

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'super-secret-key';

    const decoded = jwt.verify(token, secret) as any;
    
    // Fetch user to get fullName for file uploads and other needs
    const user = await User.findByPk(decoded.id);
    req.user = {
      ...decoded,
      fullName: user?.fullName || 'UnknownUser',
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Unauthorized: Token has expired' });
    } else {
      res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
  }
};

// RBAC Middleware to restrict access based on roles
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        message:
          'Forbidden: You do not have permission to access this resource',
      });
      return;
    }
    next();
  };
};
