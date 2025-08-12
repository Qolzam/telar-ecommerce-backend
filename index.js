import express from 'express';
import cors from 'cors';

import { port } from './config/index.js';
import configureRoutes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { testConnection } from './lib/database.js';

const app = express();
const PORT = port || 8080;

// Middleware to handle CORS and JSON requests
app.use(cors());
app.use(express.json());

// Configure all routes
configureRoutes(app);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server with database connection test
const startServer = async () => {
  try {
    // Test database connection before starting server
    const dbConnected = await testConnection();

    if (!dbConnected) {
      // eslint-disable-next-line no-console
      console.warn('⚠️  Starting server without database connection');
    }

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      // eslint-disable-next-line no-console
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
