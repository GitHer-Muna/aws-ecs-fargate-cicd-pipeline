import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import logger from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  headers: any;
  body: any;
  query: any;
  params: any;
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = await AuthService.verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(
        `Authorization failed: User ${req.user.email} attempted to access resource requiring roles: ${roles.join(', ')}`
      );
      return next(
        new ForbiddenError('You do not have permission to access this resource')
      );
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = await AuthService.verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};
