import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import prisma from '../database/client';
import config from '../config';
import {
  UnauthorizedError,
  ConflictError,
  BadRequestError,
} from '../utils/errors';
import { UserPayload, TokenResponse, LoginRequest, RegisterRequest } from '../types';
import logger from '../utils/logger';

export class AuthService {
  static async register(data: RegisterRequest): Promise<Omit<User, 'password'>> {
    const { email, password, firstName, lastName } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'USER',
      },
    });

    logger.info(`New user registered: ${email}`);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async login(data: LoginRequest): Promise<TokenResponse> {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    logger.info(`User logged in: ${email}`);

    return tokens;
  }

  static async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      // Verify refresh token
      jwt.verify(
        refreshToken,
        config.jwt.refreshSecret
      ) as UserPayload;

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      if (storedToken.expiresAt < new Date()) {
        await prisma.refreshToken.delete({
          where: { token: refreshToken },
        });
        throw new UnauthorizedError('Refresh token expired');
      }

      // Delete old refresh token
      await prisma.refreshToken.delete({
        where: { token: refreshToken },
      });

      // Generate new tokens
      const tokens = await this.generateTokens(storedToken.user);

      logger.info(`Token refreshed for user: ${storedToken.user.email}`);

      return tokens;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw error;
    }
  }

  static async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    logger.info('User logged out');
  }

  static async generateTokens(user: User): Promise<TokenResponse> {
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // Generate access token
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);

    // Generate refresh token
    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as jwt.SignOptions);

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.expiresIn,
      tokenType: 'Bearer',
    };
  }

  static async verifyToken(token: string): Promise<UserPayload> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as UserPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }
      throw new UnauthorizedError('Invalid token');
    }
  }

  static async getCurrentUser(userId: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestError('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    logger.info(`Password changed for user: ${user.email}`);
  }
}
