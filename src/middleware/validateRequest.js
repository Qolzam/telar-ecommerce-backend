// src/middleware/validateRequest.js
export function validateRequest(req, res, next) {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "Validation error: All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Validation error: Invalid email format" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Validation error: Password must be at least 8 characters" });
  }

  next();
}
