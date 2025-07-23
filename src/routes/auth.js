// src/routes/auth.js
import express from 'express';
import { register } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', validateRequest, register);

export default router;
