/**
 * @fileoverview TypeScript Module
 * @module src/app/api/middleware/auth
 * @description This file contains functionality related to auth
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, verifySession, SessionData } from "../lib/session";

/**
 * AuthenticatedRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for AuthenticatedRequest
 */
export interface AuthenticatedRequest extends NextRequest {
  /** Session */
  session?: SessionData;
}

/**
 * Middleware to verify session authentication
 */
/**
 * Performs require auth operation
 *
 * @param {NextRequest} req - The req
 * @param {(req} handler - The handler
 *
 * @returns {Promise<any>} Promise resolving to requireauth result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * requireAuth(req, handler);
 */

/**
 * Performs require auth operation
 *
 * @param {NextRequest} /** Req */
  req - The /**  req */
  req
 * @param {(req} /** Handler */
  handler - The /**  handler */
  handler
 *
 * @returns {Promise<any>} Promise resolving to requireauth result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * requireAuth(/** Req */
  req, /** Handler */
  handler);
 */

export async function requireAuth(
  /** Req */
  req: NextRequest,
  /** Handler */
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    // Get session token from cookie
    const token = getSessionToken(req);

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No session token found" },
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

    // Attach session to request
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.session = session;

    // Call the handler
    return handler(authenticatedReq);
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}

/**
 * Middleware to verify session and check for specific role
 */
/**
 * Performs require role operation
 *
 * @param {NextRequest} req - The req
 * @param {(req} handler - The handler
 *
 * @returns {Promise<any>} Promise resolving to requirerole result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * requireRole(req, handler);
 */

/**
 * Performs require role operation
 *
 * @param {NextRequest} /** Req */
  req - The /**  req */
  req
 * @param {(req} /** Handler */
  handler - The /**  handler */
  handler
 *
 * @returns {Promise<any>} Promise resolving to requirerole result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * requireRole(/** Req */
  req, /** Handler */
  handler);
 */

export async function requireRole(
  /** Req */
  req: NextRequest,
  /** Handler */
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  /** Allowed Roles */
  allowedRoles: string[],
): Promise<NextResponse> {
  try {
    // First authenticate
    const token = getSessionToken(req);

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No session token found" },
        { status: 401 },
      );
    }

    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or expired session" },
        { status: 401 },
      );
    }

    // Check role
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json(
        { error: "Forbidden", message: "Insufficient permissions" },
        { status: 403 },
      );
    }

    // Attach session to request
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.session = session;

    // Call the handler
    return handler(authenticatedReq);
  } catch (error) {
    console.error("Role middleware error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}

/**
 * Optional auth - doesn't require authentication but adds session if available
 */
/**
 * Performs optional auth operation
 *
 * @param {NextRequest} req - The req
 * @param {(req} handler - The handler
 *
 * @returns {Promise<any>} Promise resolving to optionalauth result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * optionalAuth(req, handler);
 */

/**
 * Performs optional auth operation
 *
 * @param {NextRequest} /** Req */
  req - The /**  req */
  req
 * @param {(req} /** Handler */
  handler - The /**  handler */
  handler
 *
 * @returns {Promise<any>} Promise resolving to optionalauth result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * optionalAuth(/** Req */
  req, /** Handler */
  handler);
 */

export async function optionalAuth(
  /** Req */
  req: NextRequest,
  /** Handler */
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    const token = getSessionToken(req);

    if (token) {
      const session = await verifySession(token);
      if (session) {
        const authenticatedReq = req as AuthenticatedRequest;
        authenticatedReq.session = session;
        return handler(authenticatedReq);
      }
    }

    // No session or invalid session - continue without auth
    return handler(req as AuthenticatedRequest);
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    // Continue without auth on error
    return handler(req as AuthenticatedRequest);
  }
}
