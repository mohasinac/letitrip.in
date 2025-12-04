import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireRole,
} from "@/app/api/middleware/rbac-auth";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/users/[id]
 * Get user by ID
 * - Admin: Can view any user
 * - User: Can only view their own profile
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let id: string | undefined;
  try {
    const awaitedParams = await context.params;
    id = awaitedParams.id;
    const user = await getUserFromRequest(request);

    // Users can view their own profile, admins can view any profile
    if (!user || (user.uid !== id && user.role !== "admin")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const userDoc = await Collections.users().doc(id).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: userDoc.id, ...userDoc.data() },
    });
  } catch (error: any) {
    logError(error as Error, {
      component: "API.users.get",
      metadata: { userId: id },
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[id]
 * Update user
 * - Admin: Can update any user
 * - User: Can update their own profile (limited fields)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let id: string | undefined;
  try {
    const awaitedParams = await context.params;
    id = awaitedParams.id;
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { updates } = body;

    if (!updates) {
      return NextResponse.json(
        { success: false, error: "Updates are required" },
        { status: 400 }
      );
    }

    const isAdmin = user.role === "admin";
    const isOwner = user.uid === id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Validate updates based on role
    const allowedUpdates: Record<string, any> = {};

    if (isAdmin) {
      // Admin can update role, ban status, etc.
      if (updates.role && ["user", "seller", "admin"].includes(updates.role)) {
        allowedUpdates.role = updates.role;
      }

      if (typeof updates.is_banned === "boolean") {
        allowedUpdates.is_banned = updates.is_banned;

        if (updates.is_banned && updates.ban_reason) {
          allowedUpdates.ban_reason = updates.ban_reason;
          allowedUpdates.banned_at = new Date().toISOString();
          allowedUpdates.banned_by = user.uid;
        } else if (!updates.is_banned) {
          // Unbanning - clear ban fields
          allowedUpdates.ban_reason = null;
          allowedUpdates.banned_at = null;
          allowedUpdates.banned_by = null;
        }
      }

      if (typeof updates.email_verified === "boolean") {
        allowedUpdates.email_verified = updates.email_verified;
      }

      if (typeof updates.phone_verified === "boolean") {
        allowedUpdates.phone_verified = updates.phone_verified;
      }
    }

    // Both admin and owner can update these fields
    if (updates.name) allowedUpdates.name = updates.name;
    if (updates.phone) allowedUpdates.phone = updates.phone;
    if (updates.address) allowedUpdates.address = updates.address;
    if (updates.avatar) allowedUpdates.avatar = updates.avatar;

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid updates provided" },
        { status: 400 }
      );
    }

    allowedUpdates.updated_at = new Date().toISOString();

    await Collections.users().doc(id).update(allowedUpdates);

    // Fetch updated user
    const userDoc = await Collections.users().doc(id).get();
    const userData = { id: userDoc.id, ...userDoc.data() };

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: userData,
    });
  } catch (error: any) {
    logError(error as Error, {
      component: "API.users.update",
      metadata: { userId: id },
    });
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Delete user (admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let id: string | undefined;
  try {
    const awaitedParams = await context.params;
    id = awaitedParams.id;
    const authResult = await requireRole(request, ["admin"]);
    if (authResult.error) return authResult.error;

    const userDoc = await Collections.users().doc(id).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    await Collections.users().doc(id).delete();

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    logError(error as Error, {
      component: "API.users.delete",
      metadata: { userId: id },
    });
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
