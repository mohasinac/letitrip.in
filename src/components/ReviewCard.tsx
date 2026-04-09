/**
 * ReviewCard — thin wrapper around @mohasinac/feat-reviews
 *
 * Pre-configures letitrip-specific routing (ROUTES) and the next-intl Link.
 */
"use client";

import { ReviewCard as PkgReviewCard } from "@mohasinac/appkit/features/reviews";
import type { Review } from "@mohasinac/appkit/features/reviews";

export type ReviewCardData = Review;

export interface ReviewCardProps {
  review: ReviewCardData;
  className?: string;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  return <PkgReviewCard review={review} className={className} />;
}
