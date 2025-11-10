"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/cards/ProductCard";
import { HorizontalScrollContainer } from "@/components/common/HorizontalScrollContainer";
import { productsService } from "@/services/products.service";
import type { Product } from "@/types";
import { ShoppingBag } from "lucide-react";

export default function FeaturedProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      // Try to get homepage products first
      let response = await productsService.list({
        isFeatured: true,
        status: "published",
        limit: 10,
      });

      const productsList = Array.isArray(response)
        ? response
        : response.data || [];

      // If less than 10, try to fill with featured products
      if (productsList.length < 10) {
        const additionalResponse = await productsService.list({
          isFeatured: true,
          status: "published",
          limit: 10 - productsList.length,
        });

        const additionalProducts = Array.isArray(additionalResponse)
          ? additionalResponse
          : additionalResponse.data || [];

        setProducts([...productsList, ...additionalProducts].slice(0, 10));
      } else {
        setProducts(productsList);
      }
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
            originalPrice={product.originalPrice}
            image={product.images[0] || "/placeholder-product.jpg"}
            rating={product.rating}
            reviewCount={product.reviewCount}
            shopName="Shop" // Would come from shop data
            shopSlug={product.shopId}
            inStock={product.stockCount > 0}
            isFeatured={product.isFeatured}
            condition={product.condition}
            showShopName={true}
          />
        ))}
      </HorizontalScrollContainer>
    </section>
  );
}
