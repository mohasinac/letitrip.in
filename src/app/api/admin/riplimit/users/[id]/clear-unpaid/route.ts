/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/riplimit/users/[id]/clear-unpaid/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Admin Clear Unpaid Auction Flag API
 * Epic: E028 - RipLimit Bidding Currency
 *
 * POST /api/admin/riplimit/users/[id]/clear-unpaid - Clear unpaid auction flag
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { adminClearUnpaidAuction } from "@/app/api/lib/riplimit/admin";

/**
 * RouteParams interface
 * 
 * @interface
 * @description Defines the structure and contract for RouteParams
 */
interface RouteParams {
  /** Params */
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/riplimit/users/[id]/clear-unpaid
 * Clear a user's unpaid auction flag (admin only)
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 * @param {RouteParams} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request, { params });
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 * @param {RouteParams} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request, { params });
 */

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;

    // Authenticate and check admin role
    const auth = await getAuthFromRequest(request);
    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const isAdmin = auth.role === "admin";
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { auctionId, reason } = body;

    // Validate required fields
    if (!auctionId || typeof auctionId !== "string") {
      return NextResponse.json(
        { success: false, error: "Auction ID is required" },
        { status: 400 },
      );
    }

    if (!reason || typeof reason !== "string" || reason.trim().length < 5) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Reason is required (minimum 5 characters)",
        },
        { status: 400 },
      );
    }

    // adminClearUnpaidAuction takes: userId, auctionId, adminId
    await adminClearUnpaidAuction(userId, auctionId, auth.user.uid);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: {
        userId,
        auctionId,
        /** Cleared By */
        clearedBy: auth.user.uid,
        /** Reason */
        reason: reason.trim(),
      },
    });
  } catch (error) {
    console.error("Error clearing unpaid auction:", error);
    const message =
      error instanceof Error ? error.message : "Failed to clear unpaid flag";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
