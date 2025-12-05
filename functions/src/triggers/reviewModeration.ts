import * as admin from "firebase-admin";
import type { EventContext } from "firebase-functions/v1";
import * as functions from "firebase-functions/v1";
import type { DocumentSnapshot } from "firebase-functions/v1/firestore";
import type { CallableContext } from "firebase-functions/v1/https";

const db = admin.firestore();

// Common profanity/spam patterns (basic list - expand as needed)
const PROFANITY_PATTERNS = [
  /\b(spam|scam|fake|fraud)\b/i,
  /\b(damn|hell|crap)\b/i,
  /\b(stupid|idiot|dumb)\b/i,
  // Add more patterns as needed
];

const SPAM_INDICATORS = [
  /\b(click here|buy now|limited offer|call now)\b/i,
  /\b(www\.|http|\.com|\.in)\b/i,
  /\b(\d{10}|\+91\d{10})\b/, // Phone numbers
  /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/, // Emails
];

/**
 * Firestore trigger: Moderate new reviews
 * - Auto-flag reviews with profanity or spam patterns
 * - Update product/shop average rating
 * - Notify shop owner of new review
 */
export const onReviewCreated = functions.firestore
  .document("reviews/{reviewId}")
  .onCreate(async (snapshot: DocumentSnapshot, context: EventContext) => {
    const { reviewId } = context.params;
    const reviewData = snapshot.data();

    if (!reviewData) {
      console.error(`No data found for review ${reviewId}`);
      return null;
    }

    const { productId, shopId, userId, rating, comment, orderId } =
      reviewData as {
        productId?: string;
        shopId?: string;
        userId: string;
        rating: number;
        comment?: string;
        orderId?: string;
      };

    const batch = db.batch();

    try {
      // 1. Check for profanity and spam
      const flags = {
        hasProfanity: false,
        hasSpam: false,
        hasContactInfo: false,
      };

      if (comment) {
        flags.hasProfanity = PROFANITY_PATTERNS.some((pattern) =>
          pattern.test(comment)
        );
        flags.hasSpam = SPAM_INDICATORS.some((pattern) =>
          pattern.test(comment)
        );
        flags.hasContactInfo = /\b(\d{10}|@|\bwww\.)\b/i.test(comment);
      }

      const needsModeration =
        flags.hasProfanity || flags.hasSpam || flags.hasContactInfo;

      // 2. Update review with moderation flags
      if (needsModeration) {
        const reviewRef = db.collection("reviews").doc(reviewId);
        batch.update(reviewRef, {
          moderation: {
            flagged: true,
            flags,
            status: "pending_review",
            flaggedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create moderation task for admin
        const moderationRef = db.collection("moderationQueue").doc();
        batch.set(moderationRef, {
          type: "review",
          reviewId,
          userId,
          content: comment,
          flags,
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // 3. Update product average rating
      if (productId) {
        const productRef = db.collection("products").doc(productId);
        const productDoc = await productRef.get();

        if (productDoc.exists) {
          const productData = productDoc.data()!;
          const currentRating = productData.averageRating || 0;
          const currentCount = productData.reviewCount || 0;

          const newCount = currentCount + 1;
          const newRating = (currentRating * currentCount + rating) / newCount;

          batch.update(productRef, {
            averageRating: parseFloat(newRating.toFixed(2)),
            reviewCount: newCount,
            lastReviewAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      // 4. Update shop average rating
      if (shopId) {
        const shopRef = db.collection("shops").doc(shopId);
        const shopDoc = await shopRef.get();

        if (shopDoc.exists) {
          const shopData = shopDoc.data()!;
          const currentRating = shopData.averageRating || 0;
          const currentCount = shopData.reviewCount || 0;

          const newCount = currentCount + 1;
          const newRating = (currentRating * currentCount + rating) / newCount;

          batch.update(shopRef, {
            averageRating: parseFloat(newRating.toFixed(2)),
            reviewCount: newCount,
            lastReviewAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // 5. Notify shop owner of new review
          const sellerNotificationRef = db.collection("notifications").doc();
          batch.set(sellerNotificationRef, {
            userId: shopData.ownerId,
            type: "review",
            title: "⭐ New Review Received",
            message: needsModeration
              ? `A new review (${rating} stars) is pending moderation.`
              : `You received a ${rating}-star review${
                  comment
                    ? `: "${comment.substring(0, 50)}${
                        comment.length > 50 ? "..." : ""
                      }"`
                    : "."
                }`,
            data: {
              reviewId,
              productId,
              shopId,
              rating,
              needsModeration,
            },
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      // 6. Update reviewer statistics
      const reviewerRef = db.collection("users").doc(userId);
      batch.update(reviewerRef, {
        "metrics.totalReviews": admin.firestore.FieldValue.increment(1),
        "metrics.lastReviewAt": admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 7. Mark order as reviewed (if linked to order)
      if (orderId) {
        const orderRef = db.collection("orders").doc(orderId);
        batch.update(orderRef, {
          reviewed: true,
          reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      await batch.commit();

      console.log(
        `Review ${reviewId} processed: ${rating} stars${
          needsModeration ? " (flagged for moderation)" : ""
        }`
      );
      return null;
    } catch (error) {
      console.error("Error in onReviewCreated:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to process review",
        error
      );
    }
  });

/**
 * Update review status after moderation decision
 */
export const updateReviewStatus = functions.https.onCall(
  async (data, context: CallableContext) => {
    // Verify admin authentication
    if (!context?.auth || !(context.auth.token as any).admin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can moderate reviews"
      );
    }

    const { reviewId, action, reason } = data;

    if (!reviewId || !action) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "reviewId and action are required"
      );
    }

    const batch = db.batch();

    try {
      const reviewRef = db.collection("reviews").doc(reviewId);
      const reviewDoc = await reviewRef.get();

      if (!reviewDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Review not found");
      }

      const reviewData = reviewDoc.data()!;

      // Update review moderation status
      batch.update(reviewRef, {
        "moderation.status": action, // "approved" or "rejected"
        "moderation.reviewedBy": context.auth.uid,
        "moderation.reviewedAt": admin.firestore.FieldValue.serverTimestamp(),
        "moderation.reason": reason || null,
        visible: action === "approved",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update moderation queue
      const queueSnapshot = await db
        .collection("moderationQueue")
        .where("reviewId", "==", reviewId)
        .limit(1)
        .get();

      if (!queueSnapshot.empty) {
        const queueRef = queueSnapshot.docs[0].ref;
        batch.update(queueRef, {
          status: action,
          reviewedBy: context.auth.uid,
          reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
          reason: reason || null,
        });
      }

      // Notify reviewer if rejected
      if (action === "rejected") {
        const notificationRef = db.collection("notifications").doc();
        batch.set(notificationRef, {
          userId: reviewData.userId,
          type: "review",
          title: "Review Not Published",
          message: `Your review was not published. ${
            reason || "It didn't meet our community guidelines."
          }`,
          data: { reviewId },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      await batch.commit();

      return { success: true, reviewId, action };
    } catch (error) {
      console.error("Error in updateReviewStatus:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to update review status",
        error
      );
    }
  }
);
