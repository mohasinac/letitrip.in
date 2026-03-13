/**
 * Category Repository — Firebase Functions
 *
 * Lightweight write helpers used by triggers and cron jobs.
 * Only exposes what functions need; reads are kept minimal.
 */
import { FieldValue, type WriteBatch } from "firebase-admin/firestore";
import { db } from "../config/firebase-admin";
import { COLLECTIONS } from "../config/constants";

export interface CategoryRow {
  id: string;
  parentIds: string[];
  isAuction?: boolean;
}

export const categoryRepository = {
  /**
   * Atomically increment (or decrement) direct + aggregate metrics for a
   * category and all its ancestors.
   *
   * @param batch    - Firestore WriteBatch to join
   * @param categoryId - The leaf category ID
   * @param parentIds  - Materialized path (ancestor IDs, root → immediate parent)
   * @param productDelta - +1 / -1 for regular products
   * @param auctionDelta - +1 / -1 for auctions
   * @param productId  - When set, also mutates `metrics.productIds` array union/remove
   */
  updateMetricsInBatch(
    batch: WriteBatch,
    categoryId: string,
    parentIds: string[],
    productDelta: number,
    auctionDelta: number,
    productId?: string,
  ): void {
    const now = new Date();
    const colRef = db.collection(COLLECTIONS.CATEGORIES);

    // Direct category — update both direct counters and aggregates
    const directRef = colRef.doc(categoryId);
    const directUpdate: Record<string, unknown> = {
      "metrics.productCount": FieldValue.increment(productDelta),
      "metrics.auctionCount": FieldValue.increment(auctionDelta),
      "metrics.totalProductCount": FieldValue.increment(productDelta),
      "metrics.totalAuctionCount": FieldValue.increment(auctionDelta),
      "metrics.totalItemCount": FieldValue.increment(
        productDelta + auctionDelta,
      ),
      "metrics.lastUpdated": now,
      updatedAt: now,
    };

    if (productId && productDelta !== 0) {
      directUpdate["metrics.productIds"] =
        productDelta > 0
          ? FieldValue.arrayUnion(productId)
          : FieldValue.arrayRemove(productId);
    }
    if (productId && auctionDelta !== 0) {
      directUpdate["metrics.auctionIds"] =
        auctionDelta > 0
          ? FieldValue.arrayUnion(productId)
          : FieldValue.arrayRemove(productId);
    }

    batch.update(directRef, directUpdate);

    // Ancestor categories — only aggregate counters
    for (const ancestorId of parentIds) {
      batch.update(colRef.doc(ancestorId), {
        "metrics.totalProductCount": FieldValue.increment(productDelta),
        "metrics.totalAuctionCount": FieldValue.increment(auctionDelta),
        "metrics.totalItemCount": FieldValue.increment(
          productDelta + auctionDelta,
        ),
        "metrics.lastUpdated": now,
        updatedAt: now,
      });
    }
  },

  /**
   * Fetch a single category's parentIds for ancestor propagation.
   */
  async getParentIds(categoryId: string): Promise<string[]> {
    const snap = await db
      .collection(COLLECTIONS.CATEGORIES)
      .doc(categoryId)
      .get();
    if (!snap.exists) return [];
    const data = snap.data() as { parentIds?: string[] } | undefined;
    return data?.parentIds ?? [];
  },

  /**
   * Overwrite the product/auction counts for a category from a fresh
   * full-count query (used by the nightly reconcile job).
   */
  async setMetrics(
    categoryId: string,
    productCount: number,
    auctionCount: number,
    productIds: string[],
    auctionIds: string[],
  ): Promise<void> {
    await db
      .collection(COLLECTIONS.CATEGORIES)
      .doc(categoryId)
      .update({
        "metrics.productCount": productCount,
        "metrics.auctionCount": auctionCount,
        "metrics.totalProductCount": productCount,
        "metrics.totalAuctionCount": auctionCount,
        "metrics.totalItemCount": productCount + auctionCount,
        "metrics.productIds": productIds,
        "metrics.auctionIds": auctionIds,
        "metrics.lastUpdated": new Date(),
        updatedAt: new Date(),
      });
  },
};
