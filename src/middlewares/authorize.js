/**
 * Authorization Middleware
 * Handles role-based access control
 */

/**
 * Middleware to check if user has required role(s)
 * @param {string|string[]} roles - Required role(s) for access
 */
export const authorize = roles => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'UNAUTHORIZED'
        });
      }

      const userRole = req.user.role;
      const requiredRoles = Array.isArray(roles) ? roles : [roles];

      if (!requiredRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          code: 'FORBIDDEN'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = authorize('ADMIN');

/**
 * Middleware to check if user is regular user
 */
export const requireUser = authorize('USER');

/**
 * Middleware to allow both admin and user roles
 */
export const requireAuthenticated = authorize(['ADMIN', 'USER']);
