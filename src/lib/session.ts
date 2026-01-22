/**
 * Session Management Utilities
 *
 * Secure session handling using httpOnly cookies.
 * Client never has access to Firebase tokens directly.
 *
 * @example
 * ```tsx
 * import { createSession, getSession } from '@/lib/session';
 *
 * // Create session after login
 * await createSession(userId, role);
 *
 * // Get current session
 * const session = await getSession();
 * ```
 */

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "./firebase-admin";

const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION = 60 * 60 * 24 * 14; // 14 days in seconds

export interface SessionData {
  userId: string;
  email: string;
  role: "user" | "seller" | "admin";
  name?: string;
}

/**
 * Create a secure session cookie
 *
 * @param idToken - Firebase ID token from client
 * @param expiresIn - Session duration in milliseconds (default: 14 days)
 * @returns Session data
 */
export async function createSession(
  idToken: string,
  expiresIn: number = SESSION_DURATION * 1000,
): Promise<SessionData> {
  try {
    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    // Get user data from Firestore
    const userDoc = await adminDb
      .collection("users")
      .doc(decodedToken.uid)
      .get();
    const userData = userDoc.data();

    const sessionData: SessionData = {
      userId: decodedToken.uid,
      email: decodedToken.email || "",
      role: userData?.role || "user",
      name: userData?.name || decodedToken.name,
    };

    // Set httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION,
      path: "/",
    });

    return sessionData;
  } catch (error) {
    console.error("Error creating session:", error);
    throw new Error("Failed to create session");
  }
}

/**
 * Get current session data
 *
 * @returns Session data or null if not authenticated
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return null;
    }

    // Verify session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );

    // Get user data from Firestore
    const userDoc = await adminDb
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    const userData = userDoc.data();

    return {
      userId: decodedClaims.uid,
      email: decodedClaims.email || "",
      role: userData?.role || "user",
      name: userData?.name || decodedClaims.name,
    };
  } catch (error) {
    // Session invalid or expired
    return null;
  }
}

/**
 * Destroy current session
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error("Error destroying session:", error);
    throw new Error("Failed to destroy session");
  }
}

/**
 * Require authentication middleware
 * Use in API routes and server components
 *
 * @throws Error if not authenticated
 * @returns Session data
 */
export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

/**
 * Require specific role middleware
 *
 * @param allowedRoles - Array of allowed roles
 * @throws Error if not authenticated or unauthorized
 * @returns Session data
 */
export async function requireRole(
  allowedRoles: Array<"user" | "seller" | "admin">,
): Promise<SessionData> {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.role)) {
    throw new Error("Forbidden");
  }

  return session;
}
