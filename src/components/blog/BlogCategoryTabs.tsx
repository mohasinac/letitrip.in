"use client";

import { Button } from "@/components/ui";
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
    <div className="flex gap-2 flex-wrap mb-8">
      {BLOG_CATEGORY_TABS.map((tab) => (
        <Button
          key={tab.key}
          variant={activeCategory === tab.key ? "primary" : "outline"}
          onClick={() => onChange(tab.key)}
          className="text-sm"
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
