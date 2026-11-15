import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.js';
import Task from '../models/Task.js';
import Meeting from '../models/Meeting.js';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import FocusSession from '../models/FocusSession.js';
import Note from '../models/Note.js';
import Alarm from '../models/Alarm.js';
import CalculatorHistory from '../models/CalculatorHistory.js';
import { createHash, randomBytes } from 'crypto';
import nodemailer from 'nodemailer';

interface AuthRequest extends Request {
  userId?: string;
}

const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  const token = jwt.sign(
    { id: user._id },
    secret,
    {
      expiresIn: (process.env.JWT_EXPIRE || '7d') as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
    }
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      timezone: user.timezone,
      theme: user.theme,
      notificationsEnabled: user.notificationsEnabled,
      createdAt: user.createdAt,
    },
  });
};

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ success: false, message: 'Email already in use' });
      return;
    }

    // Create user
    user = await User.create({
      email,
      password,
      firstName,
      lastName,
    });

    sendTokenResponse(user, 201, res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
      return;
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    res.status(503).json({
      success: false,
      message: 'Password reset email is not configured',
    });
    return;
  }

  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const code = randomBytes(32).toString('hex');
      user.passwordResetToken = createHash('sha256').update(code).digest('hex');
      user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      const port = Number(process.env.SMTP_PORT) || 587;
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });

      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || SMTP_USER,
          to: user.email,
          subject: 'DailyFlow password reset',
          text: `Use this one-time code to reset your DailyFlow password: ${code}\n\nThe code expires in 10 minutes.`,
        });
      } catch {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        res.status(502).json({
          success: false,
          message: 'Unable to send password reset email',
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      message: 'If that account exists, a reset code has been sent',
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Unable to process password reset request',
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    const tokenHash = createHash('sha256').update(req.body.code).digest('hex');
    const user = await User.findOne({
      email: req.body.email,
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password');

    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
      return;
    }

    user.password = req.body.newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Unable to reset password',
    });
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        timezone: user.timezone,
        theme: user.theme,
        notificationsEnabled: user.notificationsEnabled,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    const { firstName, lastName, email, timezone, theme, notificationsEnabled } =
      req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;
    if (timezone !== undefined) user.timezone = timezone;
    if (theme !== undefined) user.theme = theme;
    if (notificationsEnabled !== undefined) {
      user.notificationsEnabled = notificationsEnabled;
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        timezone: user.timezone,
        theme: user.theme,
        notificationsEnabled: user.notificationsEnabled,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ success: false, message: 'Email already in use' });
      return;
    }
    if (error.name === 'ValidationError') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
      return;
    }

    const user = await User.findById(req.userId).select('+password');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
      return;
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const deleteAccount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    await Promise.all([
      Task.deleteMany({ userId: req.userId }),
      Meeting.deleteMany({ userId: req.userId }),
      Habit.deleteMany({ userId: req.userId }),
      HabitLog.deleteMany({ userId: req.userId }),
      FocusSession.deleteMany({ userId: req.userId }),
      Note.deleteMany({ userId: req.userId }),
      Alarm.deleteMany({ userId: req.userId }),
      CalculatorHistory.deleteMany({ userId: req.userId }),
    ]);
    await User.deleteOne({ _id: req.userId });

    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
