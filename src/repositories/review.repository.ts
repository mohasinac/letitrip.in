/**
 * Review Repository
 *
 * Data access layer for review documents in Firestore
 */

import { BaseRepository } from "./base.repository";
import type {
  ReviewDocument,
  ReviewCreateInput,
  ReviewStatus,
  ReviewModerationInput,
  REVIEW_COLLECTION,
} from "@/db/schema/reviews";

class ReviewRepository extends BaseRepository<ReviewDocument> {
  constructor() {
    super("reviews" as typeof REVIEW_COLLECTION);
  }

  /**
   * Find reviews by product ID
   */
  async findByProduct(productId: string): Promise<ReviewDocument[]> {
    return this.findBy("productId", productId);
  }

  /**
   * Find approved reviews for a product
   */
  async findApprovedByProduct(productId: string): Promise<ReviewDocument[]> {
    const snapshot = await this.db
      .collection(this.collection)
      .where("productId", "==", productId)
      .where("status", "==", "approved")
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ReviewDocument[];
  }

  /**
   * Find reviews by user ID
   */
  async findByUser(userId: string): Promise<ReviewDocument[]> {
    return this.findBy("userId", userId);
  }

  /**
   * Find pending reviews (for moderation)
   */
  async findPending(): Promise<ReviewDocument[]> {
    return this.findBy("status", "pending");
  }

  /**
   * Find reviews by status
   */
  async findByStatus(status: ReviewStatus): Promise<ReviewDocument[]> {
    return this.findBy("status", status);
  }

  /**
   * Approve review
   */
  async approve(
    reviewId: string,
    moderatorId: string,
    moderatorNote?: string,
  ): Promise<ReviewDocument> {
    return this.update(reviewId, {
      status: "approved",
      moderatorId,
      moderatorNote,
      approvedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Reject review
   */
  async reject(
    reviewId: string,
    moderatorId: string,
    rejectionReason: string,
    moderatorNote?: string,
  ): Promise<ReviewDocument> {
    return this.update(reviewId, {
      status: "rejected",
      moderatorId,
      moderatorNote,
      rejectionReason,
      rejectedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Increment helpful count
   */
  async incrementHelpful(reviewId: string): Promise<void> {
    const review = await this.findById(reviewId);
    if (review) {
      await this.update(reviewId, {
        helpfulCount: review.helpfulCount + 1,
      });
    }
  }

  /**
   * Increment report count
   */
  async incrementReportCount(reviewId: string): Promise<void> {
    const review = await this.findById(reviewId);
    if (review) {
      await this.update(reviewId, {
        reportCount: review.reportCount + 1,
      });
    }
  }

  /**
   * Get average rating for a product
   */
  async getAverageRating(productId: string): Promise<number> {
    const reviews = await this.findApprovedByProduct(productId);
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  }

  /**
   * Get rating distribution for a product
   */
  async getRatingDistribution(
    productId: string,
  ): Promise<Record<number, number>> {
    const reviews = await this.findApprovedByProduct(productId);
    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review) => {
      distribution[review.rating]++;
    });

    return distribution;
  }
}

// Export singleton instance
export const reviewRepository = new ReviewRepository();
