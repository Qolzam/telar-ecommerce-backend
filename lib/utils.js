import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { jwtSecret, jwtExpiresIn } from '../config/index.js';

export const hashPassword = async password => {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password must be a non-empty string');
  }
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const generateToken = user => {
  const expiresIn = jwtExpiresIn;
  const token = jwt.sign(
    {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    },
    jwtSecret,
    {
      expiresIn
    }
  );
  return { token, expiresIn };
};
