/**
 * User Avatar Upload API
 *
 * Handles avatar image upload and update for user profiles.
 * Images are stored in Firebase Storage and URL saved to Firestore.
 *
 * @route POST /api/user/avatar - Upload avatar
 * @route DELETE /api/user/avatar - Remove avatar
 *
 * @example
 * ```tsx
 * // Upload avatar (multipart/form-data)
 * const formData = new FormData();
 * formData.append('avatar', fileInput.files[0]);
 * const response = await fetch('/api/user/avatar', {
 *   method: 'POST',
 *   body: formData
 * });
 * ```
 */

import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST - Upload user avatar
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.userId;

    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Avatar file is required" },
        { status: 400 },
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF allowed" },
        { status: 400 },
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 },
      );
    }

    // In production, upload to Firebase Storage
    // For now, return a mock URL
    const avatarUrl = `https://storage.example.com/avatars/${userId}/${Date.now()}-${
      file.name
    }`;

    // Update user profile with avatar URL
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      avatar: avatarUrl,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Avatar uploaded successfully",
        data: {
          avatarUrl,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error uploading avatar:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to upload avatar",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE - Remove user avatar
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.userId;

    // Get current user data
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();

    // Remove avatar from storage (implement in production)
    // await deleteFromStorage(userData.avatar);

    // Update user profile to remove avatar
    await updateDoc(userRef, {
      avatar: null,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Avatar removed successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error removing avatar:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to remove avatar",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
