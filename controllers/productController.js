import productService from '../services/productService.js';

/**
 * Product Controller
 */
const productController = {
  /**
   * Get all products with pagination
   */
  async getAllProducts(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;

      const result = await productService.getAllProducts(page, limit);

      res.status(200).json({
        status: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single product by ID
   */
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;

      const product = await productService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          status: false,
          message: 'Product not found'
        });
      }

      res.status(200).json({
        status: true,
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new product
   */
  async createProduct(req, res, next) {
    try {
      const productData = req.body;

      // Basic validation
      if (!productData.name || !productData.price || !productData.categoryId) {
        return res.status(400).json({
          status: false,
          message: 'Name, price, and categoryId are required'
        });
      }

      // Check SKU uniqueness if provided
      if (productData.sku) {
        const isUnique = await productService.isSkuUnique(productData.sku);
        if (!isUnique) {
          return res.status(400).json({
            status: false,
            message: 'SKU already exists'
          });
        }
      }

      const product = await productService.createProduct(productData);

      res.status(201).json({
        status: true,
        message: 'Product created successfully',
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;

      const result = await productService.getProductsByCategory(categoryId, page, limit);

      res.status(200).json({
        status: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
};

export default productController;
