import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth/firebase-api-auth";
import { getAdminDb } from "@/lib/database/admin";

// GET /api/user/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(user.uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      data: {
        id: userDoc.id,
        uid: user.uid,
        ...userData,
      },
    });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const db = getAdminDb();

    // Only allow updating certain fields
    const allowedFields = ["name", "phone", "avatar", "addresses"];
    const updates: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 },
      );
    }

    // Add updated timestamp
    updates.updatedAt = new Date().toISOString();

    // Update user document
    await db.collection("users").doc(user.uid).update(updates);

    // Fetch updated user data
    const updatedDoc = await db.collection("users").doc(user.uid).get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc.id,
        uid: user.uid,
        ...updatedData,
      },
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile" },
      { status: 500 },
    );
  }
}
