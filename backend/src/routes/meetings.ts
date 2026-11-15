import { Router } from 'express';
import { body } from 'express-validator';
import * as meetingController from '../controllers/meetingController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', meetingController.getMeetings);
router.get('/upcoming', meetingController.getUpcomingMeetings);
router.get('/:id', meetingController.getMeeting);

router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Meeting title is required')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('date')
      .isISO8601()
      .withMessage('Invalid date format'),
    body('startTime')
      .isISO8601()
      .withMessage('Invalid start time format'),
    body('endTime')
      .isISO8601()
      .withMessage('Invalid end time format'),
    body('location')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Location cannot exceed 200 characters'),
    body('meetingLink')
      .optional()
      .isURL()
      .withMessage('Invalid meeting link URL'),
    body('participants')
      .optional()
      .isArray()
      .withMessage('Participants must be an array'),
    body('category')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Category cannot exceed 50 characters'),
    body('reminder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Reminder must be 0 or greater'),
    body('recurring')
      .optional()
      .isIn(['none', 'daily', 'weekly', 'monthly'])
      .withMessage('Invalid recurring option'),
  ],
  meetingController.createMeeting
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
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format'),
    body('startTime')
      .optional()
      .isISO8601()
      .withMessage('Invalid start time format'),
    body('endTime')
      .optional()
      .isISO8601()
      .withMessage('Invalid end time format'),
    body('location')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Location cannot exceed 200 characters'),
    body('meetingLink')
      .optional()
      .isURL()
      .withMessage('Invalid meeting link URL'),
    body('participants')
      .optional()
      .isArray()
      .withMessage('Participants must be an array'),
    body('category')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Category cannot exceed 50 characters'),
    body('reminder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Reminder must be 0 or greater'),
    body('recurring')
      .optional()
      .isIn(['none', 'daily', 'weekly', 'monthly'])
      .withMessage('Invalid recurring option'),
  ],
  meetingController.updateMeeting
);

router.delete('/:id', meetingController.deleteMeeting);

export default router;
