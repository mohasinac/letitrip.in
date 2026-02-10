"use client";

import { useState, useEffect, use, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery, useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, THEME_CONSTANTS, UI_LABELS, ROUTES } from "@/constants";
import {
  Card,
  Button,
  RichTextEditor,
  DataTable,
  SideDrawer,
} from "@/components";

interface HomepageSection {
  id: string;
  type: string;
  title: string;
  description?: string;
  enabled: boolean;
  order: number;
  config: Record<string, any>;
}

const SECTION_TYPES = [
  { value: "hero", label: "Hero Banner" },
  { value: "featured-products", label: "Featured Products" },
  { value: "featured-auctions", label: "Featured Auctions" },
  { value: "categories", label: "Categories Grid" },
  { value: "testimonials", label: "Testimonials" },
  { value: "stats", label: "Statistics" },
  { value: "cta", label: "Call to Action" },
  { value: "blog", label: "Blog Posts" },
  { value: "faq", label: "FAQ" },
  { value: "newsletter", label: "Newsletter Signup" },
  { value: "custom-html", label: "Custom HTML" },
];

type DrawerMode = "create" | "edit" | "delete" | null;

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminSectionsPage({ params }: PageProps) {
  const { action } = use(params);
  const router = useRouter();

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
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
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

  // Auto-open drawer based on URL action: /add, /edit/:id, /delete/:id
  useEffect(() => {
    if (!action?.[0] || isDrawerOpen) return;

    const mode = action[0];
    const id = action[1];

    if (mode === "add") {
      handleCreate();
    } else if (mode === "edit" && id && sections.length > 0) {
      const section = findSectionById(id);
      if (section) {
        handleEdit(section);
      } else {
        router.replace(ROUTES.ADMIN.SECTIONS);
      }
    } else if (mode === "delete" && id && sections.length > 0) {
      const section = findSectionById(id);
      if (section) {
        handleDeleteDrawer(section);
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
    } catch (err) {
      alert("Failed to save section");
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingSection?.id) return;

    try {
      await deleteMutation.mutate(editingSection.id);
      await refetch();
      handleCloseDrawer();
    } catch (err) {
      alert("Failed to delete section");
    }
  };

  const isReadonly = drawerMode === "delete";

  const drawerTitle =
    drawerMode === "create"
      ? "Create Section"
      : drawerMode === "delete"
        ? `${UI_LABELS.ACTIONS.DELETE} Section`
        : "Edit Section";

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
      key: "type",
      header: "Type",
      sortable: true,
      render: (section: HomepageSection) => (
        <span className={`text-sm ${THEME_CONSTANTS.themed.textSecondary}`}>
          {SECTION_TYPES.find((t) => t.value === section.type)?.label ||
            section.type}
        </span>
      ),
    },
    {
      key: "enabled",
      header: "Status",
      sortable: true,
      render: (section: HomepageSection) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            section.enabled
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {section.enabled
            ? UI_LABELS.STATUS.ACTIVE
            : UI_LABELS.STATUS.INACTIVE}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className={THEME_CONSTANTS.spacing.stack}>
        <div className="flex items-center justify-between">
          <div>
            <h1
              className={`text-2xl font-bold ${THEME_CONSTANTS.themed.textPrimary}`}
            >
              Homepage Sections
            </h1>
            <p
              className={`text-sm ${THEME_CONSTANTS.themed.textSecondary} mt-1`}
            >
              Manage homepage sections and their order
            </p>
          </div>
          <Button onClick={handleCreate} variant="primary">
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
            data={sections}
            columns={columns}
            keyExtractor={(section) => section.id}
            onRowClick={(section) => handleEdit(section)}
            actions={(section) => (
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(section);
                  }}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  {UI_LABELS.ACTIONS.EDIT}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDrawer(section);
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
      {editingSection && (
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
                Section Type
              </label>
              <select
                value={editingSection.type}
                onChange={(e) =>
                  setEditingSection({ ...editingSection, type: e.target.value })
                }
                disabled={!drawerMode || drawerMode !== "create"}
                className={`${THEME_CONSTANTS.patterns.adminInput} ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {SECTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
              >
                Title
              </label>
              <input
                type="text"
                value={editingSection.title}
                onChange={(e) =>
                  setEditingSection({
                    ...editingSection,
                    title: e.target.value,
                  })
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
              {isReadonly ? (
                <div
                  className={`${THEME_CONSTANTS.patterns.adminInput} opacity-60 min-h-[100px]`}
                  dangerouslySetInnerHTML={{
                    __html: editingSection.description || "",
                  }}
                />
              ) : (
                <RichTextEditor
                  content={editingSection.description || ""}
                  onChange={(content) =>
                    setEditingSection({
                      ...editingSection,
                      description: content,
                    })
                  }
                  placeholder="Enter section description..."
                  minHeight="150px"
                />
              )}
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
                  value={editingSection.order}
                  onChange={(e) =>
                    setEditingSection({
                      ...editingSection,
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
                    checked={editingSection.enabled}
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        enabled: e.target.checked,
                      })
                    }
                    disabled={isReadonly}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enabled
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
              >
                Configuration (JSON)
              </label>
              <textarea
                value={JSON.stringify(editingSection.config, null, 2)}
                onChange={(e) => {
                  try {
                    const config = JSON.parse(e.target.value);
                    setEditingSection({ ...editingSection, config });
                  } catch (err) {
                    // Invalid JSON, ignore
                  }
                }}
                readOnly={isReadonly}
                rows={10}
                className={`${THEME_CONSTANTS.patterns.adminInput} font-mono text-sm ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>
          </div>
        </SideDrawer>
      )}
    </>
  );
}
