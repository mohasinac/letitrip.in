"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { useRelatedProducts } from "@/hooks";
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
  const t = useTranslations("products");
  const { data, isLoading } = useRelatedProducts(category, excludeId, 8);

  const products =
    data?.items?.filter((p: RelatedProduct) => p.id !== excludeId) ?? [];

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className={`text-xl font-bold mb-4 ${themed.textPrimary}`}>
        {t("relatedTitle")}
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
