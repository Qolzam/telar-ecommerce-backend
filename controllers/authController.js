import userService from '../services/userService.js';
import { generateToken } from '../lib/utils.js';
import { jwtExpiresIn } from '../config/keys.js';

const authController = {
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

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await userService.AuthenticateUser(email, password);
      const token = generateToken(user);

      // eslint-disable-next-line no-unused-vars
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        status: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token,
          expiresIn: jwtExpiresIn
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
  }
};

export default authController;
