/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auth/me/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { apiRateLimiter } from "@/app/api/lib/utils/rate-limiter";
import { COLLECTIONS } from "@/constants/database";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase/config";
import { getSessionToken, verifySession } from "../../lib/session";

/**
 * Function: Me Handler
 */
/**
 * Performs me handler operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to mehandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Performs me handler operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to mehandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function meHandler(req: NextRequest) {
  try {
    // Get session token from cookie
    const token = getSessionToken(req);

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No session found" },
        { status: 401 },
      );
    }

    // Verify session
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or expired session" },
        { status: 401 },
      );
    }

    // Get user data from Firestore
    const userDoc = await adminDb
      .collection(COLLECTIONS.USERS)
      .doc(session.userId)
      .get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();

    return NextResponse.json(
      {
        /** User */
        user: {
          /** Uid */
          uid: userData?.uid,
          /** Email */
          email: userData?.email,
          /** Name */
          name: userData?.name,
          /** Role */
          role: userData?.role,
          /** Is Email Verified */
          isEmailVerified: userData?.isEmailVerified,
          /** Profile */
          profile: userData?.profile,
          /** Created At */
          createdAt: userData?.createdAt,
          /** Last Login */
          lastLogin: userData?.lastLogin,
        },
        /** Session */
        session: {
          /** Session Id */
          sessionId: session.sessionId,
          /** Expires At */
          expiresAt: session.exp
            ? new Date(session.exp * 1000).toISOString()
            : null,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Get current user error:", error);

    return NextResponse.json(
      {
        /** Error */
        error: "Failed to get user data",
        /** Message */
        message:
          process.env.NODE_ENV === "production"
            ? "An unexpected error occurred"
            : error.message,
      },
      { status: 500 },
    );
  }
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

  return meHandler(req);
}
