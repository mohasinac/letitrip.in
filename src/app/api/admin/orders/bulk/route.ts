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
      collection: "orders",
      action,
      ids,
      validateItem: async (item, actionType) => {
        // Status-based validation
        switch (actionType) {
          case "confirm":
            if (item?.status !== "pending") {
              return {
                valid: false,
                error: "Only pending orders can be confirmed",
              };
            }
            break;

          case "cancel":
            if (
              item?.status !== "pending" &&
              item?.status !== "confirmed" &&
              item?.status !== "processing"
            ) {
              return {
                valid: false,
                error: "Can only cancel pending/confirmed/processing orders",
              };
            }
            break;
        }

        return { valid: true };
      },
      customHandler: async (db, id) => {
        const orderRef = db.collection("orders").doc(id);

        switch (action) {
          case "confirm":
            await orderRef.update({
              status: "confirmed",
              confirmed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            break;

          case "process":
            await orderRef.update({
              status: "processing",
              processing_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            break;

          case "cancel":
            await orderRef.update({
              status: "cancelled",
              cancelled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            break;

          case "delete":
            // Only allow deleting cancelled or failed orders
            const orderDoc = await orderRef.get();
            const orderData = orderDoc.data();

            if (
              orderData?.status !== "cancelled" &&
              orderData?.status !== "failed"
            ) {
              throw new Error("Can only delete cancelled or failed orders");
            }

            await orderRef.delete();
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
