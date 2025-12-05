/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auctions/bulk/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { ValidationError } from "@/lib/api-errors";

// Status requirements for each action
/**
 * STATUS_REQUIREMENTS constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for status requirements
 */
const STATUS_REQUIREMENTS: Record<
  string,
  { required?: string[]; message?: string }
> = {
  /** Start */
  start: {
    /** Required */
    required: ["scheduled"],
    /** Message */
    message: "Only scheduled auctions can be started",
  },
  /** End */
  end: { required: ["active"], message: "Only active auctions can be ended" },
  /** Cancel */
  cancel: {
    /** Required */
    required: ["scheduled", "active"],
    /** Message */
    message: "Can only cancel scheduled or active auctions",
  },
  /** Delete */
  delete: {
    /** Required */
    required: ["draft", "ended", "cancelled"],
    /** Message */
    message: "Can only delete draft, ended, or cancelled auctions",
  },
};

// Build update object for each action
/**
 * Function: Build Auction Update
 */
/**
 * Performs build auction update operation
 *
 * @param {string} action - The action
 * @param {string} now - The now
 * @param {any} [data] - Data object containing information
 *
 * @returns {string} The buildauctionupdate result
 */

/**
 * Performs build auction update operation
 *
 * @returns {string} The buildauctionupdate result
 */

function buildAuctionUpdate(
  /** Action */
  action: string,
  /** Now */
  now: string,
  /** Data */
  data?: any,
): Record<string, any> | null {
  switch (action) {
    case "start":
      return { status: "active", start_time: now, updated_at: now };
    case "end":
      return { status: "ended", end_time: now, updated_at: now };
    case "cancel":
      return { status: "cancelled", updated_at: now };
    case "feature":
      return { is_featured: true, updated_at: now };
    case "unfeature":
      return { is_featured: false, updated_at: now };
    case "update":
      if (!data) return null;
      const updates = { ...data, updated_at: now };
      delete updates.id;
      delete updates.shop_id;
      delete updates.created_at;
      return updates;
    /** Default */
    default:
      return null;
  }
}

/**
 * POST /api/auctions/bulk
 * Bulk operations on auctions
 * - Admin: Can perform all operations on any auction
 * - Seller: Can only perform operations on own auctions
 *
 * Supported actions:
 * - start: Start scheduled auctions
 * - end: End live auctions
 * - cancel: Cancel scheduled/live auctions
 * - feature: Feature auctions
 * - unfeature: Remove feature status
 * - delete: Delete draft/ended/cancelled auctions
 * - update: Update auction fields
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request);
    if (error) return error;

    const role = user.role;
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Only sellers and admins can perform bulk operations",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { action, auctionIds, data } = body;

    if (!action || !Array.isArray(auctionIds) || auctionIds.length === 0) {
      throw new ValidationError("Action and auctionIds array are required");
    }

    const validActions = [
      "start",
      "end",
      "cancel",
      "feature",
      "unfeature",
      "delete",
      "update",
    ];
    if (!validActions.includes(action)) {
      throw new ValidationError(
        `Invalid action. Must be one of: ${validActions.join(", ")}`,
      );
    }

    const results = [];
    const now = new Date().toISOString();

    for (const auctionId of auctionIds) {
      try {
        const auctionRef = Collections.auctions().doc(auctionId);
        const auctionDoc = await auctionRef.get();

        if (!auctionDoc.exists) {
          results.push({
            /** Id */
            id: auctionId,
            /** Success */
            success: false,
            /** Error */
            error: "Auction not found",
          });
          continue;
        }

        const auctionData: any = auctionDoc.data();

        // Sellers can only edit their own auctions
        if (role === "seller") {
          const ownsShop = await userOwnsShop(auctionData.shop_id, user.uid);
          if (!ownsShop) {
            results.push({
              /** Id */
              id: auctionId,
              /** Success */
              success: false,
              /** Error */
              error: "Not authorized to edit this auction",
            });
            continue;
          }
        }

        // Validate status requirements
        const requirement = STATUS_REQUIREMENTS[action];
        if (
          requirement?.required &&
          !requirement.required.includes(auctionData.status)
        ) {
          results.push({
            /** Id */
            id: auctionId,
            /** Success */
            success: false,
            /** Error */
            error: requirement.message,
          });
          continue;
        }

        // Handle delete action
        if (action === "delete") {
          await auctionRef.delete();
          results.push({ id: auctionId, success: true });
          continue;
        }

        // Build and apply update
        const updates = buildAuctionUpdate(action, now, data);
        if (!updates) {
          results.push({
            /** Id */
            id: auctionId,
            /** Success */
            success: false,
            /** Error */
            error:
              action === "update"
                ? "Update data is required"
                : `Unknown action: ${action}`,
          });
          continue;
        }

        await auctionRef.update(updates);
        results.push({ id: auctionId, success: true });
      } catch (err: any) {
        results.push({
          /** Id */
          id: auctionId,
          /** Success */
          success: false,
          /** Error */
          error: err.message || "Failed to process auction",
        });
      }
    }

    /**
 * Performs success count operation
 *
 * @param {any} (r - The (r
 *
 * @returns {any} The successcount result
 *
 */
const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      /** Success */
      success: true,
      results,
      /** Summary */
      summary: {
        /** Total */
        total: auctionIds.length,
        /** Succeeded */
        succeeded: successCount,
        /** Failed */
        failed: failureCount,
      },
    });
  } catch (error: any) {
    console.error("Bulk auction operation error:", error);
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to perform bulk operation" },
      { status: 500 },
    );
  }
}
