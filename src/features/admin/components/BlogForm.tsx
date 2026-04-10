/**
 * BlogForm Component
 * Path: src/components/admin/blog/BlogForm.tsx
 *
 * Drawer form for creating/editing blog posts in admin panel.
 */

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Checkbox, FormField, FormFieldSpan, FormGroup } from "@/components";
import { Label, Span, Text } from "@mohasinac/appkit/ui";
import { TagInput } from "@mohasinac/appkit/ui";
import { RichTextEditor } from "./RichTextEditor";
import { useMediaUpload } from "@/hooks";
import { THEME_CONSTANTS } from "@/constants";
import { proseMirrorToHtml } from "@/utils";
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

export function BlogForm({
  post,
  onChange,
  isReadonly = false,
}: BlogFormProps) {
  const t = useTranslations("adminBlog");
  const categoryOptions = useMemo(
    () => [
      { value: "news" as BlogPostCategory, label: t("category_news") },
      { value: "tips" as BlogPostCategory, label: t("category_tips") },
      { value: "guides" as BlogPostCategory, label: t("category_guides") },
      { value: "updates" as BlogPostCategory, label: t("category_updates") },
      {
        value: "community" as BlogPostCategory,
        label: t("category_community"),
      },
    ],
    [t],
  );
  const statusOptions = useMemo(
    () => [
      { value: "draft" as BlogPostStatus, label: t("status_draft") },
      { value: "published" as BlogPostStatus, label: t("status_published") },
      { value: "archived" as BlogPostStatus, label: t("status_archived") },
    ],
    [t],
  );
  const { upload } = useMediaUpload();
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
      {/* Title + Slug — side by side on wider screens */}
      <FormGroup columns={2}>
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
      </FormGroup>

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
        <Label
          className={`block text-sm font-medium ${themed.textSecondary} mb-1.5`}
        >
          {t("formContent")}
          <Span className="text-red-500 dark:text-red-400 ml-1">*</Span>
        </Label>
        {isReadonly ? (
          <div
            className="min-h-[200px] border rounded-md p-3 opacity-60 prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: proseMirrorToHtml(post.content || ""),
            }}
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

      {/* Cover image — uses FormField type="image" */}
      {!isReadonly ? (
        <FormField
          name="coverImage"
          label={t("formCover")}
          type="image"
          value={post.coverImage || ""}
          onChange={(url) => update({ coverImage: url })}
          onUpload={(file) =>
            upload(file, "blog", true, {
              type: "blog-image",
              title: post.title || "post",
              category: post.category || "news",
            })
          }
          helpText="Recommended: 1200x630px (16:9)"
        />
      ) : (
        post.coverImage && (
          <div>
            <Label
              className={`block text-sm font-medium ${themed.textSecondary} mb-1.5`}
            >
              {t("formCover")}
            </Label>
            <Text size="sm" variant="secondary" className="truncate">
              {post.coverImage}
            </Text>
          </div>
        )
      )}

      {/* Category + Status — side by side */}
      <FormGroup columns={2}>
        <FormField
          name="category"
          label={t("formCategory")}
          type="select"
          value={post.category || "news"}
          onChange={(value) => update({ category: value as BlogPostCategory })}
          disabled={isReadonly}
          options={categoryOptions}
          required
        />

        <FormField
          name="status"
          label={t("formStatus")}
          type="select"
          value={post.status || "draft"}
          onChange={(value) => update({ status: value as BlogPostStatus })}
          disabled={isReadonly}
          options={statusOptions}
          required
        />
      </FormGroup>

      {/* Tags + Read time — side by side */}
      <FormGroup columns={2}>
        <TagInput
          label={t("formTags")}
          value={post.tags ?? []}
          onChange={(tags) => update({ tags })}
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
      </FormGroup>

      <Checkbox
        label={t("formFeatured")}
        checked={post.isFeatured || false}
        onChange={(e) => update({ isFeatured: e.target.checked })}
        disabled={isReadonly}
      />
    </div>
  );
}
