"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { ProductCard } from "./ProductCard";
import type { ProductCardData } from "./ProductCard";
import { Heading, Span, Text } from "@/components";

const { themed } = THEME_CONSTANTS;

interface ProductGridProps {
  products: ProductCardData[];
  loading?: boolean;
  skeletonCount?: number;
  /** "grid" (default): responsive grid. "list": stacked horizontal cards. */
  variant?: "grid" | "list";
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

function ProductSkeleton({ variant = "grid" }: { variant?: "grid" | "list" }) {
  if (variant === "list") {
    return (
      <div
        className={`${themed.bgPrimary} rounded-lg overflow-hidden animate-pulse flex flex-row`}
      >
        <div className="w-32 sm:w-44 aspect-square bg-zinc-200 dark:bg-slate-700 flex-shrink-0" />
        <div className="flex-1 p-3 space-y-2">
          <div className="h-4 bg-zinc-200 dark:bg-slate-700 rounded w-2/3" />
          <div className="h-3 bg-zinc-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-3 bg-zinc-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-5 bg-zinc-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="flex gap-2">
            <div className="h-8 bg-zinc-200 dark:bg-slate-700 rounded flex-1" />
            <div className="h-8 bg-zinc-200 dark:bg-slate-700 rounded flex-1" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`${themed.bgPrimary} border-border overflow-hidden rounded-2xl border animate-pulse`}
    >
      <div
        className={`aspect-[4/5] w-full ${THEME_CONSTANTS.skeleton.image}`}
      />
      <div className="space-y-2 p-4">
        <div className={`h-4 w-3/4 ${THEME_CONSTANTS.skeleton.text}`} />
        <div className={`h-3 w-1/2 ${THEME_CONSTANTS.skeleton.text}`} />
        <div className={`h-5 w-1/3 ${THEME_CONSTANTS.skeleton.text}`} />
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  loading = false,
  skeletonCount = 24,
  variant = "grid",
  selectable = false,
  selectedIds = [],
  onSelectionChange,
}: ProductGridProps) {
  const t = useTranslations("products");

  const handleSelect = (id: string, selected: boolean) => {
    if (!onSelectionChange) return;
    if (selected) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    }
  };

  const containerClass =
    variant === "list"
      ? "flex flex-col gap-4"
      : THEME_CONSTANTS.grid.cards + " gap-4 md:gap-6";

  if (loading) {
    return (
      <div className={containerClass}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Span className="text-6xl mb-4">🔍</Span>
        <Heading level={3} className="text-xl font-semibold mb-2">
          {t("noProductsFound")}
        </Heading>
        <Text size="sm" variant="secondary">
          {t("noProductsSubtitle")}
        </Text>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          selectable={selectable}
          isSelected={selectedIds.includes(product.id)}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
