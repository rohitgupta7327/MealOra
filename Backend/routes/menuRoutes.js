import express from "express";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  toggleStock,
  deleteMenuItem,
} from "../controllers/menuController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { uploadDishImage } from "../middleware/upload.js";

const router = express.Router();

// Public / Authenticated read: Get all menu items
router.get("/", getMenuItems);

// Admin-Only actions: Create, update, toggle stock, and delete dishes
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  uploadDishImage.single("image"),
  createMenuItem
);

router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  uploadDishImage.single("image"),
  updateMenuItem
);

router.patch("/:id/stock", authenticateToken, requireAdmin, toggleStock);

router.delete("/:id", authenticateToken, requireAdmin, deleteMenuItem);

export default router;
