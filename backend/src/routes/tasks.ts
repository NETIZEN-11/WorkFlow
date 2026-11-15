import { Router } from 'express';
import { body } from 'express-validator';
import * as taskController from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', taskController.getTasks);
router.get('/statistics', taskController.getTaskStatistics);
router.get('/:id', taskController.getTask);

router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Task title is required')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('startTime')
      .isISO8601()
      .withMessage('Invalid start time format'),
    body('endTime')
      .isISO8601()
      .withMessage('Invalid end time format'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority'),
    body('category')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Category cannot exceed 50 characters'),
    body('recurring')
      .optional()
      .isIn(['none', 'daily', 'weekly', 'monthly'])
      .withMessage('Invalid recurring option'),
    body('reminderTime')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Reminder time must be 0 or greater'),
  ],
  taskController.createTask
);

router.put(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('startTime')
      .optional()
      .isISO8601()
      .withMessage('Invalid start time format'),
    body('endTime')
      .optional()
      .isISO8601()
      .withMessage('Invalid end time format'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority'),
    body('category')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Category cannot exceed 50 characters'),
    body('completed').optional().isBoolean(),
    body('recurring')
      .optional()
      .isIn(['none', 'daily', 'weekly', 'monthly'])
      .withMessage('Invalid recurring option'),
    body('reminderTime')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Reminder time must be 0 or greater'),
  ],
  taskController.updateTask
);

router.delete('/:id', taskController.deleteTask);

export default router;
