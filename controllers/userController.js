import userService from '../services/userService';

const userController = {
  getProfile: async (req, res, next) => {
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
  },

  updateProfile: async (req, res, next) => {
    try {
      const { fullName, email, password } = req.body;
      const updatedUser = await userService.updateUser(req.user.id, { fullName, email, password });
      res.json({
        status: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default userController;
