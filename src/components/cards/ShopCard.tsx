"use client";

import {
  cn,
  FavoriteButton,
  formatCompactNumber,
  ShopCard as LibraryShopCard,
  OptimizedImage,
  type ShopCardProps as LibraryShopCardProps,
} from "@letitrip/react-library";
import Link from "next/link";
import React from "react";

// Re-export types for convenience
export type { ShopCardProps, ShopCardVariant } from "@letitrip/react-library";

// Omit injected props from library component
type ShopCardWrapperProps = Omit<
  LibraryShopCardProps,
  | "LinkComponent"
  | "ImageComponent"
  | "FavoriteButtonComponent"
  | "formatCompactNumber"
  | "cn"
>;

export const ShopCard: React.FC<ShopCardWrapperProps> = ({ ...props }) => {
  return (
    <LibraryShopCard
      {...props}
      LinkComponent={Link as any}
      ImageComponent={OptimizedImage as any}
      FavoriteButtonComponent={FavoriteButton as any}
      formatCompactNumber={formatCompactNumber}
      cn={cn}
    />
  );
};
