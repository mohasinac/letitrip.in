/**
 * Admin Page: Stadium Management (New Schema - v2)
 * List, create, edit, and delete stadiums using the new arena configuration system
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ArenaPreviewBasic from "@/components/admin/ArenaPreviewBasic";
import { ArenaConfig } from "@/types/arenaConfigNew";

export default function StadiumsV2Page() {
  const router = useRouter();
  const [arenas, setArenas] = useState<ArenaConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArena, setSelectedArena] = useState<ArenaConfig | null>(null);

  useEffect(() => {
    fetchArenas();
  }, []);

  const fetchArenas = async () => {
    try {
      const response = await fetch("/api/arenas");
      const data = await response.json();

      if (data.success) {
        setArenas(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching arenas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stadium?")) return;

    try {
      const response = await fetch(`/api/arenas/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Stadium deleted successfully!");
        fetchArenas();
      } else {
        alert(`Failed to delete stadium: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting stadium:", error);
      alert("Failed to delete stadium");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Stadiums...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Stadium Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Create and manage battle stadiums with advanced features
              </p>
            </div>
            <button
              onClick={() => router.push("/admin/game/stadiums/create")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Create New Stadium
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {arenas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Stadiums Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first stadium to get started
            </p>
            <button
              onClick={() => router.push("/admin/game/stadiums/create")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Stadium
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {arenas.map((arena: any) => (
              <div
                key={arena.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedArena(arena)}
              >
                <div className="p-6">
                  {/* Arena Preview */}
                  <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <ArenaPreviewBasic arena={arena} width={300} height={300} />
                  </div>

                  {/* Arena Info */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {arena.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {arena.description || "No description"}
                  </p>

                  {/* Arena Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="bg-gray-50 rounded p-2">
                      <span className="text-gray-500">Shape:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {arena.shape}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <span className="text-gray-500">Theme:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {arena.theme}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <span className="text-gray-500">Speed Paths:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {arena.speedPaths?.length || 0}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <span className="text-gray-500">Portals:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {arena.portals?.length || 0}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <span className="text-gray-500">Water Bodies:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {arena.waterBodies?.length || 0}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <span className="text-gray-500">Pits:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {arena.pits?.length || 0}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/game/stadiums/edit/${arena.id}`);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(arena.id);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedArena && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedArena(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedArena.name}
                </h2>
                <button
                  onClick={() => setSelectedArena(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="flex justify-center mb-6">
                <ArenaPreviewBasic
                  arena={selectedArena}
                  width={600}
                  height={600}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Description
                  </h3>
                  <p className="text-gray-600">
                    {selectedArena.description || "No description"}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Shape</div>
                    <div className="font-semibold text-gray-900">
                      {selectedArena.shape}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Theme</div>
                    <div className="font-semibold text-gray-900">
                      {selectedArena.theme}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">
                      Auto Rotate
                    </div>
                    <div className="font-semibold text-gray-900">
                      {selectedArena.autoRotate ? "Yes" : "No"}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">
                      Speed Paths
                    </div>
                    <div className="font-semibold text-gray-900">
                      {selectedArena.speedPaths?.length || 0}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Portals</div>
                    <div className="font-semibold text-gray-900">
                      {selectedArena.portals?.length || 0}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">
                      Water Bodies
                    </div>
                    <div className="font-semibold text-gray-900">
                      {selectedArena.waterBodies?.length || 0}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Pits</div>
                    <div className="font-semibold text-gray-900">
                      {selectedArena.pits?.length || 0}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">
                      Wall Enabled
                    </div>
                    <div className="font-semibold text-gray-900">
                      {selectedArena.wall?.enabled ? "Yes" : "No"}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => {
                      setSelectedArena(null);
                      router.push(
                        `/admin/game/stadiums/edit/${(selectedArena as any).id}`
                      );
                    }}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit Stadium
                  </button>
                  <button
                    onClick={() => setSelectedArena(null)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
