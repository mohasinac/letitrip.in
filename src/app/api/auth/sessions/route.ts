/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auth/sessions/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { apiRateLimiter } from "@/app/api/lib/utils/rate-limiter";
import { NextRequest, NextResponse } from "next/server";
import {
  deleteAllUserSessions,
  deleteSession,
  getUserSessions,
} from "../../lib/session";
import { AuthenticatedRequest, requireAuth } from "../../middleware/auth";

/**
 * Retrieves sessions handler
 */
/**
 * Retrieves sessions handler
 *
 * @param {AuthenticatedRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to sessionshandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Retrieves sessions handler
 *
 * @param {AuthenticatedRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to sessionshandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function getSessionsHandler(req: AuthenticatedRequest) {
  try {
    if (!req.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active sessions for the user
    /**
 * Performs sessions operation
 *
 * @param {any} req.session.userId - The req.session.userid
 *
 * @returns {any} The sessions result
 *
 */
const sessions = await getUserSessions(req.session.userId);

    return NextResponse.json(
      {
        /** Sessions */
        sessions: sessions.map((session) => ({
          /** Session Id */
          sessionId: session.sessionId,
          /** Created At */
          createdAt: session.createdAt,
          /** Expires At */
          expiresAt: session.expiresAt,
          /** Last Activity */
          lastActivity: session.lastActivity,
          /** User Agent */
          userAgent: session.userAgent,
          /** Ip Address */
          ipAddress: session.ipAddress,
          /** Is Current */
          isCurrent: session.sessionId === req.session!.sessionId,
        })),
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Get sessions error:", error);

    return NextResponse.json(
      {
        /** Error */
        error: "Failed to get sessions",
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
 * Deletes session handler
 */
/**
 * Deletes session handler
 *
 * @param {AuthenticatedRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to deletesessionhandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Deletes session handler
 *
 * @param {AuthenticatedRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to deletesessionhandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function deleteSessionHandler(req: AuthenticatedRequest) {
  try {
    if (!req.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, deleteAll } = body;

    // Delete all sessions
    if (deleteAll) {
      await deleteAllUserSessions(req.session.userId);
      return NextResponse.json(
        { message: "All sessions deleted successfully" },
        { status: 200 },
      );
    }

    // Delete specific session
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { statu/**
 * Performs session to delete operation
 *
 * @param {any} (s - The (s
 *
 * @returns {any} The sessiontodelete result
 *
 */
s: 400 },
      );
    }

    // Verify the session belongs to the user
    const sessions = await getUserSessions(req.session.userId);
    const sessionToDelete = sessions.find((s) => s.sessionId === sessionId);

    if (!sessionToDelete) {
      return NextResponse.json(
        { error: "Session not found or does not belong to user" },
        { status: 404 },
      );
    }

    await deleteSession(sessionId);

    return NextResponse.json(
      { message: "Session deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Delete session error:", error);

    return NextResponse.json(
      {
        /** Error */
        error: "Failed to delete session",
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

  return requireAuth(req, getSessionsHandler);
}

/**
 * Function: D E L E T E
 */
/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(req);
 */

/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(req);
 */

export async function DELETE(req: NextRequest) {
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

  return requireAuth(req, deleteSessionHandler);
}
