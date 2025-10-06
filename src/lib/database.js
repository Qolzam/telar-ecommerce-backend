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
 * Uses singleton pattern with lazy initialization and connection recovery
 */
let prismaInstance = null;

const createPrismaClient = () => {
  const config = {
    log:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['query', 'info', 'warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  };

  return new PrismaClient(config);
};

const getPrisma = () => {
  if (!prismaInstance) {
    prismaInstance = createPrismaClient();
  }
  return prismaInstance;
};

// Create the prisma instance immediately and export it directly
const prisma = getPrisma();

/**
 * Test database connection with retry logic
 * @returns {Promise<boolean>} True if connection successful
 */
export const testConnection = async () => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const client = getPrisma();
      await client.$connect();
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

      // Reset instance on connection failure
      prismaInstance = null;

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
    const client = getPrisma();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('🔍 Database health check failed:', error.message);

    // If connection is closed, reset the instance to force reconnection
    if (error.message.includes('Closed') || error.message.includes('connection')) {
      // eslint-disable-next-line no-console
      console.log('🔄 Resetting Prisma client due to connection error');
      prismaInstance = null;
    }

    return false;
  }
};

/**
 * Gracefully disconnect from database on process termination
 */
const gracefulShutdown = async () => {
  try {
    if (prismaInstance) {
      await prismaInstance.$disconnect();
      // eslint-disable-next-line no-console
      console.log('🔌 Database disconnected gracefully');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error during database disconnection:', error);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default prisma;
