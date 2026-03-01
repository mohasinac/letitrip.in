"use client";

import { useTranslations } from "next-intl";
import { Badge, Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
import type { AdminProduct } from "@/components";

interface SellerProductCardProps {
  product: AdminProduct;
  onEdit: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
}

export function SellerProductCard({
  product,
  onEdit,
  onDelete,
}: SellerProductCardProps) {
  const tActions = useTranslations("actions");
  const { themed } = THEME_CONSTANTS;

  return (
    <div
      className={`rounded-xl overflow-hidden border ${themed.border} ${themed.bgPrimary} h-full`}
    >
      {product.mainImage ? (
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.mainImage}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <span className={`text-3xl ${THEME_CONSTANTS.icon.muted}`}>??</span>
        </div>
      )}
      <div className="p-3 space-y-2">
        <Text size="sm" weight="semibold" className="truncate">
          {product.title}
        </Text>
        <div className="flex items-center justify-between gap-2">
          <Text size="sm" weight="bold">
            {formatCurrency(product.price)}
          </Text>
          <Badge
            variant={
              product.status === "published"
                ? "success"
                : product.status === "out_of_stock"
                  ? "warning"
                  : "default"
            }
            className="text-xs capitalize"
          >
            {product.status.replace(/_/g, " ")}
          </Badge>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 text-xs py-1.5 rounded-lg border border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            {tActions("edit")}
          </button>
          <button
            onClick={() => onDelete(product)}
            className="flex-1 text-xs py-1.5 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            {tActions("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
