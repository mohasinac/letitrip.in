"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Star, Heart, ShoppingCart, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { MediaImage, Span, Text, TextLink, Button } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
import { useAddToCart, useWishlistToggle } from "@/hooks";
import type { ProductDocument } from "@/db/schema";

const { themed, borderRadius, flex, position } = THEME_CONSTANTS;

export interface ProductCardProps {
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
    | "status"
    | "featured"
    | "isAuction"
    | "currentBid"
    | "isPromoted"
    | "slug"
  >;
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
  const { mutate: addToCart, isLoading: cartLoading } = useAddToCart();

  const isOutOfStock =
    product.status === "out_of_stock" || product.status === "sold";
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
      addToCart({ productId: product.id, quantity: 1 });
    },
    [addToCart, product.id],
  );

  const handleBuyNow = useCallback(() => {
    router.push(productHref);
  }, [router, productHref]);

  return (
    <div
      className={`${themed.bgPrimary} ${borderRadius.lg} overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 flex ${variant === "list" ? "flex-row" : "flex-col"} ${isOutOfStock ? "opacity-75" : ""} ${isSelected ? "ring-2 ring-indigo-500 dark:ring-indigo-400" : ""} ${className}`}
    >
      {/* ── IMAGE SECTION ── */}
      <div
        className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 ${variant === "list" ? "w-32 sm:w-44 aspect-square" : "aspect-square w-full"}`}
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
            <Span className="bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs leading-none">
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
            className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/90 dark:bg-gray-800/90 flex items-center justify-center shadow border border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors z-10 p-0"
          >
            {isSelected ? (
              <Span
                variant="inherit"
                className="w-4 h-4 rounded bg-indigo-600 flex items-center justify-center"
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
                className="w-4 h-4 rounded border-2 border-gray-400 dark:border-gray-500 block"
              />
            )}
          </Button>
        )}

        {/* Status badges — below featured star */}
        <div
          className={`absolute left-2 flex flex-col gap-1 z-10 ${product.featured ? "top-8" : "top-2"}`}
        >
          {product.isAuction && (
            <Span className="bg-indigo-600/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
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
      </div>

      {/* ── INFO SECTION ── */}
      <div
        className={`flex flex-col gap-2 ${variant === "list" ? "flex-1 min-w-0 p-3 justify-between" : "p-3"}`}
      >
        {/* Title + wishlist heart */}
        <div className={`${flex.rowCenter} gap-2 items-start`}>
          <TextLink
            href={productHref}
            className={`flex-1 min-w-0 text-sm font-medium ${themed.textPrimary} line-clamp-2 leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors`}
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
              className={`w-4 h-4 transition-colors ${inWishlist ? "fill-rose-500 text-rose-500" : "text-gray-400 dark:text-gray-500"}`}
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
          <Text className="text-base font-bold text-indigo-600 dark:text-indigo-400 leading-none">
            {formatCurrency(displayPrice)}
          </Text>
        </div>

        {/* Action buttons */}
        <div className={`flex gap-1.5 ${variant === "list" ? "mt-auto" : ""}`}>
          {isOutOfStock ? (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs px-2 gap-1 cursor-not-allowed opacity-60"
              disabled
            >
              <Span variant="inherit" className="truncate">
                {product.status === "sold" ? t("sold") : t("outOfStock")}
              </Span>
            </Button>
          ) : (
            <>
              <Button
                variant="primary"
                size="sm"
                className="flex-1 text-xs px-2 gap-1"
                isLoading={cartLoading}
                onClick={handleAddToCart}
              >
                <ShoppingCart
                  className="w-3 h-3 flex-shrink-0"
                  aria-hidden="true"
                />
                <Span variant="inherit" className="truncate">
                  {t("addToCart")}
                </Span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 text-xs px-2 gap-1"
                onClick={handleBuyNow}
              >
                <Zap
                  className="w-3 h-3 flex-shrink-0 text-emerald-400"
                  aria-hidden="true"
                />
                <Span variant="inherit" className="truncate">
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
