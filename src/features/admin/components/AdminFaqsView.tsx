/**
 * AdminFaqsView
 *
 * Contains all FAQ management state, mutations, handlers, and JSX.
 * Consumed by /admin/faqs/[[...action]]/page.tsx.
 */

"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { useMessage, useUrlTable, usePendingTable } from "@/hooks";
import { buildSieveFilters } from "@/helpers";
import { ROUTES, SUCCESS_MESSAGES, THEME_CONSTANTS } from "@/constants";

const { flex } = THEME_CONSTANTS;
import { useAdminFaqs } from "@/features/admin/hooks";
import { useTranslations } from "next-intl";
import {
  AdminPageHeader,
  Badge,
  Button,
  Caption,
  Card,
  DataTable,
  DrawerFormFooter,
  FormField,
  ListingLayout,
  Search,
  SideDrawer,
  StatusBadge,
  TablePagination,
  Text,
} from "@/components";
import { FaqFilters } from "./FaqFilters";
import { FaqForm, getFaqTableColumns } from ".";
import type { FAQ, FaqDrawerMode } from ".";

interface FAQsListResponse {
  items: FAQ[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

interface AdminFaqsViewProps {
  action?: string[];
}

export function AdminFaqsView({ action }: AdminFaqsViewProps) {
  const router = useRouter();
  const { showError, showSuccess } = useMessage();
  const t = useTranslations("adminFaqs");
  const tActions = useTranslations("actions");
  const tLoading = useTranslations("loading");
  const table = useUrlTable({
    defaults: { pageSize: "50", sort: "-priority,order" },
  });
  const searchTerm = table.get("q");
  const categoryFilter = table.get("category");
  const isActiveFilter = table.get("isActive");

  // ── Pending filter state (staged until Apply is clicked) ─────────────
  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, ["category", "isActive"]);

  const faqsParams = table.buildSieveParams(
    buildSieveFilters(
      ["question@=*", searchTerm],
      ["category==", categoryFilter],
      [
        "isActive==",
        isActiveFilter === "true"
          ? "true"
          : isActiveFilter === "false"
            ? "false"
            : undefined,
      ],
    ),
  );

  const {
    data,
    isLoading,
    error,
    refetch,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useAdminFaqs(faqsParams);

  const faqs = Array.isArray(data)
    ? (data as FAQ[])
    : ((data as FAQsListResponse)?.items ?? []);
  const faqMeta = Array.isArray(data) ? null : (data as FAQsListResponse);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingFAQ, setEditingFAQ] = useState<Partial<FAQ> | null>(null);
  const [drawerMode, setDrawerMode] = useState<FaqDrawerMode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const initialFormRef = useRef<string>("");

  const isDirty = useMemo(() => {
    if (!editingFAQ || drawerMode === "delete") return false;
    return JSON.stringify(editingFAQ) !== initialFormRef.current;
  }, [editingFAQ, drawerMode]);

  const findFAQById = useCallback(
    (id: string): FAQ | undefined => faqs.find((faq) => faq.id === id),
    [faqs],
  );

  const handleCreate = useCallback(() => {
    const newFAQ: Partial<FAQ> = {
      question: "",
      answer: "",
      category: "General",
      priority: 5,
      tags: [],
      isPinned: false,
      order: faqs.length + 1,
    };
    setEditingFAQ(newFAQ);
    initialFormRef.current = JSON.stringify(newFAQ);
    setDrawerMode("create");
    setIsDrawerOpen(true);
    if (action?.[0] !== "add") {
      router.push(`${ROUTES.ADMIN.FAQS}/add`);
    }
  }, [faqs.length, action, router]);

  const handleEdit = useCallback(
    (faq: FAQ) => {
      setEditingFAQ(faq);
      initialFormRef.current = JSON.stringify(faq);
      setDrawerMode("edit");
      setIsDrawerOpen(true);
      if (faq.id && action?.[0] !== "edit") {
        router.push(`${ROUTES.ADMIN.FAQS}/edit/${faq.id}`);
      }
    },
    [action, router],
  );

  const handleDeleteDrawer = useCallback(
    (faq: FAQ) => {
      setEditingFAQ(faq);
      initialFormRef.current = JSON.stringify(faq);
      setDrawerMode("delete");
      setIsDrawerOpen(true);
      if (faq.id && action?.[0] !== "delete") {
        router.push(`${ROUTES.ADMIN.FAQS}/delete/${faq.id}`);
      }
    },
    [action, router],
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setEditingFAQ(null);
      setDrawerMode(null);
    }, 300);
    if (action?.[0]) {
      router.replace(ROUTES.ADMIN.FAQS);
    }
  }, [action, router]);

  useEffect(() => {
    if (!action?.[0] || isDrawerOpen) return;
    const mode = action[0];
    const id = action[1];

    if (mode === "add") {
      handleCreate();
    } else if (
      (mode === "edit" || mode === "delete") &&
      id &&
      faqs.length > 0
    ) {
      const faq = findFAQById(id);
      if (faq) {
        mode === "edit" ? handleEdit(faq) : handleDeleteDrawer(faq);
      } else {
        router.replace(ROUTES.ADMIN.FAQS);
      }
    }
  }, [
    action,
    faqs,
    findFAQById,
    isDrawerOpen,
    handleCreate,
    handleEdit,
    handleDeleteDrawer,
    router,
  ]);

  const handleSave = async () => {
    if (!editingFAQ) return;
    try {
      if (drawerMode === "create") {
        await createMutation.mutateAsync(editingFAQ);
        showSuccess(SUCCESS_MESSAGES.FAQ.CREATED);
      } else {
        await updateMutation.mutateAsync({
          id: editingFAQ.id!,
          data: editingFAQ,
        });
        showSuccess(SUCCESS_MESSAGES.FAQ.UPDATED);
      }
      await refetch();
      handleCloseDrawer();
    } catch {
      showError(t("saveFailed"));
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingFAQ?.id) return;
    try {
      await deleteMutation.mutateAsync(editingFAQ.id);
      showSuccess(SUCCESS_MESSAGES.FAQ.DELETED);
      await refetch();
      handleCloseDrawer();
    } catch {
      showError(t("deleteFailed"));
    }
  };

  const isReadonly = drawerMode === "delete";

  const drawerTitle =
    drawerMode === "create"
      ? t("createFaq")
      : drawerMode === "delete"
        ? t("deleteFaq")
        : t("editFaq");

  const { columns, actions } = getFaqTableColumns(
    handleEdit,
    handleDeleteDrawer,
  );

  const drawerFooter =
    drawerMode === "delete" ? (
      <DrawerFormFooter
        onCancel={handleCloseDrawer}
        onSubmit={handleConfirmDelete}
        submitLabel={tActions("delete")}
      />
    ) : (
      <DrawerFormFooter onCancel={handleCloseDrawer} onSubmit={handleSave} />
    );

  return (
    <>
      <div className="space-y-6">
        <AdminPageHeader
          title={t("title")}
          subtitle={t("subtitle")}
          actionLabel={tActions("create")}
          onAction={handleCreate}
        />

        <ListingLayout
          searchSlot={
            <Search
              value={searchTerm}
              onChange={(v) => table.set("q", v)}
              placeholder={t("searchPlaceholder")}
            />
          }
          filterContent={<FaqFilters table={pendingTable} />}
          filterActiveCount={filterActiveCount}
          onFilterApply={onFilterApply}
          onFilterClear={onFilterClear}
          paginationSlot={
            (faqMeta?.totalPages ?? 1) > 1 ? (
              <TablePagination
                currentPage={faqMeta?.page ?? 1}
                totalPages={faqMeta?.totalPages ?? 1}
                pageSize={faqMeta?.pageSize ?? 50}
                total={faqMeta?.total ?? faqs.length}
                onPageChange={table.setPage}
                onPageSizeChange={table.setPageSize}
                isLoading={isLoading}
              />
            ) : undefined
          }
        >
          {isLoading ? (
            <Card>
              <div className="text-center py-8">{tLoading("default")}</div>
            </Card>
          ) : error ? (
            <Card>
              <div className="text-center py-8">
                <Text className="text-red-600 mb-4">{error.message}</Text>
                <Button variant="outline" onClick={() => refetch()}>
                  {tActions("retry")}
                </Button>
              </div>
            </Card>
          ) : (
            <DataTable
              data={faqs}
              columns={columns}
              keyExtractor={(faq) => faq.id}
              onRowClick={handleEdit}
              actions={actions}
              selectable
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              externalPagination
              showViewToggle
              viewMode={
                (table.get("view") || "table") as "table" | "grid" | "list"
              }
              onViewModeChange={(mode) => table.set("view", mode)}
              mobileCardRender={(faq) => (
                <Card
                  className="p-4 space-y-2 cursor-pointer"
                  onClick={() => handleEdit(faq)}
                >
                  <Text weight="medium" size="sm" className="line-clamp-2">
                    {faq.question}
                  </Text>
                  <div className={`${flex.between}`}>
                    <Badge>{faq.category}</Badge>
                    {faq.isPinned && <StatusBadge status="active" />}
                  </div>
                  <Caption>
                    ❤ {faq.stats?.helpful ?? 0} · 👁 {faq.stats?.views ?? 0}
                  </Caption>
                </Card>
              )}
            />
          )}
        </ListingLayout>
      </div>

      {editingFAQ && (
        <SideDrawer
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          title={drawerTitle}
          mode={drawerMode || "view"}
          isDirty={isDirty}
          footer={drawerFooter}
          side="right"
        >
          <FaqForm
            faq={editingFAQ}
            onChange={setEditingFAQ}
            isReadonly={isReadonly}
          />
        </SideDrawer>
      )}
    </>
  );
}
