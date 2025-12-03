import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * Cleanup All Demo Data
 * DELETE /api/admin/demo/cleanup-all
 *
 * Deletes ALL resources with DEMO_ prefix from all collections
 * Uses multiple strategies to find demo data:
 * 1. Direct field prefix match (name, title, etc.)
 * 2. Related ID lookup (bids reference auctions, reviews reference products)
 * 3. Deep scan for any DEMO_ prefixed string value
 */

const PREFIXES = ["DEMO_", "test_"];

interface DeletionResult {
  collection: string;
  count: number;
}

export async function DELETE() {
  try {
    const db = getFirestoreAdmin();
    const deletionResults: DeletionResult[] = [];

    // Step 1: Get all demo product IDs and auction IDs first (needed for related cleanup)
    const demoProductIds = new Set<string>();
    const demoAuctionIds = new Set<string>();
    const demoUserIds = new Set<string>();
    const demoShopIds = new Set<string>();
    const demoOrderIds = new Set<string>();

    // Find demo products
    for (const prefix of PREFIXES) {
      const productSnapshot = await db
        .collection(COLLECTIONS.PRODUCTS)
        .where("name", ">=", prefix)
        .where("name", "<", `${prefix}\uf8ff`)
        .get();
      productSnapshot.docs.forEach((doc) => demoProductIds.add(doc.id));
    }

    // Find demo auctions
    for (const prefix of PREFIXES) {
      const auctionSnapshot = await db
        .collection(COLLECTIONS.AUCTIONS)
        .where("title", ">=", prefix)
        .where("title", "<", `${prefix}\uf8ff`)
        .get();
      auctionSnapshot.docs.forEach((doc) => demoAuctionIds.add(doc.id));
    }

    // Find demo users
    for (const prefix of PREFIXES) {
      const userSnapshot = await db
        .collection(COLLECTIONS.USERS)
        .where("name", ">=", prefix)
        .where("name", "<", `${prefix}\uf8ff`)
        .get();
      userSnapshot.docs.forEach((doc) => demoUserIds.add(doc.id));
    }

    // Find demo shops
    for (const prefix of PREFIXES) {
      const shopSnapshot = await db
        .collection(COLLECTIONS.SHOPS)
        .where("name", ">=", prefix)
        .where("name", "<", `${prefix}\uf8ff`)
        .get();
      shopSnapshot.docs.forEach((doc) => demoShopIds.add(doc.id));
    }

    // Find demo orders
    for (const prefix of PREFIXES) {
      const orderSnapshot = await db
        .collection(COLLECTIONS.ORDERS)
        .where("orderNumber", ">=", prefix)
        .where("orderNumber", "<", `${prefix}\uf8ff`)
        .get();
      orderSnapshot.docs.forEach((doc) => demoOrderIds.add(doc.id));
    }

    // Collections with their cleanup strategies
    const collections = [
      // Primary collections with direct prefix field
      { name: "categories", field: "name", strategy: "prefix" },
      { name: "users", field: "name", strategy: "prefix" },
      { name: "shops", field: "name", strategy: "prefix" },
      { name: "products", field: "name", strategy: "prefix" },
      { name: "auctions", field: "title", strategy: "prefix" },
      { name: "orders", field: "orderNumber", strategy: "prefix" },
      { name: "coupons", field: "code", strategy: "prefix" },
      { name: "hero_slides", field: "title", strategy: "prefix" },
      { name: "blog_posts", field: "title", strategy: "prefix" },
      { name: "blog_categories", field: "name", strategy: "prefix" },
      { name: "blog_tags", field: "name", strategy: "prefix" },
      { name: "conversations", field: "subject", strategy: "prefix" },

      // Payments - use receipt or invoice_id field which has DEMO_ prefix
      { name: "payments", field: "receipt", strategy: "prefix" },

      // Shipments - related to demo orders
      {
        name: "shipments",
        relatedField: "orderId",
        relatedIds: demoOrderIds,
        strategy: "related",
      },

      // Related collections (delete by referenced ID)
      {
        name: "bids",
        relatedField: "auctionId",
        relatedIds: demoAuctionIds,
        strategy: "related",
      },
      {
        name: "reviews",
        relatedField: "product_id",
        relatedIds: demoProductIds,
        strategy: "related",
      },
      {
        name: "order_items",
        relatedField: "orderId",
        relatedIds: demoOrderIds,
        strategy: "related",
      },
      {
        name: "favorites",
        relatedField: "userId",
        relatedIds: demoUserIds,
        strategy: "related",
      },
      {
        name: "carts",
        relatedField: "userId",
        relatedIds: demoUserIds,
        strategy: "related",
      },
      {
        name: "cart_items",
        relatedField: "userId",
        relatedIds: demoUserIds,
        strategy: "related",
      },
      { name: "messages", strategy: "deep_scan" },
      {
        name: "notifications",
        relatedField: "userId",
        relatedIds: demoUserIds,
        strategy: "related",
      },
      {
        name: "addresses",
        relatedField: "userId",
        relatedIds: demoUserIds,
        strategy: "related",
      },
      {
        name: "returns",
        relatedField: "userId",
        relatedIds: demoUserIds,
        strategy: "related",
      },

      // Support tickets - use correct collection name and strategy
      {
        name: "support_tickets",
        relatedField: "userId",
        relatedIds: demoUserIds,
        strategy: "related",
      },
      {
        name: "tickets",
        relatedField: "userId",
        relatedIds: demoUserIds,
        strategy: "related",
      }, // legacy name

      {
        name: "payouts",
        relatedField: "shopId",
        relatedIds: demoShopIds,
        strategy: "related",
      },
      {
        name: "media",
        relatedField: "uploadedBy",
        relatedIds: demoUserIds,
        strategy: "related",
      },

      // Settings and feature flags - deep scan
      { name: "settings", strategy: "deep_scan" },
      { name: "feature_flags", strategy: "deep_scan" },
    ];

    for (const collection of collections) {
      try {
        let demoDocRefs: FirebaseFirestore.DocumentReference[] = [];

        if (collection.strategy === "prefix" && collection.field) {
          // Strategy 1: Direct field prefix match
          for (const prefix of PREFIXES) {
            const snapshot = await db
              .collection(collection.name)
              .where(collection.field, ">=", prefix)
              .where(collection.field, "<", `${prefix}\uf8ff`)
              .get();
            if (!snapshot.empty) {
              demoDocRefs.push(...snapshot.docs.map((doc) => doc.ref));
            }
          }
        } else if (
          collection.strategy === "related" &&
          collection.relatedField &&
          collection.relatedIds
        ) {
          // Strategy 2: Delete by related ID (for bids, reviews, etc.)
          const relatedIdsArray = Array.from(collection.relatedIds);

          // Firestore 'in' query supports max 30 values, so batch
          for (let i = 0; i < relatedIdsArray.length; i += 30) {
            const batch = relatedIdsArray.slice(i, i + 30);
            if (batch.length > 0) {
              const snapshot = await db
                .collection(collection.name)
                .where(collection.relatedField, "in", batch)
                .get();
              if (!snapshot.empty) {
                demoDocRefs.push(...snapshot.docs.map((doc) => doc.ref));
              }
            }
          }
        } else if (collection.strategy === "deep_scan") {
          // Strategy 3: Deep scan for any DEMO_ prefixed string value
          const allDocs = await db.collection(collection.name).get();
          for (const doc of allDocs.docs) {
            const data = doc.data();
            const isDemoData = checkForDemoData(data, PREFIXES);
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
            });
            await batch.commit();
          }
          deletionResults.push({
            collection: collection.name,
            count: demoDocRefs.length,
          });
        }
      } catch (err) {
        console.error(`Error cleaning ${collection.name}:`, err);
        // Continue with other collections
      }
    }

    // Calculate total deleted
    const totalDeleted = deletionResults.reduce((sum, r) => sum + r.count, 0);

    return NextResponse.json({
      success: true,
      deleted: totalDeleted,
      prefixes: PREFIXES,
      breakdown: deletionResults,
      message: `All demo/test data cleaned up successfully (${totalDeleted} documents deleted)`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Cleanup all error:", error);
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}

/**
 * Recursively check if any string value in an object starts with demo prefixes
 */
function checkForDemoData(data: any, prefixes: string[]): boolean {
  if (typeof data === "string") {
    return prefixes.some((prefix) => data.startsWith(prefix));
  }
  if (Array.isArray(data)) {
    return data.some((item) => checkForDemoData(item, prefixes));
  }
  if (data && typeof data === "object") {
    return Object.values(data).some((value) =>
      checkForDemoData(value, prefixes),
    );
  }
  return false;
}
