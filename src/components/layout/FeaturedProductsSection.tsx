"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/cards/ProductCard";
import { HorizontalScrollContainer } from "@/components/common/HorizontalScrollContainer";
import { productsService } from "@/services/products.service";
import { homepageSettingsService } from "@/services/homepage-settings.service";
import { apiService } from "@/services/api.service";
import type { ProductCardFE } from "@/types/frontend/product.types";
import { ShoppingBag } from "lucide-react";

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
  maxProducts?: number;
}

export default function FeaturedProductsSection({ maxProducts = 10 }: Props) {
  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, [maxProducts]);

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
        const activeItems = featuredItems
          .filter((item) => item.active)
          .sort((a, b) => a.position - b.position)
          .slice(0, maxProducts);

        if (activeItems.length > 0) {
          const productIds = activeItems.map((item) => item.itemId);
          curatedProducts = await productsService.getByIds(productIds);
        }
      } catch (err) {
        console.log("No curated products, falling back to featured flag");
      }

      // If we have curated products, use them
      if (curatedProducts.length > 0) {
        setProducts(curatedProducts);
        return;
      }

      // Fallback: Query products with featured=true flag
      const response = await productsService.list({
        featured: true,
        limit: maxProducts,
      });

      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching featured products:", error);
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
