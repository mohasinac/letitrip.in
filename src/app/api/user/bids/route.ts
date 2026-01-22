/**
 * User Bids API Route
 *
 * Get all bids placed by the authenticated user.
 *
 * @route GET /api/user/bids - Get user's bids (requires auth)
 */

import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
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
 * GET - Get user's bid history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.userId;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // active, won, lost
    const pageLimit = Math.min(
      parseInt(searchParams.get("limit") || "20"),
      100,
    );
    const cursor = searchParams.get("cursor");

    // Build query
    const constraints: any[] = [where("userId", "==", userId)];

    if (status === "won") {
      constraints.push(where("isWinning", "==", true));
    } else if (status === "lost") {
      constraints.push(where("isWinning", "==", false));
    }

    constraints.push(orderBy("bidTime", "desc"));
    constraints.push(limit(pageLimit));

    if (cursor) {
      const cursorDoc = await getDocs(
        query(collection(db, "bids"), where("__name__", "==", cursor)),
      );
      if (!cursorDoc.empty) {
        constraints.push(startAfter(cursorDoc.docs[0]));
      }
    }

    // Execute query
    const bidsQuery = query(collection(db, "bids"), ...constraints);
    const querySnapshot = await getDocs(bidsQuery);

    const bids = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextCursor = lastDoc ? lastDoc.id : null;

    return NextResponse.json(
      {
        success: true,
        data: {
          bids,
          nextCursor,
          hasMore: querySnapshot.docs.length === pageLimit,
          filters: {
            status,
          },
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching user bids:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch bids",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
