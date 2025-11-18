import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireRole,
} from "@/app/api/middleware/rbac-auth";
import { ApiError } from "@/lib/api-errors";
import {
  parsePaginationParams,
  executeCursorPaginatedQuery,
} from "@/app/api/lib/utils/pagination";

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

    // Filter params
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const status = searchParams.get("status"); // active, banned

    // Sort params
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    let query: FirebaseFirestore.Query = Collections.users();

    // Filter by role
    if (role && role !== "all") {
      query = query.where("role", "==", role);
    }

    // Filter by status (banned users have is_banned = true)
    if (status === "banned") {
      query = query.where("is_banned", "==", true);
    } else if (status === "active") {
      query = query.where("is_banned", "==", false);
    }

    // Add sorting
    const validSortFields = ["created_at", "last_login", "name"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    query = query.orderBy(sortField, sortOrder);

    // Execute paginated query
    const response = await executeCursorPaginatedQuery(
      query,
      searchParams,
      (id) => Collections.users().doc(id).get(),
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      }),
      50, // defaultLimit
      200 // maxLimit
    );

    // Client-side search filter (Firestore doesn't support full-text search)
    if (search) {
      const searchLower = search.toLowerCase();
      response.data = response.data.filter(
        (user: any) =>
          user.email?.toLowerCase().includes(searchLower) ||
          user.name?.toLowerCase().includes(searchLower) ||
          user.phone?.includes(search)
      );
      response.count = response.data.length;
    }

    return NextResponse.json(response);
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
