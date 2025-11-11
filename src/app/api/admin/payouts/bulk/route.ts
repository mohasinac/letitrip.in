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

    // Execute bulk operation
    const result = await executeBulkOperation({
      collection: "payouts",
      action,
      ids,
      validateItem: async (item, actionType) => {
        // Status-based validation
        if (actionType === "process") {
          if (item?.status !== "pending") {
            return {
              valid: false,
              error: "Only pending payouts can be processed",
            };
          }
        }

        if (actionType === "approve") {
          if (item?.status !== "pending") {
            return {
              valid: false,
              error: "Only pending payouts can be approved",
            };
          }
        }

        if (actionType === "reject") {
          if (item?.status !== "pending") {
            return {
              valid: false,
              error: "Only pending payouts can be rejected",
            };
          }
        }

        return { valid: true };
      },
      customHandler: async (db, id) => {
        const payoutRef = db.collection("payouts").doc(id);

        switch (action) {
          case "approve":
            await payoutRef.update({
              status: "approved",
              approved_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            break;

          case "process":
            await payoutRef.update({
              status: "processing",
              processing_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            break;

          case "complete":
            await payoutRef.update({
              status: "completed",
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            break;

          case "reject":
            await payoutRef.update({
              status: "rejected",
              rejected_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
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
