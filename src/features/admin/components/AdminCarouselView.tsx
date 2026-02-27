"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants";
import { useAdminCarousel } from "@/features/admin/hooks";
import { useTranslations } from "next-intl";
import {
  DataTable,
  Card,
  Button,
  SideDrawer,
  AdminPageHeader,
  DrawerFormFooter,
  getCarouselTableColumns,
  CarouselSlideForm,
  useToast,
} from "@/components";
import type { CarouselSlide, DrawerMode } from "@/components";

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

  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const initialFormRef = useRef<string>("");

  const slides = data?.slides || [];

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
    const newSlide = {
      id: "",
      title: "",
      imageUrl: "",
      isActive: true,
      order: slides.length + 1,
    } as CarouselSlide;
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
        await createMutation.mutate(editingSlide);
      } else {
        await updateMutation.mutate({
          id: editingSlide.id,
          data: editingSlide,
        });
      }
      await refetch();
      handleCloseDrawer();
    } catch {
      showToast(t("saveFailed"), "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingSlide?.id) return;
    try {
      await deleteMutation.mutate(editingSlide.id);
      await refetch();
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

  const { columns, actions } = getCarouselTableColumns(
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
          actionDisabled={slides.filter((s) => s.isActive).length >= 5}
        />

        {isLoading ? (
          <Card>
            <div className="text-center py-8">{tLoading("default")}</div>
          </Card>
        ) : error ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error.message}</p>
              <Button onClick={() => refetch()}>{tActions("retry")}</Button>
            </div>
          </Card>
        ) : (
          <DataTable
            data={slides}
            columns={columns}
            keyExtractor={(slide) => slide.id}
            onRowClick={(slide) => handleEdit(slide)}
            actions={actions}
          />
        )}
      </div>

      {editingSlide && (
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
      )}
    </>
  );
}
