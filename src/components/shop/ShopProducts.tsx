"use client";

import { CardGrid } from "@/components/cards/CardGrid";
import { ProductCard } from "@/components/cards/ProductCard";
import type { ProductCardFE } from "@/types/frontend/product.types";
import {
  EmptyState,
  FormSelect,
  OptimizedImage,
  Price,
  ProductFilters,
} from "@letitrip/react-library";
import { ShopProducts as LibraryShopProducts } from "@letitrip/react-library";
import type { ShopProductsProps as LibraryShopProductsProps } from "@letitrip/react-library";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface ShopProductsProps extends Omit<
  LibraryShopProductsProps,
  | "CardGridComponent"
  | "ProductCardComponent"
  | "ProductFiltersComponent"
  | "EmptyStateComponent"
  | "FormSelectComponent"
  | "OptimizedImageComponent"
  | "PriceComponent"
  | "onProductClick"
  | "onAddToCartSuccess"
  | "onAddToCartError"
  | "products"
> {
  products: ProductCardFE[];
}

export function ShopProducts(props: ShopProductsProps) {
  const router = useRouter();

  const convertedProducts = props.products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    originalPrice: p.originalPrice || undefined,
    images: p.images || [],
    rating: p.rating,
    reviewCount: p.reviewCount,
    stockCount: p.stockCount,
    featured: p.featured,
    condition: p.condition,
  }));

  return (
    <LibraryShopProducts
      {...props}
      products={convertedProducts}
      CardGridComponent={CardGrid}
      ProductCardComponent={ProductCard}
      ProductFiltersComponent={ProductFilters}
      EmptyStateComponent={EmptyState}
      FormSelectComponent={FormSelect}
      OptimizedImageComponent={OptimizedImage}
      PriceComponent={Price}
      onProductClick={(slug) => router.push(`/products/${slug}`)}
      onAddToCartSuccess={(msg) => toast.success(msg)}
      onAddToCartError={(msg) => toast.error(msg)}
    />
  );
}

export default ShopProducts;
