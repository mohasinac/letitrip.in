/**
 * End Auction API
 *
 * Manually end an auction early.
 *
 * @route POST /api/seller/auctions/[id]/end - End auction (requires seller/admin, ownership)
 */

import { db } from "@/lib/firebase";
import { requireRole } from "@/lib/session";
import {
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST - End auction early
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireRole(["seller", "admin"]);
    const userId = session.userId;
    const isAdmin = session.role === "admin";
    const { id } = await context.params;

    // Get auction by slug
    const auctionQuery = query(
      collection(db, "auctions"),
      where("slug", "==", id),
    );
    const auctionSnapshot = await getDocs(auctionQuery);

    if (auctionSnapshot.empty) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    const auctionDoc = auctionSnapshot.docs[0];
    const auctionData = auctionDoc.data();

    // Verify ownership (admin can end any)
    if (!isAdmin && auctionData.sellerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if auction can be ended
    if (auctionData.status !== "active") {
      return NextResponse.json(
        {
          error: "Only active auctions can be ended",
          currentStatus: auctionData.status,
        },
        { status: 400 },
      );
    }

    // End auction
    await updateDoc(auctionDoc.ref, {
      status: "ended",
      endTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Auction ended successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error ending auction:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to end auction",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
