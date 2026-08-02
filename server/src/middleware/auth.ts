import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../entities/users/user-role.enum';

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded.sub) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email || '',
      role: decoded.role || UserRole.STUDENT,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
};
