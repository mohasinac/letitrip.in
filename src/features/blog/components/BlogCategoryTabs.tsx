"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  BlogCategoryTabs as AppkitBlogCategoryTabs,
  type BlogPostCategory,
} from "@mohasinac/appkit/features/blog";

interface BlogCategoryTabsProps {
  activeCategory: "" | BlogPostCategory;
  onChange: (key: "" | BlogPostCategory) => void;
}

export function BlogCategoryTabs({
  activeCategory,
  onChange,
}: BlogCategoryTabsProps) {
  const t = useTranslations("filters");
  const categories = useMemo<BlogPostCategory[]>(
    () => ["news", "tips", "guides", "updates", "community"],
    [],
  );

  return (
    <div className="mb-8">
      <AppkitBlogCategoryTabs
        categories={categories}
        active={activeCategory || null}
        onSelect={(v) => onChange((v ?? "") as "" | BlogPostCategory)}
        labels={{
          all: t("blogCategoryAll"),
          news: t("blogCategoryNews"),
          tips: t("blogCategoryTips"),
          guides: t("blogCategoryGuides"),
          updates: t("blogCategoryUpdates"),
          community: t("blogCategoryCommunity"),
        }}
      />
    </div>
  );
}
