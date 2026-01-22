/**
 * User Profile API Routes
 *
 * Handles user profile management. Uses session for authentication.
 *
 * @route GET /api/user/profile - Get current user profile (requires auth)
 * @route PUT /api/user/profile - Update current user profile (requires auth)
 *
 * @example
 * ```tsx
 * // Get profile (uses session automatically)
 * const response = await fetch('/api/user/profile');
 *
 * // Update profile
 * const response = await fetch('/api/user/profile', {
 *   method: 'PUT',
 *   body: JSON.stringify({
 *     displayName: 'John Doe',
 *     phone: '+91 1234567890',
 *     bio: 'Software developer'
 *   })
 * });
 * ```
 */

import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/user/profile
 *
 * Get current user's profile data (requires authentication)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.userId;

    // Get user document
    const userDoc = await getDoc(doc(db, "users", userId));

    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData: any = {
      id: userDoc.id,
      ...userDoc.data(),
    };

    // Remove sensitive fields
    delete userData.password;
    delete userData.passwordResetToken;

    return NextResponse.json(
      {
        success: true,
        data: userData,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching user profile:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch profile", details: error.message },
      { status: 500 },
    );
  }
}

interface UpdateProfileRequest {
  displayName?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  preferences?: {
    notifications?: boolean;
    newsletter?: boolean;
    darkMode?: boolean;
    language?: string;
  };
}

/**
 * PUT /api/user/profile
 *
 * Update current user's profile data (requires authentication).
 * Cannot update: email, role, verified status, or stats.
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.userId;

    const body: UpdateProfileRequest = await request.json();
    const { displayName, phone, avatar, bio, preferences } = body;

    // Check if user exists
    const userDoc = await getDoc(doc(db, "users", userId));

    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build update object (only allow specific fields)
    const updates: any = {
      updatedAt: serverTimestamp(),
    };

    if (displayName !== undefined) updates.displayName = displayName;
    if (phone !== undefined) updates.phone = phone;
    if (avatar !== undefined) updates.avatar = avatar;
    if (bio !== undefined) updates.bio = bio;
    if (preferences) updates.preferences = preferences;

    // Update user profile
    await updateDoc(doc(db, "users", userId), updates);

    // Get updated data
    const updatedDoc = await getDoc(doc(db, "users", userId));
    const updatedData: any = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };

    // Remove sensitive fields
    delete updatedData.password;
    delete updatedData.passwordResetToken;

    return NextResponse.json(
      {
        success: true,
        data: updatedData,
        message: "Profile updated successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating user profile:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to update profile" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile", details: error.message },
      { status: 500 },
    );
  }
}
