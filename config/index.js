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
  LOG_LEVEL
} = process.env;

export const port = PORT;
export const databaseUrl = DATABASE_URL;
export const jwtSecret = JWT_SECRET;
export const jwtExpiresIn = JWT_EXPIRES_IN;
export const senderEmail = SENDER_EMAIL;
export const emailPassword = EMAIL_PASSWORD;
export const bcryptRounds = BCRYPT_ROUNDS;
export const logLevel = LOG_LEVEL;
