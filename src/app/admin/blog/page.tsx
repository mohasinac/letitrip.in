"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { blogService } from "@/services/blog.service";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values";
import OptimizedImage from "@/components/common/OptimizedImage";
import { FileText, Eye } from "lucide-react";
import { getBlogBulkActions } from "@/constants/bulk-actions";
import { toInlineFields } from "@/constants/form-fields";
import type { BlogPost } from "@/types/frontend/blog.types";

// Blog fields configuration
const BLOG_FIELDS = [
  { name: "title", label: "Title", type: "text", required: true },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "published", label: "Published" },
      { value: "draft", label: "Draft" },
      { value: "archived", label: "Archived" },
    ],
  },
  { name: "category", label: "Category", type: "text", required: false },
];

export default function AdminBlogPage() {
  // Define columns
  const columns = [
    {
      key: "post",
      label: "Post",
      render: (post: BlogPost) => (
        <div className="flex items-center gap-3">
          {post.featuredImage ? (
            <OptimizedImage
              src={post.featuredImage}
              alt={post.title}
              width={80}
              height={60}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-[60px] rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {post.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {post.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "author",
      label: "Author",
      render: (post: BlogPost) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {post.author?.name || "Unknown"}
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (post: BlogPost) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {post.category || "Uncategorized"}
        </div>
      ),
    },
    {
      key: "views",
      label: "Views",
      render: (post: BlogPost) => (
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <Eye className="w-4 h-4" />
          {post.views || 0}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (post: BlogPost) => (
        <StatusBadge
          status={post.status || "draft"}
          label={post.status || "draft"}
        />
      ),
    },
    {
      key: "published",
      label: "Published",
      render: (post: BlogPost) =>
        post.publishedAt ? (
          <DateDisplay date={new Date(post.publishedAt)} format="short" />
        ) : (
          <span className="text-sm text-gray-400">Not published</span>
        ),
    },
    {
      key: "created",
      label: "Created",
      render: (post: BlogPost) => (
        <DateDisplay date={new Date(post.createdAt)} format="relative" />
      ),
    },
  ];

  // Define filters
  const filters = [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "all", label: "All Status" },
        { value: "published", label: "Published" },
        { value: "draft", label: "Draft" },
        { value: "archived", label: "Archived" },
      ],
    },
    {
      key: "category",
      label: "Category",
      type: "select" as const,
      options: [
        { value: "all", label: "All Categories" },
        { value: "news", label: "News" },
        { value: "tutorials", label: "Tutorials" },
        { value: "updates", label: "Updates" },
      ],
    },
  ];

  // Load data function
  const loadData = async (options: {
    cursor: string | null;
    search?: string;
    filters?: Record<string, string>;
  }) => {
    const apiFilters: any = {
      page: options.cursor ? parseInt(options.cursor) : 1,
      limit: 20,
    };

    if (options.filters?.status && options.filters.status !== "all") {
      apiFilters.status = options.filters.status;
    }
    if (options.filters?.category && options.filters.category !== "all") {
      apiFilters.category = options.filters.category;
    }
    if (options.search) {
      apiFilters.search = options.search;
    }

    const response = await blogService.list(apiFilters);
    const currentPage = apiFilters.page;
    const totalPages = Math.ceil((response.count || 0) / 20);

    return {
      items: (response.data || []) as BlogPost[],
      nextCursor: currentPage < totalPages ? String(currentPage + 1) : null,
      hasNextPage: currentPage < totalPages,
    };
  };

  // Handle save
  const handleSave = async (id: string, data: Partial<BlogPost>) => {
    await blogService.update(id, data);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    await blogService.delete(id);
  };

  return (
    <AdminResourcePage<BlogPost>
      resourceName="Blog Post"
      resourceNamePlural="Blog Posts"
      loadData={loadData}
      columns={columns}
      fields={toInlineFields(BLOG_FIELDS)}
      bulkActions={getBlogBulkActions(0)}
      onSave={handleSave}
      onDelete={handleDelete}
      filters={filters}
    />
  );
}
