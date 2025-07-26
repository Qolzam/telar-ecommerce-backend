import express from 'express';

import { healthController } from '../controllers/healthController';

const router = express.Router();

// check health api
router.get('/health', healthController.getHealth);

export default router;
