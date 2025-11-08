"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Layers,
  Power,
  PowerOff,
} from "lucide-react";
import { apiService } from "@/services/api.service";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";

interface FeaturedSection {
  id: string;
  title: string;
  subtitle: string;
  type: "categories" | "shops" | "products" | "auctions";
  item_ids: string[];
  layout: "grid" | "carousel" | "list";
  max_items: number;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function FeaturedSectionsPage() {
  const router = useRouter();
  const [sections, setSections] = useState<FeaturedSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteSection, setDeleteSection] = useState<FeaturedSection | null>(
    null
  );
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      setLoading(true);
      const response = (await apiService.get(
        "/api/admin/featured-sections"
      )) as { sections: FeaturedSection[] };
      setSections(response.sections || []);
    } catch (error) {
      console.error("Failed to load featured sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteSection) return;

    try {
      await apiService.delete(
        `/api/admin/featured-sections/${deleteSection.id}`
      );
      setSections(sections.filter((s) => s.id !== deleteSection.id));
      setDeleteSection(null);
    } catch (error) {
      console.error("Failed to delete section:", error);
      alert("Failed to delete section");
    }
  };

  const handleToggleActive = async (section: FeaturedSection) => {
    try {
      await apiService.patch(`/api/admin/featured-sections/${section.id}`, {
        is_active: !section.is_active,
      });
      setSections(
        sections.map((s) =>
          s.id === section.id ? { ...s, is_active: !s.is_active } : s
        )
      );
    } catch (error) {
      console.error("Failed to toggle section:", error);
      alert("Failed to toggle section");
    }
  };

  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetSectionId) return;

    const draggedIndex = sections.findIndex((s) => s.id === draggedSection);
    const targetIndex = sections.findIndex((s) => s.id === targetSectionId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder sections
    const newSections = [...sections];
    const [removed] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, removed);

    // Update positions
    const reorderedSections = newSections.map((section, index) => ({
      ...section,
      position: index + 1,
    }));

    setSections(reorderedSections);
    setDraggedSection(null);

    // Save to backend
    try {
      await apiService.post("/api/admin/featured-sections/reorder", {
        sections: reorderedSections.map((s) => ({
          id: s.id,
          position: s.position,
        })),
      });
    } catch (error) {
      console.error("Failed to reorder sections:", error);
      alert("Failed to save new order");
      // Revert on error
      loadSections();
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      categories: "bg-blue-100 text-blue-700",
      shops: "bg-green-100 text-green-700",
      products: "bg-purple-100 text-purple-700",
      auctions: "bg-orange-100 text-orange-700",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getLayoutIcon = (layout: string) => {
    const icons: Record<string, string> = {
      grid: "⊞",
      carousel: "⇄",
      list: "☰",
    };
    return icons[layout] || "⊞";
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
          <h1 className="text-2xl font-bold text-gray-900">
            Featured Sections
          </h1>
          <p className="text-gray-600 mt-1">
            Manage homepage featured content sections
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/featured-sections/create")}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>

      {/* Sections List */}
      {sections.length === 0 ? (
        <EmptyState
          title="No featured sections"
          description="Create your first featured section to display on the homepage"
          action={{
            label: "Add Section",
            onClick: () => router.push("/admin/featured-sections/create"),
          }}
        />
      ) : (
        <div className="grid gap-4">
          {sections.map((section) => (
            <div
              key={section.id}
              draggable
              onDragStart={(e) => handleDragStart(e, section.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, section.id)}
              className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
                draggedSection === section.id ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Drag Handle */}
                <div className="cursor-move text-gray-400 hover:text-gray-600">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-6 h-6 text-purple-600" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {section.title}
                      </h3>
                      {section.subtitle && (
                        <p className="text-sm text-gray-600 truncate">
                          {section.subtitle}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${getTypeColor(
                            section.type
                          )}`}
                        >
                          {section.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getLayoutIcon(section.layout)} {section.layout}
                        </span>
                        <span className="text-xs text-gray-500">
                          • {section.item_ids.length} / {section.max_items}{" "}
                          items
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      {section.is_active ? (
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
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(section)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                    title={section.is_active ? "Deactivate" : "Activate"}
                  >
                    {section.is_active ? (
                      <PowerOff className="w-4 h-4" />
                    ) : (
                      <Power className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/admin/featured-sections/${section.id}/edit`)
                    }
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteSection(section)}
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
      {deleteSection && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Featured Section"
          description={`Are you sure you want to delete "${deleteSection.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleDelete}
          onClose={() => setDeleteSection(null)}
        />
      )}
    </div>
  );
}
