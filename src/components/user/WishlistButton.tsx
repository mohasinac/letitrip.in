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

import { useState, useCallback } from "react";
import { useAuth } from "@/hooks";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS, ROUTES, UI_LABELS } from "@/constants";
import { apiClient } from "@/lib/api-client";

interface WishlistButtonProps {
  productId: string;
  /** Initial state — pass true if the product is already wishlisted (server hint) */
  initialInWishlist?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-11 h-11",
};

export function WishlistButton({
  productId,
  initialInWishlist = false,
  className = "",
  size = "md",
}: WishlistButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [loading, setLoading] = useState(false);

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        router.push(ROUTES.AUTH.LOGIN);
        return;
      }

      setLoading(true);
      try {
        if (inWishlist) {
          await apiClient.delete(API_ENDPOINTS.USER.WISHLIST.REMOVE(productId));
          setInWishlist(false);
        } else {
          await apiClient.post(API_ENDPOINTS.USER.WISHLIST.ADD, { productId });
          setInWishlist(true);
        }
      } catch {
        // Silently revert on error
      } finally {
        setLoading(false);
      }
    },
    [user, router, inWishlist, productId],
  );

  const label = inWishlist
    ? UI_LABELS.USER.WISHLIST.REMOVE
    : UI_LABELS.WISHLIST.ADD_TO_WISHLIST;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      aria-label={label}
      title={label}
      className={`
        flex items-center justify-center rounded-full
        transition-all duration-150
        ${
          inWishlist
            ? "bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40"
            : "bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-rose-400"
        }
        ${sizeClasses[size]}
        ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      <svg
        className="w-4/6 h-4/6"
        viewBox="0 0 24 24"
        fill={inWishlist ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}

export default WishlistButton;
