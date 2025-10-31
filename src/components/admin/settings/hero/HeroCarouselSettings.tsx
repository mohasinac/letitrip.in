"use client";

import React, { useState, useEffect } from "react";
import {
  Trash2,
  Edit,
  Plus,
  AlertCircle,
} from "lucide-react";

interface CarouselBackground {
  id: string;
  name: string;
  backgroundImage: string;
  displayName: string;
  description: string;
}

export default function HeroCarouselSettings() {
  const [carousels, setCarousels] = useState<CarouselBackground[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    backgroundImage: "",
    displayName: "",
    description: "",
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("hero-carousels");
    if (saved) {
      setCarousels(JSON.parse(saved));
    } else {
      // Initialize with default carousels
      const defaults: CarouselBackground[] = [
        {
          id: "classic",
          name: "classic",
          backgroundImage:
            "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?auto=format&fit=crop&w=1920&q=80",
          displayName: "Classic Plastic Generation",
          description:
            "Discover the original Beyblades that started the legend",
        },
        {
          id: "burst",
          name: "burst",
          backgroundImage:
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1920&q=80",
          displayName: "Beyblade Burst Series",
          description: "Experience the Burst evolution with enhanced gameplay",
        },
      ];
      setCarousels(defaults);
      localStorage.setItem("hero-carousels", JSON.stringify(defaults));
    }
  }, []);

  const handleOpenDialog = (carousel?: CarouselBackground) => {
    if (carousel) {
      setEditingId(carousel.id);
      setFormData({
        name: carousel.name,
        backgroundImage: carousel.backgroundImage,
        displayName: carousel.displayName,
        description: carousel.description,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        backgroundImage: "",
        displayName: "",
        description: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.backgroundImage) {
      alert("Please fill in all required fields");
      return;
    }

    let updatedCarousels;

    if (editingId) {
      updatedCarousels = carousels.map((c) =>
        c.id === editingId
          ? {
              ...c,
              name: formData.name,
              backgroundImage: formData.backgroundImage,
              displayName: formData.displayName,
              description: formData.description,
            }
          : c,
      );
    } else {
      updatedCarousels = [
        ...carousels,
        {
          id: Date.now().toString(),
          name: formData.name,
          backgroundImage: formData.backgroundImage,
          displayName: formData.displayName,
          description: formData.description,
        },
      ];
    }

    setCarousels(updatedCarousels);
    localStorage.setItem("hero-carousels", JSON.stringify(updatedCarousels));
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this carousel?")) {
      const updatedCarousels = carousels.filter((c) => c.id !== id);
      setCarousels(updatedCarousels);
      localStorage.setItem("hero-carousels", JSON.stringify(updatedCarousels));
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Carousel Backgrounds
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage the background images and content for each carousel slide
          </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Background
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Each carousel background is displayed on the homepage hero section.
            Update images and descriptions to customize your hero carousel.
          </p>
        </div>

        {carousels.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No carousels configured. Create one to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {carousels.map((carousel) => (
              <div
                key={carousel.id}
                className="border border-gray-200 rounded-lg p-4 flex items-start gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {carousel.displayName}
                    </h3>
                    <span className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600">
                      {carousel.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {carousel.description}
                  </p>
                  <div
                    className="w-full h-32 bg-cover bg-center rounded-lg border border-gray-200"
                    style={{
                      backgroundImage: `url(${carousel.backgroundImage})`,
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenDialog(carousel)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(carousel.id)}
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

      {/* Dialog for Add/Edit */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId
                  ? "Edit Carousel Background"
                  : "Add New Carousel Background"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carousel Name (ID)
                </label>
                <input
                  type="text"
                  placeholder="e.g., classic, burst, sparking"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Unique identifier for this carousel
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Classic Plastic Generation"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Brief description for this carousel"
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={formData.backgroundImage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      backgroundImage: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Full URL to the background image
                </p>
              </div>
              {formData.backgroundImage && (
                <div
                  className="w-full h-52 bg-cover bg-center rounded-lg border border-gray-200"
                  style={{
                    backgroundImage: `url(${formData.backgroundImage})`,
                  }}
                />
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {editingId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
