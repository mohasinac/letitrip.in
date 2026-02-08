"use client";

import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, THEME_CONSTANTS } from "@/constants";
import { RichTextEditor, DataTable } from "@/components/admin";
import { Card, Button } from "@/components";

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

export default function AdminSectionsPage() {
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
  const [isCreating, setIsCreating] = useState(false);

  const sections = data?.sections || [];

  const handleCreate = () => {
    setIsCreating(true);
    setEditingSection({
      id: "",
      type: "hero",
      title: "",
      enabled: true,
      order: sections.length + 1,
      config: {},
    } as HomepageSection);
  };

  const handleSave = async () => {
    if (!editingSection) return;

    try {
      if (isCreating) {
        await createMutation.mutate(editingSection);
      } else {
        await updateMutation.mutate({
          id: editingSection.id!,
          data: editingSection,
        });
      }
      await refetch();
      setEditingSection(null);
      setIsCreating(false);
    } catch (err) {
      alert("Failed to save section");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section?")) return;

    try {
      await deleteMutation.mutate(id);
      await refetch();
    } catch (err) {
      alert("Failed to delete section");
    }
  };

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
          {section.enabled ? "Enabled" : "Disabled"}
        </span>
      ),
    },
  ];

  if (editingSection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1
            className={`text-2xl font-bold ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            {isCreating ? "Create Section" : "Edit Section"}
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setEditingSection(null);
                setIsCreating(false);
              }}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} variant="primary">
              Save Section
            </Button>
          </div>
        </div>

        <Card>
          <div className={THEME_CONSTANTS.spacing.stack}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Section Type
              </label>
              <select
                value={editingSection.type}
                onChange={(e) =>
                  setEditingSection({ ...editingSection, type: e.target.value })
                }
                disabled={!isCreating}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              >
                {SECTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <RichTextEditor
                content={editingSection.description || ""}
                onChange={(content) =>
                  setEditingSection({ ...editingSection, description: content })
                }
                placeholder="Enter section description..."
                minHeight="150px"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
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
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enabled
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 font-mono text-sm"
              />
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
            Homepage Sections
          </h1>
          <p className={`text-sm ${THEME_CONSTANTS.themed.textSecondary} mt-1`}>
            Manage homepage sections and their order
          </p>
        </div>
        <Button onClick={handleCreate} variant="primary">
          + Add Section
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <div className="text-center py-8">Loading sections...</div>
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
          data={sections}
          columns={columns}
          keyExtractor={(section) => section.id}
          onRowClick={(section) => {
            setEditingSection(section);
            setIsCreating(false);
          }}
          actions={(section) => (
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSection(section);
                  setIsCreating(false);
                }}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(section.id);
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
