/**
 * Create Beyblade Page
 * Full-page form for creating a new Beyblade
 */

"use client";

import { useRouter } from "next/navigation";
import MultiStepBeybladeEditor from "@/components/admin/MultiStepBeybladeEditor";
import { BeybladeStats } from "@/types/beybladeStats";

export default function CreateBeybladePage() {
  const router = useRouter();

  const handleSave = async (beyblade: Partial<BeybladeStats>) => {
    try {
      const response = await fetch("/api/beyblades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(beyblade),
      });

      const data = await response.json();

      if (data.success) {
        alert("Beyblade created successfully!");
        router.push("/admin/beyblade-stats");
      } else {
        alert(`Failed to create Beyblade: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating Beyblade:", error);
      alert("Failed to create Beyblade");
    }
  };

  const handleCancel = () => {
    router.push("/admin/beyblade-stats");
  };

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
                Create New Beyblade
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Configure all properties and stats for your new Beyblade
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-7xl mx-auto">
        <MultiStepBeybladeEditor
          beyblade={null}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
