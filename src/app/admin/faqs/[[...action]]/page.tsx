"use client";

import { useState, useEffect, use, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery, useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, THEME_CONSTANTS, UI_LABELS, ROUTES } from "@/constants";
import {
  Card,
  Button,
  SideDrawer,
  DataTable,
  RichTextEditor,
} from "@/components";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  priority: number;
  tags: string[];
  featured: boolean;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const FAQ_CATEGORIES = [
  "General",
  "Account",
  "Payment",
  "Shipping",
  "Returns",
  "Products",
  "Auctions",
  "Orders",
  "Technical",
  "Other",
];

const VARIABLE_PLACEHOLDERS = [
  { key: "{{companyName}}", description: "Company name" },
  { key: "{{supportEmail}}", description: "Support email address" },
  { key: "{{supportPhone}}", description: "Support phone number" },
  { key: "{{websiteUrl}}", description: "Website URL" },
  { key: "{{companyAddress}}", description: "Company address" },
];

type DrawerMode = "create" | "edit" | "delete" | null;

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminFAQsPage({ params }: PageProps) {
  const { action } = use(params);
  const router = useRouter();

  const { data, isLoading, error, refetch } = useApiQuery<{ faqs: FAQ[] }>({
    queryKey: ["faqs", "list"],
    queryFn: () => apiClient.get(API_ENDPOINTS.FAQS.LIST),
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
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showVariableHelper, setShowVariableHelper] = useState(false);
  const initialFormRef = useRef<string>("");

  const faqs = data?.faqs || [];

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
      setShowVariableHelper(false);
    }, 300);
    // Clear action from URL
    if (action?.[0]) {
      router.replace(ROUTES.ADMIN.FAQS);
    }
  }, [action, router]);

  // Auto-open drawer based on URL action: /add, /edit/:id, /delete/:id
  useEffect(() => {
    if (!action?.[0] || isDrawerOpen) return;

    const mode = action[0];
    const id = action[1];

    if (mode === "add") {
      handleCreate();
    } else if (mode === "edit" && id && faqs.length > 0) {
      const faq = findFAQById(id);
      if (faq) {
        handleEdit(faq);
      } else {
        router.replace(ROUTES.ADMIN.FAQS);
      }
    } else if (mode === "delete" && id && faqs.length > 0) {
      const faq = findFAQById(id);
      if (faq) {
        handleDeleteDrawer(faq);
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
    } catch (err) {
      alert("Failed to save FAQ");
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingFAQ?.id) return;

    try {
      await deleteMutation.mutate(editingFAQ.id);
      await refetch();
      handleCloseDrawer();
    } catch (err) {
      alert("Failed to delete FAQ");
    }
  };

  const insertVariable = (variable: string) => {
    if (!editingFAQ) return;
    const currentAnswer = editingFAQ.answer || "";
    setEditingFAQ({ ...editingFAQ, answer: currentAnswer + variable });
  };

  const isReadonly = drawerMode === "delete";

  const drawerTitle =
    drawerMode === "create"
      ? "Create FAQ"
      : drawerMode === "delete"
        ? `${UI_LABELS.ACTIONS.DELETE} FAQ`
        : "Edit FAQ";

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

  const tableColumns = [
    {
      key: "question",
      header: "Question",
      sortable: true,
      width: "35%",
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      width: "15%",
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      width: "10%",
    },
    {
      key: "viewCount",
      header: "Views",
      sortable: true,
      width: "10%",
    },
    {
      key: "helpful",
      header: "Helpful",
      render: (faq: FAQ) => {
        const total = faq.helpfulCount + faq.notHelpfulCount;
        const ratio =
          total > 0 ? Math.round((faq.helpfulCount / total) * 100) : 0;
        return (
          <span className="text-sm">
            {faq.helpfulCount} / {total} ({ratio}%)
          </span>
        );
      },
      width: "15%",
    },
    {
      key: "featured",
      header: "Featured",
      sortable: true,
      render: (faq: FAQ) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            faq.featured
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              : `${THEME_CONSTANTS.themed.bgTertiary} ${THEME_CONSTANTS.themed.textSecondary}`
          }`}
        >
          {faq.featured ? "Yes" : "No"}
        </span>
      ),
      width: "15%",
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
              FAQs
            </h1>
            <p
              className={`text-sm ${THEME_CONSTANTS.themed.textSecondary} mt-1`}
            >
              Manage frequently asked questions
            </p>
          </div>
          <Button onClick={handleCreate} variant="primary">
            {UI_LABELS.ACTIONS.CREATE}
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
            data={faqs}
            columns={tableColumns}
            keyExtractor={(faq) => faq.id}
            onRowClick={handleEdit}
            actions={(faq) => (
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(faq);
                  }}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  {UI_LABELS.ACTIONS.EDIT}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDrawer(faq);
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
      {editingFAQ && (
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
                Question
              </label>
              <input
                type="text"
                value={editingFAQ.question || ""}
                onChange={(e) =>
                  setEditingFAQ({ ...editingFAQ, question: e.target.value })
                }
                readOnly={isReadonly}
                className={`${THEME_CONSTANTS.patterns.adminInput} ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`}
                placeholder="Enter FAQ question..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-0`}
                >
                  Answer
                </label>
                {!isReadonly && (
                  <button
                    onClick={() => setShowVariableHelper(!showVariableHelper)}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {showVariableHelper ? "Hide" : "Show"} Variables
                  </button>
                )}
              </div>

              {showVariableHelper && !isReadonly && (
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                  <p
                    className={`text-xs ${THEME_CONSTANTS.themed.textSecondary} mb-2`}
                  >
                    Click to insert variable into answer:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {VARIABLE_PLACEHOLDERS.map((v) => (
                      <button
                        key={v.key}
                        onClick={() => insertVariable(v.key)}
                        className={`px-2 py-1 text-xs ${THEME_CONSTANTS.themed.bgPrimary} border ${THEME_CONSTANTS.themed.border} rounded ${THEME_CONSTANTS.themed.hover}`}
                        title={v.description}
                      >
                        {v.key}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isReadonly ? (
                <div
                  className={`${THEME_CONSTANTS.patterns.adminInput} opacity-60 min-h-[150px]`}
                  dangerouslySetInnerHTML={{ __html: editingFAQ.answer || "" }}
                />
              ) : (
                <RichTextEditor
                  content={editingFAQ.answer || ""}
                  onChange={(content) =>
                    setEditingFAQ({ ...editingFAQ, answer: content })
                  }
                  placeholder="Enter FAQ answer (use rich text formatting)..."
                  minHeight="200px"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
                >
                  Category
                </label>
                <select
                  value={editingFAQ.category || "General"}
                  onChange={(e) =>
                    setEditingFAQ({ ...editingFAQ, category: e.target.value })
                  }
                  disabled={isReadonly}
                  className={`${THEME_CONSTANTS.patterns.adminInput} ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {FAQ_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
                >
                  Priority (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editingFAQ.priority || 5}
                  onChange={(e) =>
                    setEditingFAQ({
                      ...editingFAQ,
                      priority: parseInt(e.target.value),
                    })
                  }
                  readOnly={isReadonly}
                  className={`${THEME_CONSTANTS.patterns.adminInput} ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`}
                />
                <p
                  className={`text-xs ${THEME_CONSTANTS.themed.textSecondary} mt-1`}
                >
                  Higher priority appears first
                </p>
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
              >
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={(editingFAQ.tags || []).join(", ")}
                onChange={(e) =>
                  setEditingFAQ({
                    ...editingFAQ,
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
                readOnly={isReadonly}
                className={`${THEME_CONSTANTS.patterns.adminInput} ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`}
                placeholder="e.g. payment, refund, shipping"
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
                  value={editingFAQ.order || 0}
                  onChange={(e) =>
                    setEditingFAQ({
                      ...editingFAQ,
                      order: parseInt(e.target.value),
                    })
                  }
                  readOnly={isReadonly}
                  className={`${THEME_CONSTANTS.patterns.adminInput} ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`}
                />
                <p
                  className={`text-xs ${THEME_CONSTANTS.themed.textSecondary} mt-1`}
                >
                  Display order within same priority
                </p>
              </div>

              <div className="flex items-center mt-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingFAQ.featured || false}
                    onChange={(e) =>
                      setEditingFAQ({
                        ...editingFAQ,
                        featured: e.target.checked,
                      })
                    }
                    disabled={isReadonly}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span
                    className={`text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary}`}
                  >
                    Featured (show on homepage)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </SideDrawer>
      )}
    </>
  );
}
