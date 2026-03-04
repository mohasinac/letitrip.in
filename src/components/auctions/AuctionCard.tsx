"use client";

import { Caption, MediaImage, Span, Text, TextLink } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useCountdown } from "@/hooks";
import type { CountdownRemaining } from "@/hooks";
import { formatCurrency } from "@/utils";
import type { ProductDocument } from "@/db/schema";

const { themed, borderRadius, flex, position } = THEME_CONSTANTS;

interface AuctionCardProps {
  product: Pick<
    ProductDocument,
    | "id"
    | "title"
    | "price"
    | "currency"
    | "mainImage"
    | "video"
    | "isAuction"
    | "auctionEndDate"
    | "startingBid"
    | "currentBid"
    | "bidCount"
    | "featured"
  >;
  className?: string;
}

function formatCountdown(
  remaining: CountdownRemaining | null,
  endedLabel: string,
): string {
  if (!remaining) return endedLabel;
  const { days, hours, minutes, seconds } = remaining;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function AuctionCard({ product, className = "" }: AuctionCardProps) {
  const t = useTranslations("auctions");
  const remaining = useCountdown(product.auctionEndDate);
  const isEnded = remaining === null;
  const isEndingSoon =
    remaining !== null && remaining.days === 0 && remaining.hours < 1;

  const displayBid =
    (product.currentBid ?? 0) > 0
      ? product.currentBid!
      : (product.startingBid ?? product.price);
  const bidCount = product.bidCount ?? 0;
  const hasCurrentBid = (product.currentBid ?? 0) > 0;

  return (
    <TextLink
      href={ROUTES.PUBLIC.AUCTION_DETAIL(product.id)}
      className={`group flex flex-col ${themed.bgPrimary} ${borderRadius.lg} overflow-hidden hover:shadow-xl transition-all duration-300 ${isEnded ? "opacity-60" : ""} ${className}`}
    >
      {/* Media — video thumbnail or main image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <MediaImage
          src={product.video?.thumbnailUrl || product.mainImage}
          alt={product.title}
          size="card"
          fallback="🔨"
        />

        {/* Video play indicator */}
        {product.video?.url && (
          <div className={`${position.fill} ${flex.center} pointer-events-none`}>
            <Span className="bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center text-base leading-none">
              ▶
            </Span>
          </div>
        )}

        {/* LIVE / Ending Soon badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {!isEnded && (
            <Span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              {t("liveBadge")}
            </Span>
          )}
          {isEndingSoon && (
            <Span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {t("endingSoon")}
            </Span>
          )}
          {isEnded && (
            <Span className="bg-gray-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {t("ended")}
            </Span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        {/* Title */}
        <Text
          size="sm"
          weight="medium"
          className={`${themed.textPrimary} line-clamp-2 leading-snug`}
        >
          {product.title}
        </Text>

        {/* Current bid */}
        <div>
          <Caption>
            {hasCurrentBid ? t("currentBid") : t("startingBid")}
          </Caption>
          <Text className="text-base font-bold text-indigo-600 dark:text-indigo-400">
            {formatCurrency(displayBid)}
          </Text>
        </div>

        {/* Bid count + Countdown */}
        <div className={`${flex.between} text-xs mt-auto`}>
          <Span className={themed.textSecondary}>
            {t("totalBids", { count: bidCount })}
          </Span>
          <Span
            className={`font-mono font-semibold ${
              isEnded
                ? themed.textSecondary
                : isEndingSoon
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {!isEnded && (
              <Span className={`${themed.textSecondary} mr-1`}>
                {t("endsIn")}:
              </Span>
            )}
            {formatCountdown(remaining, t("ended"))}
          </Span>
        </div>
      </div>
    </TextLink>
  );
}
