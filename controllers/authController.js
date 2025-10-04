import userService from '../services/userService.js';
import { generateToken, sendEmail } from '../lib/utils.js';
import { toPublicUser } from '../serializers/userPublic.js';
import { port } from '../config/index.js';

const authController = {
  /**
   *  Register a user
   */

  register: async (req, res, next) => {
    try {
      // Request full name, email and password from the body
      const { fullName, email, password } = req.body;

      const user = await userService.createUser({ fullName, email, password });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user
        }
      });
    } catch (error) {
      if (error.code === 'EMAIL_EXISTS') {
        return res.status(400).json({
          success: false,
          error: 'Email already exists',
          code: 'EMAIL_EXISTS'
        });
      }
      next(error);
    }
  },

  /**
   *  User login
   */

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await userService.AuthenticateUser(email, password);
      const { token, expiresIn } = generateToken(user);

      const userPublic = toPublicUser(user);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userPublic,
          token,
          expiresIn
        }
      });
    } catch (error) {
      if (error.code === 'INVALID_CREDENTIALS') {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }
      next(error);
    }
  },

  /**
   * Forgot password
   */

  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;

      const { token } = await userService.generateResetToken(email);
      const resetUrl = `http://localhost:${port}/reset-password?token=${encodeURIComponent(token)}`;

      const resetEmail = await sendEmail(
        email,
        'Password Reset Instructions',
        `
          <p>We received a request to reset your password.</p>
          <p>Click the link below to set a new password:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you did not request this, you can safely ignore this email.</p>
        `
      );

      // Token and the reset email should remove in production
      return res.json({
        success: true,
        message: 'A reset link has been sent',
        data: resetEmail,
        token
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reset password
   */

  resetPassword: async (req, res, next) => {
    const { token, password } = req.body;

    try {
      await userService.resetPassword(token, password);
      return res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      if (error.code === 'INVALID_TOKEN') {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        });
      }
      next(error);
    }
  },

  getCurrentUser: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const user = await userService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      const userPublic = toPublicUser(user);

      res.json({
        success: true,
        message: 'User profile retrieved successfully',
        data: {
          user: userPublic
        }
      });
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const user = await userService.getUserById(userId);

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'User account is inactive',
          code: 'INACTIVE_USER'
        });
      }

      const { token, expiresIn } = generateToken(user);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token,
          expiresIn,
          user: toPublicUser(user)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { fullName, email } = req.body;

      const updatedUser = await userService.updateUser(userId, {
        fullName,
        email
      });

      const userPublic = toPublicUser(updatedUser);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: userPublic
        }
      });
    } catch (error) {
      if (error.code === 'EMAIL_EXISTS') {
        return res.status(400).json({
          success: false,
          error: 'Email already exists',
          code: 'EMAIL_EXISTS'
        });
      }
      next(error);
    }
  }
};

export default authController;
