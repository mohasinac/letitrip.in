/**
 * @fileoverview React Component
 * @module src/components/layout/FeaturedProductsSection
 * @description This file contains the FeaturedProductsSection component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/cards/ProductCard";
import { logError } from "@/lib/firebase-error-logger";
import { HorizontalScrollContainer } from "@/components/common/HorizontalScrollContainer";
import { productsService } from "@/services/products.service";
import { homepageSettingsService } from "@/services/homepage-settings.service";
import { apiService } from "@/services/api.service";
import type { ProductCardFE } from "@/types/frontend/product.types";
import { ShoppingBag } from "lucide-react";

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
  /** Max Products */
  maxProducts?: number;
}

export default /**
 * Performs featured products section operation
 *
 * @param {Props} [{ maxProducts = 10 }] - The { maxproducts = 10 }
 *
 * @returns {any} The featuredproductssection result
 *
 */
function FeaturedProductsSection({ maxProducts = 10 }: Props) {
  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, [maxProducts]);

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

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);

      // First, try to get admin-curated featured items
      let curatedProducts: ProductCardFE[] = [];

      try {
        const response: any = await apiService.get("/homepage");
        const featuredItems: FeaturedItem[] =
          response.data?.featuredItems?.products || [];

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
 * Performs product ids operation
 *
 * @param {any} (item - The (item
 *
 * @returns {any} The productids result
 *
 */
sort((a, b) => a.position - b.position)
          .slice(0, maxProducts);

        if (activeItems.length > 0) {
          const productIds = activeItems.map((item) => item.itemId);
          curatedProducts = await productsService.getByIds(productIds);
        }
      } catch {
        // No curated products, fallback to featured query
      }

      // If we have curated products, use them
      if (curatedProducts.length > 0) {
        setProducts(curatedProducts);
        return;
      }

      // Fallback: Query products with featured=true flag
      const response = await productsService.list({
        /** Featured */
        featured: true,
        /** Limit */
        limit: maxProducts,
      });

      setProducts(response.data || []);
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "FeaturedProductsSection.fetchFeaturedProducts",
      });
      setProducts([]);
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

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <HorizontalScrollContainer
        title="✨ Featured Products"
        viewAllLink="/products?featured=true"
        viewAllText="View All Products"
        itemWidth="280px"
        gap="1rem"
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            slug={product.slug}
            price={product.price}
            originalPrice={product.originalPrice || undefined}
            image={product.images[0] || "/placeholder-product.jpg"}
            rating={product.rating}
            reviewCount={product.reviewCount}
            shopName="Shop"
            shopSlug={product.shopId}
            inStock={product.stockCount > 0}
            featured={product.featured}
            condition={product.condition}
            showShopName={true}
          />
        ))}
      </HorizontalScrollContainer>
    </section>
  );
}
