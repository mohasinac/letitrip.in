"use client";

import { formatTimeRemaining } from "@/lib/formatters";
import { formatPrice } from "@/lib/price.utils";
import { cn } from "@/lib/utils";
import { getTimeRemaining } from "@/lib/validation/auction";
import {
  FavoriteButton,
  AuctionCard as LibraryAuctionCard,
  OptimizedImage,
  type AuctionCardProps as LibraryAuctionCardProps,
} from "@letitrip/react-library";
import Link from "next/link";
import React from "react";

// Re-export types for convenience
export type {
  AuctionCardProps,
  AuctionCardVariant,
} from "@letitrip/react-library";

// Omit injected props from library component
type AuctionCardWrapperProps = Omit<
  LibraryAuctionCardProps,
  | "LinkComponent"
  | "ImageComponent"
  | "FavoriteButtonComponent"
  | "formatPrice"
  | "formatTimeRemaining"
  | "getTimeRemaining"
  | "cn"
>;

const AuctionCardComponent = ({ ...props }: AuctionCardWrapperProps) => {
  return (
    <LibraryAuctionCard
      {...props}
      LinkComponent={Link as any}
      ImageComponent={OptimizedImage as any}
      FavoriteButtonComponent={FavoriteButton as any}
      formatPrice={formatPrice}
      formatTimeRemaining={formatTimeRemaining}
      getTimeRemaining={getTimeRemaining}
      cn={cn}
    />
  );
};

// Memoized export for performance optimization
const AuctionCard = React.memo(AuctionCardComponent);
export default AuctionCard;
