import { Router } from 'express';

import { authController } from '../controllers/index.js';
import { registerValidator } from '../validators/auth.js';
import { validate } from '../validators/validate.js';

const router = Router();

router.post('/register', registerValidator, validate, authController.register);

export default router;
