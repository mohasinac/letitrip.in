/**
 * BlogForm Component
 * Path: src/components/admin/blog/BlogForm.tsx
 *
 * Drawer form for creating/editing blog posts in admin panel.
 */

"use client";

import { FormField } from "@/components";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import type {
  BlogPostDocument,
  BlogPostCategory,
  BlogPostStatus,
} from "@/db/schema";

const LABELS = UI_LABELS.ADMIN.BLOG;
const { spacing } = THEME_CONSTANTS;

export type BlogFormData = Partial<
  Omit<BlogPostDocument, "id" | "createdAt" | "updatedAt" | "views">
>;

interface BlogFormProps {
  post: BlogFormData;
  onChange: (updated: BlogFormData) => void;
  isReadonly?: boolean;
}

const CATEGORY_OPTIONS: { value: BlogPostCategory; label: string }[] = [
  { value: "news", label: "News" },
  { value: "tips", label: "Tips & Tricks" },
  { value: "guides", label: "Guides" },
  { value: "updates", label: "Updates" },
  { value: "community", label: "Community" },
];

const STATUS_OPTIONS: { value: BlogPostStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export function BlogForm({
  post,
  onChange,
  isReadonly = false,
}: BlogFormProps) {
  const update = (partial: BlogFormData) => onChange({ ...post, ...partial });

  const handleTitleChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    update({ title: value, slug });
  };

  return (
    <div className={spacing.stack}>
      {/* Title — auto-generates slug */}
      <FormField
        name="title"
        label={LABELS.FORM_TITLE}
        type="text"
        value={post.title || ""}
        onChange={handleTitleChange}
        disabled={isReadonly}
        required
      />

      <FormField
        name="slug"
        label={LABELS.FORM_SLUG}
        type="text"
        value={post.slug || ""}
        onChange={(value) => update({ slug: value })}
        disabled={isReadonly}
        required
      />

      <FormField
        name="excerpt"
        label={LABELS.FORM_EXCERPT}
        type="textarea"
        rows={3}
        value={post.excerpt || ""}
        onChange={(value) => update({ excerpt: value })}
        disabled={isReadonly}
        required
      />

      <FormField
        name="content"
        label={LABELS.FORM_CONTENT}
        type="textarea"
        rows={8}
        value={post.content || ""}
        onChange={(value) => update({ content: value })}
        disabled={isReadonly}
        required
      />

      <FormField
        name="coverImage"
        label={LABELS.FORM_COVER}
        type="text"
        value={post.coverImage || ""}
        onChange={(value) => update({ coverImage: value })}
        disabled={isReadonly}
      />

      <FormField
        name="category"
        label={LABELS.FORM_CATEGORY}
        type="select"
        value={post.category || "news"}
        onChange={(value) => update({ category: value as BlogPostCategory })}
        disabled={isReadonly}
        options={CATEGORY_OPTIONS}
        required
      />

      <FormField
        name="status"
        label={LABELS.FORM_STATUS}
        type="select"
        value={post.status || "draft"}
        onChange={(value) => update({ status: value as BlogPostStatus })}
        disabled={isReadonly}
        options={STATUS_OPTIONS}
        required
      />

      <FormField
        name="tags"
        label={LABELS.FORM_TAGS}
        type="text"
        value={(post.tags || []).join(", ")}
        onChange={(value) =>
          update({
            tags: value
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          })
        }
        disabled={isReadonly}
      />

      <FormField
        name="readTimeMinutes"
        label={LABELS.READ_TIME}
        type="number"
        value={String(post.readTimeMinutes ?? 5)}
        onChange={(value) =>
          update({ readTimeMinutes: parseInt(value, 10) || 5 })
        }
        disabled={isReadonly}
      />

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={post.isFeatured || false}
          onChange={(e) => update({ isFeatured: e.target.checked })}
          disabled={isReadonly}
          className="w-4 h-4 text-indigo-600 rounded"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {LABELS.FORM_FEATURED}
        </span>
      </label>
    </div>
  );
}
