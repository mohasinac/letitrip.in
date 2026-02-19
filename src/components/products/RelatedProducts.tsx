"use client";

import { UI_LABELS, API_ENDPOINTS, THEME_CONSTANTS } from "@/constants";
import { useApiQuery } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { ProductCard } from "./ProductCard";
import type { ProductDocument } from "@/db/schema";

const { themed } = THEME_CONSTANTS;

type RelatedProduct = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "price"
  | "currency"
  | "mainImage"
  | "status"
  | "featured"
  | "isAuction"
  | "currentBid"
  | "isPromoted"
  | "category"
>;

interface RelatedProductsResponse {
  data: RelatedProduct[];
  meta: { total: number };
}

interface RelatedProductsProps {
  category: string;
  excludeId: string;
}

export function RelatedProducts({ category, excludeId }: RelatedProductsProps) {
  const url = `${API_ENDPOINTS.PRODUCTS.LIST}?pageSize=8&filters=status==published,category==${encodeURIComponent(category)}&sorts=-createdAt`;

  const { data, isLoading } = useApiQuery<RelatedProductsResponse>({
    queryKey: ["related-products", category, excludeId],
    queryFn: () => apiClient.get(url),
    enabled: Boolean(category),
  });

  const products =
    data?.data?.filter((p: RelatedProduct) => p.id !== excludeId) ?? [];

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className={`text-xl font-bold mb-4 ${themed.textPrimary}`}>
        {UI_LABELS.PRODUCT_DETAIL.RELATED_TITLE}
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`animate-pulse ${themed.bgSecondary} rounded-lg overflow-hidden`}
            >
              <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {products.slice(0, 4).map((product: RelatedProduct) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
