"use client";

import { PreOrderCard } from "./PreOrderCard";
import { Span, Text } from "@/components";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import type { ProductDocument } from "@/db/schema";

const { themed } = THEME_CONSTANTS;

type PreOrderItem = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "description"
  | "price"
  | "currency"
  | "mainImage"
  | "images"
  | "video"
  | "isPreOrder"
  | "preOrderDeliveryDate"
  | "preOrderDepositPercent"
  | "preOrderDepositAmount"
  | "preOrderMaxQuantity"
  | "preOrderCurrentCount"
  | "preOrderProductionStatus"
  | "preOrderCancellable"
  | "featured"
  | "stockQuantity"
  | "availableQuantity"
>;

interface PreOrderGridProps {
  preOrders: PreOrderItem[];
  loading?: boolean;
  skeletonCount?: number;
  /** "grid" (default): responsive grid. "list": stacked horizontal cards. */
  variant?: "grid" | "list";
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

function PreOrderCardSkeleton({
  variant = "grid",
}: {
  variant?: "grid" | "list";
}) {
  if (variant === "list") {
    return (
      <div className="bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden animate-pulse flex flex-row">
        <div className="w-32 sm:w-44 aspect-square bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
        <div className="flex-1 p-3 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded flex-1" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-300 dark:bg-gray-600" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
        <div className="flex gap-2">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded flex-1" />
        </div>
      </div>
    </div>
  );
}

export function PreOrderGrid({
  preOrders,
  loading = false,
  skeletonCount = 8,
  variant = "grid",
  selectable = false,
  selectedIds = [],
  onSelectionChange,
}: PreOrderGridProps) {
  if (loading) {
    return (
      <div
        className={
          variant === "list"
            ? "flex flex-col gap-4"
            : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        }
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <PreOrderCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }

  if (!preOrders.length) {
    return (
      <div className={`text-center py-16 ${themed.bgPrimary} rounded-2xl`}>
        <Span className="text-5xl mb-4 block">📦</Span>
        <Text variant="secondary">{UI_LABELS.EMPTY.NO_ITEMS}</Text>
      </div>
    );
  }

  const handleSelect = (id: string, sel: boolean) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      sel ? [...selectedIds, id] : selectedIds.filter((x) => x !== id),
    );
  };

  return (
    <div
      className={
        variant === "list"
          ? "flex flex-col gap-4"
          : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      }
    >
      {preOrders.map((item) => (
        <PreOrderCard
          key={item.id}
          product={item}
          variant={variant}
          selectable={selectable}
          isSelected={selectedIds.includes(item.id)}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
