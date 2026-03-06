"use client";

import { Button, HorizontalScroller } from "@/components";
import type { BlogPostCategory } from "@/db/schema";

export const BLOG_CATEGORY_TABS: {
  key: "" | BlogPostCategory;
  label: string;
}[] = [
  { key: "", label: "All" },
  { key: "news", label: "News" },
  { key: "tips", label: "Tips" },
  { key: "guides", label: "Guides" },
  { key: "updates", label: "Updates" },
  { key: "community", label: "Community" },
];

interface BlogCategoryTabsProps {
  activeCategory: "" | BlogPostCategory;
  onChange: (key: "" | BlogPostCategory) => void;
}

export function BlogCategoryTabs({
  activeCategory,
  onChange,
}: BlogCategoryTabsProps) {
  return (
    <HorizontalScroller
      items={BLOG_CATEGORY_TABS}
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
