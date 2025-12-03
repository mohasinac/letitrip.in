"use client";

import { useState, useEffect } from "react";
import AuctionCard from "@/components/cards/AuctionCard";
import { HorizontalScrollContainer } from "@/components/common/HorizontalScrollContainer";
import { auctionsService } from "@/services/auctions.service";
import { apiService } from "@/services/api.service";
import type { AuctionCardFE } from "@/types/frontend/auction.types";
import { AuctionStatus } from "@/types/shared/common.types";

interface FeaturedItem {
  id: string;
  type: string;
  itemId: string;
  name: string;
  image?: string;
  position: number;
  active: boolean;
}

interface Props {
  maxAuctions?: number;
}

export default function FeaturedAuctionsSection({ maxAuctions = 10 }: Props) {
  const [auctions, setAuctions] = useState<AuctionCardFE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedAuctions();
  }, [maxAuctions]);

  const fetchFeaturedAuctions = async () => {
    try {
      setLoading(true);

      // First, try to get admin-curated featured items
      let curatedAuctions: AuctionCardFE[] = [];

      try {
        const response: any = await apiService.get("/homepage");
        const featuredItems: FeaturedItem[] =
          response.data?.featuredItems?.auctions || [];

        // Filter active items and sort by position
        const activeItems = featuredItems
          .filter((item) => item.active)
          .sort((a, b) => a.position - b.position)
          .slice(0, maxAuctions);

        if (activeItems.length > 0) {
          const auctionIds = activeItems.map((item) => item.itemId);
          curatedAuctions = await auctionsService.getByIds(auctionIds);
        }
      } catch {
        // No curated auctions, fallback to featured query
      }

      // If we have curated auctions, use them
      if (curatedAuctions.length > 0) {
        setAuctions(curatedAuctions);
        return;
      }

      // Fallback: Query auctions with featured=true flag
      const response = await auctionsService.list({
        featured: true,
        status: AuctionStatus.ACTIVE,
        limit: maxAuctions,
      } as any);

      const auctionsList = Array.isArray(response)
        ? response
        : response.data || [];

      setAuctions(auctionsList);
    } catch (error) {
      console.error("Error fetching featured auctions:", error);
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="min-w-[280px] h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (auctions.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <HorizontalScrollContainer
        title="🔥 Live Auctions"
        viewAllLink="/auctions?status=live"
        viewAllText="View All Auctions"
        itemWidth="280px"
        gap="1rem"
      >
        {auctions.map((auction) => (
          <AuctionCard
            key={auction.id}
            auction={
              {
                id: auction.id,
                name: auction.productName || auction.name || "",
                slug: auction.productSlug || auction.slug || "",
                images:
                  auction.images ||
                  (auction.productImage ? [auction.productImage] : []),
                currentBid:
                  auction.currentPrice ||
                  auction.currentBid ||
                  auction.startingBid ||
                  0,
                startingBid: auction.startingBid || 0,
                bidCount: auction.totalBids || auction.bidCount || 0,
                endTime: auction.endTime,
                featured: auction.featured,
                status: auction.status || "active",
                shop: auction.shopId
                  ? {
                      id: auction.shopId,
                      name: (auction as any).shopName || "Shop",
                    }
                  : undefined,
              } as any
            }
            showShopInfo={true}
          />
        ))}
      </HorizontalScrollContainer>
    </section>
  );
}
