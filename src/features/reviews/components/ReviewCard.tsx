/**
 * ReviewCard
 *
 * Displays a review with reviewer avatar, name (profile link), verified badge,
 * rating star badge, comment, item link, and optional images.
 */

"use client";

import { useState } from "react";
import { Star, BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import {
  Button,
  Card,
  Caption,
  MediaImage,
  MediaLightbox,
  Span,
  Text,
  TextLink,
} from "@/components";
import { generateInitials } from "@/helpers";
import type { ReviewDocument } from "@/db/schema";

const { themed, flex } = THEME_CONSTANTS;

interface ReviewCardProps {
  review: ReviewDocument;
  className?: string;
}

export function ReviewCard({ review, className = "" }: ReviewCardProps) {
  const t = useTranslations("reviews");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const lightboxItems = (review.images ?? []).map((src, i) => ({
    src,
    alt: t("reviewImageAlt", { index: i + 1 }),
  }));

  const productHref = ROUTES.PUBLIC.PRODUCT_DETAIL(review.productId);
  const userHref = ROUTES.PUBLIC.PROFILE(review.userId);

  return (
    <>
      <Card
        className={`h-full overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200 ${className}`}
      >
        <div className="flex flex-col flex-1 p-4 gap-3">
          {/* ── Top row: avatar + info + rating star ── */}
          <div className={`${flex.between} gap-2`}>
            <div className={`${flex.rowCenter} gap-3 min-w-0`}>
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/30 flex-shrink-0">
                {review.userAvatar ? (
                  <MediaImage
                    src={review.userAvatar}
                    alt={review.userName || t("anonymous")}
                    size="avatar"
                  />
                ) : (
                  <div className={`${flex.center} w-full h-full`}>
                    <Span className="text-sm font-bold text-indigo-500">
                      {generateInitials(review.userName || "A")}
                    </Span>
                  </div>
                )}
              </div>

              {/* Name + verified */}
              <div className="flex flex-col min-w-0">
                <TextLink
                  href={userHref}
                  className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 truncate transition-colors leading-snug"
                >
                  {review.userName || t("anonymous")}
                </TextLink>
                {review.verified && (
                  <div className={`${flex.rowCenter} gap-1 mt-0.5`}>
                    <BadgeCheck
                      className="w-3 h-3 text-emerald-500"
                      aria-hidden="true"
                    />
                    <Caption className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                      {t("verified")}
                    </Caption>
                  </div>
                )}
              </div>
            </div>

            {/* Rating star — top right */}
            <div
              className={`${flex.rowCenter} gap-1 px-2 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex-shrink-0`}
            >
              <Star
                className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400"
                aria-hidden="true"
              />
              <Span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                {review.rating}
              </Span>
            </div>
          </div>

          {/* ── Review comment ── */}
          <Text size="sm" variant="secondary" className="line-clamp-4 flex-1">
            {review.comment || review.title}
          </Text>

          {/* ── Item link ── */}
          <TextLink
            href={productHref}
            className={`text-xs ${themed.textSecondary} hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1`}
          >
            <Span
              className={`inline-block px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[11px] font-medium truncate max-w-[160px] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors`}
            >
              {review.productTitle || t("viewItem")}
            </Span>
          </TextLink>

          {/* ── Images ── */}
          {review.images && review.images.length > 0 && (
            <div className={`${flex.rowCenter} gap-2`}>
              {review.images.slice(0, 2).map((img, i) => (
                <Button
                  key={i}
                  onClick={() => {
                    setLightboxIndex(i);
                    setLightboxOpen(true);
                  }}
                  aria-label={t("reviewImageAlt", { index: i + 1 })}
                  className="relative w-14 h-14 p-0 min-h-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 cursor-zoom-in border-0 shadow-none"
                >
                  <MediaImage
                    src={img}
                    alt={t("reviewImageAlt", { index: i + 1 })}
                    size="thumbnail"
                  />
                </Button>
              ))}
              {review.images.length > 2 && (
                <Button
                  onClick={() => {
                    setLightboxIndex(2);
                    setLightboxOpen(true);
                  }}
                  aria-label={t("moreImages", {
                    count: review.images.length - 2,
                  })}
                  className={`${flex.center} w-14 h-14 p-0 min-h-0 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs ${themed.textSecondary} flex-shrink-0 border-0 shadow-none hover:bg-gray-200 dark:hover:bg-gray-700`}
                >
                  <Caption>
                    {t("moreImages", { count: review.images.length - 2 })}
                  </Caption>
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
      <MediaLightbox
        items={lightboxItems}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
