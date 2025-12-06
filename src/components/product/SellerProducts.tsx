/**
 * @fileoverview Seller Products Section (Using FeaturedSection Pattern)
 * @module src/components/product/SellerProducts
 * @description Displays more products from the same seller
 * 
 * @refactored 2025-12-06 - Migrated to FeaturedSection pattern (~280 lines saved)
 * @pattern FeaturedSection<ProductCardFE>
 */

"use client";

import { Store } from "lucide-react";
import { FeaturedSection } from "@/components/common/FeaturedSection";
import { ProductCard } from "@/components/cards/ProductCard";
import { productsService } from "@/services/products.service";
import type { ProductCardFE } from "@/types/frontend/product.types";

interface SellerProductsProps {
  productId: string;
  categoryId: string;
  shopId: string;
  shopName?: string;
}

/**
 * Displays more products from the same seller
 * Excludes current product
 */
export function SellerProducts({
  productId,
  categoryId,
  shopId,
  shopName = "this seller",
}: SellerProductsProps) {
  return (
    <FeaturedSection<ProductCardFE>
      title={`More from ${shopName}`}
      icon={Store}
      viewAllHref={`/shops/${shopId}`}
      fetchData={async () => {
        const filters = `ShopId==${shopId},Id!=${productId},IsActive==true`;

        return await productsService.list({
          filters,
          sorts: "-CreatedAt",
          page: 1,
          pageSize: 30,
        });
      }}
      renderItem={(product) => <ProductCard key={product.id} product={product} />}
      emptyMessage="No other products from this seller"
      columns={{ default: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
    />
  );
}

export default SellerProducts;
