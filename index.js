// index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// middleware to handle CORS and JSON requests
const cors = require('cors');
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello, world! 🌍');
});

// Example route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
