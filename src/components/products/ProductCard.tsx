/**
 * ProductCard — thin wrapper around @mohasinac/feat-products
 *
 * Injects letitrip-specific hooks (wishlist, cart, messages) and routing.
 */
"use client";

import { Link } from "@/i18n/navigation";
import { ROUTES, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { useWishlistToggle, useAddToCart, useMessage } from "@/hooks";
import {
  ProductCard as PkgProductCard,
  ProductCardData,
} from "@mohasinac/feat-products";

// Re-export data type so consumers can still import from here
export type { ProductCardData };

export interface ProductCardProps {
  product: ProductCardData;
  className?: string;
  variant?: "grid" | "list";
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  /** Initial wishlist state for optimistic UI. */
  inWishlist?: boolean;
}

export function ProductCard({
  product,
  className,
  variant,
  selectable,
  isSelected,
  onSelect,
  inWishlist: initialInWishlist = false,
}: ProductCardProps) {
  const { showSuccess, showError } = useMessage();
  const {
    inWishlist,
    isLoading: wishlistLoading,
    toggle: toggleWishlist,
  } = useWishlistToggle(product.id, initialInWishlist);

  const { mutate: addToCart, isLoading: cartLoading } = useAddToCart({
    onSuccess: () => showSuccess(SUCCESS_MESSAGES.CART.ITEM_ADDED),
    onError: () => showError(ERROR_MESSAGES.CART.ADD_FAILED),
  });

  const href = ROUTES.PUBLIC.PRODUCT_DETAIL(product.slug ?? product.id);

  return (
    <PkgProductCard
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
      cartLoading={cartLoading}
      onWishlistToggle={(e) => {
        e.stopPropagation();
        toggleWishlist();
      }}
      onAddToCart={(data) =>
        addToCart({
          productId: data.productId,
          quantity: data.quantity,
          productTitle: data.productTitle,
          productImage: data.productImage,
          price: data.price,
        })
      }
    />
  );
}
