/**
 * Backend Middleware Types
 */

import { NextRequest, NextResponse } from "next/server";
import { UserContext } from "./controllers";

/**
 * Next.js API handler with context
 */
export type ApiHandler<T = any> = (
  req: NextRequest,
  context?: any
) => Promise<NextResponse<T>>;

/**
 * Authenticated API handler
 */
export type AuthenticatedApiHandler<T = any> = (
  req: NextRequest,
  context: UserContext
) => Promise<NextResponse<T>>;

/**
 * Middleware function
 */
export type MiddlewareFunction = (
  req: NextRequest,
  next: () => Promise<NextResponse>
) => Promise<NextResponse>;

/**
 * Auth middleware options
 */
export interface AuthMiddlewareOptions {
  required?: boolean;
  roles?: string[];
  permissions?: string[];
}

/**
 * Cache middleware options
 */
export interface CacheMiddlewareOptions {
  keyGenerator: (req: NextRequest) => string;
  ttl?: number;
  skip?: (req: NextRequest) => boolean;
  shouldCache?: (response: Response) => boolean;
  addHeaders?: boolean;
}

/**
 * Rate limit middleware options
 */
export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  keyGenerator?: (req: NextRequest) => string;
}

/**
 * CORS middleware options
 */
export interface CorsOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}
