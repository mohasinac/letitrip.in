"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  ERROR_MESSAGES,
  ROUTES,
  SUCCESS_MESSAGES,
  THEME_CONSTANTS,
} from "@/constants";
import { useAddToCart, useAuth, useMessage, useWishlistToggle } from "@/hooks";
import { Button, Span, Text } from "@/components";
import { Heart, ShoppingCart, Zap } from "lucide-react";

const { themed, borderRadius, flex } = THEME_CONSTANTS;

interface ProductActionsProps {
  productId: string;
  productTitle: string;
  price: number;
  isAuction?: boolean;
  isOutOfStock?: boolean;
  statusLabel?: string;
}

export function ProductActions({
  productId,
  productTitle,
  price,
  isAuction = false,
  isOutOfStock = false,
  statusLabel,
}: ProductActionsProps) {
  const t = useTranslations("products");
  const tLoading = useTranslations("loading");
  const tAuctions = useTranslations("auctions");
  const { showSuccess, showError } = useMessage();
  const { user } = useAuth();
  const router = useRouter();

  const { inWishlist, isLoading: wishlistLoading, toggle: toggleWishlist } =
    useWishlistToggle(productId);

  const { mutate: addToCart, isLoading: cartLoading } = useAddToCart({
    onSuccess: () => showSuccess(SUCCESS_MESSAGES.CART.ITEM_ADDED),
    onError: () => showError(ERROR_MESSAGES.CART.ADD_FAILED),
  });

  const handleAddToCart = () => {
    if (!user) {
      router.push(ROUTES.AUTH.LOGIN);
      return;
    }
    if (isAuction || isOutOfStock) return;
    addToCart({ productId, quantity: 1 });
  };

  const handleBuyNow = () => {
    if (!user) {
      router.push(ROUTES.AUTH.LOGIN);
      return;
    }
    if (isOutOfStock) return;
    if (isAuction) {
      // Navigate to auction/bid flow — for now same as add to cart
      return;
    }
    addToCart({ productId, quantity: 1 });
    router.push(ROUTES.USER.CART);
  };

  const handleWishlist = async () => {
    if (!user) {
      router.push(ROUTES.AUTH.LOGIN);
      return;
    }
    try {
      await toggleWishlist();
      if (inWishlist) {
        showSuccess(t("removedFromWishlist"));
      } else {
        showSuccess(t("addedToWishlist"));
      }
    } catch {
      showError(ERROR_MESSAGES.GENERIC.TRY_AGAIN);
    }
  };

  const cartLabel = isAuction
    ? tAuctions("placeBid")
    : cartLoading
      ? tLoading("default")
      : t("addToCart");

  // --- Desktop: right-side sticky column ---
  // --- Mobile: bottom sticky bar (above bottom nav) ---
  return (
    <>
      {/* Desktop actions — visible on lg+ */}
      <div className="hidden lg:block">
        <div className="sticky top-24 space-y-3">
          {/* Add to Cart */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || cartLoading}
            isLoading={cartLoading}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-colors rounded-xl text-base"
            aria-label={cartLabel}
          >
            <Span className={`${flex.center} gap-2`} aria-hidden="true">
              <ShoppingCart className="w-5 h-5" />
            </Span>
            {cartLabel}
          </Button>

          {/* Buy Now */}
          {!isAuction && (
            <Button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-colors rounded-xl text-base"
              aria-label={t("buyNow")}
            >
              <Span className={`${flex.center} gap-2`} aria-hidden="true">
                <Zap className="w-5 h-5" />
              </Span>
              {t("buyNow")}
            </Button>
          )}

          {/* Wishlist */}
          <Button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className={`w-full py-3 border-2 font-semibold transition-all rounded-xl text-base ${
              inWishlist
                ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400"
                : `${themed.border} ${themed.bgPrimary} ${themed.textSecondary} hover:border-pink-400 hover:text-pink-500`
            }`}
            aria-label={
              inWishlist ? t("removeFromWishlist") : t("addToWishlist")
            }
          >
            <Span className={`${flex.center} gap-2`}>
              <Heart
                className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`}
              />
              {inWishlist ? t("removeFromWishlist") : t("addToWishlist")}
            </Span>
          </Button>

          {isOutOfStock && statusLabel && (
            <Text
              variant="muted"
              size="sm"
              className="text-center py-2 font-medium"
            >
              {statusLabel}
            </Text>
          )}
        </div>
      </div>

      {/* Mobile bottom sticky bar — visible below lg */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div
          className={`${themed.bgPrimary} border-t ${themed.border} px-3 py-2.5 safe-area-bottom`}
        >
          <div className={`${flex.rowCenter} gap-2`}>
            {/* Wishlist icon button */}
            <Button
              onClick={handleWishlist}
              disabled={wishlistLoading}
              className={`shrink-0 w-11 h-11 ${flex.center} rounded-xl border-2 transition-all ${
                inWishlist
                  ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-500"
                  : `${themed.border} ${themed.textSecondary} hover:text-pink-500`
              }`}
              aria-label={
                inWishlist ? t("removeFromWishlist") : t("addToWishlist")
              }
            >
              <Heart
                className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`}
              />
            </Button>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock || cartLoading}
              isLoading={cartLoading}
              className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold transition-colors rounded-xl text-sm"
            >
              <Span className={`${flex.center} gap-1.5`}>
                <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                {isOutOfStock
                  ? statusLabel ?? t("outOfStock")
                  : cartLabel}
              </Span>
            </Button>

            {/* Buy Now */}
            {!isAuction && !isOutOfStock && (
              <Button
                onClick={handleBuyNow}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors rounded-xl text-sm"
              >
                <Span className={`${flex.center} gap-1.5`}>
                  <Zap className="w-4 h-4" aria-hidden="true" />
                  {t("buyNow")}
                </Span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
