import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ResponseHandler } from '../utils/helpers';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    
    return ResponseHandler.error(
      res,
      err.message,
      err.statusCode
    );
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    logger.error(`Database error: ${err.message}`);
    return ResponseHandler.error(
      res,
      'Database operation failed',
      400
    );
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    logger.error(`Validation error: ${err.message}`);
    return ResponseHandler.error(
      res,
      err.message,
      422
    );
  }

  // Log unexpected errors
  logger.error(`Unexpected error: ${err.stack}`);

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  return ResponseHandler.error(res, message, 500);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  return ResponseHandler.error(
    res,
    `Route ${req.originalUrl} not found`,
    404
  );
};
