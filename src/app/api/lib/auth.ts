/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/auth
 * @description This file contains functionality related to auth
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Auth Helpers for API Routes
 * Provides getAuthFromRequest for consistent auth patterns across routes
 */

import { NextRequest } from "next/server";
import { getSessionToken, verifySession, SessionData } from "./session";
import { getFirestoreAdmin } from "./firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * AuthResult interface
 * 
 * @interface
 * @description Defines the structure and contract for AuthResult
 */
export interface AuthResult {
  /** User */
  user: {
    /** Uid */
    uid: string;
    /** Email */
    email: string;
    /** Name */
    name: string;
  } | null;
  /** Role */
  role: string | null;
  /** Session */
  session: SessionData | null;
}

/**
 * Get authentication info from request
 * Returns user, role, and session data if authenticated
 */
/**
 * Retrieves auth from request
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to authfromrequest result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getAuthFromRequest(request);
 */

/**
 * Retrieves auth from request
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 *
 * @returns {Promise<any>} Promise resolving to authfromrequest result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getAuthFromRequest(/** Request */
  request);
 */

/**
 * Retrieves auth from request
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<AuthResult>} The getauthfromrequest result
 *
 * @example
 * getAuthFromRequest(request);
 */
export async function getAuthFromRequest(
  /** Request */
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
    const userDoc = await db
      .collection(COLLECTIONS.USERS)
      .doc(session.userId)
      .get();

    if (!userDoc.exists) {
      return { user: null, role: null, session: null };
    }

    const userData = userDoc.data();

    return {
      /** User */
      user: {
        /** Uid */
        uid: session.userId,
        /** Email */
        email: userData?.email || session.email,
        /** Name */
        name: userData?.name || "",
      },
      /** Role */
      role: userData?.role || session.role || "user",
      session,
    };
  } catch (error) {
    console.error("Error getting auth from request:", error);
    return { user: null, role: null, session: null };
  }
}
