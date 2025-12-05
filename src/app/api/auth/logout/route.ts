/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auth/logout/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { apiRateLimiter } from "@/app/api/lib/utils/rate-limiter";
import { NextRequest, NextResponse } from "next/server";
import {
  clearSessionCookie,
  deleteSession,
  getSessionToken,
  verifySession,
} from "../../lib/session";

/**
 * Function: Logout Handler
 */
/**
 * Performs logout handler operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to logouthandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Performs logout handler operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to logouthandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function logoutHandler(req: NextRequest) {
  try {
    // Get session token from cookie
    const token = getSessionToken(req);

    if (token) {
      // Verify and get session data
      const session = await verifySession(token);

      if (session) {
        // Delete session from Firestore
        await deleteSession(session.sessionId);
      }
    }

    // Create response
    const response = NextResponse.json(
      { message: "Logout successful" },
      { status: 200 },
    );

    // Clear session cookie
    clearSessionCookie(response);

    return response;
  } catch (error: any) {
    console.error("Logout error:", error);

    // Even if there's an error, clear the cookie
    const response = NextResponse.json(
      {
        /** Message */
        message: "Logout completed",
        /** Error */
        error:
          process.env.NODE_ENV === "production" ? undefined : error.message,
      },
      { status: 200 },
    );

    clearSessionCookie(response);

    return response;
  }
}

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

export async function POST(req: NextRequest) {
  // Rate limiting
  const identifier =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (!apiRateLimiter.check(identifier)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  return logoutHandler(req);
}
