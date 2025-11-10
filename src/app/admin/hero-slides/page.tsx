"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  GripVertical,
  Star,
  StarOff,
  ExternalLink,
} from "lucide-react";
import { heroSlidesService, HeroSlide } from "@/services/hero-slides.service";
import { EmptyState } from "@/components/common/EmptyState";
import {
  QuickCreateRow,
  InlineEditRow,
  BulkActionBar,
  TableCheckbox,
} from "@/components/common/inline-edit";
import { getHeroSlideBulkActions } from "@/constants/bulk-actions";
import {
  HERO_SLIDE_FIELDS,
  getFieldsForContext,
  toInlineFields,
} from "@/constants/form-fields";
import { validateForm } from "@/lib/form-validation";
import { InlineField, BulkAction } from "@/types/inline-edit";

export default function HeroSlidesPage() {
  const router = useRouter();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [draggedSlide, setDraggedSlide] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Field configuration for inline edit and quick create (using centralized config)
  const fields: InlineField[] = toInlineFields(
    getFieldsForContext(HERO_SLIDE_FIELDS, "table")
  );

  // Bulk actions configuration
  const bulkActions = getHeroSlideBulkActions(selectedIds.length);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const slides = await heroSlidesService.getHeroSlides();
      setSlides(slides);
    } catch (error) {
      console.error("Failed to load hero slides:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (actionId: string) => {
    setActionLoading(true);
    try {
      if (actionId === "delete") {
        await heroSlidesService.bulkDelete(selectedIds);
      } else if (actionId === "activate") {
        await heroSlidesService.bulkUpdate(selectedIds, { isActive: true });
      } else if (actionId === "deactivate") {
        await heroSlidesService.bulkUpdate(selectedIds, { isActive: false });
      }
      setSelectedIds([]);
      await loadSlides();
    } catch (error) {
      console.error("Bulk action failed:", error);
      alert("Failed to perform bulk action");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, slideId: string) => {
    setDraggedSlide(slideId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetSlideId: string) => {
    e.preventDefault();
    if (!draggedSlide || draggedSlide === targetSlideId) return;

    const draggedIndex = slides.findIndex((s) => s.id === draggedSlide);
    const targetIndex = slides.findIndex((s) => s.id === targetSlideId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder slides
    const newSlides = [...slides];
    const [removed] = newSlides.splice(draggedIndex, 1);
    newSlides.splice(targetIndex, 0, removed);

    // Update order
    const reorderedSlides = newSlides.map((slide, index) => ({
      ...slide,
      order: index + 1,
    }));

    setSlides(reorderedSlides);
    setDraggedSlide(null);

    // Save to backend
    try {
      await heroSlidesService.reorderSlides(
        reorderedSlides.map((s) => ({
          id: s.id,
          order: s.order,
        }))
      );
    } catch (error) {
      console.error("Failed to reorder slides:", error);
      alert("Failed to save new order");
      // Revert on error
      loadSlides();
    }
  };

  const carouselCount = slides.filter((s) => s.isActive).length; // Note: Using isActive as proxy - update if show_in_carousel exists
  const MAX_SLIDES = 10;
  const MAX_CAROUSEL = 5;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Slides</h1>
          <p className="text-gray-600 mt-1">
            Manage homepage hero carousel slides (Max {MAX_SLIDES} slides,{" "}
            {MAX_CAROUSEL} in carousel)
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/hero-slides/create")}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Edit className="w-4 h-4" />
          Detailed Editor
        </button>
      </div>

      {/* Carousel Status */}
      {slides.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-700">
              <strong>{slides.length}</strong> / {MAX_SLIDES} slides
            </span>
            <span className="text-gray-700">
              <strong
                className={carouselCount > MAX_CAROUSEL ? "text-red-600" : ""}
              >
                {carouselCount}
              </strong>{" "}
              / {MAX_CAROUSEL} in carousel
              {carouselCount > MAX_CAROUSEL && (
                <span className="ml-1 text-red-600">(Exceeds limit!)</span>
              )}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Double-click row to edit
          </span>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-16 z-10 mb-4">
          <BulkActionBar
            selectedCount={selectedIds.length}
            actions={bulkActions}
            onAction={handleBulkAction}
            onClearSelection={() => setSelectedIds([])}
            loading={actionLoading}
            resourceName="slide"
            totalCount={slides.length}
          />
        </div>
      )}

      {/* Slides Table */}
      {slides.length === 0 && !loading ? (
        <EmptyState
          title="No hero slides"
          description="Create your first hero slide to display on the homepage"
          action={{
            label: "Add Slide",
            onClick: () => router.push("/admin/hero-slides/create"),
          }}
        />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <TableCheckbox
                      checked={
                        selectedIds.length === slides.length &&
                        slides.length > 0
                      }
                      indeterminate={
                        selectedIds.length > 0 &&
                        selectedIds.length < slides.length
                      }
                      onChange={(checked) => {
                        setSelectedIds(checked ? slides.map((s) => s.id) : []);
                      }}
                      label="Select all"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtitle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CTA
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carousel
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Quick Create Row */}
                {slides.length < MAX_SLIDES && (
                  <QuickCreateRow
                    fields={fields}
                    onSave={async (values) => {
                      setActionLoading(true);
                      try {
                        // Validate form fields
                        const fieldsToValidate = getFieldsForContext(
                          HERO_SLIDE_FIELDS,
                          "table"
                        );
                        const { isValid, errors } = validateForm(
                          values,
                          fieldsToValidate
                        );

                        if (!isValid) {
                          setValidationErrors(errors);
                          throw new Error("Please fix validation errors");
                        }

                        setValidationErrors({});

                        await heroSlidesService.createHeroSlide(values as any);
                        await loadSlides();
                      } catch (error) {
                        console.error("Failed to create slide:", error);
                        alert("Failed to create slide");
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    loading={actionLoading}
                    resourceName="slide"
                    defaultValues={{
                      isActive: true,
                      ctaText: "Shop Now",
                    }}
                  />
                )}

                {/* Existing Slides */}
                {slides.map((slide) =>
                  editingId === slide.id ? (
                    <InlineEditRow
                      key={slide.id}
                      fields={fields}
                      initialValues={slide}
                      onSave={async (values) => {
                        setActionLoading(true);
                        try {
                          // Validate form fields
                          const fieldsToValidate = getFieldsForContext(
                            HERO_SLIDE_FIELDS,
                            "table"
                          );
                          const { isValid, errors } = validateForm(
                            values,
                            fieldsToValidate
                          );

                          if (!isValid) {
                            setValidationErrors(errors);
                            throw new Error("Please fix validation errors");
                          }

                          setValidationErrors({});

                          await heroSlidesService.updateHeroSlide(
                            slide.id,
                            values as any
                          );
                          setEditingId(null);
                          await loadSlides();
                        } catch (error) {
                          console.error("Failed to update slide:", error);
                          alert("Failed to update slide");
                        } finally {
                          setActionLoading(false);
                        }
                      }}
                      onCancel={() => setEditingId(null)}
                      loading={actionLoading}
                      resourceName="slide"
                    />
                  ) : (
                    <tr
                      key={slide.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, slide.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, slide.id)}
                      onDoubleClick={() => setEditingId(slide.id)}
                      className={`hover:bg-gray-50 cursor-pointer transition-opacity ${
                        draggedSlide === slide.id ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <TableCheckbox
                          checked={selectedIds.includes(slide.id)}
                          onChange={(checked) => {
                            setSelectedIds(
                              checked
                                ? [...selectedIds, slide.id]
                                : selectedIds.filter((id) => id !== slide.id)
                            );
                          }}
                          label={`Select ${slide.title}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          <span className="text-sm text-gray-600">
                            {slide.order}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">
                          {slide.title}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600 truncate max-w-xs block">
                          {slide.subtitle || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {slide.image && (
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {slide.ctaLink ? (
                          <a
                            href={slide.ctaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Link
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {slide.ctaText || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {slide.isActive ? (
                          <Power className="w-4 h-4 text-green-600 inline" />
                        ) : (
                          <PowerOff className="w-4 h-4 text-gray-400 inline" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {slide.isActive ? (
                          <Star className="w-4 h-4 text-yellow-500 inline fill-current" />
                        ) : (
                          <StarOff className="w-4 h-4 text-gray-400 inline" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/admin/hero-slides/${slide.id}/edit`
                              );
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit (detailed)"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
