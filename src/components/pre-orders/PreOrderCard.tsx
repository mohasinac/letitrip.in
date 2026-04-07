/**
 * PreOrderCard — thin wrapper around @mohasinac/feat-pre-orders
 *
 * Injects letitrip-specific wishlist hook and routing.
 */
"use client";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/constants";
import { useWishlistToggle } from "@/hooks";
import {
  PreOrderCard as PkgPreOrderCard,
  PreOrderCardData,
} from "@mohasinac/feat-pre-orders";

export type { PreOrderCardData };

export interface PreOrderCardProps {
  product: PreOrderCardData;
  className?: string;
  variant?: "grid" | "list";
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  inWishlist?: boolean;
}

export function PreOrderCard({
  product,
  className,
  variant,
  selectable,
  isSelected,
  onSelect,
  inWishlist: initialInWishlist = false,
}: PreOrderCardProps) {
  const {
    inWishlist,
    isLoading: wishlistLoading,
    toggle: toggleWishlist,
  } = useWishlistToggle(product.id, initialInWishlist);

  const href = ROUTES.PUBLIC.PRE_ORDER_DETAIL(product.id);

  return (
    <PkgPreOrderCard
      product={product}
      className={className}
      variant={variant}
      href={href}
      LinkComponent={Link}
      selectable={selectable}
      isSelected={isSelected}
      onSelect={onSelect}
      inWishlist={inWishlist}
      wishlistLoading={wishlistLoading}
      onWishlistToggle={(e) => {
        e.stopPropagation();
        toggleWishlist();
      }}
    />
  );
}
