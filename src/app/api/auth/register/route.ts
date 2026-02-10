/**
 * API Route: User Registration (Backend-Only)
 * POST /api/auth/register
 *
 * Secure registration flow:
 * 1. Validate input on server
 * 2. Create user with Firebase Admin SDK
 * 3. Store user data in Firestore
 * 4. Create session cookie
 * 5. Return success with session
 *
 * Security: All Firebase operations happen server-side
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAdminApp } from "@/lib/firebase/admin";
import { USER_COLLECTION, DEFAULT_USER_DATA } from "@/db/schema/users";
import { parseUserAgent } from "@/db/schema/sessions";
import { UserRole } from "@/types/auth";
import { createSessionCookie } from "@/lib/firebase/auth-server";
import { sessionRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { ValidationError } from "@/lib/errors";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL),
  password: z
    .string()
    .min(8, ERROR_MESSAGES.PASSWORD.TOO_SHORT)
    .regex(/[A-Z]/, ERROR_MESSAGES.PASSWORD.NO_UPPERCASE)
    .regex(/[a-z]/, ERROR_MESSAGES.PASSWORD.NO_LOWERCASE)
    .regex(/[0-9]/, ERROR_MESSAGES.PASSWORD.NO_NUMBER),
  displayName: z.string().min(2).optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: ERROR_MESSAGES.USER.TERMS_NOT_ACCEPTED,
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      throw new ValidationError(firstError.message);
    }

    const { email, password, displayName } = validation.data;

    // Get Firebase Admin instances
    const auth = getAuth(getAdminApp());
    const db = getFirestore(getAdminApp());

    // Check if user already exists
    try {
      await auth.getUserByEmail(email);
      throw new ValidationError(ERROR_MESSAGES.USER.EMAIL_ALREADY_REGISTERED);
    } catch (error: any) {
      // If user not found, continue (this is expected)
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    // Determine role based on email
    const role: UserRole = email === "admin@letitrip.in" ? "admin" : "user";

    // Create user with Firebase Admin (more secure)
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName || email.split("@")[0],
      emailVerified: false,
      disabled: false,
    });

    // Store user data in Firestore
    await db
      .collection(USER_COLLECTION)
      .doc(userRecord.uid)
      .set({
        ...DEFAULT_USER_DATA,
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL || null,
        role,
        emailVerified: false,
        phoneVerified: false,
        disabled: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: null,
          loginCount: 0,
        },
      });

    // Create custom token for the user
    const customToken = await auth.createCustomToken(userRecord.uid);

    // Exchange custom token for a real ID token via Firebase REST API
    // createSessionCookie requires an ID token, NOT a custom token
    const apiKey =
      process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      throw new ValidationError("Firebase API key not configured");
    }
    const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;
    const signInResponse = await fetch(signInUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    });
    const signInData = await signInResponse.json();
    if (!signInData.idToken) {
      throw new ValidationError("Failed to exchange custom token for ID token");
    }

    // Create session cookie
    const sessionCookie = await createSessionCookie(signInData.idToken);

    // Create session in Firestore for tracking
    const session = await sessionRepository.createSession(userRecord.uid, {
      deviceInfo: parseUserAgent(
        request.headers.get("user-agent") || "Unknown",
      ),
    });

    // Send verification email (async, don't wait)
    auth
      .generateEmailVerificationLink(email)
      .then((link) => {
        // TODO: Send email via your email service (Resend, SendGrid, etc.)
        console.log("Verification link:", link);
      })
      .catch((err) =>
        console.error("Failed to generate verification link:", err),
      );

    // Return success with session
    const response = NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.AUTH.REGISTER_SUCCESS,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          role,
          emailVerified: false,
        },
        sessionId: session.id,
      },
      { status: 201 },
    );

    // Set session cookie with enhanced security
    response.cookies.set("__session", sessionCookie, {
      httpOnly: true, // Prevent JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection (changed from 'lax' to 'strict')
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: "/",
    });

    // Set session ID cookie (readable by client for tracking)
    response.cookies.set("__session_id", session.id, {
      httpOnly: false, // Client needs to read this for activity tracking
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
