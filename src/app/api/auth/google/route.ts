/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auth/google/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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
  /** Id Token */
  idToken: string;
  /** User Data */
  userData?: {
    /** Display Name */
    displayName?: string;
    /** Email */
    email?: string;
    /** Photo U R L */
    photoURL?: string;
  };
}

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

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
        /** Last Login At */
        lastLoginAt: new Date().toISOString(),
        /** Updated At */
        updatedAt: new Date().toISOString(),
        /** Is Email Verified */
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
        /** Name */
        name: displayName,
        /** Role */
        role: "user",
        /** Status */
        status: "active",
        /** Is Email Verified */
        isEmailVerified: email_verified || false,
        /** Provider */
        provider: "google",
        /** Profile */
        profile: {
          /** Avatar */
          avatar: picture || userData?.photoURL || null,
          /** Bio */
          bio: null,
          /** Address */
          address: null,
        },
        /** Preferences */
        preferences: {
          /** Notifications */
          notifications: {
            /** Email */
            email: true,
            /** Push */
            push: true,
            /** Order Updates */
            orderUpdates: true,
            /** Auction Updates */
            auctionUpdates: true,
            /** Promotions */
            promotions: false,
          },
          /** Currency */
          currency: "INR",
          /** Language */
          language: "en",
        },
        /** Stats */
        stats: {
          /** Total Orders */
          totalOrders: 0,
          /** Total Spent */
          totalSpent: 0,
          /** Total Sales */
          totalSales: 0,
        },
        /** Created At */
        createdAt: now,
        /** Updated At */
        updatedAt: now,
        /** Last Login At */
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
      /** Max Age */
      maxAge: expiresIn / 1000,
      /** Http Only */
      httpOnly: true,
      /** Secure */
      secure: process.env.NODE_ENV === "production",
      /** Same Site */
      sameSite: "lax",
      /** Path */
      path: "/",
    });

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: isNewUser
        ? "Account created successfully with Google"
        : "Signed in successfully with Google",
      /** User */
      user: {
        /** Uid */
        uid: user.uid,
        /** Email */
        email: user.email,
        /** Name */
        name: user.name,
        /** Role */
        role: user.role,
        /** Is Email Verified */
        isEmailVerified: user.isEmailVerified,
        /** Profile */
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
