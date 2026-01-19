/**
 * User Profile API Routes
 * 
 * Handles user profile management including profile data and addresses.
 * 
 * @route GET /api/user/profile - Get user profile
 * @route PUT /api/user/profile - Update user profile
 * 
 * @example
 * ```tsx
 * // Get profile
 * const response = await fetch('/api/user/profile?userId=user-id');
 * 
 * // Update profile
 * const response = await fetch('/api/user/profile', {
 *   method: 'PUT',
 *   body: JSON.stringify({
 *     userId: 'user-id',
 *     displayName: 'John Doe',
 *     phone: '+91 1234567890',
 *     ...
 *   })
 * });
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * GET /api/user/profile
 * 
 * Get user profile data.
 * 
 * Query Parameters:
 * - userId: User ID (required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Get user document
    const userDoc = await getDoc(doc(db, "users", userId));

    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
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
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile", details: error.message },
      { status: 500 }
    );
  }
}

interface UpdateProfileRequest {
  userId: string;
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
 * Update user profile data.
 * Cannot update: email, role, verified status, or stats.
 * 
 * Request Body:
 * - userId: User ID (required)
 * - displayName: Display name
 * - phone: Phone number
 * - avatar: Avatar URL
 * - bio: User biography
 * - preferences: User preferences object
 */
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateProfileRequest = await request.json();
    const { userId, displayName, phone, avatar, bio, preferences } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const userDoc = await getDoc(doc(db, "users", userId));

    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
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
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating user profile:", error);

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to update profile" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile", details: error.message },
      { status: 500 }
    );
  }
}
