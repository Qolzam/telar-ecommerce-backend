import express from 'express';

import orderController from '../controllers/orderController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

/**
 * Order Routes
 * All routes are prefixed with /api/orders
 */

/**
 * @route   GET /api/orders
 * @desc    Get user orders with pagination and filters
 * @access  Private (requires authentication)
 * @query   page, limit, status, sortBy, sortOrder
 */
router.get('/', authenticate, orderController.getUserOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private (user can only access their own orders)
 * @params  id - Order ID
 */
router.get('/:id', authenticate, orderController.getOrderById);

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private (requires authentication)
 * @body    { items: [{ productId, quantity }], shippingAddress?, billingAddress?, paymentMethod? }
 */
router.post('/', authenticate, orderController.createOrder);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (Admin only)
 * @access  Private (Admin only)
 * @params  id - Order ID
 * @body    { status }
 */
router.put('/:id/status', authenticate, orderController.updateOrderStatus);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private (user can only cancel their own orders)
 * @params  id - Order ID
 */
router.put('/:id/cancel', authenticate, orderController.cancelOrder);

/**
 * @route   PUT /api/orders/confirm-payment
 * @desc    Confirm order payment (used after successful payment)
 * @access  Public (called by payment gateway callback)
 * @body    { orderNo, transactionId, paymentTimestamp }
 */
router.put('/confirm-payment', orderController.confirmOrderPayment);

export default router;
