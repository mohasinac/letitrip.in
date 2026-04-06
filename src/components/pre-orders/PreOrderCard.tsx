"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Star, Heart, CalendarCheck, ShoppingCart, Clock } from "lucide-react";
import {
  BaseListingCard,
  Caption,
  MediaImage,
  Span,
  Text,
  TextLink,
  Button,
} from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useWishlistToggle } from "@/hooks";
import { formatCurrency, formatDate } from "@/utils";

const { themed, flex, position } = THEME_CONSTANTS;

export interface PreOrderCardData {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  mainImage?: string;
  images?: string[];
  video?: { url?: string; thumbnailUrl?: string };
  isPreOrder?: boolean;
  preOrderDeliveryDate?: string | Date | null;
  preOrderDepositPercent?: number | null;
  preOrderDepositAmount?: number | null;
  preOrderMaxQuantity?: number | null;
  preOrderCurrentCount?: number | null;
  preOrderProductionStatus?: string | null;
  preOrderCancellable?: boolean | null;
  featured?: boolean;
  stockQuantity?: number;
  availableQuantity?: number;
}

export interface PreOrderCardProps {
  product: PreOrderCardData;
  className?: string;
  /** "grid" (default): vertical card. "list": horizontal card. */
  variant?: "grid" | "list";
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  inWishlist?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-primary/90",
  in_production: "bg-amber-500/90",
  ready_to_ship: "bg-emerald-600/90",
};

export function PreOrderCard({
  product,
  className = "",
  variant = "grid",
  selectable = false,
  isSelected = false,
  onSelect,
  inWishlist: initialInWishlist = false,
}: PreOrderCardProps) {
  const t = useTranslations("preOrders");
  const tWishlist = useTranslations("wishlist");
  const router = useRouter();

  const [hovered, setHovered] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    inWishlist,
    isLoading: wishlistLoading,
    toggle: toggleWishlist,
  } = useWishlistToggle(product.id, initialInWishlist);

  const productionStatus = product.preOrderProductionStatus ?? "upcoming";
  const depositAmount =
    product.preOrderDepositAmount ??
    (product.preOrderDepositPercent
      ? Math.round((product.price * product.preOrderDepositPercent) / 100)
      : null);
  const spotsLeft =
    product.preOrderMaxQuantity != null && product.preOrderCurrentCount != null
      ? product.preOrderMaxQuantity - product.preOrderCurrentCount
      : null;
  const isSoldOut = spotsLeft !== null && spotsLeft <= 0;
  const isLimitedSpots = spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 10;
  const hasVideo = Boolean(product.video?.url);

  const allImages = [product.mainImage, ...(product.images ?? [])].filter(
    Boolean,
  );
  const currentSrc = allImages[imgIdx] ?? product.mainImage;
  const preOrderHref = ROUTES.PUBLIC.PRE_ORDER_DETAIL(product.id);

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

  const handleReserve = useCallback(() => {
    router.push(preOrderHref);
  }, [router, preOrderHref]);

  return (
    <BaseListingCard
      isSelected={isSelected}
      isDisabled={isSoldOut}
      variant={variant}
      className={className}
    >
      {/* ── IMAGE SECTION ── */}
      <BaseListingCard.Hero
        aspect="square"
        variant={variant}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <TextLink href={preOrderHref} className={`${position.fill} block`}>
          <MediaImage
            src={currentSrc}
            alt={product.title}
            size="card"
            fallback="📦"
            className={`transition-transform duration-500 ${hovered && allImages.length > 1 ? "scale-105" : "scale-100"}`}
          />
        </TextLink>

        {/* Video play indicator */}
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

        {/* Featured star */}
        {product.featured && (
          <div className="absolute top-2 left-2 pointer-events-none z-10">
            <Star
              className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Checkbox */}
        {selectable && (
          <BaseListingCard.Checkbox
            selected={isSelected}
            onSelect={handleSelect}
            label={isSelected ? t("deselectItem") : t("selectItem")}
          />
        )}

        {/* Status badges */}
        <div
          className={`absolute left-2 flex flex-col gap-1 z-10 ${product.featured ? "top-8" : "top-2"}`}
        >
          <Span
            className={`${STATUS_COLORS[productionStatus] ?? STATUS_COLORS.upcoming} backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full`}
          >
            {t(`status_${productionStatus}`)}
          </Span>
          {isSoldOut && (
            <Span className="bg-zinc-600/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {t("soldOut")}
            </Span>
          )}
          {isLimitedSpots && !isSoldOut && (
            <Span className="bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              {t("spotsLeft", { count: spotsLeft! })}
            </Span>
          )}
        </div>

        {/* Type badge — bottom right */}
        <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
          <Span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-600/90 text-white">
            <CalendarCheck className="w-3 h-3 flex-shrink-0" />
            {t("preOrderBadge")}
          </Span>
        </div>
      </BaseListingCard.Hero>

      {/* ── INFO SECTION ── */}
      <BaseListingCard.Info
        variant={variant}
        className={variant === "list" ? "justify-between" : ""}
      >
        {/* Title + wishlist heart */}
        <div className={`${flex.rowCenter} gap-2 items-start`}>
          <TextLink
            href={preOrderHref}
            className={`flex-1 min-w-0 text-sm font-medium ${themed.textPrimary} line-clamp-2 leading-snug hover:text-purple-600 dark:hover:text-purple-400 transition-colors`}
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

        {/* Price info */}
        <div>
          <Caption>{t("totalPrice")}</Caption>
          <Text className="text-base font-bold text-purple-600 dark:text-purple-400 leading-none">
            {formatCurrency(product.price)}
          </Text>
          {depositAmount != null && (
            <Caption className="text-emerald-600 dark:text-emerald-400 mt-0.5">
              {t("depositLabel", { amount: formatCurrency(depositAmount) })}
            </Caption>
          )}
        </div>

        {/* Delivery date */}
        {product.preOrderDeliveryDate && (
          <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 max-w-full overflow-hidden">
            <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            <Span variant="inherit" className="truncate">
              {t("deliveryBy", {
                date: formatDate(product.preOrderDeliveryDate),
              })}
            </Span>
          </div>
        )}

        {/* Spots remaining row */}
        {spotsLeft !== null && !isSoldOut && (
          <Caption className="text-zinc-500 dark:text-zinc-400">
            {t("spotsAvailable", { count: spotsLeft })}
          </Caption>
        )}

        {/* CTA */}
        <div
          className={`flex flex-wrap gap-1.5 ${variant === "list" ? "mt-auto" : ""}`}
        >
          {isSoldOut ? (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 min-w-0 text-xs px-2 sm:text-xs sm:px-2 gap-1 cursor-not-allowed opacity-60"
              disabled
            >
              <Span variant="inherit" className="min-w-0 truncate">
                {t("soldOut")}
              </Span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              className="flex-1 min-w-0 text-xs px-2 sm:text-xs sm:px-2 gap-1 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600"
              onClick={handleReserve}
            >
              <CalendarCheck
                className="w-3 h-3 flex-shrink-0"
                aria-hidden="true"
              />
              <Span
                variant="inherit"
                className="hidden sm:inline xl:hidden min-w-0 truncate"
              >
                {t("reserveNow")}
              </Span>
            </Button>
          )}
        </div>
      </BaseListingCard.Info>
    </BaseListingCard>
  );
}
