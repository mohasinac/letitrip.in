/**
 * @fileoverview React Component
 * @module src/components/layout/FeaturedShopsSection
 * @description Featured shops section using FeaturedSection pattern
 * 
 * @created 2025-12-05
 * @updated 2025-12-06
 * @author mohasinac
 */

"use client";

import { Store } from "lucide-react";
import { FeaturedSection } from "@/components/common/FeaturedSection";
import { ShopCard } from "@/components/cards/ShopCard";
import { shopsService } from "@/services/shops.service";
import { apiService } from "@/services/api.service";
import type { ShopCardFE } from "@/types/frontend/shop.types";

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
  maxShops?: number;
}

export default function FeaturedShopsSection({ maxShops = 10 }: Props) {
  const fetchFeaturedShops = async (): Promise<ShopCardFE[]> => {
    try {
      const response: any = await apiService.get("/homepage");
      const featuredItems: FeaturedItem[] = response.data?.featuredItems?.shops || [];
      
      if (featuredItems.length > 0) {
        const activeItems = featuredItems
          .filter((item) => item.active)
          .sort((a, b) => a.position - b.position)
          .slice(0, maxShops);
        
        const shopIds = activeItems.map((item) => item.itemId);
        if (shopIds.length > 0) {
          const shopsData = await shopsService.list({ ids: shopIds });
          const sortedShops = shopIds
            .map((id) => shopsData.find((s) => s.id === id))
            .filter((s): s is ShopCardFE => s !== undefined);
          if (sortedShops.length > 0) {
            return sortedShops;
          }
        }
      }
    } catch (error) {}

    const featuredShops = await shopsService.list({ featured: true, limit: maxShops });
    return featuredShops;
  };

  return (
    <FeaturedSection<ShopCardFE>
      title=" Featured Shops"
      icon={Store}
      viewAllLink="/shops?featured=true"
      viewAllText="View All Shops"
      fetchData={fetchFeaturedShops}
      renderItem={(shop) => (
        <ShopCard
          key={shop.id}
          id={shop.id}
          name={shop.name}
          slug={shop.slug}
          logo={shop.logo}
          description={shop.description}
          rating={shop.rating}
          reviewCount={shop.reviewCount}
          productCount={shop.productCount}
          verified={shop.verified}
          featured={shop.featured}
        />
      )}
      itemWidth="280px"
    />
  );
}
