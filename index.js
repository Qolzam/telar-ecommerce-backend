import express from 'express';
import cors from 'cors';

import healthRoutes from './routes/health.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 8080;

// middleware to handle CORS and JSON requests
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, world! 🌍');
});

// Example route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});

app.use('/api', healthRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
