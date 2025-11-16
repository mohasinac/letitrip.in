import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { ValidationError } from "@/lib/api-errors";

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
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request);
    if (error) return error;

    const role = user.role;
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Only sellers and admins can perform bulk operations",
        },
        { status: 403 }
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
        `Invalid action. Must be one of: ${validActions.join(", ")}`
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
            id: auctionId,
            success: false,
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
              id: auctionId,
              success: false,
              error: "Not authorized to edit this auction",
            });
            continue;
          }
        }

        // Perform action with status validation
        switch (action) {
          case "start":
            if (auctionData.status !== "scheduled") {
              results.push({
                id: auctionId,
                success: false,
                error: "Only scheduled auctions can be started",
              });
              continue;
            }
            await auctionRef.update({
              status: "active",
              start_time: now,
              updated_at: now,
            });
            break;

          case "end":
            if (auctionData.status !== "active") {
              results.push({
                id: auctionId,
                success: false,
                error: "Only active auctions can be ended",
              });
              continue;
            }
            await auctionRef.update({
              status: "ended",
              end_time: now,
              updated_at: now,
            });
            break;

          case "cancel":
            if (
              auctionData.status !== "scheduled" &&
              auctionData.status !== "active"
            ) {
              results.push({
                id: auctionId,
                success: false,
                error: "Can only cancel scheduled or active auctions",
              });
              continue;
            }
            await auctionRef.update({
              status: "cancelled",
              updated_at: now,
            });
            break;

          case "feature":
            await auctionRef.update({
              is_featured: true,
              updated_at: now,
            });
            break;

          case "unfeature":
            await auctionRef.update({
              is_featured: false,
              updated_at: now,
            });
            break;

          case "delete":
            if (
              auctionData.status !== "draft" &&
              auctionData.status !== "ended" &&
              auctionData.status !== "cancelled"
            ) {
              results.push({
                id: auctionId,
                success: false,
                error: "Can only delete draft, ended, or cancelled auctions",
              });
              continue;
            }
            await auctionRef.delete();
            break;

          case "update":
            if (!data) {
              results.push({
                id: auctionId,
                success: false,
                error: "Update data is required for update action",
              });
              continue;
            }
            const updates: any = { ...data, updated_at: now };
            // Prevent updating protected fields
            delete updates.id;
            delete updates.shop_id;
            delete updates.created_at;
            await auctionRef.update(updates);
            break;

          default:
            results.push({
              id: auctionId,
              success: false,
              error: `Unknown action: ${action}`,
            });
            continue;
        }

        results.push({
          id: auctionId,
          success: true,
        });
      } catch (err: any) {
        results.push({
          id: auctionId,
          success: false,
          error: err.message || "Failed to process auction",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: auctionIds.length,
        succeeded: successCount,
        failed: failureCount,
      },
    });
  } catch (error: any) {
    console.error("Bulk auction operation error:", error);
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}
