import jwt from "jsonwebtoken";
import { serialize, parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "./firebase/config";

const SESSION_SECRET =
  process.env.SESSION_SECRET || "your-secret-key-change-in-production";
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
  req?: NextRequest,
): Promise<{ sessionId: string; token: string }> {
  const sessionId = generateSessionId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE * 1000);

  // Get user agent and IP if available
  const userAgent = req?.headers.get("user-agent") || undefined;
  const ipAddress =
    req?.headers.get("x-forwarded-for") ||
    req?.headers.get("x-real-ip") ||
    undefined;

  // Store session in Firestore
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

  await adminDb.collection("sessions").doc(sessionId).set(sessionDoc);

  // Generate JWT token
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
    },
  );

  return { sessionId, token };
}

/**
 * Verify and decode a session token
 */
export async function verifySession(
  token: string,
): Promise<SessionData | null> {
  try {
    // Verify JWT
    const decoded = jwt.verify(token, SESSION_SECRET) as SessionData;

    // Check if session exists in Firestore
    const sessionDoc = await adminDb
      .collection("sessions")
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
      await adminDb.collection("sessions").doc(decoded.sessionId).delete();
      return null;
    }

    // Update last activity
    await adminDb.collection("sessions").doc(decoded.sessionId).update({
      lastActivity: new Date().toISOString(),
    });

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
  await adminDb.collection("sessions").doc(sessionId).delete();
}

/**
 * Delete all sessions for a user
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  const sessionsSnapshot = await adminDb
    .collection("sessions")
    .where("userId", "==", userId)
    .get();

  const batch = adminDb.batch();
  sessionsSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(
  userId: string,
): Promise<SessionDocument[]> {
  const sessionsSnapshot = await adminDb
    .collection("sessions")
    .where("userId", "==", userId)
    .get();

  const sessions: SessionDocument[] = [];
  const now = new Date();

  for (const doc of sessionsSnapshot.docs) {
    const sessionData = doc.data() as SessionDocument;
    const expiresAt = new Date(sessionData.expiresAt);

    // Remove expired sessions
    if (expiresAt < now) {
      await doc.ref.delete();
    } else {
      sessions.push(sessionData);
    }
  }

  return sessions;
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
  const now = new Date().toISOString();
  const expiredSessionsSnapshot = await adminDb
    .collection("sessions")
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
}

/**
 * Get current user from session token
 * Returns user data if authenticated, null otherwise
 */
export async function getCurrentUser(
  request: NextRequest,
): Promise<UserData | null> {
  const token = getSessionToken(request);
  if (!token) return null;

  const session = await verifySession(token);
  if (!session) return null;

  const userDoc = await adminDb.collection("users").doc(session.userId).get();
  if (!userDoc.exists) return null;

  const userData = userDoc.data();
  return {
    id: session.userId,
    email: userData?.email || session.email,
    name: userData?.name || "",
    role: userData?.role || session.role || "user",
  };
}
