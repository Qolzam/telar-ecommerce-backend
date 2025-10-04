import jwt from 'jsonwebtoken';

import { jwtSecret } from '../config/index.js';

export const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization ? req.headers.authorization.split(' ') : [];
    const token = authorization.length > 1 ? authorization[1] : null;

    if (!token) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }

    jwt.verify(token, jwtSecret, (err, payload) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            status: false,
            message: 'Invalid or expired token',
            code: 'TOKEN_EXPIRED'
          });
        } else {
          return res.status(401).json({
            status: false,
            message: 'Invalid token',
            code: 'UNAUTHORIZED'
          });
        }
      }

      req.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role
      };

      next();
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

export const requireRole = role => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        status: false,
        message: 'Insufficient permissions',
        code: 'FORBIDDEN'
      });
    }
    next();
  };
};

export const optionalAuth = (req, res, next) => {
  const authorization = req.headers.authorization ? req.headers.authorization.split(' ') : [];
  const token = authorization.length > 1 ? authorization[1] : null;

  if (token) {
    jwt.verify(token, jwtSecret, (err, payload) => {
      if (!err && payload) {
        req.user = {
          id: payload.id,
          email: payload.email,
          role: payload.role
        };
      }
    });
  }
  next();
};
