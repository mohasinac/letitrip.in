/**
 * API Route: User Login (Backend-Only)
 * POST /api/auth/login
 *
 * Secure login flow:
 * 1. Validate credentials on server
 * 2. Verify user with Firebase Admin SDK
 * 3. Create session cookie
 * 4. Update login metadata
 * 5. Return user data
 *
 * Security: Password verification happens server-side only
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";
import { USER_COLLECTION } from "@/db/schema/users";
import { createSessionCookie } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors";
import { ValidationError, AuthenticationError } from "@/lib/errors";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL),
  password: z.string().min(1, ERROR_MESSAGES.PASSWORD.REQUIRED),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      throw new ValidationError(firstError.message);
    }

    const { email, password } = validation.data;

    // Get Firebase Admin instances
    const auth = getAuth(adminApp);
    const db = getFirestore(adminApp);

    // Verify user exists
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        throw new AuthenticationError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
      }
      throw error;
    }

    // Check if account is disabled
    if (userRecord.disabled) {
      throw new AuthenticationError(ERROR_MESSAGES.USER.ACCOUNT_DISABLED);
    }

    // Verify password using Firebase REST API
    const apiKey = process.env.FIREBASE_API_KEY;
    const verifyPasswordUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    const verifyResponse = await fetch(verifyPasswordUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json();
      console.error("Password verification failed:", errorData);
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const verifyData = await verifyResponse.json();
    const idToken = verifyData.idToken;

    // Get user data from Firestore
    const userDoc = await db
      .collection(USER_COLLECTION)
      .doc(userRecord.uid)
      .get();
    const userData = userDoc.data();

    // Update login metadata
    await db
      .collection(USER_COLLECTION)
      .doc(userRecord.uid)
      .update({
        "metadata.lastSignInTime": FieldValue.serverTimestamp(),
        "metadata.loginCount": FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });

    // Create session cookie
    const sessionCookie = await createSessionCookie(idToken);

    // Return success with session
    const response = NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.AUTH.LOGIN_SUCCESS,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          role: userData?.role || "user",
          emailVerified: userRecord.emailVerified,
          phoneVerified: userData?.phoneVerified || false,
        },
      },
      { status: 200 },
    );

    // Set session cookie with enhanced security
    response.cookies.set("__session", sessionCookie, {
      httpOnly: true, // Prevent JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection (changed from 'lax' to 'strict')
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: "/",
      // priority: 'high', // Uncomment if using Next.js 13.4+
    });

    return response;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
