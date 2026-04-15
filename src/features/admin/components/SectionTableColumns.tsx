"use client";

/**
 * useSectionTableColumns
 * Path: src/components/admin/sections/SectionTableColumns.tsx
 *
 * Column definitions hook for the admin homepage sections DataTable.
 */

import { StatusBadge, Span, Button } from "@mohasinac/appkit/ui";

import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import type { HomepageSection } from "./Section.types";
import { SECTION_TYPES } from "./Section.types";

export function useSectionTableColumns(
  onEdit: (section: HomepageSection) => void,
  onDelete: (section: HomepageSection) => void,
) {
  const t = useTranslations("adminSections");
  const tActions = useTranslations("actions");
  const { themed } = THEME_CONSTANTS;

  return {
    columns: [
      {
        key: "order",
        header: t("colOrder"),
        sortable: true,
        width: "80px",
      },
      {
        key: "title",
        header: t("colTitle"),
        sortable: true,
      },
      {
        key: "type",
        header: t("sectionType"),
        sortable: true,
        render: (section: HomepageSection) => (
          <Span className={`text-sm ${themed.textSecondary}`}>
            {SECTION_TYPES.find((st) => st.value === section.type)?.label ||
              section.type}
          </Span>
        ),
      },
      {
        key: "enabled",
        header: t("colStatus"),
        sortable: true,
        render: (section: HomepageSection) => (
          <StatusBadge
            status={section.enabled ? "active" : "inactive"}
            label={section.enabled ? t("statusActive") : t("statusInactive")}
          />
        ),
      },
    ],
    actions: (section: HomepageSection) => (
      <div className="flex gap-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(section);
          }}
          className="text-primary hover:text-primary/80"
        >
          {tActions("edit")}
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(section);
          }}
          className="text-red-600 hover:text-red-800 dark:text-red-400"
        >
          {tActions("delete")}
        </Button>
      </div>
    ),
  };
}

