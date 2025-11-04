/**
 * Create Stadium Page
 * Full-page form for creating a new Stadium/Arena
 */

"use client";

import { useRouter } from "next/navigation";
import ArenaConfigurator from "@/components/admin/ArenaConfigurator";
import { ArenaConfig } from "@/types/arenaConfig";

export default function CreateStadiumPage() {
  const router = useRouter();

  const handleSave = async (arena: ArenaConfig) => {
    try {
      const response = await fetch("/api/arenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arena),
      });

      const data = await response.json();

      if (data.success) {
        alert("Stadium created successfully!");
        router.push("/admin/game/stadiums");
      } else {
        alert(`Failed to create Stadium: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating Stadium:", error);
      alert("Failed to create Stadium");
    }
  };

  const handleCancel = () => {
    router.push("/admin/game/stadiums");
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
                Create New Stadium
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Configure all properties for your new battle stadium
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-7xl mx-auto">
        <ArenaConfigurator
          arena={null}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
