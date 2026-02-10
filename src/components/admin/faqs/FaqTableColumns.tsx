/**
 * FaqTableColumns
 * Path: src/components/admin/faqs/FaqTableColumns.tsx
 *
 * Column definitions for the admin FAQ DataTable.
 */

import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import type { FAQ } from "./types";

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
        header: "Views",
        sortable: true,
        width: "10%",
      },
      {
        key: "helpful",
        header: "Helpful",
        render: (faq: FAQ) => {
          const total = faq.helpfulCount + faq.notHelpfulCount;
          const ratio =
            total > 0 ? Math.round((faq.helpfulCount / total) * 100) : 0;
          return (
            <span className="text-sm">
              {faq.helpfulCount} / {total} ({ratio}%)
            </span>
          );
        },
        width: "15%",
      },
      {
        key: "featured",
        header: LABELS.FEATURED,
        sortable: true,
        render: (faq: FAQ) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              faq.featured
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : `${themed.bgTertiary} ${themed.textSecondary}`
            }`}
          >
            {faq.featured ? UI_LABELS.ACTIONS.YES : UI_LABELS.ACTIONS.NO}
          </span>
        ),
        width: "15%",
      },
    ],
    actions: (faq: FAQ) => (
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(faq);
          }}
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
        >
          {UI_LABELS.ACTIONS.EDIT}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(faq);
          }}
          className="text-red-600 hover:text-red-800 dark:text-red-400"
        >
          {UI_LABELS.ACTIONS.DELETE}
        </button>
      </div>
    ),
  };
}
