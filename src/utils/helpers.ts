import { Response } from 'express';
import { ApiResponse } from '../types';

export class ResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: any
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      ...(meta && { meta }),
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message = 'Created'): Response {
    return this.success(res, data, message, 201);
  }

  static error(
    res: Response,
    message = 'An error occurred',
    statusCode = 500,
    errors?: any[]
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      ...(errors && { errors }),
    };
    return res.status(statusCode).json(response);
  }
}

export const paginate = (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
};

export const getPaginationMeta = (
  page: number,
  limit: number,
  total: number
) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const generateTicketNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TCK-${timestamp}-${random}`;
};

export const sanitizeObject = <T extends Record<string, any>>(
  obj: T,
  keysToRemove: string[] = ['password']
): Partial<T> => {
  const sanitized = { ...obj };
  keysToRemove.forEach((key) => delete sanitized[key]);
  return sanitized;
};
