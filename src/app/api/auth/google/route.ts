import { getAuthAdmin, getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Google OAuth Sign-In
 * POST /api/auth/google
 *
 * Verifies a Google ID token and creates/updates user in Firestore
 * Returns a session cookie for authenticated requests
 */

interface GoogleAuthRequest {
  idToken: string;
  userData?: {
    displayName?: string;
    email?: string;
    photoURL?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: GoogleAuthRequest = await request.json();
    const { idToken, userData } = body;

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: "ID token is required" },
        { status: 400 },
      );
    }

    const auth = getAuthAdmin();
    const db = getFirestoreAdmin();

    // Verify the Google ID token
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error("Failed to verify ID token:", error);
      return NextResponse.json(
        { success: false, error: "Invalid ID token" },
        { status: 401 },
      );
    }

    const { uid, email, name, picture, email_verified } = decodedToken;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required from Google account" },
        { status: 400 },
      );
    }

    // Check if user exists
    const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
    const userDoc = await userRef.get();

    let isNewUser = false;
    let user: Record<string, any>;

    if (userDoc.exists) {
      // Update existing user with latest Google info
      const existingData = userDoc.data();
      const updateData: Record<string, any> = {
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEmailVerified: email_verified || existingData?.isEmailVerified,
      };

      // Update profile photo if user doesn't have one or if they're using Google photo
      if (
        picture &&
        (!existingData?.profile?.avatar ||
          existingData?.profile?.avatar?.includes("googleusercontent.com"))
      ) {
        updateData["profile.avatar"] = picture;
      }

      // Update name if provided and user hasn't customized it
      const displayName = userData?.displayName || name;
      if (displayName && existingData?.name === existingData?.email) {
        updateData.name = displayName;
      }

      await userRef.update(updateData);

      user = {
        ...existingData,
        ...updateData,
        uid,
      };
    } else {
      // Create new user
      isNewUser = true;
      const displayName = userData?.displayName || name || email.split("@")[0];
      const now = new Date().toISOString();

      user = {
        uid,
        email,
        name: displayName,
        role: "user",
        status: "active",
        isEmailVerified: email_verified || false,
        provider: "google",
        profile: {
          avatar: picture || userData?.photoURL || null,
          bio: null,
          address: null,
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            orderUpdates: true,
            auctionUpdates: true,
            promotions: false,
          },
          currency: "INR",
          language: "en",
        },
        stats: {
          totalOrders: 0,
          totalSpent: 0,
          totalSales: 0,
        },
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      };

      await userRef.set(user);
    }

    // Create a session cookie
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });

    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: isNewUser
        ? "Account created successfully with Google"
        : "Signed in successfully with Google",
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profile: user.profile,
      },
      isNewUser,
      sessionId: sessionCookie.substring(0, 20), // Return partial session ID for reference
    });
  } catch (error) {
    console.error("Google auth error:", error);
    const message =
      error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
