import userService from '../services/userService.js';

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
  }
};

export default authController;
