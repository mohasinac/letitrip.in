"use client";

import React, { useState } from "react";
import ArenaConfiguratorNew from "@/components/admin/ArenaConfiguratorNew";
import { ArenaConfig } from "@/types/arenaConfigNew";

export default function NewArenaConfiguratorPage() {
  const [arena, setArena] = useState<ArenaConfig | null>(null);
  const [showConfigurator, setShowConfigurator] = useState(true);

  const handleSave = (savedArena: ArenaConfig) => {
    setArena(savedArena);
    setShowConfigurator(false);
    console.log("Arena saved:", savedArena);
    alert(`Arena "${savedArena.name}" saved successfully!`);
  };

  const handleCancel = () => {
    setShowConfigurator(false);
  };

  const handleEdit = () => {
    setShowConfigurator(true);
  };

  const handleCreateNew = () => {
    setArena(null);
    setShowConfigurator(true);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {showConfigurator ? (
        <ArenaConfiguratorNew
          arena={arena}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-gray-800 rounded-lg p-8 text-white">
            <h1 className="text-3xl font-bold mb-4">Arena Saved!</h1>
            {arena && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{arena.name}</h2>
                  <p className="text-gray-400">{arena.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Shape:</span>{" "}
                    <span className="font-semibold">{arena.shape}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Theme:</span>{" "}
                    <span className="font-semibold">{arena.theme}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Auto-Rotate:</span>{" "}
                    <span className="font-semibold">
                      {arena.autoRotate ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Walls:</span>{" "}
                    <span className="font-semibold">
                      {arena.wall.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-700 rounded p-4">
                  <h3 className="font-semibold mb-2">Configuration JSON</h3>
                  <pre className="text-xs overflow-auto max-h-96 bg-gray-900 p-4 rounded">
                    {JSON.stringify(arena, null, 2)}
                  </pre>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleEdit}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                  >
                    Edit Arena
                  </button>
                  <button
                    onClick={handleCreateNew}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
                  >
                    Create New Arena
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
