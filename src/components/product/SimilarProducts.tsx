"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/cards/ProductCard";
import { CardGrid } from "@/components/cards/CardGrid";
import { EmptyState } from "@/components/common/EmptyState";
import { productsService } from "@/services/products.service";
import type { Product } from "@/types";

interface SimilarProductsProps {
  productId: string;
  categoryId: string;
  currentShopId: string;
}

export function SimilarProducts({
  productId,
  categoryId,
  currentShopId,
}: SimilarProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSimilarProducts();
  }, [productId, categoryId]);

  const loadSimilarProducts = async () => {
    try {
      setLoading(true);
      // Fetch products from same category, exclude current product
      const data = await productsService.list({
        categoryId,
        status: "active" as any,
        limit: 12,
      });

      // Filter out current product and diversify shops
      const filtered = (data.data || []).filter(
        (p: Product) => p.id !== productId
      );

      // Diversify by prioritizing different shops
      const diversified = diversifyByShop(filtered, currentShopId);

      // Take max 10 products
      setProducts(diversified.slice(0, 10));
    } catch (error) {
      console.error("Failed to load similar products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to diversify products by shop
  const diversifyByShop = (products: Product[], currentShopId: string) => {
    const otherShops: Product[] = [];
    const sameShop: Product[] = [];

    products.forEach((p) => {
      if (p.shopId === currentShopId) {
        sameShop.push(p);
      } else {
        otherShops.push(p);
      }
    });

    // Prioritize other shops to show variety
    return [...otherShops, ...sameShop];
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Similar Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null; // Don't show section if no similar products
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Similar Products</h2>
      <CardGrid>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            slug={product.slug}
            price={product.price}
            originalPrice={product.originalPrice}
            image={product.images?.[0] || ""}
            rating={product.rating}
            reviewCount={product.reviewCount}
            shopName={product.shopId}
            shopSlug={product.shopId}
            inStock={product.stockCount > 0}
            isFeatured={product.isFeatured}
            condition={product.condition}
            showShopName={true}
          />
        ))}
      </CardGrid>
    </div>
  );
}
