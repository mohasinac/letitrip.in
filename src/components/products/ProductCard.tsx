"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Star, Heart, ShoppingCart, Zap, Package, Gavel } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { MediaImage, Span, Text, TextLink, Button } from "@/components";
import {
  ROUTES,
  THEME_CONSTANTS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/constants";
import { formatCurrency } from "@/utils";
import { useAddToCart, useWishlistToggle, useMessage } from "@/hooks";

const { themed, flex, position } = THEME_CONSTANTS;

/** Minimal structural type — satisfied by both ProductItem (from packages) and ProductDocument (from repositories) */
export interface ProductCardData {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  mainImage?: string;
  images?: string[];
  video?: { url?: string; thumbnailUrl?: string };
  status?: string;
  featured?: boolean;
  isAuction?: boolean;
  currentBid?: number;
  isPromoted?: boolean;
  slug?: string;
  availableQuantity?: number;
}

export interface ProductCardProps {
  product: ProductCardData;
  className?: string;
  /** "grid" (default): vertical card. "list": horizontal card. */
  variant?: "grid" | "list";
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  inWishlist?: boolean;
}

export function ProductCard({
  product,
  className = "",
  variant = "grid",
  selectable = false,
  isSelected = false,
  onSelect,
  inWishlist: initialInWishlist = false,
}: ProductCardProps) {
  const t = useTranslations("products");
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
  const { showSuccess, showError } = useMessage();
  const { mutate: addToCart, isLoading: cartLoading } = useAddToCart({
    onSuccess: () => showSuccess(SUCCESS_MESSAGES.CART.ITEM_ADDED),
    onError: () => showError(ERROR_MESSAGES.CART.ADD_FAILED),
  });

  const isOutOfStock =
    product.status === "out_of_stock" ||
    product.status === "sold" ||
    (product.availableQuantity !== undefined &&
      product.availableQuantity === 0);
  const displayPrice = product.isAuction
    ? (product.currentBid ?? product.price)
    : product.price;
  const hasVideo = Boolean(product.video?.url);
  const allImages = [product.mainImage, ...(product.images ?? [])].filter(
    Boolean,
  );
  const currentSrc = allImages[imgIdx] ?? product.mainImage;
  const productHref = ROUTES.PUBLIC.PRODUCT_DETAIL(product.slug ?? product.id);

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
        // optimistic UI already handles state
      }
    },
    [toggleWishlist],
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      addToCart({
        productId: product.id,
        quantity: 1,
        productTitle: product.title,
        productImage: product.mainImage ?? undefined,
        price: displayPrice,
      });
    },
    [addToCart, product.id, product.title, product.mainImage, displayPrice],
  );

  const handleBuyNow = useCallback(() => {
    router.push(productHref);
  }, [router, productHref]);

  return (
    <div
      className={`h-full ${themed.bgPrimary} rounded-2xl overflow-hidden border transition-all duration-300 flex ${variant === "list" ? "flex-row" : "flex-col"} ${isOutOfStock ? "opacity-75" : ""} ${isSelected ? "ring-2 ring-primary-500 dark:ring-primary-400 border-primary-300 dark:border-primary-700" : `border-zinc-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700`} shadow-sm hover:shadow-2xl hover:-translate-y-1.5 group ${className}`}
    >
      {/* ── IMAGE SECTION ── */}
      <div
        className={`relative overflow-hidden bg-zinc-100 dark:bg-slate-800 flex-shrink-0 ${variant === "list" ? "w-32 sm:w-44 aspect-square" : "aspect-[4/5] w-full"}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <TextLink href={productHref} className={`${position.fill} block`}>
          <MediaImage
            src={currentSrc}
            alt={product.title}
            size="card"
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
          <Button
            variant="ghost"
            onClick={handleSelect}
            aria-label={isSelected ? t("deselectItem") : t("selectItem")}
            className={`absolute top-2 right-2 w-8 h-8 !min-h-0 rounded-lg bg-white/90 dark:bg-slate-800/90 ${flex.center} shadow border border-zinc-200 dark:border-slate-600 hover:border-primary-500 dark:hover:border-primary-400 transition-colors z-10 p-0`}
          >
            {isSelected ? (
              <Span
                variant="inherit"
                className={`w-4 h-4 rounded bg-primary-600 ${flex.center}`}
              >
                <svg
                  viewBox="0 0 10 8"
                  className="w-2.5 h-2 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path
                    d="M1 4l2.5 2.5L9 1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Span>
            ) : (
              <Span
                variant="inherit"
                className="w-4 h-4 rounded border-2 border-zinc-400 dark:border-slate-500 block"
              />
            )}
          </Button>
        )}

        {/* Status badges — below featured star */}
        <div
          className={`absolute left-2 flex flex-col gap-1 z-10 ${product.featured ? "top-8" : "top-2"}`}
        >
          {product.isAuction && (
            <Span className="bg-gradient-to-br from-primary-500 to-primary-600 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
              {t("auction")}
            </Span>
          )}
          {product.isPromoted && !product.isAuction && (
            <Span className="bg-emerald-600/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {t("promoted")}
            </Span>
          )}
        </div>

        {/* Out-of-stock overlay */}
        {isOutOfStock && (
          <div
            className={`${position.fill} bg-black/40 flex items-end justify-center pb-3 pointer-events-none`}
          >
            <Span className="bg-black/70 text-white text-xs font-medium px-3 py-1 rounded-full">
              {product.status === "sold" ? t("sold") : t("outOfStock")}
            </Span>
          </div>
        )}

        {/* Type badge — bottom right */}
        <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
          <Span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${product.isAuction ? "bg-amber-600/90 text-white" : "bg-gradient-to-br from-primary-500 to-primary-600 text-white"}`}
          >
            {product.isAuction ? (
              <Gavel className="w-3 h-3 flex-shrink-0" />
            ) : (
              <Package className="w-3 h-3 flex-shrink-0" />
            )}
            {product.isAuction ? t("auction") : t("typeBadge")}
          </Span>
        </div>
      </div>

      {/* ── INFO SECTION ── */}
      <div
        className={`flex-1 flex flex-col gap-2 ${variant === "list" ? "flex-1 min-w-0 p-3" : "p-3"}`}
      >
        {/* Title + wishlist heart */}
        <div className={`${flex.rowCenter} gap-2 items-start`}>
          <TextLink
            href={productHref}
            className={`flex-1 min-w-0 text-sm font-medium ${themed.textPrimary} line-clamp-2 leading-snug hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}
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
            className={`flex-shrink-0 -mt-0.5 p-1 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-200 disabled:opacity-50 ${inWishlist ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
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

        {/* Price */}
        <div className="flex items-baseline gap-1">
          {product.isAuction && (
            <Span className={`text-xs ${themed.textSecondary}`}>
              {t("currentBid")}:
            </Span>
          )}
          <Text className="text-base font-bold text-primary-600 dark:text-primary-400 leading-none">
            {formatCurrency(displayPrice)}
          </Text>
        </div>

        {/* Action buttons */}
        <div className={`flex flex-wrap gap-1.5 mt-auto`}>
          {isOutOfStock ? (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 min-w-0 text-xs px-2 sm:text-xs sm:px-2 gap-1 cursor-not-allowed opacity-60"
              disabled
            >
              <Span variant="inherit" className="min-w-0 truncate">
                {product.status === "sold" ? t("sold") : t("outOfStock")}
              </Span>
            </Button>
          ) : (
            <>
              <Button
                variant="primary"
                size="sm"
                className="flex-1 min-w-0 text-xs px-2 gap-1 bg-primary-700 hover:bg-primary-800 text-white rounded-xl transition-all hover:shadow-glow active:scale-95"
                isLoading={cartLoading}
                onClick={handleAddToCart}
              >
                <ShoppingCart
                  className="w-3 h-3 flex-shrink-0"
                  aria-hidden="true"
                />
                <Span
                  variant="inherit"
                  className={`min-w-0 truncate ${variant === "list" ? "inline" : "hidden md:inline"}`}
                >
                  {t("addToCartShort")}
                </Span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 min-w-0 text-xs px-2 gap-1 rounded-xl active:scale-95"
                onClick={handleBuyNow}
              >
                <Zap
                  className="w-3 h-3 flex-shrink-0 text-emerald-400"
                  aria-hidden="true"
                />
                <Span
                  variant="inherit"
                  className={`min-w-0 truncate ${variant === "list" ? "inline" : "hidden md:inline"}`}
                >
                  {t("buyNow")}
                </Span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
