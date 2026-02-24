"use client";

import { useState, useEffect, use, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery, useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, UI_LABELS, ROUTES } from "@/constants";
import {
  Card,
  Button,
  DataTable,
  SideDrawer,
  AdminPageHeader,
  DrawerFormFooter,
  getSectionTableColumns,
  SectionForm,
} from "@/components";
import { useToast } from "@/components";
import type { HomepageSection, SectionDrawerMode } from "@/components";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

const LABELS = UI_LABELS.ADMIN.SECTIONS;

export default function AdminSectionsPage({ params }: PageProps) {
  const { action } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const { data, isLoading, error, refetch } = useApiQuery<{
    sections: HomepageSection[];
  }>({
    queryKey: ["homepage-sections", "list"],
    queryFn: () => apiClient.get(API_ENDPOINTS.HOMEPAGE_SECTIONS.LIST),
  });

  const createMutation = useApiMutation<any, any>({
    mutationFn: (data) =>
      apiClient.post(API_ENDPOINTS.HOMEPAGE_SECTIONS.LIST, data),
  });

  const updateMutation = useApiMutation<any, { id: string; data: any }>({
    mutationFn: ({ id, data }) =>
      apiClient.patch(`${API_ENDPOINTS.HOMEPAGE_SECTIONS.LIST}/${id}`, data),
  });

  const deleteMutation = useApiMutation<any, string>({
    mutationFn: (id) =>
      apiClient.delete(`${API_ENDPOINTS.HOMEPAGE_SECTIONS.LIST}/${id}`),
  });

  const [editingSection, setEditingSection] = useState<HomepageSection | null>(
    null,
  );
  const [drawerMode, setDrawerMode] = useState<SectionDrawerMode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const initialFormRef = useRef<string>("");

  const sections = data?.sections || [];

  const isDirty = useMemo(() => {
    if (!editingSection || drawerMode === "delete") return false;
    return JSON.stringify(editingSection) !== initialFormRef.current;
  }, [editingSection, drawerMode]);

  const findSectionById = useCallback(
    (id: string): HomepageSection | undefined =>
      sections.find((s) => s.id === id),
    [sections],
  );

  const handleCreate = useCallback(() => {
    const newSection = {
      id: "",
      type: "hero",
      title: "",
      enabled: true,
      order: sections.length + 1,
      config: {},
    } as HomepageSection;
    setEditingSection(newSection);
    initialFormRef.current = JSON.stringify(newSection);
    setDrawerMode("create");
    setIsDrawerOpen(true);
    if (action?.[0] !== "add") {
      router.push(`${ROUTES.ADMIN.SECTIONS}/add`);
    }
  }, [sections.length, action, router]);

  const handleEdit = useCallback(
    (section: HomepageSection) => {
      setEditingSection(section);
      initialFormRef.current = JSON.stringify(section);
      setDrawerMode("edit");
      setIsDrawerOpen(true);
      if (section.id && action?.[0] !== "edit") {
        router.push(`${ROUTES.ADMIN.SECTIONS}/edit/${section.id}`);
      }
    },
    [action, router],
  );

  const handleDeleteDrawer = useCallback(
    (section: HomepageSection) => {
      setEditingSection(section);
      initialFormRef.current = JSON.stringify(section);
      setDrawerMode("delete");
      setIsDrawerOpen(true);
      if (section.id && action?.[0] !== "delete") {
        router.push(`${ROUTES.ADMIN.SECTIONS}/delete/${section.id}`);
      }
    },
    [action, router],
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setEditingSection(null);
      setDrawerMode(null);
    }, 300);
    // Clear action from URL
    if (action?.[0]) {
      router.replace(ROUTES.ADMIN.SECTIONS);
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
      sections.length > 0
    ) {
      const section = findSectionById(id);
      if (section) {
        mode === "edit" ? handleEdit(section) : handleDeleteDrawer(section);
      } else {
        router.replace(ROUTES.ADMIN.SECTIONS);
      }
    }
  }, [
    action,
    sections,
    findSectionById,
    isDrawerOpen,
    handleCreate,
    handleEdit,
    handleDeleteDrawer,
    router,
  ]);

  const handleSave = async () => {
    if (!editingSection) return;
    try {
      if (drawerMode === "create") {
        await createMutation.mutate(editingSection);
      } else {
        await updateMutation.mutate({
          id: editingSection.id!,
          data: editingSection,
        });
      }
      await refetch();
      handleCloseDrawer();
    } catch {
      showToast(LABELS.SAVE_FAILED, "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingSection?.id) return;
    try {
      await deleteMutation.mutate(editingSection.id);
      await refetch();
      handleCloseDrawer();
    } catch {
      showToast(LABELS.DELETE_FAILED, "error");
    }
  };

  const isReadonly = drawerMode === "delete";

  const drawerTitle =
    drawerMode === "create"
      ? LABELS.CREATE_SECTION
      : drawerMode === "delete"
        ? LABELS.DELETE_SECTION
        : LABELS.EDIT_SECTION;

  const { columns, actions } = getSectionTableColumns(
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
          actionLabel={`+ ${UI_LABELS.ACTIONS.CREATE}`}
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
          <DataTable
            data={sections}
            columns={columns}
            keyExtractor={(section) => section.id}
            onRowClick={(section) => handleEdit(section)}
            actions={actions}
          />
        )}
      </div>

      {editingSection && (
        <SideDrawer
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          title={drawerTitle}
          mode={drawerMode || "view"}
          isDirty={isDirty}
          footer={drawerFooter}
          side="right"
        >
          <SectionForm
            section={editingSection}
            onChange={setEditingSection}
            isReadonly={isReadonly}
            isCreate={drawerMode === "create"}
          />
        </SideDrawer>
      )}
    </>
  );
}
