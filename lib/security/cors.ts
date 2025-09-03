/**
 * CORS Security Configuration
 * Implements allowlist-based CORS with proper Vary header
 * Prevents cache poisoning and minimizes exposure
 */

/**
 * Get allowed origins from environment variable
 * Defaults to localhost for development if not configured
 */
export function getAllowedOrigins(): string[] {
  const env = process.env.CORS_ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_CORS_ALLOWED_ORIGINS;
  
  if (!env) {
    // Development defaults
    if (process.env.NODE_ENV === 'development') {
      return [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
      ];
    }
    // Production should have explicit origins
    return [];
  }
  
  // Parse comma-separated list
  return env.split(',').map(origin => origin.trim()).filter(Boolean);
}

/**
 * Check if an origin is allowed based on allowlist
 * @param origin The origin to check
 * @returns true if origin is allowed, false otherwise
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  const allowedOrigins = getAllowedOrigins();
  
  // Check exact match
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  
  // Check wildcard subdomain patterns (e.g., "*.vercel.app")
  for (const allowed of allowedOrigins) {
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      if (origin.endsWith(domain) || origin.endsWith(`:${domain}`)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Get CORS headers for SSE/streaming responses
 * Implements secure CORS with Vary header for proper caching
 * @param origin The request origin
 * @returns Headers object with appropriate CORS settings
 */
export function getCorsHeaders(origin: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Content-Type-Options': 'nosniff',
    // Extended Vary header for comprehensive cache control
    'Vary': 'Origin, Accept-Encoding, Accept, User-Agent',
  };
  
  // Only set CORS headers if origin is allowed
  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin';
    headers['Access-Control-Allow-Credentials'] = 'true';
    headers['Access-Control-Max-Age'] = '86400'; // 24 hours
    headers['Access-Control-Expose-Headers'] = 'X-RateLimit-Remaining, X-RateLimit-Limit, X-RateLimit-Reset';
  }
  
  return headers;
}

/**
 * Get CORS headers for regular JSON responses
 * @param origin The request origin
 * @returns Headers object with appropriate CORS settings
 */
export function getCorsHeadersJson(origin: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Extended Vary header for comprehensive cache control
    'Vary': 'Origin, Accept-Encoding, Accept, User-Agent, Authorization',
  };
  
  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin';
    headers['Access-Control-Allow-Credentials'] = 'true';
    headers['Access-Control-Max-Age'] = '86400';
    headers['Access-Control-Expose-Headers'] = 'X-RateLimit-Remaining, X-RateLimit-Limit, X-RateLimit-Reset, X-Request-ID';
  }
  
  return headers;
}

/**
 * Handle preflight OPTIONS requests
 * @param origin The request origin
 * @returns Response for OPTIONS request
 */
export function handleCorsPreflightJson(origin: string | null): Response {
  const headers = getCorsHeadersJson(origin);
  return new Response(null, { status: 204, headers });
}

/**
 * Handle preflight OPTIONS requests for SSE
 * @param origin The request origin
 * @returns Response for OPTIONS request
 */
export function handleCorsPreflight(origin: string | null): Response {
  const headers: HeadersInit = {
    'Vary': 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };
  
  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin';
    headers['Access-Control-Allow-Credentials'] = 'true';
    headers['Access-Control-Max-Age'] = '86400';
    headers['Access-Control-Expose-Headers'] = 'X-RateLimit-Remaining, X-RateLimit-Limit, X-RateLimit-Reset, X-Request-ID';
  }
  
  return new Response(null, { status: 204, headers });
}

/**
 * Middleware to check CORS before processing request
 * @param origin The request origin
 * @throws Error if origin is not allowed
 */
export function validateCors(origin: string | null): void {
  if (process.env.NODE_ENV === 'production' && !isOriginAllowed(origin)) {
    throw new Error('CORS: Origin not allowed');
  }
}