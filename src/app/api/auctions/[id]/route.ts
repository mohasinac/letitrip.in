import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { updateCategoryAuctionCounts } from "@/lib/category-hierarchy";

/**
 * GET /api/auctions/[id]
 * Get single auction
 * - Public: Active auctions only
 * - Owner/Admin: All statuses
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromRequest(request);
    const { id } = await params;

    // Try direct doc access first (slug/id as document ID), fallback to query for backward compatibility
    let data: any = null;
    const docById = await Collections.auctions().doc(id).get();
    
    if (docById.exists) {
      data = { id: docById.id, ...docById.data() };
    } else {
      // Fallback: Try to find by slug field (backward compatibility)
      const slugQuery = await Collections.auctions()
        .where("slug", "==", id)
        .limit(1)
        .get();

      if (!slugQuery.empty) {
        const firstDoc = slugQuery.docs[0];
        data = { id: firstDoc.id, ...firstDoc.data() };
      } else {
        return NextResponse.json(
          { success: false, error: "Auction not found" },
          { status: 404 },
        );
      }
    }

    // Public users can view active and ended auctions (readonly for ended)
    // Only hide scheduled, cancelled, or draft auctions from public
    const publicBlockedStatuses = ["scheduled", "cancelled", "draft"];
    if (
      (!user || user.role === "user") &&
      publicBlockedStatuses.includes(data.status)
    ) {
      return NextResponse.json(
        { success: false, error: "Auction not found" },
        { status: 404 },
      );
    }

    // Sellers can see own auctions (any status) or active/ended from others
    if (user?.role === "seller") {
      const ownsShop = await userOwnsShop(data.shop_id, user.uid);
      const publicBlockedStatuses = ["scheduled", "cancelled", "draft"];
      if (!ownsShop && publicBlockedStatuses.includes(data.status)) {
        return NextResponse.json(
          { success: false, error: "Auction not found" },
          { status: 404 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        // Add camelCase aliases for all snake_case fields
        shopId: data.shop_id,
        sellerId: data.seller_id,
        categoryId: data.category_id,
        startingPrice: data.starting_price,
        reservePrice: data.reserve_price,
        currentPrice: data.current_price,
        buyNowPrice: data.buy_now_price,
        startTime: data.start_time,
        endTime: data.end_time,
        bidIncrement: data.bid_increment,
        totalBids: data.total_bids,
        viewCount: data.view_count,
        watchCount: data.watch_count,
        featured: data.is_featured,
        isActive: data.is_active,
        isDeleted: data.is_deleted,
        winnerId: data.winner_id,
        winningBid: data.winning_bid,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching auction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch auction" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/auctions/[id]
 * Update auction (owner/admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, error } = await requireAuth(request);
    if (error) return error;

    const role = user.role;
    const { id } = await params;
    const docRef = Collections.auctions().doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Auction not found" },
        { status: 404 },
      );
    }

    const auction: any = { id: doc.id, ...doc.data() };
    if (role === "seller") {
      const ownsShop = await userOwnsShop(auction.shop_id, user.uid);
      if (!ownsShop) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
      }
    }

    const body = await request.json();
    const update: any = { ...body, updated_at: new Date().toISOString() };
    delete update.id;
    delete update.shop_id;
    delete update.created_at;

    // Track if status or category changed
    const statusChanged = body.status && body.status !== auction.status;
    const categoryChanged =
      body.category_id && body.category_id !== auction.category_id;
    const oldCategoryId = auction.category_id;
    const newCategoryId = body.category_id || oldCategoryId;

    await docRef.update(update);
    const updated = await docRef.get();
    const updatedData: any = updated.data();

    // Update category auction counts if status or category changed
    if (statusChanged || categoryChanged) {
      try {
        if (categoryChanged && oldCategoryId) {
          await updateCategoryAuctionCounts(oldCategoryId);
        }
        if (newCategoryId) {
          await updateCategoryAuctionCounts(newCategoryId);
        }
      } catch (err) {
        console.error("Failed to update category auction counts:", err);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        ...updatedData,
        // Add camelCase aliases for all snake_case fields
        shopId: updatedData.shop_id,
        sellerId: updatedData.seller_id,
        categoryId: updatedData.category_id,
        startingPrice: updatedData.starting_price,
        reservePrice: updatedData.reserve_price,
        currentPrice: updatedData.current_price,
        buyNowPrice: updatedData.buy_now_price,
        startTime: updatedData.start_time,
        endTime: updatedData.end_time,
        bidIncrement: updatedData.bid_increment,
        totalBids: updatedData.total_bids,
        viewCount: updatedData.view_count,
        watchCount: updatedData.watch_count,
        featured: updatedData.is_featured,
        isActive: updatedData.is_active,
        isDeleted: updatedData.is_deleted,
        winnerId: updatedData.winner_id,
        winningBid: updatedData.winning_bid,
        createdAt: updatedData.created_at,
        updatedAt: updatedData.updated_at,
      },
    });
  } catch (error) {
    console.error("Error updating auction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update auction" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/auctions/[id]
 * Delete auction (owner/admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, error } = await requireAuth(request);
    if (error) return error;

    const role = user.role;
    const { id } = await params;
    const docRef = Collections.auctions().doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Auction not found" },
        { status: 404 },
      );
    }

    const auction: any = { id: doc.id, ...doc.data() };
    if (role === "seller") {
      const ownsShop = await userOwnsShop(auction.shop_id, user.uid);
      if (!ownsShop) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
      }
    }

    await docRef.delete();

    // Update category auction counts after deletion
    if (auction.category_id) {
      try {
        await updateCategoryAuctionCounts(auction.category_id);
      } catch (err) {
        console.error("Failed to update category auction counts:", err);
      }
    }

    return NextResponse.json({ success: true, message: "Auction deleted" });
  } catch (error) {
    console.error("Error deleting auction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete auction" },
      { status: 500 },
    );
  }
}
