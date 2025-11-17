import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

/**
 * Cleanup All Demo Data
 * DELETE /api/admin/demo/cleanup-all
 *
 * Deletes ALL resources with DEMO_ prefix from all collections
 */

const DEMO_PREFIX = "DEMO_";

export async function DELETE(request: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    let totalDeleted = 0;

    // Collections to clean up (comprehensive list)
    const collections = [
      { name: "categories", field: "name" },
      { name: "users", field: "name" },
      { name: "shops", field: "name" },
      { name: "products", field: "name" },
      { name: "auctions", field: "title" },
      { name: "bids", field: null }, // Will be filtered by checking fields
      { name: "orders", field: "orderNumber" },
      { name: "payments", field: "transactionId" },
      { name: "shipments", field: "trackingNumber" },
      { name: "reviews", field: "user_name" }, // NEW: Clean up reviews
      { name: "order_items", field: null }, // NEW: Clean up order items
    ];

    for (const collection of collections) {
      try {
        let snapshot;

        if (collection.field) {
          // Query by prefix in specific field
          snapshot = await db
            .collection(collection.name)
            .where(collection.field, ">=", DEMO_PREFIX)
            .where(collection.field, "<", `${DEMO_PREFIX}\uf8ff`)
            .get();
        } else {
          // For collections without a field (like bids), get all and filter
          const allDocs = await db.collection(collection.name).get();
          const demoDocRefs: any[] = [];

          for (const doc of allDocs.docs) {
            const data = doc.data();
            // Check if any field starts with DEMO_
            const isDemoData = Object.values(data).some(
              (value) =>
                typeof value === "string" && value.startsWith(DEMO_PREFIX)
            );
            if (isDemoData) {
              demoDocRefs.push(doc.ref);
            }
          }

          if (demoDocRefs.length > 0) {
            const batch = db.batch();
            demoDocRefs.forEach((ref) => {
              batch.delete(ref);
              totalDeleted++;
            });
            await batch.commit();
          }
          continue;
        }

        if (!snapshot.empty) {
          // Delete in batches of 500 (Firestore limit)
          const batchSize = 500;
          const batches = [];

          for (let i = 0; i < snapshot.docs.length; i += batchSize) {
            const batch = db.batch();
            const batchDocs = snapshot.docs.slice(i, i + batchSize);

            batchDocs.forEach((doc) => {
              batch.delete(doc.ref);
              totalDeleted++;
            });

            batches.push(batch.commit());
          }

          await Promise.all(batches);
        }
      } catch (err) {
        console.error(`Error cleaning ${collection.name}:`, err);
        // Continue with other collections
      }
    }

    return NextResponse.json({
      success: true,
      deleted: totalDeleted,
      prefix: DEMO_PREFIX,
      message: `All demo data cleaned up successfully (${totalDeleted} documents deleted)`,
    });
  } catch (error: any) {
    console.error("Cleanup all error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
