/**
 * Job: countersReconcile
 *
 * Scheduled: 03:00 UTC every day.
 *
 * Nightly reconciliation of all denormalized counters. Runs both phases in
 * one invocation to use a single Cloud Scheduler job instead of two.
 *
 * ─── Phase 1: Category metrics ───────────────────────────────────────────────
 * Rebuilds every category's direct counts (productCount, auctionCount,
 * productIds, auctionIds) from the `products` collection source-of-truth and
 * propagates aggregate totals (totalProductCount, totalAuctionCount,
 * totalItemCount) to ancestor categories. Heals any drift left by failed
 * real-time trigger invocations or direct console edits.
 *
 * ─── Phase 2: Store stats ─────────────────────────────────────────────────────
 * Rebuilds totalProducts, itemsSold, totalReviews, averageRating for every
 * store document from the source-of-truth collections. Heals drift from
 * missed onProductWrite / onReviewWrite trigger invocations.
 *
 * Free-tier notes:
 *   - 512 MiB covers the category phase which holds all product IDs in RAM.
 *   - maxInstances: 1 prevents overlapping runs.
 *   - Sequential inner loops avoid Firestore read-rate spikes.
 */
import { onSchedule } from "firebase-functions/v2/scheduler";
import { ProductStatusValues } from "@mohasinac/appkit";
import { categoriesRepository as categoryRepository } from "@mohasinac/appkit";
import { reviewRepository } from "@mohasinac/appkit";
import { storeRepository } from "@mohasinac/appkit";
import { db } from "../config/firebase-admin";
import { logInfo, logError } from "../utils/logger";
import {
  REGION,
  SCHEDULES,
  COLLECTIONS,
  QUERY_LIMIT,
} from "../config/constants";

const JOB = "countersReconcile";

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1 helper
// ─────────────────────────────────────────────────────────────────────────────
async function reconcileCategories(): Promise<void> {
  const snap = await db
    .collection(COLLECTIONS.PRODUCTS)
    .where("status", "==", ProductStatusValues.PUBLISHED)
    .limit(QUERY_LIMIT)
    .get();

  logInfo(JOB, `[categories] ${snap.size} published products found`);

  // Group by leaf category
  const leafCounts: Record<
    string,
    { productIds: string[]; auctionIds: string[] }
  > = {};

  for (const doc of snap.docs) {
    const data = doc.data() as { category?: string; isAuction?: boolean };
    const catId = data.category;
    if (!catId) continue;

    if (!leafCounts[catId]) {
      leafCounts[catId] = { productIds: [], auctionIds: [] };
    }
    if (data.isAuction) {
      leafCounts[catId].auctionIds.push(doc.id);
    } else {
      leafCounts[catId].productIds.push(doc.id);
    }
  }

  // Overwrite direct metrics on leaf categories; accumulate ancestor aggregates
  const ancestorAggregates: Record<
    string,
    { productDelta: number; auctionDelta: number }
  > = {};

  let leafUpdated = 0;
  for (const [catId, { productIds, auctionIds }] of Object.entries(
    leafCounts,
  )) {
    await categoryRepository.setMetrics(
      catId,
      productIds.length,
      auctionIds.length,
      productIds,
      auctionIds,
    );
    leafUpdated++;

    const parentIds = (await categoryRepository.findById(catId))?.parentIds ?? [];
    for (const ancestorId of parentIds) {
      if (!ancestorAggregates[ancestorId]) {
        ancestorAggregates[ancestorId] = { productDelta: 0, auctionDelta: 0 };
      }
      ancestorAggregates[ancestorId].productDelta += productIds.length;
      ancestorAggregates[ancestorId].auctionDelta += auctionIds.length;
    }
  }

  // Write aggregate totals to ancestor categories
  const ancestorEntries = Object.entries(ancestorAggregates);
  for (const [ancestorId, { productDelta, auctionDelta }] of ancestorEntries) {
    await categoryRepository.setMetrics(
      ancestorId,
      productDelta,
      auctionDelta,
      [],
      [],
    );
  }

  logInfo(JOB, "[categories] reconciliation complete", {
    leafCategoriesUpdated: leafUpdated,
    ancestorCategoriesUpdated: ancestorEntries.length,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 2 helper
// ─────────────────────────────────────────────────────────────────────────────
async function reconcileStores(): Promise<void> {
  const storeIds = await storeRepository.listIds();
  logInfo(JOB, `[stores] ${storeIds.length} stores found`);

  let processed = 0;
  let errors = 0;

  for (const storeId of storeIds) {
    try {
      const storeSnap = await db
        .collection(COLLECTIONS.STORES)
        .doc(storeId)
        .get();
      if (!storeSnap.exists) continue;

      const sellerId = (storeSnap.data() as { ownerId?: string }).ownerId;
      if (!sellerId) continue;

      const [productsSnap, ordersSnap, reviewStats] = await Promise.all([
        db
          .collection(COLLECTIONS.PRODUCTS)
          .where("sellerId", "==", sellerId)
          .where("status", "==", ProductStatusValues.PUBLISHED)
          .limit(QUERY_LIMIT)
          .get(),
        db
          .collection(COLLECTIONS.ORDERS)
          .where("sellerId", "==", sellerId)
          .where("status", "==", "delivered")
          .limit(QUERY_LIMIT)
          .get(),
        reviewRepository.getApprovedRatingAggregateBySeller(sellerId),
      ]);

      await storeRepository.setStats(
        storeId,
        productsSnap.size,
        ordersSnap.size,
        reviewStats.count,
        reviewStats.count > 0 ? reviewStats.avgRating : null,
      );
      processed++;
    } catch (storeErr) {
      errors++;
      logError(JOB, `[stores] failed for store ${storeId}`, storeErr);
    }
  }

  logInfo(JOB, "[stores] reconciliation complete", {
    processed,
    errors,
    total: storeIds.length,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported scheduled job
// ─────────────────────────────────────────────────────────────────────────────
export const countersReconcile = onSchedule(
  {
    schedule: SCHEDULES.DAILY_0300,
    region: REGION,
    memory: "512MiB",
    maxInstances: 1,
    timeoutSeconds: 540,
  },
  async () => {
    logInfo(JOB, "Starting counters reconciliation (categories + stores)");

    // Run phases sequentially to avoid Firestore read-rate spikes.
    try {
      await reconcileCategories();
    } catch (err) {
      logError(JOB, "Category reconciliation failed", err);
      // Continue to store phase even if category phase fails.
    }

    try {
      await reconcileStores();
    } catch (err) {
      logError(JOB, "Store reconciliation failed", err);
      throw err;
    }

    logInfo(JOB, "Counters reconciliation complete");
  },
);
