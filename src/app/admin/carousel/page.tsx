"use client";

import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, THEME_CONSTANTS } from "@/constants";
import { GridEditor, ImageUpload, DataTable } from "@/components/admin";
import { Card, Button } from "@/components";

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

export default function AdminCarouselPage() {
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
  const [isCreating, setIsCreating] = useState(false);

  const slides = data?.slides || [];

  const handleCreate = () => {
    setIsCreating(true);
    setEditingSlide({
      id: "",
      title: "",
      imageUrl: "",
      isActive: true,
      order: slides.length + 1,
    } as CarouselSlide);
  };

  const handleSave = async () => {
    if (!editingSlide) return;

    try {
      if (isCreating) {
        await createMutation.mutate(editingSlide);
      } else {
        await updateMutation.mutate({
          id: editingSlide.id,
          data: editingSlide,
        });
      }
      await refetch();
      setEditingSlide(null);
      setIsCreating(false);
    } catch (err) {
      alert("Failed to save slide");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slide?")) return;

    try {
      await deleteMutation.mutate(id);
      await refetch();
    } catch (err) {
      alert("Failed to delete slide");
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
          {slide.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  if (editingSlide) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1
            className={`text-2xl font-bold ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            {isCreating ? "Create Carousel Slide" : "Edit Carousel Slide"}
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setEditingSlide(null);
                setIsCreating(false);
              }}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} variant="primary">
              Save Slide
            </Button>
          </div>
        </div>

        <Card>
          <div className={THEME_CONSTANTS.spacing.stack}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={editingSlide.title}
                onChange={(e) =>
                  setEditingSlide({ ...editingSlide, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>

            <ImageUpload
              currentImage={editingSlide.imageUrl}
              onUpload={(url) =>
                setEditingSlide({ ...editingSlide, imageUrl: url })
              }
              folder="carousel"
              label="Slide Image"
              helperText="Recommended: 1920x600px"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Link URL (optional)
              </label>
              <input
                type="url"
                value={editingSlide.linkUrl || ""}
                onChange={(e) =>
                  setEditingSlide({ ...editingSlide, linkUrl: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
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
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active
                  </span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        <Card>
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
            Carousel Management
          </h1>
          <p className={`text-sm ${THEME_CONSTANTS.themed.textSecondary} mt-1`}>
            Manage homepage carousel slides (max 5 active)
          </p>
        </div>
        <Button
          onClick={handleCreate}
          variant="primary"
          disabled={slides.filter((s) => s.isActive).length >= 5}
        >
          + Add Slide
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <div className="text-center py-8">Loading slides...</div>
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
          data={slides}
          columns={columns}
          keyExtractor={(slide) => slide.id}
          onRowClick={(slide) => {
            setEditingSlide(slide);
            setIsCreating(false);
          }}
          actions={(slide) => (
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSlide(slide);
                  setIsCreating(false);
                }}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(slide.id);
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
