/**
 * Mealora Security Suite: IP-based Sliding-Window Rate Limiter
 * Mitigates brute-force attacks, credential stuffing, and DoS spamming.
 */

class SlidingWindowRateLimiter {
  constructor(windowMs, maxRequests, message) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message || "Too many requests. Please try again later.";
    this.requests = new Map(); // ip -> Array of timestamps

    // Periodically prune stale IP records every 5 minutes to prevent memory leaks
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  cleanup() {
    const now = Date.now();
    for (const [ip, timestamps] of this.requests.entries()) {
      const valid = timestamps.filter((t) => now - t < this.windowMs);
      if (valid.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, valid);
      }
    }
  }

  middleware() {
    return (req, res, next) => {
      // Extract client IP address (taking proxy headers into account if set)
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "127.0.0.1";

      const now = Date.now();
      const clientTimestamps = this.requests.get(ip) || [];

      // Filter timestamps within current sliding window
      const validTimestamps = clientTimestamps.filter((t) => now - t < this.windowMs);

      if (validTimestamps.length >= this.maxRequests) {
        const oldest = validTimestamps[0];
        const retryAfterSec = Math.ceil((this.windowMs - (now - oldest)) / 1000);

        res.setHeader("Retry-After", retryAfterSec);
        return res.status(429).json({
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: this.message,
          retryAfterSeconds: retryAfterSec,
        });
      }

      validTimestamps.push(now);
      this.requests.set(ip, validTimestamps);
      next();
    };
  }

  // Reset counters upon successful legitimate login
  reset(ip) {
    if (ip) this.requests.delete(ip);
  }
}

// Strict limiter for authentication attempts (10 attempts per 15 minutes)
export const authRateLimiter = new SlidingWindowRateLimiter(
  15 * 60 * 1000,
  10,
  "Too many authentication attempts from this IP address. For your security, access is temporarily locked. Please try again in 15 minutes."
);

// General API request limiter (300 requests per 1 minute)
export const generalApiLimiter = new SlidingWindowRateLimiter(
  60 * 1000,
  300,
  "Rate limit exceeded. Too many requests to the restaurant terminal server."
);
