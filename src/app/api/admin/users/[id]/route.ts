/**
 * Admin User Management API
 *
 * Get and manage individual user.
 *
 * @route GET /api/admin/users/[id] - Get user details (requires admin)
 */

import { db } from "@/lib/firebase";
import { requireRole } from "@/lib/session";
import { doc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET - Get user details
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await requireRole(["admin"]);
    const { id } = await context.params;

    const userDoc = await getDoc(doc(db, "users", id));

    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    // Remove sensitive fields
    const { passwordHash, ...safeData } = userData;

    return NextResponse.json(
      {
        success: true,
        data: {
          id: userDoc.id,
          ...safeData,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching user:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch user",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
