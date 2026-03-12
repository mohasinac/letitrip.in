"use client";

import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { ReviewStars } from "./ReviewStars";
import type { Review } from "./Review.types";
import { Button, Span } from "@/components";

const REVIEWS = UI_LABELS.ADMIN.REVIEWS;

export function getReviewTableColumns() {
  return [
    {
      key: "productName",
      header: REVIEWS.PRODUCT,
      sortable: true,
      width: "20%",
    },
    {
      key: "userName",
      header: REVIEWS.USER,
      sortable: true,
      width: "15%",
      render: (review: Review) => (
        <div>
          <div>{review.userName}</div>
          {review.verified && (
            <Span className="text-xs text-green-600 dark:text-green-400">
              ✓ {REVIEWS.VERIFIED}
            </Span>
          )}
        </div>
      ),
    },
    {
      key: "rating",
      header: REVIEWS.RATING,
      sortable: true,
      width: "12%",
      render: (review: Review) => (
        <div className="flex items-center gap-2">
          <ReviewStars rating={review.rating} />
          <Span className={`text-sm ${THEME_CONSTANTS.themed.textSecondary}`}>
            ({review.rating})
          </Span>
        </div>
      ),
    },
    {
      key: "comment",
      header: REVIEWS.COMMENT,
      width: "25%",
      render: (review: Review) => (
        <div
          className={`text-sm ${THEME_CONSTANTS.themed.textSecondary} truncate`}
        >
          {review.comment.substring(0, 80)}
          {review.comment.length > 80 && "..."}
        </div>
      ),
    },
    {
      key: "helpful",
      header: REVIEWS.COL_HELPFUL,
      width: "10%",
      render: (review: Review) => {
        return <Span className="text-sm">{review.helpfulCount ?? 0}</Span>;
      },
    },
    {
      key: "status",
      header: UI_LABELS.TABLE.STATUS,
      sortable: true,
      width: "12%",
      render: (review: Review) => (
        <Span
          className={`px-2 py-1 text-xs font-medium rounded ${
            review.status === "approved"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : review.status === "rejected"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }`}
        >
          {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
        </Span>
      ),
    },
  ];
}

interface ReviewRowActionsProps {
  review: Review;
  onApprove: (review: Review) => void;
  onReject: (review: Review) => void;
  onDelete: (review: Review) => void;
}

export function ReviewRowActions({
  review,
  onApprove,
  onReject,
  onDelete,
}: ReviewRowActionsProps) {
  return (
    <div className="flex gap-2">
      {review.status !== "approved" && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onApprove(review);
          }}
          className="text-green-600 hover:text-green-800 dark:text-green-400 text-sm"
        >
          {REVIEWS.APPROVE}
        </Button>
      )}
      {review.status !== "rejected" && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onReject(review);
          }}
          className="text-orange-600 hover:text-orange-800 dark:text-orange-400 text-sm"
        >
          {REVIEWS.REJECT}
        </Button>
      )}
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(review);
        }}
        className="text-red-600 hover:text-red-800 dark:text-red-400 text-sm"
      >
        {REVIEWS.DELETE}
      </Button>
    </div>
  );
}
