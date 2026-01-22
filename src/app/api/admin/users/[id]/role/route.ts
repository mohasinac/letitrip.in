/**
 * Admin User Role Management API
 *
 * Update user role.
 *
 * @route PUT /api/admin/users/[id]/role - Update user role (requires admin)
 */

import { db } from "@/lib/firebase";
import { adminAuth } from "@/lib/firebase-admin";
import { requireRole } from "@/lib/session";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PUT - Update user role
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireRole(["admin"]);
    const { id } = await context.params;

    const body = await request.json();
    const { role } = body;

    // Validate role
    const allowedRoles = ["user", "seller", "admin"];
    if (!role || !allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be: user, seller, admin" },
        { status: 400 },
      );
    }

    // Get user
    const userDoc = await getDoc(doc(db, "users", id));

    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();

    // Update Firestore
    await updateDoc(doc(db, "users", id), {
      role,
      updatedAt: serverTimestamp(),
    });

    // Update Firebase Auth custom claims
    if (userData.firebaseUid) {
      try {
        await adminAuth.setCustomUserClaims(userData.firebaseUid, { role });
      } catch (authError) {
        console.error("Error updating auth claims:", authError);
        // Continue even if auth update fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "User role updated successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating user role:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to update user role",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
