import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireRole,
} from "@/app/api/middleware/rbac-auth";
import { ApiError } from "@/lib/api-errors";

/**
 * GET /api/users
 * List users
 * - Admin: Can view all users
 * - User: Can only view their own profile (redirected to /api/users/me)
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin role for listing users
    const authResult = await requireRole(request, ["admin"]);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const status = searchParams.get("status"); // active, banned
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = Collections.users().orderBy("created_at", "desc");

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
  } catch (error: any) {
    console.error("Failed to fetch users:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create a new user (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRole(request, ["admin"]);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const body = await request.json();
    const { email, name, role = "user", phone } = body;

    // Validation
    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: "Email and name are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await Collections.users()
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      );
    }

    const newUser = {
      email,
      name,
      role,
      phone: phone || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_banned: false,
      email_verified: false,
      phone_verified: false,
    };

    const docRef = await Collections.users().add(newUser);
    const userDoc = await docRef.get();

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: { id: docRef.id, ...userDoc.data() },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create user:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
