/**
 * @fileoverview TypeScript Module
 * @module src/app/api/middleware/withRouteRateLimit
 * @description This file contains functionality related to withRouteRateLimit
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "./ratelimiter";

// Route pattern → config map
// Keep simple string includes/regex matching to avoid heavy parsing.
const routeRateLimitConfig: Array<{
  /** Test */
  test: (url: URL) => boolean;
  /** Config */
  config: { maxRequests?: number; windowMs?: number; message?: string };
}> = [
  // Invoice PDFs: heavier work
  {
    /** Test */
    test: (url) => /\/api\/orders\/[^/]+\/invoice$/.test(url.pathname),
    /** Config */
    config: { maxRequests: 20, windowMs: 60 * 1000 },
  },
  // Returns media (signed URLs): protect both GET and POST
  {
    /** Test */
    test: (url) => /\/api\/returns\/[^/]+\/media$/.test(url.pathname),
    /** Config */
    config: { maxRequests: 30, windowMs: 60 * 1000 },
  },
  // Search endpoint: can be bursty; keep modest
  {
    /** Test */
    test: (url) => url.pathname === "/api/search",
    /** Config */
    config: { maxRequests: 120, windowMs: 60 * 1000 },
  },
];

/**
 * Function: Pick Config
 */
/**
 * Performs pick config operation
 *
 * @param {URL} url - The url
 *
 * @returns {any} The pickconfig result
 */

/**
 * Performs pick config operation
 *
 * @param {URL} url - The url
 *
 * @returns {any} The pickconfig result
 */

function pickConfig(url: URL) {
  for (const entry of routeRateLimitConfig) {
    if (entry.test(url)) return entry.config;
  }
  // Default fallback
  return { maxRequests: 200, windowMs: 60 * 1000 };
}

/**
 * Function: With Route Rate Limit
 */
/**
 * Performs with route rate limit operation
 *
 * @param {NextRequest} req - The req
 * @param {(req} handler - The handler
 *
 * @returns {Promise<any>} Promise resolving to withrouteratelimit result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withRouteRateLimit(req, handler);
 */

/**
 * Performs with route rate limit operation
 *
 * @param {NextRequest} /** Req */
  req - The /**  req */
  req
 * @param {(req} /** Handler */
  handler - The /**  handler */
  handler
 *
 * @returns {Promise<any>} Promise resolving to withrouteratelimit result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withRouteRateLimit(/** Req */
  req, /** Handler */
  handler);
 */

export async function withRouteRateLimit(
  /** Req */
  req: NextRequest,
  /** Handler */
  handler: (req: NextRequest) => Promise<NextResponse>,
) {
  const url = new URL(req.url);
  const cfg = pickConfig(url);
  return withRateLimit(req, handler, cfg);
}

// Expose config for future dynamic updates (e.g., load from env)
/**
 * Retrieves route rate limit entries
 */
/**
 * Retrieves route rate limit entries
 *
 * @returns {any} The routeratelimitentries result
 *
 * @example
 * getRouteRateLimitEntries();
 */

/**
 * Retrieves route rate limit entries
 *
 * @returns {any} The routeratelimitentries result
 *
 * @example
 * getRouteRateLimitEntries();
 */

export function getRouteRateLimitEntries() {
  return routeRateLimitConfig;
}
