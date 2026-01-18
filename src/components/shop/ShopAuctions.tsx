"use client";

import AuctionCard from "@/components/cards/AuctionCard";
import type { AuctionCardFE } from "@/types/frontend/auction.types";
import {
  AuctionFilters,
  EmptyState,
} from "@letitrip/react-library";
import { ShopAuctions as LibraryShopAuctions } from "@letitrip/react-library";
import type { ShopAuctionsProps as LibraryShopAuctionsProps } from "@letitrip/react-library";

export interface ShopAuctionsProps extends Omit<
  LibraryShopAuctionsProps,
  | "AuctionCardComponent"
  | "AuctionFiltersComponent"
  | "EmptyStateComponent"
  | "auctions"
> {
  auctions: AuctionCardFE[];
}

export function ShopAuctions(props: ShopAuctionsProps) {
  const convertedAuctions = props.auctions.map((a) => ({
    id: a.id,
    productName: a.productName || "",
    productSlug: a.productSlug || "",
    productImage: a.productImage,
    currentPrice: a.currentPrice || a.startingBid || 0,
    startingBid: a.startingBid || 0,
    totalBids: a.totalBids || 0,
    endTime: typeof a.endTime === "string" ? a.endTime : a.endTime.toISOString(),
    status: a.status,
    featured: (a as any).featured,
  }));

  return (
    <LibraryShopAuctions
      {...props}
      auctions={convertedAuctions}
      AuctionCardComponent={AuctionCard}
      AuctionFiltersComponent={AuctionFilters}
      EmptyStateComponent={EmptyState}
    />
  );
}

export default ShopAuctions;
