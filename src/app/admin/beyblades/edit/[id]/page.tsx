/**
 * Edit Beyblade Page
 * Full-page form for editing an existing Beyblade
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MultiStepBeybladeEditor from "@/components/admin/MultiStepBeybladeEditor";
import { BeybladeStats } from "@/types/beybladeStats";

export default function EditBeybladePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [beyblade, setBeyblade] = useState<BeybladeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBeyblade();
  }, [params.id]);

  const fetchBeyblade = async () => {
    try {
      const response = await fetch(`/api/beyblades/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setBeyblade(data.data);
      } else {
        alert("Beyblade not found");
        router.push("/admin/beyblade-stats");
      }
    } catch (error) {
      console.error("Error fetching Beyblade:", error);
      alert("Failed to load Beyblade");
      router.push("/admin/beyblade-stats");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedBeyblade: Partial<BeybladeStats>) => {
    try {
      const response = await fetch(`/api/beyblades/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedBeyblade),
      });

      const data = await response.json();

      if (data.success) {
        alert("Beyblade updated successfully!");
        router.push("/admin/beyblade-stats");
      } else {
        alert(`Failed to update Beyblade: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating Beyblade:", error);
      alert("Failed to update Beyblade");
    }
  };

  const handleCancel = () => {
    router.push("/admin/beyblade-stats");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading Beyblade...</p>
        </div>
      </div>
    );
  }

  if (!beyblade) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Beyblade: {beyblade.displayName}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Modify properties and stats for this Beyblade
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-7xl mx-auto">
        <MultiStepBeybladeEditor
          beyblade={beyblade}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
