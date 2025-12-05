/**
 * @fileoverview TypeScript Module
 * @module src/app/api/health/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { withMiddleware } from "../middleware";

/**
 * Function: Health Check Handler
 */
/**
 * Performs health check handler operation
 *
 * @returns {Promise<any>} Promise resolving to healthcheckhandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Performs health check handler operation
 *
 * @returns {Promise<any>} Promise resolving to healthcheckhandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function healthCheckHandler() {
  return NextResponse.json({
    /** Status */
    status: "healthy",
    /** Timestamp */
    timestamp: new Date().toISOString(),
    /** Uptime */
    uptime: process.uptime(),
    /** Environment */
    environment: process.env.NODE_ENV,
    /** Version */
    version: "1.0.0",
  });
}

/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

export async function GET(req: NextRequest) {
  return withMiddleware(req, healthCheckHandler, {
    /** Cache */
    cache: {
      ttl: 30000, // 30 seconds
    },
  });
}
