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

    // Process each user
    for (const id of ids) {
      try {
        const userRef = db.collection("users").doc(id);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          results.failedCount++;
          results.errors.push({ id, error: "User not found" });
          continue;
        }

        const updates: any = { updated_at: new Date().toISOString() };

        switch (action) {
          case "make-seller":
            updates.role = "seller";
            await userRef.update(updates);
            results.successCount++;
            break;

          case "make-user":
            updates.role = "user";
            await userRef.update(updates);
            results.successCount++;
            break;

          case "ban":
            updates.is_banned = true;
            updates.ban_reason = "Bulk ban action";
            await userRef.update(updates);
            results.successCount++;
            break;

          case "unban":
            updates.is_banned = false;
            updates.ban_reason = null;
            await userRef.update(updates);
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
