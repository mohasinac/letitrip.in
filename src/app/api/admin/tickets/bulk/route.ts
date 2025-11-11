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
      collection: "support_tickets",
      action,
      ids,
      validateItem: async (item, actionType) => {
        return { valid: true };
      },
      customHandler: async (db, id) => {
        const ticketRef = db.collection("support_tickets").doc(id);

        switch (action) {
          case "assign":
            await ticketRef.update({
              status: "in-progress",
              assigned_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            break;

          case "resolve":
            await ticketRef.update({
              status: "resolved",
              resolved_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            break;

          case "close":
            await ticketRef.update({
              status: "closed",
              closed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            break;

          case "delete":
            await ticketRef.delete();
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
