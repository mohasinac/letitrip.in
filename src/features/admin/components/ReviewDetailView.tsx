"use client";

import {
  Grid,
  Heading,
  Label,
  Row,
  Stack,
  Text,
  Button,
  Span,
} from "@mohasinac/appkit/ui";
import { Card } from "@/components";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { formatDate } from "@/utils";
import { RatingDisplay } from "@mohasinac/appkit/ui";
import type { Review } from "./Review.types";

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
    <Stack>
      <Row justify="between" gap="none">
        <Heading level={1} className="text-2xl font-bold">
          {REVIEWS.REVIEW_DETAILS}
        </Heading>
        <Button onClick={onBack} variant="secondary">
          {REVIEWS.BACK_TO_LIST}
        </Button>
      </Row>

      <Card>
        <Stack>
          <Grid cols={2} gap="md">
            <div>
              <Label className="text-sm font-medium">{REVIEWS.PRODUCT}</Label>
              <Text className="mt-0.5">{review.productName}</Text>
            </div>
            <div>
              <Label className="text-sm font-medium">{REVIEWS.USER}</Label>
              <Text className="mt-0.5">
                {review.userName}
                {review.verified && (
                  <Span variant="success" className="ml-2 text-xs">
                    ✓ {REVIEWS.VERIFIED_PURCHASE}
                  </Span>
                )}
              </Text>
            </div>
          </Grid>

          <div>
            <Row gap="sm" className="mt-1">
              <RatingDisplay rating={review.rating} size="md" />
              <Span variant="secondary">({review.rating}/5)</Span>
            </Row>
          </div>

          <div>
            <Label className="text-sm font-medium">{REVIEWS.COMMENT}</Label>
            <Text className="mt-1 whitespace-pre-wrap">{review.comment}</Text>
          </div>

          <Grid className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3" gap="md">
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
                {review.helpfulCount} helpful, {review.reportCount} reported
              </Text>
            </div>
            <div>
              <Label className="text-sm font-medium">{REVIEWS.CREATED}</Label>
              <Text className="mt-0.5">{formatDate(review.createdAt)}</Text>
            </div>
          </Grid>

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
        </Stack>
      </Card>
    </Stack>
  );
}
