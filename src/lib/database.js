import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

let prisma;

/**
 * Global Prisma client instance
 * Uses singleton pattern to prevent multiple instances in development
 */
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn']
  });
} else {
  // In development, use a global variable so the Prisma Client isn't constantly re-instantiated
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error']
    });
  }
  prisma = global.prisma;
}

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection successful
 */
export const testConnection = async () => {
  try {
    await prisma.$connect();
    // eslint-disable-next-line no-console
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Database connection failed:', error.message);
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

export default prisma;
