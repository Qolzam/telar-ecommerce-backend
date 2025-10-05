import prisma from '../lib/database.js';
import logger from '../lib/logger.js';

/**
 * Category Service
 * Handles all category-related business logic
 */
const categoryService = {
  /**
   * Get all active categories
   */
  async getAllCategories() {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { products: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      return categories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        slug: category.slug,
        isActive: category.isActive,
        productCount: category._count.products,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString()
      }));
    } catch (error) {
      logger.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  },

  /**
   * Get category by ID
   */
  async getCategoryById(id) {
    try {
      const categoryId = parseInt(id, 10);

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          _count: {
            select: { products: true }
          }
        }
      });

      if (!category) {
        return null;
      }

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        slug: category.slug,
        isActive: category.isActive,
        productCount: category._count.products,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString()
      };
    } catch (error) {
      logger.error('Error fetching category by ID:', error);
      throw new Error('Failed to fetch category');
    }
  },

  /**
   * Create new category
   */
  async createCategory(categoryData) {
    try {
      const { name, description, slug, isActive = true } = categoryData;

      const finalSlug = slug || this.generateSlug(name);
      const existingCategory = await prisma.category.findUnique({
        where: { slug: finalSlug }
      });

      if (existingCategory) {
        throw new Error('Category slug already exists');
      }

      const category = await prisma.category.create({
        data: {
          name,
          description,
          slug: finalSlug,
          isActive
        },
        include: {
          _count: {
            select: { products: true }
          }
        }
      });

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        slug: category.slug,
        isActive: category.isActive,
        productCount: category._count.products,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString()
      };
    } catch (error) {
      logger.error('Error creating category:', error);
      throw new Error(`Failed to create category: ${error.message}`);
    }
  },

  /**
   * Update category
   */
  async updateCategory(id, updateData) {
    try {
      const categoryId = parseInt(id, 10);

      const existingCategory = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!existingCategory) {
        return null;
      }

      if (updateData.slug && updateData.slug !== existingCategory.slug) {
        const slugExists = await prisma.category.findUnique({
          where: { slug: updateData.slug }
        });

        if (slugExists) {
          throw new Error('Category slug already exists');
        }
      }

      const category = await prisma.category.update({
        where: { id: categoryId },
        data: updateData,
        include: {
          _count: {
            select: { products: true }
          }
        }
      });

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        slug: category.slug,
        isActive: category.isActive,
        productCount: category._count.products,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString()
      };
    } catch (error) {
      logger.error('Error updating category:', error);
      throw new Error(`Failed to update category: ${error.message}`);
    }
  },

  /**
   * Delete category (soft delete by setting isActive to false)
   */
  async deleteCategory(id) {
    try {
      const categoryId = parseInt(id, 10);

      const existingCategory = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          _count: {
            select: { products: true }
          }
        }
      });

      if (!existingCategory) {
        return null;
      }

      if (existingCategory._count.products > 0) {
        throw new Error('Cannot delete category with existing products');
      }

      await prisma.category.update({
        where: { id: categoryId },
        data: { isActive: false }
      });

      return true;
    } catch (error) {
      logger.error('Error deleting category:', error);
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId, page = 1, limit = 10) {
    try {
      const categoryIdInt = parseInt(categoryId, 10);
      const skip = (page - 1) * limit;

      // Check if category exists
      const category = await prisma.category.findUnique({
        where: { id: categoryIdInt }
      });

      if (!category) {
        throw new Error('Category not found');
      }

      const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          where: {
            categoryId: categoryIdInt,
            isActive: true
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
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.product.count({
          where: {
            categoryId: categoryIdInt,
            isActive: true
          }
        })
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        products: products.map(product => ({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          sku: product.sku,
          stock: product.stock,
          images: product.images,
          category: product.category
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrevious: page > 1
        }
      };
    } catch (error) {
      logger.error('Error fetching products by category:', error);
      throw new Error(`Failed to fetch products by category: ${error.message}`);
    }
  },

  /**
   * Generate slug from name
   */
  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-'); // Remove leading/trailing hyphens
  },

  /**
   * Check if category name is unique
   */
  async isNameUnique(name, excludeId = null) {
    try {
      const whereClause = { name };
      if (excludeId) {
        whereClause.id = { not: parseInt(excludeId, 10) };
      }

      const existingCategory = await prisma.category.findFirst({
        where: whereClause
      });

      return !existingCategory;
    } catch (error) {
      logger.error('Error checking category name uniqueness:', error);
      return false;
    }
  },

  /**
   * Check if category slug is unique
   */
  async isSlugUnique(slug, excludeId = null) {
    try {
      const whereClause = { slug };
      if (excludeId) {
        whereClause.id = { not: parseInt(excludeId, 10) };
      }

      const existingCategory = await prisma.category.findFirst({
        where: whereClause
      });

      return !existingCategory;
    } catch (error) {
      logger.error('Error checking category slug uniqueness:', error);
      return false;
    }
  }
};

export default categoryService;
