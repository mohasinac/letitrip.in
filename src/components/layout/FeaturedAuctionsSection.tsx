"use client";

import { useState, useEffect } from "react";
import AuctionCard from "@/components/cards/AuctionCard";
import { HorizontalScrollContainer } from "@/components/common/HorizontalScrollContainer";
import { auctionsService } from "@/services/auctions.service";
import type { Auction } from "@/types";

export default function FeaturedAuctionsSection() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedAuctions();
  }, []);

  const fetchFeaturedAuctions = async () => {
    try {
      setLoading(true);
      const response = await auctionsService.list({
        isFeatured: true,
        status: "live",
        limit: 10,
      });

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
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="min-w-[280px] h-96 bg-gray-200 rounded-lg"
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
        title="Live Auctions"
        viewAllLink="/auctions?status=live"
        viewAllText="View All Auctions"
        itemWidth="280px"
        gap="1rem"
      >
        {auctions.map((auction) => (
          <AuctionCard
            key={auction.id}
            auction={{
              id: auction.id,
              name: auction.name,
              slug: auction.slug,
              images: auction.images || [],
              currentBid: auction.currentBid,
              startingBid: auction.startingBid,
              bidCount: auction.bidCount,
              endTime: auction.endTime,
              isFeatured: auction.isFeatured,
              shop: {
                id: auction.shopId,
                name: "Shop", // Would come from shop data
              },
            }}
            showShopInfo={true}
          />
        ))}
      </HorizontalScrollContainer>
    </section>
  );
}
