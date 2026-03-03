/**
 * AdminSectionsView
 *
 * Extracted from src/app/[locale]/admin/sections/[[...action]]/page.tsx
 * Homepage section management with URL-driven drawer (create / edit / delete).
 */

"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/constants";
import { useAdminSections } from "@/features/admin/hooks";
import { useTranslations } from "next-intl";
import {
  AdminPageHeader,
  Button,
  Card,
  DataTable,
  DrawerFormFooter,
  SectionForm,
  SideDrawer,
  Text,
  useSectionTableColumns,
  useToast,
} from "@/components";
import type { HomepageSection, SectionDrawerMode } from "@/components";

interface AdminSectionsViewProps {
  action?: string[];
}

export function AdminSectionsView({ action }: AdminSectionsViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const t = useTranslations("adminSections");
  const tActions = useTranslations("actions");
  const tLoading = useTranslations("loading");

  const {
    data,
    isLoading,
    error,
    refetch,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useAdminSections();

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
      showToast(t("saveFailed"), "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingSection?.id) return;
    try {
      await deleteMutation.mutate(editingSection.id);
      await refetch();
      handleCloseDrawer();
    } catch {
      showToast(t("deleteFailed"), "error");
    }
  };

  const isReadonly = drawerMode === "delete";

  const drawerTitle =
    drawerMode === "create"
      ? t("createSection")
      : drawerMode === "delete"
        ? t("deleteSection")
        : t("editSection");

  const { columns, actions } = useSectionTableColumns(
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
          actionLabel={`+ ${tActions("create")}`}
          onAction={handleCreate}
        />

        {isLoading ? (
          <Card>
            <div className="text-center py-8">{tLoading("default")}</div>
          </Card>
        ) : error ? (
          <Card>
            <div className="text-center py-8">
              <Text className="text-red-600 mb-4">{error.message}</Text>
              <Button onClick={() => refetch()}>{tActions("retry")}</Button>
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
