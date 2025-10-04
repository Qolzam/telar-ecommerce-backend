import { Router } from 'express';

import userController from '../controllers/userController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateUserProfileUpdate, handleValidationErrors } from '../validators/validation.js';

const router = Router();

router.get('/me', authenticate, userController.getProfile);
router.put(
  '/me',
  authenticate,
  validateUserProfileUpdate,
  handleValidationErrors,
  userController.updateProfile
);

export default router;
