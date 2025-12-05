/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auth/login/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { withLoginTracking } from "@/app/api/middleware/ip-tracker";
import { COLLECTIONS } from "@/constants/database";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../lib/firebase/config";
import {
  clearSessionCookie,
  createSession,
  setSessionCookie,
} from "../../lib/session";

/**
 * LoginRequestBody interface
 * 
 * @interface
 * @description Defines the structure and contract for LoginRequestBody
 */
interface LoginRequestBody {
  /** Email */
  email: string;
  /** Password */
  password: string;
}

/**
 * Function: Login Handler
 */
/**
 * Performs login handler operation
 *
 * @param {Request} req - The req
 *
 * @returns {Promise<any>} Promise resolving to loginhandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Performs login handler operation
 *
 * @param {Request} req - The req
 *
 * @returns {Promise<any>} Promise resolving to loginhandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function loginHandler(req: Request) {
  try {
    const body: LoginRequestBody = await req.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields", fields: ["email", "password"] },
        { status: 400 }
      );
    }

    // Get user from Firestore
    const userSnapshot = await adminDb
      .collection(COLLECTIONS.USERS)
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      const response = NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
      // Clear any existing invalid session cookie
      clearSessionCookie(response);
      return response;
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      userData.hashedPassword
    );

    if (!isPasswordValid) {
      const response = NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
      // Clear any existing invalid session cookie
      clearSessionCookie(response);
      return response;
    }

    // Check if user is disabled
    try {
      const userRecord = await adminAuth.getUser(userData.uid);
      if (userRecord.disabled) {
        const response = NextResponse.json(
          { error: "Account has been disabled" },
          { status: 403 }
        );
        // Clear any existing invalid session cookie
        clearSessionCookie(response);
        return response;
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      const response = NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 }
      );
      // Clear any existing invalid session cookie
      clearSessionCookie(response);
      return response;
    }

    // Create session
    const { sessionId, token } = await createSession(
      userData.uid,
      userData.email,
      userData.role,
      req as NextRequest
    );

    // Update last login
    await adminDb.collection(COLLECTIONS.USERS).doc(userData.uid).update({
      /** Last Login */
      lastLogin: new Date().toISOString(),
      /** Updated At */
      updatedAt: new Date().toISOString(),
    });

    // Create response with session cookie
    const response = NextResponse.json(
      {
        /** Message */
        message: "Login successful",
        /** User */
        user: {
          /** Uid */
          uid: userData.uid,
          /** Email */
          email: userData.email,
          /** Name */
          name: userData.name,
          /** Role */
          role: userData.role,
          /** Is Email Verified */
          isEmailVerified: userData.isEmailVerified,
          /** Profile */
          profile: userData.profile,
        },
        sessionId,
      },
      { status: 200 }
    );

    // Set session cookie
    setSessionCookie(response, token);

    return response;
  } catch (error: any) {
    console.error("Login error:", error);

    const response = NextResponse.json(
      {
        /** Error */
        error: "Login failed",
        /** Message */
        message:
          process.env.NODE_ENV === "production"
            ? "An unexpected error occurred"
            : error.message,
      },
      { status: 500 }
    );

    // Clear any existing invalid session cookie
    clearSessionCookie(response);
    return response;
  }
}

// Export with IP tracking and rate limiting (max 5 attempts per 15 minutes)
/**
 * Post
 * @constant
 */
export const POST = withLoginTracking(loginHandler);
