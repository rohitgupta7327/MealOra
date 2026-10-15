import express from "express";
import {
  login,
  getMe,
  getStatus,
  getMembers,
  addMember,
  deleteMember,
} from "../controllers/authController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Public routes: Single Unified Login for both Admin and Staff (Protected against brute-force)
router.post("/login", authRateLimiter.middleware(), login);
router.get("/status", getStatus);

// Protected routes (require valid JWT)
router.get("/me", authenticateToken, getMe);

// Admin-Only Team Member Management (Only Admin can add/view/delete staff or admins)
router.get("/members", authenticateToken, requireAdmin, getMembers);
router.post("/members", authenticateToken, requireAdmin, authRateLimiter.middleware(), addMember);
router.post("/register", authenticateToken, requireAdmin, authRateLimiter.middleware(), addMember);
router.delete("/members/:id", authenticateToken, requireAdmin, deleteMember);

export default router;
