"use client";

import { useState, use, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import {
  API_ENDPOINTS,
  ROUTES,
  SUCCESS_MESSAGES,
  THEME_CONSTANTS,
} from "@/constants";
import { useTranslations } from "next-intl";
import {
  Card,
  Button,
  SideDrawer,
  DataTable,
  AdminPageHeader,
  DrawerFormFooter,
  ConfirmDeleteModal,
  getBlogTableColumns,
  BlogForm,
} from "@/components";
import type { BlogPostDocument } from "@/db/schema";
import type { BlogFormData } from "@/components";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

const { themed, typography } = THEME_CONSTANTS;

const DEFAULT_FORM: BlogFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "news",
  tags: [],
  isFeatured: false,
  status: "draft",
  readTimeMinutes: 5,
};

export default function AdminBlogPage({ params }: PageProps) {
  const { action } = use(params);
  const router = useRouter();
  const t = useTranslations("adminBlog");
  const tLoading = useTranslations("loading");
  const { showSuccess, showError } = useMessage();

  const [statusFilter, setStatusFilter] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostDocument | null>(null);
  const [formData, setFormData] = useState<BlogFormData>(DEFAULT_FORM);
  const [deleteTarget, setDeleteTarget] = useState<BlogPostDocument | null>(
    null,
  );
  const initialFormRef = useRef<string>("");

  const { data, isLoading, error, refetch } = useApiQuery<{
    posts: BlogPostDocument[];
    meta: {
      total: number;
      published: number;
      drafts: number;
      featured: number;
      filteredTotal: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasMore: boolean;
    };
  }>({
    queryKey: ["admin", "blog", statusFilter],
    queryFn: () => {
      const filtersParam = statusFilter
        ? `?filters=${encodeURIComponent(`status==${statusFilter}`)}&pageSize=200`
        : "?pageSize=200";
      return apiClient.get(`${API_ENDPOINTS.ADMIN.BLOG}${filtersParam}`);
    },
  });

  const createMutation = useApiMutation<BlogPostDocument, BlogFormData>({
    mutationFn: (data) => apiClient.post(API_ENDPOINTS.ADMIN.BLOG, data),
  });

  const updateMutation = useApiMutation<
    BlogPostDocument,
    { id: string; data: BlogFormData }
  >({
    mutationFn: ({ id, data }) =>
      apiClient.patch(API_ENDPOINTS.ADMIN.BLOG_BY_ID(id), data),
  });

  const deleteMutation = useApiMutation<void, string>({
    mutationFn: (id) => apiClient.delete(API_ENDPOINTS.ADMIN.BLOG_BY_ID(id)),
  });

  const allPosts: BlogPostDocument[] = data?.posts || [];

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== initialFormRef.current;
  }, [formData]);

  const openCreate = useCallback(() => {
    setEditingPost(null);
    setFormData(DEFAULT_FORM);
    initialFormRef.current = JSON.stringify(DEFAULT_FORM);
    setIsDrawerOpen(true);
    router.push(`${ROUTES.ADMIN.BLOG}/new`, { scroll: false });
  }, [router]);

  const openEdit = useCallback(
    (post: BlogPostDocument) => {
      const fd: BlogFormData = {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        category: post.category,
        tags: post.tags,
        isFeatured: post.isFeatured,
        status: post.status,
        readTimeMinutes: post.readTimeMinutes,
        authorName: post.authorName,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
      };
      setEditingPost(post);
      setFormData(fd);
      initialFormRef.current = JSON.stringify(fd);
      setIsDrawerOpen(true);
      router.push(`${ROUTES.ADMIN.BLOG}/edit/${post.id}`, { scroll: false });
    },
    [router],
  );

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setEditingPost(null);
    setFormData(DEFAULT_FORM);
    router.push(ROUTES.ADMIN.BLOG, { scroll: false });
  }, [router]);

  const handleSave = useCallback(async () => {
    try {
      if (editingPost) {
        await updateMutation.mutate({ id: editingPost.id, data: formData });
        showSuccess(SUCCESS_MESSAGES.BLOG.UPDATED);
      } else {
        await createMutation.mutate(formData);
        showSuccess(SUCCESS_MESSAGES.BLOG.CREATED);
      }
      closeDrawer();
      refetch();
    } catch {
      showError(editingPost ? t("edit") : t("create"));
    }
  }, [
    editingPost,
    formData,
    createMutation,
    updateMutation,
    closeDrawer,
    refetch,
    showSuccess,
    showError,
  ]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutate(deleteTarget.id);
      showSuccess(SUCCESS_MESSAGES.BLOG.DELETED);
      setDeleteTarget(null);
      refetch();
    } catch {
      showError(t("delete"));
    }
  }, [deleteTarget, deleteMutation, refetch, showSuccess, showError]);

  const isSaving = createMutation.isLoading || updateMutation.isLoading;
  const isDeleting = deleteMutation.isLoading;
  const STATUS_TABS = [
    { key: "", label: t("filterAll") },
    { key: "draft", label: t("filterDraft") },
    { key: "published", label: t("filterPublished") },
    { key: "archived", label: t("filterArchived") },
  ];

  const drawerTitle = editingPost ? t("edit") : t("create");

  const { columns } = getBlogTableColumns(openEdit, (post) =>
    setDeleteTarget(post),
  );

  // Stats
  const totalPosts = data?.meta.total ?? 0;
  const publishedCount = data?.meta.published ?? 0;
  const draftsCount = data?.meta.drafts ?? 0;
  const featuredCount = data?.meta.featured ?? 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("title")}
        subtitle={`${t("subtitle")} — ${totalPosts} total`}
        actionLabel={t("create")}
        onAction={openCreate}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("totalPosts"), value: totalPosts },
          { label: t("publishedPosts"), value: publishedCount },
          { label: t("draftPosts"), value: draftsCount },
          { label: t("featuredPosts"), value: featuredCount },
        ].map(({ label, value }) => (
          <Card key={label} className="p-4">
            <p
              className={`text-xs font-medium uppercase tracking-wide ${themed.textSecondary} mb-1`}
            >
              {label}
            </p>
            <p className={`${typography.h3} ${themed.textPrimary}`}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.key}
            variant={statusFilter === tab.key ? "primary" : "outline"}
            onClick={() => setStatusFilter(tab.key)}
            className="text-sm"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* DataTable */}
      <Card>
        {error ? (
          <p className="p-6 text-red-500 text-sm">{tLoading("failed")}</p>
        ) : (
          <DataTable
            columns={columns as any}
            data={allPosts}
            keyExtractor={(p: any) => p.id}
            loading={isLoading}
            emptyMessage={t("empty")}
            emptyTitle={t("emptySubtitle")}
          />
        )}
      </Card>

      {/* Create / Edit Drawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={drawerTitle}
        mode={editingPost ? "edit" : "create"}
        isDirty={isDirty}
        side="right"
        footer={
          <DrawerFormFooter
            onCancel={closeDrawer}
            onSubmit={handleSave}
            isLoading={isSaving}
          />
        }
      >
        <BlogForm post={formData} onChange={setFormData} />
      </SideDrawer>

      {/* Delete confirmation */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
