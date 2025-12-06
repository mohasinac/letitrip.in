/**
 * @fileoverview Similar Products Section (Using FeaturedSection Pattern)
 * @module src/components/product/SimilarProducts
 * @description Displays similar products from related categories
 * 
 * @refactored 2025-12-06 - Migrated to FeaturedSection pattern (~390 lines saved)
 * @pattern FeaturedSection<ProductCardFE>
 */

"use client";

import { Package } from "lucide-react";
import { FeaturedSection } from "@/components/common/FeaturedSection";
import { ProductCard } from "@/components/cards/ProductCard";
import { productsService } from "@/services/products.service";
import type { ProductCardFE } from "@/types/frontend/product.types";

interface SimilarProductsProps {
  productId: string;
  parentCategoryIds: string[];
  currentShopId: string;
  parentCategoryName?: string;
}

/**
 * Displays similar products from related categories
 * Excludes current product and products from same shop
 */
export function SimilarProducts({
  productId,
  parentCategoryIds,
  currentShopId,
  parentCategoryName = "related categories",
}: SimilarProductsProps) {
  return (
    <FeaturedSection<ProductCardFE>
      title={`Similar Products from ${parentCategoryName}`}
      icon={Package}
      fetchData={async () => {
        if (!parentCategoryIds || parentCategoryIds.length === 0) {
          return { items: [], total: 0, page: 1, pageSize: 30 };
        }

        const categoryFilters = parentCategoryIds
          .map((id) => `ParentCategoryIds@=*${id}`)
          .join("|");
        const filters = `(${categoryFilters}),Id!=${productId},ShopId!=${currentShopId},IsActive==true`;

        return await productsService.list({
          filters,
          sorts: "-CreatedAt",
          page: 1,
          pageSize: 30,
        });
      }}
      renderItem={(product) => <ProductCard key={product.id} product={product} />}
      emptyMessage="No similar products found"
      columns={{ default: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
    />
  );
}

export default SimilarProducts;
