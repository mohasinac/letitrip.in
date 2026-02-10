/**
 * CarouselTableColumns
 * Path: src/components/admin/carousel/CarouselTableColumns.tsx
 *
 * Column definitions for the admin carousel DataTable.
 * Uses StatusBadge from @/components and UI_LABELS from @/constants.
 */

import { StatusBadge } from "@/components";
import { UI_LABELS } from "@/constants";
import type { CarouselSlide } from "./types";

export function getCarouselTableColumns(
  onEdit: (slide: CarouselSlide) => void,
  onDelete: (slide: CarouselSlide) => void,
) {
  return {
    columns: [
      {
        key: "order",
        header: "Order",
        sortable: true,
        width: "80px",
      },
      {
        key: "title",
        header: "Title",
        sortable: true,
      },
      {
        key: "imageUrl",
        header: "Image",
        render: (slide: CarouselSlide) => (
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className="h-12 w-20 object-cover rounded"
            loading="lazy"
          />
        ),
      },
      {
        key: "isActive",
        header: UI_LABELS.TABLE.STATUS,
        sortable: true,
        render: (slide: CarouselSlide) => (
          <StatusBadge
            status={slide.isActive ? "active" : "inactive"}
            label={
              slide.isActive
                ? UI_LABELS.STATUS.ACTIVE
                : UI_LABELS.STATUS.INACTIVE
            }
          />
        ),
      },
    ],
    actions: (slide: CarouselSlide) => (
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(slide);
          }}
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
        >
          {UI_LABELS.ACTIONS.EDIT}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(slide);
          }}
          className="text-red-600 hover:text-red-800 dark:text-red-400"
        >
          {UI_LABELS.ACTIONS.DELETE}
        </button>
      </div>
    ),
  };
}
