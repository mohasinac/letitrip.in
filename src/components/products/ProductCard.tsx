/**
 * ProductCard — thin wrapper around @mohasinac/feat-products
 *
 * Injects letitrip-specific hooks (wishlist, cart, messages) and routing.
 */
"use client";

import { Link } from "@/i18n/navigation";
import { ROUTES, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { useWishlistToggle, useAddToCart, useMessage } from "@/hooks";
import { ProductCard as PkgProductCard } from "@mohasinac/appkit/features/products";
import type { ProductItem } from "@mohasinac/appkit/features/products";

// Re-export data type so consumers can still import from here
export type ProductCardData = ProductItem;

export interface ProductCardProps {
  product: ProductCardData;
  className?: string;
  variant?: "grid" | "card" | "fluid" | "list";
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  /** Initial wishlist state for optimistic UI. */
  inWishlist?: boolean;
}

export function ProductCard({
  product,
  className,
  selectable,
  isSelected,
  onSelect,
  inWishlist: initialInWishlist = false,
}: ProductCardProps) {
  const { showSuccess, showError } = useMessage();
  const { inWishlist, toggle: toggleWishlist } = useWishlistToggle(
    product.id,
    initialInWishlist,
  );

  const { mutate: addToCart } = useAddToCart({
    onSuccess: () => showSuccess(SUCCESS_MESSAGES.CART.ITEM_ADDED),
    onError: () => showError(ERROR_MESSAGES.CART.ADD_FAILED),
  });

  const href = ROUTES.PUBLIC.PRODUCT_DETAIL(product.slug ?? product.id);

  return (
    <Link
      href={href}
      className={`block${selectable ? " cursor-pointer" : ""}${isSelected ? " ring-2 ring-primary" : ""}`}
      onClick={
        selectable && onSelect
          ? (e) => {
              e.preventDefault();
              onSelect(product.id, !isSelected);
            }
          : undefined
      }
    >
      <PkgProductCard
        product={product}
        className={className}
        isWishlisted={inWishlist}
        onAddToWishlist={() => toggleWishlist()}
        onClick={() =>
          addToCart({
            productId: product.id,
            quantity: 1,
            productTitle: product.title,
            productImage: product.mainImage,
            price: product.price,
          })
        }
      />
    </Link>
  );
}
