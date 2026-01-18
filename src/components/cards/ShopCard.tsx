"use client";

import {
  ShopCard as LibraryShopCard,
  type ShopCardProps as LibraryShopCardProps,
} from "@letitrip/react-library";
import { FavoriteButton, OptimizedImage } from "@letitrip/react-library";
import { formatCompactNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

// Re-export types for convenience
export type { ShopCardVariant, ShopCardProps } from "@letitrip/react-library";

// Omit injected props from library component
type ShopCardWrapperProps = Omit<
  LibraryShopCardProps,
  "LinkComponent" | "ImageComponent" | "FavoriteButtonComponent" | "formatCompactNumber" | "cn"
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
