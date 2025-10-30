/**
 * Admin Page: Stadium Management
 * View and manage all battle stadiums/arenas
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArenaConfig } from "@/types/arenaConfig";
import ArenaPreview from "@/components/admin/ArenaPreview";

export default function StadiumsPage() {
  const router = useRouter();
  const [arenas, setArenas] = useState<ArenaConfig[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleDeleteArena = async (arenaId: string) => {
    if (!confirm("Are you sure you want to delete this stadium?")) return;

    try {
      const response = await fetch(`/api/arenas/${arenaId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchArenas();
        alert("Stadium deleted successfully!");
      } else {
        alert(`Failed to delete: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting arena:", error);
      alert("Failed to delete stadium");
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
        alert("Default stadium updated!");
      }
    } catch (error) {
      console.error("Error setting default arena:", error);
      alert("Failed to set default stadium");
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Stadium Management
            </h1>
            <p className="text-gray-600 mt-2">
              Create, edit, and manage battle stadium configurations
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/game/stadiums/create")}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm"
          >
            + Create New Stadium
          </button>
        </div>

        {/* Arena Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Stadiums...</p>
          </div>
        ) : arenas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No Stadiums found.</p>
            <p className="text-gray-500 mt-2">
              Click "Create New Stadium" to add your first stadium.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {arenas.map((arena) => (
              <div
                key={arena.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                {/* Arena Preview */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {getShapeIcon(arena.shape)}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">                        {arena.displayName}
                      </h3>
                    </div>
                  </div>
                  </div>

                  {/* Live Preview */}
                  <div className="bg-gray-900 rounded-lg p-4 mb-4 flex justify-center">
                    <ArenaPreview arena={arena} width={250} height={250} />
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        router.push(`/admin/game/stadiums/edit/${arena.id}`)
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    {!arena.isDefault && (
                      <button
                        onClick={() => handleSetDefault(arena.id)}
                        className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => setPreviewArena(arena)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDeleteArena(arena.id)}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shape:</span>
                    <span className="font-semibold capitalize">
                      {arena.shape}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-semibold">{arena.radius}px</span>
                  </div>
                  {arena.difficulty && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Difficulty:</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getDifficultyColor(
                          arena.difficulty
                        )}`}
                      >
                        {arena.difficulty}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Obstacles:</span>
                    <span className="font-semibold">
                      {arena.obstacles?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spin Zones:</span>
                    <span className="font-semibold">
                      {arena.spinZones?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        {previewArena && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">{previewArena.name}</h3>
                <button
                  onClick={() => setPreviewArena(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="bg-gray-900 rounded-lg p-8 flex justify-center">
                <ArenaPreview config={previewArena} size={600} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
