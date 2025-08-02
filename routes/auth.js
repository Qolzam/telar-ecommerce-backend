import { Router } from 'express';

import { authController } from '../controllers/index.js';
import { registerValidator } from '../Validators/auth.js';
import { validate } from '../Validators/validate.js';
import { validateUserRegistration, handleValidationErrors } from '../Validators/validation.js';

const router = Router();

router.post('/register', validateUserRegistration, handleValidationErrors, authController.register);

export default router;
