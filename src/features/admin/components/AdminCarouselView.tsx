"use client";

import { useToast } from "@mohasinac/appkit/ui";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { ROUTES, SUCCESS_MESSAGES, THEME_CONSTANTS } from "@/constants";

const { flex } = THEME_CONSTANTS;
import { useAdminCarousel } from "@/features/admin/hooks";
import { useTranslations } from "next-intl";
import { Caption, Text, StatusBadge, Button, DataTable } from "@mohasinac/appkit/ui";
import { AdminCarouselView as AppkitAdminCarouselView } from "@mohasinac/appkit/features/admin";
import {
  AdminPageHeader, Card, DrawerFormFooter, MediaImage, SideDrawer } from "@/components";
import { CarouselSlideForm, useCarouselTableColumns } from ".";
import type { CarouselSlide, DrawerMode } from ".";

interface Props {
  action?: string[];
}

export function AdminCarouselView({ action }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const t = useTranslations("adminCarousel");
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
  } = useAdminCarousel();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid" | "list">("table");
  const initialFormRef = useRef<string>("");

  const slides = data || [];

  const isDirty = useMemo(() => {
    if (!editingSlide || drawerMode === "delete") return false;
    return JSON.stringify(editingSlide) !== initialFormRef.current;
  }, [editingSlide, drawerMode]);

  const findSlideById = useCallback(
    (id: string): CarouselSlide | undefined => slides.find((s) => s.id === id),
    [slides],
  );

  const openDrawer = useCallback(
    (slide: CarouselSlide, mode: DrawerMode, urlSegment: string) => {
      setEditingSlide(slide);
      initialFormRef.current = JSON.stringify(slide);
      setDrawerMode(mode);
      setIsDrawerOpen(true);
      if (slide.id && action?.[0] !== urlSegment) {
        router.push(
          mode === "create"
            ? `${ROUTES.ADMIN.CAROUSEL}/add`
            : `${ROUTES.ADMIN.CAROUSEL}/${urlSegment}/${slide.id}`,
        );
      }
    },
    [action, router],
  );

  const handleCreate = useCallback(() => {
    const newSlide: CarouselSlide = {
      id: "",
      title: "",
      media: { type: "image", url: "", alt: "" },
      active: true,
      order: slides.length + 1,
      cards: [],
    };
    openDrawer(newSlide, "create", "add");
    if (action?.[0] !== "add") {
      router.push(`${ROUTES.ADMIN.CAROUSEL}/add`);
    }
  }, [slides.length, action, router, openDrawer]);

  const handleEdit = useCallback(
    (slide: CarouselSlide) => openDrawer(slide, "edit", "edit"),
    [openDrawer],
  );

  const handleDeleteDrawer = useCallback(
    (slide: CarouselSlide) => openDrawer(slide, "delete", "delete"),
    [openDrawer],
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setEditingSlide(null);
      setDrawerMode(null);
    }, 300);
    if (action?.[0]) {
      router.replace(ROUTES.ADMIN.CAROUSEL);
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
      slides.length > 0
    ) {
      const slide = findSlideById(id);
      if (slide) {
        mode === "edit" ? handleEdit(slide) : handleDeleteDrawer(slide);
      } else {
        router.replace(ROUTES.ADMIN.CAROUSEL);
      }
    }
  }, [
    action,
    slides,
    findSlideById,
    isDrawerOpen,
    handleCreate,
    handleEdit,
    handleDeleteDrawer,
    router,
  ]);

  const handleSave = async () => {
    if (!editingSlide) return;
    try {
      if (drawerMode === "create") {
        await createMutation.mutateAsync(editingSlide);
      } else {
        await updateMutation.mutateAsync({
          id: editingSlide.id,
          data: editingSlide,
        });
      }
      await refetch();
      showToast(
        drawerMode === "create"
          ? SUCCESS_MESSAGES.CAROUSEL.CREATED
          : SUCCESS_MESSAGES.CAROUSEL.UPDATED,
        "success",
      );
      handleCloseDrawer();
    } catch {
      showToast(t("saveFailed"), "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingSlide?.id) return;
    try {
      await deleteMutation.mutateAsync(editingSlide.id);
      await refetch();
      showToast(SUCCESS_MESSAGES.CAROUSEL.DELETED, "success");
      handleCloseDrawer();
    } catch {
      showToast(t("deleteFailed"), "error");
    }
  };

  const isReadonly = drawerMode === "delete";

  const drawerTitle =
    drawerMode === "create"
      ? t("createSlide")
      : drawerMode === "delete"
        ? t("deleteSlide")
        : t("editSlide");

  const { columns, actions } = useCarouselTableColumns(
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
    <AppkitAdminCarouselView
      renderHeader={() => (
        <AdminPageHeader
          title={t("title")}
          subtitle={t("subtitle")}
          actionLabel={`+ ${tActions("create")}`}
          onAction={handleCreate}
          actionDisabled={slides.filter((s) => s.active).length >= 5}
        />
      )}
      isLoading={isLoading}
      renderTable={() =>
        isLoading ? (
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
            data={slides}
            columns={columns}
            keyExtractor={(slide) => slide.id}
            onRowClick={(slide) => handleEdit(slide)}
            actions={actions}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            showViewToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            mobileCardRender={(slide) => (
              <Card
                className="overflow-hidden cursor-pointer"
                onClick={() => handleEdit(slide)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <MediaImage
                    src={slide.media?.url ?? ""}
                    alt={slide.title}
                    size="card"
                  />
                </div>
                <div className="p-3 space-y-2">
                  <Text weight="medium" size="sm" className="line-clamp-1">
                    {slide.title}
                  </Text>
                  <div className={`${flex.between}`}>
                    <Caption>#{slide.order}</Caption>
                    <StatusBadge
                      status={slide.active ? "active" : "inactive"}
                    />
                  </div>
                </div>
              </Card>
            )}
          />
        )
      }
      renderDrawer={() =>
        editingSlide ? (
          <SideDrawer
            isOpen={isDrawerOpen}
            onClose={handleCloseDrawer}
            title={drawerTitle}
            mode={drawerMode || "view"}
            isDirty={isDirty}
            footer={drawerFooter}
            side="right"
          >
            <CarouselSlideForm
              slide={editingSlide}
              onChange={setEditingSlide}
              isReadonly={isReadonly}
            />
          </SideDrawer>
        ) : null
      }
    />
  );
}
