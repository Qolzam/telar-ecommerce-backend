import prisma from '../lib/database.js';

/**
 * Order Service
 * Handles all order-related business logic
 */
const orderService = {
  /**
   * Get user orders with pagination
   */
  async getUserOrders(userId, options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause = { userId };

    if (options.status) {
      whereClause.status = options.status;
    }

    let orderBy = { createdAt: 'desc' };
    if (options.sortBy) {
      const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';
      orderBy = { [options.sortBy]: sortOrder };
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: limit,
        where: whereClause,
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  category: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              fullName: true
            }
          }
        },
        orderBy
      }),
      prisma.order.count({
        where: whereClause
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNo: order.orderNo,
      status: order.status,
      total: parseFloat(order.total),
      itemCount: order.orderItems.length,
      createdAt: order.createdAt.toISOString()
    }));

    return {
      orders: formattedOrders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    };
  },

  /**
   * Get order by ID with full details
   */
  async getOrderById(orderId, userId = null) {
    const whereClause = { id: parseInt(orderId, 10) };

    if (userId) {
      whereClause.userId = userId;
    }

    const order = await prisma.order.findFirst({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const formattedOrder = {
      id: order.id,
      orderNo: order.orderNo,
      userId: order.userId,
      status: order.status,
      total: parseFloat(order.total),
      items: order.orderItems.map(item => ({
        id: item.id,
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: parseFloat(item.product.price),
          sku: item.product.sku,
          images: item.product.images,
          category: {
            id: item.product.category.id,
            name: item.product.category.name,
            slug: item.product.category.slug
          }
        },
        quantity: item.quantity,
        unitPrice: parseFloat(item.price),
        totalPrice: parseFloat(item.price) * item.quantity
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    };

    return formattedOrder;
  },

  /**
   * Create new order from cart or direct checkout
   */
  async createOrder(orderData) {
    const { userId, items } = orderData;

    const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      if (!product.isActive) {
        throw new Error(`Product ${product.name} is not available`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      const itemTotal = parseFloat(product.price) * item.quantity;
      total += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      });
    }

    const order = await prisma.$transaction(async tx => {
      const newOrder = await tx.order.create({
        data: {
          orderNo,
          userId,
          status: 'PENDING',
          total,
          orderItems: {
            create: orderItems
          }
        },
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return newOrder;
    });

    return this.getOrderById(order.id);
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status) {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId, 10) },
      data: {
        status,
        updatedAt: new Date()
      }
    });

    return this.getOrderById(updatedOrder.id);
  },

  /**
   * Cancel order
   */
  async cancelOrder(orderId, userId) {
    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId, 10),
        userId
      },
      include: {
        orderItems: true
      }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new Error('Only pending orders can be cancelled');
    }

    const cancelledOrder = await prisma.$transaction(async tx => {
      const updated = await tx.order.update({
        where: { id: parseInt(orderId, 10) },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      });

      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }

      return updated;
    });

    return this.getOrderById(cancelledOrder.id);
  },

  /**
   * Admin: Get all orders with filters
   */
  async getAllOrders(options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause = {};

    if (options.status) {
      whereClause.status = options.status;
    }

    if (options.userId) {
      whereClause.userId = parseInt(options.userId, 10);
    }

    if (options.dateFrom) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        gte: new Date(options.dateFrom)
      };
    }

    if (options.dateTo) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        lte: new Date(options.dateTo)
      };
    }

    let orderBy = { createdAt: 'desc' };
    if (options.sortBy) {
      const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';
      orderBy = { [options.sortBy]: sortOrder };
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: limit,
        where: whereClause,
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  sku: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              fullName: true
            }
          }
        },
        orderBy
      }),
      prisma.order.count({
        where: whereClause
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNo: order.orderNo,
      userId: order.userId,
      user: order.user,
      status: order.status,
      total: parseFloat(order.total),
      itemCount: order.orderItems.length,
      items: order.orderItems.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
        price: parseFloat(item.price)
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }));

    return {
      orders: formattedOrders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    };
  },

  /**
   * Confirm order payment by order number
   */
  async confirmOrderPayment(orderNo, paymentDetails = {}) {
    const order = await prisma.order.findFirst({
      where: { orderNo }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED',
        transactionId: paymentDetails.transactionId,
        paymentTimestamp: paymentDetails.paymentTimestamp
          ? new Date(paymentDetails.paymentTimestamp)
          : new Date(),
        notes: paymentDetails.notes || 'Payment confirmed',
        updatedAt: new Date()
      }
    });

    return this.getOrderById(updatedOrder.id);
  }
};

export default orderService;
