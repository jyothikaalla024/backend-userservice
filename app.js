const API_BASE_URL = "http://100.50.14.89:4000";
const express = require("express");
const cors = require("cors");
const db = require("./db_mysql"); // MySQL connection pool

const app = express();
const PORT = process.env.PORT || 4000;

// ========== MIDDLEWARE ==========
// Enable CORS with your frontend origins (including live domain)
app.use(cors({
    origin: [
        'https://amznpro.online',               // your live frontend
        'http://localhost:3000',                 // local React dev (if any)
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5500',                 // Live Server
        'http://localhost:5500',
        'http://127.0.0.1:8080',                 // http-server
        'http://localhost:8080'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Explicitly handle preflight requests for all routes
app.options('*', cors());

app.use(express.json()); // Parse JSON bodies

// ========== DATABASE CONNECTION TEST ==========
(async () => {
    try {
        const [rows] = await db.query('SELECT 1');
        console.log('✅ MySQL Database connected');
    } catch (err) {
        console.error('❌ MySQL connection failed:', err.message);
    }
})();

// ========== ROUTES ==========

// Root endpoint – API info
app.get("/", (req, res) => {
    res.json({
        message: "User Service API",
        database: "MySQL (RDS)",
        endpoints: {
            "GET /health": "Health check",
            "GET /users": "Get all users",
            "POST /register": "Register new user",
            "POST /login": "Login user",
            "GET /orders": "Get all orders"
        }
    });
});

// Health check
app.get("/health", async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ status: "healthy", database: "connected" });
    } catch (err) {
        res.status(500).json({ status: "unhealthy", database: "disconnected" });
    }
});

// Get all users (without passwords)
app.get("/users", async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, email FROM users');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

// Register new user
app.post("/register", async (req, res) => {
    console.log("📝 Register request:", req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields required" });
    }

    try {
        // Check if user already exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Insert new user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, password]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: { id: result.insertId, name, email }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

// Login user
app.post("/login", async (req, res) => {
    console.log("🔐 Login request:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    try {
        const [users] = await db.query(
            'SELECT id, name, email FROM users WHERE email = ? AND password = ?',
            [email, password]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = users[0];
        const token = "mock-jwt-token-" + Date.now();

        res.json({
            message: "Login successful",
            token,
            user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

// Get orders (from orders table if exists, else mock)
app.get("/orders", async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM orders');
        res.json(rows);
    } catch (err) {
        // If table doesn't exist, return mock data
        console.log("Orders table not found, returning mock data");
        res.json([
            { id: 1, userId: 1, product: "Laptop", price: 999 },
            { id: 2, userId: 2, product: "Mouse", price: 29 }
        ]);
    }
});

// ========== START SERVER ==========
app.listen(PORT, () => {
    console.log(`✅ User Service running on port ${PORT}`);
    console.log(`📚 Using MySQL database: database-1`);
    console.log(`🌐 CORS enabled for: ${JSON.stringify([
        'https://amznpro.online',
        'localhost:3000',
        '127.0.0.1:3000',
        '127.0.0.1:5500',
        'localhost:5500',
        '127.0.0.1:8080',
        'localhost:8080'
    ])}`);
});
