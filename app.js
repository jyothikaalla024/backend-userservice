const express = require("express");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 4000;

// ========== MIDDLEWARE ==========
// Enable CORS for all routes (allows your frontend to connect)
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'], // Your frontend URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// ========== MOCK DATABASE ==========
// In-memory storage (replace with real database later)
let users = [
  { id: 1, name: "Sai", email: "sai@example.com", password: "password123" },
  { id: 2, name: "DevOps User", email: "devops@example.com", password: "password123" }
];

let orders = [
  { id: 1, userId: 1, product: "Laptop", price: 999 },
  { id: 2, userId: 2, product: "Mouse", price: 29 },
  { id: 3, userId: 1, product: "Keyboard", price: 79 }
];

// ========== EXISTING ROUTES ==========
app.get("/users", (req, res) => {
  // Don't send passwords in response
  const safeUsers = users.map(({ password, ...user }) => user);
  res.json(safeUsers);
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// ========== NEW ROUTES FOR YOUR FRONTEND ==========

// REGISTER - POST /register
app.post("/register", (req, res) => {
  console.log("📝 Register request received:", req.body);
  
  const { name, email, password } = req.body;
  
  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password // In production, hash this!
  };
  
  users.push(newUser);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({
    message: "User registered successfully",
    user: userWithoutPassword
  });
});

// LOGIN - POST /login
app.post("/login", (req, res) => {
  console.log("🔐 Login request received:", req.body);
  
  const { email, password } = req.body;
  
  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  
  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  
  // Generate mock token (in production, use JWT)
  const token = "mock-jwt-token-" + Date.now();
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  res.json({
    message: "Login successful",
    token,
    user: userWithoutPassword
  });
});

// GET ORDERS - /orders
app.get("/orders", (req, res) => {
  console.log("📦 Orders request received");
  res.json(orders);
});

// GET ORDERS by user ID - /orders/user/:userId
app.get("/orders/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const userOrders = orders.filter(o => o.userId === userId);
  res.json(userOrders);
});

// ========== ROOT ROUTE (for testing) ==========
app.get("/", (req, res) => {
  res.json({
    name: "User Service API",
    version: "1.0.0",
    endpoints: {
      "GET /": "This information",
      "GET /health": "Health check",
      "GET /users": "Get all users",
      "POST /register": "Register new user",
      "POST /login": "Login user",
      "GET /orders": "Get all orders",
      "GET /orders/user/:userId": "Get orders by user ID"
    }
  });
});

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`✅ User Service running on port ${PORT}`);
  console.log(`🌐 CORS enabled for frontend origins`);
  console.log(`📚 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/users`);
  console.log(`   POST http://localhost:${PORT}/register`);
  console.log(`   POST http://localhost:${PORT}/login`);
  console.log(`   GET  http://localhost:${PORT}/orders`);
});
