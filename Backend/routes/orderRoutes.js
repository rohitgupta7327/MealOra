import express from "express";
import {
  calculateBill,
  createOrder,
  getOrders,
  updateOrderStatus,
  updatePayment,
} from "../controllers/orderController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * SECURITY GUARD: All order endpoints require valid JWT authentication.
 * Unauthorized requests receive 401 Unauthorized.
 */
router.use(authenticateToken);

// Server-side billing calculation (validates items, prices, discounts, taxes, and final total)
router.post("/calculate", calculateBill);

// Order creation & workflow
router.post("/", createOrder);
router.get("/", getOrders);
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id/payment", updatePayment);

export default router;
