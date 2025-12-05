/**
 * @fileoverview TypeScript Module
 * @module src/app/api/middleware/rbac-auth
 * @description This file contains functionality related to rbac-auth
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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
/**
 * Retrieves user from request
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to userfromrequest result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getUserFromRequest(request);
 */

/**
 * Retrieves user from request
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 *
 * @returns {Promise<any>} Promise resolving to userfromrequest result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getUserFromRequest(/** Request */
  request);
 */

/**
 * Retrieves user from request
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<AuthUser | null>} The getuserfromrequest result
 *
 * @example
 * getUserFromRequest(request);
 */
export async function getUserFromRequest(
  /** Request */
  request: NextRequest,
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
              /** Uid */
              uid: decodedToken.uid,
              /** Email */
              email: decodedToken.email || userData?.email || "",
              /** Role */
              role: (userData?.role as UserRole) || "user",
              /** Shop Id */
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
          /** Uid */
          uid: session.userId,
          /** Email */
          email: session.email || "",
          /** Role */
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
/**
 * Performs require auth operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to requireauth result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * requireAuth(request);
 */

/**
 * Performs require auth operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  req/**
 * Performs require auth operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<} The requireauth result
 *
 * @example
 * requireAuth(request);
 */
uest
 *
 * @returns {Promise<any>} Promise resolving to requireauth result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * requireAuth(/** Request */
  request);
 */

export async function requireAuth(
  /** Request */
  request: NextRequest,
): Promise<
  { user: AuthUser; error?: never } | { user?: never; error: NextResponse }
> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return {
      /** Error */
      error: NextResponse.json(
        errorToJson(new UnauthorizedError("Authentication required")),
        { status: 401 },
      ),
    };
  }

  return { user };
}

/**
 * Require specific role(s)
 */
/**
 * Performs require role operation
 *
 * @param {NextRequest} request - The request
 * @param {UserRole[]} roles - The roles
 *
 * @returns {Promise<any>} Promise resolving to requirerole result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * requireRole(request, roles);
 */

/**
 * Performs require role operation
 *
 * @returns {Promise<any>} Promise resolving to requirerole result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * requireRole();
 */

export async function requireRole(
  /** Request */
  request: NextRequest,
  /** Roles */
  roles: UserRole[],
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
      /** Error */
      error: NextResponse.json(
        errorToJson(
          new ForbiddenError(
            `This action requires one of the following roles: ${roles.join(
              ", ",
            )}`,
          ),
        ),
        { status: 403 },
      ),
    };
  }

  return { user };
}

/**
 * Require admin role
 */
/**
 * Performs require admin operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to requireadmin result
 *
 * @throws {Error} When operation fails or validation/**
 * Performs require admin operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<} The requireadmin result
 *
 * @example
 * requireAdmin(request);
 */
 errors occur
 *
 * @example
 * requireAdmin(request);
 */

/**
 * Performs require admin operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 *
 * @returns {Promise<any>} Promise resolving to requireadmin result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * requireAdmin(/** Request */
  request);
 */

export async function requireAdmin(
  /** Request */
  request: NextRequest,
): Promise<
  { user: AuthUser; error?: never } | { user?: never; error: NextResponse }
> {
  return requireRole(request, ["admin"]);
}

/**
 * Require seller role (or admin)
 */
/**
 * Performs require seller operati/**
 * Performs require seller operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<} The requireseller result
 *
 * @example
 * requireSeller(request);
 */
on
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to requireseller result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * requireSeller(request);
 */

/**
 * Performs require seller operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 *
 * @returns {Promise<any>} Promise resolving to requireseller result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * requireSeller(/** Request */
  request);
 */

export async function requireSeller(
  /** Request */
  request: NextRequest,
): Promise<
  { user: AuthUser; error?: never } | { user?: never; error: NextResponse }
> {
  return requireRole(request, ["admin", "seller"]);
}

/**
 * Require ownership of resource
 */
/**
 * Performs require ownership operation
 *
 * @param {NextRequest} request - The request
 * @param {string} resourceOwnerId - resourceOwner identifier
 * @param {boolean} [allowAdmin] - Whether allow admin
 *
 * @returns {Promise<any>} Promise resolving to requireownership result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * requireOwnership(request, "example", true);
 */

/**
 * Performs require ownership operation
 *
 * @returns {Promise<any>} Promise resolving to requireownership result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * requireOwnership();
 */

export async function requireOwnership(
  /** Request */
  request: NextRequest,
  /** Resource Owner Id */
  resourceOwnerId: string,
  allowAdmin = true,
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
      /** Error */
      error: NextResponse.json(
        errorToJson(
          new ForbiddenError(
            "You don't have permission to access this resource",
          ),
        ),
        { status: 403 },
      ),
    };
  }

  return { user };
}

/**
 * Require shop ownership (for sellers)
 */
/**
 * Performs require shop ownership operation
 *
 * @param {NextRequest} request - The request
 * @param {string} resourceShopId - resourceShop identifier
 * @param {boolean} [allowAdmin] - Whether allow admin
 *
 * @returns {Promise<any>} Promise resolving to requireshopownership result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * requireShopOwnership(request, "example", true);
 */

/**
 * Performs require shop ownership operation
 *
 * @returns {Promise<any>} Promise resolving to requireshopownership result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * requireShopOwnership();
 */

export async function requireShopOwnership(
  /** Request */
  request: NextRequest,
  /** Resource Shop Id */
  resourceShopId: string,
  allowAdmin = true,
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
    /** Error */
    error: NextResponse.json(
      errorToJson(
        new ForbiddenError(
          "You don't have permission to acce/**
 * Performs optional auth operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<AuthUser | null>} The optionalauth result
 *
 * @example
 * optionalAuth(request);
 */
ss this shop's resources",
        ),
      ),
      { status: 403 },
    ),
  };
}

/**
 * Optional authentication - get user if available
 */
/**
 * Performs optional auth operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to optionalauth result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * optionalAuth(request);
 */

/**
 * Performs optional auth operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 *
 * @returns {Promise<any>} Promise resolving to optionalauth result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * optionalAuth(/** Request */
  request);
 */

export async function optionalAuth(
  /** Request */
  request: NextRequest,
): Promise<AuthUser | null> {
  return getUserFromRequest(request);
}

/**
 * Check if user has permission for specific action
 */
/**
 * Performs check permission operation
 *
 * @param {NextRequest} request - The request
 * @param {"read" | "write" | "delete"} action - The action
 * @param {{ type} [resource] - The resource
 *
 * @returns {Promise<any>} Promise resolving to checkpermission result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * checkPermission(request, action, {});
 */

/**
 * Performs check permission operation
 *
 * @returns {Promise<any>} Promise resolving to checkpermission result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * checkPermission();
 */

export async function checkPermission(
  /** Request */
  request: NextRequest,
  /** Action */
  action: "read" | "write" | "delete",
  /** Resource */
  resource: { type: string; ownerId?: string; shopId?: string },
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
/**
 * Performs with auth operation
 *
 * @param {(request} handler - The handler
 * @param {AuthUser} user - The user
 *
 * @returns {Promise<any>} Promise resolving to withauth result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withAuth(handler, user);
 */

/**
 * Performs with auth operation
 *
 * @param {(request} /** Handler */
  handler - The /**  handler */
  handler
 * @param {AuthUser} user - The user
 *
 * @returns {Promise<any>} Promise resolving to withauth result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withAuth(/** Handler */
  handler, user);
 */

export function withAuth(
  /** Handler */
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>,
) {
  return async (request: NextRequest) => {
    /**
 * Performs auth result operation
 *
 * @param {any} request - The request
 *
 * @returns {any} The authresult result
 *
 * @example
 * authResult(request);
 */
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
/**
 * Performs with role operation
 *
 * @param {UserRole[]} roles - The roles
 * @param {(request} handler - The handler
 * @param {AuthUser} user - The user
 *
 * @returns {Promise<any>} Promise resolving to withrole result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withRole(roles, handler, user);
 */

/**
 * Performs with role operation
 *
 * @param {UserRole[]} /** Roles */
  roles - The /**  roles */
  roles
 * @param {(request} /** Handler */
  handler - The /**  handler */
  handler
 * @param {AuthUser} user - The user
 *
 * @returns {any} The withrole result
 *
 * @example
 * withRole(/** Roles */
  roles, /** Handler */
  handler, user);
 */

export function withRole(
  /** Roles */
  roles: UserRole[],
  /** Handler */
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>,
) {
  return async (request: NextRequest) => {
    const authResult = await requireRole(request, roles);

    if (authResult.error) {
      return authResult.error;
    }

    return handler(request, authResult.user);
  };
}
