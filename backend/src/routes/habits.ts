import { Router } from 'express';
import { body } from 'express-validator';
import * as habitController from '../controllers/habitController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', habitController.getHabits);
router.get('/:id', habitController.getHabit);
router.get('/:habitId/statistics', habitController.getHabitStatistics);
router.get('/:habitId/logs', habitController.getHabitLogs);

router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Habit name is required')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('frequency')
      .optional()
      .isIn(['daily', 'weekly', 'monthly'])
      .withMessage('Invalid frequency'),
    body('reminderTime').optional().isString(),
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Invalid color format'),
  ],
  habitController.createHabit
);

router.put(
  '/:id',
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('frequency')
      .optional()
      .isIn(['daily', 'weekly', 'monthly'])
      .withMessage('Invalid frequency'),
    body('reminderTime').optional().isString(),
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Invalid color format'),
    body('active').optional().isBoolean(),
  ],
  habitController.updateHabit
);

router.delete('/:id', habitController.deleteHabit);

router.post(
  '/:habitId/logs',
  [
    body('date').isISO8601().withMessage('Invalid date format'),
    body('completed')
      .isBoolean()
      .withMessage('Completed must be a boolean'),
    body('note')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Note cannot exceed 500 characters'),
  ],
  habitController.logHabitCompletion
);

export default router;
