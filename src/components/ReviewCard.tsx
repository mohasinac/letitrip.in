/**
 * ReviewCard — thin wrapper around @mohasinac/feat-reviews
 *
 * Pre-configures letitrip-specific routing (ROUTES) and the next-intl Link.
 */
"use client";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/constants";
import { MediaLightbox } from "@/components";
import {
  ReviewCard as PkgReviewCard,
  ReviewCardData,
} from "@mohasinac/feat-reviews";

export type { ReviewCardData };

export interface ReviewCardProps {
  review: ReviewCardData;
  className?: string;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  return (
    <PkgReviewCard
      review={review}
      className={className}
      productHref={ROUTES.PUBLIC.PRODUCT_DETAIL(review.productId)}
      userHref={ROUTES.PUBLIC.PROFILE(review.userId)}
      LinkComponent={Link}
      renderLightbox={({ items, initialIndex, isOpen, onClose }) => (
        <MediaLightbox
          items={items}
          initialIndex={initialIndex}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    />
  );
}
