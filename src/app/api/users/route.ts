import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { requireRole } from "@/app/api/middleware/rbac-auth";
import {
  parseSieveQuery,
  usersSieveConfig,
  createPaginationMeta,
} from "@/app/api/lib/sieve";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
  isValidEmail,
} from "@/constants/validation-messages";

// Extended Sieve config with field mappings for users
const usersConfig = {
  ...usersSieveConfig,
  fieldMappings: {
    displayName: "name",
    createdAt: "created_at",
    updatedAt: "updated_at",
    lastLogin: "last_login",
    emailVerified: "email_verified",
    isBanned: "is_banned",
  } as Record<string, string>,
};

/**
 * Transform user document to API response format
 */
function transformUser(id: string, data: any) {
  return {
    id,
    ...data,
    displayName: data.name,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    lastLogin: data.last_login,
    emailVerified: data.email_verified,
    isBanned: data.is_banned,
  };
}

/**
 * GET /api/users
 * List users with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-createdAt&filters=role==admin
 * - Admin: Can view all users
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin role for listing users
    const authResult = await requireRole(request, ["admin"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);

    // Parse Sieve query
    const {
      query: sieveQuery,
      errors,
      warnings,
    } = parseSieveQuery(searchParams, usersConfig);

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: errors,
        },
        { status: 400 },
      );
    }

    let query: FirebaseFirestore.Query = Collections.users();

    // Legacy query params support (for backward compatibility)
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

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

    // Apply Sieve filters
    for (const filter of sieveQuery.filters) {
      const dbField = usersConfig.fieldMappings[filter.field] || filter.field;
      if (["==", "!=", ">", ">=", "<", "<="].includes(filter.operator)) {
        query = query.where(
          dbField,
          filter.operator as FirebaseFirestore.WhereFilterOp,
          filter.value,
        );
      }
    }

    // Apply sorting
    if (sieveQuery.sorts.length > 0) {
      for (const sort of sieveQuery.sorts) {
        const dbField = usersConfig.fieldMappings[sort.field] || sort.field;
        query = query.orderBy(dbField, sort.direction);
      }
    } else {
      query = query.orderBy("created_at", "desc");
    }

    // Get total count
    const countSnapshot = await query.count().get();
    const totalCount = countSnapshot.data().count;

    // Apply pagination
    const offset = (sieveQuery.page - 1) * sieveQuery.pageSize;
    if (offset > 0) {
      const skipSnapshot = await query.limit(offset).get();
      const lastDoc = skipSnapshot.docs.at(-1);
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
    }
    query = query.limit(sieveQuery.pageSize);

    // Execute query
    const snapshot = await query.get();
    let data = snapshot.docs.map((doc) => transformUser(doc.id, doc.data()));

    // Client-side search filter (Firestore doesn't support full-text search)
    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter(
        (user: any) =>
          user.email?.toLowerCase().includes(searchLower) ||
          user.name?.toLowerCase().includes(searchLower) ||
          user.phone?.includes(search),
      );
    }

    // Build response with Sieve pagination meta
    const pagination = createPaginationMeta(
      search ? data.length : totalCount,
      sieveQuery,
    );

    return NextResponse.json({
      success: true,
      data,
      pagination,
      meta: {
        appliedFilters: sieveQuery.filters,
        appliedSorts: sieveQuery.sorts,
        warnings: warnings.length > 0 ? warnings : undefined,
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 },
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

    const body = await request.json();
    const { email, name, role = "user", phone } = body;

    // Validation
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = VALIDATION_MESSAGES.REQUIRED.FIELD("Email");
    } else if (!isValidEmail(email)) {
      errors.email = VALIDATION_MESSAGES.EMAIL.INVALID;
    }

    if (!name) {
      errors.name = VALIDATION_MESSAGES.REQUIRED.FIELD("Name");
    } else if (
      name.length < VALIDATION_RULES.NAME.MIN_LENGTH ||
      name.length > VALIDATION_RULES.NAME.MAX_LENGTH
    ) {
      errors.name = `Name must be between ${VALIDATION_RULES.NAME.MIN_LENGTH} and ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`;
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, error: "Validation failed", errors },
        { status: 400 },
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
        { status: 400 },
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
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Failed to create user:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 },
    );
  }
}
