/**
 * ReviewCard
 *
 * Same visual dimensions as ProductCard: aspect-[4/5] hero area + info strip.
 * Displays reviewer avatar, name (profile link), verified badge, rating stars,
 * comment, item link, and optional images.
 */

"use client";

import { useState } from "react";
import { Star, BadgeCheck, Quote } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import {
  BaseListingCard,
  Button,
  Caption,
  MediaImage,
  MediaLightbox,
  Span,
  Text,
  TextLink,
} from "@/components";
import { generateInitials } from "@/helpers";

const { themed, flex } = THEME_CONSTANTS;

export interface ReviewCardData {
  id: string;
  productId: string;
  productTitle?: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  verified?: boolean;
}

interface ReviewCardProps {
  review: ReviewCardData;
  className?: string;
}

export function ReviewCard({ review, className = "" }: ReviewCardProps) {
  const t = useTranslations("reviews");
  const router = useRouter();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Strip PII-encrypted values — stored as "pii:v1:..." in Firestore when the
  // email was accidentally saved into the userName field.
  const safeUserName =
    review.userName && !review.userName.startsWith("pii:")
      ? review.userName
      : undefined;
  const lightboxItems = (review.images ?? []).map((src, i) => ({
    src,
    alt: t("reviewImageAlt", { index: i + 1 }),
  }));

  const productHref = ROUTES.PUBLIC.PRODUCT_DETAIL(review.productId);
  const userHref = ROUTES.PUBLIC.PROFILE(review.userId);

  return (
    <>
      <BaseListingCard className={className}>
        {/* ── HERO SECTION (matches ProductCard image aspect ratio) ── */}
        <BaseListingCard.Hero
          aspect="4/5"
          className="bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-primary-950 dark:via-slate-900 dark:to-primary-900/40 flex flex-col items-center justify-center gap-4 p-6"
        >
          {/* Decorative quote marks */}
          <Quote
            className="absolute top-4 left-4 h-14 w-14 text-primary-500/10"
            aria-hidden="true"
          />
          <Quote
            className="absolute bottom-14 right-3 h-10 w-10 text-primary-500/5 rotate-180"
            aria-hidden="true"
          />

          {/* Star rating */}
          <div className="flex gap-1.5 z-10">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= review.rating
                    ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                    : "text-zinc-200 dark:text-slate-700"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Review title */}
          {review.title && (
            <Text className="text-center font-semibold text-primary-700 dark:text-primary-300 line-clamp-2 leading-snug z-10">
              {review.title}
            </Text>
          )}

          {/* Comment body */}
          <Text
            size="sm"
            variant="secondary"
            className="text-center line-clamp-5 leading-relaxed z-10"
          >
            {review.comment ?? review.title ?? ""}
          </Text>

          {/* Verified badge — top right */}
          {review.verified && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-full px-2 py-0.5 z-10">
              <BadgeCheck
                className="w-3 h-3 text-emerald-500"
                aria-hidden="true"
              />
              <Caption className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                {t("verified")}
              </Caption>
            </div>
          )}

          {/* Review images — pinned to bottom */}
          {review.images && review.images.length > 0 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {review.images.slice(0, 3).map((img, i) => (
                <Button
                  key={i}
                  onClick={() => {
                    setLightboxIndex(i);
                    setLightboxOpen(true);
                  }}
                  aria-label={t("reviewImageAlt", { index: i + 1 })}
                  className="relative w-10 h-10 p-0 min-h-0 rounded-lg overflow-hidden bg-zinc-200 dark:bg-slate-700 flex-shrink-0 border-0 shadow-sm cursor-zoom-in"
                >
                  <MediaImage
                    src={img}
                    alt={t("reviewImageAlt", { index: i + 1 })}
                    size="thumbnail"
                  />
                </Button>
              ))}
              {review.images.length > 3 && (
                <Button
                  onClick={() => {
                    setLightboxIndex(3);
                    setLightboxOpen(true);
                  }}
                  aria-label={t("moreImages", {
                    count: review.images.length - 3,
                  })}
                  className={`${flex.center} w-10 h-10 p-0 min-h-0 rounded-lg bg-zinc-200 dark:bg-slate-700 border-0 shadow-sm hover:bg-zinc-300 dark:hover:bg-slate-600`}
                >
                  <Caption>+{review.images.length - 3}</Caption>
                </Button>
              )}
            </div>
          )}
        </BaseListingCard.Hero>

        {/* ── INFO SECTION ── */}
        <BaseListingCard.Info>
          {/* Reviewer row */}
          <div className={`${flex.rowCenter} gap-2`}>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 flex-shrink-0">
              {review.userAvatar ? (
                <MediaImage
                  src={review.userAvatar}
                  alt={safeUserName || t("anonymous")}
                  size="avatar"
                />
              ) : (
                <div className={`${flex.center} w-full h-full`}>
                  <Span className="text-xs font-bold text-primary-500">
                    {generateInitials(safeUserName || "A")}
                  </Span>
                </div>
              )}
            </div>
            <TextLink
              href={userHref}
              className="flex-1 min-w-0 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 truncate transition-colors leading-snug"
            >
              {safeUserName || t("anonymous")}
            </TextLink>
          </div>

          {/* Product link */}
          <TextLink
            href={productHref}
            className={`text-xs ${themed.textSecondary} hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex`}
          >
            <Span className="inline-block px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-slate-700 text-[11px] font-medium truncate max-w-full hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
              {review.productTitle || t("viewItem")}
            </Span>
          </TextLink>

          {/* CTA button */}
          <div className="mt-auto">
            <Button
              variant="primary"
              size="sm"
              className="w-full text-xs gap-1 bg-primary-700 hover:bg-primary-800 text-white rounded-xl transition-all hover:shadow-glow active:scale-95"
              onClick={() => router.push(productHref)}
            >
              {t("viewItem")}
            </Button>
          </div>
        </BaseListingCard.Info>
      </BaseListingCard>
      <MediaLightbox
        items={lightboxItems}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
