// src/index.js
import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/auth.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Hello, world! 🌍');
});

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});

app.use('/api/auth', authRoutes);

// Global error handler (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
