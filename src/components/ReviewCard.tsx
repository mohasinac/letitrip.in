/**
 * ReviewCard
 *
 * Displays a review with reviewer avatar, name (profile link), verified badge,
 * rating star badge, comment, item link, and optional images.
 */

"use client";

import { useState } from "react";
import { Star, BadgeCheck, Quote } from "lucide-react";
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
        className={`h-full overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${className}`}
      >
        <div className="flex flex-col flex-1 p-4 gap-3">
          {/* Quote icon */}
          <Quote className="h-8 w-8 text-primary-500/10" aria-hidden="true" />

          {/* Star rating row */}
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= review.rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-200 dark:text-slate-700"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* ── Review comment ── */}
          <Text size="sm" variant="secondary" className="line-clamp-4 flex-1">
            {review.comment || review.title}
          </Text>

          {/* ── Item link ── */}
          <TextLink
            href={productHref}
            className={`text-xs ${themed.textSecondary} hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-1`}
          >
            <Span
              className={`inline-block px-2 py-0.5 rounded bg-zinc-100 dark:bg-slate-700 text-[11px] font-medium truncate max-w-[50%] hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors`}
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
                  className="relative w-14 h-14 p-0 min-h-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-slate-800 flex-shrink-0 cursor-zoom-in border-0 shadow-none"
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
                  className={`${flex.center} w-14 h-14 p-0 min-h-0 rounded-lg bg-zinc-100 dark:bg-slate-800 text-xs ${themed.textSecondary} flex-shrink-0 border-0 shadow-none hover:bg-zinc-200 dark:hover:bg-slate-700`}
                >
                  <Caption>
                    {t("moreImages", { count: review.images.length - 2 })}
                  </Caption>
                </Button>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="bg-primary-500/30 my-1 h-px w-full" />

          {/* ── Reviewer row ── */}
          <div className={`${flex.rowCenter} gap-3`}>
            {/* Avatar */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 flex-shrink-0">
              {review.userAvatar ? (
                <MediaImage
                  src={review.userAvatar}
                  alt={review.userName || t("anonymous")}
                  size="avatar"
                />
              ) : (
                <div className={`${flex.center} w-full h-full`}>
                  <Span className="text-sm font-bold text-primary-500">
                    {generateInitials(review.userName || "A")}
                  </Span>
                </div>
              )}
            </div>

            {/* Name + verified */}
            <div className="flex flex-col min-w-0">
              <TextLink
                href={userHref}
                className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 truncate transition-colors leading-snug"
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
