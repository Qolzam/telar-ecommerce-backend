import prisma from '../lib/database';
import { hashPassword } from '../lib/utils';

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

  async createUser(fullName, email, password) {
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.creat({
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
}

export default new UserService();
