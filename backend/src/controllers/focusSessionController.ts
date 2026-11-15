import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import FocusSession from '../models/FocusSession.js';

interface AuthRequest extends Request {
  userId?: string;
}

export const getFocusSessions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { date } = req.query;
    const query: any = { userId: req.userId };

    if (date) {
      const startDate = new Date(date as string);
      if (isNaN(startDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format',
        });
        return;
      }
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      query.startTime = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const sessions = await FocusSession.find(query)
      .sort({ startTime: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const createFocusSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    const { sessionType, duration, completed, actualDuration, startTime, notes } =
      req.body;

    const session = await FocusSession.create({
      userId: req.userId,
      sessionType,
      duration,
      actualDuration: actualDuration ?? 0,
      completed: completed ?? false,
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: completed ? new Date() : undefined,
      notes: notes || undefined,
    });

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const endFocusSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    const { id } = req.params;
    const { completed, actualDuration } = req.body;

    const session = await FocusSession.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    session.completed = completed || false;
    session.actualDuration = actualDuration || 0;
    session.endTime = new Date();

    await session.save();

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const getFocusStatistics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { days = 30 } = req.query;
    const daysInt = parseInt(days as string);

    if (isNaN(daysInt) || daysInt < 1) {
      res.status(400).json({
        success: false,
        message: 'Days must be a positive number',
      });
      return;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysInt);

    const sessions = await FocusSession.find({
      userId: req.userId,
      startTime: { $gte: startDate },
    });

    const completedSessions = sessions.filter((s) => s.completed).length;
    const totalSessions = sessions.length;

    const totalFocusMinutes = sessions.reduce(
      (sum, session) => sum + (session.actualDuration || 0),
      0
    );

    const totalPlannedMinutes = sessions.reduce(
      (sum, session) => sum + session.duration,
      0
    );

    const sessionsByType = sessions.reduce(
      (acc: any, session) => {
        acc[session.sessionType] = (acc[session.sessionType] || 0) + 1;
        return acc;
      },
      {}
    );

    res.status(200).json({
      success: true,
      data: {
        totalSessions,
        completedSessions,
        completionRate:
          totalSessions > 0
            ? ((completedSessions / totalSessions) * 100).toFixed(2)
            : 0,
        totalFocusMinutes,
        totalPlannedMinutes,
        averageSessionMinutes:
          totalSessions > 0 ? (totalFocusMinutes / totalSessions).toFixed(2) : 0,
        sessionsByType,
        period: `${daysInt} days`,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const deleteFocusSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const session = await FocusSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
