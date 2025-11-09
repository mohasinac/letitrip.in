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
      collection: "hero_slides",
      action,
      ids,
      customHandler: async (db, id) => {
        const slideRef = db.collection("hero_slides").doc(id);

        switch (action) {
          case "activate":
            await slideRef.update({
              is_active: true,
              updated_at: new Date().toISOString(),
            });
            break;

          case "deactivate":
            await slideRef.update({
              is_active: false,
              updated_at: new Date().toISOString(),
            });
            break;

          case "add-to-carousel":
            await slideRef.update({
              show_in_carousel: true,
              updated_at: new Date().toISOString(),
            });
            break;

          case "remove-from-carousel":
            await slideRef.update({
              show_in_carousel: false,
              updated_at: new Date().toISOString(),
            });
            break;

          case "delete":
            await slideRef.delete();
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
