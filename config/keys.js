import dotenv from 'dotenv';

dotenv.config();

const { PORT, JWT_SECRET, DATABASE_URL } = process.env;

export const port = PORT;
export const databaseUrl = DATABASE_URL;
export const jwtSecret = JWT_SECRET;
