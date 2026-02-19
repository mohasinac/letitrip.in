/**
 * ProductTableColumns
 * Path: src/components/admin/products/ProductTableColumns.tsx
 *
 * Column definitions for the admin Products DataTable.
 */

import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import type { AdminProduct } from "./types";

const LABELS = UI_LABELS.ADMIN.PRODUCTS;
const { themed } = THEME_CONSTANTS;

const STATUS_STYLES: Record<string, string> = {
  published:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  out_of_stock:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  discontinued: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  sold: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
};

export function getProductTableColumns(
  onEdit: (product: AdminProduct) => void,
  onDelete: (product: AdminProduct) => void,
) {
  return {
    columns: [
      {
        key: "title",
        header: LABELS.TITLE_LABEL,
        sortable: true,
        width: "25%",
        render: (product: AdminProduct) => (
          <div className="flex items-center gap-2">
            {product.mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.mainImage}
                alt={product.title}
                className="w-8 h-8 rounded object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            )}
            <span className="font-medium truncate max-w-[180px]">
              {product.title}
            </span>
          </div>
        ),
      },
      {
        key: "category",
        header: LABELS.CATEGORY_LABEL,
        sortable: true,
        width: "12%",
      },
      {
        key: "price",
        header: LABELS.PRICE_LABEL,
        sortable: true,
        width: "10%",
        render: (product: AdminProduct) => (
          <span>₹{product.price?.toLocaleString("en-IN") ?? "0"}</span>
        ),
      },
      {
        key: "stockQuantity",
        header: LABELS.STOCK_LABEL,
        sortable: true,
        width: "10%",
      },
      {
        key: "status",
        header: LABELS.STATUS_LABEL,
        sortable: true,
        width: "12%",
        render: (product: AdminProduct) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              STATUS_STYLES[product.status] ??
              `${themed.bgTertiary} ${themed.textSecondary}`
            }`}
          >
            {product.status.replace("_", " ")}
          </span>
        ),
      },
      {
        key: "sellerName",
        header: LABELS.SELLER_LABEL,
        sortable: true,
        width: "15%",
        render: (product: AdminProduct) => (
          <span className="text-sm truncate max-w-[120px] block">
            {product.sellerName}
          </span>
        ),
      },
      {
        key: "featured",
        header: LABELS.FEATURED_LABEL,
        sortable: true,
        width: "8%",
        render: (product: AdminProduct) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              product.featured
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : `${themed.bgTertiary} ${themed.textSecondary}`
            }`}
          >
            {product.featured ? UI_LABELS.ACTIONS.YES : UI_LABELS.ACTIONS.NO}
          </span>
        ),
      },
    ],
    actions: (product: AdminProduct) => (
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(product);
          }}
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
        >
          {UI_LABELS.ACTIONS.EDIT}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(product);
          }}
          className="text-red-600 hover:text-red-800 dark:text-red-400"
        >
          {UI_LABELS.ACTIONS.DELETE}
        </button>
      </div>
    ),
  };
}
