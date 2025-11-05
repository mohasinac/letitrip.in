/**
 * Admin Page: Beyblade Management
 * View and manage all Beyblades in the database
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BeybladeStats } from "@/types/beybladeStats";
import BeybladeCard from "@/components/admin/BeybladeCard";
import BeybladePreviewModal from "@/components/admin/BeybladePreviewModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";

export default function BeybladesPage() {
  const router = useRouter();
  const [beyblades, setBeyblades] = useState<BeybladeStats[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [previewBeyblade, setPreviewBeyblade] = useState<BeybladeStats | null>(
    null
  );
  const [deleteConfirmBeyblade, setDeleteConfirmBeyblade] =
    useState<BeybladeStats | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleImageUploaded = (beybladeId: string, imageUrl: string) => {
    setBeyblades((prev) =>
      prev.map((b) => (b.id === beybladeId ? { ...b, imageUrl } : b))
    );
  };

  const handlePointsOfContactUpdated = (
    beybladeId: string,
    points: BeybladeStats["pointsOfContact"]
  ) => {
    setBeyblades((prev) =>
      prev.map((b) =>
        b.id === beybladeId ? { ...b, pointsOfContact: points } : b
      )
    );
  };

  const handleDeleteBeyblade = async (beyblade: BeybladeStats) => {
    setDeleteConfirmBeyblade(beyblade);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmBeyblade) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/beyblades/${deleteConfirmBeyblade.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        fetchBeyblades();
        setDeleteConfirmBeyblade(null);
      } else {
        alert(`Failed to delete: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting Beyblade:", error);
      alert("Failed to delete Beyblade");
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
              Beyblade Management
            </h1>
            <p className="text-gray-600 mt-2">
              Create, edit, and manage Beyblade configurations
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/game/beyblades/create")}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm"
          >
            + Create New Beyblade
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="attack">Attack</option>
            <option value="defense">Defense</option>
            <option value="stamina">Stamina</option>
            <option value="balance">Balance</option>
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
              Click "Create New Beyblade" to add your first Beyblade.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beyblades.map((beyblade) => (
              <BeybladeCard
                key={beyblade.id}
                beyblade={beyblade}
                onImageUploaded={handleImageUploaded}
                onPointsOfContactUpdated={handlePointsOfContactUpdated}
                onPreview={setPreviewBeyblade}
                onDelete={handleDeleteBeyblade}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <BeybladePreviewModal
        beyblade={previewBeyblade}
        onClose={() => setPreviewBeyblade(null)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmBeyblade !== null}
        itemName={deleteConfirmBeyblade?.displayName || ""}
        itemType="Beyblade"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmBeyblade(null)}
      />
    </div>
  );
}
