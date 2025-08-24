import { Router } from 'express';

import userController from '../controllers/userController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateUserProfileUpdate, handleValidationErrors } from '../validators/validation.js';

const router = Router();

router.get('/me', authenticate, userController.getUserProfile);
router.put(
  '/me',
  authenticate,
  validateUserProfileUpdate,
  handleValidationErrors,
  userController.updateUser
);

export default router;
