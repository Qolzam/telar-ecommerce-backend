import prisma from '../lib/database.js';
import { comparePassword, hashPassword } from '../lib/utils.js';

/**
 * User service
 */

class UserService {
  /**
   * Get user by email
   */

  async getUserByEmail(email) {
    return prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        }
      }
    });
  }

  /**
   * Get user by Id
   */

  async getUserById(id) {
    return prisma.user.findUnique({
      where: {
        id: parseInt(id, 10)
      }
    });
  }

  /**
   * Create new user
   */

  async createUser({ fullName, email, password }) {
    const hashedPassword = await hashPassword(password);

    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      const error = new Error('Email already exists');
      error.code = 'EMAIL_EXISTS';
      throw error;
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: 'USER',
        isActive: true
      },

      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return user;
  }

  /**
   * Check if email is already registered (case-insensitive)
   */

  async emailExists(email) {
    const user = await this.getUserByEmail(email);
    return !!user;
  }

  /**
   * Authenticate user for login
   */

  async AuthenticateUser(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    return user;
  }
}

export default new UserService();
