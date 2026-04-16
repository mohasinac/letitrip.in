/**
 * FaqTableColumns
 * Path: src/components/admin/faqs/FaqTableColumns.tsx
 *
 * Column definitions for the admin FAQ DataTable.
 */

import { THEME_CONSTANTS } from "@/constants/theme";
import { UI_LABELS } from "@/constants/ui";
import type { FAQ } from "./Faq.types";
import { Span } from "@mohasinac/appkit/ui";
import { RowActionMenu } from "@/components";

const LABELS = UI_LABELS.ADMIN.FAQS;
const { themed } = THEME_CONSTANTS;

export function getFaqTableColumns(
  onEdit: (faq: FAQ) => void,
  onDelete: (faq: FAQ) => void,
  formatCategory: (category: FAQ["category"]) => string,
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
        render: (faq: FAQ) => formatCategory(faq.category),
        width: "15%",
      },
      {
        key: "priority",
        header: LABELS.PRIORITY,
        sortable: true,
        width: "10%",
      },
      {
        key: "stats.views",
        header: LABELS.COL_VIEWS,
        render: (faq: FAQ) => (
          <Span className="text-sm">{faq.stats?.views ?? 0}</Span>
        ),
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
        key: "showOnHomepage",
        header: LABELS.FEATURED,
        sortable: true,
        render: (faq: FAQ) => (
          <Span
            className={`px-2 py-1 text-xs font-medium rounded ${
              faq.showOnHomepage
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : `${themed.bgTertiary} ${themed.textSecondary}`
            }`}
          >
            {faq.showOnHomepage ? UI_LABELS.ACTIONS.YES : UI_LABELS.ACTIONS.NO}
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

