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

    // Process each slide
    for (const id of ids) {
      try {
        const slideRef = db.collection("hero_slides").doc(id);
        const slideDoc = await slideRef.get();

        if (!slideDoc.exists) {
          results.failedCount++;
          results.errors.push({ id, error: "Slide not found" });
          continue;
        }

        switch (action) {
          case "activate":
            await slideRef.update({ is_active: true, updated_at: new Date().toISOString() });
            results.successCount++;
            break;

          case "deactivate":
            await slideRef.update({ is_active: false, updated_at: new Date().toISOString() });
            results.successCount++;
            break;

          case "add-to-carousel":
            await slideRef.update({ show_in_carousel: true, updated_at: new Date().toISOString() });
            results.successCount++;
            break;

          case "remove-from-carousel":
            await slideRef.update({ show_in_carousel: false, updated_at: new Date().toISOString() });
            results.successCount++;
            break;

          case "delete":
            await slideRef.delete();
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
