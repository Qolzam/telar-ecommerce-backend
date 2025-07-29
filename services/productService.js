import prisma from '../lib/database.js';

/**
 * Product Service
 */
class ProductService {
  /**
   * Get all products with pagination
   */
  async getAllProducts(page = 1, limit = 10, baseUrl = '') {
    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        where: {
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.product.count({
        where: {
          isActive: true
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    // Build next/previous URLs for infinite scrolling
    const buildUrl = targetPage => `${baseUrl}/api/products?page=${targetPage}&limit=${limit}`;

    return {
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNext,
        hasPrevious,
        ...(hasNext && { next: buildUrl(page + 1) }),
        ...(hasPrevious && { previous: buildUrl(page - 1) })
      }
    };
  }

  /**
   * Get product by ID
   */
  async getProductById(id) {
    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(id, 10)
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        }
      }
    });

    return product;
  }

  /**
   * Create new product
   */
  async createProduct(productData) {
    const { name, description, price, sku, stock, categoryId, images } = productData;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        sku,
        stock: parseInt(stock, 10) || 0,
        categoryId: parseInt(categoryId, 10),
        images: images || []
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return product;
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const parsedCategoryId = parseInt(categoryId, 10);

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: {
          categoryId: parsedCategoryId,
          isActive: true
        },
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.product.count({
        where: {
          categoryId: parsedCategoryId,
          isActive: true
        }
      })
    ]);

    return {
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      }
    };
  }

  /**
   * Check if product exists
   */
  async productExists(id) {
    const count = await prisma.product.count({
      where: {
        id: parseInt(id, 10)
      }
    });
    return count > 0;
  }

  /**
   * Check if SKU is unique
   */
  async isSkuUnique(sku, excludeId = null) {
    const whereClause = { sku };
    if (excludeId) {
      whereClause.NOT = { id: parseInt(excludeId, 10) };
    }

    const count = await prisma.product.count({
      where: whereClause
    });
    return count === 0;
  }
}

export default new ProductService();
