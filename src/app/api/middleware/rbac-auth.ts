/**
 * Enhanced Authentication & Authorization Middleware
 * Role-based access control for unified API routes
 *
 * This extends the existing auth.ts with additional RBAC functionality
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestoreAdmin } from "../lib/firebase/admin";
import {
  UnauthorizedError,
  ForbiddenError,
  errorToJson,
} from "@/lib/api-errors";
import { AuthUser, UserRole, hasAnyRole } from "@/lib/rbac-permissions";
import { COLLECTIONS } from "@/constants/database";

/**
 * Extract user from request token (using existing session or Firebase token)
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    // Try Authorization header first (for API calls)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (token) {
        try {
          const auth = getAuth();
          const decodedToken = await auth.verifyIdToken(token);

          const db = getFirestoreAdmin();
          const userDoc = await db
            .collection(COLLECTIONS.USERS)
            .doc(decodedToken.uid)
            .get();

          if (userDoc.exists) {
            const userData = userDoc.data();
            return {
              uid: decodedToken.uid,
              email: decodedToken.email || userData?.email || "",
              role: (userData?.role as UserRole) || "user",
              shopId: userData?.shopId,
            };
          }
        } catch (error) {
          console.error("Error verifying token:", error);
        }
      }
    }

    // Try session cookie (for server-side rendering)
    const { getSessionToken, verifySession } = await import("../lib/session");
    const sessionToken = getSessionToken(request);

    if (sessionToken) {
      const session = await verifySession(sessionToken);
      if (session) {
        return {
          uid: session.userId,
          email: session.email || "",
          role: session.role as UserRole,
          shopId: (session as any).shopId, // shopId may not be in session type yet
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting user from request:", error);
    return null;
  }
}

/**
 * Require authentication - user must be logged in
 */
export async function requireAuth(
  request: NextRequest
): Promise<
  { user: AuthUser; error?: never } | { user?: never; error: NextResponse }
> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return {
      error: NextResponse.json(
        errorToJson(new UnauthorizedError("Authentication required")),
        { status: 401 }
      ),
    };
  }

  return { user };
}

/**
 * Require specific role(s)
 */
export async function requireRole(
  request: NextRequest,
  roles: UserRole[]
): Promise<
  { user: AuthUser; error?: never } | { user?: never; error: NextResponse }
> {
  const authResult = await requireAuth(request);

  if (authResult.error) {
    return authResult;
  }

  const { user } = authResult;

  if (!hasAnyRole(user, roles)) {
    return {
      error: NextResponse.json(
        errorToJson(
          new ForbiddenError(
            `This action requires one of the following roles: ${roles.join(
              ", "
            )}`
          )
        ),
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Require admin role
 */
export async function requireAdmin(
  request: NextRequest
): Promise<
  { user: AuthUser; error?: never } | { user?: never; error: NextResponse }
> {
  return requireRole(request, ["admin"]);
}

/**
 * Require seller role (or admin)
 */
export async function requireSeller(
  request: NextRequest
): Promise<
  { user: AuthUser; error?: never } | { user?: never; error: NextResponse }
> {
  return requireRole(request, ["admin", "seller"]);
}

/**
 * Require ownership of resource
 */
export async function requireOwnership(
  request: NextRequest,
  resourceOwnerId: string,
  allowAdmin = true
): Promise<
  { user: AuthUser; error?: never } | { user?: never; error: NextResponse }
> {
  const authResult = await requireAuth(request);

  if (authResult.error) {
    return authResult;
  }

  const { user } = authResult;

  // Admin can access anything
  if (allowAdmin && user.role === "admin") {
    return { user };
  }

  // Check ownership
  if (user.uid !== resourceOwnerId) {
    return {
      error: NextResponse.json(
        errorToJson(
          new ForbiddenError(
            "You don't have permission to access this resource"
          )
        ),
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Require shop ownership (for sellers)
 */
export async function requireShopOwnership(
  request: NextRequest,
  resourceShopId: string,
  allowAdmin = true
): Promise<
  { user: AuthUser; error?: never } | { user?: never; error: NextResponse }
> {
  const authResult = await requireAuth(request);

  if (authResult.error) {
    return authResult;
  }

  const { user } = authResult;

  // Admin can access anything
  if (allowAdmin && user.role === "admin") {
    return { user };
  }

  // Check if seller owns the shop
  if (user.role === "seller" && user.shopId === resourceShopId) {
    return { user };
  }

  return {
    error: NextResponse.json(
      errorToJson(
        new ForbiddenError(
          "You don't have permission to access this shop's resources"
        )
      ),
      { status: 403 }
    ),
  };
}

/**
 * Optional authentication - get user if available
 */
export async function optionalAuth(
  request: NextRequest
): Promise<AuthUser | null> {
  return getUserFromRequest(request);
}

/**
 * Check if user has permission for specific action
 */
export async function checkPermission(
  request: NextRequest,
  action: "read" | "write" | "delete",
  resource: { type: string; ownerId?: string; shopId?: string }
): Promise<{ allowed: boolean; user: AuthUser | null }> {
  const user = await getUserFromRequest(request);

  // No user - only read public resources
  if (!user) {
    return { allowed: action === "read", user: null };
  }

  // Admin can do everything
  if (user.role === "admin") {
    return { allowed: true, user };
  }

  // Seller permissions
  if (user.role === "seller") {
    if (action === "read") {
      return { allowed: true, user }; // Sellers can read
    }

    if (action === "write" || action === "delete") {
      // Can modify own shop's resources
      if (resource.shopId && resource.shopId === user.shopId) {
        return { allowed: true, user };
      }
      // Can modify own resources
      if (resource.ownerId && resource.ownerId === user.uid) {
        return { allowed: true, user };
      }
      return { allowed: false, user };
    }
  }

  // User permissions
  if (user.role === "user") {
    if (action === "read") {
      return { allowed: true, user }; // Users can read
    }

    if (action === "write" || action === "delete") {
      // Can only modify own resources
      if (resource.ownerId && resource.ownerId === user.uid) {
        return { allowed: true, user };
      }
      return { allowed: false, user };
    }
  }

  return { allowed: false, user };
}

/**
 * Helper to wrap route handler with authentication
 */
export function withAuth(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authResult = await requireAuth(request);

    if (authResult.error) {
      return authResult.error;
    }

    return handler(request, authResult.user);
  };
}

/**
 * Helper to wrap route handler with role requirement
 */
export function withRole(
  roles: UserRole[],
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authResult = await requireRole(request, roles);

    if (authResult.error) {
      return authResult.error;
    }

    return handler(request, authResult.user);
  };
}
