/**
 * SectionTableColumns
 * Path: src/components/admin/sections/SectionTableColumns.tsx
 *
 * Column definitions for the admin homepage sections DataTable.
 */

import { StatusBadge } from "@/components";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import type { HomepageSection } from "./types";
import { SECTION_TYPES } from "./types";

const { themed } = THEME_CONSTANTS;

export function getSectionTableColumns(
  onEdit: (section: HomepageSection) => void,
  onDelete: (section: HomepageSection) => void,
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
        key: "type",
        header: UI_LABELS.ADMIN.SECTIONS.SECTION_TYPE,
        sortable: true,
        render: (section: HomepageSection) => (
          <span className={`text-sm ${themed.textSecondary}`}>
            {SECTION_TYPES.find((t) => t.value === section.type)?.label ||
              section.type}
          </span>
        ),
      },
      {
        key: "enabled",
        header: UI_LABELS.TABLE.STATUS,
        sortable: true,
        render: (section: HomepageSection) => (
          <StatusBadge
            status={section.enabled ? "active" : "inactive"}
            label={
              section.enabled
                ? UI_LABELS.STATUS.ACTIVE
                : UI_LABELS.STATUS.INACTIVE
            }
          />
        ),
      },
    ],
    actions: (section: HomepageSection) => (
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(section);
          }}
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
        >
          {UI_LABELS.ACTIONS.EDIT}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(section);
          }}
          className="text-red-600 hover:text-red-800 dark:text-red-400"
        >
          {UI_LABELS.ACTIONS.DELETE}
        </button>
      </div>
    ),
  };
}
