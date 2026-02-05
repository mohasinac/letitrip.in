/**
 * Session Management API
 * POST /api/auth/session - Create session cookie from Firebase ID token
 * DELETE /api/auth/session - Clear session cookie (logout)
 */

import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/firebase/auth-server";
import { cookies } from "next/headers";

/**
 * Create session cookie
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: "ID token required" },
        { status: 400 },
      );
    }

    // Create session cookie (5 days expiry)
    const sessionCookie = await createSessionCookie(idToken);

    // Set the cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create session" },
      { status: 500 },
    );
  }
}

/**
 * Clear session cookie (logout)
 */
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });

    // Clear the session cookie
    response.cookies.delete("__session");

    return response;
  } catch (error: any) {
    console.error("Session deletion error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to clear session" },
      { status: 500 },
    );
  }
}
