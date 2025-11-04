/**
 * API Logger Middleware
 * 
 * Logs API requests, responses, and performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Logger Class
// ============================================================================

export class ApiLogger {
  private static instance: ApiLogger;

  private constructor() {}

  static getInstance(): ApiLogger {
    if (!ApiLogger.instance) {
      ApiLogger.instance = new ApiLogger();
    }
    return ApiLogger.instance;
  }

  /**
   * Log API request
   */
  logRequest(request: NextRequest, userId?: string) {
    const timestamp = new Date().toISOString();
    const method = request.method;
    const url = request.url;
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    console.log(
      `[${timestamp}] ${method} ${url}`,
      userId ? `| User: ${userId}` : '',
      `| UA: ${userAgent.substring(0, 50)}...`
    );
  }

  /**
   * Log API response
   */
  logResponse(request: NextRequest, response: NextResponse, duration: number) {
    const timestamp = new Date().toISOString();
    const method = request.method;
    const url = request.url;
    const status = response.status;

    console.log(
      `[${timestamp}] ${method} ${url} | ${status} | ${duration}ms`
    );
  }

  /**
   * Log API error
   */
  logError(request: NextRequest, error: Error, userId?: string) {
    const timestamp = new Date().toISOString();
    const method = request.method;
    const url = request.url;

    console.error(
      `[${timestamp}] ERROR ${method} ${url}`,
      userId ? `| User: ${userId}` : '',
      '\n',
      error.message,
      '\n',
      error.stack
    );
  }

  /**
   * Log performance metric
   */
  logPerformance(endpoint: string, operation: string, duration: number) {
    if (duration > 1000) {
      console.warn(
        `[PERFORMANCE] ${endpoint} | ${operation} | ${duration}ms (slow)`
      );
    } else {
      console.log(
        `[PERFORMANCE] ${endpoint} | ${operation} | ${duration}ms`
      );
    }
  }
}

// ============================================================================
// Middleware Wrapper
// ============================================================================

type RouteHandler = (request: NextRequest, context?: any) => Promise<NextResponse>;

/**
 * Wrap API route with logging
 */
export function withLogging(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, context?: any) => {
    const logger = ApiLogger.getInstance();
    const startTime = Date.now();

    try {
      // Log request
      logger.logRequest(request);

      // Execute handler
      const response = await handler(request, context);

      // Log response
      const duration = Date.now() - startTime;
      logger.logResponse(request, response, duration);

      return response;
    } catch (error) {
      // Log error
      logger.logError(request, error as Error);
      throw error;
    }
  };
}

// Export singleton instance
export const logger = ApiLogger.getInstance();
