/**
 * AdminBlogView
 *
 * Extracted from src/app/[locale]/admin/blog/[[...action]]/page.tsx
 * Full CRUD UI for blog posts with URL-driven drawer, status filter tabs,
 * and unified ListingLayout shell.
 */
import { useState, useCallback, useRef, useMemo, Suspense } from "react";
import { useRouter } from "@/i18n/navigation";
import { usePendingTable } from "@mohasinac/appkit/react";
import { useMessage } from "@mohasinac/appkit/react";
import { useUrlTable } from "@/hooks/useUrlTable";
import { useAdminBlog } from "@/features/admin/hooks";
import {
  Caption, Text, Grid, StatusBadge, Badge, Button, SortDropdown, Row, DataTable, } from "@mohasinac/appkit/ui";
import { ROUTES, SUCCESS_MESSAGES, THEME_CONSTANTS } from "@/constants";
import { getMediaUrl } from "@mohasinac/appkit/utils";
import { useTranslations } from "next-intl";
import {
  AdminPageHeader, Card, ConfirmDeleteModal, DrawerFormFooter, MediaImage, Search, SideDrawer, } from "@/components";
import { BlogFilters } from "@mohasinac/appkit/features/blog";
import { AdminBlogView as AdminBlogShell } from "@mohasinac/appkit/features/admin";
import type { BlogPostDocument } from "@/db/schema";
import { BlogForm, useBlogTableColumns } from ".";
import type { BlogFormData } from ".";
import { formatDate } from "@mohasinac/appkit/utils";


"use client";

const { themed, typography, flex } = THEME_CONSTANTS;

const DEFAULT_FORM: BlogFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: null,
  contentImages: [],
  additionalImages: [],
  category: "news",
  tags: [],
  isFeatured: false,
  status: "draft",
  readTimeMinutes: 5,
};

const BLOG_SORT_OPTIONS_KEYS = [
  { value: "-createdAt", key: "sortNewest" },
  { value: "createdAt", key: "sortOldest" },
] as const;

function AdminBlogContent() {
  const router = useRouter();
  const t = useTranslations("adminBlog");
  const tLoading = useTranslations("loading");
  const tStatus = useTranslations("status");
  const { showSuccess, showError } = useMessage();

  const table = useUrlTable({
    defaults: { pageSize: "25", sort: "-createdAt" },
  });
  const statusFilter = table.get("status");
  const categoryFilter = table.get("category");
  const isFeaturedFilter = table.get("isFeatured");
  const searchTerm = table.get("q");
  const sortParam = table.get("sort") || "-createdAt";
  const pageParam = table.getNumber("page", 1);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostDocument | null>(null);
  const [formData, setFormData] = useState<BlogFormData>(DEFAULT_FORM);
  const [deleteTarget, setDeleteTarget] = useState<BlogPostDocument | null>(
    null,
  );
  const initialFormRef = useRef<string>("");

  // -- Pending filter state (staged until Apply is clicked) -------------
  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, ["status", "category", "isFeatured"]);

  const {
    data,
    isLoading,
    error,
    refetch,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useAdminBlog(
    table.buildSieveParams(
      [
        statusFilter ? `status==${statusFilter}` : "",
        categoryFilter ? `category==${categoryFilter}` : "",
        isFeaturedFilter === "true" ? "isFeatured==true" : "",
        searchTerm ? `title@=*${searchTerm}` : "",
      ]
        .filter(Boolean)
        .join(","),
    ),
  );

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
        contentImages: post.contentImages,
        additionalImages: post.additionalImages,
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
        await updateMutation.mutateAsync({
          id: editingPost.id,
          data: formData,
        });
        showSuccess(SUCCESS_MESSAGES.BLOG.UPDATED);
      } else {
        await createMutation.mutateAsync(formData);
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
      await deleteMutation.mutateAsync(deleteTarget.id);
      showSuccess(SUCCESS_MESSAGES.BLOG.DELETED);
      setDeleteTarget(null);
      refetch();
    } catch {
      showError(t("delete"));
    }
  }, [deleteTarget, deleteMutation, refetch, showSuccess, showError]);

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  const STATUS_TABS = useMemo(
    () => [
      { key: "", label: t("filterAll") },
      { key: "draft", label: t("filterDraft") },
      { key: "published", label: t("filterPublished") },
      { key: "archived", label: t("filterArchived") },
    ],
    [t],
  );

  const drawerTitle = editingPost ? t("edit") : t("create");

  const { columns } = useBlogTableColumns(openEdit, (post) =>
    setDeleteTarget(post),
  );

  const sortOptions = useMemo(
    () =>
      BLOG_SORT_OPTIONS_KEYS.map((o) => ({
        value: o.value,
        label: t(o.key),
      })),
    [t],
  );

  const statusOptions = useMemo(
    () => [
      { value: "draft", label: t("filterDraft") },
      { value: "published", label: t("filterPublished") },
      { value: "archived", label: t("filterArchived") },
    ],
    [t],
  );

  // Stats
  const totalPosts = data?.meta.total ?? 0;
  const publishedCount = data?.meta.published ?? 0;
  const draftsCount = data?.meta.drafts ?? 0;
  const featuredCount = data?.meta.featured ?? 0;

  const statusTabsSlot = (
    <Row gap="sm">
      {STATUS_TABS.map((tab) => (
        <Button
          key={tab.key}
          variant={statusFilter === tab.key ? "primary" : "outline"}
          size="sm"
          onClick={() => table.set("status", tab.key)}
        >
          {tab.label}
        </Button>
      ))}
    </Row>
  );

  return (
    <>
      <AdminBlogShell
        isDashboard
        headerSlot={
          <>
            <AdminPageHeader
              title={t("title")}
              subtitle={`${t("subtitle")} � ${totalPosts} total`}
              actionLabel={t("create")}
              onAction={openCreate}
            />
            {/* Stat cards */}
            <Grid cols="statTiles">
              {[
                { label: t("totalPosts"), value: totalPosts },
                { label: t("publishedPosts"), value: publishedCount },
                { label: t("draftPosts"), value: draftsCount },
                { label: t("featuredPosts"), value: featuredCount },
              ].map(({ label, value }) => (
                <Card key={label} className="p-4">
                  <Text
                    className={`text-xs font-medium uppercase tracking-wide ${themed.textSecondary} mb-1`}
                  >
                    {label}
                  </Text>
                  <Text className={`${typography.h3} ${themed.textPrimary}`}>
                    {value}
                  </Text>
                </Card>
              ))}
            </Grid>
          </>
        }
        statusTabsSlot={statusTabsSlot}
        searchSlot={
          <Search
            value={table.get("q")}
            onChange={(v) => table.set("q", v)}
            placeholder={t("searchPlaceholder")}
            onClear={() => table.set("q", "")}
          />
        }
        sortSlot={
          <SortDropdown
            value={table.get("sort") || "-createdAt"}
            onChange={(v) => table.set("sort", v)}
            options={sortOptions}
          />
        }
        filterContent={<BlogFilters table={pendingTable} />}
        filterActiveCount={filterActiveCount}
        onFilterApply={onFilterApply}
        onFilterClear={onFilterClear}
        loading={isLoading}
        errorSlot={
          error ? (
            <Card>
              <div className="text-center py-8">
                <Text variant="error">{tLoading("failed")}</Text>
              </div>
            </Card>
          ) : undefined
        }
        renderDrawer={() => (
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
        )}
        renderConfirmModal={() => (
          <ConfirmDeleteModal
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            isDeleting={isDeleting}
          />
        )}
      >
        <DataTable
          columns={columns as any}
          data={allPosts}
          keyExtractor={(p: any) => p.id}
          loading={isLoading}
          emptyMessage={t("empty")}
          emptyTitle={t("emptySubtitle")}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          showViewToggle
          viewMode={(table.get("view") || "table") as "table" | "grid" | "list"}
          onViewModeChange={(mode) => table.set("view", mode)}
          mobileCardRender={(post: BlogPostDocument) => (
            <Card className="overflow-hidden cursor-pointer">
              {getMediaUrl(post.coverImage) && (
                <div className="relative aspect-video overflow-hidden">
                  <MediaImage
                    src={getMediaUrl(post.coverImage)!}
                    alt={post.title}
                    size="card"
                  />
                </div>
              )}
              <div className="p-3 space-y-2">
                <Text weight="medium" size="sm" className="line-clamp-2">
                  {post.title}
                </Text>
                <div className={`${flex.between}`}>
                  <Badge>{post.category}</Badge>
                  <StatusBadge status={post.status as any} />
                </div>
                <Caption>{post.authorName}</Caption>
                <Caption>{formatDate(post.createdAt)}</Caption>
              </div>
            </Card>
          )}
        />
      </AdminBlogShell>
    </>
  );
}

export function AdminBlogView() {
  return (
    <Suspense>
      <AdminBlogContent />
    </Suspense>
  );
}

