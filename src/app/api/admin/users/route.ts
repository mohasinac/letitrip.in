import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";
import { UserRole } from "@/types";

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    // Admin check
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const status = searchParams.get("status"); // active, banned
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = Collections.users().orderBy("createdAt", "desc");

    // Filter by role
    if (role && role !== "all") {
      query = query.where("role", "==", role) as any;
    }

    // Filter by status (banned users have is_banned = true)
    if (status === "banned") {
      query = query.where("is_banned", "==", true) as any;
    } else if (status === "active") {
      query = query.where("is_banned", "==", false) as any;
    }

    const snapshot = await query.limit(limit).offset(offset).get();

    let users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Client-side search filter (Firestore doesn't support full-text search)
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(
        (user: any) =>
          user.email?.toLowerCase().includes(searchLower) ||
          user.name?.toLowerCase().includes(searchLower) ||
          user.phone?.includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        limit,
        offset,
        hasMore: snapshot.size === limit,
      },
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users
 * Bulk update users (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    // Admin check
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate updates
    const allowedUpdates: Record<string, any> = {};

    if (updates.role && ["user", "seller", "admin"].includes(updates.role)) {
      allowedUpdates.role = updates.role;
    }

    if (typeof updates.is_banned === "boolean") {
      allowedUpdates.is_banned = updates.is_banned;
      
      if (updates.is_banned && updates.ban_reason) {
        allowedUpdates.ban_reason = updates.ban_reason;
        allowedUpdates.banned_at = new Date().toISOString();
        allowedUpdates.banned_by = user.id;
      } else if (!updates.is_banned) {
        // Unbanning - clear ban fields
        allowedUpdates.ban_reason = null;
        allowedUpdates.banned_at = null;
        allowedUpdates.banned_by = null;
      }
    }

    if (typeof updates.emailVerified === "boolean") {
      allowedUpdates.emailVerified = updates.emailVerified;
    }

    if (typeof updates.phoneVerified === "boolean") {
      allowedUpdates.phoneVerified = updates.phoneVerified;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid updates provided" },
        { status: 400 }
      );
    }

    allowedUpdates.updatedAt = new Date().toISOString();

    await Collections.users().doc(userId).update(allowedUpdates);

    // Fetch updated user
    const userDoc = await Collections.users().doc(userId).get();
    const userData = { id: userDoc.id, ...userDoc.data() };

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: userData,
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
      },
      { status: 500 }
    );
  }
}
