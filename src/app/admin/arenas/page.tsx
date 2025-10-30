/**
 * Admin Page: Arena/Stadium Manager
 * Create, edit, and manage battle arenas with live preview
 */

"use client";

import { useState, useEffect } from "react";
import { ArenaConfig } from "@/types/arenaConfig";
import ArenaConfigurator from "@/components/admin/ArenaConfigurator";
import ArenaPreview from "@/components/admin/ArenaPreview";

export default function ArenasAdmin() {
  const [arenas, setArenas] = useState<ArenaConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArena, setEditingArena] = useState<ArenaConfig | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [previewArena, setPreviewArena] = useState<ArenaConfig | null>(null);

  useEffect(() => {
    fetchArenas();
  }, []);

  const fetchArenas = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/arenas");
      const data = await response.json();

      if (data.success) {
        setArenas(data.data);
      }
    } catch (error) {
      console.error("Error fetching arenas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveArena = async (arena: ArenaConfig) => {
    try {
      const url = arena.id ? `/api/arenas/${arena.id}` : "/api/arenas";
      const method = arena.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arena),
      });

      const data = await response.json();

      if (data.success) {
        fetchArenas();
        setShowCreateForm(false);
        setEditingArena(null);
        alert(`Arena ${arena.id ? "updated" : "created"} successfully!`);
      } else {
        alert(`Failed to save arena: ${data.message}`);
      }
    } catch (error) {
      console.error("Error saving arena:", error);
      alert("Failed to save arena");
    }
  };

  const handleDeleteArena = async (arenaId: string) => {
    if (!confirm("Are you sure you want to delete this arena?")) return;

    try {
      const response = await fetch(`/api/arenas/${arenaId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchArenas();
        alert("Arena deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting arena:", error);
      alert("Failed to delete arena");
    }
  };

  const handleSetDefault = async (arenaId: string) => {
    try {
      const response = await fetch(`/api/arenas/${arenaId}/set-default`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        fetchArenas();
        alert("Default arena updated!");
      }
    } catch (error) {
      console.error("Error setting default arena:", error);
      alert("Failed to set default arena");
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "hard":
        return "text-orange-600 bg-orange-50";
      case "extreme":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getShapeIcon = (shape: string) => {
    switch (shape) {
      case "circle":
        return "⭕";
      case "rectangle":
        return "▭";
      case "pentagon":
        return "⬠";
      case "hexagon":
        return "⬡";
      case "octagon":
        return "⯃";
      case "star":
        return "⭐";
      case "oval":
        return "⬭";
      case "loop":
        return "🔄";
      default:
        return "◯";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Arena Management
            </h1>
            <p className="text-gray-600 mt-2">
              Create and manage battle arenas with custom shapes, hazards, and
              features
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg"
          >
            + Create New Arena
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">Total Arenas</div>
          <div className="text-2xl font-bold text-gray-900">
            {arenas.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">With Hazards</div>
          <div className="text-2xl font-bold text-gray-900">
            {
              arenas.filter((a) => a.obstacles.length > 0 || a.pits.length > 0)
                .length
            }
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">With Loops</div>
          <div className="text-2xl font-bold text-gray-900">
            {arenas.filter((a) => a.loops.length > 0).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">With Goals</div>
          <div className="text-2xl font-bold text-gray-900">
            {arenas.filter((a) => a.goalObjects.length > 0).length}
          </div>
        </div>
      </div>

      {/* Arena List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading arenas...</p>
        </div>
      ) : arenas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🏟️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Arenas Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first battle arena to get started
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Create First Arena
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {arenas.map((arena) => (
            <div
              key={arena.id}
              className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Preview Area */}
              <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 border-b border-gray-200 flex items-center justify-center relative">
                <ArenaPreview arena={arena} width={300} height={192} />
                {arena.difficulty === "easy" && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs rounded font-semibold">
                    DEFAULT
                  </div>
                )}
              </div>

              {/* Arena Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <span className="text-2xl">
                        {getShapeIcon(arena.shape)}
                      </span>
                      {arena.name}
                    </h3>
                    {arena.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {arena.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Shape:</span>
                    <span className="font-semibold capitalize">
                      {arena.shape}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Theme:</span>
                    <span className="font-semibold capitalize">
                      {arena.theme}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Loops:</span>
                    <span className="font-semibold">{arena.loops.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Hazards:</span>
                    <span className="font-semibold">
                      {arena.obstacles.length +
                        arena.pits.length +
                        arena.laserGuns.length}
                    </span>
                  </div>
                </div>

                {/* Difficulty Badge */}
                {arena.difficulty && (
                  <div className="mb-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${getDifficultyColor(
                        arena.difficulty
                      )}`}
                    >
                      {arena.difficulty}
                    </span>
                  </div>
                )}

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {arena.wall.hasSpikes && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                      🔺 Spikes
                    </span>
                  )}
                  {arena.wall.hasSprings && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                      🔸 Springs
                    </span>
                  )}
                  {arena.waterBody?.enabled && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      💧 Water
                    </span>
                  )}
                  {arena.exits.length > 0 && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                      🚪 Exits ({arena.exits.length})
                    </span>
                  )}
                  {arena.goalObjects.length > 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      🎯 Goals ({arena.goalObjects.length})
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewArena(arena)}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
                  >
                    👁️ Preview
                  </button>
                  <button
                    onClick={() => setEditingArena(arena)}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleSetDefault(arena.id!)}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium"
                    title="Set as default"
                  >
                    ⭐
                  </button>
                  <button
                    onClick={() => handleDeleteArena(arena.id!)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateForm || editingArena) && (
        <ArenaConfigurator
          arena={editingArena}
          onSave={handleSaveArena}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingArena(null);
          }}
        />
      )}

      {/* Full Preview Modal */}
      {previewArena && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {previewArena.name}
              </h2>
              <button
                onClick={() => setPreviewArena(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <ArenaPreview arena={previewArena} width={800} height={800} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
