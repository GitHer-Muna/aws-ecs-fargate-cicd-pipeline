import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ResponseHandler } from '../utils/helpers';
import { LoginRequest, RegisterRequest } from '../types';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: RegisterRequest = req.body;
      const user = await AuthService.register(data);

      ResponseHandler.created(
        res,
        user,
        'User registered successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: LoginRequest = req.body;
      const tokens = await AuthService.login(data);

      ResponseHandler.success(
        res,
        tokens,
        'Login successful'
      );
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);

      ResponseHandler.success(
        res,
        tokens,
        'Token refreshed successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);

      ResponseHandler.success(
        res,
        null,
        'Logged out successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser(req.user!.id);

      ResponseHandler.success(
        res,
        user,
        'User fetched successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(
        req.user!.id,
        currentPassword,
        newPassword
      );

      ResponseHandler.success(
        res,
        null,
        'Password changed successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}
