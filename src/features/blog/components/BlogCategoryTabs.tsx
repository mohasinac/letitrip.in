"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button, HorizontalScroller } from "@/components";
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
  const tabs = useMemo(
    () => [
      { key: "" as "" | BlogPostCategory, label: t("blogCategoryAll") },
      { key: "news" as BlogPostCategory, label: t("blogCategoryNews") },
      { key: "tips" as BlogPostCategory, label: t("blogCategoryTips") },
      { key: "guides" as BlogPostCategory, label: t("blogCategoryGuides") },
      { key: "updates" as BlogPostCategory, label: t("blogCategoryUpdates") },
      {
        key: "community" as BlogPostCategory,
        label: t("blogCategoryCommunity"),
      },
    ],
    [t],
  );

  return (
    <HorizontalScroller
      items={tabs}
      renderItem={(tab) => (
        <Button
          variant={activeCategory === tab.key ? "primary" : "outline"}
          onClick={() => onChange(tab.key)}
          className="text-sm whitespace-nowrap"
        >
          {tab.label}
        </Button>
      )}
      keyExtractor={(tab) => tab.key}
      gap={8}
      autoScroll={false}
      className="mb-8 px-5"
    />
  );
}
