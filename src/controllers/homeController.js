import prisma from '../lib/database.js';

// Safety check for prisma initialization
if (!prisma) {
  throw new Error('Prisma client not initialized');
}

/**
 * GET / controller
 * Returns welcome message and basic API information with database status.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const homeController = {
  getHome: async (req, res, next) => {
    try {
      // Test database connection
      let dbStatus = 'disconnected';
      let userCount = 0;

      try {
        // Simple query to test database connection
        userCount = await prisma.user.count();
        dbStatus = 'connected';
      } catch (dbError) {
        // Database connection failed - log through proper error handling
        dbStatus = 'disconnected';
      }

      res.status(200).json({
        message: 'Hello, world! 🌍',
        api: {
          name: 'E-commerce Backend API',
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        },
        database: {
          status: dbStatus,
          userCount: dbStatus === 'connected' ? userCount : 'N/A'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
};

export default homeController;
