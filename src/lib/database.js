import { promisify } from 'util';

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Utility function to sleep for a specified number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = promisify(setTimeout);

/**
 * Global Prisma client instance
 * Uses singleton pattern to prevent multiple instances in development
 */
const prisma = (() => {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  } else {
    // In development, use a global variable so the Prisma Client isn't constantly re-instantiated
    if (!global.prisma) {
      global.prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error']
      });
    }
    return global.prisma;
  }
})();

/**
 * Test database connection with retry logic
 * @returns {Promise<boolean>} True if connection successful
 */
export const testConnection = async () => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      await prisma.$connect();
      // eslint-disable-next-line no-console
      console.log('✅ Database connected successfully');
      return true;
    } catch (error) {
      retryCount++;
      // eslint-disable-next-line no-console
      console.error(
        `❌ Database connection failed (attempt ${retryCount}/${maxRetries}):`,
        error.message
      );

      if (retryCount < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, retryCount) * 1000;
        // eslint-disable-next-line no-console
        console.log(`⏳ Retrying connection in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  return false;
};

/**
 * Check if database connection is healthy
 * @returns {Promise<boolean>} True if connection is healthy
 */
export const isConnectionHealthy = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('🔍 Database health check failed:', error.message);
    return false;
  }
};

/**
 * Gracefully disconnect from database on process termination
 */
const gracefulShutdown = async () => {
  try {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log('🔌 Database disconnected gracefully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error during database disconnection:', error);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Ensure prisma is always defined before export
if (!prisma) {
  // eslint-disable-next-line no-console
  console.error('❌ Prisma client failed to initialize');
  process.exit(1);
}

export default prisma;
