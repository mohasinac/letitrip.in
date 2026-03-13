/**
 * Store Repository — Firebase Functions
 *
 * Lightweight write helpers used by triggers and cron jobs.
 */
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../config/firebase-admin";
import { COLLECTIONS } from "../config/constants";

export const storeRepository = {
  /**
   * Increment (or decrement) `stats.totalProducts` for a store.
   * Called by onProductWrite when a product's published status changes.
   */
  async incrementTotalProducts(storeId: string, delta: number): Promise<void> {
    if (!storeId) return;
    await db
      .collection(COLLECTIONS.STORES)
      .doc(storeId)
      .update({
        "stats.totalProducts": FieldValue.increment(delta),
        updatedAt: new Date(),
      });
  },

  /**
   * Increment `stats.itemsSold` for a store.
   * Called by onOrderStatusChange when an order transitions to "delivered".
   */
  async incrementItemsSold(storeId: string, delta: number): Promise<void> {
    if (!storeId) return;
    await db
      .collection(COLLECTIONS.STORES)
      .doc(storeId)
      .update({
        "stats.itemsSold": FieldValue.increment(delta),
        updatedAt: new Date(),
      });
  },

  /**
   * Recompute and overwrite all store stats from fresh queries.
   * Used by the nightly reconcile cron job.
   */
  async setStats(
    storeId: string,
    totalProducts: number,
    itemsSold: number,
    totalReviews: number,
    averageRating: number | null,
  ): Promise<void> {
    if (!storeId) return;
    const update: Record<string, unknown> = {
      "stats.totalProducts": totalProducts,
      "stats.itemsSold": itemsSold,
      "stats.totalReviews": totalReviews,
      updatedAt: new Date(),
    };
    if (averageRating !== null) {
      update["stats.averageRating"] = averageRating;
    }
    await db.collection(COLLECTIONS.STORES).doc(storeId).update(update);
  },

  /**
   * Recompute store review stats from aggregated review data.
   * totalReviews = count of approved reviews; averageRating = mean.
   */
  async updateReviewStats(
    storeId: string,
    totalReviews: number,
    averageRating: number,
  ): Promise<void> {
    if (!storeId) return;
    await db.collection(COLLECTIONS.STORES).doc(storeId).update({
      "stats.totalReviews": totalReviews,
      "stats.averageRating": averageRating,
      updatedAt: new Date(),
    });
  },

  /**
   * List all store IDs (for batch reconcile jobs).
   */
  async listIds(): Promise<string[]> {
    const snap = await db.collection(COLLECTIONS.STORES).select().get();
    return snap.docs.map((d) => d.id);
  },
};
