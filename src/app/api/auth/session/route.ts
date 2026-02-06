/**
 * Session Management API
 * POST /api/auth/session - Create session cookie from Firebase ID token
 * DELETE /api/auth/session - Clear session cookie (logout)
 */

import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors";
import { ValidationError } from "@/lib/errors";
import { UI_LABELS } from "@/constants";

/**
 * Create session cookie
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      throw new ValidationError(UI_LABELS.AUTH.ID_TOKEN_REQUIRED);
    }

    // Create session cookie (5 days expiry)
    const sessionCookie = await createSessionCookie(idToken);

    // Set the cookie
    const response = NextResponse.json({ success: true });
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

/**
 * Clear session cookie (logout)
 */
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });

    // Clear the session cookie
    response.cookies.delete("__session");

    return response;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
