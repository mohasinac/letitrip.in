"use client";

import { useState, useEffect, use, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery, useApiMutation, useMessage, useUrlTable } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, UI_LABELS, ROUTES } from "@/constants";
import {
  Card,
  Button,
  SideDrawer,
  DataTable,
  AdminPageHeader,
  DrawerFormFooter,
  getFaqTableColumns,
  FaqForm,
  AdminFilterBar,
  FormField,
} from "@/components";
import type { FAQ, FaqDrawerMode } from "@/components";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

const LABELS = UI_LABELS.ADMIN.FAQS;

export default function AdminFAQsPage({ params }: PageProps) {
  const { action } = use(params);
  const router = useRouter();
  const { showError } = useMessage();
  const table = useUrlTable({
    defaults: { pageSize: "50", sort: "-priority,order" },
  });
  const searchTerm = table.get("q");

  const { data, isLoading, error, refetch } = useApiQuery<FAQ[]>({
    queryKey: ["faqs", "list", table.params.toString()],
    queryFn: () => {
      const params = new URLSearchParams();
      const sort = table.get("sort") || "-priority,order";
      params.set("sorts", sort);
      if (searchTerm) params.set("search", searchTerm);
      return apiClient.get(`${API_ENDPOINTS.FAQS.LIST}?${params.toString()}`);
    },
  });

  const createMutation = useApiMutation<any, any>({
    mutationFn: (data) => apiClient.post(API_ENDPOINTS.FAQS.LIST, data),
  });

  const updateMutation = useApiMutation<any, { id: string; data: any }>({
    mutationFn: ({ id, data }) =>
      apiClient.patch(`${API_ENDPOINTS.FAQS.LIST}/${id}`, data),
  });

  const deleteMutation = useApiMutation<any, string>({
    mutationFn: (id) => apiClient.delete(`${API_ENDPOINTS.FAQS.LIST}/${id}`),
  });

  const [editingFAQ, setEditingFAQ] = useState<Partial<FAQ> | null>(null);
  const [drawerMode, setDrawerMode] = useState<FaqDrawerMode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const initialFormRef = useRef<string>("");

  const faqs = Array.isArray(data) ? data : [];

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
      featured: false,
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
    // Clear action from URL
    if (action?.[0]) {
      router.replace(ROUTES.ADMIN.FAQS);
    }
  }, [action, router]);

  // Auto-open drawer based on URL action
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
        await createMutation.mutate(editingFAQ);
      } else {
        await updateMutation.mutate({ id: editingFAQ.id!, data: editingFAQ });
      }
      await refetch();
      handleCloseDrawer();
    } catch {
      showError(LABELS.SAVE_FAILED);
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingFAQ?.id) return;
    try {
      await deleteMutation.mutate(editingFAQ.id);
      await refetch();
      handleCloseDrawer();
    } catch {
      showError(LABELS.DELETE_FAILED);
    }
  };

  const isReadonly = drawerMode === "delete";

  const drawerTitle =
    drawerMode === "create"
      ? LABELS.CREATE_FAQ
      : drawerMode === "delete"
        ? LABELS.DELETE_FAQ
        : LABELS.EDIT_FAQ;

  const { columns, actions } = getFaqTableColumns(
    handleEdit,
    handleDeleteDrawer,
  );

  const drawerFooter =
    drawerMode === "delete" ? (
      <DrawerFormFooter
        onCancel={handleCloseDrawer}
        onSubmit={handleConfirmDelete}
        submitLabel={UI_LABELS.ACTIONS.DELETE}
      />
    ) : (
      <DrawerFormFooter onCancel={handleCloseDrawer} onSubmit={handleSave} />
    );

  return (
    <>
      <div className="space-y-6">
        <AdminPageHeader
          title={LABELS.TITLE}
          subtitle={LABELS.SUBTITLE}
          actionLabel={UI_LABELS.ACTIONS.CREATE}
          onAction={handleCreate}
        />

        {isLoading ? (
          <Card>
            <div className="text-center py-8">{UI_LABELS.LOADING.DEFAULT}</div>
          </Card>
        ) : error ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error.message}</p>
              <Button onClick={() => refetch()}>
                {UI_LABELS.ACTIONS.RETRY}
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <AdminFilterBar>
              <FormField
                type="text"
                name="search"
                value={searchTerm}
                onChange={(value) => table.set("q", value)}
                placeholder={UI_LABELS.ADMIN.FAQS.SEARCH_PLACEHOLDER}
              />
            </AdminFilterBar>
            <DataTable
              data={faqs}
              columns={columns}
              keyExtractor={(faq) => faq.id}
              onRowClick={handleEdit}
              actions={actions}
            />
          </>
        )}
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
