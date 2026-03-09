"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { useRelatedProducts } from "@/hooks";
import {
  ProductCard,
  HorizontalScroller,
  Heading,
  Section,
} from "@/components";
import type { ProductDocument } from "@/db/schema";

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
  | "availableQuantity"
>;

interface RelatedProductsResponse {
  data: RelatedProduct[];
  meta: { total: number };
}

interface RelatedProductsProps {
  category: string;
  excludeId: string;
  isAuction?: boolean;
}

export function RelatedProducts({
  category,
  excludeId,
  isAuction = false,
}: RelatedProductsProps) {
  const t = useTranslations("products");
  const { data, isLoading } = useRelatedProducts(
    category,
    excludeId,
    8,
    isAuction,
  );

  const products = data?.items?.filter((p) => p.id !== excludeId) ?? [];

  if (!isLoading && products.length === 0) return null;

  return (
    <Section className="mt-10">
      <Heading level={2} className="text-xl font-bold mb-4">
        {t("relatedTitle")}
      </Heading>

      {isLoading ? (
        <HorizontalScroller
          perView={{ base: 2, sm: 3, md: 4, lg: 4, xl: 5 }}
          gap={12}
          showArrows={false}
          showScrollbar
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`animate-pulse ${themed.bgSecondary} rounded-lg overflow-hidden`}
            >
              <div className="aspect-square bg-zinc-200 dark:bg-slate-700" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-zinc-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-4 bg-zinc-200 dark:bg-slate-700 rounded w-1/3" />
              </div>
            </div>
          ))}
        </HorizontalScroller>
      ) : (
        <HorizontalScroller
          items={products}
          renderItem={(product) => <ProductCard product={product} />}
          keyExtractor={(p) => p.id}
          perView={{ base: 2, sm: 3, md: 4, lg: 4, xl: 5 }}
          gap={12}
          showArrows
          arrowSize="sm"
          showScrollbar
        />
      )}
    </Section>
  );
}
