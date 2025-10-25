/**
 * Enhanced API Middleware
 * Combines authentication, authorization, validation, error handling, and rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { JWTPayload } from '@/lib/auth/jwt';
import { withAuth, AuthMiddlewareOptions } from '@/lib/auth/api-middleware';
import { withErrorHandler, ResponseHelper } from './error-handler';
import { validateRequestBody, validateQueryParams, validatePathParams } from './validation';

export interface EnhancedMiddlewareOptions<TBody = any, TQuery = any, TParams = any> {
  // Authentication options
  auth?: AuthMiddlewareOptions | false;
  
  // Validation schemas
  validation?: {
    body?: ZodSchema<TBody>;
    query?: ZodSchema<TQuery>;
    params?: ZodSchema<TParams>;
  };
  
  // Rate limiting
  rateLimit?: {
    requests?: number;
    windowMs?: number;
    identifier?: (request: NextRequest) => string;
  };
  
  // Caching
  cache?: {
    ttl?: number; // Time to live in seconds
    key?: (request: NextRequest, user?: JWTPayload | null) => string;
  };
}

export interface ValidatedRequest<TBody = any, TQuery = any, TParams = any> {
  body?: TBody;
  query?: TQuery;
  params?: TParams;
}

/**
 * Rate limiter implementation (in-memory, use Redis in production)
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  check(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests
    const validRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
    
    if (validRequests.length >= limit) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
}

const rateLimiter = new RateLimiter();

/**
 * Simple cache implementation (in-memory, use Redis in production)
 */
class SimpleCache {
  private cache: Map<string, { data: any; expires: number }> = new Map();
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item || item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }
  
  set(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + (ttl * 1000),
    });
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

const cache = new SimpleCache();

/**
 * Enhanced middleware wrapper that combines all functionality
 */
export function createEnhancedHandler<
  TBody = any,
  TQuery = any,
  TParams = any,
  TArgs extends any[] = []
>(
  handler: (
    request: NextRequest,
    user: JWTPayload | null,
    validated: ValidatedRequest<TBody, TQuery, TParams>,
    ...args: TArgs
  ) => Promise<NextResponse>,
  options: EnhancedMiddlewareOptions<TBody, TQuery, TParams> = {}
) {
  return withErrorHandler(async (
    request: NextRequest,
    context?: { params?: Record<string, string | string[]> },
    ...args: TArgs
  ): Promise<NextResponse> => {
    // 1. Rate limiting
    if (options.rateLimit && process.env.NODE_ENV !== 'development') {
      const { requests = 100, windowMs = 15 * 60 * 1000, identifier } = options.rateLimit;
      const id = identifier ? identifier(request) : 
        request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        'unknown';
      
      if (!rateLimiter.check(id, requests, windowMs)) {
        return ResponseHelper.tooManyRequests();
      }
    }
    
    // 2. Authentication
    let user: JWTPayload | null = null;
    if (options.auth !== false) {
      const authResult = await withAuth(request, options.auth || {});
      if (authResult.error) {
        return authResult.error;
      }
      user = authResult.user;
    }
    
    // 3. Check cache
    if (options.cache && request.method === 'GET') {
      const cacheKey = options.cache.key ? 
        options.cache.key(request, user) : 
        `${request.url}${user?.userId || 'anonymous'}`;
      
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return ResponseHelper.success(cachedData, 'Cache hit');
      }
    }
    
    // 4. Validation
    const validated: ValidatedRequest<TBody, TQuery, TParams> = {};
    
    if (options.validation?.body) {
      validated.body = await validateRequestBody(request, options.validation.body);
    }
    
    if (options.validation?.query) {
      validated.query = validateQueryParams(request, options.validation.query);
    }
    
    if (options.validation?.params && context?.params) {
      validated.params = validatePathParams(context.params, options.validation.params);
    }
    
    // 5. Execute handler
    const response = await handler(request, user, validated, ...args);
    
    // 6. Cache response if configured
    if (options.cache && request.method === 'GET' && response.status === 200) {
      const cacheKey = options.cache.key ? 
        options.cache.key(request, user) : 
        `${request.url}${user?.userId || 'anonymous'}`;
      
      try {
        const responseClone = response.clone();
        const data = await responseClone.json();
        if (data.success) {
          cache.set(cacheKey, data.data, options.cache.ttl || 300); // 5 minutes default
        }
      } catch (error) {
        // Ignore cache errors
        console.warn('Failed to cache response:', error);
      }
    }
    
    return response;
  });
}

/**
 * Shorthand for authenticated handlers
 */
export function createAuthHandler<
  TBody = any,
  TQuery = any,
  TParams = any
>(
  handler: (
    request: NextRequest,
    user: JWTPayload,
    validated: ValidatedRequest<TBody, TQuery, TParams>
  ) => Promise<NextResponse>,
  options: Omit<EnhancedMiddlewareOptions<TBody, TQuery, TParams>, 'auth'> = {}
) {
  return createEnhancedHandler(
    async (request, user, validated) => {
      if (!user) {
        return ResponseHelper.unauthorized();
      }
      return handler(request, user, validated);
    },
    { ...options, auth: {} }
  );
}

/**
 * Shorthand for admin handlers
 */
export function createAdminHandler<
  TBody = any,
  TQuery = any,
  TParams = any
>(
  handler: (
    request: NextRequest,
    user: JWTPayload,
    validated: ValidatedRequest<TBody, TQuery, TParams>
  ) => Promise<NextResponse>,
  options: Omit<EnhancedMiddlewareOptions<TBody, TQuery, TParams>, 'auth'> = {}
) {
  return createEnhancedHandler(
    async (request, user, validated) => {
      if (!user) {
        return ResponseHelper.unauthorized();
      }
      return handler(request, user, validated);
    },
    { ...options, auth: { requireAdmin: true } }
  );
}

/**
 * Shorthand for seller handlers
 */
export function createSellerHandler<
  TBody = any,
  TQuery = any,
  TParams = any
>(
  handler: (
    request: NextRequest,
    user: JWTPayload,
    validated: ValidatedRequest<TBody, TQuery, TParams>
  ) => Promise<NextResponse>,
  options: Omit<EnhancedMiddlewareOptions<TBody, TQuery, TParams>, 'auth'> = {}
) {
  return createEnhancedHandler(
    async (request, user, validated) => {
      if (!user) {
        return ResponseHelper.unauthorized();
      }
      return handler(request, user, validated);
    },
    { ...options, auth: { requireSeller: true } }
  );
}

/**
 * Shorthand for public handlers (no auth required)
 */
export function createPublicHandler<
  TBody = any,
  TQuery = any,
  TParams = any
>(
  handler: (
    request: NextRequest,
    user: JWTPayload | null,
    validated: ValidatedRequest<TBody, TQuery, TParams>
  ) => Promise<NextResponse>,
  options: Omit<EnhancedMiddlewareOptions<TBody, TQuery, TParams>, 'auth'> = {}
) {
  return createEnhancedHandler(handler, { ...options, auth: false });
}

/**
 * Utility to invalidate cache entries
 */
export function invalidateCache(pattern?: string): void {
  if (pattern) {
    // In a real implementation, you'd use Redis pattern matching
    // For now, just clear all cache
    cache.clear();
  } else {
    cache.clear();
  }
}

/**
 * Utility to get cache stats (for monitoring)
 */
export function getCacheStats(): { size: number } {
  return {
    size: (cache as any).cache.size,
  };
}
