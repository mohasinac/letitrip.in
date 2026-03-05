"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { useRelatedProducts } from "@/hooks";
import { ProductCard } from "./ProductCard";
import type { ProductDocument } from "@/db/schema";
import { Heading, Section } from "@/components";

const { themed } = THEME_CONSTANTS;

type RelatedProduct = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "description"
  | "price"
  | "currency"
  | "mainImage"
  | "images"
  | "video"
  | "status"
  | "featured"
  | "isAuction"
  | "currentBid"
  | "isPromoted"
  | "slug"
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
    data?.items?.filter((p) => p.id !== excludeId) ?? [];

  if (!isLoading && products.length === 0) return null;

  return (
    <Section className="mt-10">
      <Heading level={2} className="text-xl font-bold mb-4">
        {t("relatedTitle")}
      </Heading>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </Section>
  );
}
