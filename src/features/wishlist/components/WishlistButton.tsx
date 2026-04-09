/**
 * WishlistButton
 *
 * Heart icon button that toggles a product in/out of the authenticated user's
 * wishlist. Handles its own loading state and calls the wishlist API directly.
 *
 * Usage:
 *   <WishlistButton productId="prod-123" />
 */

"use client";

import { useCallback } from "react";
import { useAuth, useMessage, useWishlistToggle } from "@/hooks";
import { useRouter } from "@/i18n/navigation";
import { ROUTES, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { useTranslations } from "next-intl";
import { WishlistToggleButton } from "@mohasinac/appkit/features/wishlist";

interface WishlistButtonProps {
  productId: string;
  /** Initial state — pass true if the product is already wishlisted (server hint) */
  initialInWishlist?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function WishlistButton({
  productId,
  initialInWishlist = false,
  className = "",
  size = "md",
}: WishlistButtonProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useMessage();
  const router = useRouter();
  const {
    inWishlist,
    isLoading: loading,
    toggle,
  } = useWishlistToggle(productId, initialInWishlist);

  const t = useTranslations("wishlist");

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        showError(t("loginRequired"));
        router.push(ROUTES.AUTH.LOGIN);
        return;
      }

      const wasInWishlist = inWishlist;
      try {
        await toggle();
        showSuccess(
          wasInWishlist
            ? SUCCESS_MESSAGES.WISHLIST.REMOVED
            : SUCCESS_MESSAGES.WISHLIST.ADDED,
        );
      } catch {
        showError(
          wasInWishlist
            ? ERROR_MESSAGES.WISHLIST.REMOVE_FAILED
            : ERROR_MESSAGES.WISHLIST.ADD_FAILED,
        );
      }
    },
    [inWishlist, router, showError, showSuccess, t, toggle, user],
  );

  return (
    <WishlistToggleButton
      inWishlist={inWishlist}
      isLoading={loading}
      onToggle={handleToggle}
      addLabel={t("addToWishlist")}
      removeLabel={t("removeFromWishlist")}
      className={className}
      size={size}
    />
  );
}

export default WishlistButton;
