"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  ERROR_MESSAGES,
  ROUTES,
  SUCCESS_MESSAGES,
  THEME_CONSTANTS,
} from "@/constants";
import {
  useAddToCart,
  useAuth,
  useBottomActions,
  useMessage,
  useWishlistToggle,
} from "@/hooks";
import { Span, Text, Button } from "@mohasinac/appkit/ui";

import { Gavel, Heart, ShoppingCart, Tag, Zap } from "lucide-react";
import { formatCurrency } from "@/utils";
import { MakeOfferForm } from "./MakeOfferForm";

const { themed, flex, position } = THEME_CONSTANTS;

interface ProductActionsProps {
  productId: string;
  productTitle: string;
  price: number;
  currency?: string;
  isAuction?: boolean;
  isOutOfStock?: boolean;
  statusLabel?: string;
  /** When provided and <= 5, shows a low-stock urgency label */
  stockCount?: number;
  /** When true, shows the "Make an Offer" button */
  allowOffers?: boolean;
  /** Minimum offer as a percentage of listed price (default 70) */
  minOfferPercent?: number;
}

export function ProductActions({
  productId,
  productTitle,
  price,
  currency = "INR",
  isAuction = false,
  isOutOfStock = false,
  statusLabel,
  stockCount,
  allowOffers = false,
  minOfferPercent = 70,
}: ProductActionsProps) {
  const t = useTranslations("products");
  const tLoading = useTranslations("loading");
  const tAuctions = useTranslations("auctions");
  const tOffers = useTranslations("offers");
  const { showSuccess, showError } = useMessage();
  const { user } = useAuth();
  const router = useRouter();
  const [offerOpen, setOfferOpen] = useState(false);

  const {
    inWishlist,
    isLoading: wishlistLoading,
    toggle: toggleWishlist,
  } = useWishlistToggle(productId);

  const { mutate: addToCart, isLoading: cartLoading } = useAddToCart({
    onSuccess: () => showSuccess(SUCCESS_MESSAGES.CART.ITEM_ADDED),
    onError: () => showError(ERROR_MESSAGES.CART.ADD_FAILED),
  });

  const handleAddToCart = () => {
    if (isAuction || isOutOfStock) return;
    // useAddToCart routes guests to localStorage automatically.
    addToCart({ productId, quantity: 1, productTitle, price });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (isAuction) {
      // Navigate to auction/bid flow — for now requires auth
      if (!user) {
        showError(t("loginToAddToCart"));
        router.push(ROUTES.AUTH.LOGIN);
        return;
      }
      return;
    }
    // useAddToCart routes guests to localStorage automatically.
    addToCart({ productId, quantity: 1, productTitle, price });
    router.push(ROUTES.USER.CART);
  };

  const handleWishlist = async () => {
    if (!user) {
      showError(t("loginToWishlist"));
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

  // ── Mobile bottom action bar (registered into BottomActions via context) ──
  useBottomActions({
    infoLabel:
      isAuction && price > 0
        ? `${tAuctions("startingBid")}: ${formatCurrency(price)}`
        : stockCount && stockCount > 0 && stockCount <= 5
          ? t("onlyLeft", { count: stockCount })
          : undefined,
    actions: [
      // Wishlist — always shown
      {
        id: "wishlist",
        icon: (
          <Heart
            className={`w-4 h-4 ${inWishlist ? "fill-current text-pink-500" : ""}`}
          />
        ),
        label: inWishlist ? t("removeFromWishlist") : t("addToWishlist"),
        variant: "ghost" as const,
        grow: false,
        disabled: wishlistLoading,
        onClick: handleWishlist,
      },
      // Non-auction: Add to Cart
      ...(!isAuction
        ? [
            {
              id: "cart",
              icon: <ShoppingCart className="w-4 h-4" />,
              label: isOutOfStock
                ? (statusLabel ?? t("outOfStock"))
                : t("addToCart"),
              variant: "outline" as const,
              grow: true,
              disabled: isOutOfStock || cartLoading,
              loading: cartLoading,
              onClick: handleAddToCart,
            },
          ]
        : [
            // Auction: Place Bid (primary CTA)
            {
              id: "bid",
              icon: <Gavel className="w-4 h-4" />,
              label: tAuctions("placeBid"),
              variant: "primary" as const,
              grow: true,
              onClick: handleAddToCart,
            },
          ]),
      // Non-auction, in-stock: Buy Now
      ...(!isAuction && !isOutOfStock
        ? [
            {
              id: "buy",
              icon: <Zap className="w-4 h-4" />,
              label: t("buyNow"),
              variant: "primary" as const,
              grow: true,
              onClick: handleBuyNow,
            },
          ]
        : []),
      // Make an Offer — icon-only, only when applicable
      ...(allowOffers && !isAuction && !isOutOfStock
        ? [
            {
              id: "offer",
              icon: <Tag className="w-4 h-4" />,
              variant: "ghost" as const,
              grow: false,
              onClick: () => {
                if (!user) {
                  showError(t("loginToAddToCart"));
                  router.push(ROUTES.AUTH.LOGIN);
                  return;
                }
                setOfferOpen(true);
              },
            },
          ]
        : []),
    ],
  });

  // --- Desktop: right-side sticky column ---
  return (
    <>
      {/* Desktop actions — visible on lg+ */}
      <div className="hidden lg:block">
        <div className="sticky top-24 space-y-3">
          {/* Low-stock urgency */}
          {!isOutOfStock &&
            typeof stockCount === "number" &&
            stockCount > 0 &&
            stockCount <= 5 && (
              <Text
                size="sm"
                className="font-medium text-amber-600 dark:text-amber-400"
              >
                {t("onlyLeft", { count: stockCount })}
              </Text>
            )}
          {/* Add to Cart */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || cartLoading}
            isLoading={cartLoading}
            className="w-full py-3.5 bg-primary-700 hover:bg-primary-700/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 rounded-xl text-base active:scale-95"
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

          {/* Make an Offer */}
          {allowOffers && !isAuction && !isOutOfStock && (
            <Button
              onClick={() => {
                if (!user) {
                  showError(t("loginToAddToCart"));
                  router.push(ROUTES.AUTH.LOGIN);
                  return;
                }
                setOfferOpen(true);
              }}
              className={`w-full py-3 border-2 ${themed.border} ${themed.bgPrimary} ${themed.textSecondary} hover:border-primary-500 hover:text-primary-600 font-semibold transition-all rounded-xl text-base`}
              aria-label={tOffers("sendOffer")}
            >
              <Span className={`${flex.center} gap-2`}>
                <Tag className="w-5 h-5" />
                {tOffers("sendOffer")}
              </Span>
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

      {/* Make an Offer modal */}
      {offerOpen && (
        <div
          className={`${position.fixedFill} z-50 ${flex.center} p-4 bg-black/50 backdrop-blur-sm`}
          onClick={() => setOfferOpen(false)}
        >
          <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <MakeOfferForm
              product={{
                id: productId,
                price,
                currency,
                title: productTitle,
                minOfferPercent,
              }}
              onSuccess={() => {
                setOfferOpen(false);
                showSuccess(tOffers("offerSentTitle"));
              }}
              onCancel={() => setOfferOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

