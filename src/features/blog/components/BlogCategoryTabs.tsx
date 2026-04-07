"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { SectionTabs } from "@/components";
import type { SectionTab } from "@/components";
import type { BlogPostCategory } from "@/db/schema";

interface BlogCategoryTabsProps {
  activeCategory: "" | BlogPostCategory;
  onChange: (key: "" | BlogPostCategory) => void;
}

export function BlogCategoryTabs({
  activeCategory,
  onChange,
}: BlogCategoryTabsProps) {
  const t = useTranslations("filters");
  const tabs: SectionTab[] = useMemo(
    () => [
      { value: "", label: t("blogCategoryAll") },
      { value: "news", label: t("blogCategoryNews") },
      { value: "tips", label: t("blogCategoryTips") },
      { value: "guides", label: t("blogCategoryGuides") },
      { value: "updates", label: t("blogCategoryUpdates") },
      { value: "community", label: t("blogCategoryCommunity") },
    ],
    [t],
  );

  return (
    <SectionTabs
      inline
      value={activeCategory}
      onChange={(v) => onChange(v as "" | BlogPostCategory)}
      tabs={tabs}
      className="mb-8"
    />
  );
}
