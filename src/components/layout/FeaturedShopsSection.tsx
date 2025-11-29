"use client";

import { useState, useEffect } from "react";
import { ShopCard } from "@/components/cards/ShopCard";
import { ProductCard } from "@/components/cards/ProductCard";
import { HorizontalScrollContainer } from "@/components/common/HorizontalScrollContainer";
import { shopsService } from "@/services/shops.service";
import { productsService } from "@/services/products.service";
import type { ShopCardFE } from "@/types/frontend/shop.types";
import type { ProductCardFE } from "@/types/frontend/product.types";

interface ShopWithProducts {
  shop: ShopCardFE;
  products: ProductCardFE[];
}

export default function FeaturedShopsSection() {
  const [shopsWithProducts, setShopsWithProducts] = useState<
    ShopWithProducts[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedShops();
  }, []);

  const fetchFeaturedShops = async () => {
    try {
      setLoading(true);
      const shopsData = await shopsService.list({
        featured: true,
        limit: 3, // Reduced from 5 to 3
      });
      const shops = shopsData.data;

      const shopsData2 = await Promise.all(
        shops.map(async (shop: ShopCardFE) => {
          try {
            const productsData = await productsService.list({
              shopId: shop.id,
              limit: 5, // Reduced from 10 to 5
            } as any);
            return {
              shop,
              products: productsData.data,
            };
          } catch (error) {
            console.error(
              `Error fetching products for shop ${shop.id}:`,
              error,
            );
            return {
              shop,
              products: [],
            };
          }
        }),
      );

      setShopsWithProducts(
        shopsData2.filter((item: ShopWithProducts) => item.products.length > 0),
      );
    } catch (error) {
      console.error("Error fetching featured shops:", error);
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
            <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="min-w-[280px] h-96 bg-gray-200 rounded-lg"
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
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Featured Shops
        </h2>
        <p className="text-gray-600">
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
