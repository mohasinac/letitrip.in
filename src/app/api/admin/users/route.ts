/**
 * Admin Users API
 *
 * Manage platform users.
 *
 * @route GET /api/admin/users - List all users (requires admin)
 */

import { db } from "@/lib/firebase";
import { requireRole } from "@/lib/session";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET - List all users with filtering
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin"]);

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const pageLimit = Math.min(
      parseInt(searchParams.get("limit") || "20"),
      100,
    );
    const cursor = searchParams.get("cursor");

    // Build query
    const constraints: any[] = [];

    if (role) {
      constraints.push(where("role", "==", role));
    }

    if (status) {
      constraints.push(where("status", "==", status));
    }

    constraints.push(orderBy("createdAt", "desc"));
    constraints.push(limit(pageLimit));

    if (cursor) {
      const cursorDoc = await getDocs(
        query(collection(db, "users"), where("__name__", "==", cursor)),
      );
      if (!cursorDoc.empty) {
        constraints.push(startAfter(cursorDoc.docs[0]));
      }
    }

    const usersQuery = query(collection(db, "users"), ...constraints);
    const querySnapshot = await getDocs(usersQuery);

    const users = querySnapshot.docs.map((doc) => {
      const userData = doc.data();
      // Remove sensitive fields
      const { passwordHash, ...safeData } = userData;
      return {
        id: doc.id,
        ...safeData,
      };
    });

    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextCursor = lastDoc ? lastDoc.id : null;

    return NextResponse.json(
      {
        success: true,
        data: {
          users,
          nextCursor,
          hasMore: querySnapshot.docs.length === pageLimit,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching users:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
