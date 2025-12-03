/**
 * Auth Helpers for API Routes
 * Provides getAuthFromRequest for consistent auth patterns across routes
 */

import { NextRequest } from "next/server";
import { getSessionToken, verifySession, SessionData } from "./session";
import { getFirestoreAdmin } from "./firebase/admin";

export interface AuthResult {
  user: {
    uid: string;
    email: string;
    name: string;
  } | null;
  role: string | null;
  session: SessionData | null;
}

/**
 * Get authentication info from request
 * Returns user, role, and session data if authenticated
 */
export async function getAuthFromRequest(
  request: NextRequest,
): Promise<AuthResult> {
  try {
    const token = getSessionToken(request);
    if (!token) {
      return { user: null, role: null, session: null };
    }

    const session = await verifySession(token);
    if (!session) {
      return { user: null, role: null, session: null };
    }

    // Get full user data from Firestore
    const db = getFirestoreAdmin();
    const userDoc = await db.collection("users").doc(session.userId).get();

    if (!userDoc.exists) {
      return { user: null, role: null, session: null };
    }

    const userData = userDoc.data();

    return {
      user: {
        uid: session.userId,
        email: userData?.email || session.email,
        name: userData?.name || "",
      },
      role: userData?.role || session.role || "user",
      session,
    };
  } catch (error) {
    console.error("Error getting auth from request:", error);
    return { user: null, role: null, session: null };
  }
}
