"use client";

import { ProductCard } from "@letitrip/react-library";
import { logError } from "@/lib/error-logger";
import { productsService } from "@/services/products.service";
import type { ProductCardFE } from "@/types/frontend/product.types";
import { ProductVariants as LibraryProductVariants } from "@letitrip/react-library";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ProductVariantsProps {
  productId: string;
  categoryId: string;
  currentShopId: string;
  categoryName?: string;
}

export function ProductVariants({
  productId,
  categoryId,
  currentShopId,
  categoryName = "this category",
}: ProductVariantsProps) {
  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVariants = async () => {
    try {
      setLoading(true);
      const response = await productsService.list({
        categoryId,
        status: "active" as any,
        limit: 20,
      });

      const filtered = (response.data || []).filter(
        (p: ProductCardFE) => p.id !== productId && p.categoryId === categoryId,
      );

      setProducts(filtered.slice(0, 12));
    } catch (error) {
      logError(error as Error, {
        component: "ProductVariants.loadVariants",
        metadata: { productId },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LibraryProductVariants
      productId={productId}
      categoryId={categoryId}
      currentShopId={currentShopId}
      categoryName={categoryName}
      products={products}
      loading={loading}
      onLoadProducts={loadVariants}
      ProductCardComponent={ProductCard}
      icons={{
        chevronLeft: <ChevronLeft className="w-5 h-5" />,
        chevronRight: <ChevronRight className="w-5 h-5" />,
      }}
    />
  );
}
