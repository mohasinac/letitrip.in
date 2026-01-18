"use client";

import {
  AuctionCard as LibraryAuctionCard,
  type AuctionCardProps as LibraryAuctionCardProps,
} from "@letitrip/react-library";
import { FavoriteButton, OptimizedImage } from "@letitrip/react-library";
import { formatTimeRemaining } from "@/lib/formatters";
import { formatPrice } from "@/lib/price.utils";
import { getTimeRemaining } from "@/lib/validation/auction";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

// Re-export types for convenience
export type {
  AuctionCardVariant,
  AuctionCardProps,
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
