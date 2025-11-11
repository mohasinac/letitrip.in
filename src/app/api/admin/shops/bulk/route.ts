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
      collection: "shops",
      action,
      ids,
      validateItem: async (item, actionType) => {
        return { valid: true };
      },
      customHandler: async (db, id) => {
        const shopRef = db.collection("shops").doc(id);

        switch (action) {
          case "verify":
            await shopRef.update({
              is_verified: true,
              updated_at: new Date().toISOString(),
            });
            break;

          case "unverify":
            await shopRef.update({
              is_verified: false,
              updated_at: new Date().toISOString(),
            });
            break;

          case "activate":
            await shopRef.update({
              is_active: true,
              is_banned: false,
              updated_at: new Date().toISOString(),
            });
            break;

          case "deactivate":
            await shopRef.update({
              is_active: false,
              updated_at: new Date().toISOString(),
            });
            break;

          case "ban":
            await shopRef.update({
              is_banned: true,
              is_active: false,
              ban_reason: "Bulk ban action",
              updated_at: new Date().toISOString(),
            });
            break;

          case "unban":
            await shopRef.update({
              is_banned: false,
              ban_reason: null,
              updated_at: new Date().toISOString(),
            });
            break;

          case "delete":
            // Check if shop has products
            const productsSnapshot = await db
              .collection("products")
              .where("shop_id", "==", id)
              .limit(1)
              .get();

            if (!productsSnapshot.empty) {
              throw new Error("Shop has products");
            }

            // Check if shop has auctions
            const auctionsSnapshot = await db
              .collection("auctions")
              .where("shop_id", "==", id)
              .limit(1)
              .get();

            if (!auctionsSnapshot.empty) {
              throw new Error("Shop has auctions");
            }

            await shopRef.delete();
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
