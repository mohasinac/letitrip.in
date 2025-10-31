"use client";

import React, { useState, useEffect } from "react";
import {
  Trash2,
  Edit,
  Plus,
} from "lucide-react";
import MediaUpload from "./MediaUpload";
import { HeroBannerSlide } from "@/types/heroBanner";

const DEFAULT_THEME = {
  primary: "#4A90E2",
  secondary: "#7BB3F0",
  accent: "#2E5BBA",
  gradient: "linear-gradient(135deg, #4A90E2 0%, #7BB3F0 100%)",
  textPrimary: "#FFFFFF",
  textSecondary: "#E3F2FD",
  overlay: "rgba(74, 144, 226, 0.15)",
  cardBackground: "rgba(255, 255, 255, 0.95)",
  borderColor: "rgba(74, 144, 226, 0.3)",
};

export default function HeroSlideCustomizer() {
  const [slides, setSlides] = useState<HeroBannerSlide[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<Partial<HeroBannerSlide>>({
    title: "",
    description: "",
    backgroundImage: "",
    backgroundColor: "#1a1a1a",
    theme: DEFAULT_THEME,
    featuredProductIds: [],
    seoMeta: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: [],
      ogImage: "",
      ogTitle: "",
      ogDescription: "",
    },
    isActive: true,
    displayOrder: 1,
  });

  // Load slides and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slidesRes, productsRes] = await Promise.all([
          fetch("/api/admin/hero-slides"),
          fetch("/api/admin/products"),
        ]);

        const slidesData = await slidesRes.json();
        const productsData = await productsRes.json();

        if (slidesData.success) setSlides(slidesData.data);
        if (productsData.success) setProducts(productsData.data);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    fetchData();
  }, []);

  const handleOpenDialog = (slide?: HeroBannerSlide) => {
    if (slide) {
      setEditingId(slide.id);
      setFormData(slide);
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        backgroundImage: "",
        backgroundColor: "#1a1a1a",
        theme: DEFAULT_THEME,
        featuredProductIds: [],
        seoMeta: {
          metaTitle: "",
          metaDescription: "",
          metaKeywords: [],
          ogImage: "",
          ogTitle: "",
          ogDescription: "",
        },
        isActive: true,
        displayOrder: slides.length + 1,
      });
    }
    setTabValue(0);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.backgroundImage) {
      alert("Title and background image are required");
      return;
    }

    if (
      !formData.featuredProductIds ||
      formData.featuredProductIds.length < 3
    ) {
      alert("Select at least 3 featured products");
      return;
    }

    try {
      const url = "/api/admin/hero-slides";
      const method = editingId ? "PUT" : "POST";
      const payload = {
        ...formData,
        ...(editingId && { id: editingId }),
        ...(!editingId && {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save");

      const refreshRes = await fetch("/api/admin/hero-slides");
      const refreshData = await refreshRes.json();
      if (refreshData.success) setSlides(refreshData.data);

      setOpenDialog(false);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save slide");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slide?")) return;

    try {
      await fetch("/api/admin/hero-slides", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const refreshRes = await fetch("/api/admin/hero-slides");
      const refreshData = await refreshRes.json();
      if (refreshData.success) setSlides(refreshData.data);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete slide");
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const slide = slides.find((s) => s.id === id);
      if (!slide) return;

      const response = await fetch("/api/admin/hero-slides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...slide,
          isActive: !slide.isActive,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      const refreshRes = await fetch("/api/admin/hero-slides");
      const refreshData = await refreshRes.json();
      if (refreshData.success) setSlides(refreshData.data);
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Hero Banner Slides
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage carousel slides with products
          </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {slides.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No slides. Create one to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="border border-gray-200 rounded-lg p-4 flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {slide.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        slide.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {slide.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {slide.featuredProductIds.length} products
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{slide.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slide.isActive}
                      onChange={() => toggleActive(slide.id)}
                      className="w-10 h-5 appearance-none bg-gray-300 rounded-full relative cursor-pointer transition-colors checked:bg-green-600 before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5"
                    />
                  </label>
                  <button
                    onClick={() => handleOpenDialog(slide)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? "Edit Slide" : "Create Slide"}
              </h2>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-4">
                {["Basic", "Media", "Products", "SEO"].map((tab, index) => (
                  <button
                    key={tab}
                    onClick={() => setTabValue(index)}
                    className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                      tabValue === index
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {/* Basic Tab */}
              {tabValue === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={formData.backgroundColor || "#1a1a1a"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          backgroundColor: e.target.value,
                        })
                      }
                      className="w-full h-10 px-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Media Tab */}
              {tabValue === 1 && (
                <MediaUpload
                  onImageSelected={(url) =>
                    setFormData({ ...formData, backgroundImage: url })
                  }
                  onVideoSelected={(url) =>
                    setFormData({ ...formData, backgroundVideo: url })
                  }
                  currentImage={formData.backgroundImage}
                  currentVideo={formData.backgroundVideo}
                />
              )}

              {/* Products Tab */}
              {tabValue === 2 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Featured Products
                  </label>
                  <select
                    multiple
                    value={formData.featuredProductIds || []}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredProductIds: Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        ),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-64"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ₹{p.price}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Hold Ctrl/Cmd to select multiple products
                  </p>
                </div>
              )}

              {/* SEO Tab */}
              {tabValue === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={formData.seoMeta?.metaTitle || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seoMeta: {
                            ...formData.seoMeta!,
                            metaTitle: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      rows={2}
                      value={formData.seoMeta?.metaDescription || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seoMeta: {
                            ...formData.seoMeta!,
                            metaDescription: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setOpenDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
