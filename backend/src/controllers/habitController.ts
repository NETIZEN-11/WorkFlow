import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';

interface AuthRequest extends Request {
  userId?: string;
}

export const getHabits = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const habits = await Habit.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .lean();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateKey = (date: Date) =>
      `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const todayKey = dateKey(today);
    const logs = await HabitLog.find({
      userId: req.userId,
      habitId: { $in: habits.map((habit) => habit._id) },
      date: { $gte: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000) },
    })
      .sort({ date: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: habits.map((habit) => {
        const habitLogs = logs.filter(
          (log) => log.habitId.toString() === habit._id.toString()
        );
        const completedDates = new Set(
          habitLogs
            .filter((log) => log.completed)
            .map((log) => dateKey(new Date(log.date)))
        );
        let streak = 0;
        const streakDate = new Date(today);
        if (!completedDates.has(todayKey)) {
          streakDate.setDate(streakDate.getDate() - 1);
        }

        while (completedDates.has(dateKey(streakDate))) {
          streak++;
          streakDate.setDate(streakDate.getDate() - 1);
        }

        return {
          ...habit,
          title: habit.name,
          completed_today: completedDates.has(todayKey),
          streak,
        };
      }),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const getHabit = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!habit) {
      res.status(404).json({ success: false, message: 'Habit not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: habit,
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'Invalid habit ID' });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const createHabit = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    const { name, description, frequency, reminderTime, color } = req.body;

    const habit = await Habit.create({
      userId: req.userId,
      name,
      description: description || undefined,
      frequency: frequency || 'daily',
      reminderTime: reminderTime || undefined,
      color: color || '#3B82F6',
    });

    res.status(201).json({
      success: true,
      data: habit,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map((e: any) => e.message)
        .join(', ');
      res.status(400).json({ success: false, message: messages });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const updateHabit = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    let habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!habit) {
      res.status(404).json({ success: false, message: 'Habit not found' });
      return;
    }

    const { name, description, frequency, reminderTime, color, active } =
      req.body;

    if (name !== undefined) habit.name = name;
    if (description !== undefined) habit.description = description;
    if (frequency !== undefined) habit.frequency = frequency;
    if (reminderTime !== undefined) habit.reminderTime = reminderTime;
    if (color !== undefined) habit.color = color;
    if (active !== undefined) habit.active = active;

    habit = await habit.save();

    res.status(200).json({
      success: true,
      data: habit,
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'Invalid habit ID' });
      return;
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map((e: any) => e.message)
        .join(', ');
      res.status(400).json({ success: false, message: messages });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const deleteHabit = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!habit) {
      res.status(404).json({ success: false, message: 'Habit not found' });
      return;
    }

    // Also delete all logs for this habit
    await HabitLog.deleteMany({ habitId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Habit deleted successfully',
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'Invalid habit ID' });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const logHabitCompletion = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    const { habitId } = req.params;
    const { date, completed, note } = req.body;

    // Verify habit belongs to user
    const habit = await Habit.findOne({
      _id: habitId,
      userId: req.userId,
    });

    if (!habit) {
      res.status(404).json({ success: false, message: 'Habit not found' });
      return;
    }

    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    // Check if log already exists for this date
    let log = await HabitLog.findOne({
      userId: req.userId,
      habitId,
      date: logDate,
    });

    if (log) {
      log.completed = completed;
      if (note !== undefined) log.note = note;
      log = await log.save();
    } else {
      log = await HabitLog.create({
        userId: req.userId,
        habitId,
        date: logDate,
        completed,
        note: note || undefined,
      });
    }

    res.status(201).json({
      success: true,
      data: log,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map((e: any) => e.message)
        .join(', ');
      res.status(400).json({ success: false, message: messages });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const getHabitLogs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { habitId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify habit belongs to user
    const habit = await Habit.findOne({
      _id: habitId,
      userId: req.userId,
    });

    if (!habit) {
      res.status(404).json({ success: false, message: 'Habit not found' });
      return;
    }

    const query: any = { userId: req.userId, habitId };

    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format',
        });
        return;
      }

      query.date = {
        $gte: start,
        $lte: end,
      };
    }

    const logs = await HabitLog.find(query)
      .sort({ date: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'Invalid habit ID' });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const getHabitStatistics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { habitId } = req.params;
    const { days = 30 } = req.query;

    const daysInt = parseInt(days as string);
    if (isNaN(daysInt) || daysInt < 1) {
      res.status(400).json({
        success: false,
        message: 'Days must be a positive number',
      });
      return;
    }

    const habit = await Habit.findOne({
      _id: habitId,
      userId: req.userId,
    });

    if (!habit) {
      res.status(404).json({ success: false, message: 'Habit not found' });
      return;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysInt);
    startDate.setHours(0, 0, 0, 0);

    const logs = await HabitLog.find({
      userId: req.userId,
      habitId,
      date: { $gte: startDate },
    });

    const completedDays = logs.filter((log) => log.completed).length;
    const totalDays = logs.length;
    const completionRate =
      totalDays > 0 ? ((completedDays / totalDays) * 100).toFixed(2) : 0;

    // Calculate streak
    let currentStreak = 0;
    const sortedLogs = logs.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const log of sortedLogs) {
      if (log.completed) {
        currentStreak++;
      } else {
        break;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        habit: habit.name,
        completedDays,
        totalDays,
        completionRate,
        currentStreak,
        period: `${daysInt} days`,
      },
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'Invalid habit ID' });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
