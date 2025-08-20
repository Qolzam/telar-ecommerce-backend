import crypto from 'crypto';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

import {
  senderEmail,
  emailPassword,
  jwtSecret,
  jwtExpiresIn,
  smtpHost,
  smtpPort,
  smtpSecure
} from '../config/index.js';

import logger from './logger.js';

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

export const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

export const hashToken = token => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

function createTransport() {
  const env = process.env.NODE_ENV || 'development';

  if (env !== 'production') {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: { user: senderEmail, pass: emailPassword }
  });
}

export const sendEmail = async (to, subject, html) => {
  const transporter = createTransport();

  try {
    const info = await transporter.sendMail({
      from: senderEmail || 'no-reply@example.com',
      to,
      subject,
      html
    });

    const meta = { to, subject };
    if (info && info.messageId) {
      meta.messageId = info.messageId;
    }

    logger.info('Email dispatched', meta);
    return info;
  } catch (err) {
    logger.error('Email dispatch failed', { to, subject, error: err.message });
    throw err;
  }
};
