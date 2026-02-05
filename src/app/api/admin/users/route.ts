/**
 * API Route: Get All Users (Admin Only)
 * GET /api/admin/users
 *
 * Returns paginated list of users with search/filter capabilities
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/firebase/auth-server";
import { requireRole } from "@/lib/security/authorization";
import { handleApiError, AuthorizationError } from "@/lib/errors";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { USER_COLLECTION } from "@/db/schema/users";

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const user = await getAuthenticatedUser();
    requireRole(user, ["admin", "moderator"]);

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const searchEmail = searchParams.get("email") || "";
    const filterRole = searchParams.get("role") || "";
    const filterStatus = searchParams.get("status") || ""; // active, disabled

    // Build query
    let usersQuery = query(
      collection(db, USER_COLLECTION),
      orderBy("createdAt", "desc"),
    );

    // Apply filters
    if (filterRole) {
      usersQuery = query(usersQuery, where("role", "==", filterRole));
    }

    if (filterStatus === "disabled") {
      usersQuery = query(usersQuery, where("disabled", "==", true));
    } else if (filterStatus === "active") {
      usersQuery = query(usersQuery, where("disabled", "==", false));
    }

    // Apply pagination
    const skip = (page - 1) * pageSize;
    usersQuery = query(usersQuery, limit(pageSize));

    // Execute query
    const snapshot = await getDocs(usersQuery);
    let users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Client-side search (Firestore doesn't support text search)
    if (searchEmail) {
      users = users.filter((u: any) =>
        u.email?.toLowerCase().includes(searchEmail.toLowerCase()),
      );
    }

    // Get total count
    const totalSnapshot = await getDocs(collection(db, USER_COLLECTION));
    const total = totalSnapshot.size;

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
