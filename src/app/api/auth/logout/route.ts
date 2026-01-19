/**
 * User Logout API Route
 * 
 * Handles user logout by signing out from Firebase Auth.
 * Clears user session and authentication state.
 * 
 * @route POST /api/auth/logout
 * 
 * @example
 * ```tsx
 * const response = await fetch('/api/auth/logout', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' }
 * });
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export async function POST(request: NextRequest) {
  try {
    // Sign out from Firebase Auth
    await signOut(auth);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Logout successful",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Logout error:", error);

    // Generic error response
    return NextResponse.json(
      { error: "Logout failed. Please try again." },
      { status: 500 }
    );
  }
}
