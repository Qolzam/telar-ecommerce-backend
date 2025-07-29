import { Router } from 'express';

import homeRoutes from './home.js';
import healthRoutes from './health.js';
import authRoutes from './auth.js';
import productRoutes from './products.js';

/**
 * Configure and mount all application routes
 */
const configureRoutes = app => {
  app.use('/', homeRoutes);

  const apiRouter = Router();

  apiRouter.use('/', healthRoutes);
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/products', productRoutes);

  app.use('/api', apiRouter);
};

export default configureRoutes;
