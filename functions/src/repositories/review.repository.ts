import { db } from "../config/firebase-admin";
import { COLLECTIONS } from "../config/constants";

export interface ReviewRatingAggregate {
  count: number;
  avgRating: number;
}

export const reviewRepository = {
  /** Compute count and average rating from approved reviews for a product. */
  async getApprovedRatingAggregate(
    productId: string,
  ): Promise<ReviewRatingAggregate> {
    const snap = await db
      .collection(COLLECTIONS.REVIEWS)
      .where("productId", "==", productId)
      .where("status", "==", "approved")
      .get();

    if (snap.empty) return { count: 0, avgRating: 0 };

    const sum = snap.docs.reduce(
      (acc, d) => acc + ((d.data().rating as number) ?? 0),
      0,
    );
    const count = snap.docs.length;
    const avgRating = Math.round((sum / count) * 10) / 10;

    return { count, avgRating };
  },

  /**
   * Compute count and average rating from approved reviews for a store,
   * identified by the `sellerId` field on review documents.
   */
  async getApprovedRatingAggregateBySeller(
    sellerId: string,
  ): Promise<ReviewRatingAggregate> {
    const snap = await db
      .collection(COLLECTIONS.REVIEWS)
      .where("sellerId", "==", sellerId)
      .where("status", "==", "approved")
      .get();

    if (snap.empty) return { count: 0, avgRating: 0 };

    const sum = snap.docs.reduce(
      (acc, d) => acc + ((d.data().rating as number) ?? 0),
      0,
    );
    const count = snap.docs.length;
    const avgRating = Math.round((sum / count) * 10) / 10;

    return { count, avgRating };
  },
};
