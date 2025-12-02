import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ResponseHandler } from '../utils/helpers';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err: any) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return ResponseHandler.error(
      res,
      'Validation failed',
      422,
      extractedErrors
    );
  };
};
