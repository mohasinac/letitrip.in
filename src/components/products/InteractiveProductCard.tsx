"use client";

import { Link } from "@/i18n/navigation";
import { ROUTES, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { useWishlistToggle, useAddToCart, useMessage } from "@/hooks";
import {
  ProductCard as AppkitProductCard,
  type ProductItem,
} from "@mohasinac/appkit/features/products";

interface InteractiveProductCardProps {
  product: ProductItem;
  className?: string;
  variant?: "grid" | "card" | "fluid" | "list";
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  inWishlist?: boolean;
}

export function InteractiveProductCard({
  product,
  className,
  selectable,
  isSelected,
  onSelect,
  inWishlist: initialInWishlist = false,
}: InteractiveProductCardProps) {
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
      <AppkitProductCard
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
