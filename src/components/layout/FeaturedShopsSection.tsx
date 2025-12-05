/**
 * @fileoverview React Component
 * @module src/components/layout/FeaturedShopsSection
 * @description This file contains the FeaturedShopsSection component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useState, useEffect } from "react";
import { ShopCard } from "@/components/cards/ShopCard";
import { logError } from "@/lib/firebase-error-logger";
import { ProductCard } from "@/components/cards/ProductCard";
import { HorizontalScrollContainer } from "@/components/common/HorizontalScrollContainer";
import { shopsService } from "@/services/shops.service";
import { productsService } from "@/services/products.service";
import { apiService } from "@/services/api.service";
import type { ShopCardFE } from "@/types/frontend/shop.types";
import type { ProductCardFE } from "@/types/frontend/product.types";

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
 * ShopWithProducts interface
 * 
 * @interface
 * @description Defines the structure and contract for ShopWithProducts
 */
interface ShopWithProducts {
  /** Shop */
  shop: ShopCardFE;
  /** Products */
  products: ProductCardFE[];
}

/**
 * Props interface
 * 
 * @interface
 * @description Defines the structure and contract for Props
 */
interface Props {
  /** Max Shops */
  maxShops?: number;
  /** Products Per Shop */
  productsPerShop?: number;
}

export default /**
 * Performs featured shops section operation
 *
 * @param {Props} [{
  maxShops = 3,
  productsPerShop = 5,
}] - The {
  maxshops = 3,
  productspershop = 5,
}
 *
 * @returns {any} The featuredshopssection result
 *
 */
function FeaturedShopsSection({
  maxShops = 3,
  productsPerShop = 5,
}: Props) {
  const [shopsWithProducts, setShopsWithProducts] = useState<
    ShopWithProducts[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedShops();
  }, [maxShops, productsPerShop]);

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

  const fetchFeaturedShops = async () => {
    try {
      setLoading(true);

      // First, try to get admin-curated featured shops
      let curatedShops: ShopCardFE[] = [];

      try {
        const response: any = await apiService.get("/homepage");
        const featuredItems: FeaturedItem[] =
          response.data?.featuredItems?.shops || [];

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
        /**
 * Performs shop ids operation
 *
 * @param {any} (item - The (item
 *
 * @returns {any} The shopids result
 *
 */
  .sort((a, b) => a.position - b.position)
          .slice(0, maxShops);

        if (activeItems.length > 0) {
          const shopIds = activeItems.map((item) => item.itemId);
          curatedShops = await shopsService.getByIds(shopIds);
        }
      } catch {
        // No curated shops, fallback to featured query
      }

      // Use curated shops or fallback to featured query
      let shops: ShopCardFE[];
      if (curatedShops.length > 0) {
        shops = curatedShops;
      } else {
        const/**
 * Performs shops data2 operation
 *
 * @param {ShopCardFE} shops.map(async(shop - The shops.map(async(shop
 *
 * @returns {Promise<any>} The shopsdata2 result
 *
 */
 shopsData = await shopsService.list({
          /** Featured */
          featured: true,
          /** Limit */
          limit: maxShops,
        });
        shops = shopsData.data;
      }

      // Fetch products for each shop
      const shopsData2 = await Promise.all(
        shops.map(async (shop: ShopCardFE) => {
          try {
            const productsData = await productsService.list({
              /** Shop Id */
              shopId: shop.id,
              /** Limit */
              limit: productsPerShop,
            } as any);
            return {
              shop,
              /** Products */
              products: productsData.data,
            };
          } catch (error) {
            logError(error as Error, {
              /** Component */
              component: "FeaturedShopsSection.fetchFeaturedShops",
              /** Metadata */
              metadata: { shopId: shop.id },
            });
            return {
              shop,
              /** Products */
              products: [],
            };
          }
        }),
      );

      setShopsWithProducts(
        shopsData2.filter((item: ShopWithProducts) => item.products.length > 0),
      );
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "FeaturedShopsSection.fetchFeaturedShops",
      });
      setShopsWithProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-12 py-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="min-w-[280px] h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (shopsWithProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12 py-8">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
          Featured Shops
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Discover products from our verified seller partners
        </p>
      </div>
      {shopsWithProducts.map(({ shop, products }) => (
        <section key={shop.id} className="space-y-4">
          <div className="mb-6">
            <ShopCard
              id={shop.id}
              name={shop.name}
              slug={shop.slug}
              description={shop.description || ""}
              logo={shop.logo || undefined}
              banner={shop.banner || undefined}
              rating={shop.rating}
              reviewCount={shop.reviewCount || 0}
              productCount={shop.productCount || shop.totalProducts}
              isVerified={shop.isVerified}
              compact={false}
            />
          </div>

          <HorizontalScrollContainer
            title={`Products from ${shop.name}`}
            viewAllLink={`/shops/${shop.slug}`}
            viewAllText="View Shop"
            itemWidth="280px"
            gap="1rem"
            headingLevel="h3"
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                originalPrice={product.originalPrice || undefined}
                image={product.images[0] || "/placeholder-product.png"}
                rating={product.rating}
                reviewCount={product.reviewCount}
                shopName={shop.name}
                shopSlug={shop.slug}
                inStock={product.stockCount > 0}
                featured={product.featured}
                condition={product.condition}
                showShopName={false}
                compact={false}
              />
            ))}
          </HorizontalScrollContainer>
        </section>
      ))}
    </div>
  );
}
