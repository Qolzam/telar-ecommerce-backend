import cartService from '../services/cartService.js';

/**
 * Cart Controller
 * Handles HTTP requests for cart operations
 */
const cartController = {
  /**
   * Get current cart
   * GET /api/cart
   */
  async getCart(req, res) {
    try {
      const userId = req.user?.id || null;
      const sessionId = req.sessionID || req.headers['x-session-id'] || null;

      const cart = await cartService.getOrCreateCart(userId, sessionId);

      res.json({
        success: true,
        data: { cart }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve cart'
      });
    }
  },

  /**
   * Add item to cart
   * POST /api/cart/items
   */
  async addToCart(req, res) {
    try {
      const { productId, quantity = 1 } = req.body;

      if (!productId || quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid productId and quantity are required'
        });
      }

      const userId = req.user?.id || null;
      const sessionId = req.sessionID || req.headers['x-session-id'] || null;

      const cart = await cartService.getOrCreateCart(userId, sessionId);
      const updatedCart = await cartService.addToCart(cart.id, productId, quantity);

      res.json({
        success: true,
        message: 'Item added to cart',
        data: { cart: updatedCart }
      });
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('inactive')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      if (error.message.includes('stock')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to add item to cart'
      });
    }
  },

  /**
   * Update cart item quantity
   * PUT /api/cart/items/:id
   */
  async updateCartItem(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (!id || quantity === undefined || quantity < 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid item ID and quantity are required'
        });
      }

      const updatedCart = await cartService.updateCartItem(parseInt(id, 10), quantity);

      res.json({
        success: true,
        message: quantity === 0 ? 'Item removed from cart' : 'Cart item updated',
        data: { cart: updatedCart }
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      if (error.message.includes('stock')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update cart item'
      });
    }
  },

  /**
   * Remove item from cart
   * DELETE /api/cart/items/:id
   */
  async removeCartItem(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Item ID is required'
        });
      }

      const updatedCart = await cartService.removeCartItem(parseInt(id, 10));

      res.json({
        success: true,
        message: 'Item removed from cart',
        data: { cart: updatedCart }
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to remove cart item'
      });
    }
  },

  /**
   * Clear entire cart
   * DELETE /api/cart
   */
  async clearCart(req, res) {
    try {
      const userId = req.user?.id || null;
      const sessionId = req.sessionID || req.headers['x-session-id'] || null;

      const cart = await cartService.getOrCreateCart(userId, sessionId);
      const clearedCart = await cartService.clearCart(cart.id);

      res.json({
        success: true,
        message: 'Cart cleared',
        data: { cart: clearedCart }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to clear cart'
      });
    }
  },

  /**
   * Merge guest cart with user cart
   * POST /api/cart/merge
   */
  async mergeCart(req, res) {
    try {
      const userId = req.user?.id;
      const { guestSessionId } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (!guestSessionId) {
        return res.status(400).json({
          success: false,
          error: 'Guest session ID is required'
        });
      }

      const mergedCart = await cartService.mergeGuestCart(userId, guestSessionId);

      res.json({
        success: true,
        message: 'Carts merged successfully',
        data: { cart: mergedCart }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to merge carts'
      });
    }
  }
};

export default cartController;
