import { Router } from 'express';

import { authController } from '../controllers/index.js';
import {
  validateUserRegistration,
  handleValidationErrors,
  validateUserLogin,
  validateForgotPassword,
  validateResetPassword
} from '../validators/validation.js';

const router = Router();
// POST /api/register - Register a user
router.post('/register', validateUserRegistration, handleValidationErrors, authController.register);

// POST /api/login - login user
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

export default router;
