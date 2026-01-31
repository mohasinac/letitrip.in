/**
 * API Middleware Utilities
 *
 * Provides middleware functions for API routes including:
 * - Request/Response logging
 * - Error handling
 * - Performance monitoring
 * - Request validation
 * - Rate limiting preparation
 */

import { NextRequest, NextResponse } from "next/server";

export interface ApiRequest extends NextRequest {
  startTime?: number;
  requestId?: string;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  requestId?: string;
  timestamp?: string;
  duration?: number;
}

// Generate unique request ID
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Logger class for API requests
export class ApiLogger {
  private static isDev = process.env.NODE_ENV === "development";

  static logRequest(
    method: string,
    url: string,
    requestId: string,
    body?: any,
  ) {
    if (!this.isDev) return;

    console.log("\n" + "=".repeat(80));
    console.log(`📥 API REQUEST [${requestId}]`);
    console.log(`   Method: ${method}`);
    console.log(`   URL: ${url}`);
    console.log(`   Time: ${new Date().toISOString()}`);
    if (body) {
      console.log(`   Body:`, JSON.stringify(body, null, 2));
    }
    console.log("=".repeat(80));
  }

  static logResponse(
    requestId: string,
    status: number,
    duration: number,
    data?: any,
  ) {
    if (!this.isDev) return;

    const statusEmoji = status >= 500 ? "❌" : status >= 400 ? "⚠️" : "✅";

    console.log("\n" + "=".repeat(80));
    console.log(`📤 API RESPONSE [${requestId}]`);
    console.log(`   ${statusEmoji} Status: ${status}`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log(`   Time: ${new Date().toISOString()}`);
    if (data && status >= 400) {
      console.log(`   Error:`, JSON.stringify(data, null, 2));
    }
    console.log("=".repeat(80) + "\n");
  }

  static logError(requestId: string, error: Error | unknown) {
    console.error("\n" + "🔴".repeat(40));
    console.error(`💥 API ERROR [${requestId}]`);
    console.error(`   Time: ${new Date().toISOString()}`);
    if (error instanceof Error) {
      console.error(`   Name: ${error.name}`);
      console.error(`   Message: ${error.message}`);
      console.error(`   Stack:`, error.stack);
    } else {
      console.error(`   Error:`, error);
    }
    console.error("🔴".repeat(40) + "\n");
  }
}

// Middleware wrapper for API routes
export function withApiMiddleware(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const requestId = generateRequestId();
    const startTime = Date.now();

    try {
      // Log incoming request
      const url = new URL(req.url);
      let body;

      try {
        if (req.method !== "GET" && req.method !== "HEAD") {
          const clonedRequest = req.clone();
          const contentType = req.headers.get("content-type") || "";

          if (contentType.includes("application/json")) {
            body = await clonedRequest.json();
          }
        }
      } catch (e) {
        // Body parsing failed, continue without body
      }

      ApiLogger.logRequest(req.method, url.pathname, requestId, body);

      // Call the actual handler
      const response = await handler(req, context);

      // Log response
      const duration = Date.now() - startTime;
      ApiLogger.logResponse(requestId, response.status, duration);

      // Add custom headers
      const headers = new Headers(response.headers);
      headers.set("X-Request-ID", requestId);
      headers.set("X-Response-Time", `${duration}ms`);

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      ApiLogger.logError(requestId, error);

      // Return error response
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Internal Server Error",
          requestId,
          timestamp: new Date().toISOString(),
        } as ApiResponse,
        {
          status: 500,
          headers: {
            "X-Request-ID": requestId,
            "X-Response-Time": `${duration}ms`,
          },
        },
      );
    }
  };
}

// Error response helper
export function createErrorResponse(
  error: string | Error,
  status: number = 500,
  requestId?: string,
): NextResponse<ApiResponse> {
  const errorMessage = error instanceof Error ? error.message : error;

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      requestId,
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}

// Success response helper
export function createSuccessResponse(
  data: any,
  message?: string,
  requestId?: string,
): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: true,
    data,
    message,
    requestId,
    timestamp: new Date().toISOString(),
  });
}

// Validation middleware
export function validateRequest(schema: {
  body?: (data: any) => boolean;
  query?: (params: URLSearchParams) => boolean;
}) {
  return (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest): Promise<NextResponse> => {
      const url = new URL(req.url);

      // Validate query parameters
      if (schema.query && !schema.query(url.searchParams)) {
        return createErrorResponse("Invalid query parameters", 400);
      }

      // Validate request body
      if (schema.body && req.method !== "GET" && req.method !== "HEAD") {
        try {
          const body = await req.json();
          if (!schema.body(body)) {
            return createErrorResponse("Invalid request body", 400);
          }
        } catch (e) {
          return createErrorResponse("Invalid JSON body", 400);
        }
      }

      return handler(req);
    };
  };
}

// CORS middleware
export function withCORS(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: {
    origin?: string | string[];
    methods?: string[];
    allowedHeaders?: string[];
  },
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const response = await handler(req);

    const headers = new Headers(response.headers);
    headers.set(
      "Access-Control-Allow-Origin",
      Array.isArray(options?.origin)
        ? options.origin[0]
        : options?.origin || "*",
    );
    headers.set(
      "Access-Control-Allow-Methods",
      options?.methods?.join(", ") || "GET, POST, PUT, DELETE, OPTIONS",
    );
    headers.set(
      "Access-Control-Allow-Headers",
      options?.allowedHeaders?.join(", ") || "Content-Type, Authorization",
    );

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Map<
    string,
    { count: number; totalDuration: number; avgDuration: number }
  > = new Map();

  static recordRequest(endpoint: string, duration: number) {
    const existing = this.metrics.get(endpoint) || {
      count: 0,
      totalDuration: 0,
      avgDuration: 0,
    };

    existing.count++;
    existing.totalDuration += duration;
    existing.avgDuration = existing.totalDuration / existing.count;

    this.metrics.set(endpoint, existing);
  }

  static getMetrics() {
    return Array.from(this.metrics.entries()).map(([endpoint, metrics]) => ({
      endpoint,
      ...metrics,
    }));
  }

  static logMetrics() {
    console.log("\n📊 API Performance Metrics:");
    console.log("=".repeat(80));
    this.getMetrics().forEach((metric) => {
      console.log(
        `${metric.endpoint}: ${
          metric.count
        } requests, avg ${metric.avgDuration.toFixed(2)}ms`,
      );
    });
    console.log("=".repeat(80) + "\n");
  }
}

// Rate limiting helper (in-memory, for production use Redis)
export class RateLimiter {
  private static requests: Map<string, { count: number; resetTime: number }> =
    new Map();

  static checkLimit(
    identifier: string,
    limit: number = 100,
    windowMs: number = 60000,
  ): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    return true;
  }

  static getRemainingRequests(identifier: string, limit: number = 100): number {
    const record = this.requests.get(identifier);
    if (!record) return limit;
    return Math.max(0, limit - record.count);
  }
}
