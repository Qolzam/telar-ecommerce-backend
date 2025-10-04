import { Router } from 'express';

import cartController from '../controllers/cartController.js';

const router = Router();

/**
 * Cart Management Routes
 * All routes are under /api/cart
 */

// Get current cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/items', cartController.addToCart);

// Update cart item quantity
router.put('/items/:id', cartController.updateCartItem);

// Remove item from cart
router.delete('/items/:id', cartController.removeCartItem);

// Clear entire cart
router.delete('/', cartController.clearCart);

// Merge guest cart with user cart
router.post('/merge', cartController.mergeCart);

export default router;
