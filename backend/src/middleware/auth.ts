import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ message: 'Not authorized to access this route' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: 'Authentication is not configured' });
      return;
    }

    try {
      const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }) as { id: string };
      req.userId = decoded.id;
      next();
    } catch (err) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const authorizeUser = (
  req: AuthRequest,
  userId: string | mongoose.Types.ObjectId
): boolean => {
  return req.userId === userId.toString();
};
