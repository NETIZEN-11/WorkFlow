import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  void _next;
  err.statusCode = err.statusCode || 500;

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const errors = Object.values((err as any).errors)
      .map((val: any) => ({
        field: (val as any).path,
        message: (val as any).message,
      }));
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors,
    });
    return;
  }

  // Handle Mongoose CastError
  if (err.name === 'CastError') {
    const message = `Invalid ${(err as any).kind}: ${(err as any).value}`;
    res.status(400).json({
      success: false,
      message,
    });
    return;
  }

  // Handle duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    res.status(409).json({
      success: false,
      message,
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    res.status(401).json({
      success: false,
      message,
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    res.status(401).json({
      success: false,
      message,
    });
    return;
  }

  // Default error response
  res.status(err.statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
