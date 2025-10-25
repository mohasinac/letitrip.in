import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, JWTPayload } from "@/lib/auth/jwt";

export interface AuthMiddlewareOptions {
  requireAdmin?: boolean;
  requireSeller?: boolean;
  allowedRoles?: string[];
}

/**
 * Authentication middleware for API routes
 * Returns the authenticated user or throws an error response
 */
export async function withAuth(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<{ user: JWTPayload; error?: never } | { user?: never; error: NextResponse }> {
  try {
    const user = await getCurrentUser();

    // Check if user is authenticated
    if (!user) {
      return {
        error: NextResponse.json(
          { success: false, error: "Authentication required" },
          { status: 401 }
        )
      };
    }

    // Check admin role requirement
    if (options.requireAdmin && user.role !== "admin") {
      return {
        error: NextResponse.json(
          { success: false, error: "Admin access required" },
          { status: 403 }
        )
      };
    }

    // Check seller role requirement
    if (options.requireSeller && !["seller", "admin"].includes(user.role)) {
      return {
        error: NextResponse.json(
          { success: false, error: "Seller access required" },
          { status: 403 }
        )
      };
    }

    // Check allowed roles
    if (options.allowedRoles && !options.allowedRoles.includes(user.role)) {
      return {
        error: NextResponse.json(
          { 
            success: false, 
            error: `Access denied. Required roles: ${options.allowedRoles.join(", ")}` 
          },
          { status: 403 }
        )
      };
    }

    return { user };
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return {
      error: NextResponse.json(
        { success: false, error: "Authentication failed" },
        { status: 500 }
      )
    };
  }
}

/**
 * Higher-order function for admin-only endpoints
 */
export function withAdminAuth() {
  return (request: NextRequest) => withAuth(request, { requireAdmin: true });
}

/**
 * Higher-order function for seller endpoints (sellers and admins)
 */
export function withSellerAuth() {
  return (request: NextRequest) => withAuth(request, { requireSeller: true });
}

/**
 * Higher-order function for specific role requirements
 */
export function withRoleAuth(allowedRoles: string[]) {
  return (request: NextRequest) => withAuth(request, { allowedRoles });
}

/**
 * Wrapper function for API route handlers with authentication
 */
export function createAuthenticatedHandler<T extends any[]>(
  handler: (request: NextRequest, user: JWTPayload, ...args: T) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await withAuth(request, options);
    
    if (authResult.error) {
      return authResult.error;
    }

    return handler(request, authResult.user, ...args);
  };
}

/**
 * Wrapper specifically for admin handlers
 */
export function createAdminHandler<T extends any[]>(
  handler: (request: NextRequest, user: JWTPayload, ...args: T) => Promise<NextResponse>
) {
  return createAuthenticatedHandler(handler, { requireAdmin: true });
}

/**
 * Wrapper specifically for seller handlers
 */
export function createSellerHandler<T extends any[]>(
  handler: (request: NextRequest, user: JWTPayload, ...args: T) => Promise<NextResponse>
) {
  return createAuthenticatedHandler(handler, { requireSeller: true });
}

/**
 * Wrapper specifically for user handlers (authenticated users)
 */
export function createUserHandler<T extends any[]>(
  handler: (request: NextRequest, user: JWTPayload, ...args: T) => Promise<NextResponse>
) {
  return createAuthenticatedHandler(handler, { allowedRoles: ['user', 'seller', 'admin'] });
}

/**
 * Wrapper for public endpoints that optionally accept authentication
 */
export function createOptionalAuthHandler<T extends any[]>(
  handler: (request: NextRequest, user: JWTPayload | null, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const user = await getCurrentUser();
      return handler(request, user, ...args);
    } catch (error) {
      // For optional auth, continue with null user if auth fails
      return handler(request, null, ...args);
    }
  };
}

/**
 * Helper to check if user has specific permissions
 */
export function hasPermission(user: JWTPayload, permission: string): boolean {
  switch (permission) {
    case "admin":
      return user.role === "admin";
    case "seller":
      return ["seller", "admin"].includes(user.role);
    case "user":
      return ["user", "seller", "admin"].includes(user.role);
    default:
      return false;
  }
}

/**
 * Helper to get user permissions
 */
export function getUserPermissions(user: JWTPayload): string[] {
  const permissions = ["user"]; // All authenticated users have user permission
  
  if (["seller", "admin"].includes(user.role)) {
    permissions.push("seller");
  }
  
  if (user.role === "admin") {
    permissions.push("admin");
  }
  
  return permissions;
}
