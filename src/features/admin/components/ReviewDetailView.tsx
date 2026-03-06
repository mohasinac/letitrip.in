"use client";

import { Card, Button, Heading, Text, Label, Span } from "@/components";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { formatDate } from "@/utils";
import { ReviewStars } from "./ReviewStars";
import type { Review } from "./Review.types";

const REVIEWS = UI_LABELS.ADMIN.REVIEWS;
const { flex } = THEME_CONSTANTS;

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
      <div className={flex.between}>
        <Heading level={1} className="text-2xl font-bold">
          {REVIEWS.REVIEW_DETAILS}
        </Heading>
        <Button onClick={onBack} variant="secondary">
          {REVIEWS.BACK_TO_LIST}
        </Button>
      </div>

      <Card>
        <div className={THEME_CONSTANTS.spacing.stack}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">{REVIEWS.PRODUCT}</Label>
              <Text className="mt-0.5">{review.productName}</Text>
            </div>
            <div>
              <Label className="text-sm font-medium">{REVIEWS.USER}</Label>
              <Text className="mt-0.5">
                {review.userName}
                {review.verifiedPurchase && (
                  <Span variant="success" className="ml-2 text-xs">
                    ✓ {REVIEWS.VERIFIED_PURCHASE}
                  </Span>
                )}
              </Text>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">{REVIEWS.RATING}</Label>
            <div className="flex items-center gap-2 mt-1">
              <ReviewStars rating={review.rating} size="md" />
              <Span variant="secondary">({review.rating}/5)</Span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">{REVIEWS.COMMENT}</Label>
            <Text className="mt-1 whitespace-pre-wrap">{review.comment}</Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">
                {UI_LABELS.TABLE.STATUS}
              </Label>
              <div className="mt-1">
                <Span
                  variant="inherit"
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
                </Span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">
                {REVIEWS.HELPFUL_VOTES}
              </Label>
              <Text className="mt-0.5">
                {review.helpfulCount} helpful, {review.notHelpfulCount} not
                helpful
              </Text>
            </div>
            <div>
              <Label className="text-sm font-medium">{REVIEWS.CREATED}</Label>
              <Text className="mt-0.5">{formatDate(review.createdAt)}</Text>
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
