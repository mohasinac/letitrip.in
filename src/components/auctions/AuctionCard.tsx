"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Star, Heart, Gavel, ShoppingBag, Clock } from "lucide-react";
import { Caption, Span, Text } from "@mohasinac/appkit/ui";
import { useCountdown } from "@mohasinac/appkit/react";
import type { CountdownRemaining } from "@mohasinac/appkit/react";
import { BaseListingCard, MediaImage, TextLink, Button } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useWishlistToggle } from "@/hooks";
import { formatCurrency } from "@/utils";

const { themed, flex, position } = THEME_CONSTANTS;

/** Minimal structural type — satisfied by both AuctionItem (from packages) and ProductDocument (from repositories) */
export interface AuctionCardData {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  mainImage?: string;
  images?: string[];
  video?: { url?: string; thumbnailUrl?: string };
  isAuction?: boolean;
  auctionEndDate?: string | Date;
  startingBid?: number;
  currentBid?: number;
  bidCount?: number;
  featured?: boolean;
  status?: string;
  slug?: string;
}

export interface AuctionCardProps {
  product: AuctionCardData;
  /** Optional buyout price — if provided shows a Buyout button */
  buyoutPrice?: number;
  className?: string;
  /** "grid"/"card"/"fluid" (default): vertical card. "list": horizontal card. */
  variant?: "grid" | "card" | "fluid" | "list";
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

  // Map card/fluid → grid for BaseListingCard which only knows grid/list
  const baseVariant: "grid" | "list" = variant === "list" ? "list" : "grid";

  const [hovered, setHovered] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const remaining = useCountdown(product.auctionEndDate);
  const {
    inWishlist,
    isLoading: wishlistLoading,
    toggle: toggleWishlist,
  } = useWishlistToggle(product.id, initialInWishlist);

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

  const allImages = [product.mainImage, ...(product.images ?? [])].filter(
    Boolean,
  );
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
    <BaseListingCard
      isSelected={isSelected}
      isDisabled={isEnded}
      variant={baseVariant}
      className={className}
    >
      {/* ── IMAGE SECTION ── */}
      <BaseListingCard.Hero
        aspect="square"
        variant={baseVariant}
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
          <div
            className={`${position.fill} ${flex.center} pointer-events-none`}
          >
            <Span
              className={`bg-black/50 text-white rounded-full w-8 h-8 ${flex.center} text-xs leading-none`}
            >
              ▶
            </Span>
          </div>
        )}

        {/* Slideshow dot indicators */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
            {allImages.map((_, i) => (
              <Span
                key={i}
                variant="inherit"
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
          <BaseListingCard.Checkbox
            selected={isSelected}
            onSelect={handleSelect}
            label={isSelected ? t("deselectItem") : t("selectItem")}
          />
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
            <Span className="bg-zinc-600/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {t("ended")}
            </Span>
          )}
          {product.status === "sold" && (
            <Span className="bg-zinc-700/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {t("sold")}
            </Span>
          )}
        </div>

        {/* Type badge — bottom right */}
        <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
          <Span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-600/90 text-white">
            <Gavel className="w-3 h-3 flex-shrink-0" />
            {t("typeBadge")}
          </Span>
        </div>
      </BaseListingCard.Hero>

      {/* ── INFO SECTION ── */}
      <BaseListingCard.Info variant={baseVariant}>
        {/* Title + wishlist heart */}
        <div className={`${flex.rowCenter} gap-2 items-start`}>
          <TextLink
            href={auctionHref}
            className={`flex-1 min-w-0 text-sm font-medium ${themed.textPrimary} line-clamp-2 leading-snug hover:text-primary transition-colors`}
          >
            {product.title}
          </TextLink>
          <Button
            variant="ghost"
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
              className={`w-4 h-4 transition-colors ${inWishlist ? "fill-rose-500 text-rose-500" : "text-zinc-400 dark:text-zinc-500"}`}
              aria-hidden="true"
            />
          </Button>
        </div>

        {/* Description — list variant only */}
        {variant === "list" && (
          <Text size="xs" variant="secondary" className="line-clamp-2">
            {product.description}
          </Text>
        )}

        {/* Bid info */}
        <div>
          <Caption>
            {hasCurrentBid ? t("currentBid") : t("startingBid")}
          </Caption>
          <Text className="text-base font-bold text-primary leading-none">
            {formatCurrency(displayBid)}
          </Text>
        </div>

        {/* Countdown + bid count row */}
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          {/* Countdown badge */}
          <div
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-mono font-semibold ${
              isEnded
                ? "bg-zinc-100 dark:bg-slate-800 text-zinc-500 dark:text-zinc-400"
                : isEndingSoon
                  ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                  : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
            }`}
          >
            <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            <Span variant="inherit">
              {formatCountdownLabel(remaining, t("ended"))}
            </Span>
          </div>
          <Caption className={`font-mono ${countdownColor}`}>
            {t("totalBids", { count: bidCount })}
          </Caption>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {isEnded ? (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 min-w-0 text-xs px-2 sm:text-xs sm:px-2 gap-1 cursor-not-allowed opacity-60"
              disabled
            >
              <Span variant="inherit" className="min-w-0 truncate">
                {t("ended")}
              </Span>
            </Button>
          ) : (
            <>
              <Button
                variant="warning"
                size="sm"
                className="flex-1 min-w-0 text-xs px-2 sm:text-xs sm:px-2 gap-1"
                onClick={handleBid}
              >
                <Gavel className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                <Span
                  variant="inherit"
                  className="hidden sm:inline xl:hidden min-w-0 truncate"
                >
                  {t("placeBid")}
                </Span>
              </Button>
              {buyoutPrice && (
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1 min-w-0 text-xs px-2 sm:text-xs sm:px-2 gap-1"
                  onClick={handleBuyout}
                >
                  <ShoppingBag
                    className="w-3 h-3 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <Span
                    variant="inherit"
                    className="hidden sm:inline xl:hidden min-w-0 truncate"
                  >
                    {t("buyout")}
                  </Span>
                </Button>
              )}
            </>
          )}
        </div>
      </BaseListingCard.Info>
    </BaseListingCard>
  );
}
