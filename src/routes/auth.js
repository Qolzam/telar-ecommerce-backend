import { Router } from 'express';

import { authController } from '../controllers/index.js';
import { authenticate } from '../middlewares/authenticate.js';
// Import validation functions from validators directory
import {
  validateUserRegistration,
  handleValidationErrors,
  validateUserLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUserProfileUpdate
} from '../validators/validation.js';

const router = Router();

router.post('/register', validateUserRegistration, handleValidationErrors, authController.register);
router.post('/login', validateUserLogin, handleValidationErrors, authController.login);
router.post(
  '/forgot-password',
  validateForgotPassword,
  handleValidationErrors,
  authController.forgotPassword
);
router.post(
  '/reset-password',
  validateResetPassword,
  handleValidationErrors,
  authController.resetPassword
);

router.get('/me', authenticate, authController.getCurrentUser);
router.post('/refresh', authenticate, authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.put(
  '/profile',
  authenticate,
  validateUserProfileUpdate,
  handleValidationErrors,
  authController.updateProfile
);

export default router;
