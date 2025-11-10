import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/session";
import {
  executeBulkOperation,
  parseBulkRequest,
  createBulkErrorResponse,
} from "../../../lib/bulk-operations";

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize user
    const user = await getCurrentUser(request);
    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse and validate request
    const { action, ids } = await parseBulkRequest(request);

    // Execute bulk operation with ownership and status validation
    const result = await executeBulkOperation({
      collection: "auctions",
      action,
      ids,
      validateItem: async (item, actionType) => {
        // Verify ownership (sellers can only edit their own auctions)
        if (user.role === "seller" && item?.seller_id !== user.id) {
          return {
            valid: false,
            error: "Not authorized to edit this auction",
          };
        }

        // Status-based validation
        switch (actionType) {
          case "schedule":
            if (item?.status !== "draft") {
              return {
                valid: false,
                error: "Only draft auctions can be scheduled",
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

          case "end":
            if (item?.status !== "live") {
              return {
                valid: false,
                error: "Only live auctions can be ended",
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
          case "schedule":
            await auctionRef.update({
              status: "scheduled",
              updated_at: new Date().toISOString(),
            });
            break;

          case "cancel":
            await auctionRef.update({
              status: "cancelled",
              updated_at: new Date().toISOString(),
            });
            break;

          case "end":
            await auctionRef.update({
              status: "ended",
              endTime: new Date().toISOString(),
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
