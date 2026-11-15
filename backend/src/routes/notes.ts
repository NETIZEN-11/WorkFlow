import { Router } from 'express';
import { body } from 'express-validator';
import * as noteController from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', noteController.getNotes);
router.get('/:id', noteController.getNote);

router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Note title is required')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Note content is required')
      .isLength({ max: 5000 })
      .withMessage('Content cannot exceed 5000 characters'),
    body('category')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Category cannot exceed 50 characters'),
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Invalid color format'),
  ],
  noteController.createNote
);

router.put(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('content')
      .optional()
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Content must be between 1 and 5000 characters'),
    body('category')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Category cannot exceed 50 characters'),
    body('pinned').optional().isBoolean(),
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Invalid color format'),
  ],
  noteController.updateNote
);

router.delete('/:id', noteController.deleteNote);

router.put('/:id/toggle-pin', noteController.togglePinNote);

export default router;
