import jwt from 'jsonwebtoken';

import { jwtSecret, jwtExpiresIn } from '../config/keys.js';

export const generateToken = user => {
  const token = jwt.sign(
    {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    },
    jwtSecret,
    {
      expiresIn: jwtExpiresIn
    }
  );
  return token;
};
