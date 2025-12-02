import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  changePasswordValidation,
} from '../validators';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  validate(registerValidation),
  AuthController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  validate(loginValidation),
  AuthController.login
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  validate(refreshTokenValidation),
  AuthController.refreshToken
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post(
  '/logout',
  validate(refreshTokenValidation),
  AuthController.logout
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  AuthController.getCurrentUser
);

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  '/change-password',
  authenticate,
  validate(changePasswordValidation),
  AuthController.changePassword
);

export default router;
