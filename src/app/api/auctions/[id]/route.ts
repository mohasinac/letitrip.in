/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auctions/[id]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request, {});
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(/** Request */
  request, {});
 */

export async function GET(
  /** Request */
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
      /** Success */
      success: true,
      /** Data */
      data: {
        ...data,
        // Add camelCase aliases for all snake_case fields
        /** Shop Id */
        shopId: data.shop_id,
        /** Seller Id */
        sellerId: data.seller_id,
        /** Category Id */
        categoryId: data.category_id,
        /** Starting Price */
        startingPrice: data.starting_price,
        /** Reserve Price */
        reservePrice: data.reserve_price,
        /** Current Price */
        currentPrice: data.current_price,
        /** Buy Now Price */
        buyNowPrice: data.buy_now_price,
        /** Start Time */
        startTime: data.start_time,
        /** End Time */
        endTime: data.end_time,
        /** Bid Increment */
        bidIncrement: data.bid_increment,
        /** Total Bids */
        totalBids: data.total_bids,
        /** View Count */
        viewCount: data.view_count,
        /** Watch Count */
        watchCount: data.watch_count,
        /** Featured */
        featured: data.is_featured,
        /** Is Active */
        isActive: data.is_active,
        /** Is Deleted */
        isDeleted: data.is_deleted,
        /** Winner Id */
        winnerId: data.winner_id,
        /** Winning Bid */
        winningBid: data.winning_bid,
        /** Created At */
        createdAt: data.created_at,
        /** Updated At */
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
/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(request, {});
 */

/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(/** Request */
  request, {});
 */

export async function PATCH(
  /** Request */
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
      /** Success */
      success: true,
      /** Data */
      data: {
        /** Id */
        id: updated.id,
        ...updatedData,
        // Add camelCase aliases for all snake_case fields
        /** Shop Id */
        shopId: updatedData.shop_id,
        /** Seller Id */
        sellerId: updatedData.seller_id,
        /** Category Id */
        categoryId: updatedData.category_id,
        /** Starting Price */
        startingPrice: updatedData.starting_price,
        /** Reserve Price */
        reservePrice: updatedData.reserve_price,
        /** Current Price */
        currentPrice: updatedData.current_price,
        /** Buy Now Price */
        buyNowPrice: updatedData.buy_now_price,
        /** Start Time */
        startTime: updatedData.start_time,
        /** End Time */
        endTime: updatedData.end_time,
        /** Bid Increment */
        bidIncrement: updatedData.bid_increment,
        /** Total Bids */
        totalBids: updatedData.total_bids,
        /** View Count */
        viewCount: updatedData.view_count,
        /** Watch Count */
        watchCount: updatedData.watch_count,
        /** Featured */
        featured: updatedData.is_featured,
        /** Is Active */
        isActive: updatedData.is_active,
        /** Is Deleted */
        isDeleted: updatedData.is_deleted,
        /** Winner Id */
        winnerId: updatedData.winner_id,
        /** Winning Bid */
        winningBid: updatedData.winning_bid,
        /** Created At */
        createdAt: updatedData.created_at,
        /** Updated At */
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
/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(request, {});
 */

/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(/** Request */
  request, {});
 */

export async function DELETE(
  /** Request */
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
