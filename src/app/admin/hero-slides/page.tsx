"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  ExternalLink,
  Power,
  PowerOff,
} from "lucide-react";
import { apiService } from "@/services/api.service";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  link_url: string;
  cta_text: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function HeroSlidesPage() {
  const router = useRouter();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteSlide, setDeleteSlide] = useState<HeroSlide | null>(null);
  const [draggedSlide, setDraggedSlide] = useState<string | null>(null);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const response = (await apiService.get("/admin/hero-slides")) as {
        slides: HeroSlide[];
      };
      setSlides(response.slides || []);
    } catch (error) {
      console.error("Failed to load hero slides:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteSlide) return;

    try {
      await apiService.delete(`/admin/hero-slides/${deleteSlide.id}`);
      setSlides(slides.filter((s) => s.id !== deleteSlide.id));
      setDeleteSlide(null);
    } catch (error) {
      console.error("Failed to delete slide:", error);
      alert("Failed to delete slide");
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      await apiService.patch(`/admin/hero-slides/${slide.id}`, {
        is_active: !slide.is_active,
      });
      setSlides(
        slides.map((s) =>
          s.id === slide.id ? { ...s, is_active: !s.is_active } : s
        )
      );
    } catch (error) {
      console.error("Failed to toggle slide:", error);
      alert("Failed to toggle slide");
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

    // Update positions
    const reorderedSlides = newSlides.map((slide, index) => ({
      ...slide,
      position: index + 1,
    }));

    setSlides(reorderedSlides);
    setDraggedSlide(null);

    // Save to backend
    try {
      await apiService.post("/admin/hero-slides/reorder", {
        slides: reorderedSlides.map((s) => ({
          id: s.id,
          position: s.position,
        })),
      });
    } catch (error) {
      console.error("Failed to reorder slides:", error);
      alert("Failed to save new order");
      // Revert on error
      loadSlides();
    }
  };

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
            Manage homepage hero carousel slides
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/hero-slides/create")}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </button>
      </div>

      {/* Slides List */}
      {slides.length === 0 ? (
        <EmptyState
          title="No hero slides"
          description="Create your first hero slide to display on the homepage"
          action={{
            label: "Add Slide",
            onClick: () => router.push("/admin/hero-slides/create"),
          }}
        />
      ) : (
        <div className="grid gap-4">
          {slides.map((slide) => (
            <div
              key={slide.id}
              draggable
              onDragStart={(e) => handleDragStart(e, slide.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, slide.id)}
              className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
                draggedSlide === slide.id ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Drag Handle */}
                <div className="cursor-move text-gray-400 hover:text-gray-600">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Image */}
                <div className="w-32 h-20 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                  {slide.image_url ? (
                    <img
                      src={slide.image_url}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {slide.title}
                      </h3>
                      {slide.subtitle && (
                        <p className="text-sm text-gray-600 truncate">
                          {slide.subtitle}
                        </p>
                      )}
                      {slide.link_url && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate">{slide.link_url}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      {slide.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                          <Power className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                          <PowerOff className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  {slide.cta_text && (
                    <div className="mt-2">
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                        {slide.cta_text}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(slide)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                    title={slide.is_active ? "Deactivate" : "Activate"}
                  >
                    {slide.is_active ? (
                      <PowerOff className="w-4 h-4" />
                    ) : (
                      <Power className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/admin/hero-slides/${slide.id}/edit`)
                    }
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteSlide(slide)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteSlide && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Hero Slide"
          description={`Are you sure you want to delete "${deleteSlide.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onClose={() => setDeleteSlide(null)}
        />
      )}
    </div>
  );
}
