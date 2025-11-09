import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, verifySession, SessionData } from "../lib/session";

export interface AuthenticatedRequest extends NextRequest {
  session?: SessionData;
}

/**
 * Middleware to verify session authentication
 */
export async function requireAuth(
  req: NextRequest,
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
export async function requireRole(
  req: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
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
export async function optionalAuth(
  req: NextRequest,
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
