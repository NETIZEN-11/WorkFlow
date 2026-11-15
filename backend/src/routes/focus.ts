import { Router } from 'express';
import { body } from 'express-validator';
import * as focusController from '../controllers/focusSessionController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', focusController.getFocusSessions);
router.get('/statistics', focusController.getFocusStatistics);

router.post(
  '/',
  [
    body('sessionType')
      .isIn(['focus', 'shortBreak', 'longBreak', 'custom'])
      .withMessage('Invalid session type'),
    body('duration')
      .isInt({ min: 1 })
      .withMessage('Duration must be at least 1 minute'),
    body('completed').optional().isBoolean(),
    body('actualDuration')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Actual duration must be 0 or greater'),
    body('startTime').optional().isISO8601(),
    body('notes').optional().trim().isLength({ max: 500 }),
  ],
  focusController.createFocusSession
);

router.put(
  '/:id/end',
  [
    body('completed').optional().isBoolean(),
    body('actualDuration')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Actual duration must be 0 or greater'),
  ],
  focusController.endFocusSession
);

router.delete('/:id', focusController.deleteFocusSession);

export default router;
