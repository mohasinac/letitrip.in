/**
 * @fileoverview React Component
 * @module src/app/admin/blog/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { blogService } from "@/services/blog.service";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values/DateDisplay";
import OptimizedImage from "@/components/common/OptimizedImage";
import { FileText, Eye } from "lucide-react";
import { getBlogBulkActions } from "@/constants/bulk-actions";
import { toInlineFields } from "@/constants/form-fields";
// BlogPost type doesn't exist yet, using any temporarily
/**
 * BlogPost type
 * 
 * @typedef {Object} BlogPost
 * @description Type definition for BlogPost
 */
type BlogPost = any;

// Blog fields configuration
const BLOG_FIELDS = [
  { key: "title", name: "title", label: "Title", type: "text", required: true },
  {
    /** Key */
    key: "status",
    /** Name */
    name: "status",
    /** Label */
    label: "Status",
    /** Type */
    type: "select",
    /** Required */
    required: true,
    /** Options */
    options: [
      { value: "published", label: "Published" },
      { value: "draft", label: "Draft" },
      { value: "archived", label: "Archived" },
    ],
  },
  {
    /** Key */
    key: "category",
    /** Name */
    name: "category",
    /** Label */
    label: "Category",
    /** Type */
    type: "text",
    /** Required */
    required: false,
  },
];

export default function AdminBlogPage() {
  // Define columns
  const columns = [
    {
      /** Key */
      key: "post",
      /** Label */
      label: "Post",
      /** Render */
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
      /** Key */
      key: "author",
      /** Label */
      label: "Author",
      /** Render */
      render: (post: BlogPost) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {post.author?.name || "Unknown"}
        </div>
      ),
    },
    {
      /** Key */
      key: "category",
      /** Label */
      label: "Category",
      /** Render */
      render: (post: BlogPost) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {post.category || "Uncategorized"}
        </div>
      ),
    },
    {
      /** Key */
      key: "views",
      /** Label */
      label: "Views",
      /** Render */
      render: (post: BlogPost) => (
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <Eye className="w-4 h-4" />
          {post.views || 0}
        </div>
      ),
    },
    {
      /** Key */
      key: "status",
      /** Label */
      label: "Status",
      /** Render */
      render: (post: BlogPost) => (
        <StatusBadge status={post.status || "draft"} />
      ),
    },
    {
      /** Key */
      key: "published",
      /** Label */
      label: "Published",
      /** Render */
      render: (post: BlogPost) =>
        post.publishedAt ? (
          <DateDisplay date={new Date(post.publishedAt)} format="short" />
        ) : (
          <span className="text-sm text-gray-400">Not published</span>
        ),
    },
    {
      /** Key */
      key: "created",
      /** Label */
      label: "Created",
      /** Render */
      render: (post: BlogPost) => (
        <DateDisplay date={post.createdAt} format="medium" />
      ),
    },
  ];

  // Define filters
  const filters = [
    {
      /** Key */
      key: "status",
      /** Label */
      label: "Status",
      /** Type */
      type: "select" as const,
      /** Options */
      options: [
        { value: "all", label: "All Status" },
        { value: "published", label: "Published" },
        { value: "draft", label: "Draft" },
        { value: "archived", label: "Archived" },
      ],
    },
    {
      /** Key */
      key: "category",
      /** Label */
      label: "Category",
      /** Type */
      type: "select" as const,
      /** Options */
      options: [
        { value: "all", label: "All Categories" },
        { value: "news", label: "News" },
        { value: "tutorials", label: "Tutorials" },
        { value: "updates", label: "Updates" },
      ],
    },
  ];

  // Load data function
  /**
   * Performs async operation
   *
   * @param {{
    cursor} [options] - Configuration options
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadData = async (options: {
    /** Cursor */
    cursor: string | null;
    /** Search */
    search?: string;
    /** Filters */
    filters?: Record<string, string>;
  }) => {
    const apiFilters: any = {
      /** Page */
      page: options.cursor ? parseInt(options.cursor) : 1,
      /** Limit */
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
      /** Items */
      items: (response.data || []) as BlogPost[],
      /** Next Cursor */
      nextCursor: currentPage < totalPages ? String(currentPage + 1) : null,
      /** Has Next Page */
      hasNextPage: currentPage < totalPages,
    };
  };

  // Handle save
  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   * @param {Partial<BlogPost>} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   * @param {Partial<BlogPost>} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleSave = async (id: string, data: Partial<BlogPost>) => {
    await blogService.update(id, data);
  };

  // Handle delete
  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleDelete = async (id: string) => {
    await blogService.delete(id);
  };

  return (
    <AdminResourcePage<BlogPost>
      resourceName="Blog Post"
      resourceNamePlural="Blog Posts"
      loadData={loadData}
      columns={columns}
      fields={toInlineFields(BLOG_FIELDS as any)}
      bulkActions={getBlogBulkActions(0)}
      onSave={handleSave}
      onDelete={handleDelete}
      filters={filters}
    />
  );
}
