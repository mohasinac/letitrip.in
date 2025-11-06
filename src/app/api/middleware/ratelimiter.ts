import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting (consider using Redis in production)
const rateLimitStore: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 5 * 60 * 1000);

interface RateLimitConfig {
  maxRequests?: number;
  windowMs?: number;
  message?: string;
}

export function rateLimit(config: RateLimitConfig = {}) {
  const {
    maxRequests = 200, // Support 200 concurrent users
    windowMs = 60 * 1000, // 1 minute window
    message = 'Too many requests, please try again later.',
  } = config;

  return async (req: NextRequest) => {
    // Get client identifier (IP or session)
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
    
    const key = `rate-limit:${ip}`;
    const now = Date.now();
    
    // Initialize or get existing rate limit data
    if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
      rateLimitStore[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return null; // Allow request
    }
    
    // Increment counter
    rateLimitStore[key].count++;
    
    // Check if limit exceeded
    if (rateLimitStore[key].count > maxRequests) {
      return NextResponse.json(
        { 
          error: message,
          retryAfter: Math.ceil((rateLimitStore[key].resetTime - now) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitStore[key].resetTime - now) / 1000)),
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitStore[key].resetTime),
          }
        }
      );
    }
    
    // Add rate limit headers
    const remaining = maxRequests - rateLimitStore[key].count;
    return {
      headers: {
        'X-RateLimit-Limit': String(maxRequests),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(rateLimitStore[key].resetTime),
      }
    };
  };
}

// Middleware wrapper for API routes
export async function withRateLimit(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  config?: RateLimitConfig
) {
  const rateLimitResult = await rateLimit(config)(req);
  
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult; // Rate limit exceeded
  }
  
  const response = await handler(req);
  
  // Add rate limit headers to response
  if (rateLimitResult?.headers) {
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  
  return response;
}
