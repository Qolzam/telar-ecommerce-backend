import { Router } from 'express';

import homeRoutes from './home.js';
import healthRoutes from './health.js';
import authRoutes from './auth.js';
import productRoutes from './products.js';
import userRoutes from './user.js';
import categoryRoutes from './categories.js';
import cartRoutes from './cart.js';
import orderRoutes from './orderRoutes.js';
import adminOrderRoutes from './adminOrderRoutes.js';

/**
 * Configure and mount all application routes
 */
const configureRoutes = app => {
  app.use('/', homeRoutes);

  const apiRouter = Router();

  apiRouter.use('/', healthRoutes);
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/products', productRoutes);
  apiRouter.use('/users', userRoutes);
  apiRouter.use('/categories', categoryRoutes);
  apiRouter.use('/cart', cartRoutes);
  apiRouter.use('/orders', orderRoutes);
  apiRouter.use('/admin/orders', adminOrderRoutes);

  app.use('/api', apiRouter);
};

export default configureRoutes;
