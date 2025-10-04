import categoryService from '../services/categoryService.js';

/**
 * Category Controller
 * Handles all category-related HTTP requests
 */
const categoryController = {
  /**
   * Get all categories
   * GET /api/categories
   */
  async getAllCategories(req, res, next) {
    try {
      const categories = await categoryService.getAllCategories();

      res.status(200).json({
        success: true,
        data: { categories }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get category by ID
   * GET /api/categories/:id
   */
  async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;

      const category = await categoryService.getCategoryById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found',
          code: 'CATEGORY_NOT_FOUND'
        });
      }

      res.status(200).json({
        success: true,
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new category
   * POST /api/categories
   */
  async createCategory(req, res, next) {
    try {
      const categoryData = req.body;

      if (!categoryData.name) {
        return res.status(400).json({
          success: false,
          error: 'Category name is required',
          code: 'VAL_002',
          errors: [
            {
              field: 'name',
              error: 'Name is required'
            }
          ]
        });
      }

      const isNameUnique = await categoryService.isNameUnique(categoryData.name);
      if (!isNameUnique) {
        return res.status(400).json({
          success: false,
          error: 'Category name already exists',
          code: 'VAL_003',
          errors: [
            {
              field: 'name',
              error: 'Category name must be unique'
            }
          ]
        });
      }

      if (categoryData.slug) {
        const isSlugUnique = await categoryService.isSlugUnique(categoryData.slug);
        if (!isSlugUnique) {
          return res.status(400).json({
            success: false,
            error: 'Category slug already exists',
            code: 'VAL_003',
            errors: [
              {
                field: 'slug',
                error: 'Category slug must be unique'
              }
            ]
          });
        }
      }

      const category = await categoryService.createCategory(categoryData);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update category
   * PUT /api/categories/:id
   */
  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (updateData.name) {
        const isNameUnique = await categoryService.isNameUnique(updateData.name, id);
        if (!isNameUnique) {
          return res.status(400).json({
            success: false,
            error: 'Category name already exists',
            code: 'VAL_003',
            errors: [
              {
                field: 'name',
                error: 'Category name must be unique'
              }
            ]
          });
        }
      }

      if (updateData.slug) {
        const isSlugUnique = await categoryService.isSlugUnique(updateData.slug, id);
        if (!isSlugUnique) {
          return res.status(400).json({
            success: false,
            error: 'Category slug already exists',
            code: 'VAL_003',
            errors: [
              {
                field: 'slug',
                error: 'Category slug must be unique'
              }
            ]
          });
        }
      }

      const category = await categoryService.updateCategory(id, updateData);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found',
          code: 'CATEGORY_NOT_FOUND'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete category
   * DELETE /api/categories/:id
   */
  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;

      const result = await categoryService.deleteCategory(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Category not found',
          code: 'CATEGORY_NOT_FOUND'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      if (error.message.includes('Cannot delete category with existing products')) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete category with existing products',
          code: 'BIZ_004'
        });
      }
      next(error);
    }
  },

  /**
   * Get products by category
   * GET /api/categories/:id/products
   */
  async getProductsByCategory(req, res, next) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;

      const result = await categoryService.getProductsByCategory(id, page, limit);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error.message.includes('Category not found')) {
        return res.status(404).json({
          success: false,
          error: 'Category not found',
          code: 'CATEGORY_NOT_FOUND'
        });
      }
      next(error);
    }
  }
};

export default categoryController;
