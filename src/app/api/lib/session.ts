/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/session
 * @description This file contains functionality related to session
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import jwt from "jsonwebtoken";
import { serialize, parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "./firebase/config";
import { COLLECTIONS } from "@/constants/database";

const SESSION_SECRET =
  process.env.SESSION_SECRET || "your-secret-key-change-in-production";
const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * SessionData interface
 * 
 * @interface
 * @description Defines the structure and contract for SessionData
 */
export interface SessionData {
  /** User Id */
  userId: string;
  /** Email */
  email: string;
  /** Role */
  role: string;
  /** Session Id */
  sessionId: string;
  /** Iat */
  iat?: number;
  /** Exp */
  exp?: number;
}

/**
 * UserData interface
 * 
 * @interface
 * @description Defines the structure and contract for UserData
 */
export interface UserData {
  /** Id */
  id: string;
  /** Email */
  email: string;
  /** Name */
  name: string;
  /** Role */
  role: string;
}

/**
 * SessionDocument interface
 * 
 * @interface
 * @description Defines the structure and contract for SessionDocument
 */
export interface SessionDocument {
  /** Session Id */
  sessionId: string;
  /** User Id */
  userId: string;
  /** Email */
  email: string;
  /** Role */
  role: string;
  /** Created At */
  createdAt: string;
  /** Expires At */
  expiresAt: string;
  /** Last Activity */
  lastActivity: string;
  /** User Agent */
  userAgent?: string;
  /** Ip Address */
  ipAddress?: string;
}

/**
 * Create a new session in Firestore and generate a JWT token
 */
/**
 * Creates a new session
 *
 * @returns {Promise<any>} Promise resolving to session result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * createSession();
 */

/**
 * Creates a new session
 *
 * @returns {Promise<any>} Promise resolving to session result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * createSession();
 */

export async function createSession(
  /** User Id */
  userId: string,
  /** Email */
  email: string,
  /** Role */
  role: string,
  /** Req */
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
    /** Created At */
    createdAt: now.toISOString(),
    /** Expires At */
    expiresAt: expiresAt.toISOString(),
    /** Last Activity */
    lastActivity: now.toISOString(),
    userAgent,
    ipAddress,
  };

  await adminDb.collection(COLLECTIONS.SESSIONS).doc(sessionId).set(sessionDoc);

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
      /** Expires In */
      expiresIn: SESSION_MAX_AGE,
    },
  );

  return { sessionId, token };
}

/**
 * Verify and decode a session token
 */
/**
 * Performs verify session operation
 *
 * @param {string} token - The token
 *
 * @returns {Promise<any>} Promise resolving to verifysession result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * verifySession("example");
 */

/**
 * Performs verify session operation
 *
 * @param {string} /** Token */
  token - The /**  token */
  token
 *
 * @returns {Promise<any>} Promise resolving to verifysession result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * verifySession("example");
 */

export async function verifySession(
  /** Token */
  token: string,
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

    // Update last activity
    await adminDb
      .collection(COLLECTIONS.SESSIONS)
      .doc(decoded.sessionId)
      .update({
        /** Last Activity */
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
/**
 * Deletes session
 *
 * @param {string} sessionId - session identifier
 *
 * @returns {Promise<any>} Promise resolving to deletesession result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * deleteSession("example");
 */

/**
 * Deletes session
 *
 * @param {string} sessionId - session identifier
 *
 * @returns {Promise<any>} Promise resolving to deletesession result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * deleteSession("example");
 */

export async function deleteSession(sessionId: string): Promise<void> {
  await adminDb.collection(COLLECTIONS.SESSIONS).doc(sessionId).delete();
}

/**
 * Delete all sessions for a user
 */
/**
 * Deletes all user sessions
 *
 * @param {string} userId - user identifier
 *
 * @returns {Promise<any>} Promise resolving to deleteallusersessions result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * deleteAllUserSessions("example");
 */

/**
 * Deletes all user sessions
 *
 * @param {string} userId - user identifier
 *
 * @returns {Promise<any>} Promise resolving to deleteallusersessions result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * deleteAllUserSessions("example");
 */

export async function deleteAllUserSessions(userId: string): Promise<void> {
  const sessionsSnapshot = await adminDb
    .collection(COLLECTIONS.SESSIONS)
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
/**
 * Retrieves user sessions
 *
 * @param {string} userId - user identifier
 *
 * @returns {Promise<any>} Promise resolving to usersessions result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getUserSessions("example");
 */

/**
 * Retrieves user sessions
 *
 * @param {string} /** User Id */
  userId - /** User Id */
  user identifier
 *
 * @returns {Promise<any>} Promise resolving to usersessions result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getUserSessions("example");
 */

export async function getUserSessions(
  /** User Id */
  userId: string,
): Promise<SessionDocument[]> {
  const sessionsSnapshot = await adminDb
    .collection(COLLECTIONS.SESSIONS)
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
/**
 * Sets session cookie
 *
 * @param {NextResponse} response - The response
 * @param {string} token - The token
 *
 * @returns {void} No return value
 *
 * @example
 * setSessionCookie(response, "example");
 */

/**
 * Sets session cookie
 *
 * @param {NextResponse} response - The response
 * @param {string} token - The token
 *
 * @returns {void} No return value
 *
 * @example
 * setSessionCookie(response, "example");
 */

export function setSessionCookie(response: NextResponse, token: string): void {
  const cookie = serialize(SESSION_COOKIE_NAME, token, {
    /** Http Only */
    httpOnly: true,
    /** Secure */
    secure: process.env.NODE_ENV === "production",
    /** Same Site */
    sameSite: "lax",
    /** Max Age */
    maxAge: SESSION_MAX_AGE,
    /** Path */
    path: "/",
  });

  response.headers.set("Set-Cookie", cookie);
}

/**
 * Clear session cookie
 */
/**
 * Performs clear session cookie operation
 *
 * @param {NextResponse} response - The response
 *
 * @returns {void} No return value
 *
 * @example
 * clearSessionCookie(response);
 */

/**
 * Performs clear session cookie operation
 *
 * @param {NextResponse} response - The response
 *
 * @returns {void} No return value
 *
 * @example
 * clearSessionCookie(response);
 */

export function clearSessionCookie(response: NextResponse): void {
  // Set multiple cookie deletion strategies to ensure it's cleared
  const cookies = [
    serialize(SESSION_COOKIE_NAME, "", {
      /** Http Only */
      httpOnly: true,
      /** Secure */
      secure: process.env.NODE_ENV === "production",
      /** Same Site */
      sameSite: "lax",
      /** Max Age */
      maxAge: 0,
      /** Path */
      path: "/",
      /** Expires */
      expires: new Date(0),
    }),
    // Also try without httpOnly to clear client-side cookies if any
    serialize(SESSION_COOKIE_NAME, "", {
      /** Http Only */
      httpOnly: false,
      /** Secure */
      secure: process.env.NODE_ENV === "production",
      /** Same Site */
      sameSite: "lax",
      /** Max Age */
      maxAge: 0,
      /** Path */
      path: "/",
      /** Expires */
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
/**
 * Retrieves session token
 *
 * @param {NextRequest} req - The req
 *
 * @returns {string} The sessiontoken result
 *
 * @example
 * getSessionToken(req);
 */

/**
 * Retrieves session token
 *
 * @param {NextRequest} req - The req
 *
 * @returns {string} The sessiontoken result
 *
 * @example
 * getSessionToken(req);
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
/**
 * Performs generate session id operation
 *
 * @returns {string} The sessionid result
 */

/**
 * Performs generate session id operation
 *
 * @returns {string} The sessionid result
 */

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Cleanup expired sessions (run periodically)
 */
/**
 * Performs cleanup expired sessions operation
 *
 * @returns {Promise<any>} Promise resolving to cleanupexpiredsessions result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * cleanupExpiredSessions();
 */

/**
 * Performs cleanup expired sessions operation
 *
 * @returns {Promise<any>} Promise resolving to cleanupexpiredsessions result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * cleanupExpiredSessions();
 */

export async function cleanupExpiredSessions(): Promise<number> {
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
}

/**
 * Get current user from session token
 * Returns user data if authenticated, null otherwise
 */
/**
 * Retrieves current user
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to currentuser result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getCurrentUser(request);
 */

/**
 * Retrieves current user
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 *
 * @returns {Promise<any>} Promise resolving to currentuser result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getCurrentUser(/** Request */
  request);
 */

export async function getCurrentUser(
  /** Request */
  request: NextRequest,
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
    /** Id */
    id: session.userId,
    /** Email */
    email: userData?.email || session.email,
    /** Name */
    name: userData?.name || "",
    /** Role */
    role: userData?.role || session.role || "user",
  };
}
