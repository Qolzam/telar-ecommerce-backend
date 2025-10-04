import orderService from '../services/orderService.js';

/**
 * Order Controller
 * Handles HTTP requests for order operations
 */
const orderController = {
  /**
   * GET /api/orders - Get user orders
   */
  async getUserOrders(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        status: req.query.status,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const result = await orderService.getUserOrders(userId, options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching user orders:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  },

  /**
   * GET /api/orders/:id - Get order by ID
   */
  async getOrderById(req, res) {
    try {
      const orderId = req.params.id;
      const userId = req.user?.id;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request'
        });
      }

      const order = await orderService.getOrderById(orderId, userId);

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching order:', error);

      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          error: 'Not Found'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  },

  /**
   * POST /api/orders - Create new order
   */
  async createOrder(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      const { items, shippingAddress, billingAddress, paymentMethod } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request'
        });
      }

      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({
            success: false,
            error: 'Bad Request'
          });
        }
      }

      const orderData = {
        userId,
        items,
        shippingAddress,
        billingAddress,
        paymentMethod
      };

      const order = await orderService.createOrder(orderData);

      res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully'
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating order:', error);

      if (
        error.message.includes('not found') ||
        error.message.includes('not available') ||
        error.message.includes('Insufficient stock')
      ) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  },

  /**
   * PUT /api/orders/:id/status - Update order status
   */
  async updateOrderStatus(req, res) {
    try {
      const orderId = req.params.id;
      const { status } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request'
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request'
        });
      }

      const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`
        });
      }

      const order = await orderService.updateOrderStatus(orderId, status);

      res.json({
        success: true,
        data: order,
        message: 'Order status updated successfully'
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating order status:', error);

      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          error: 'Not Found'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  },

  /**
   * PUT /api/orders/:id/cancel - Cancel order
   */
  async cancelOrder(req, res) {
    try {
      const orderId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request'
        });
      }

      const order = await orderService.cancelOrder(orderId, userId);

      res.json({
        success: true,
        data: order,
        message: 'Order cancelled successfully'
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error cancelling order:', error);

      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          error: 'Not Found'
        });
      }

      if (error.message === 'Only pending orders can be cancelled') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  },

  /**
   * GET /api/admin/orders - Get all orders (Admin only)
   */
  async getAllOrders(req, res) {
    try {
      // Note: Add admin role check when authentication is implemented
      // if (!req.user?.isAdmin) {
      //   return res.status(403).json({
      //     success: false,
      //     error: 'Forbidden',
      //     message: 'Admin access required'
      //   });
      // }

      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        status: req.query.status,
        userId: req.query.userId,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const result = await orderService.getAllOrders(options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching all orders:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  },

  /**
   * PUT /api/orders/confirm-payment - Confirm order payment
   */
  async confirmOrderPayment(req, res) {
    try {
      const { orderNo, transactionId, paymentTimestamp, notes } = req.body;

      if (!orderNo) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Order number is required'
        });
      }

      const order = await orderService.confirmOrderPayment(orderNo, {
        transactionId,
        paymentTimestamp,
        notes
      });

      res.json({
        success: true,
        data: order,
        message: 'Order payment confirmed successfully'
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error confirming order payment:', error);

      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          error: 'Not Found'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }
};

export default orderController;
