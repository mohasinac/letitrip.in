/**
 * @fileoverview React Component
 * @module src/components/layout/FeaturedAuctionsSection
 * @description This file contains the FeaturedAuctionsSection component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { Gavel } from "lucide-react";
import { FeaturedSection } from "@/components/common/FeaturedSection";
import AuctionCard from "@/components/cards/AuctionCard";
import { auctionsService } from "@/services/auctions.service";
import { apiService } from "@/services/api.service";
import type { AuctionCardFE } from "@/types/frontend/auction.types";

/**
 * FeaturedItem interface
 * 
 * @interface
 * @description Defines the structure and contract for FeaturedItem
 */
interface FeaturedItem {
  /** Id */
  id: string;
  /** Type */
  type: string;
  /** Item Id */
  itemId: string;
  /** Name */
  name: string;
  /** Image */
  image?: string;
  /** Position */
  position: number;
  /** Active */
  active: boolean;
}

/**
 * Props interface
 * 
 * @interface
 * @description Defines the structure and contract for Props
 */
interface Props {
  /** Max Auctions */
  maxAuctions?: number;
}

export default function FeaturedAuctionsSection({ maxAuctions = 10 }: Props) {
  const fetchFeaturedAuctions = async (): Promise<AuctionCardFE[]> => {
    // Try to get admin-curated featured items
    try {
      const response: any = await apiService.get("/homepage");
      const featuredItems: FeaturedItem[] = response.data?.featuredItems?.auctions || [];
      
      if (featuredItems.length > 0) {
        const activeItems = featuredItems
          .filter((item) => item.active)
          .sort((a, b) => a.position - b.position)
          .slice(0, maxAuctions);
        
        const auctionIds = activeItems.map((item) => item.itemId);
        if (auctionIds.length > 0) {
          const auctionsData = await auctionsService.list({ ids: auctionIds });
          const sortedAuctions = auctionIds
            .map((id) => auctionsData.find((a) => a.id === id))
            .filter((a): a is AuctionCardFE => a !== undefined);
          if (sortedAuctions.length > 0) {
            return sortedAuctions;
          }
        }
      }
    } catch (error) {
      // Fall back to live auctions
    }

    // Fallback: Get live auctions
    const liveAuctions = await auctionsService.list({ status: "active", limit: maxAuctions });
    return liveAuctions;
  };

  return (
    <FeaturedSection<AuctionCardFE>
      title="🔥 Live Auctions"
      icon={Gavel}
      viewAllLink="/auctions?status=live"
      viewAllText="View All Auctions"
      fetchData={fetchFeaturedAuctions}
      renderItem={(auction) => (
        <AuctionCard
          key={auction.id}
          auction={{
            id: auction.id,
            name: auction.productName || auction.name || "",
            slug: auction.productSlug || auction.slug || "",
            images: auction.images || (auction.productImage ? [auction.productImage] : []),
            currentBid: auction.currentPrice || auction.currentBid || auction.startingBid || 0,
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
          } as any}
          showShopInfo={true}
        />
      )}
      itemWidth="280px"
    />
  );
}

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

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
        /**
 * Performs active items operation
 *
 * @param {any} (item - The (item
 *
 * @returns {any} The activeitems result
 *
 */
const activeItems = featuredItems
          .filter((item) => item.active)
          ./**
 * Performs auction ids operation
 *
 * @param {any} (item - The (item
 *
 * @returns {any} The auctionids result
 *
 */
sort((a, b) => a.position - b.position)
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
        /** Featured */
        featured: true,
        /** Status */
        status: AuctionStatus.ACTIVE,
        /** Limit */
        limit: maxAuctions,
      } as any);

      const auctionsList = Array.isArray(response)
        ? response
        : response.data || [];

      setAuctions(auctionsList);
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "FeaturedAuctionsSection.fetchFeaturedAuctions",
      });
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
                /** Id */
                id: auction.id,
                /** Name */
                name: auction.productName || auction.name || "",
                /** Slug */
                slug: auction.productSlug || auction.slug || "",
                /** Images */
                images:
                  auction.images ||
                  (auction.productImage ? [auction.productImage] : []),
                /** Current Bid */
                currentBid:
                  auction.currentPrice ||
                  auction.currentBid ||
                  auction.startingBid ||
                  0,
                /** Starting Bid */
                startingBid: auction.startingBid || 0,
                /** Bid Count */
                bidCount: auction.totalBids || auction.bidCount || 0,
                /** End Time */
                endTime: auction.endTime,
                /** Featured */
                featured: auction.featured,
                /** Status */
                status: auction.status || "active",
                /** Shop */
                shop: auction.shopId
                  ? {
                      /** Id */
                      id: auction.shopId,
                      /** Name */
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
