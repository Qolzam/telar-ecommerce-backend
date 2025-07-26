import express from 'express';

import { healthCheck } from '../controllers/healthController';

const router = express.Router();

// check health api
router.get('/api/health', healthCheck);

export default router;
