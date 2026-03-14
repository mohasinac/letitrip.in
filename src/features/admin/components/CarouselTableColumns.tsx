/**
 * useCarouselTableColumns
 * Path: src/features/admin/components/CarouselTableColumns.tsx
 *
 * Column definitions hook for the admin carousel DataTable.
 * Uses StatusBadge, MediaImage from @/components and useTranslations from next-intl.
 */

"use client";

import { useTranslations } from "next-intl";
import { StatusBadge, Button, Text, MediaImage } from "@/components";
import type { CarouselSlide } from "./Carousel.types";

export function useCarouselTableColumns(
  onEdit: (slide: CarouselSlide) => void,
  onDelete: (slide: CarouselSlide) => void,
) {
  const t = useTranslations("adminCarousel");
  const tActions = useTranslations("actions");

  return {
    columns: [
      {
        key: "cards",
        header: t("colCards"),
        width: "80px",
        render: (slide: CarouselSlide) => (
          <Text variant="secondary" size="sm">
            {(slide.cards ?? []).length} / 6
          </Text>
        ),
      },
      {
        key: "title",
        header: t("colTitle"),
        sortable: true,
      },
      {
        key: "media",
        header: t("colImage"),
        render: (slide: CarouselSlide) => (
          <div className="relative h-12 w-20 overflow-hidden rounded flex-shrink-0">
            <MediaImage
              src={slide.media?.url ?? ""}
              alt={slide.title}
              size="thumbnail"
            />
          </div>
        ),
      },
      {
        key: "active",
        header: t("colStatus"),
        sortable: true,
        render: (slide: CarouselSlide) => (
          <StatusBadge
            status={slide.active ? "active" : "inactive"}
            label={slide.active ? t("statusActive") : t("statusInactive")}
          />
        ),
      },
    ],
    actions: (slide: CarouselSlide) => (
      <div className="flex gap-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(slide);
          }}
          className="text-primary hover:text-primary/80"
        >
          {tActions("edit")}
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(slide);
          }}
          className="text-red-600 hover:text-red-800 dark:text-red-400"
        >
          {tActions("delete")}
        </Button>
      </div>
    ),
  };
}
