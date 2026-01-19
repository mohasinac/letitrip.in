/**
 * User Login API Route
 * 
 * Handles user authentication with email/password.
 * Returns user session data and updates last login timestamp.
 * 
 * @route POST /api/auth/login
 * 
 * @example
 * ```tsx
 * const response = await fetch('/api/auth/login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     email: 'user@example.com',
 *     password: 'securePassword123'
 *   })
 * });
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

interface LoginRequestBody {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequestBody = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Get user profile from Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Create basic profile if it doesn't exist
      const newProfile = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "User",
        role: "user",
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };
      await updateDoc(userDocRef, newProfile);
    } else {
      // Update last login timestamp
      await updateDoc(userDocRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const userData = userDoc.exists() ? userDoc.data() : null;

    // Get ID token for session management
    const idToken = await user.getIdToken();

    // Return success response with user data
    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          uid: user.uid,
          email: user.email,
          name: user.displayName || userData?.name || "User",
          emailVerified: user.emailVerified,
          role: userData?.role || "user",
          profileComplete: userData?.profileComplete || false,
        },
        token: idToken,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);

    // Handle Firebase Auth errors
    if (
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (error.code === "auth/invalid-email") {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (error.code === "auth/user-disabled") {
      return NextResponse.json(
        { error: "This account has been disabled" },
        { status: 403 }
      );
    }

    if (error.code === "auth/too-many-requests") {
      return NextResponse.json(
        { error: "Too many failed login attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
