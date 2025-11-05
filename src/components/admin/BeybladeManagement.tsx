"use client";

import React, { useEffect, useState } from "react";
import {
  Edit as EditIcon,
  Camera,
  RefreshCw,
  Plus,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { BeybladeStats } from "@/types/beybladeStats";
import BeybladeImageUploader from "./BeybladeImageUploader";
import BeybladePreview from "./BeybladePreview";

export default function BeybladeManagement() {
  const [beyblades, setBeyblades] = useState<BeybladeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedBeyblade, setSelectedBeyblade] =
    useState<BeybladeStats | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBeyblades();
  }, []);

  const fetchBeyblades = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/beyblades");
      if (!response.ok) throw new Error("Failed to fetch Beyblades");
      const data = await response.json();
      setBeyblades(data.beyblades || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Beyblades");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (beyblade: BeybladeStats) => {
    setSelectedBeyblade(beyblade);
    setImageUploadOpen(true);
  };

  const handleImageUploaded = (imageUrl: string) => {
    // Update the beyblade in the list
    setBeyblades((prevBeyblades) =>
      prevBeyblades.map((b) =>
        b.id === selectedBeyblade?.id ? { ...b, imageUrl } : b
      )
    );
    setImageUploadOpen(false);
  };

  const handlePreview = (beyblade: BeybladeStats) => {
    console.log("🎯 Preview clicked for:", beyblade.name);
    setSelectedBeyblade(beyblade);
    setPreviewOpen(true);
    console.log("✅ Preview state set to true");
  };

  const handleDeleteClick = (beyblade: BeybladeStats) => {
    console.log("🗑️ Delete clicked for:", beyblade.name);
    setSelectedBeyblade(beyblade);
    setDeleteConfirmOpen(true);
    console.log("✅ Delete confirm state set to true");
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBeyblade) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/beyblades/${selectedBeyblade.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete beyblade");
      }

      // Remove from local state
      setBeyblades((prev) => prev.filter((b) => b.id !== selectedBeyblade.id));
      setDeleteConfirmOpen(false);
      setSelectedBeyblade(null);
    } catch (err) {
      console.error("Error deleting beyblade:", err);
      alert("Failed to delete beyblade. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSelectedBeyblade(null);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      attack: "#ff4757",
      defense: "#5352ed",
      stamina: "#ffa502",
      balanced: "#2ed573",
    };
    return colors[type] || "#666";
  };

  const getTypeGradient = (type: string) => {
    const gradients: Record<string, string> = {
      attack: "linear-gradient(135deg, #ff4757 0%, #ff6348 100%)",
      defense: "linear-gradient(135deg, #5352ed 0%, #3742fa 100%)",
      stamina: "linear-gradient(135deg, #ffa502 0%, #ff6348 100%)",
      balanced: "linear-gradient(135deg, #2ed573 0%, #7bed9f 100%)",
    };
    return gradients[type] || "linear-gradient(135deg, #666 0%, #999 100%)";
  };

  const filteredBeyblades = beyblades.filter((bey) => {
    const matchesType = filterType === "all" || bey.type === filterType;
    const matchesSearch =
      searchQuery === "" ||
      (bey.name &&
        bey.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      bey.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Loading Beyblades...
        </h2>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters and Actions */}
      <div className="mb-6 flex gap-3 flex-wrap items-center">
        <input
          type="text"
          placeholder="Search Beyblades"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="min-w-[250px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="min-w-[150px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="attack">Attack</option>
          <option value="defense">Defense</option>
          <option value="stamina">Stamina</option>
          <option value="balanced">Balanced</option>
        </select>

        <button
          onClick={fetchBeyblades}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>

        <div className="flex-1" />

        <p className="text-sm text-gray-600">
          {filteredBeyblades.length} Beyblade
          {filteredBeyblades.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Beyblade Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredBeyblades.map((beyblade) => (
          <div
            key={beyblade.id}
            className="h-full flex flex-col relative rounded-xl overflow-hidden bg-white border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Type Banner */}
            <div
              className="h-2"
              style={{ background: getTypeGradient(beyblade.type) }}
            />

            <div className="flex-1 p-5">
              {/* Header with Image */}
              <div className="flex items-start gap-3 mb-4">
                {/* Beyblade Image or Circle */}
                <div
                  className="relative w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 border-4 border-white shadow-md"
                  style={{
                    background: beyblade.imageUrl
                      ? `url(${beyblade.imageUrl}) center/cover`
                      : getTypeGradient(beyblade.type),
                  }}
                >
                  {!beyblade.imageUrl && beyblade.name?.charAt(0)}

                  {/* Upload Icon Overlay */}
                  <button
                    onClick={() => handleImageUpload(beyblade)}
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Name and Type */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-1 truncate">
                    {beyblade.name}
                  </h3>
                  <span
                    className="inline-block px-2 py-1 text-xs font-bold text-white rounded"
                    style={{ backgroundColor: getTypeColor(beyblade.type) }}
                  >
                    {beyblade.type.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="mb-4">
                <StatBar
                  label="Attack"
                  value={beyblade.typeDistribution.attack}
                  max={150}
                  color="#ff4757"
                />
                <StatBar
                  label="Defense"
                  value={beyblade.typeDistribution.defense}
                  max={150}
                  color="#5352ed"
                />
                <StatBar
                  label="Stamina"
                  value={beyblade.typeDistribution.stamina}
                  max={150}
                  color="#ffa502"
                />
              </div>

              {/* Physical Stats */}
              <div className="flex gap-4 mb-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Mass</p>
                  <p className="font-bold text-gray-900">{beyblade.mass}g</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Radius</p>
                  <p className="font-bold text-gray-900">{beyblade.radius}px</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Spin Steal</p>
                  <p className="font-bold text-gray-900">
                    {beyblade.spinStealFactor}x
                  </p>
                </div>
              </div>

              {/* Special Move */}
              {(beyblade as any).specialMove && (
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Special Move</p>
                  <p className="font-bold text-sm text-gray-900 mb-1">
                    {(beyblade as any).specialMove.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    Cost: {(beyblade as any).specialMove.powerCost} ⚡ |
                    Duration: {(beyblade as any).specialMove.flags.duration}s
                  </p>
                </div>
              )}

              {/* Contact Points Count */}
              <p className="text-xs text-gray-500 mt-2 mb-4">
                {beyblade.pointsOfContact.length} Contact Points (
                {beyblade.spinStealPoints?.length || 0} Spin Steal)
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // TODO: Implement edit functionality
                    console.log("Edit beyblade:", beyblade.id);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handlePreview(beyblade)}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => handleDeleteClick(beyblade)}
                  className="px-4 py-2 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredBeyblades.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No Beyblades found
          </h3>
          <p className="text-sm text-gray-500">
            Try adjusting your filters or search query
          </p>
        </div>
      )}

      {/* Image Upload Dialog */}
      {imageUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Upload Image for {selectedBeyblade?.name}
              </h2>
            </div>
            <div className="p-6">
              {selectedBeyblade && (
                <BeybladeImageUploader
                  beybladeId={selectedBeyblade.id}
                  currentImageUrl={selectedBeyblade.imageUrl}
                  onImageUploaded={handleImageUploaded}
                />
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setImageUploadOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewOpen && selectedBeyblade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700 flex items-center justify-between bg-gray-800">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {selectedBeyblade.name}
                </h2>
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block px-3 py-1 text-xs font-bold text-white rounded"
                    style={{
                      backgroundColor: getTypeColor(selectedBeyblade.type),
                    }}
                  >
                    {selectedBeyblade.type.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-400">
                    Spin: {selectedBeyblade.spinDirection}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="text-gray-400 hover:text-white text-3xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal Body - Preview */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <BeybladePreview
                  beyblade={selectedBeyblade}
                  onCanvasClick={undefined}
                  clickMode={false}
                />
              </div>

              {/* Stats Summary */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Attack</p>
                  <p className="text-2xl font-bold text-red-500">
                    {selectedBeyblade.typeDistribution.attack}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Defense</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {selectedBeyblade.typeDistribution.defense}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Stamina</p>
                  <p className="text-2xl font-bold text-green-500">
                    {selectedBeyblade.typeDistribution.stamina}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Total</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {selectedBeyblade.typeDistribution.total}
                  </p>
                </div>
              </div>

              {/* Physical Properties */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Mass</p>
                  <p className="text-lg font-bold text-white">
                    {selectedBeyblade.mass}g
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Radius</p>
                  <p className="text-lg font-bold text-white">
                    {selectedBeyblade.radius} cm
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Contact Points</p>
                  <p className="text-lg font-bold text-white">
                    {selectedBeyblade.pointsOfContact.length} (
                    {selectedBeyblade.spinStealPoints?.length || 0} steal)
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700 bg-gray-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setPreviewOpen(false);
                  // TODO: Open edit modal
                  console.log("Edit beyblade:", selectedBeyblade.id);
                }}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Beyblade
              </button>
              <button
                onClick={() => setPreviewOpen(false)}
                className="px-6 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && selectedBeyblade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Beyblade
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-bold">{selectedBeyblade.name}</span>? This
                will permanently remove the beyblade and all its data.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Beyblade"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Bar Component
function StatBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percentage = (value / max) * 100;

  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-bold text-gray-900">
          {value}/{max}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
