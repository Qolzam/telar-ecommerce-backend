import { Router } from 'express';

import { authController } from '../controllers/index.js';
import {
  validateUserRegistration,
  handleValidationErrors,
  validateUserLogin
} from '../validators/validation.js';

const router = Router();
// POST /api/register - Register a user
router.post('/register', validateUserRegistration, handleValidationErrors, authController.register);

// POST /api/login - login user
router.post('/login', validateUserLogin, handleValidationErrors, authController.login);

export default router;
