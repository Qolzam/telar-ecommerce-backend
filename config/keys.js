import dotenv from 'dotenv';

dotenv.config();

const { PORT, JWT_SECRET, DATABASE_URL, JWT_EXPIRES_IN } = process.env;

export const port = PORT;
export const databaseUrl = DATABASE_URL;
export const jwtSecret = JWT_SECRET;
export const jwtExpiresIn = JWT_EXPIRES_IN;
