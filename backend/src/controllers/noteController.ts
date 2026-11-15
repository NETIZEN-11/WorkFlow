import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Note from '../models/Note.js';

interface AuthRequest extends Request {
  userId?: string;
}

export const getNotes = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { category, pinned, search } = req.query;
    const query: any = { userId: req.userId };

    if (category) {
      query.category = String(category).trim();
    }

    if (pinned !== undefined) {
      query.pinned = pinned === 'true';
    }

    if (search) {
      const searchStr = String(search).trim();
      query.$or = [
        { title: { $regex: searchStr, $options: 'i' } },
        { content: { $regex: searchStr, $options: 'i' } },
      ];
    }

    const notes = await Note.find(query)
      .sort({ pinned: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const getNote = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!note) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'Invalid note ID' });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const createNote = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    const { title, content, category, color } = req.body;

    const note = await Note.create({
      userId: req.userId,
      title,
      content,
      category: category || 'General',
      color: color || '#FEF08A',
    });

    res.status(201).json({
      success: true,
      data: note,
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

export const updateNote = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    let note = await Note.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!note) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }

    const { title, content, category, pinned, color } = req.body;

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (category !== undefined) note.category = category;
    if (pinned !== undefined) note.pinned = pinned;
    if (color !== undefined) note.color = color;

    note = await note.save();

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'Invalid note ID' });
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

export const deleteNote = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!note) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'Invalid note ID' });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const togglePinNote = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!note) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }

    note.pinned = !note.pinned;
    await note.save();

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'Invalid note ID' });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
