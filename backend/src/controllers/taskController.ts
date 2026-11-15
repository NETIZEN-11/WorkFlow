import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Task from '../models/Task.js';

interface AuthRequest extends Request {
  userId?: string;
}

export const getTasks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { date, completed } = req.query;
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

    if (completed !== undefined) {
      query.completed = completed === 'true';
    }

    const tasks = await Task.find(query)
      .sort({ startTime: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const getTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'Invalid task ID' });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const createTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    const {
      title,
      description,
      startTime,
      endTime,
      priority,
      category,
      recurring,
      reminderTime,
    } = req.body;

    // Validate times
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid date/time format',
      });
      return;
    }

    if (end <= start) {
      res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
      return;
    }

    const task = await Task.create({
      userId: req.userId,
      title,
      description: description || undefined,
      startTime: start,
      endTime: end,
      priority: priority || 'medium',
      category: category || 'General',
      recurring: recurring || 'none',
      reminderTime: reminderTime || 0,
    });

    res.status(201).json({
      success: true,
      data: task,
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

export const updateTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    let task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const {
      title,
      description,
      startTime,
      endTime,
      priority,
      category,
      completed,
      recurring,
      reminderTime,
    } = req.body;

    if (startTime !== undefined || endTime !== undefined) {
      const start = startTime !== undefined ? new Date(startTime) : task.startTime;
      const end = endTime !== undefined ? new Date(endTime) : task.endTime;

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid date/time format',
        });
        return;
      }

      if (end <= start) {
        res.status(400).json({
          success: false,
          message: 'End time must be after start time',
        });
        return;
      }

      task.startTime = start;
      task.endTime = end;
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    if (recurring !== undefined) task.recurring = recurring;
    if (reminderTime !== undefined) task.reminderTime = reminderTime;

    if (completed !== undefined) {
      task.completed = completed;
      if (completed) {
        task.completedAt = new Date();
      } else {
        task.completedAt = undefined;
      }
    }

    task = await task.save();

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'Invalid task ID' });
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

export const deleteTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'Invalid task ID' });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const getTaskStatistics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const totalTasks = await Task.countDocuments({ userId: req.userId });
    const completedTasks = await Task.countDocuments({
      userId: req.userId,
      completed: true,
    });
    const pendingTasks = await Task.countDocuments({
      userId: req.userId,
      completed: false,
    });

    const highPriorityTasks = await Task.countDocuments({
      userId: req.userId,
      priority: 'high',
      completed: false,
    });

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        highPriorityTasks,
        completionPercentage:
          totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
