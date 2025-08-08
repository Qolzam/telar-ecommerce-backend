import { Router } from 'express';

import { authController } from '../controllers/index.js';
import {
  validateUserRegistration,
  handleValidationErrors,
  validateUserLogin
} from '../validators/validation.js';

const router = Router();

router.post('/register', validateUserRegistration, handleValidationErrors, authController.register);
router.post('/login', validateUserLogin, handleValidationErrors, authController.login);

export default router;
