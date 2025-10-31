"use client";

import React from "react";
import { Dices, Loader2 } from "lucide-react";
import { useArenas } from "@/hooks/useArenas";
import { ArenaConfig } from "@/types/arenaConfig";

interface ArenaSelectProps {
  value: string;
  onChange: (arenaId: string) => void;
  label: string;
  disabled?: boolean;
  showRandomButton?: boolean;
}

export default function ArenaSelect({
  value,
  onChange,
  label,
  disabled = false,
  showRandomButton = false,
}: ArenaSelectProps) {
  const { arenas, loading, error } = useArenas();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  const handleRandomSelect = () => {
    if (arenas.length === 0) return;
    const randomIndex = Math.floor(Math.random() * arenas.length);
    const randomArena = arenas[randomIndex];
    if (randomArena?.id) {
      onChange(randomArena.id);
    }
  };

  const selectedArena = arenas.find((a) => a.id === value);

  const getShapeColor = (shape: string) => {
    const colors: Record<string, string> = {
      circle: "#3b82f6",
      rectangle: "#8b5cf6",
      pentagon: "#ec4899",
      hexagon: "#f59e0b",
      octagon: "#10b981",
      star: "#f97316",
      oval: "#06b6d4",
      loop: "#6366f1",
      racetrack: "#84cc16",
    };
    return colors[shape] || "#6b7280";
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="text-gray-700 dark:text-gray-300">
          Loading Arenas...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
        <div className="font-bold text-red-700 dark:text-red-400">
          ⚠️ Error Loading Arenas
        </div>
        <div className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (arenas.length === 0) {
    return (
      <div className="p-6 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 text-center">
        <div className="text-xl font-bold text-yellow-800 dark:text-yellow-400 mb-2">
          🏟️ No Arenas Available
        </div>
        <div className="text-sm text-yellow-700 dark:text-yellow-400 mb-4">
          No arenas found in the database. Please ask the admin to add arenas
          before starting a battle.
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 italic">
          Admin: Go to Admin → Game → Stadiums to create arenas
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 w-full">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <option value="">Select an Arena</option>
          {arenas.map((arena) => (
            <option key={arena.id} value={arena.id}>
              {arena.name} - {arena.shape.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Preview of Selected Arena */}
        {selectedArena && (
          <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex gap-4 mb-4">
              <div
                className="w-16 h-16 flex items-center justify-center text-3xl"
                style={{
                  borderRadius:
                    selectedArena.shape === "circle" ? "50%" : "8px",
                  backgroundColor: getShapeColor(selectedArena.shape),
                }}
              >
                🏟️
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  {selectedArena.name}
                </div>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span
                    className="px-2 py-1 rounded text-xs font-bold text-white"
                    style={{
                      backgroundColor: getShapeColor(selectedArena.shape),
                    }}
                  >
                    {selectedArena.shape.toUpperCase()}
                  </span>
                  {selectedArena.theme && (
                    <span className="px-2 py-1 rounded text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                      {selectedArena.theme.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <StatItem
                label="Loops"
                value={selectedArena.loops?.length || 0}
                icon="⭕"
              />
              <StatItem
                label="Exits"
                value={
                  selectedArena.exits?.filter((e) => e.enabled).length || 0
                }
                icon="🚪"
              />
              <StatItem
                label="Obstacles"
                value={selectedArena.obstacles?.length || 0}
                icon="🚧"
              />
              <StatItem
                label="Portals"
                value={selectedArena.portals?.length || 0}
                icon="🌀"
              />
            </div>

            {/* Description */}
            {selectedArena.description && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {selectedArena.description}
              </div>
            )}
          </div>
        )}
      </div>

      {showRandomButton && (
        <button
          onClick={handleRandomSelect}
          disabled={disabled || loading || arenas.length === 0}
          className="mt-8 p-3 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition-colors"
          title="Random Arena"
        >
          <Dices className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

// Stat Item Component
function StatItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-center">
      <div className="text-xs text-gray-600 dark:text-gray-400">
        {icon} {label}
      </div>
      <div className="font-bold text-sm text-gray-900 dark:text-gray-100">
        {value}
      </div>
    </div>
  );
}
