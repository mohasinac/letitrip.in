/**
 * FaqTableColumns
 * Path: src/components/admin/faqs/FaqTableColumns.tsx
 *
 * Column definitions for the admin FAQ DataTable.
 */

import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import type { FAQ } from "./Faq.types";
import { RowActionMenu, Span } from "@/components";

const LABELS = UI_LABELS.ADMIN.FAQS;
const { themed } = THEME_CONSTANTS;

export function getFaqTableColumns(
  onEdit: (faq: FAQ) => void,
  onDelete: (faq: FAQ) => void,
) {
  return {
    columns: [
      {
        key: "question",
        header: LABELS.QUESTION,
        sortable: true,
        width: "35%",
      },
      {
        key: "category",
        header: LABELS.CATEGORY,
        sortable: true,
        width: "15%",
      },
      {
        key: "priority",
        header: LABELS.PRIORITY,
        sortable: true,
        width: "10%",
      },
      {
        key: "viewCount",
        header: LABELS.COL_VIEWS,
        sortable: true,
        width: "10%",
      },
      {
        key: "helpful",
        header: LABELS.COL_HELPFUL,
        render: (faq: FAQ) => {
          const total =
            (faq.stats?.helpful ?? 0) + (faq.stats?.notHelpful ?? 0);
          const ratio =
            total > 0
              ? Math.round(((faq.stats?.helpful ?? 0) / total) * 100)
              : 0;
          return (
            <Span className="text-sm">
              {faq.stats?.helpful ?? 0} / {total} ({ratio}%)
            </Span>
          );
        },
        width: "15%",
      },
      {
        key: "isPinned",
        header: LABELS.FEATURED,
        sortable: true,
        render: (faq: FAQ) => (
          <Span
            className={`px-2 py-1 text-xs font-medium rounded ${
              faq.isPinned
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : `${themed.bgTertiary} ${themed.textSecondary}`
            }`}
          >
            {faq.isPinned ? UI_LABELS.ACTIONS.YES : UI_LABELS.ACTIONS.NO}
          </Span>
        ),
        width: "15%",
      },
    ],
    actions: (faq: FAQ) => (
      <RowActionMenu
        align="right"
        actions={[
          { label: UI_LABELS.ACTIONS.EDIT, onClick: () => onEdit(faq) },
          {
            label: UI_LABELS.ACTIONS.DELETE,
            onClick: () => onDelete(faq),
            destructive: true,
            separator: true,
          },
        ]}
      />
    ),
  };
}
