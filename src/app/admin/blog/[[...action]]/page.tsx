"use client";

import { useState, use, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import {
  API_ENDPOINTS,
  UI_LABELS,
  ROUTES,
  SUCCESS_MESSAGES,
} from "@/constants";
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
import { THEME_CONSTANTS } from "@/constants";
import type { BlogPostDocument } from "@/db/schema";
import type { BlogFormData } from "@/components";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

const LABELS = UI_LABELS.ADMIN.BLOG;
const { themed, typography } = THEME_CONSTANTS;

const STATUS_TABS = [
  { key: "", label: LABELS.FILTER_ALL },
  { key: "draft", label: LABELS.FILTER_DRAFT },
  { key: "published", label: LABELS.FILTER_PUBLISHED },
  { key: "archived", label: LABELS.FILTER_ARCHIVED },
];

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
    };
  }>({
    queryKey: ["admin", "blog"],
    queryFn: () => apiClient.get(API_ENDPOINTS.ADMIN.BLOG),
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

  const filteredPosts = useMemo(() => {
    if (!statusFilter) return allPosts;
    return allPosts.filter((p) => p.status === statusFilter);
  }, [allPosts, statusFilter]);

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
      showError(
        editingPost ? UI_LABELS.ADMIN.BLOG.EDIT : UI_LABELS.ADMIN.BLOG.CREATE,
      );
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
      showError(UI_LABELS.ADMIN.BLOG.DELETE);
    }
  }, [deleteTarget, deleteMutation, refetch, showSuccess, showError]);

  const isSaving = createMutation.isLoading || updateMutation.isLoading;
  const isDeleting = deleteMutation.isLoading;
  const drawerTitle = editingPost ? LABELS.EDIT : LABELS.CREATE;

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
        title={LABELS.TITLE}
        subtitle={`${LABELS.SUBTITLE} — ${totalPosts} total`}
        actionLabel={LABELS.CREATE}
        onAction={openCreate}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: LABELS.TOTAL_POSTS, value: totalPosts },
          { label: LABELS.PUBLISHED_POSTS, value: publishedCount },
          { label: LABELS.DRAFT_POSTS, value: draftsCount },
          { label: LABELS.FEATURED_POSTS, value: featuredCount },
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
          <p className="p-6 text-red-500 text-sm">{UI_LABELS.LOADING.FAILED}</p>
        ) : (
          <DataTable
            columns={columns as any}
            data={filteredPosts}
            keyExtractor={(p: any) => p.id}
            loading={isLoading}
            emptyMessage={LABELS.EMPTY}
            emptyTitle={LABELS.EMPTY_SUBTITLE}
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
