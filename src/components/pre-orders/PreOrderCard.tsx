/**
 * PreOrderCard — displays a product that is available for pre-order.
 *
 * Accepts ProductItem (products with isPreOrder==true) and injects
 * letitrip-specific wishlist hook and routing.
 */
"use client";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/constants";
import { useWishlistToggle } from "@/hooks";
import { PreOrderTag } from "@mohasinac/feat-pre-orders";
import type { ProductItem } from "@mohasinac/feat-products";
import { Text } from "@/components";
import { formatCurrency } from "@/utils";

/** PreOrderCardData = ProductItem (products with isPreOrder==true) */
export type PreOrderCardData = ProductItem;

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
  className = "",
  selectable,
  isSelected,
  onSelect,
  inWishlist: initialInWishlist = false,
}: PreOrderCardProps) {
  const { inWishlist, toggle: toggleWishlist } = useWishlistToggle(
    product.id,
    initialInWishlist,
  );

  const href = ROUTES.PUBLIC.PRE_ORDER_DETAIL(product.id);
  // ProductDocument may have preOrderDeliveryDate — safe cast for optional field
  const deliveryDate = (product as unknown as { preOrderDeliveryDate?: string })
    .preOrderDeliveryDate;

  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden ${
        isSelected ? "ring-2 ring-primary" : ""
      } ${className}`}
    >
      <Link
        href={href}
        className="block p-4"
        onClick={
          selectable && onSelect
            ? (e) => {
                e.preventDefault();
                onSelect(product.id, !isSelected);
              }
            : undefined
        }
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-medium line-clamp-2 flex-1 text-gray-900 dark:text-gray-100">
            {product.title}
          </h3>
          <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cobalt/10 text-cobalt dark:bg-cobalt/20">
            Pre-order
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <Text size="sm" weight="semibold">
            {formatCurrency(product.price, product.currency)}
          </Text>
          {deliveryDate && <PreOrderTag estimatedDate={deliveryDate} />}
        </div>
      </Link>

      <div className="px-4 pb-3 flex gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist();
          }}
          className={`text-xs px-2 py-1 rounded border transition-colors ${
            inWishlist
              ? "border-primary text-primary"
              : "border-gray-300 dark:border-gray-600 text-gray-500"
          }`}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {inWishlist ? "♥" : "♡"}
        </button>
      </div>
    </div>
  );
}
