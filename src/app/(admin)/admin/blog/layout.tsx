"use client";

import { TabNav } from "@/components/navigation/TabNav";
import { ADMIN_BLOG_TABS } from "@/constants/tabs";

export default function AdminBlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Blog Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Blog Management
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Create and manage blog posts, categories, and tags.
        </p>
      </div>

      {/* Tab Navigation */}
      <TabNav tabs={ADMIN_BLOG_TABS} />

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
