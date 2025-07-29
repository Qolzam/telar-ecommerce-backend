import { Router } from 'express';

import productController from '../controllers/productController.js';

const router = Router();

// GET /api/products - Get all products with pagination
router.get('/', productController.getAllProducts);

// GET /api/products/:id - Get single product by ID
router.get('/:id', productController.getProductById);

// POST /api/products - Create new product (Admin only - add auth middleware later)
router.post('/', productController.createProduct);

// GET /api/products/category/:categoryId - Get products by category
router.get('/category/:categoryId', productController.getProductsByCategory);

export default router;
