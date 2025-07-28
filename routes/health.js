import { Router } from 'express';

import healthController from '../controllers/healthController.js';

const router = Router();

// check health api
router.get('/health', healthController.getHealth);

export default router;
