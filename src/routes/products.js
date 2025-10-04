import { Router } from 'express';

import productController from '../controllers/productController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { requireAdmin } from '../middlewares/authorize.js';

const router = Router();

// GET /api/products - Get all products with pagination
router.get('/', productController.getAllProducts);

router.get('/search', productController.searchProducts);

router.get('/featured', productController.getFeaturedProducts);

// GET /api/products/:id - Get single product by ID
router.get('/:id', productController.getProductById);

router.post('/', authenticate, requireAdmin, productController.createProduct);

// GET /api/products/category/:categoryId - Get products by category
router.get('/category/:categoryId', productController.getProductsByCategory);

export default router;
