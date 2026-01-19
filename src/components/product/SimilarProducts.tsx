"use client";

import { productsService } from "@/services/products.service";
import type { ProductCardFE } from "@/types/frontend/product.types";
import {
  CardGrid,
  SimilarProducts as LibrarySimilarProducts,
  logError,
  ProductCard,
} from "@letitrip/react-library";
import { ChevronLeft, ChevronRight, Grid, Package, X } from "lucide-react";
import { useState } from "react";

interface SimilarProductsProps {
  productId: string;
  parentCategoryIds: string[];
  currentShopId: string;
  parentCategoryName?: string;
}

export function SimilarProducts({
  productId,
  parentCategoryIds,
  currentShopId,
  parentCategoryName = "related categories",
}: SimilarProductsProps) {
  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllModal, setShowAllModal] = useState(false);

  const loadSimilarProducts = async () => {
    try {
      setLoading(true);

      if (!parentCategoryIds || parentCategoryIds.length === 0) {
        setProducts([]);
        return;
      }

      const allProducts: ProductCardFE[] = [];

      for (const parentId of parentCategoryIds) {
        const response = await productsService.list({
          categoryId: parentId,
          status: "active" as any,
          limit: 20,
        });

        if (response.data) {
          allProducts.push(...response.data);
        }
      }

      const uniqueProducts = Array.from(
        new Map(
          allProducts
            .filter((p: ProductCardFE) => p.id !== productId)
            .map((p) => [p.id, p]),
        ).values(),
      );

      const diversified = diversifyByShop(uniqueProducts, currentShopId);
      setProducts(diversified);
    } catch (error) {
      logError(error as Error, {
        component: "SimilarProducts.loadSimilarProducts",
      });
    } finally {
      setLoading(false);
    }
  };

  const diversifyByShop = (
    products: ProductCardFE[],
    currentShopId: string,
  ) => {
    const otherShops: ProductCardFE[] = [];
    const sameShop: ProductCardFE[] = [];

    products.forEach((p) => {
      if (p.shopId === currentShopId) {
        sameShop.push(p);
      } else {
        otherShops.push(p);
      }
    });

    return [...otherShops, ...sameShop];
  };

  return (
    <LibrarySimilarProducts
      productId={productId}
      parentCategoryIds={parentCategoryIds}
      currentShopId={currentShopId}
      parentCategoryName={parentCategoryName}
      products={products}
      loading={loading}
      onLoadProducts={loadSimilarProducts}
      showAllModal={showAllModal}
      onShowAllModalChange={setShowAllModal}
      ProductCardComponent={ProductCard}
      CardGridComponent={CardGrid}
      LinkComponent={() => null}
      icons={{
        grid: <Grid className="w-5 h-5" />,
        x: <X className="w-6 h-6" />,
        package: <Package className="w-12 h-12" />,
        chevronLeft: <ChevronLeft className="w-6 h-6" />,
        chevronRight: <ChevronRight className="w-6 h-6" />,
      }}
    />
  );
}
