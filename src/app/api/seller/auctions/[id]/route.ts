/**
 * Seller Auction Management API
 *
 * Update seller's auctions.
 *
 * @route PUT /api/seller/auctions/[id] - Update auction (requires seller/admin, ownership)
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
 * PUT - Update auction
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireRole(["seller", "admin"]);
    const userId = session.userId;
    const isAdmin = session.role === "admin";
    const { id } = await context.params;

    const body = await request.json();

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

    // Verify ownership (admin can edit any)
    if (!isAdmin && auctionData.sellerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prevent editing active auctions with bids
    if (auctionData.bidCount > 0 && auctionData.status === "active") {
      return NextResponse.json(
        { error: "Cannot edit auction with active bids" },
        { status: 400 },
      );
    }

    // Update allowed fields
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.images) updateData.images = body.images;
    if (body.condition) updateData.condition = body.condition;

    // Only allow changing bid/time if no bids yet
    if (auctionData.bidCount === 0) {
      if (body.startingBid !== undefined) {
        updateData.startingBid = parseFloat(body.startingBid);
        updateData.currentBid = parseFloat(body.startingBid);
      }
      if (body.reservePrice !== undefined) {
        updateData.reservePrice = body.reservePrice
          ? parseFloat(body.reservePrice)
          : null;
      }
      if (body.endTime) updateData.endTime = new Date(body.endTime);
    }

    await updateDoc(auctionDoc.ref, updateData);

    return NextResponse.json(
      {
        success: true,
        message: "Auction updated successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating auction:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to update auction",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
