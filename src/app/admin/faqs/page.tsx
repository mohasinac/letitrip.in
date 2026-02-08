"use client";

import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, THEME_CONSTANTS } from "@/constants";
import { DataTable, RichTextEditor } from "@/components/admin";
import { Card, Button } from "@/components";

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

export default function AdminFAQsPage() {
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
  const [isCreating, setIsCreating] = useState(false);
  const [showVariableHelper, setShowVariableHelper] = useState(false);

  const faqs = data?.faqs || [];

  const handleCreate = () => {
    setIsCreating(true);
    setEditingFAQ({
      question: "",
      answer: "",
      category: "General",
      priority: 5,
      tags: [],
      featured: false,
      order: faqs.length + 1,
    });
  };

  const handleSave = async () => {
    if (!editingFAQ) return;

    try {
      if (isCreating) {
        await createMutation.mutate(editingFAQ);
      } else {
        await updateMutation.mutate({ id: editingFAQ.id!, data: editingFAQ });
      }
      await refetch();
      setEditingFAQ(null);
      setIsCreating(false);
    } catch (err) {
      alert("Failed to save FAQ");
    }
  };

  const handleDelete = async (faq: FAQ) => {
    if (!confirm(`Delete "${faq.question}"?`)) return;

    try {
      await deleteMutation.mutate(faq.id);
      await refetch();
    } catch (err) {
      alert("Failed to delete FAQ");
    }
  };

  const insertVariable = (variable: string) => {
    if (!editingFAQ) return;
    const currentAnswer = editingFAQ.answer || "";
    setEditingFAQ({ ...editingFAQ, answer: currentAnswer + variable });
  };

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
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {faq.featured ? "Yes" : "No"}
        </span>
      ),
      width: "15%",
    },
  ];

  if (editingFAQ) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1
            className={`text-2xl font-bold ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            {isCreating ? "Create FAQ" : "Edit FAQ"}
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setEditingFAQ(null);
                setIsCreating(false);
              }}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} variant="primary">
              Save FAQ
            </Button>
          </div>
        </div>

        <Card>
          <div className={THEME_CONSTANTS.spacing.stack}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question
              </label>
              <input
                type="text"
                value={editingFAQ.question || ""}
                onChange={(e) =>
                  setEditingFAQ({ ...editingFAQ, question: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                placeholder="Enter FAQ question..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Answer
                </label>
                <button
                  onClick={() => setShowVariableHelper(!showVariableHelper)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  {showVariableHelper ? "Hide" : "Show"} Variables
                </button>
              </div>

              {showVariableHelper && (
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
                        className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                        title={v.description}
                      >
                        {v.key}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <RichTextEditor
                content={editingFAQ.answer || ""}
                onChange={(content) =>
                  setEditingFAQ({ ...editingFAQ, answer: content })
                }
                placeholder="Enter FAQ answer (use rich text formatting)..."
                minHeight="200px"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={editingFAQ.category || "General"}
                  onChange={(e) =>
                    setEditingFAQ({ ...editingFAQ, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                >
                  {FAQ_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Higher priority appears first
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                placeholder="e.g. payment, refund, shipping"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Featured (show on homepage)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={`text-2xl font-bold ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            FAQs
          </h1>
          <p className={`text-sm ${THEME_CONSTANTS.themed.textSecondary} mt-1`}>
            Manage frequently asked questions
          </p>
        </div>
        <Button onClick={handleCreate} variant="primary">
          + Add FAQ
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <div className="text-center py-8">Loading FAQs...</div>
        </Card>
      ) : error ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error.message}</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </Card>
      ) : (
        <DataTable
          data={faqs}
          columns={tableColumns}
          keyExtractor={(faq) => faq.id}
          onRowClick={(faq) => {
            setEditingFAQ(faq);
            setIsCreating(false);
          }}
          actions={(faq) => (
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingFAQ(faq);
                  setIsCreating(false);
                }}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(faq);
                }}
                className="text-red-600 hover:text-red-800 dark:text-red-400"
              >
                Delete
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}
