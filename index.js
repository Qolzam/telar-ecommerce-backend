import fs from 'fs';
import path from 'path';

import express from 'express';
import cors from 'cors';

import { port } from './src/config/index.js';
import configureRoutes from './src/routes/index.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import { testConnection } from './src/lib/database.js';

const app = express();
const PORT = port || 8088;
const PID_FILE = path.join(process.cwd(), '.server.pid');

let server = null;

const writePidFile = pid => {
  try {
    fs.writeFileSync(PID_FILE, pid.toString());
    // eslint-disable-next-line no-console
    console.log(`📝 PID file written: ${PID_FILE} (PID: ${pid})`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to write PID file:', error.message);
  }
};

const removePidFile = () => {
  try {
    if (fs.existsSync(PID_FILE)) {
      fs.unlinkSync(PID_FILE);
      // eslint-disable-next-line no-console
      console.log('🗑️  PID file removed');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to remove PID file:', error.message);
  }
};

const checkExistingProcess = () => {
  if (!fs.existsSync(PID_FILE)) {
    return false;
  }

  try {
    const existingPid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim(), 10);

    process.kill(existingPid, 0);
    return existingPid;
  } catch (error) {
    removePidFile();
    return false;
  }
};

const gracefulShutdown = signal => {
  // eslint-disable-next-line no-console
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(error => {
      if (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Error during server shutdown:', error);
        process.exit(1);
      }

      // eslint-disable-next-line no-console
      console.log('✅ Server closed successfully');
      removePidFile();
      process.exit(0);
    });

    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.error('⏰ Forced shutdown due to timeout');
      removePidFile();
      process.exit(1);
    }, 10000);
  } else {
    removePidFile();
    process.exit(0);
  }
};

const setupSignalHandlers = () => {
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));

  process.on('uncaughtException', error => {
    // eslint-disable-next-line no-console
    console.error('💥 Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason, promise) => {
    // eslint-disable-next-line no-console
    console.error('🚫 Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
  });
};

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    // eslint-disable-next-line no-console
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

configureRoutes(app);

app.use(errorHandler);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid
  });
});

const startServer = async () => {
  try {
    const existingPid = checkExistingProcess();
    if (existingPid) {
      // eslint-disable-next-line no-console
      console.error(`❌ Server already running with PID: ${existingPid}`);
      // eslint-disable-next-line no-console
      console.log('💡 Use the management script to stop the existing server first.');
      process.exit(1);
    }

    setupSignalHandlers();

    // eslint-disable-next-line no-console
    console.log('🔌 Testing database connection...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      // eslint-disable-next-line no-console
      console.warn('⚠️  Starting server without database connection');
    } else {
      // eslint-disable-next-line no-console
      console.log('✅ Database connection successful');
    }

    server = app.listen(PORT, () => {
      const serverUrl = `http://localhost:${PORT}`;

      writePidFile(process.pid);

      // eslint-disable-next-line no-console
      console.log('🚀=================================🚀');
      // eslint-disable-next-line no-console
      console.log(`🚀 Server running on ${serverUrl}`);
      // eslint-disable-next-line no-console
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      // eslint-disable-next-line no-console
      console.log(`🆔 Process ID: ${process.pid}`);
      // eslint-disable-next-line no-console
      console.log('🚀=================================🚀');

      // eslint-disable-next-line no-console
      console.log('📡 Available API endpoints:');
      // eslint-disable-next-line no-console
      console.log(`   Health: ${serverUrl}/health`);
      // eslint-disable-next-line no-console
      console.log(`   Categories: ${serverUrl}/api/categories`);
      // eslint-disable-next-line no-console
      console.log(`   Products: ${serverUrl}/api/products`);
      // eslint-disable-next-line no-console
      console.log(`   Cart: ${serverUrl}/api/cart`);
      // eslint-disable-next-line no-console
      console.log('');
    });

    server.on('error', error => {
      if (error.code === 'EADDRINUSE') {
        // eslint-disable-next-line no-console
        console.error(`❌ Port ${PORT} is already in use`);
        // eslint-disable-next-line no-console
        console.log('💡 Try a different port or stop the existing server.');
      } else {
        // eslint-disable-next-line no-console
        console.error('❌ Server error:', error);
      }
      removePidFile();
      process.exit(1);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to start server:', error);
    removePidFile();
    process.exit(1);
  }
};

startServer();
