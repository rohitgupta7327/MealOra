import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "mealora_super_secret_jwt_key_2026_luxury_dining";

/**
 * Middleware: Verifies incoming JWT in Authorization header
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "AUTH_REQUIRED",
      message: "Access denied. Authentication token missing. Please sign in.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "TOKEN_EXPIRED",
        expired: true,
        message: "Your session has expired. Please sign in again.",
      });
    }
    return res.status(403).json({
      success: false,
      error: "INVALID_TOKEN",
      message: "Invalid or forged authentication token. Access denied.",
    });
  }
}

/**
 * Middleware: Enforces that the authenticated user has the 'admin' role
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "ADMIN_REQUIRED",
      message: "Forbidden: Admin privileges are required for this action.",
    });
  }
  next();
}

/**
 * Helper: Sign a JWT for a user payload
 */
export function signToken(user) {
  const payload = {
    id: user._id ? user._id.toString() : user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}
