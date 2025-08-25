import { toPublicUser } from '../serializers/userPublic.js';
import userService from '../services/userService.js';

const userController = {
  getProfile: async (req, res, next) => {
    try {
      const user = await userService.getUserById(req.user.id);
      const updatedUser = toPublicUser(user);
      res.json({
        status: true,
        message: 'Profile fetched successfully',
        data: { updatedUser }
      });
    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const { fullName, email, password } = req.body;
      const user = await userService.updateUser(req.user.id, { fullName, email, password });
      const updatedUser = toPublicUser(user);
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
