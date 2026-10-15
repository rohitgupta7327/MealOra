/**
 * Mealora Security Suite: NoSQL Injection & Input Sanitization
 * In-place sanitization that strips malicious MongoDB query operators ($gt, $ne, $where, etc.)
 * and prototype pollution keys while maintaining full compatibility with Express 5 getters.
 */

function sanitizeInPlace(obj) {
  if (!obj || typeof obj !== "object") return;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === "object" && obj[i] !== null) {
        sanitizeInPlace(obj[i]);
      } else if (typeof obj[i] === "string") {
        obj[i] = obj[i].replace(/\0/g, "").trim();
      }
    }
    return;
  }

  for (const key of Object.keys(obj)) {
    // Delete MongoDB operator injection ($prefix) and prototype pollution keys
    if (
      key.startsWith("$") ||
      key === "__proto__" ||
      key === "constructor" ||
      key === "prototype"
    ) {
      delete obj[key];
      continue;
    }

    if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeInPlace(obj[key]);
    } else if (typeof obj[key] === "string") {
      obj[key] = obj[key].replace(/\0/g, "").trim();
    }
  }
}

export function sanitizeInput(req, res, next) {
  try {
    if (req.body && typeof req.body === "object") {
      sanitizeInPlace(req.body);
    }
    if (req.query && typeof req.query === "object") {
      sanitizeInPlace(req.query);
    }
    if (req.params && typeof req.params === "object") {
      sanitizeInPlace(req.params);
    }
  } catch (e) {
    // Graceful continuation
  }
  next();
}
