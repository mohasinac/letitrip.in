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

export default function BeybladeManagement() {
  const [beyblades, setBeyblades] = useState<BeybladeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [selectedBeyblade, setSelectedBeyblade] =
    useState<BeybladeStats | null>(null);

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
        b.id === selectedBeyblade?.id ? { ...b, imageUrl } : b,
      ),
    );
    setImageUploadOpen(false);
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
      (bey.name && bey.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
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
                    Cost: {(beyblade as any).specialMove.powerCost} ⚡ | Duration:{" "}
                    {(beyblade as any).specialMove.flags.duration}s
                  </p>
                </div>
              )}

              {/* Contact Points Count */}
              <p className="text-xs text-gray-500 mt-2">
                {beyblade.pointsOfContact.length} Contact Points
              </p>
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
