"use client";

/**
 * useProductTableColumns
 * Path: src/components/admin/products/ProductTableColumns.tsx
 *
 * Column definitions hook for the admin Products DataTable.
 */

import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/utils";
import { Button, MediaImage, Span } from "@/components";
import type { AdminProduct } from "./Product.types";

const STATUS_STYLES: Record<string, string> = {
  published:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  draft: "bg-zinc-100 text-zinc-700 dark:bg-slate-700 dark:text-zinc-300",
  out_of_stock:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  discontinued: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  sold: "bg-primary/10 dark:bg-primary/20 text-primary",
};

export function useProductTableColumns(
  onEdit: (product: AdminProduct) => void,
  onDelete: (product: AdminProduct) => void,
) {
  const t = useTranslations("adminProducts");
  const tActions = useTranslations("actions");
  const { themed } = THEME_CONSTANTS;

  return {
    columns: [
      {
        key: "title",
        header: t("formTitle"),
        sortable: true,
        width: "25%",
        render: (product: AdminProduct) => (
          <div className="flex items-center gap-2">
            {product.mainImage ? (
              <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                <MediaImage
                  src={product.mainImage}
                  alt={product.title}
                  size="thumbnail"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded bg-zinc-200 dark:bg-slate-700 flex-shrink-0" />
            )}
            <Span className="font-medium truncate max-w-[180px]">
              {product.title}
            </Span>
          </div>
        ),
      },
      {
        key: "category",
        header: t("formCategory"),
        sortable: true,
        width: "12%",
      },
      {
        key: "price",
        header: t("formPrice"),
        sortable: true,
        width: "10%",
        render: (product: AdminProduct) => (
          <Span>{formatCurrency(product.price ?? 0, "INR", "en-IN")}</Span>
        ),
      },
      {
        key: "stockQuantity",
        header: t("formStock"),
        sortable: true,
        width: "10%",
      },
      {
        key: "status",
        header: t("formStatus"),
        sortable: true,
        width: "12%",
        render: (product: AdminProduct) => (
          <Span
            className={`px-2 py-1 text-xs font-medium rounded ${
              STATUS_STYLES[product.status] ??
              `${themed.bgTertiary} ${themed.textSecondary}`
            }`}
          >
            {product.status.replace("_", " ")}
          </Span>
        ),
      },
      {
        key: "sellerName",
        header: t("formSeller"),
        sortable: true,
        width: "15%",
        render: (product: AdminProduct) => (
          <Span className="text-sm truncate max-w-[120px] block">
            {product.sellerName}
          </Span>
        ),
      },
      {
        key: "featured",
        header: t("formFeatured"),
        sortable: true,
        width: "8%",
        render: (product: AdminProduct) => (
          <Span
            className={`px-2 py-1 text-xs font-medium rounded ${
              product.featured
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : `${themed.bgTertiary} ${themed.textSecondary}`
            }`}
          >
            {product.featured ? tActions("yes") : tActions("no")}
          </Span>
        ),
      },
    ],
    actions: (product: AdminProduct) => (
      <div className="flex gap-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(product);
          }}
          className="text-primary hover:text-primary/80"
        >
          {tActions("edit")}
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(product);
          }}
          className="text-red-600 hover:text-red-800 dark:text-red-400"
        >
          {tActions("delete")}
        </Button>
      </div>
    ),
  };
}
