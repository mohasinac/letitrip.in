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
      collection: "coupons",
      action,
      ids,
      validateItem: async (item, actionType) => {
        return { valid: true };
      },
      customHandler: async (db, id) => {
        const couponRef = db.collection("coupons").doc(id);

        switch (action) {
          case "activate":
            await couponRef.update({
              is_active: true,
              updated_at: new Date().toISOString(),
            });
            break;

          case "deactivate":
            await couponRef.update({
              is_active: false,
              updated_at: new Date().toISOString(),
            });
            break;

          case "delete":
            await couponRef.delete();
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
