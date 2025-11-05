/**
 * Admin Page: Arena Management
 * View and manage all Arena configurations in the database
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArenaConfig } from "@/types/arenaConfig";
import ArenaCard from "@/components/admin/ArenaCard";
import ArenaPreviewModal from "@/components/admin/ArenaPreviewModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";

export default function ArenasPage() {
  const router = useRouter();
  const [arenas, setArenas] = useState<ArenaConfig[]>([]);
  const [selectedShape, setSelectedShape] = useState<string>("all");
  const [selectedTheme, setSelectedTheme] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [previewArena, setPreviewArena] = useState<ArenaConfig | null>(null);
  const [deleteConfirmArena, setDeleteConfirmArena] =
    useState<ArenaConfig | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchArenas();
  }, [selectedShape, selectedTheme]);

  const fetchArenas = async () => {
    setLoading(true);
    try {
      let url = "/api/arenas";
      const params = new URLSearchParams();

      if (selectedShape !== "all") params.append("shape", selectedShape);
      if (selectedTheme !== "all") params.append("theme", selectedTheme);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setArenas(data.data);
      }
    } catch (error) {
      console.error("Error fetching Arenas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArena = async (arena: ArenaConfig) => {
    setDeleteConfirmArena(arena);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmArena) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/arenas/${deleteConfirmArena.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchArenas();
        setDeleteConfirmArena(null);
      } else {
        alert(`Failed to delete: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting Arena:", error);
      alert("Failed to delete Arena");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Arena Management
            </h1>
            <p className="text-gray-600 mt-2">
              Create, edit, and manage Battle Arena configurations
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/game/arenas/create")}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm"
          >
            + Create New Arena
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shape Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Shape
              </label>
              <select
                value={selectedShape}
                onChange={(e) => setSelectedShape(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Shapes</option>
                <option value="circle">Circle</option>
                <option value="rectangle">Rectangle</option>
                <option value="pentagon">Pentagon</option>
                <option value="hexagon">Hexagon</option>
                <option value="octagon">Octagon</option>
                <option value="star">Star</option>
                <option value="oval">Oval</option>
                <option value="loop">Loop</option>
                <option value="racetrack">Racetrack</option>
              </select>
            </div>

            {/* Theme Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Theme
              </label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Themes</option>
                <option value="forest">Forest</option>
                <option value="mountains">Mountains</option>
                <option value="grasslands">Grasslands</option>
                <option value="metrocity">Metro City</option>
                <option value="safari">Safari</option>
                <option value="prehistoric">Prehistoric</option>
                <option value="futuristic">Futuristic</option>
                <option value="desert">Desert</option>
                <option value="sea">Sea</option>
                <option value="riverbank">Riverbank</option>
              </select>
            </div>
          </div>
        </div>

        {/* Arena Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Arenas...</p>
          </div>
        ) : arenas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No Arenas found.</p>
            <p className="text-gray-500 mt-2">
              Click "Create New Arena" to add your first Arena.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {arenas.map((arena) => (
              <ArenaCard
                key={arena.id}
                arena={arena}
                onPreview={setPreviewArena}
                onDelete={handleDeleteArena}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <ArenaPreviewModal
        arena={previewArena}
        onClose={() => setPreviewArena(null)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmArena !== null}
        itemName={deleteConfirmArena?.name || ""}
        itemType="Arena"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmArena(null)}
      />
    </div>
  );
}
