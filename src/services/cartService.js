import prisma from '../lib/database.js';

// eslint-disable-next-line no-console
console.log('🛒 [PRODUCTION DEBUG] CartService importing prisma...');
// eslint-disable-next-line no-console
console.log('📦 [PRODUCTION DEBUG] CartService version: DEEP_DEBUG_V1');
// eslint-disable-next-line no-console
console.log('🛒 [PRODUCTION DEBUG] Prisma type:', typeof prisma);
// eslint-disable-next-line no-console
console.log('🛒 [PRODUCTION DEBUG] Prisma defined:', !!prisma);
// eslint-disable-next-line no-console
console.log('🛒 [PRODUCTION DEBUG] Prisma has cart:', 'cart' in prisma);

// Safety check for prisma initialization
if (!prisma) {
  // eslint-disable-next-line no-console
  console.error('❌ [PRODUCTION DEBUG] Prisma client is undefined!');
  throw new Error('Prisma client not initialized');
}

if (!('cart' in prisma)) {
  // eslint-disable-next-line no-console
  console.error('❌ [PRODUCTION DEBUG] Prisma client missing cart property!');
  throw new Error('Prisma client missing cart property');
}

// eslint-disable-next-line no-console
console.log('✅ [PRODUCTION DEBUG] CartService prisma validation passed');

/**
 * Cart Service
 * Handles cart operations including guest and authenticated user carts
 */
const cartService = {
  /**
   * Get or create cart for user or session
   */
  async getOrCreateCart(userId = null, sessionId = null) {
    // eslint-disable-next-line no-console
    console.log(
      '🛒 [PRODUCTION DEBUG] getOrCreateCart called with userId:',
      !!userId,
      'sessionId:',
      !!sessionId
    );
    // eslint-disable-next-line no-console
    console.log('🛒 [PRODUCTION DEBUG] prisma object:', typeof prisma);
    // eslint-disable-next-line no-console
    console.log('🛒 [PRODUCTION DEBUG] prisma.cart:', typeof prisma?.cart);
    // eslint-disable-next-line no-console
    console.log('🛒 [PRODUCTION DEBUG] prisma.cart.findFirst:', typeof prisma?.cart?.findFirst);

    if (!userId && !sessionId) {
      throw new Error('Either userId or sessionId is required');
    }

    let cart;

    if (userId) {
      // eslint-disable-next-line no-console
      console.log('🛒 [PRODUCTION DEBUG] Using userId path');
      cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
          items: {
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
    } else if (sessionId) {
      // eslint-disable-next-line no-console
      console.log('🛒 [PRODUCTION DEBUG] Using sessionId path');
      cart = await prisma.cart.findFirst({
        where: { sessionId },
        include: {
          items: {
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
    }

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          sessionId,
          subtotal: 0,
          tax: 0,
          total: 0
        },
        include: {
          items: {
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
    }

    return this.formatCartResponse(cart);
  },

  /**
   * Add item to cart
   */
  async addToCart(cartId, productId, quantity = 1) {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true
      }
    });

    if (!product) {
      throw new Error('Product not found or inactive');
    }

    if (product.stock < quantity) {
      throw new Error('Insufficient stock available');
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId
        }
      }
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock < newQuantity) {
        throw new Error('Insufficient stock for requested quantity');
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId,
          productId,
          quantity,
          unitPrice: product.price
        },
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      });
    }

    await this.recalculateCartTotals(cartId);
    return this.getCartById(cartId);
  },

  /**
   * Update cart item quantity
   */
  async updateCartItem(cartItemId, quantity) {
    if (quantity <= 0) {
      return this.removeCartItem(cartItemId);
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true }
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    if (cartItem.product.stock < quantity) {
      throw new Error('Insufficient stock available');
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity }
    });

    await this.recalculateCartTotals(cartItem.cartId);
    return this.getCartById(cartItem.cartId);
  },

  /**
   * Remove item from cart
   */
  async removeCartItem(cartItemId) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId }
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId }
    });

    await this.recalculateCartTotals(cartItem.cartId);
    return this.getCartById(cartItem.cartId);
  },

  /**
   * Clear entire cart
   */
  async clearCart(cartId) {
    await prisma.cartItem.deleteMany({
      where: { cartId }
    });

    await prisma.cart.update({
      where: { id: cartId },
      data: {
        subtotal: 0,
        tax: 0,
        total: 0
      }
    });

    return this.getCartById(cartId);
  },

  /**
   * Merge guest cart with user cart
   */
  async mergeGuestCart(userId, guestSessionId) {
    const userCart = await this.getOrCreateCart(userId);
    const guestCart = await prisma.cart.findFirst({
      where: { sessionId: guestSessionId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!guestCart || guestCart.items.length === 0) {
      return userCart;
    }

    for (const guestItem of guestCart.items) {
      await this.addToCart(userCart.id, guestItem.productId, guestItem.quantity);
    }

    await prisma.cart.delete({
      where: { id: guestCart.id }
    });

    return this.getCartById(userCart.id);
  },

  /**
   * Get cart by ID
   */
  async getCartById(cartId) {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
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

    if (!cart) {
      throw new Error('Cart not found');
    }

    return this.formatCartResponse(cart);
  },

  /**
   * Recalculate cart totals
   */
  async recalculateCartTotals(cartId) {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true }
    });

    if (!cart) {
      throw new Error('Cart not found');
    }

    const subtotal = cart.items.reduce((sum, item) => {
      return sum + parseFloat(item.unitPrice) * item.quantity;
    }, 0);

    // Calculate tax (10% for simplicity)
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    await prisma.cart.update({
      where: { id: cartId },
      data: {
        subtotal,
        tax,
        total
      }
    });
  },

  /**
   * Format cart response
   */
  formatCartResponse(cart) {
    const items = cart.items.map(item => ({
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
      unitPrice: parseFloat(item.unitPrice),
      totalPrice: parseFloat(item.unitPrice) * item.quantity
    }));

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      subtotal: parseFloat(cart.subtotal),
      tax: parseFloat(cart.tax),
      total: parseFloat(cart.total),
      itemCount,
      updatedAt: cart.updatedAt.toISOString()
    };
  }
};

export default cartService;
