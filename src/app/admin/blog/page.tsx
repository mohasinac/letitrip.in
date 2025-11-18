"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  FileText,
  Star,
  Home,
  Calendar,
  TrendingUp,
  Heart,
} from "lucide-react";
import { ViewToggle } from "@/components/seller/ViewToggle";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  BulkActionBar,
  TableCheckbox,
  UnifiedFilterSidebar,
} from "@/components/common/inline-edit";
import { blogService, type BlogPost } from "@/services/blog.service";
import { BLOG_FILTERS } from "@/constants/filters";
import { getBlogBulkActions } from "@/constants/bulk-actions";
import { useIsMobile } from "@/hooks/useMobile";

export default function AdminBlogPage() {
  const { user, isAdmin } = useAuth();
  const isMobile = useIsMobile();
  const [view, setView] = useState<"grid" | "table">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const limit = 20;

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
  });

  useEffect(() => {
    if (user && isAdmin) {
      loadPosts();
    }
  }, [user, isAdmin, searchQuery, filterValues, currentPage]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await blogService.list({
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        ...filterValues,
      });

      const data = Array.isArray(response) ? response : response.data || [];
      setPosts(data);
      setTotalPages(
        Array.isArray(response) ? 1 : Math.ceil((response.count || 0) / limit)
      );
      setTotalPosts(
        Array.isArray(response) ? data.length : response.count || 0
      );

      // Calculate stats
      setStats({
        total: totalPosts,
        published: data.filter((p: any) => p.status === "published").length,
        draft: data.filter((p: any) => p.status === "draft").length,
        archived: data.filter((p: any) => p.status === "archived").length,
      });
    } catch (error) {
      console.error("Failed to load blog posts:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load blog posts"
      );
    } finally {
      setLoading(false);
    }
  };

  const bulkActions = getBlogBulkActions(selectedIds.length);

  const handleBulkAction = async (actionId: string) => {
    try {
      setActionLoading(true);

      await Promise.all(
        selectedIds.map(async (id) => {
          const post = posts.find((p) => p.id === id);
          if (!post) return;

          switch (actionId) {
            case "publish":
              await blogService.update(id, { status: "published" });
              break;
            case "draft":
              await blogService.update(id, { status: "draft" });
              break;
            case "archive":
              await blogService.update(id, { status: "archived" as any });
              break;
            case "feature":
              await blogService.update(id, { featured: true });
              break;
            case "unfeature":
              await blogService.update(id, { featured: false });
              break;
            case "delete":
              await blogService.delete(id);
              break;
          }
        })
      );

      await loadPosts();
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk action failed:", error);
      alert("Failed to perform bulk action");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await blogService.delete(id);
      await loadPosts();
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete blog post");
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You must be an admin to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={loadPosts}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage blog posts and content ({totalPosts} total)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/blog/create"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Create Post
          </Link>
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Posts</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {stats.total}
              </p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="mt-1 text-2xl font-semibold text-green-600">
                {stats.published}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Drafts</p>
              <p className="mt-1 text-2xl font-semibold text-yellow-600">
                {stats.draft}
              </p>
            </div>
            <Edit className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Archived</p>
              <p className="mt-1 text-2xl font-semibold text-gray-600">
                {stats.archived}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search blog posts..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        {isMobile && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        )}
      </div>

      {/* Main Content with Sidebar Layout */}
      <div className="flex gap-6">
        {/* Desktop Filters */}
        {!isMobile && (
          <UnifiedFilterSidebar
            sections={BLOG_FILTERS}
            values={filterValues}
            onChange={(key, value) => {
              setFilterValues((prev) => ({
                ...prev,
                [key]: value,
              }));
            }}
            onApply={() => setCurrentPage(1)}
            onReset={() => {
              setFilterValues({});
              setCurrentPage(1);
            }}
            isOpen={false}
            onClose={() => {}}
            searchable={true}
            mobile={false}
            resultCount={totalPosts}
            isLoading={loading}
          />
        )}

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {/* Grid View */}
          {view === "grid" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="group relative rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {post.featuredImage && (
                    <div className="aspect-video bg-gray-100">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <StatusBadge status={post.status} />
                      <div className="flex gap-1">
                        {post.featured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="flex-1 rounded-lg bg-purple-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-purple-700"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bulk Action Bar */}
          {selectedIds.length > 0 && (
            <div className="sticky top-16 z-10 mb-4">
              <BulkActionBar
                selectedCount={selectedIds.length}
                actions={bulkActions}
                onAction={handleBulkAction}
                onClearSelection={() => setSelectedIds([])}
                loading={actionLoading}
                resourceName="post"
              />
            </div>
          )}

          {/* Table View */}
          {view === "table" && (
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="w-12 px-6 py-3">
                        <TableCheckbox
                          checked={
                            selectedIds.length === posts.length &&
                            posts.length > 0
                          }
                          indeterminate={
                            selectedIds.length > 0 &&
                            selectedIds.length < posts.length
                          }
                          onChange={(checked) => {
                            setSelectedIds(
                              checked ? posts.map((p) => p.id) : []
                            );
                          }}
                          aria-label="Select all posts"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Post
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <TableCheckbox
                            checked={selectedIds.includes(post.id)}
                            onChange={(checked) => {
                              setSelectedIds((prev) =>
                                checked
                                  ? [...prev, post.id]
                                  : prev.filter((id) => id !== post.id)
                              );
                            }}
                            aria-label={`Select ${post.title}`}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {post.featuredImage && (
                              <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                <img
                                  src={post.featuredImage}
                                  alt={post.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate max-w-xs">
                                {post.title}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {post.excerpt}
                              </div>
                              <div className="flex gap-1 mt-1">
                                {post.featured && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                                    <Star className="h-3 w-3" />
                                    Featured
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {post.author.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                            {post.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={post.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.views} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {post.likes} likes
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex flex-col gap-1">
                            <span>
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                            {post.publishedAt && (
                              <span className="text-xs text-gray-500">
                                Published:{" "}
                                {new Date(
                                  post.publishedAt
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin/blog/${post.id}/edit`}
                              className="rounded p-1.5 text-purple-600 hover:bg-purple-50"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteId(post.id)}
                              className="rounded p-1.5 text-red-600 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * limit + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * limit, totalPosts)}
                      </span>{" "}
                      of <span className="font-medium">{totalPosts}</span>{" "}
                      results
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {posts.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchQuery || Object.keys(filterValues).length > 0
                  ? "No blog posts found"
                  : "No blog posts yet"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || Object.keys(filterValues).length > 0
                  ? "Try adjusting your filters"
                  : "Get started by creating a new blog post"}
              </p>
              {!searchQuery && Object.keys(filterValues).length === 0 && (
                <Link
                  href="/admin/blog/create"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                  Create Post
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters */}
      {isMobile && (
        <UnifiedFilterSidebar
          sections={BLOG_FILTERS}
          values={filterValues}
          onChange={(key, value) => {
            setFilterValues((prev) => ({
              ...prev,
              [key]: value,
            }));
          }}
          onApply={() => {
            setShowFilters(false);
            setCurrentPage(1);
          }}
          onReset={() => {
            setFilterValues({});
            setCurrentPage(1);
          }}
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          searchable={true}
          mobile={true}
          resultCount={totalPosts}
          isLoading={loading}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Blog Post"
        description="Are you sure you want to delete this blog post? This action cannot be undone."
        onConfirm={() => {
          if (deleteId) handleDelete(deleteId);
        }}
        onClose={() => setDeleteId(null)}
        variant="danger"
        confirmLabel="Delete"
      />
    </div>
  );
}
