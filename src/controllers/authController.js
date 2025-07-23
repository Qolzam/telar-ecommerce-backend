// src/controllers/authController.js
export function register(req, res) {
  try {
    const { fullName, email, password } = req.body;

    // Simulate logging user registration (no DB yet)
    console.log("User Registration Received:", { fullName, email, password });

    return res.status(201).json({
      message: "User registration received",
      user: {
        fullName,
        email
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
