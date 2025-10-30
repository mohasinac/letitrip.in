/**
 * API Middleware
 * Common middleware utilities for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders, handleCorsPreFlight } from './cors';
import { errorResponse, handleApiError, unauthorizedResponse } from './response';
import { HTTP_STATUS } from './constants';

/**
 * API Handler Type
 */
export type ApiHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse>;

/**
 * Middleware Type
 */
export type Middleware = (
  request: NextRequest,
  next: () => Promise<NextResponse>
) => Promise<NextResponse>;

/**
 * CORS Middleware
 */
export const corsMiddleware: Middleware = async (request, next) => {
  // Handle preflight
  if (request.method === 'OPTIONS') {
    const preflightResponse = handleCorsPreFlight(request);
    return NextResponse.json(null, { status: 204, headers: preflightResponse.headers });
  }
  
  const response = await next();
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin || undefined);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
};

/**
 * Error Handling Middleware
 */
export const errorHandlingMiddleware: Middleware = async (request, next) => {
  try {
    return await next();
  } catch (error) {
    return handleApiError(error, request);
  }
};

/**
 * Rate Limiting Middleware (Simple implementation)
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export const rateLimitMiddleware = (maxRequests: number = 100, windowMs: number = 60000): Middleware => {
  return async (request, next) => {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const now = Date.now();
    const record = requestCounts.get(ip);
    
    if (record && record.resetAt > now) {
      if (record.count >= maxRequests) {
        return errorResponse(
          'Too many requests. Please try again later.',
          HTTP_STATUS.TOO_MANY_REQUESTS,
          undefined,
          request
        );
      }
      record.count++;
    } else {
      requestCounts.set(ip, {
        count: 1,
        resetAt: now + windowMs,
      });
    }
    
    // Clean up old entries periodically
    if (requestCounts.size > 10000) {
      for (const [key, value] of requestCounts.entries()) {
        if (value.resetAt < now) {
          requestCounts.delete(key);
        }
      }
    }
    
    return next();
  };
};

/**
 * Authentication Middleware
 */
export const authMiddleware: Middleware = async (request, next) => {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return unauthorizedResponse('No authentication token provided', request);
  }
  
  // Add token validation logic here
  // For now, just pass through
  return next();
};

/**
 * Compose multiple middlewares
 */
export function compose(...middlewares: Middleware[]): Middleware {
  return async (request, finalNext) => {
    let index = 0;
    
    const dispatch = async (): Promise<NextResponse> => {
      if (index >= middlewares.length) {
        return finalNext();
      }
      
      const middleware = middlewares[index++];
      return middleware(request, dispatch);
    };
    
    return dispatch();
  };
}

/**
 * Create API Handler with Middleware
 */
export function createApiHandler(
  handler: ApiHandler,
  middlewares: Middleware[] = []
): ApiHandler {
  const composedMiddleware = compose(
    corsMiddleware,
    errorHandlingMiddleware,
    ...middlewares
  );
  
  return async (request, context) => {
    return composedMiddleware(request, () => handler(request, context));
  };
}

/**
 * Method Handler Wrapper
 */
export function methodHandler(handlers: Partial<Record<string, ApiHandler>>): ApiHandler {
  return async (request, context) => {
    const method = request.method;
    const handler = handlers[method];
    
    if (!handler) {
      return errorResponse(
        `Method ${method} not allowed`,
        HTTP_STATUS.BAD_REQUEST,
        undefined,
        request
      );
    }
    
    return handler(request, context);
  };
}
