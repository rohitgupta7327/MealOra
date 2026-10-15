/**
 * Mealora Security Suite: OWASP HTTP Security Headers
 * Applies defense-in-depth HTTP headers against XSS, clickjacking, MIME sniffing, and fingerprinting.
 */

export function securityHeaders(req, res, next) {
  // Prevent browsers from MIME-sniffing the response
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking by denying framing in iframes
  res.setHeader("X-Frame-Options", "DENY");

  // Legacy XSS filter activation in supported browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Protect sensitive URLs and paths from being leaked in Referer header
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Restrict device permissions
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  // Isolates browsing context against Spectre-style attacks
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

  // Remove Express fingerprint header
  res.removeHeader("X-Powered-By");

  next();
}
