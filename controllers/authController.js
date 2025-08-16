import userService, { generateResetToken } from '../services/userService.js';
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
        status: true,
        message: 'User registered successfully',
        data: {
          user
        }
      });
    } catch (error) {
      if (error.code === 'EMAIL_EXISTS') {
        return res.status(400).json({
          status: false,
          message: 'Email already exists',
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
        status: true,
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
          status: false,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }
      next(error);
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;

      const { token } = await generateResetToken(email);
      const resetUrl = `http://localhost:${port}/reset-password?token=${encodeURIComponent(token)}`;

      await sendEmail(
        email,
        'Password Reset Instructions',
        `
          <p>We received a request to reset your password.</p>
          <p>Click the link below to set a new password:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you did not request this, you can safely ignore this email.</p>
        `
      );

      return res.json({
        status: true,
        message: 'If that email exists, a reset link has been sent'
      });
    } catch (error) {
      next(error);
    }
  }
};

export default authController;
