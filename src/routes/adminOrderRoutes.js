import express from 'express';

import orderController from '../controllers/orderController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { requireAdmin } from '../middlewares/authorize.js';

const router = express.Router();

/**
 * Admin Order Routes
 * All routes are prefixed with /api/admin/orders
 * Requires admin authentication
 */

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders with filters (Admin only)
 * @access  Private (Admin only)
 * @query   page, limit, status, userId, dateFrom, dateTo, sortBy, sortOrder
 */
router.get('/', authenticate, requireAdmin, orderController.getAllOrders);

export default router;
