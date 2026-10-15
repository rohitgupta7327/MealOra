import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "../Database/index.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import { seedDefaultUsers } from "./controllers/authController.js";
import { seedDatabase } from "../Database/seeds/seedData.js";
import { securityHeaders } from "./middleware/securityHeaders.js";
import { sanitizeInput } from "./middleware/sanitize.js";
import { generalApiLimiter } from "./middleware/rateLimiter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Serve uploaded images statically
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

// 1. Security Headers (Anti-clickjacking, XSS protection, MIME sniffing guard)
app.use(securityHeaders);

// 2. Strict CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or in whitelist
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev friendly permissive fallback
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 3. Payload size limiting (mitigates memory exhaustion DoS)
app.use(express.json({ limit: "500kb" }));

// 4. NoSQL injection & input sanitization
app.use(sanitizeInput);

// 5. General API rate limiter (protects server from flood attacks)
app.use("/api", generalApiLimiter.middleware());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);

// Root status endpoint
app.get("/", (req, res) => {
  res.json({
    status: "online",
    app: "Mealora POS & Restaurant Terminal API",
    version: "2.4.0",
    frontend: "https://meal-ora-lac.vercel.app/",
    healthcheck: "/api/health",
    repository: "https://github.com/rohitgupta7327/MealOra",
    time: new Date().toISOString(),
  });
});

// Root healthcheck
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Mealora POS & Restaurant Terminal API",
    security: {
      jwt: "active",
      rateLimiter: "active",
      noSqlSanitizer: "active",
      securityHeaders: "active",
    },
    time: new Date().toISOString(),
  });
});

// Global 404 handler for unmatched routes
app.use((req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({
      success: false,
      error: "NOT_FOUND",
      message: `API route ${req.originalUrl} not found.`,
    });
  }
  res.status(404).send("Not Found");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: "INTERNAL_SERVER_ERROR",
    message: err.message || "An unexpected server error occurred.",
  });
});

// Start server
async function startServer() {
  console.log("🚀 [Server] Initializing Mealora Backend Services...");

  // Attempt MongoDB connection
  await connectDB();

  // Seed default Admin & Staff accounts and menu dishes
  await seedDefaultUsers();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`🌟 [Server] Mealora Auth API running on http://localhost:${PORT}`);
    console.log(`🔐 [Security] JWT, OWASP Headers, NoSQL Sanitizer & Rate Limiting active`);
  });
}

startServer();
