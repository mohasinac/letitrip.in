"use client";

import {
  ProductCard as LibraryProductCard,
  type ProductCardProps as LibraryProductCardProps,
} from "@letitrip/react-library";
import {
  FavoriteButton,
  OptimizedImage,
  StatusBadge,
} from "@letitrip/react-library";
import { CompareButton } from "@/components/products/CompareButton";
import { formatDiscount } from "@/lib/formatters";
import { formatPrice } from "@/lib/price.utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

// Re-export types for convenience
export type {
  ProductCardVariant,
  ProductCardProps,
} from "@letitrip/react-library";

// Omit injected props from library component
type ProductCardWrapperProps = Omit<
  LibraryProductCardProps,
  | "LinkComponent"
  | "ImageComponent"
  | "FavoriteButtonComponent"
  | "CompareButtonComponent"
  | "StatusBadgeComponent"
  | "formatPrice"
  | "formatDiscount"
  | "onShopClick"
>;

const ProductCardComponent: React.FC<ProductCardWrapperProps> = ({
  ...props
}) => {
  const router = useRouter();

  const handleShopClick = (shopSlug: string) => {
    router.push(`/shops/${shopSlug}`);
  };

  return (
    <LibraryProductCard
      {...props}
      LinkComponent={Link as any}
      ImageComponent={OptimizedImage as any}
      FavoriteButtonComponent={FavoriteButton as any}
      CompareButtonComponent={CompareButton as any}
      StatusBadgeComponent={StatusBadge as any}
      formatPrice={formatPrice}
      formatDiscount={formatDiscount}
      onShopClick={handleShopClick}
    />
  );
};

// Memoized export for performance optimization
export const ProductCard = React.memo(ProductCardComponent);
