"use client";

import React from "react";
import { Dices, Loader2 } from "lucide-react";
import { useBeyblades } from "@/hooks/useBeyblades";
import { BeybladeStats } from "@/types/beybladeStats";

interface BeybladeSelectProps {
  value: string;
  onChange: (beybladeId: string) => void;
  label: string;
  disabled?: boolean;
  showRandomButton?: boolean;
}

export default function BeybladeSelect({
  value,
  onChange,
  label,
  disabled = false,
  showRandomButton = false,
}: BeybladeSelectProps) {
  const { beyblades, loading, error } = useBeyblades();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  const handleRandomSelect = () => {
    if (beyblades.length === 0) return;
    const randomIndex = Math.floor(Math.random() * beyblades.length);
    onChange(beyblades[randomIndex].id);
  };

  const selectedBeyblade = beyblades.find((b) => b.id === value);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      attack: "#ff4757",
      defense: "#5352ed",
      stamina: "#ffa502",
      balanced: "#2ed573",
    };
    return colors[type] || "#666";
  };

  const getTypeGradient = (type: string) => {
    const gradients: Record<string, string> = {
      attack: "linear-gradient(135deg, #ff4757 0%, #ff6348 100%)",
      defense: "linear-gradient(135deg, #5352ed 0%, #3742fa 100%)",
      stamina: "linear-gradient(135deg, #ffa502 0%, #ff6348 100%)",
      balanced: "linear-gradient(135deg, #2ed573 0%, #7bed9f 100%)",
    };
    return gradients[type] || "linear-gradient(135deg, #666 0%, #999 100%)";
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="text-gray-700 dark:text-gray-300">
          Loading Beyblades...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
        <div className="font-bold text-red-700 dark:text-red-400">
          ⚠️ Error Loading Beyblades
        </div>
        <div className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (beyblades.length === 0) {
    return (
      <div className="p-6 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 text-center">
        <div className="text-xl font-bold text-yellow-800 dark:text-yellow-400 mb-2">
          🎮 No Beyblades Available
        </div>
        <div className="text-sm text-yellow-700 dark:text-yellow-400 mb-4">
          No beyblades found in the database. Please ask the admin to add
          beyblades before starting a battle.
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 italic">
          Admin: Go to Admin → Game → Beyblades to create beyblades
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
          <option value="">Select a Beyblade</option>
          {beyblades.map((beyblade) => (
            <option key={beyblade.id} value={beyblade.id}>
              {beyblade.displayName || beyblade.name} -{" "}
              {beyblade.type.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Preview of Selected Beyblade */}
        {selectedBeyblade && (
          <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex gap-4 mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                style={{
                  background: selectedBeyblade.imageUrl
                    ? `url(${selectedBeyblade.imageUrl}) center/cover`
                    : getTypeGradient(selectedBeyblade.type),
                }}
              >
                {!selectedBeyblade.imageUrl &&
                  (selectedBeyblade.displayName?.charAt(0) ||
                    selectedBeyblade.name?.charAt(0) ||
                    "?")}
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  {selectedBeyblade.displayName || selectedBeyblade.name}
                </div>
                <div className="flex gap-2 mt-1">
                  <span
                    className="px-2 py-1 rounded text-xs font-bold text-white"
                    style={{
                      backgroundColor: getTypeColor(selectedBeyblade.type),
                    }}
                  >
                    {selectedBeyblade.type.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                    {selectedBeyblade.spinDirection.toUpperCase()} SPIN
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
              <StatChip
                label="Attack"
                value={selectedBeyblade.typeDistribution.attack}
                max={150}
                color="#ff4757"
              />
              <StatChip
                label="Defense"
                value={selectedBeyblade.typeDistribution.defense}
                max={150}
                color="#5352ed"
              />
              <StatChip
                label="Stamina"
                value={selectedBeyblade.typeDistribution.stamina}
                max={150}
                color="#ffa502"
              />
            </div>
          </div>
        )}
      </div>

      {showRandomButton && (
        <button
          onClick={handleRandomSelect}
          disabled={disabled || loading || beyblades.length === 0}
          className="mt-8 p-3 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition-colors"
          title="Random Beyblade"
        >
          <Dices className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

// Stat Chip Component
function StatChip({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percentage = (value / max) * 100;

  return (
    <div className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-center">
      <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
      <div className="font-bold text-sm" style={{ color }}>
        {value}
      </div>
      <div className="mt-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
