/**
 * User Session API Route
 *
 * Gets current user session and profile information.
 * Returns user data if authenticated, null if not.
 *
 * @route GET /api/auth/session
 *
 * @example
 * ```tsx
 * const response = await fetch('/api/auth/session');
 * const data = await response.json();
 * if (data.user) {
 *   console.log('User is logged in:', data.user);
 * }
 * ```
 */

import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get current user from Firebase Auth
    const user = auth.currentUser;

    if (!user) {
      return NextResponse.json(
        {
          success: true,
          user: null,
          message: "No active session",
        },
        { status: 200 },
      );
    }

    // Get user profile from Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Return basic user info if profile doesn't exist
      return NextResponse.json(
        {
          success: true,
          user: {
            uid: user.uid,
            email: user.email,
            name: user.displayName || "User",
            emailVerified: user.emailVerified,
            role: "user",
            profileComplete: false,
          },
        },
        { status: 200 },
      );
    }

    const userData = userDoc.data();

    // Return user session data
    return NextResponse.json(
      {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: userData.name || user.displayName || "User",
          phone: userData.phone || null,
          emailVerified: user.emailVerified,
          role: userData.role || "user",
          profileComplete: userData.profileComplete || false,
          // Additional profile data
          addresses: userData.addresses || [],
          wishlist: userData.wishlist || [],
          totalOrders: userData.totalOrders || 0,
          totalSpent: userData.totalSpent || 0,
          createdAt: userData.createdAt,
          lastLoginAt: userData.lastLoginAt,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Session error:", error);

    // Return error response
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 },
    );
  }
}
