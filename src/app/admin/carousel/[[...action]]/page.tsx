"use client";

import { useState, useEffect, use, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery, useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, THEME_CONSTANTS, UI_LABELS, ROUTES } from "@/constants";
import {
  GridEditor,
  ImageUpload,
  DataTable,
  Card,
  Button,
  SideDrawer,
} from "@/components";

interface CarouselSlide {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  order: number;
  gridData?: any;
}

type DrawerMode = "create" | "edit" | "delete" | null;

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminCarouselPage({ params }: PageProps) {
  const { action } = use(params);
  const router = useRouter();

  const { data, isLoading, error, refetch } = useApiQuery<{
    slides: CarouselSlide[];
  }>({
    queryKey: ["carousel", "list"],
    queryFn: () => apiClient.get(API_ENDPOINTS.CAROUSEL.LIST),
  });

  const createMutation = useApiMutation<any, any>({
    mutationFn: (data) => apiClient.post(API_ENDPOINTS.CAROUSEL.LIST, data),
  });

  const updateMutation = useApiMutation<any, { id: string; data: any }>({
    mutationFn: ({ id, data }) =>
      apiClient.patch(`${API_ENDPOINTS.CAROUSEL.LIST}/${id}`, data),
  });

  const deleteMutation = useApiMutation<any, string>({
    mutationFn: (id) =>
      apiClient.delete(`${API_ENDPOINTS.CAROUSEL.LIST}/${id}`),
  });

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

  const handleCreate = useCallback(() => {
    const newSlide = {
      id: "",
      title: "",
      imageUrl: "",
      isActive: true,
      order: slides.length + 1,
    } as CarouselSlide;
    setEditingSlide(newSlide);
    initialFormRef.current = JSON.stringify(newSlide);
    setDrawerMode("create");
    setIsDrawerOpen(true);
    if (action?.[0] !== "add") {
      router.push(`${ROUTES.ADMIN.CAROUSEL}/add`);
    }
  }, [slides.length, action, router]);

  const handleEdit = useCallback(
    (slide: CarouselSlide) => {
      setEditingSlide(slide);
      initialFormRef.current = JSON.stringify(slide);
      setDrawerMode("edit");
      setIsDrawerOpen(true);
      if (slide.id && action?.[0] !== "edit") {
        router.push(`${ROUTES.ADMIN.CAROUSEL}/edit/${slide.id}`);
      }
    },
    [action, router],
  );

  const handleDeleteDrawer = useCallback(
    (slide: CarouselSlide) => {
      setEditingSlide(slide);
      initialFormRef.current = JSON.stringify(slide);
      setDrawerMode("delete");
      setIsDrawerOpen(true);
      if (slide.id && action?.[0] !== "delete") {
        router.push(`${ROUTES.ADMIN.CAROUSEL}/delete/${slide.id}`);
      }
    },
    [action, router],
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setEditingSlide(null);
      setDrawerMode(null);
    }, 300);
    // Clear action from URL
    if (action?.[0]) {
      router.replace(ROUTES.ADMIN.CAROUSEL);
    }
  }, [action, router]);

  // Auto-open drawer based on URL action: /add, /edit/:id, /delete/:id
  useEffect(() => {
    if (!action?.[0] || isDrawerOpen) return;

    const mode = action[0];
    const id = action[1];

    if (mode === "add") {
      handleCreate();
    } else if (mode === "edit" && id && slides.length > 0) {
      const slide = findSlideById(id);
      if (slide) {
        handleEdit(slide);
      } else {
        router.replace(ROUTES.ADMIN.CAROUSEL);
      }
    } else if (mode === "delete" && id && slides.length > 0) {
      const slide = findSlideById(id);
      if (slide) {
        handleDeleteDrawer(slide);
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
    } catch (err) {
      alert("Failed to save slide");
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingSlide?.id) return;

    try {
      await deleteMutation.mutate(editingSlide.id);
      await refetch();
      handleCloseDrawer();
    } catch (err) {
      alert("Failed to delete slide");
    }
  };

  const isReadonly = drawerMode === "delete";

  const drawerTitle =
    drawerMode === "create"
      ? "Create Carousel Slide"
      : drawerMode === "delete"
        ? `${UI_LABELS.ACTIONS.DELETE} Carousel Slide`
        : "Edit Carousel Slide";

  const drawerFooter = (
    <div className="flex gap-3 justify-end">
      {drawerMode === "delete" ? (
        <>
          <Button onClick={handleCloseDrawer} variant="secondary">
            {UI_LABELS.ACTIONS.CANCEL}
          </Button>
          <Button onClick={handleConfirmDelete} variant="danger">
            {UI_LABELS.ACTIONS.DELETE}
          </Button>
        </>
      ) : (
        <>
          <Button onClick={handleCloseDrawer} variant="secondary">
            {UI_LABELS.ACTIONS.CANCEL}
          </Button>
          <Button onClick={handleSave} variant="primary">
            {UI_LABELS.ACTIONS.SAVE}
          </Button>
        </>
      )}
    </div>
  );

  const columns = [
    {
      key: "order",
      header: "Order",
      sortable: true,
      width: "80px",
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
    },
    {
      key: "imageUrl",
      header: "Image",
      render: (slide: CarouselSlide) => (
        <img
          src={slide.imageUrl}
          alt={slide.title}
          className="h-12 w-20 object-cover rounded"
          loading="lazy"
        />
      ),
    },
    {
      key: "isActive",
      header: "Status",
      sortable: true,
      render: (slide: CarouselSlide) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            slide.isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {slide.isActive ? UI_LABELS.STATUS.ACTIVE : UI_LABELS.STATUS.INACTIVE}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className={`text-2xl font-bold ${THEME_CONSTANTS.themed.textPrimary}`}
            >
              Carousel Management
            </h1>
            <p
              className={`text-sm ${THEME_CONSTANTS.themed.textSecondary} mt-1`}
            >
              Manage homepage carousel slides (max 5 active)
            </p>
          </div>
          <Button
            onClick={handleCreate}
            variant="primary"
            disabled={slides.filter((s) => s.isActive).length >= 5}
          >
            + {UI_LABELS.ACTIONS.CREATE}
          </Button>
        </div>

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
            data={slides}
            columns={columns}
            keyExtractor={(slide) => slide.id}
            onRowClick={(slide) => handleEdit(slide)}
            actions={(slide) => (
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(slide);
                  }}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  {UI_LABELS.ACTIONS.EDIT}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDrawer(slide);
                  }}
                  className="text-red-600 hover:text-red-800 dark:text-red-400"
                >
                  {UI_LABELS.ACTIONS.DELETE}
                </button>
              </div>
            )}
          />
        )}
      </div>

      {/* Side Drawer for Create/Edit/Delete */}
      {editingSlide && (
        <SideDrawer
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          title={drawerTitle}
          mode={drawerMode || "view"}
          isDirty={isDirty}
          footer={drawerFooter}
        >
          <div className={THEME_CONSTANTS.spacing.stack}>
            <div>
              <label
                className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
              >
                Title
              </label>
              <input
                type="text"
                value={editingSlide.title}
                onChange={(e) =>
                  setEditingSlide({ ...editingSlide, title: e.target.value })
                }
                readOnly={isReadonly}
                className={`${THEME_CONSTANTS.patterns.adminInput} ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
              >
                Description
              </label>
              <textarea
                value={editingSlide.description || ""}
                onChange={(e) =>
                  setEditingSlide({
                    ...editingSlide,
                    description: e.target.value,
                  })
                }
                readOnly={isReadonly}
                rows={3}
                className={`${THEME_CONSTANTS.patterns.adminInput} ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>

            {!isReadonly && (
              <ImageUpload
                currentImage={editingSlide.imageUrl}
                onUpload={(url) =>
                  setEditingSlide({ ...editingSlide, imageUrl: url })
                }
                folder="carousel"
                label="Slide Image"
                helperText="Recommended: 1920x600px"
              />
            )}

            {editingSlide.imageUrl && isReadonly && (
              <div>
                <label
                  className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
                >
                  Slide Image
                </label>
                <img
                  src={editingSlide.imageUrl}
                  alt={editingSlide.title}
                  className="h-32 w-auto object-cover rounded"
                />
              </div>
            )}

            <div>
              <label
                className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
              >
                Link URL (optional)
              </label>
              <input
                type="url"
                value={editingSlide.linkUrl || ""}
                onChange={(e) =>
                  setEditingSlide({ ...editingSlide, linkUrl: e.target.value })
                }
                readOnly={isReadonly}
                className={`${THEME_CONSTANTS.patterns.adminInput} ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
                >
                  Order
                </label>
                <input
                  type="number"
                  value={editingSlide.order}
                  onChange={(e) =>
                    setEditingSlide({
                      ...editingSlide,
                      order: parseInt(e.target.value),
                    })
                  }
                  readOnly={isReadonly}
                  className={`${THEME_CONSTANTS.patterns.adminInput} ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`}
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingSlide.isActive}
                    onChange={(e) =>
                      setEditingSlide({
                        ...editingSlide,
                        isActive: e.target.checked,
                      })
                    }
                    disabled={isReadonly}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active
                  </span>
                </label>
              </div>
            </div>

            {!isReadonly && (
              <div className={`border-t ${THEME_CONSTANTS.themed.border} pt-4`}>
                <h3
                  className={`text-lg font-semibold ${THEME_CONSTANTS.themed.textPrimary} mb-4`}
                >
                  Grid Layout Designer (Optional)
                </h3>
                <GridEditor
                  initialGrid={editingSlide.gridData}
                  onChange={(grid) =>
                    setEditingSlide({ ...editingSlide, gridData: grid })
                  }
                />
              </div>
            )}
          </div>
        </SideDrawer>
      )}
    </>
  );
}
