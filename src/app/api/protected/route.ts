/**
 * @fileoverview TypeScript Module
 * @module src/app/api/protected/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth";

/**
 * Example protected route that requires authentication
 * Access user session data via req.session
 */
/**
 * Performs protected handler operation
 *
 * @param {AuthenticatedRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to protectedhandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Performs protected handler operation
 *
 * @param {AuthenticatedRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to protectedhandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function protectedHandler(req: AuthenticatedRequest) {
  // Session data is guaranteed to exist because of requireAuth
  const { userId, email, role, sessionId } = req.session!;

  return NextResponse.json(
    {
      /** Message */
      message: "This is a protected endpoint",
      /** User */
      user: {
        userId,
        email,
        role,
      },
      sessionId,
      /** Timestamp */
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
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
  return requireAuth(req, protectedHandler);
}
