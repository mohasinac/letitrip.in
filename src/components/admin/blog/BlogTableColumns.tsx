/**
 * BlogTableColumns
 * Path: src/components/admin/blog/BlogTableColumns.tsx
 *
 * Column definitions for the admin Blog DataTable.
 */

"use client";

import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { formatDate } from "@/utils";
import { Button } from "@/components";
import type { BlogPostDocument } from "@/db/schema";

const LABELS = UI_LABELS.ADMIN.BLOG;
const { themed } = THEME_CONSTANTS;

const STATUS_STYLES: Record<string, string> = {
  published:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  draft:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  archived: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

const CATEGORY_STYLES: Record<string, string> = {
  news: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  tips: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  guides:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  updates:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  community:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
};

export function getBlogTableColumns(
  onEdit: (post: BlogPostDocument) => void,
  onDelete: (post: BlogPostDocument) => void,
) {
  return {
    columns: [
      {
        key: "title",
        header: LABELS.FORM_TITLE,
        sortable: true,
        width: "30%",
        render: (post: BlogPostDocument) => (
          <div>
            <p className="font-medium text-sm truncate max-w-[220px]">
              {post.title}
            </p>
            <p className={`text-xs ${themed.textSecondary} font-mono`}>
              /{post.slug}
            </p>
          </div>
        ),
      },
      {
        key: "category",
        header: LABELS.FORM_CATEGORY,
        sortable: true,
        width: "12%",
        render: (post: BlogPostDocument) => (
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_STYLES[post.category] ?? ""}`}
          >
            {post.category}
          </span>
        ),
      },
      {
        key: "status",
        header: LABELS.FORM_STATUS,
        sortable: true,
        width: "12%",
        render: (post: BlogPostDocument) => (
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[post.status] ?? ""}`}
          >
            {post.status}
          </span>
        ),
      },
      {
        key: "isFeatured",
        header: LABELS.FORM_FEATURED,
        width: "8%",
        render: (post: BlogPostDocument) =>
          post.isFeatured ? (
            <span className="text-yellow-500 text-base">★</span>
          ) : (
            <span className={`text-xs ${themed.textSecondary}`}>—</span>
          ),
      },
      {
        key: "authorName",
        header: LABELS.AUTHOR,
        width: "14%",
        render: (post: BlogPostDocument) => (
          <p
            className={`text-sm ${themed.textSecondary} truncate max-w-[100px]`}
          >
            {post.authorName}
          </p>
        ),
      },
      {
        key: "publishedAt",
        header: LABELS.PUBLISHED_ON,
        sortable: true,
        width: "12%",
        render: (post: BlogPostDocument) => (
          <p className={`text-sm ${themed.textSecondary}`}>
            {post.publishedAt ? formatDate(post.publishedAt) : "—"}
          </p>
        ),
      },
      {
        key: "views",
        header: LABELS.VIEWS,
        sortable: true,
        width: "8%",
        render: (post: BlogPostDocument) => (
          <p className={`text-sm ${themed.textSecondary}`}>{post.views}</p>
        ),
      },
      {
        key: "actions",
        header: "",
        width: "10%",
        render: (post: BlogPostDocument) => (
          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              onClick={() => onEdit(post)}
              className="text-xs px-2 py-1 h-auto"
            >
              {UI_LABELS.ACTIONS.EDIT}
            </Button>
            <Button
              variant="ghost"
              onClick={() => onDelete(post)}
              className="text-xs px-2 py-1 h-auto text-red-600 hover:text-red-700 dark:text-red-400"
            >
              {UI_LABELS.ACTIONS.DELETE}
            </Button>
          </div>
        ),
      },
    ],
  };
}
