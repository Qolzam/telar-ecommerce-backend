import userService from '../services/userService';

const userController = {
  getUserProfile: async (req, res, next) => {
    try {
      const user = await userService.getUserById(req.user.id);
      res.json({
        status: true,
        message: 'Profile fetched successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default userController;
