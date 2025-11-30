import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

/**
 * Cleanup All Demo Data
 * DELETE /api/admin/demo/cleanup-all
 *
 * Deletes ALL resources with DEMO_ prefix from all collections
 */

const PREFIXES = ["DEMO_", "test_"];

export async function DELETE() {
  try {
    const db = getFirestoreAdmin();
    let totalDeleted = 0;

    // Collections to clean up (full coverage from TDD)
    const collections = [
      { name: "categories", field: "name" },
      { name: "users", field: "name" },
      { name: "shops", field: "name" },
      { name: "products", field: "name" },
      { name: "auctions", field: "title" },
      { name: "bids", field: null },
      { name: "orders", field: "orderNumber" },
      { name: "order_items", field: null },
      { name: "payments", field: "transactionId" },
      { name: "shipments", field: "trackingNumber" },
      { name: "reviews", field: "user_name" },
      { name: "coupons", field: "code" },
      { name: "returns", field: "id" },
      { name: "tickets", field: "ticketNumber" },
      { name: "payouts", field: "transactionId" },
      { name: "addresses", field: "id" },
      { name: "hero_slides", field: "title" },
      { name: "media", field: "filename" },
      { name: "blog_posts", field: "title" },
      { name: "blog_categories", field: "name" },
      { name: "blog_tags", field: "name" },
      { name: "favorites", field: null },
      { name: "carts", field: "id" },
      { name: "cart_items", field: null },
      { name: "conversations", field: "subject" },
      { name: "messages", field: "content" },
      { name: "settings", field: "id" },
      { name: "feature_flags", field: "id" },
      { name: "notifications", field: "id" },
    ];

    for (const collection of collections) {
      try {
        let snapshot;
        let demoDocRefs: any[] = [];

        if (collection.field) {
          for (const prefix of PREFIXES) {
            snapshot = await db
              .collection(collection.name)
              .where(collection.field, ">=", prefix)
              .where(collection.field, "<", `${prefix}\uf8ff`)
              .get();
            if (!snapshot.empty) {
              demoDocRefs.push(...snapshot.docs.map((doc) => doc.ref));
            }
          }
        } else {
          // For collections without a field, get all and filter by any string field with prefix
          const allDocs = await db.collection(collection.name).get();
          for (const doc of allDocs.docs) {
            const data = doc.data();
            const isDemoData = Object.values(data).some(
              (value) =>
                typeof value === "string" &&
                PREFIXES.some((prefix) => value.startsWith(prefix)),
            );
            if (isDemoData) {
              demoDocRefs.push(doc.ref);
            }
          }
        }

        // Delete in batches of 500 (Firestore limit)
        if (demoDocRefs.length > 0) {
          const batchSize = 500;
          for (let i = 0; i < demoDocRefs.length; i += batchSize) {
            const batch = db.batch();
            const batchRefs = demoDocRefs.slice(i, i + batchSize);
            batchRefs.forEach((ref) => {
              batch.delete(ref);
              totalDeleted++;
            });
            await batch.commit();
          }
        }
      } catch (err) {
        console.error(`Error cleaning ${collection.name}:`, err);
        // Continue with other collections
      }
    }

    return NextResponse.json({
      success: true,
      deleted: totalDeleted,
      prefixes: PREFIXES,
      message: `All demo/test data cleaned up successfully (${totalDeleted} documents deleted)`,
    });
  } catch (error: any) {
    console.error("Cleanup all error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
