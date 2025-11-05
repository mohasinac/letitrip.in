/**
 * ObstaclesTab Component
 * Handles theme-based destructible obstacle configuration
 */

"use client";

import React from "react";
import {
  ArenaConfig,
  OBSTACLE_ICONS,
  ObstacleConfig,
} from "@/types/arenaConfigNew";

const ARENA_RESOLUTION = 1080;

interface ObstaclesTabProps {
  config: ArenaConfig;
  setConfig: (config: ArenaConfig) => void;
}

export default function ObstaclesTab({ config, setConfig }: ObstaclesTabProps) {
  const obstacles = config.obstacles || [];
  const obstacleIcon = OBSTACLE_ICONS[config.theme] || "🔷";

  // Auto-place obstacles randomly
  const handleAutoPlaceObstacles = (count: number) => {
    const newObstacles: ObstacleConfig[] = [];
    const safeRadius = ARENA_RESOLUTION * 0.1; // Keep obstacles away from center (10% radius)
    const maxRadius = ARENA_RESOLUTION * 0.4; // Keep obstacles within 40% radius

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3; // Distribute with randomness
      const distance = safeRadius + Math.random() * (maxRadius - safeRadius);

      newObstacles.push({
        id: i + 1,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        radius: 20 + Math.random() * 15, // 20-35px
        health: Math.floor(2 + Math.random() * 3), // 2-4 health
        damage: Math.floor(10 + Math.random() * 15), // 10-25 damage
        recoilDistance: Math.floor(30 + Math.random() * 40), // 30-70px recoil
        indestructible: false,
        autoPlaced: true,
      });
    }

    setConfig({
      ...config,
      obstacles: newObstacles,
    });
  };

  // Add manual obstacle
  const handleAddObstacle = () => {
    if (obstacles.length >= 10) return;

    const newObstacles = [...obstacles];
    newObstacles.push({
      id: obstacles.length + 1,
      x: 0,
      y: 0,
      radius: 25,
      health: 3,
      damage: 15,
      recoilDistance: 50,
      indestructible: false,
      autoPlaced: false,
    });

    setConfig({
      ...config,
      obstacles: newObstacles,
    });
  };

  // Remove obstacle
  const handleRemoveObstacle = (index: number) => {
    const newObstacles = [...obstacles];
    newObstacles.splice(index, 1);
    setConfig({
      ...config,
      obstacles: newObstacles,
    });
  };

  // Update obstacle property
  const handleUpdateObstacle = (
    index: number,
    property: keyof ObstacleConfig,
    value: number | string | boolean
  ) => {
    const newObstacles = [...obstacles];
    (newObstacles[index] as any)[property] = value;
    setConfig({
      ...config,
      obstacles: newObstacles,
    });
  };

  // Clear all obstacles
  const handleClearObstacles = () => {
    setConfig({
      ...config,
      obstacles: [],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">
              Obstacles ({obstacles.length}/10)
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Theme-based destructible obstacles:{" "}
              <span className="text-2xl">{obstacleIcon}</span> ({config.theme})
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddObstacle}
              disabled={obstacles.length >= 10}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              + Add Obstacle
            </button>
          </div>
        </div>
      </div>

      {/* Auto-Place Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Setup</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[3, 5, 8].map((count) => (
            <button
              key={count}
              onClick={() => handleAutoPlaceObstacles(count)}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
            >
              🎲 Place {count}
            </button>
          ))}
        </div>
        {obstacles.length > 0 && (
          <button
            onClick={handleClearObstacles}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Obstacle List */}
      {obstacles.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400 text-lg mb-2">No obstacles yet</p>
          <p className="text-sm text-gray-500">
            Add obstacles to create destructible hazards that damage beyblades
            on collision
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {obstacles.map((obstacle, idx) => (
            <div key={idx} className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-2xl">{obstacleIcon}</span>
                  Obstacle {idx + 1}
                  {obstacle.autoPlaced && (
                    <span className="text-xs px-2 py-1 bg-purple-600 rounded">
                      Auto
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => handleRemoveObstacle(idx)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Position X */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Position X: {obstacle.x.toFixed(0)}px
                  </label>
                  <input
                    type="range"
                    value={obstacle.x}
                    onChange={(e) =>
                      handleUpdateObstacle(idx, "x", parseFloat(e.target.value))
                    }
                    min={-ARENA_RESOLUTION / 2 + 50}
                    max={ARENA_RESOLUTION / 2 - 50}
                    step={5}
                    className="w-full"
                  />
                  <input
                    type="number"
                    value={obstacle.x}
                    onChange={(e) =>
                      handleUpdateObstacle(idx, "x", parseFloat(e.target.value))
                    }
                    className="w-full mt-2 px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  />
                </div>

                {/* Position Y */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Position Y: {obstacle.y.toFixed(0)}px
                  </label>
                  <input
                    type="range"
                    value={obstacle.y}
                    onChange={(e) =>
                      handleUpdateObstacle(idx, "y", parseFloat(e.target.value))
                    }
                    min={-ARENA_RESOLUTION / 2 + 50}
                    max={ARENA_RESOLUTION / 2 - 50}
                    step={5}
                    className="w-full"
                  />
                  <input
                    type="number"
                    value={obstacle.y}
                    onChange={(e) =>
                      handleUpdateObstacle(idx, "y", parseFloat(e.target.value))
                    }
                    className="w-full mt-2 px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  />
                </div>

                {/* Radius */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Size: {obstacle.radius.toFixed(0)}px
                  </label>
                  <input
                    type="range"
                    value={obstacle.radius}
                    onChange={(e) =>
                      handleUpdateObstacle(
                        idx,
                        "radius",
                        parseFloat(e.target.value)
                      )
                    }
                    min={10}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Collision radius
                  </div>
                </div>

                {/* Health */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Health: {obstacle.indestructible ? "∞" : `${obstacle.health} HP`}
                  </label>
                  <input
                    type="range"
                    value={obstacle.health}
                    onChange={(e) =>
                      handleUpdateObstacle(
                        idx,
                        "health",
                        parseInt(e.target.value)
                      )
                    }
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                    disabled={obstacle.indestructible}
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {obstacle.indestructible ? "Indestructible" : "Hits before destruction"}
                  </div>
                </div>

                {/* Indestructible Toggle */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Indestructible
                  </label>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="checkbox"
                      checked={obstacle.indestructible || false}
                      onChange={(e) =>
                        handleUpdateObstacle(
                          idx,
                          "indestructible",
                          e.target.checked
                        )
                      }
                      className="w-5 h-5 cursor-pointer"
                      id={`obstacle-indestructible-${idx}`}
                    />
                    <label
                      htmlFor={`obstacle-indestructible-${idx}`}
                      className="text-sm cursor-pointer"
                    >
                      Cannot be destroyed
                    </label>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Permanent obstacle (ignores health)
                  </div>
                </div>

                {/* Damage */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Damage: {obstacle.damage}
                  </label>
                  <input
                    type="range"
                    value={obstacle.damage}
                    onChange={(e) =>
                      handleUpdateObstacle(
                        idx,
                        "damage",
                        parseInt(e.target.value)
                      )
                    }
                    min={5}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Damage dealt on collision
                  </div>
                </div>

                {/* Recoil Distance */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Recoil: {obstacle.recoilDistance}px
                  </label>
                  <input
                    type="range"
                    value={obstacle.recoilDistance}
                    onChange={(e) =>
                      handleUpdateObstacle(
                        idx,
                        "recoilDistance",
                        parseInt(e.target.value)
                      )
                    }
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Knockback distance
                  </div>
                </div>

                {/* Custom Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Custom Color (optional)
                  </label>
                  <input
                    type="color"
                    value={obstacle.color || "#888888"}
                    onChange={(e) =>
                      handleUpdateObstacle(idx, "color", e.target.value)
                    }
                    className="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Leave default for theme color
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          ℹ️ How Obstacles Work
        </h4>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• Obstacles are destructible hazards themed to your arena</li>
          <li>
            • Each obstacle has health points - it breaks after taking enough
            hits
          </li>
          <li>
            • Colliding with obstacles damages your beyblade and causes
            knockback
          </li>
          <li>• Higher damage and recoil make obstacles more dangerous</li>
          <li>• Use auto-place for quick random distribution</li>
        </ul>
      </div>
    </div>
  );
}
