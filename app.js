cat > app.js << 'EOF'
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to database (mock)
db.connect();

// Middleware
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// In-memory data store
let users = [
  { id: 1, name: "Sai", email: "sai@example.com", password: "password1234" },
  { id: 2, name: "DevOps User", email: "devops@example.com", password: "password123" }
];

let orders = [
  { id: 1, userId: 1, product: "Laptop", price: 999 },
  { id: 2, userId: 2, product: "Mouse", price: 29 }
];

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "User Service API",
    database: "Connected",
    users: users.length,
    endpoints: {
      "GET /health": "Health check",
      "GET /users": "Get all users",
      "POST /register": "Register new user",
      "POST /login": "Login user",
      "GET /orders": "Get all orders"
    }
  });
});

app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    database: "connected",
    users: users.length 
  });
});

app.get("/users", (req, res) => {
  // Don't send passwords
  const safeUsers = users.map(({ password, ...user }) => user);
  res.json(safeUsers);
});

app.post("/register", (req, res) => {
  console.log("📝 Register request:", req.body);
  
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }
  
  // Check if user exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: "User already exists" });
  }
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password
  };
  
  users.push(newUser);
  
  // Return without password
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({
    message: "User registered successfully",
    user: userWithoutPassword
  });
});

app.post("/login", (req, res) => {
  console.log("🔐 Login request:", req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  
  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  
  // Generate token
  const token = "mock-jwt-token-" + Date.now();
  
  // Return without password
  const { password: _, ...userWithoutPassword } = user;
  res.json({
    message: "Login successful",
    token,
    user: userWithoutPassword
  });
});

app.get("/orders", (req, res) => {
  console.log("📦 Orders request received");
  res.json(orders);
});

app.listen(PORT, () => {
  console.log(`✅ User Service running on port ${PORT}`);
  console.log(`📚 Database: Mock DB connected`);
  console.log(`🌐 CORS enabled for frontend`);
  console.log(`📝 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/users`);
  console.log(`   POST http://localhost:${PORT}/register`);
  console.log(`   POST http://localhost:${PORT}/login`);
  console.log(`   GET  http://localhost:${PORT}/orders`);
});
EOF
