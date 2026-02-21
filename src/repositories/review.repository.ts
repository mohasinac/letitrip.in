/**
 * Review Repository
 *
 * Data access layer for review documents in Firestore
 */

import { BaseRepository } from "./base.repository";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import type {
  ReviewDocument,
  ReviewCreateInput,
  ReviewStatus,
  ReviewModerationInput,
} from "@/db/schema";
import { createReviewId, REVIEW_COLLECTION, REVIEW_FIELDS } from "@/db/schema";
import type { SieveModel, FirebaseSieveResult } from "@/lib/query";

class ReviewRepository extends BaseRepository<ReviewDocument> {
  constructor() {
    super(REVIEW_COLLECTION);
  }

  /**
   * Create new review with SEO-friendly ID
   */
  async create(input: ReviewCreateInput): Promise<ReviewDocument> {
    // Extract first name from userName for ID generation
    const firstName = input.userName.split(" ")[0] || input.userName;

    // Generate review ID
    const id = createReviewId(
      input.productTitle,
      firstName,
      new Date(), // Use current date
    );

    const reviewData: Omit<ReviewDocument, "id"> = {
      ...input,
      helpfulCount: 0,
      reportCount: 0,
      status: "pending",
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db
      .collection(this.collection)
      .doc(id)
      .set(prepareForFirestore(reviewData));

    return { id, ...reviewData };
  }

  /**
   * Find reviews by product ID
   */
  async findByProduct(productId: string): Promise<ReviewDocument[]> {
    return this.findBy(REVIEW_FIELDS.PRODUCT_ID, productId);
  }

  /**
   * Find approved reviews for a product
   */
  async findApprovedByProduct(productId: string): Promise<ReviewDocument[]> {
    const snapshot = await this.db
      .collection(this.collection)
      .where(REVIEW_FIELDS.PRODUCT_ID, "==", productId)
      .where(REVIEW_FIELDS.STATUS, "==", "approved")
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
    return this.findBy(REVIEW_FIELDS.USER_ID, userId);
  }

  /**
   * Find pending reviews (for moderation)
   */
  async findPending(): Promise<ReviewDocument[]> {
    return this.findBy(REVIEW_FIELDS.STATUS, "pending");
  }

  /**
   * Find reviews by status
   */
  async findByStatus(status: ReviewStatus): Promise<ReviewDocument[]> {
    return this.findBy(REVIEW_FIELDS.STATUS, status);
  }

  /**
   * Find featured approved reviews
   */
  async findFeatured(limit: number = 18): Promise<ReviewDocument[]> {
    const snapshot = await this.db
      .collection(this.collection)
      .where(REVIEW_FIELDS.FEATURED, "==", true)
      .where(REVIEW_FIELDS.STATUS, "==", "approved")
      .orderBy(REVIEW_FIELDS.CREATED_AT, "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ReviewDocument[];
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

  // ---------------------------------------------------------------------------
  // Sieve-powered list query
  // ---------------------------------------------------------------------------

  /** Fields that consumers may filter or sort on. */
  static readonly SIEVE_FIELDS = {
    id: { canFilter: true, canSort: false },
    productId: { canFilter: true, canSort: false },
    productTitle: { canFilter: true, canSort: true },
    userId: { canFilter: true, canSort: false },
    userName: { canFilter: true, canSort: true },
    status: { canFilter: true, canSort: true },
    rating: { canFilter: true, canSort: true },
    verified: { canFilter: true, canSort: false },
    helpfulCount: { canFilter: true, canSort: true },
    createdAt: { canFilter: true, canSort: true },
  };

  /**
   * Paginated, Firestore-native review list scoped to one product.
   *
   * All Sieve filtering, sorting, and pagination run at the DB layer.
   * The `allReviews` fetch (for rating stats) is kept separate so that
   * aggregations don't incur the cost of loading paginated docs twice.
   *
   * @example
   * ```ts
   * const page = await reviewRepository.listForProduct(productId, {
   *   filters:  'status==approved',
   *   sorts:    '-createdAt',
   *   page:     1,
   *   pageSize: 10,
   * });
   * ```
   */
  async listForProduct(
    productId: string,
    model: SieveModel,
  ): Promise<FirebaseSieveResult<ReviewDocument>> {
    const baseQuery = this.getCollection().where(
      REVIEW_FIELDS.PRODUCT_ID,
      "==",
      productId,
    );
    return this.sieveQuery<ReviewDocument>(
      model,
      ReviewRepository.SIEVE_FIELDS,
      {
        baseQuery,
        defaultPageSize: 10,
        maxPageSize: 50,
      },
    );
  }

  /**
   * Paginated, Firestore-native review list across ALL products (admin use).
   *
   * Unlike `listForProduct`, no `productId` pre-filter is applied — this
   * returns reviews from every product and is intended for admin dashboards.
   *
   * @example
   * ```ts
   * const page = await reviewRepository.listAll({
   *   filters:  'status==pending',
   *   sorts:    '-createdAt',
   *   page:     1,
   *   pageSize: 50,
   * });
   * ```
   */
  async listAll(
    model: SieveModel,
  ): Promise<FirebaseSieveResult<ReviewDocument>> {
    return this.sieveQuery<ReviewDocument>(
      model,
      ReviewRepository.SIEVE_FIELDS,
      {
        defaultPageSize: 50,
        maxPageSize: 200,
      },
    );
  }
}

// Export singleton instance
export const reviewRepository = new ReviewRepository();
