import jwt from 'jsonwebtoken';

import { jwtSecret } from '../config/index.js';

export const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization ? req.headers.authorization.split(' ') : [];
    const token = authorization.length > 1 ? authorization[1] : null;

    if (token) {
      const payload = jwt.verify(token, jwtSecret);

      if (payload) {
        req.user = {
          id: payload.id,
          fullName: payload.fullName,
          email: payload.email,
          role: payload.role
        };
      } else {
        return res.status(401).json({
          status: false,
          message: 'Unauthorized',
          code: 'UNAUTHORIZED'
        });
      }
    } else {
      return res.status(400).json({
        status: false,
        message: 'Token is required',
        code: 'BAD_REQUEST'
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};
