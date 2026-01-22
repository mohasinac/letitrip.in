/**
 * User Login API Route
 *
 * Handles user authentication with Firebase ID token.
 * Creates secure httpOnly session cookie (token never sent to client).
 * Supports email/password and social login (Google, Facebook).
 *
 * @route POST /api/auth/login
 *
 * @example
 * ```tsx
 * // Client-side: Sign in with Firebase
 * const userCredential = await signInWithEmailAndPassword(auth, email, password);
 * const idToken = await userCredential.user.getIdToken();
 *
 * // Send token to server to create session
 * const response = await fetch('/api/auth/login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ idToken })
 * });
 * ```
 */

import { createSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 },
      );
    }

    // Create secure session (token stored in httpOnly cookie)
    const sessionData = await createSession(idToken);

    return NextResponse.json({
      success: true,
      user: sessionData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: "Authentication failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 401 },
    );
  }
}
