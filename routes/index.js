import { Router } from 'express';

import homeRoutes from './home.js';
import healthRoutes from './health.js';
import authRoutes from './auth.js';
import productRoutes from './products.js';
import userRoutes from './user.js';

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

  app.use('/api', apiRouter);
};

export default configureRoutes;
