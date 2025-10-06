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

/* eslint-disable no-console */
console.log('🚀 [INIT DEBUG] Starting CORS configuration...');
console.log('🚀 [INIT DEBUG] Process environment variables:');
console.log('🚀 [INIT DEBUG] - NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('🚀 [INIT DEBUG] - ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS || 'NOT SET');
console.log('🚀 [INIT DEBUG] - PORT:', process.env.PORT || 'NOT SET');

const rawOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

const allowedOrigins = rawOrigins.map(origin => {
  const trimmed = origin.trim();
  // remove trailing slash if present
  const cleaned = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
  console.log(`🧹 [CORS DEBUG] Cleaning origin: "${origin}" -> "${cleaned}"`);
  return cleaned;
});

console.log('🌐 [CORS DEBUG] Environment:', process.env.NODE_ENV || 'development');
console.log('🌐 [CORS DEBUG] ALLOWED_ORIGINS env var:', process.env.ALLOWED_ORIGINS || 'NOT SET');
console.log('🌐 [CORS DEBUG] Raw allowed origins string:', process.env.ALLOWED_ORIGINS);
console.log('🌐 [CORS DEBUG] Split allowed origins array:', allowedOrigins);
console.log('🌐 [CORS DEBUG] Array length:', allowedOrigins.length);
allowedOrigins.forEach((origin, index) => {
  console.log(`🌐 [CORS DEBUG]   [${index}]: "${origin.trim()}"`);
});

// Middleware
console.log('🔧 [CORS DEBUG] Configuring CORS middleware...');
console.log('🔧 [CORS DEBUG] CORS config object:');
console.log('🔧 [CORS DEBUG] - origin:', allowedOrigins);
console.log('🔧 [CORS DEBUG] - methods:', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);
console.log('🔧 [CORS DEBUG] - allowedHeaders:', [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'x-session-id',
  'Accept-Language'
]);
console.log('🔧 [CORS DEBUG] - credentials:', true);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'x-session-id',
      'Accept-Language'
    ],
    credentials: true
  })
);

console.log('✅ [CORS DEBUG] CORS middleware configured successfully');
/* eslint-enable no-console */

// Language middleware
app.use((req, res, next) => {
  const supportedLanguages = ['en', 'fa', 'ar', 'zh'];
  const defaultLanguage = 'en';

  const acceptLanguage = req.headers['accept-language'];
  const queryLanguage = req.query.lang;

  let language = defaultLanguage;

  if (queryLanguage && supportedLanguages.includes(queryLanguage)) {
    language = queryLanguage;
  } else if (acceptLanguage) {
    // parse Accept-Language header (e.g., "en-US,en;q=0.9,fa;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().split('-')[0])
      .filter(lang => supportedLanguages.includes(lang));

    if (languages.length > 0) {
      language = languages[0];
    }
  }

  req.language = language;
  req.isRTL = language === 'ar' || language === 'fa';

  // Add language to response headers
  res.setHeader('Content-Language', language);
  res.setHeader('X-Language', language);
  res.setHeader('X-RTL', req.isRTL.toString());

  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware with CORS debugging
/* eslint-disable no-console */
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const origin = req.headers.origin;

  console.log(
    `[${timestamp}] ${req.method} ${req.url} - IP: ${ip}${origin ? ` - Origin: ${origin}` : ''}`
  );

  if (req.method === 'OPTIONS') {
    console.log('🔄 [CORS DEBUG] Preflight request detected');
    console.log('🔄 [CORS DEBUG] Origin:', origin);
    console.log('🔄 [CORS DEBUG] Request method:', req.headers['access-control-request-method']);
    console.log('🔄 [CORS DEBUG] Request headers:', req.headers['access-control-request-headers']);
    console.log('🔄 [CORS DEBUG] Allowed origins:', allowedOrigins);
    console.log('🔄 [CORS DEBUG] Origin in allowed list:', allowedOrigins.includes(origin));
    console.log('🔄 [CORS DEBUG] Exact match check:');
    allowedOrigins.forEach((allowedOrigin, index) => {
      const exactMatch = allowedOrigin === origin;
      console.log(`🔄 [CORS DEBUG]   [${index}] "${allowedOrigin}" === "${origin}": ${exactMatch}`);
    });
  }

  next();
});
/* eslint-enable no-console */

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

      // eslint-disable-next-line no-console
      console.log('🌐 [STARTUP DEBUG] CORS Configuration Summary:');
      // eslint-disable-next-line no-console
      console.log(`🌐 [STARTUP DEBUG] - Environment: ${process.env.NODE_ENV || 'development'}`);
      // eslint-disable-next-line no-console
      console.log(
        `🌐 [STARTUP DEBUG] - ALLOWED_ORIGINS env var: ${process.env.ALLOWED_ORIGINS || 'NOT SET'}`
      );
      // eslint-disable-next-line no-console
      console.log(`🌐 [STARTUP DEBUG] - Final allowed origins: ${JSON.stringify(allowedOrigins)}`);
      // eslint-disable-next-line no-console
      console.log(`🌐 [STARTUP DEBUG] - CORS origins count: ${allowedOrigins.length}`);
      // eslint-disable-next-line no-console
      console.log(
        `🌐 [STARTUP DEBUG] - Localhost 5173 included: ${allowedOrigins.includes('http://localhost:5173')}`
      );
      // eslint-disable-next-line no-console
      console.log(
        `🌐 [STARTUP DEBUG] - Production frontend included: ${allowedOrigins.some(origin => origin.includes('online-shop-six-livid.vercel.app'))}`
      );
      // eslint-disable-next-line no-console
      console.log('🌐 [STARTUP DEBUG] CORS configuration is READY for requests!');
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
