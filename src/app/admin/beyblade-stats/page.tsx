/**
 * Admin Page: Beyblade Stats Manager
 * View and manage all Beyblade stats in the database
 */

"use client";

import { useState, useEffect } from "react";
import { BeybladeStats } from "@/types/beybladeStats";
import BeybladeImageUploader from "@/components/admin/BeybladeImageUploader";

export default function BeybladeStatsAdmin() {
  const [beyblades, setBeyblades] = useState<BeybladeStats[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [editingImageFor, setEditingImageFor] = useState<string | null>(null);

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

  const initializeDefaults = async () => {
    if (
      !confirm(
        "Initialize default Beyblade stats? This will not overwrite existing data."
      )
    ) {
      return;
    }

    setInitializing(true);
    try {
      const response = await fetch("/api/beyblades/init", { method: "POST" });
      const data = await response.json();

      if (data.success) {
        alert("Default Beyblade stats initialized successfully!");
        fetchBeyblades();
      } else {
        alert("Failed to initialize: " + data.error);
      }
    } catch (error) {
      console.error("Error initializing:", error);
      alert("Error initializing Beyblade stats");
    } finally {
      setInitializing(false);
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
    // Update the beyblade in the list
    setBeyblades((prev) =>
      prev.map((bey) => (bey.id === beybladeId ? { ...bey, imageUrl } : bey))
    );
    setEditingImageFor(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Beyblade Stats Manager
            </h1>
            <p className="text-gray-600 mt-2">
              Manage Beyblade statistics and special moves
            </p>
          </div>
          <button
            onClick={initializeDefaults}
            disabled={initializing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {initializing ? "Initializing..." : "Initialize Defaults"}
          </button>
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

        {/* Stats Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Beyblades...</p>
          </div>
        ) : beyblades.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No Beyblades found.</p>
            <p className="text-gray-500 mt-2">
              Click "Initialize Defaults" to add the default Beyblades.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beyblades.map((beyblade) => (
              <div
                key={beyblade.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                {/* Header with Image */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Beyblade Image */}
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
                          Spin: {beyblade.spinDirection}
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

                {/* Stats */}
                <div className="p-6 space-y-4">
                  {/* Physical Properties */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Physical
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Mass</p>
                        <p className="font-semibold">{beyblade.mass} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Radius</p>
                        <p className="font-semibold">{beyblade.radius} px</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Size</p>
                        <p className="font-semibold">
                          {beyblade.actualSize} px
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Type Distribution */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Type Distribution (320)
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-red-600">Attack</span>
                          <span className="font-semibold">
                            {beyblade.typeDistribution.attack}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (beyblade.typeDistribution.attack / 150) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-blue-600">Defense</span>
                          <span className="font-semibold">
                            {beyblade.typeDistribution.defense}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (beyblade.typeDistribution.defense / 150) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-green-600">Stamina</span>
                          <span className="font-semibold">
                            {beyblade.typeDistribution.stamina}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (beyblade.typeDistribution.stamina / 150) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Spin Properties */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Spin Properties
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Max Spin</p>
                        <p className="font-semibold">{beyblade.maxSpin}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Decay Rate</p>
                        <p className="font-semibold">
                          {beyblade.spinDecayRate}/s
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500">Spin Steal Factor</p>
                        <p className="font-semibold">
                          {(beyblade.spinStealFactor * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Special Move */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Special Move
                    </h4>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
                      <p className="font-semibold text-purple-900">
                        {beyblade.specialMove.name}
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        {beyblade.specialMove.description}
                      </p>
                      <div className="flex gap-2 mt-2 text-xs">
                        <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded">
                          Power: {beyblade.specialMove.powerCost}
                        </span>
                        <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded">
                          Duration: {beyblade.specialMove.flags.duration}s
                        </span>
                        <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded">
                          CD: {beyblade.specialMove.flags.cooldown}s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Points */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Contact Points ({beyblade.pointsOfContact.length})
                    </h4>
                    <div className="text-xs text-gray-600">
                      Max Damage:{" "}
                      {Math.max(
                        ...beyblade.pointsOfContact.map(
                          (p) => p.damageMultiplier
                        )
                      ).toFixed(1)}
                      x
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
