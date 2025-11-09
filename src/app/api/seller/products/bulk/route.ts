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
    const { action, ids, data } = await parseBulkRequest(request);

    // Execute bulk operation with ownership validation
    const result = await executeBulkOperation({
      collection: "products",
      action,
      ids,
      data,
      validateItem: async (item, actionType) => {
        // Verify ownership (sellers can only edit their own products)
        if (user.role === "seller" && item?.seller_id !== user.id) {
          return {
            valid: false,
            error: "Not authorized to edit this product",
          };
        }

        // Validate stock count for update-stock action
        if (actionType === "update-stock" && !data?.stockCount) {
          return {
            valid: false,
            error: "Stock count required",
          };
        }

        return { valid: true };
      },
      customHandler: async (db, id, updateData) => {
        const productRef = db.collection("products").doc(id);

        switch (action) {
          case "publish":
            await productRef.update({
              status: "published",
              updated_at: new Date().toISOString(),
            });
            break;

          case "draft":
            await productRef.update({
              status: "draft",
              updated_at: new Date().toISOString(),
            });
            break;

          case "archive":
            await productRef.update({
              status: "archived",
              updated_at: new Date().toISOString(),
            });
            break;

          case "update-stock":
            await productRef.update({
              stockCount: parseInt(updateData?.stockCount || "0"),
              updated_at: new Date().toISOString(),
            });
            break;

          case "delete":
            await productRef.delete();
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
