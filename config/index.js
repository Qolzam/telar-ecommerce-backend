import dotenv from 'dotenv';

dotenv.config();

const {
  PORT,
  JWT_SECRET,
  DATABASE_URL,
  JWT_EXPIRES_IN,
  BCRYPT_ROUNDS,
  SENDER_EMAIL,
  EMAIL_PASSWORD,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  MAIL_FROM,
  LOG_LEVEL,
  RESET_TOKEN_TTL_MINUTES
} = process.env;

export const port = PORT;
export const databaseUrl = DATABASE_URL;
export const jwtSecret = JWT_SECRET;
export const jwtExpiresIn = JWT_EXPIRES_IN;
export const senderEmail = SENDER_EMAIL;
export const emailPassword = EMAIL_PASSWORD;
export const smtpHost = SMTP_HOST;
export const smtpPort = SMTP_PORT;
export const smtpSecure = SMTP_SECURE;
export const mainFrom = MAIL_FROM;
export const bcryptRounds = BCRYPT_ROUNDS;
export const logLevel = LOG_LEVEL;
export const resetTokenTtlMinutes = RESET_TOKEN_TTL_MINUTES;
