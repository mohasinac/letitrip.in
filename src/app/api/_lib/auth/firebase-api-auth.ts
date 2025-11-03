/**
 * Firebase Token Authentication Helper for API Routes
 * Supports Firebase ID tokens in Authorization header
 * This replaces the JWT cookie-based authentication system
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/app/api/_lib/database/admin";

export interface FirebaseUser {
  uid: string;
  email: string | undefined;
  role: "admin" | "seller" | "user";
  userData: any;
}

/**
 * Verify Firebase token from Authorization header and get user data
 * @param request - Next.js request object
 * @returns User object or null if authentication fails
 */
export async function verifyFirebaseToken(
  request: NextRequest,
): Promise<FirebaseUser | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);

    // Get user data from Firestore to check role
    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (!userData) {
      console.error("User document not found for uid:", decodedToken.uid);
      return null;
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.role,
      userData,
    };
  } catch (error) {
    console.error("Firebase token verification error:", error);
    return null;
  }
}

/**
 * Verify Firebase token and check if user has seller or admin role
 * @param request - Next.js request object
 * @returns User object or null if authentication/authorization fails
 */
export async function verifySellerOrAdmin(
  request: NextRequest,
): Promise<FirebaseUser | null> {
  const user = await verifyFirebaseToken(request);

  if (!user || !["seller", "admin"].includes(user.role)) {
    return null;
  }

  return user;
}

/**
 * Verify Firebase token and check if user has admin role
 * @param request - Next.js request object
 * @returns User object or null if authentication/authorization fails
 */
export async function verifyAdmin(
  request: NextRequest,
): Promise<FirebaseUser | null> {
  const user = await verifyFirebaseToken(request);

  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
}

/**
 * Verify Firebase token and check if user has specific role
 * @param request - Next.js request object
 * @param allowedRoles - Array of allowed roles
 * @returns User object or null if authentication/authorization fails
 */
export async function verifyRole(
  request: NextRequest,
  allowedRoles: Array<"admin" | "seller" | "user">,
): Promise<FirebaseUser | null> {
  const user = await verifyFirebaseToken(request);

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return user;
}

/**
 * Higher-order function to create authenticated API handlers
 * Replaces the JWT cookie-based middleware handlers
 */
export function createFirebaseHandler<T extends any[]>(
  handler: (
    request: NextRequest,
    user: FirebaseUser,
    ...args: T
  ) => Promise<NextResponse>,
  options: {
    requireAdmin?: boolean;
    requireSeller?: boolean;
    allowedRoles?: Array<"admin" | "seller" | "user">;
  } = {},
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    let user: FirebaseUser | null = null;

    // Verify Firebase token
    user = await verifyFirebaseToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Check admin role requirement
    if (options.requireAdmin && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }

    // Check seller role requirement (sellers and admins allowed)
    if (options.requireSeller && !["seller", "admin"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Seller access required" },
        { status: 403 },
      );
    }

    // Check allowed roles
    if (options.allowedRoles && !options.allowedRoles.includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: `Access denied. Required roles: ${options.allowedRoles.join(", ")}`,
        },
        { status: 403 },
      );
    }

    // Call the actual handler with the authenticated user
    return handler(request, user, ...args);
  };
}

/**
 * Create handler for admin-only endpoints
 * Use this instead of createAdminHandler from api-middleware
 */
export function createFirebaseAdminHandler<T extends any[]>(
  handler: (
    request: NextRequest,
    user: FirebaseUser,
    ...args: T
  ) => Promise<NextResponse>,
) {
  return createFirebaseHandler(handler, { requireAdmin: true });
}

/**
 * Create handler for seller endpoints (sellers and admins)
 * Use this instead of createSellerHandler from api-middleware
 */
export function createFirebaseSellerHandler<T extends any[]>(
  handler: (
    request: NextRequest,
    user: FirebaseUser,
    ...args: T
  ) => Promise<NextResponse>,
) {
  return createFirebaseHandler(handler, { requireSeller: true });
}

/**
 * Create handler for user endpoints (all authenticated users)
 * Use this instead of createUserHandler from api-middleware
 */
export function createFirebaseUserHandler<T extends any[]>(
  handler: (
    request: NextRequest,
    user: FirebaseUser,
    ...args: T
  ) => Promise<NextResponse>,
) {
  return createFirebaseHandler(handler, {
    allowedRoles: ["user", "seller", "admin"],
  });
}
