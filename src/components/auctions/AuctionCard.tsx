"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Star, Heart, Gavel, ShoppingBag, Clock } from "lucide-react";
import { Caption, MediaImage, Span, Text, TextLink, Button } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCountdown, useWishlistToggle } from "@/hooks";
import type { CountdownRemaining } from "@/hooks";
import { formatCurrency } from "@/utils";
import type { ProductDocument } from "@/db/schema";

const { themed, borderRadius, flex, position } = THEME_CONSTANTS;

export interface AuctionCardProps {
  product: Pick<
    ProductDocument,
    | "id"
    | "title"
    | "description"
    | "price"
    | "currency"
    | "mainImage"
    | "images"
    | "video"
    | "isAuction"
    | "auctionEndDate"
    | "startingBid"
    | "currentBid"
    | "bidCount"
    | "featured"
  >;
  /** Optional buyout price — if provided shows a Buyout button */
  buyoutPrice?: number;
  className?: string;
  /** "grid" (default): vertical card. "list": horizontal card. */
  variant?: "grid" | "list";
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  inWishlist?: boolean;
}

function formatCountdownLabel(
  remaining: CountdownRemaining | null,
  endedLabel: string,
): string {
  if (!remaining) return endedLabel;
  const { days, hours, minutes, seconds } = remaining;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function AuctionCard({
  product,
  buyoutPrice,
  className = "",
  variant = "grid",
  selectable = false,
  isSelected = false,
  onSelect,
  inWishlist: initialInWishlist = false,
}: AuctionCardProps) {
  const t = useTranslations("auctions");
  const tWishlist = useTranslations("wishlist");
  const router = useRouter();

  const [hovered, setHovered] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const remaining = useCountdown(product.auctionEndDate);
  const { inWishlist, isLoading: wishlistLoading, toggle: toggleWishlist } =
    useWishlistToggle(product.id, initialInWishlist);

  const isEnded = remaining === null;
  const isEndingSoon =
    remaining !== null && remaining.days === 0 && remaining.hours < 1;

  const displayBid =
    (product.currentBid ?? 0) > 0
      ? product.currentBid!
      : (product.startingBid ?? product.price);
  const bidCount = product.bidCount ?? 0;
  const hasCurrentBid = (product.currentBid ?? 0) > 0;
  const hasVideo = Boolean(product.video?.url);

  const allImages = [product.mainImage, ...(product.images ?? [])].filter(Boolean);
  const currentSrc = allImages[imgIdx] ?? product.mainImage;
  const auctionHref = ROUTES.PUBLIC.AUCTION_DETAIL(product.id);

  /* Hover slideshow */
  useEffect(() => {
    if (hovered && allImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setImgIdx((i) => (i + 1) % allImages.length);
      }, 800);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setImgIdx(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hovered, allImages.length]);

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect?.(product.id, !isSelected);
    },
    [product.id, isSelected, onSelect],
  );

  const handleWishlist = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await toggleWishlist();
      } catch {
        // optimistic UI handles state
      }
    },
    [toggleWishlist],
  );

  const handleBid = useCallback(() => {
    router.push(auctionHref);
  }, [router, auctionHref]);

  const handleBuyout = useCallback(() => {
    router.push(auctionHref);
  }, [router, auctionHref]);

  /* Countdown color */
  const countdownColor = isEnded
    ? themed.textSecondary
    : isEndingSoon
      ? "text-amber-600 dark:text-amber-400"
      : "text-emerald-600 dark:text-emerald-400";

  return (
    <div
      className={`${themed.bgPrimary} ${borderRadius.lg} overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 flex ${variant === "list" ? "flex-row" : "flex-col"} ${isEnded ? "opacity-60" : ""} ${isSelected ? "ring-2 ring-indigo-500 dark:ring-indigo-400" : ""} ${className}`}
    >
      {/* ── IMAGE SECTION ── */}
      <div
        className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 ${variant === "list" ? "w-32 sm:w-44 aspect-square" : "aspect-square w-full"}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <TextLink href={auctionHref} className={`${position.fill} block`}>
          <MediaImage
            src={currentSrc}
            alt={product.title}
            size="card"
            fallback="🔨"
            className={`transition-transform duration-500 ${hovered && allImages.length > 1 ? "scale-105" : "scale-100"}`}
          />
        </TextLink>

        {/* Video play indicator — only on first image */}
        {hasVideo && imgIdx === 0 && (
          <div className={`${position.fill} ${flex.center} pointer-events-none`}>
            <Span className="bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs leading-none">
              ▶
            </Span>
          </div>
        )}

        {/* Slideshow dot indicators */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
            {allImages.map((_, i) => (
              <span
                key={i}
                className={`rounded-full transition-all duration-200 ${i === imgIdx ? "w-3 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/60"}`}
              />
            ))}
          </div>
        )}

        {/* Featured star — top-left */}
        {product.featured && (
          <div className="absolute top-2 left-2 pointer-events-none z-10">
            <Star
              className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Checkbox — top-right */}
        {selectable && (
          <button
            onClick={handleSelect}
            aria-label={isSelected ? t("deselectItem") : t("selectItem")}
            className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/90 dark:bg-gray-800/90 flex items-center justify-center shadow border border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors z-10"
          >
            {isSelected ? (
              <span className="w-4 h-4 rounded bg-indigo-600 flex items-center justify-center">
                <svg
                  viewBox="0 0 10 8"
                  className="w-2.5 h-2 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            ) : (
              <span className="w-4 h-4 rounded border-2 border-gray-400 dark:border-gray-500 block" />
            )}
          </button>
        )}

        {/* Live / ending-soon / ended badges */}
        <div
          className={`absolute left-2 flex flex-col gap-1 z-10 ${product.featured ? "top-8" : "top-2"}`}
        >
          {!isEnded && (
            <Span className="bg-rose-600/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              {t("liveBadge")}
            </Span>
          )}
          {isEndingSoon && (
            <Span className="bg-amber-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {t("endingSoon")}
            </Span>
          )}
          {isEnded && (
            <Span className="bg-gray-600/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {t("ended")}
            </Span>
          )}
        </div>
      </div>

      {/* ── INFO SECTION ── */}
      <div
        className={`flex flex-col gap-2 ${variant === "list" ? "flex-1 min-w-0 p-3 justify-between" : "p-3"}`}
      >
        {/* Title + wishlist heart */}
        <div className={`${flex.rowCenter} gap-2 items-start`}>
          <TextLink
            href={auctionHref}
            className={`flex-1 min-w-0 text-sm font-medium ${themed.textPrimary} line-clamp-2 leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors`}
          >
            {product.title}
          </TextLink>
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            aria-label={
              inWishlist
                ? tWishlist("removeFromWishlist")
                : tWishlist("addToWishlist")
            }
            className="flex-shrink-0 -mt-0.5 p-1 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-50"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${inWishlist ? "fill-rose-500 text-rose-500" : "text-gray-400 dark:text-gray-500"}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Description — list variant only */}
        {variant === "list" && (
          <Text size="xs" variant="secondary" className="line-clamp-2">
            {product.description}
          </Text>
        )}

        {/* Bid info */}
        <div>
          <Caption>{hasCurrentBid ? t("currentBid") : t("startingBid")}</Caption>
          <Text className="text-base font-bold text-indigo-600 dark:text-indigo-400 leading-none">
            {formatCurrency(displayBid)}
          </Text>
        </div>

        {/* Countdown + bid count row */}
        <div className={`${flex.between} gap-2`}>
          {/* Countdown badge */}
          <div
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-mono font-semibold ${
              isEnded
                ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                : isEndingSoon
                  ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                  : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
            }`}
          >
            <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            <span>{formatCountdownLabel(remaining, t("ended"))}</span>
          </div>
          <Caption className={`font-mono ${countdownColor}`}>
            {t("totalBids", { count: bidCount })}
          </Caption>
        </div>

        {/* Action buttons */}
        <div className={`flex gap-1.5 ${variant === "list" ? "mt-auto" : ""}`}>
          {isEnded ? (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs px-2 gap-1 cursor-not-allowed opacity-60"
              disabled
            >
              <span className="truncate">{t("ended")}</span>
            </Button>
          ) : (
            <>
              <Button
                variant="warning"
                size="sm"
                className="flex-1 text-xs px-2 gap-1"
                onClick={handleBid}
              >
                <Gavel className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                <span className="truncate">{t("placeBid")}</span>
              </Button>
              {buyoutPrice && (
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1 text-xs px-2 gap-1"
                  onClick={handleBuyout}
                >
                  <ShoppingBag className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{t("buyout")}</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
