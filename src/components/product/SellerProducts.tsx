"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Store } from "lucide-react";
import { toast } from "sonner";
import { logError } from "@/lib/error-logger";
import { ProductCard } from "@/components/cards/ProductCard";
import { productsService } from "@/services/products.service";
import { SellerProducts as LibrarySellerProducts } from "@letitrip/react-library";
import type { ProductCardFE } from "@/types/frontend/product.types";

interface SellerProductsProps {
  productId: string;
  categoryId: string;
  shopId: string;
  shopName?: string;
}

export function SellerProducts({
  productId,
  categoryId,
  shopId,
  shopName = "this seller",
}: SellerProductsProps) {
  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSellerProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.list({
        shopId,
        status: "active" as any,
        limit: 30,
      });

      const filtered = (response.data || []).filter(
        (p: ProductCardFE) => p.id !== productId
      );

      const sorted = filtered.sort((a, b) => {
        if (a.categoryId === categoryId && b.categoryId !== categoryId)
          return -1;
        if (a.categoryId !== categoryId && b.categoryId === categoryId)
          return 1;
        return 0;
      });

      setProducts(sorted.slice(0, 16));
    } catch (error) {
      logError(error as Error, {
        component: "SellerProducts.loadProducts",
        metadata: { sellerId: shopId },
      });
      toast.error("Failed to load seller products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LibrarySellerProducts
      productId={productId}
      categoryId={categoryId}
      shopId={shopId}
      shopName={shopName}
      products={products}
      loading={loading}
      onLoadProducts={loadSellerProducts}
      ProductCardComponent={ProductCard}
      LinkComponent={Link}
      icons={{
        store: <Store className="w-5 h-5" />,
        chevronLeft: <ChevronLeft className="w-6 h-6" />,
        chevronRight: <ChevronRight className="w-6 h-6" />,
      }}
    />
  );
}
