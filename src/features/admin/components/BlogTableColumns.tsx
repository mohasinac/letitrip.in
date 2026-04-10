/**
 * BlogTableColumns
 * Path: src/components/admin/blog/BlogTableColumns.tsx
 *
 * Column definitions for the admin Blog DataTable.
 * Uses useTranslations (next-intl) — no UI_LABELS in JSX (Rule 2).
 */

"use client";

import { THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import { Caption, Span, Text } from "@mohasinac/appkit/ui";
import { RowActionMenu } from "@/components";
import { useTranslations } from "next-intl";
import type { BlogPostDocument } from "@/db/schema";

const { themed } = THEME_CONSTANTS;

const STATUS_STYLES: Record<string, string> = {
  published:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  draft:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  archived: "bg-zinc-100 text-zinc-700 dark:bg-slate-800 dark:text-zinc-400",
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

export function useBlogTableColumns(
  onEdit: (post: BlogPostDocument) => void,
  onDelete: (post: BlogPostDocument) => void,
) {
  const t = useTranslations("adminBlog");
  const tActions = useTranslations("actions");

  return {
    columns: [
      {
        key: "title",
        header: t("formTitle"),
        sortable: true,
        width: "30%",
        render: (post: BlogPostDocument) => (
          <div>
            <Text size="sm" weight="medium" className="truncate max-w-[220px]">
              {post.title}
            </Text>
            <Caption className="font-mono">/{post.slug}</Caption>
          </div>
        ),
      },
      {
        key: "category",
        header: t("formCategory"),
        sortable: true,
        width: "12%",
        render: (post: BlogPostDocument) => (
          <Span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_STYLES[post.category] ?? ""}`}
          >
            {post.category}
          </Span>
        ),
      },
      {
        key: "status",
        header: t("formStatus"),
        sortable: true,
        width: "12%",
        render: (post: BlogPostDocument) => (
          <Span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[post.status] ?? ""}`}
          >
            {post.status}
          </Span>
        ),
      },
      {
        key: "isFeatured",
        header: t("formFeatured"),
        width: "8%",
        render: (post: BlogPostDocument) =>
          post.isFeatured ? (
            <Span className="text-yellow-500 text-base">★</Span>
          ) : (
            <Span className={`text-xs ${themed.textSecondary}`}>—</Span>
          ),
      },
      {
        key: "authorName",
        header: t("author"),
        width: "14%",
        render: (post: BlogPostDocument) => (
          <Text
            size="sm"
            variant="secondary"
            className="truncate max-w-[100px]"
          >
            {post.authorName}
          </Text>
        ),
      },
      {
        key: "publishedAt",
        header: t("publishedOn"),
        sortable: true,
        width: "12%",
        render: (post: BlogPostDocument) => (
          <Text size="sm" variant="secondary">
            {post.publishedAt ? formatDate(post.publishedAt) : "—"}
          </Text>
        ),
      },
      {
        key: "views",
        header: t("views"),
        sortable: true,
        width: "8%",
        render: (post: BlogPostDocument) => (
          <Text size="sm" variant="secondary">
            {post.views}
          </Text>
        ),
      },
      {
        key: "actions",
        header: "",
        width: "8%",
        render: (post: BlogPostDocument) => (
          <RowActionMenu
            align="right"
            actions={[
              { label: tActions("edit"), onClick: () => onEdit(post) },
              {
                label: tActions("delete"),
                onClick: () => onDelete(post),
                destructive: true,
                separator: true,
              },
            ]}
          />
        ),
      },
    ],
  };
}
