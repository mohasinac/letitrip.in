import { COLLECTIONS } from "@/constants/database";
import { parse, serialize } from "cookie";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "./firebase/config";

// Validate SESSION_SECRET in production
if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  throw new Error(
    "CRITICAL: SESSION_SECRET environment variable must be set in production"
  );
}

const SESSION_SECRET =
  process.env.SESSION_SECRET || "dev-secret-key-not-for-production";
const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface SessionDocument {
  sessionId: string;
  userId: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
  lastActivity: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Create a new session in Firestore and generate a JWT token
 */
export async function createSession(
  userId: string,
  email: string,
  role: string,
  req?: NextRequest
): Promise<{ sessionId: string; token: string }> {
  try {
    const sessionId = generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE * 1000);

    // Get user agent and IP if available
    const userAgent = req?.headers.get("user-agent") || undefined;
    const ipAddress =
      req?.headers.get("x-forwarded-for") ||
      req?.headers.get("x-real-ip") ||
      undefined;

    // Generate JWT token first (fail fast if secret is invalid)
    const token = jwt.sign(
      {
        userId,
        email,
        role,
        sessionId,
      },
      SESSION_SECRET,
      {
        expiresIn: SESSION_MAX_AGE,
      }
    );

    // Store session in Firestore only if JWT creation succeeded
    const sessionDoc: SessionDocument = {
      sessionId,
      userId,
      email,
      role,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      lastActivity: now.toISOString(),
      userAgent,
      ipAddress,
    };

    await adminDb
      .collection(COLLECTIONS.SESSIONS)
      .doc(sessionId)
      .set(sessionDoc);

    return { sessionId, token };
  } catch (error) {
    console.error("Error creating session:", error);
    throw new Error("Failed to create session");
  }
}

/**
 * Verify and decode a session token
 */
export async function verifySession(
  token: string
): Promise<SessionData | null> {
  try {
    // Verify JWT
    const decoded = jwt.verify(token, SESSION_SECRET) as SessionData;

    // Check if session exists in Firestore
    const sessionDoc = await adminDb
      .collection(COLLECTIONS.SESSIONS)
      .doc(decoded.sessionId)
      .get();

    if (!sessionDoc.exists) {
      return null;
    }

    const sessionData = sessionDoc.data() as SessionDocument;

    // Check if session is expired
    const expiresAt = new Date(sessionData.expiresAt);
    if (expiresAt < new Date()) {
      // Delete expired session
      await adminDb
        .collection(COLLECTIONS.SESSIONS)
        .doc(decoded.sessionId)
        .delete();
      return null;
    }

    // Update last activity only if > 5 minutes since last update (reduce writes)
    const lastActivity = new Date(sessionData.lastActivity);
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    if (lastActivity < fiveMinutesAgo) {
      // Don't await - fire and forget to avoid blocking
      adminDb
        .collection(COLLECTIONS.SESSIONS)
        .doc(decoded.sessionId)
        .update({
          lastActivity: now.toISOString(),
        })
        .catch((err) => console.error("Failed to update lastActivity:", err));
    }

    return decoded;
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}

/**
 * Delete a session from Firestore
 */
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await adminDb.collection(COLLECTIONS.SESSIONS).doc(sessionId).delete();
  } catch (error) {
    console.error("Error deleting session:", error);
    throw new Error("Failed to delete session");
  }
}

/**
 * Delete all sessions for a user
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  try {
    const sessionsSnapshot = await adminDb
      .collection(COLLECTIONS.SESSIONS)
      .where("userId", "==", userId)
      .get();

    if (sessionsSnapshot.empty) {
      return; // No sessions to delete
    }

    const batch = adminDb.batch();
    sessionsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error("Error deleting all user sessions:", error);
    throw new Error("Failed to delete user sessions");
  }
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(
  userId: string
): Promise<SessionDocument[]> {
  try {
    const sessionsSnapshot = await adminDb
      .collection(COLLECTIONS.SESSIONS)
      .where("userId", "==", userId)
      .get();

    const sessions: SessionDocument[] = [];
    const expiredSessionIds: string[] = [];
    const now = new Date();

    // Separate read and delete - avoid modifying while iterating
    for (const doc of sessionsSnapshot.docs) {
      const sessionData = doc.data() as SessionDocument;
      const expiresAt = new Date(sessionData.expiresAt);

      if (expiresAt < now) {
        expiredSessionIds.push(doc.id);
      } else {
        sessions.push(sessionData);
      }
    }

    // Delete expired sessions in batch
    if (expiredSessionIds.length > 0) {
      const batch = adminDb.batch();
      expiredSessionIds.forEach((id) => {
        batch.delete(adminDb.collection(COLLECTIONS.SESSIONS).doc(id));
      });
      await batch
        .commit()
        .catch((err) =>
          console.error("Failed to delete expired sessions:", err)
        );
    }

    return sessions;
  } catch (error) {
    console.error("Error getting user sessions:", error);
    throw new Error("Failed to get user sessions");
  }
}

/**
 * Set session cookie in response
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  const cookie = serialize(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  response.headers.set("Set-Cookie", cookie);
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(response: NextResponse): void {
  // Set multiple cookie deletion strategies to ensure it's cleared
  const cookies = [
    serialize(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
      expires: new Date(0),
    }),
    // Also try without httpOnly to clear client-side cookies if any
    serialize(SESSION_COOKIE_NAME, "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
      expires: new Date(0),
    }),
  ];

  // Set both versions to ensure cookie is cleared
  response.headers.set("Set-Cookie", cookies[0]);
  response.headers.append("Set-Cookie", cookies[1]);
}

/**
 * Get session token from request cookies
 */
export function getSessionToken(req: NextRequest): string | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = parse(cookieHeader);
  return cookies[SESSION_COOKIE_NAME] || null;
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Cleanup expired sessions (run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const now = new Date().toISOString();
    const expiredSessionsSnapshot = await adminDb
      .collection(COLLECTIONS.SESSIONS)
      .where("expiresAt", "<", now)
      .get();

    if (expiredSessionsSnapshot.empty) {
      return 0;
    }

    const batch = adminDb.batch();
    expiredSessionsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return expiredSessionsSnapshot.size;
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
    throw new Error("Failed to cleanup expired sessions");
  }
}

/**
 * Get current user from session token
 * Returns user data if authenticated, null otherwise
 */
export async function getCurrentUser(
  request: NextRequest
): Promise<UserData | null> {
  const token = getSessionToken(request);
  if (!token) return null;

  const session = await verifySession(token);
  if (!session) return null;

  const userDoc = await adminDb
    .collection(COLLECTIONS.USERS)
    .doc(session.userId)
    .get();
  if (!userDoc.exists) return null;

  const userData = userDoc.data();
  return {
    id: session.userId,
    email: userData?.email || session.email,
    name: userData?.name || "",
    role: userData?.role || session.role || "user",
  };
}
