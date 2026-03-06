/**
 * CategoryTableColumns
 * Path: src/components/admin/categories/CategoryTableColumns.tsx
 *
 * Column definitions for the admin categories DataTable.
 */

import { Button, Span, StatusBadge } from "@/components";
import { UI_LABELS } from "@/constants";
import type { Category } from "./Category.types";

export function getCategoryTableColumns(
  onEdit: (cat: Category) => void,
  onDelete: (cat: Category) => void,
) {
  return {
    columns: [
      {
        key: "name",
        header: UI_LABELS.TABLE.NAME,
        sortable: true,
        render: (cat: Category) => (
          <div style={{ paddingLeft: `${cat.tier * 20}px` }}>
            {cat.name}
            {cat.tier > 0 && (
              <Span className="text-gray-400 text-xs ml-2">
                (Tier {cat.tier})
              </Span>
            )}
          </div>
        ),
      },
      {
        key: "slug",
        header: "Slug",
        sortable: true,
      },
      {
        key: "metrics",
        header: "Products",
        render: (cat: Category) => (
          <Span className="text-sm">
            {cat.metrics.productCount} ({cat.metrics.totalProductCount})
          </Span>
        ),
      },
      {
        key: "enabled",
        header: UI_LABELS.TABLE.STATUS,
        sortable: true,
        render: (cat: Category) => (
          <StatusBadge
            status={cat.enabled ? "active" : "inactive"}
            label={
              cat.enabled ? UI_LABELS.STATUS.ACTIVE : UI_LABELS.STATUS.INACTIVE
            }
          />
        ),
      },
    ],
    actions: (cat: Category) => (
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(cat);
          }}
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
        >
          {UI_LABELS.ACTIONS.EDIT}
        </Button>
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(cat);
          }}
          className="text-red-600 hover:text-red-800 dark:text-red-400"
        >
          {UI_LABELS.ACTIONS.DELETE}
        </Button>
      </div>
    ),
  };
}
