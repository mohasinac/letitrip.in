/**
 * Trigger: onReviewWrite
 *
 * Fires on any create, update, or delete of a document in the `reviews`
 * collection. Keeps product rating stats and store review stats in sync.
 *
 * Behaviour:
 *   - Any write where the review `status` is "approved" (or was "approved"
 *     before deletion) triggers a re-computation of:
 *       • product.avgRating and product.reviewCount
 *       • store.stats.totalReviews and store.stats.averageRating
 *       (identified via the review's `sellerId` field)
 *
 * Why re-compute instead of increment/decrement?
 *   Re-querying is idempotent and self-healing. The review counts are low
 *   enough (< few thousand per product) to make this fast and safe.
 */
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import {
  ReviewStatusValues,
  reviewRepository,
  storeRepository,
} from "../lib/appkit";
import { db } from "../config/firebase-admin";
import { logInfo, logError } from "../utils/logger";
import { REGION, COLLECTIONS } from "../config/constants";

const TRIGGER = "onReviewWrite";

export const onReviewWrite = onDocumentWritten(
  {
    document: `${COLLECTIONS.REVIEWS}/{reviewId}`,
    region: REGION,
  },
  async (event) => {
    const reviewId = event.params.reviewId;

    const beforeData = event.data?.before.exists
      ? (event.data.before.data() as Record<string, unknown>)
      : null;
    const afterData = event.data?.after.exists
      ? (event.data.after.data() as Record<string, unknown>)
      : null;

    const beforeStatus = (beforeData?.status as string | undefined) ?? null;
    const afterStatus = (afterData?.status as string | undefined) ?? null;

    // Only act when an approved review is involved
    const wasApproved = beforeStatus === ReviewStatusValues.APPROVED;
    const isApproved = afterStatus === ReviewStatusValues.APPROVED;

    if (!wasApproved && !isApproved) {
      // e.g. pending → pending, pending → rejected — nothing to update
      return;
    }

    // Read productId / sellerId from whichever snapshot is available
    const data = afterData ?? beforeData;
    if (!data) return;

    const productId = (data.productId as string | undefined) ?? null;
    const sellerId = (data.sellerId as string | undefined) ?? null;

    if (!productId) {
      logError(TRIGGER, "Review has no productId — skipping", null, {
        reviewId,
      });
      return;
    }

    try {
      // ── Recompute product stats ────────────────────────────────────────
      const { count, avgRating } =
        await reviewRepository.getApprovedRatingAggregate(productId);

      await db.collection(COLLECTIONS.PRODUCTS).doc(productId).update({
        avgRating,
        reviewCount: count,
        updatedAt: new Date(),
      });

      logInfo(TRIGGER, "Updated product rating stats", {
        reviewId,
        productId,
        count,
        avgRating,
      });

      // ── Recompute store stats (by sellerId) ────────────────────────────
      if (sellerId) {
        const storeSnap = await db
          .collection(COLLECTIONS.STORES)
          .where("ownerId", "==", sellerId)
          .limit(1)
          .get();

        if (!storeSnap.empty) {
          const storeId = storeSnap.docs[0].id;
          const sellerStats =
            await reviewRepository.getApprovedRatingAggregateBySeller(sellerId);

          await storeRepository.updateReviewStats(
            storeId,
            sellerStats.count,
            sellerStats.avgRating,
          );

          logInfo(TRIGGER, "Updated store review stats", {
            reviewId,
            storeId,
            count: sellerStats.count,
            avgRating: sellerStats.avgRating,
          });
        }
      }
    } catch (err) {
      logError(TRIGGER, "Failed to update rating stats", err, {
        reviewId,
        productId,
        sellerId,
      });
      throw err;
    }
  },
);
