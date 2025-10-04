import { Router } from 'express';

import categoryController from '../controllers/categoryController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

/**
 * Category Routes
 * Base path: /api/categories
 */

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/products', categoryController.getProductsByCategory);

// Protected routes (require authentication)
router.post('/', authenticate, categoryController.createCategory);
router.put('/:id', authenticate, categoryController.updateCategory);
router.delete('/:id', authenticate, categoryController.deleteCategory);

export default router;
