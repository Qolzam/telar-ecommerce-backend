const authController = {
  register: async (req, res) => {
    try {
      // Request full name, email and password from the body
      const { fullName, email, password } = req.body;

      // Remove this validation after use the password variable. The password validation implement in auth validation
      if (!password || password.length < 8) {
        return res.status(400).json({
          status: false,
          error: 'Validation error: Password is required and must be at least 8 characters'
        });
      }

      res.status(201).json({
        status: true,
        message: 'User registration received',
        user: {
          fullName,
          email
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export default authController;
