import { NextRequest, NextResponse } from "next/server";
import {
  executeBulkOperation,
  parseBulkRequest,
  createBulkErrorResponse,
} from "../../../lib/bulk-operations";

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const { action, ids } = await parseBulkRequest(request);

    // Execute bulk operation with status validation
    const result = await executeBulkOperation({
      collection: "auctions",
      action,
      ids,
      validateItem: async (item, actionType) => {
        // Status-based validation
        switch (actionType) {
          case "start":
            if (item?.status !== "scheduled") {
              return {
                valid: false,
                error: "Only scheduled auctions can be started",
              };
            }
            break;

          case "end":
            if (item?.status !== "live") {
              return {
                valid: false,
                error: "Only live auctions can be ended",
              };
            }
            break;

          case "cancel":
            if (item?.status !== "scheduled" && item?.status !== "live") {
              return {
                valid: false,
                error: "Can only cancel scheduled or live auctions",
              };
            }
            break;

          case "delete":
            if (
              item?.status !== "draft" &&
              item?.status !== "ended" &&
              item?.status !== "cancelled"
            ) {
              return {
                valid: false,
                error: "Can only delete draft, ended, or cancelled auctions",
              };
            }
            break;
        }

        return { valid: true };
      },
      customHandler: async (db, id) => {
        const auctionRef = db.collection("auctions").doc(id);

        switch (action) {
          case "start":
            await auctionRef.update({
              status: "live",
              start_time: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            break;

          case "end":
            await auctionRef.update({
              status: "ended",
              end_time: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            break;

          case "cancel":
            await auctionRef.update({
              status: "cancelled",
              updated_at: new Date().toISOString(),
            });
            break;

          case "feature":
            await auctionRef.update({
              is_featured: true,
              updated_at: new Date().toISOString(),
            });
            break;

          case "unfeature":
            await auctionRef.update({
              is_featured: false,
              updated_at: new Date().toISOString(),
            });
            break;

          case "delete":
            await auctionRef.delete();
            break;

          default:
            throw new Error(`Unknown action: ${action}`);
        }
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Bulk operation error:", error);
    return NextResponse.json(createBulkErrorResponse(error), { status: 500 });
  }
}
