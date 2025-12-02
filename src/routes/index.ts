import { Router } from 'express';
import { Request, Response } from 'express';
import { ResponseHandler } from '../utils/helpers';
import authRoutes from './auth.routes';
import ticketRoutes from './ticket.routes';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (_req: Request, res: Response) => {
  ResponseHandler.success(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  }, 'Service is healthy');
});

/**
 * @route   GET /api/v1
 * @desc    API info endpoint
 * @access  Public
 */
router.get('/', (_req: Request, res: Response) => {
  ResponseHandler.success(res, {
    name: 'CloudCare Ticketing API',
    version: '1.0.0',
    description: 'Enterprise-grade customer support ticketing microservice',
    endpoints: {
      auth: '/api/v1/auth',
      tickets: '/api/v1/tickets',
      health: '/api/v1/health',
      metrics: '/metrics',
    },
  }, 'Welcome to CloudCare API');
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);

export default router;
