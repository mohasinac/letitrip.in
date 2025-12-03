"use client";

import { Loader2 } from "lucide-react";
import AuctionCard from "@/components/cards/AuctionCard";
import { EmptyState } from "@/components/common/EmptyState";
import type { AuctionCardFE } from "@/types/frontend/auction.types";

export interface SimilarAuctionsProps {
  auctions: AuctionCardFE[];
  loading?: boolean;
  currentAuctionId?: string;
  className?: string;
}

/**
 * SimilarAuctions Component
 *
 * Displays similar ongoing auctions based on category.
 * Used on auction detail pages.
 *
 * Features:
 * - Grid of auction cards
 * - Filters out current auction
 * - Loading state
 * - Empty state
 * - Responsive grid layout
 *
 * @example
 * ```tsx
 * <SimilarAuctions
 *   auctions={similarAuctions}
 *   currentAuctionId="auction123"
 * />
 * ```
 */
export function SimilarAuctions({
  auctions,
  loading = false,
  currentAuctionId,
  className = "",
}: SimilarAuctionsProps) {
  // Filter out current auction
  const filteredAuctions = auctions.filter(
    (auction) => auction.id !== currentAuctionId
  );

  if (loading) {
    return (
      <div className={`${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Similar Auctions
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (filteredAuctions.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Similar Auctions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAuctions.map((auction) => (
          <AuctionCard
            key={auction.id}
            auction={{
              id: auction.id,
              name: auction.productName || "",
              slug: auction.productSlug || "",
              images: auction.productImage ? [auction.productImage] : [],
              currentBid: auction.currentPrice || auction.startingBid || 0,
              startingBid: auction.startingBid || 0,
              bidCount: auction.totalBids || 0,
              endTime: auction.endTime,
              status: auction.status as any,
              featured: (auction as any).featured,
              shop: auction.shopId
                ? {
                    id: auction.shopId,
                    name: auction.shopId,
                    isVerified: false,
                  }
                : undefined,
            }}
            showShopInfo={true}
          />
        ))}
      </div>
    </div>
  );
}

export default SimilarAuctions;
