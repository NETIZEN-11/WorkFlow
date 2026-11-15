import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Meeting from '../models/Meeting.js';

interface AuthRequest extends Request {
  userId?: string;
}

export const getMeetings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { date, startDate, endDate } = req.query;
    const query: any = { userId: req.userId };

    if (startDate !== undefined || endDate !== undefined) {
      if (typeof startDate !== 'string' || typeof endDate !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Both startDate and endDate are required',
        });
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
        res.status(400).json({
          success: false,
          message: 'Invalid date range',
        });
        return;
      }

      end.setDate(end.getDate() + 1);
      query.startTime = { $gte: start, $lt: end };
    } else if (date) {
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

    const meetings = await Meeting.find(query)
      .sort({ startTime: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: meetings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const getMeeting = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!meeting) {
      res.status(404).json({ success: false, message: 'Meeting not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'Invalid meeting ID' });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const createMeeting = async (
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
      date,
      startTime,
      endTime,
      location,
      meetingLink,
      participants,
      category,
      reminder,
      recurring,
    } = req.body;

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

    const meeting = await Meeting.create({
      userId: req.userId,
      title,
      description: description || undefined,
      date: new Date(date),
      startTime: start,
      endTime: end,
      location: location || '',
      meetingLink: meetingLink || '',
      participants: participants || [],
      category: category || 'General',
      reminder: reminder || 15,
      recurring: recurring || 'none',
    });

    res.status(201).json({
      success: true,
      data: meeting,
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

export const updateMeeting = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    let meeting = await Meeting.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!meeting) {
      res.status(404).json({ success: false, message: 'Meeting not found' });
      return;
    }

    const {
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      meetingLink,
      participants,
      category,
      reminder,
      recurring,
    } = req.body;

    if (startTime !== undefined || endTime !== undefined) {
      const start = startTime !== undefined ? new Date(startTime) : meeting.startTime;
      const end = endTime !== undefined ? new Date(endTime) : meeting.endTime;

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

      meeting.startTime = start;
      meeting.endTime = end;
    }

    if (title !== undefined) meeting.title = title;
    if (description !== undefined) meeting.description = description;
    if (date !== undefined) meeting.date = new Date(date);
    if (location !== undefined) meeting.location = location;
    if (meetingLink !== undefined) meeting.meetingLink = meetingLink;
    if (participants !== undefined) meeting.participants = participants;
    if (category !== undefined) meeting.category = category;
    if (reminder !== undefined) meeting.reminder = reminder;
    if (recurring !== undefined) meeting.recurring = recurring;

    meeting = await meeting.save();

    res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'Invalid meeting ID' });
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

export const deleteMeeting = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const meeting = await Meeting.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!meeting) {
      res.status(404).json({ success: false, message: 'Meeting not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully',
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'Invalid meeting ID' });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const getUpcomingMeetings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const now = new Date();
    const meetings = await Meeting.find({
      userId: req.userId,
      startTime: { $gte: now },
    })
      .sort({ startTime: 1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: meetings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
