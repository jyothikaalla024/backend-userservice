const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// CORS: allow frontend & Postman testing
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "https://amznpro.online",
      "http://localhost:3000", // if testing locally
      "https://www.getpostman.com", // for Postman (if needed)
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).send("User Service is healthy");
});

// ================== USERS ==================
// Get all users
app.get("/users", (req, res) => {
  db.pool.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ================== REGISTER ==================
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.pool.query(query, [name, email, password], (err, results) => {
    if (err) {
      console.error("Error registering user:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "User registered successfully", userId: results.insertId });
  });
});

// ================== LOGIN ==================
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const query = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.pool.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("Error logging in:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.json({ message: "Login successful", user: results[0] });
  });
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`User Service running on port ${PORT}`);
});
