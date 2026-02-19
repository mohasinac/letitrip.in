"use client";

import { AuctionCard } from "./AuctionCard";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import type { ProductDocument } from "@/db/schema";

const { themed } = THEME_CONSTANTS;

type AuctionItem = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "price"
  | "currency"
  | "mainImage"
  | "isAuction"
  | "auctionEndDate"
  | "startingBid"
  | "currentBid"
  | "bidCount"
  | "featured"
>;

interface AuctionGridProps {
  auctions: AuctionItem[];
  loading?: boolean;
  skeletonCount?: number;
}

function AuctionCardSkeleton() {
  return (
    <div className="bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-300 dark:bg-gray-600" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
        <div className="flex justify-between">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

export function AuctionGrid({
  auctions,
  loading = false,
  skeletonCount = 12,
}: AuctionGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <AuctionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (auctions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <span className="text-6xl">🔨</span>
        <p className={`text-xl font-medium ${themed.textPrimary}`}>
          {UI_LABELS.AUCTIONS_PAGE.NO_AUCTIONS}
        </p>
        <p className={`text-sm ${themed.textSecondary}`}>
          {UI_LABELS.AUCTIONS_PAGE.NO_AUCTIONS_SUBTITLE}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {auctions.map((auction) => (
        <AuctionCard key={auction.id} product={auction} />
      ))}
    </div>
  );
}
