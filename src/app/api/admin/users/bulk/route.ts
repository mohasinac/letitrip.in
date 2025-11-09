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
      collection: "users",
      action,
      ids,
      customHandler: async (db, id) => {
        const userRef = db.collection("users").doc(id);

        switch (action) {
          case "make-seller":
            await userRef.update({
              role: "seller",
              updated_at: new Date().toISOString(),
            });
            break;

          case "make-user":
            await userRef.update({
              role: "user",
              updated_at: new Date().toISOString(),
            });
            break;

          case "ban":
            await userRef.update({
              is_banned: true,
              ban_reason: "Bulk ban action",
              updated_at: new Date().toISOString(),
            });
            break;

          case "unban":
            await userRef.update({
              is_banned: false,
              ban_reason: null,
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
