"use client";

import { Card, Button } from "@/components";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { formatDate } from "@/utils";
import { ReviewStars } from "./ReviewStars";
import type { Review } from "./types";

const REVIEWS = UI_LABELS.ADMIN.REVIEWS;

interface ReviewDetailViewProps {
  review: Review;
  onBack: () => void;
  onApprove: (review: Review) => void;
  onReject: (review: Review) => void;
  onDelete: (review: Review) => void;
}

export function ReviewDetailView({
  review,
  onBack,
  onApprove,
  onReject,
  onDelete,
}: ReviewDetailViewProps) {
  return (
    <div className={THEME_CONSTANTS.spacing.stack}>
      <div className="flex items-center justify-between">
        <h1
          className={`text-2xl font-bold ${THEME_CONSTANTS.themed.textPrimary}`}
        >
          {REVIEWS.REVIEW_DETAILS}
        </h1>
        <Button onClick={onBack} variant="secondary">
          {REVIEWS.BACK_TO_LIST}
        </Button>
      </div>

      <Card>
        <div className={THEME_CONSTANTS.spacing.stack}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary}`}
              >
                {REVIEWS.PRODUCT}
              </label>
              <p className={THEME_CONSTANTS.themed.textPrimary}>
                {review.productName}
              </p>
            </div>
            <div>
              <label
                className={`text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary}`}
              >
                {REVIEWS.USER}
              </label>
              <p className={THEME_CONSTANTS.themed.textPrimary}>
                {review.userName}
                {review.verifiedPurchase && (
                  <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                    ✓ {REVIEWS.VERIFIED_PURCHASE}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div>
            <label
              className={`text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              {REVIEWS.RATING}
            </label>
            <div className="flex items-center gap-2 mt-1">
              <ReviewStars rating={review.rating} size="md" />
              <span className={THEME_CONSTANTS.themed.textSecondary}>
                ({review.rating}/5)
              </span>
            </div>
          </div>

          <div>
            <label
              className={`text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              {REVIEWS.COMMENT}
            </label>
            <p
              className={`mt-1 ${THEME_CONSTANTS.themed.textPrimary} whitespace-pre-wrap`}
            >
              {review.comment}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label
                className={`text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary}`}
              >
                {UI_LABELS.TABLE.STATUS}
              </label>
              <p className="mt-1">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    review.status === "approved"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : review.status === "rejected"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {review.status.charAt(0).toUpperCase() +
                    review.status.slice(1)}
                </span>
              </p>
            </div>
            <div>
              <label
                className={`text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary}`}
              >
                {REVIEWS.HELPFUL_VOTES}
              </label>
              <p className={THEME_CONSTANTS.themed.textPrimary}>
                {review.helpfulCount} helpful, {review.notHelpfulCount} not
                helpful
              </p>
            </div>
            <div>
              <label
                className={`text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary}`}
              >
                {REVIEWS.CREATED}
              </label>
              <p className={THEME_CONSTANTS.themed.textPrimary}>
                {formatDate(review.createdAt)}
              </p>
            </div>
          </div>

          <div
            className={`flex gap-2 pt-4 border-t ${THEME_CONSTANTS.themed.borderColor}`}
          >
            {review.status !== "approved" && (
              <Button onClick={() => onApprove(review)} variant="primary">
                {REVIEWS.APPROVE}
              </Button>
            )}
            {review.status !== "rejected" && (
              <Button onClick={() => onReject(review)} variant="secondary">
                {REVIEWS.REJECT}
              </Button>
            )}
            <Button
              onClick={() => onDelete(review)}
              variant="secondary"
              className="text-red-600 hover:text-red-700"
            >
              {REVIEWS.DELETE}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
