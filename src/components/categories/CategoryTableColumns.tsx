/**
 * CategoryTableColumns
 * Path: src/components/admin/categories/CategoryTableColumns.tsx
 *
 * Column definitions for the admin categories DataTable.
 */

import { StatusBadge, Span, Button } from "@mohasinac/appkit/ui";
import { MediaImage } from "@/components";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";

const { flex } = THEME_CONSTANTS;
import type { Category } from "./Category.types";

export function getCategoryTableColumns(
  onEdit: (cat: Category) => void,
  onDelete: (cat: Category) => void,
) {
  return {
    columns: [
      {
        key: "image",
        header: "",
        render: (cat: Category) => (
          <div className="relative w-9 h-9 rounded overflow-hidden flex-shrink-0">
            {cat.display?.coverImage ? (
              <MediaImage
                src={cat.display.coverImage}
                alt=""
                size="thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full ${flex.center} text-base`}
                style={{ backgroundColor: cat.display?.color ?? "#94a3b8" }}
              >
                {cat.display?.icon ?? "🗂️"}
              </div>
            )}
          </div>
        ),
      },
      {
        key: "name",
        header: UI_LABELS.TABLE.NAME,
        sortable: true,
        render: (cat: Category) => (
          <div style={{ paddingLeft: `${cat.tier * 20}px` }}>
            {cat.name}
            {cat.tier > 0 && (
              <Span className="text-zinc-400 text-xs ml-2">
                (Tier {cat.tier})
              </Span>
            )}
          </div>
        ),
      },
      {
        key: "slug",
        header: UI_LABELS.ADMIN.CATEGORIES.COL_SLUG,
        sortable: true,
      },
      {
        key: "metrics",
        header: UI_LABELS.ADMIN.CATEGORIES.COL_PRODUCTS,
        render: (cat: Category) => (
          <Span className="text-sm">
            {cat.metrics.productCount} ({cat.metrics.totalProductCount})
          </Span>
        ),
      },
      {
        key: "isActive",
        header: UI_LABELS.TABLE.STATUS,
        sortable: true,
        render: (cat: Category) => (
          <StatusBadge
            status={cat.isActive ? "active" : "inactive"}
            label={
              cat.isActive ? UI_LABELS.STATUS.ACTIVE : UI_LABELS.STATUS.INACTIVE
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
          className="text-primary hover:text-primary/80"
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
