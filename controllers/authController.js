const authController = {
  register: async (req, res, next) => {
    try {
      // Request full name, email and password from the body
      const { fullName, email, password } = req.body;

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
