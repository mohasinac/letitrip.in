/**
 * AdminSectionsView
 *
 * Extracted from src/app/[locale]/admin/sections/[[...action]]/page.tsx
 * Homepage section management with URL-driven drawer (create / edit / delete).
 */

"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { ROUTES, SUCCESS_MESSAGES, THEME_CONSTANTS } from "@/constants";

const { flex } = THEME_CONSTANTS;
import { useAdminSections } from "@/features/admin/hooks";
import { useTranslations } from "next-intl";
import { Caption, Text } from "@mohasinac/appkit/ui";
import {
  AdminPageHeader,
  Badge,
  Button,
  Card,
  DataTable,
  DrawerFormFooter,
  SideDrawer,
  StatusBadge,
  useToast,
} from "@/components";
import { SectionForm, useSectionTableColumns } from ".";
import type { HomepageSection, SectionDrawerMode } from ".";

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

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(
    null,
  );
  const [drawerMode, setDrawerMode] = useState<SectionDrawerMode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid" | "list">("table");
  const initialFormRef = useRef<string>("");

  const sections = data || [];

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
      type: "welcome",
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
        await createMutation.mutateAsync(editingSection);
        showToast(SUCCESS_MESSAGES.SECTION.CREATED, "success");
      } else {
        await updateMutation.mutateAsync({
          id: editingSection.id!,
          data: editingSection,
        });
        showToast(SUCCESS_MESSAGES.SECTION.UPDATED, "success");
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
      await deleteMutation.mutateAsync(editingSection.id);
      showToast(SUCCESS_MESSAGES.SECTION.DELETED, "success");
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
              <Button variant="outline" onClick={() => refetch()}>
                {tActions("retry")}
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
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            showViewToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            mobileCardRender={(section) => (
              <Card
                className="p-4 space-y-2 cursor-pointer"
                onClick={() => handleEdit(section)}
              >
                <div className={`${flex.between}`}>
                  <Badge>{section.type}</Badge>
                  <StatusBadge
                    status={section.enabled ? "active" : "inactive"}
                  />
                </div>
                <Text weight="medium" size="sm">
                  {section.title}
                </Text>
                {section.description && (
                  <Caption className="line-clamp-2">
                    {section.description}
                  </Caption>
                )}
                <Caption>#{section.order}</Caption>
              </Card>
            )}
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
