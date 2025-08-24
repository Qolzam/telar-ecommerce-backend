import prisma from '../lib/database.js';
import { comparePassword, hashPassword, generateRandomToken, hashToken } from '../lib/utils.js';
import { resetTokenTtlMinutes } from '../config/index.js';

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

  async updateUser(id, data) {
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id: parseInt(id, 10) }
        }
      });

      if (existingUser) {
        const error = new Error('Email already exists');
        error.code = 'EMAIL EXISTS';
        throw error;
      }

      if (data.password) {
        data.password = await hashPassword(data.password);
      }

      return prisma.user.update({
        where: { id: parseInt(id, 10) },
        data
      });
    }
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

  async generateResetToken(email) {
    const user = await prisma.user.findUnique({ where: { email } });

    const rawToken = generateRandomToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + Number(resetTokenTtlMinutes ?? 60) * 60 * 1000);

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: tokenHash,
          resetTokenExpiry: expiresAt
        }
      });
    }

    return { token: rawToken, expiresAt, emailExists: !!user };
  }

  async resetPassword(token, newPassword) {
    const tokenHash = hashToken(token);
    const now = new Date();

    const user = await prisma.user.findFirst({
      where: {
        resetToken: tokenHash,
        resetTokenExpiry: { gt: now }
      }
    });

    if (!user) {
      const err = new Error('Invalid or expired token');
      err.code = 'INVALID_TOKEN';
      err.status = 400;
      throw err;
    }

    const hashed = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return true;
  }
}

export default new UserService();
