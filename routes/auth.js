import { Router } from 'express';

import { authController } from '../controllers';
import { registerValidator } from '../Validators/auth';
import { validate } from '../Validators/validate';

const router = Router();

router.post('/register', registerValidator, validate, authController.register);

export default router;
