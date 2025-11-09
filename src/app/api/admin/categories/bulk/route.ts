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
      collection: "categories",
      action,
      ids,
      validateItem: async (item, actionType) => {
        // Validation for delete action
        if (actionType === "delete") {
          // This validation will be done in customHandler
          return { valid: true };
        }
        return { valid: true };
      },
      customHandler: async (db, id) => {
        const categoryRef = db.collection("categories").doc(id);

        switch (action) {
          case "activate":
            await categoryRef.update({
              is_active: true,
              updated_at: new Date().toISOString(),
            });
            break;

          case "deactivate":
            await categoryRef.update({
              is_active: false,
              updated_at: new Date().toISOString(),
            });
            break;

          case "feature":
            await categoryRef.update({
              is_featured: true,
              updated_at: new Date().toISOString(),
            });
            break;

          case "unfeature":
            await categoryRef.update({
              is_featured: false,
              updated_at: new Date().toISOString(),
            });
            break;

          case "delete":
            // Check if category has children
            const childrenSnapshot = await db
              .collection("categories")
              .where("parent_id", "==", id)
              .limit(1)
              .get();

            if (!childrenSnapshot.empty) {
              throw new Error("Category has subcategories");
            }

            // Check if category has products
            const productsSnapshot = await db
              .collection("products")
              .where("category_id", "==", id)
              .limit(1)
              .get();

            if (!productsSnapshot.empty) {
              throw new Error("Category has products");
            }

            await categoryRef.delete();
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
