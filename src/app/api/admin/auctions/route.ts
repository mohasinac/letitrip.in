/**
 * Admin Auctions API
 *
 * View all platform auctions for moderation.
 *
 * @route GET /api/admin/auctions - List all auctions (requires admin)
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
 * GET - List all auctions
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin"]);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const pageLimit = Math.min(
      parseInt(searchParams.get("limit") || "20"),
      100,
    );
    const cursor = searchParams.get("cursor");

    // Build query
    const constraints: any[] = [];

    if (status) {
      constraints.push(where("status", "==", status));
    }

    constraints.push(orderBy("createdAt", "desc"));
    constraints.push(limit(pageLimit));

    if (cursor) {
      const cursorDoc = await getDocs(
        query(collection(db, "auctions"), where("__name__", "==", cursor)),
      );
      if (!cursorDoc.empty) {
        constraints.push(startAfter(cursorDoc.docs[0]));
      }
    }

    const auctionsQuery = query(collection(db, "auctions"), ...constraints);
    const querySnapshot = await getDocs(auctionsQuery);

    const auctions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextCursor = lastDoc ? lastDoc.id : null;

    return NextResponse.json(
      {
        success: true,
        data: {
          auctions,
          nextCursor,
          hasMore: querySnapshot.docs.length === pageLimit,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching auctions:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch auctions",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
