import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "../../../lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ids } = body;

    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Action and IDs array required" },
        { status: 400 }
      );
    }

    const db = getFirestoreAdmin();

    const results = {
      success: true,
      successCount: 0,
      failedCount: 0,
      errors: [] as { id: string; error: string }[],
    };

    // Process each category
    for (const id of ids) {
      try {
        const categoryRef = db.collection("categories").doc(id);
        const categoryDoc = await categoryRef.get();

        if (!categoryDoc.exists) {
          results.failedCount++;
          results.errors.push({ id, error: "Category not found" });
          continue;
        }

        switch (action) {
          case "activate":
            await categoryRef.update({ is_active: true, updated_at: new Date().toISOString() });
            results.successCount++;
            break;

          case "deactivate":
            await categoryRef.update({ is_active: false, updated_at: new Date().toISOString() });
            results.successCount++;
            break;

          case "feature":
            await categoryRef.update({ is_featured: true, updated_at: new Date().toISOString() });
            results.successCount++;
            break;

          case "unfeature":
            await categoryRef.update({ is_featured: false, updated_at: new Date().toISOString() });
            results.successCount++;
            break;

          case "delete":
            // Check if category has children
            const childrenSnapshot = await db
              .collection("categories")
              .where("parent_id", "==", id)
              .limit(1)
              .get();

            if (!childrenSnapshot.empty) {
              results.failedCount++;
              results.errors.push({ id, error: "Category has subcategories" });
              continue;
            }

            // Check if category has products
            const productsSnapshot = await db
              .collection("products")
              .where("category_id", "==", id)
              .limit(1)
              .get();

            if (!productsSnapshot.empty) {
              results.failedCount++;
              results.errors.push({ id, error: "Category has products" });
              continue;
            }

            await categoryRef.delete();
            results.successCount++;
            break;

          default:
            results.failedCount++;
            results.errors.push({ id, error: `Unknown action: ${action}` });
        }
      } catch (error) {
        results.failedCount++;
        results.errors.push({
          id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    results.success = results.failedCount === 0;

    return NextResponse.json(results);
  } catch (error) {
    console.error("Bulk operation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Bulk operation failed",
      },
      { status: 500 }
    );
  }
}
