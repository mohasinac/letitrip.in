/**
 * User Registration API Route
 *
 * Handles new user registration with Firebase ID token.
 * Creates user profile in Firestore and sets custom claims.
 * Supports role selection on localhost for development/testing.
 *
 * @route POST /api/auth/register
 *
 * @example
 * ```tsx
 * // Client-side: Create user with Firebase
 * const userCredential = await createUserWithEmailAndPassword(auth, email, password);
 * const idToken = await userCredential.user.getIdToken();
 *
 * // Send token to server to create profile
 * const response = await fetch('/api/auth/register', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     idToken,
 *     name: 'John Doe',
 *     phone: '+919876543210',
 *     role: 'admin' // Only works on localhost
 *   })
 * });
 * ```
 */

import { adminDb, setCustomUserClaims } from "@/lib/firebase-admin";
import { createSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { idToken, role, name, phone } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 },
      );
    }

    // Create session to get user ID
    const sessionData = await createSession(idToken);

    // Determine role (only allow role selection on localhost)
    const isLocalhost =
      request.headers.get("host")?.includes("localhost") ||
      request.headers.get("host")?.includes("127.0.0.1");

    const userRole = isLocalhost && role ? role : "user";

    // Create user profile in Firestore
    await adminDb
      .collection("users")
      .doc(sessionData.userId)
      .set(
        {
          name: name || sessionData.name || "",
          email: sessionData.email,
          phone: phone || "",
          role: userRole,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
          emailVerified: false,
        },
        { merge: true },
      );

    // Set custom claims for role-based access control
    await setCustomUserClaims(sessionData.userId, {
      role: userRole,
    });

    return NextResponse.json({
      success: true,
      user: {
        ...sessionData,
        role: userRole,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error: "Registration failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
