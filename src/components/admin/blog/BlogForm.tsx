/**
 * BlogForm Component
 * Path: src/components/admin/blog/BlogForm.tsx
 *
 * Drawer form for creating/editing blog posts in admin panel.
 */

"use client";

import { useTranslations } from "next-intl";
import { FormField, Checkbox, RichTextEditor, ImageUpload } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import type {
  BlogPostDocument,
  BlogPostCategory,
  BlogPostStatus,
} from "@/db/schema";

const { spacing, typography, themed } = THEME_CONSTANTS;

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
  const t = useTranslations("adminBlog");
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
        label={t("formTitle")}
        type="text"
        value={post.title || ""}
        onChange={handleTitleChange}
        disabled={isReadonly}
        required
      />

      <FormField
        name="slug"
        label={t("formSlug")}
        type="text"
        value={post.slug || ""}
        onChange={(value) => update({ slug: value })}
        disabled={isReadonly}
        required
      />

      <FormField
        name="excerpt"
        label={t("formExcerpt")}
        type="textarea"
        rows={3}
        value={post.excerpt || ""}
        onChange={(value) => update({ excerpt: value })}
        disabled={isReadonly}
        required
      />

      {/* Content — rich text editor */}
      <div>
        <label
          className={`block text-sm font-medium ${themed.textSecondary} mb-1`}
        >
          {t("formContent")}
          <span className="text-red-500 ml-1">*</span>
        </label>
        {isReadonly ? (
          <div
            className="min-h-[200px] border rounded-md p-3 opacity-60 prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />
        ) : (
          <RichTextEditor
            content={post.content || ""}
            onChange={(content) => update({ content })}
            placeholder="Write your blog post content..."
            minHeight="300px"
          />
        )}
      </div>

      {/* Cover image upload */}
      {!isReadonly && (
        <ImageUpload
          currentImage={post.coverImage}
          onUpload={(url) => update({ coverImage: url })}
          folder="blog"
          label={t("formCover")}
          helperText="Recommended: 1200x630px (16:9)"
        />
      )}
      {isReadonly && post.coverImage && (
        <div>
          <label
            className={`block text-sm font-medium ${themed.textSecondary} mb-1`}
          >
            {t("formCover")}
          </label>
          <p className={`text-sm ${themed.textSecondary} truncate`}>
            {post.coverImage}
          </p>
        </div>
      )}

      <FormField
        name="category"
        label={t("formCategory")}
        type="select"
        value={post.category || "news"}
        onChange={(value) => update({ category: value as BlogPostCategory })}
        disabled={isReadonly}
        options={CATEGORY_OPTIONS}
        required
      />

      <FormField
        name="status"
        label={t("formStatus")}
        type="select"
        value={post.status || "draft"}
        onChange={(value) => update({ status: value as BlogPostStatus })}
        disabled={isReadonly}
        options={STATUS_OPTIONS}
        required
      />

      <FormField
        name="tags"
        label={t("formTags")}
        type="text"
        value={(post.tags || []).join(", ")}
        onChange={(value) =>
          update({
            tags: value
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
          })
        }
        disabled={isReadonly}
      />

      <FormField
        name="readTimeMinutes"
        label={t("formReadTime")}
        type="number"
        value={String(post.readTimeMinutes ?? 5)}
        onChange={(value) =>
          update({ readTimeMinutes: parseInt(value, 10) || 5 })
        }
        disabled={isReadonly}
      />

      <Checkbox
        label={t("formFeatured")}
        checked={post.isFeatured || false}
        onChange={(e) => update({ isFeatured: e.target.checked })}
        disabled={isReadonly}
      />
    </div>
  );
}
