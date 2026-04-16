/**
 * BlogForm Component
 * Path: src/components/admin/blog/BlogForm.tsx
 *
 * Drawer form for creating/editing blog posts in admin panel.
 */

import { useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { BlogPostForm as AppkitBlogPostForm } from "@mohasinac/appkit/features/blog";
import { RichTextEditor } from "./RichTextEditor";
import { useMediaUpload } from "@mohasinac/appkit/features/media";
import { useMediaAbort } from "@mohasinac/appkit/features/media";
import { THEME_CONSTANTS } from "@/constants";
import { proseMirrorToHtml } from "@mohasinac/appkit/utils";

"use client";

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
  const onAbort = useMediaAbort();
  const contentImageIndexRef = useRef(0);
  const additionalImageIndexRef = useRef(0);

  const labels = useMemo(
    () => ({
      title: t("formTitle"),
      slug: t("formSlug"),
      excerpt: t("formExcerpt"),
      content: t("formContent"),
      coverImage: t("formCover"),
      coverImageHelper: t("formCoverHelper"),
      contentImages: t("formContentImages"),
      contentImagesHelper: t("formContentImagesHelper"),
      additionalImages: t("formAdditionalImages"),
      additionalImagesHelper: t("formAdditionalImagesHelper"),
      category: t("formCategory"),
      status: t("formStatus"),
      tags: t("formTags"),
      readTime: t("formReadTime"),
      featured: t("formFeatured"),
    }),
    [t],
  );

  useEffect(() => {
    contentImageIndexRef.current = post.contentImages?.length ?? 0;
    additionalImageIndexRef.current = post.additionalImages?.length ?? 0;
  }, [post.additionalImages?.length, post.contentImages?.length]);

  return (
    <AppkitBlogPostForm
      value={post}
      onChange={(next) => {
        const titleChanged = next.title !== post.title;
        if (titleChanged && next.title) {
          const slug = next.title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
          onChange({ ...next, slug } as BlogFormData);
          return;
        }

        onChange(next as BlogFormData);
      }}
      categoryOptions={categoryOptions}
      statusOptions={statusOptions}
      labels={labels}
      onUploadCover={(file) =>
        upload(file, "blog", true, {
          type: "blog-cover",
          title: post.title || "post",
          category: post.category || "news",
          index: 1,
        })
      }
      onUploadContentImage={(file) => {
        contentImageIndexRef.current += 1;
        return upload(file, "blog", true, {
          type: "blog-content-image",
          title: post.title || "post",
          category: post.category || "news",
          index: contentImageIndexRef.current,
        });
      }}
      onUploadAdditionalImage={(file) => {
        additionalImageIndexRef.current += 1;
        return upload(file, "blog", true, {
          type: "blog-additional-image",
          title: post.title || "post",
          category: post.category || "news",
          index: additionalImageIndexRef.current,
        });
      }}
      onAbort={onAbort}
      isReadonly={isReadonly}
      renderContentField={({ value, onChange, isReadonly: readonly }) =>
        readonly ? (
          <div
            className="min-h-[200px] border rounded-md p-3 opacity-60 prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: proseMirrorToHtml(value || ""),
            }}
          />
        ) : (
          <RichTextEditor
            content={value || ""}
            onChange={onChange}
            placeholder="Write your blog post content..."
            minHeight="300px"
            imageUploadConfig={{
              folder: "blog",
              context: {
                type: "rich-text-image",
                entity: "blog-content",
                name: post.title || "post",
              },
            }}
          />
        )
      }
    />
  );
}

