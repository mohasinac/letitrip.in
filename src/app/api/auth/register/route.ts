/**
 * User Registration API Route
 *
 * Handles new user registration with email/password authentication.
 * Creates user account in Firebase Auth and user profile in Firestore.
 *
 * @route POST /api/auth/register
 *
 * @example
 * ```tsx
 * const response = await fetch('/api/auth/register', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     email: 'user@example.com',
 *     password: 'securePassword123',
 *     name: 'John Doe',
 *     phone: '+919876543210'
 *   })
 * });
 * ```
 */

import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RegisterRequestBody {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequestBody = await request.json();
    const { email, password, name, phone } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Update user profile with display name
    await updateProfile(user, {
      displayName: name,
    });

    // Send email verification
    try {
      await sendEmailVerification(user);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email verification fails
    }

    // Create user profile in Firestore
    const userProfile = {
      uid: user.uid,
      email: user.email,
      name: name,
      phone: phone || null,
      role: "user", // Default role
      emailVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      profileComplete: !!phone, // Consider profile complete if phone is provided
      // Additional fields
      addresses: [],
      wishlist: [],
      cart: [],
      // Analytics
      totalOrders: 0,
      totalSpent: 0,
      lastLoginAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", user.uid), userProfile);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email.",
        user: {
          uid: user.uid,
          email: user.email,
          name: name,
          emailVerified: user.emailVerified,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle Firebase Auth errors
    if (error.code === "auth/email-already-in-use") {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 },
      );
    }

    if (error.code === "auth/invalid-email") {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    if (error.code === "auth/weak-password") {
      return NextResponse.json(
        { error: "Password is too weak" },
        { status: 400 },
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
