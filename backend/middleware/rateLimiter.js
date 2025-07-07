// Simple in-memory rate limiter
const requestCounts = new Map();
const REQUEST_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per minute per IP

export function rateLimiter(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress || "unknown";
  const now = Date.now();

  // Clean up old entries
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.windowStart > REQUEST_WINDOW_MS) {
      requestCounts.delete(ip);
    }
  }

  // Get or create client data
  let clientData = requestCounts.get(clientIP);
  if (!clientData || now - clientData.windowStart > REQUEST_WINDOW_MS) {
    clientData = {
      count: 0,
      windowStart: now,
    };
    requestCounts.set(clientIP, clientData);
  }

  // Check rate limit
  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: "Too many requests. Please try again later.",
      retryAfter: Math.ceil(
        (REQUEST_WINDOW_MS - (now - clientData.windowStart)) / 1000
      ),
    });
  }

  // Increment counter
  clientData.count++;

  // Add rate limit headers
  res.set({
    "X-RateLimit-Limit": MAX_REQUESTS_PER_WINDOW,
    "X-RateLimit-Remaining": Math.max(
      0,
      MAX_REQUESTS_PER_WINDOW - clientData.count
    ),
    "X-RateLimit-Reset": new Date(
      clientData.windowStart + REQUEST_WINDOW_MS
    ).toISOString(),
  });

  next();
}
