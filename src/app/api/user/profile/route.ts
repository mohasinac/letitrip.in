import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { requireAuth, handleAuthError } from "@/app/api/lib/auth-helpers";

/**
 * GET /api/user/profile
 * Get current user profile
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const userId = user.id;

    const db = getFirestoreAdmin();
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = { id: userDoc.id, ...userDoc.data() };

    // Remove sensitive fields
    const { password, ...safeUserData } = userData as any;

    return NextResponse.json({ user: safeUserData });
  } catch (error) {
    return handleAuthError(error);
  }
}

/**
 * PATCH /api/user/profile
 * Update current user profile
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const userId = user.id;

    const db = getFirestoreAdmin();
    const body = await req.json();

    // Validate input
    const { name, email, phone } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUserSnapshot = await db
        .collection(COLLECTIONS.USERS)
        .where("email", "==", email)
        .get();

      if (!existingUserSnapshot.empty) {
        const existingUser = existingUserSnapshot.docs[0];
        if (existingUser.id !== userId) {
          return NextResponse.json(
            { error: "Email already in use" },
            { status: 409 },
          );
        }
      }
    }

    // Update user document
    const updateData: any = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      updated_at: new Date().toISOString(),
    };

    // Only update phone if provided
    if (phone && phone.trim()) {
      updateData.phone = phone.trim();
    }

    await db.collection(COLLECTIONS.USERS).doc(userId).update(updateData);

    // Fetch updated user data
    const updatedDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    const updatedUser = { id: updatedDoc.id, ...updatedDoc.data() };

    // Remove sensitive fields
    const { password, ...safeUserData } = updatedUser as any;

    return NextResponse.json({
      message: "Profile updated successfully",
      user: safeUserData,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
