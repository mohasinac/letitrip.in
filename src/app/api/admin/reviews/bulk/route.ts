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
      collection: "reviews",
      action,
      ids,
      validateItem: async (item, actionType) => {
        return { valid: true };
      },
      customHandler: async (db, id) => {
        const reviewRef = db.collection("reviews").doc(id);

        switch (action) {
          case "approve":
            await reviewRef.update({
              status: "approved",
              approved_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            break;

          case "reject":
            await reviewRef.update({
              status: "rejected",
              rejected_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            break;

          case "flag":
            await reviewRef.update({
              is_flagged: true,
              flagged_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            break;

          case "unflag":
            await reviewRef.update({
              is_flagged: false,
              flagged_at: null,
              updated_at: new Date().toISOString(),
            });
            break;

          case "delete":
            await reviewRef.delete();
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
