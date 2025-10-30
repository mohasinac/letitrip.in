/**
 * Admin Page: Game Settings (Beyblade Management)
 * Create, edit, and manage Beyblades
 */

"use client";

import { useState, useEffect } from "react";
import { BeybladeStats } from "@/types/beybladeStats";
import MultiStepBeybladeEditor from "@/components/admin/MultiStepBeybladeEditor";
import BeybladeImageUploader from "@/components/admin/BeybladeImageUploader";

export default function GameSettingsPage() {
  const [beyblades, setBeyblades] = useState<BeybladeStats[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [editingImageFor, setEditingImageFor] = useState<string | null>(null);
  const [editingBeyblade, setEditingBeyblade] = useState<BeybladeStats | null>(
    null
  );
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchBeyblades();
  }, [selectedType]);

  const fetchBeyblades = async () => {
    setLoading(true);
    try {
      const url =
        selectedType !== "all"
          ? `/api/beyblades?type=${selectedType}`
          : "/api/beyblades";

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setBeyblades(data.data);
      }
    } catch (error) {
      console.error("Error fetching Beyblades:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "attack":
        return "text-red-600 bg-red-50";
      case "defense":
        return "text-blue-600 bg-blue-50";
      case "stamina":
        return "text-green-600 bg-green-50";
      case "balanced":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const handleImageUploaded = (beybladeId: string, imageUrl: string) => {
    setBeyblades((prev) =>
      prev.map((bey) => (bey.id === beybladeId ? { ...bey, imageUrl } : bey))
    );
    setEditingImageFor(null);
  };

  const handleSaveBeyblade = async (beyblade: Partial<BeybladeStats>) => {
    try {
      const url = editingBeyblade
        ? `/api/beyblades/${editingBeyblade.id}`
        : "/api/beyblades";

      const response = await fetch(url, {
        method: editingBeyblade ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(beyblade),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          editingBeyblade
            ? "Beyblade updated successfully!"
            : "Beyblade created successfully!"
        );
        setShowCreateForm(false);
        setEditingBeyblade(null);
        fetchBeyblades();
      } else {
        alert("Failed to save: " + data.error);
      }
    } catch (error) {
      console.error("Error saving Beyblade:", error);
      alert("Error saving Beyblade");
    }
  };

  const handleDeleteBeyblade = async (beybladeId: string) => {
    if (!confirm("Are you sure you want to delete this Beyblade?")) {
      return;
    }

    try {
      const response = await fetch(`/api/beyblades/${beybladeId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Beyblade deleted successfully!");
        fetchBeyblades();
      } else {
        alert("Failed to delete: " + data.error);
      }
    } catch (error) {
      console.error("Error deleting Beyblade:", error);
      alert("Error deleting Beyblade");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Beyblade Management
            </h1>
            <p className="text-gray-600 mt-2">
              Create, edit, and manage Beyblade configurations
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              + Create New Beyblade
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="attack">Attack</option>
            <option value="defense">Defense</option>
            <option value="stamina">Stamina</option>
            <option value="balanced">Balanced</option>
          </select>
        </div>

        {/* Beyblades Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Beyblades...</p>
          </div>
        ) : beyblades.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No Beyblades found.</p>
            <p className="text-gray-500 mt-2">
              Click "Create New Beyblade" to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beyblades.map((beyblade) => (
              <div
                key={beyblade.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Image */}
                    <div className="relative">
                      {beyblade.imageUrl ? (
                        <img
                          src={beyblade.imageUrl}
                          alt={beyblade.displayName}
                          className="w-20 h-20 rounded-full object-contain bg-gray-50 border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-gray-300">
                          <span className="text-2xl font-bold text-gray-500">
                            {beyblade.displayName[0]}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => setEditingImageFor(beyblade.id)}
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-700 transition-colors"
                        title="Upload Image"
                      >
                        📷
                      </button>
                    </div>

                    {/* Name and Type */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {beyblade.displayName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getTypeColor(
                            beyblade.type
                          )}`}
                        >
                          {beyblade.type}
                        </span>
                        <span className="text-sm text-gray-500">
                          {beyblade.spinDirection}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload Modal */}
                  {editingImageFor === beyblade.id && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold">
                            Upload Image for {beyblade.displayName}
                          </h3>
                          <button
                            onClick={() => setEditingImageFor(null)}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                          >
                            ×
                          </button>
                        </div>
                        <BeybladeImageUploader
                          currentImageUrl={beyblade.imageUrl}
                          beybladeId={beyblade.id}
                          onImageUploaded={(url) =>
                            handleImageUploaded(beyblade.id, url)
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Body - Quick Stats */}
                <div className="p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Special Move:</span>
                    <span className="font-semibold text-purple-600">
                      {beyblade.specialMove.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Power Cost:</span>
                    <span className="font-semibold">
                      {beyblade.specialMove.powerCost}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max Spin:</span>
                    <span className="font-semibold">{beyblade.maxSpin}</span>
                  </div>
                </div>

                {/* Card Footer - Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => setEditingBeyblade(beyblade)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBeyblade(beyblade.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Multi-Step Editor Modal */}
        {(showCreateForm || editingBeyblade) && (
          <MultiStepBeybladeEditor
            beyblade={editingBeyblade}
            onSave={handleSaveBeyblade}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingBeyblade(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
