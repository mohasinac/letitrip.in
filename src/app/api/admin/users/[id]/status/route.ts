/**
 * Admin User Status Management API
 *
 * Ban/unban users.
 *
 * @route PUT /api/admin/users/[id]/status - Update user status (requires admin)
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
 * PUT - Ban/unban user
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireRole(["admin"]);
    const { id } = await context.params;

    const body = await request.json();
    const { status, reason } = body;

    // Validate status
    const allowedStatuses = ["active", "banned", "suspended"];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: active, banned, suspended" },
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
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (reason) {
      updateData.statusReason = reason;
    }

    if (status === "banned") {
      updateData.bannedAt = serverTimestamp();
    }

    await updateDoc(doc(db, "users", id), updateData);

    // Disable Firebase Auth account if banned
    if (userData.firebaseUid) {
      try {
        await adminAuth.updateUser(userData.firebaseUid, {
          disabled: status === "banned",
        });
      } catch (authError) {
        console.error("Error updating auth status:", authError);
        // Continue even if auth update fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `User ${
          status === "banned" ? "banned" : "status updated"
        } successfully`,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating user status:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to update user status",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
