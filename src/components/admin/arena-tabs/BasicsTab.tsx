/**
 * Basics Tab - Arena Name, Shape, Theme, and Rotation Settings
 */

"use client";

import React from "react";
import {
  ArenaConfig,
  ArenaShape,
  ArenaTheme,
  ARENA_PRESETS,
} from "@/types/arenaConfigNew";

interface BasicsTabProps {
  config: ArenaConfig;
  setConfig: (config: ArenaConfig) => void;
  onShapeChange: (shape: ArenaShape) => void;
  onLoadPreset: (presetKey: keyof typeof ARENA_PRESETS) => void;
}

const ARENA_SHAPES: { value: ArenaShape; label: string; emoji: string }[] = [
  { value: "circle", label: "Circle", emoji: "⭕" },
  { value: "square", label: "Square", emoji: "⬜" },
  { value: "hexagon", label: "Hexagon", emoji: "⬡" },
  { value: "octagon", label: "Octagon", emoji: "⯃" },
  { value: "triangle", label: "Triangle", emoji: "🔺" },
  { value: "pentagon", label: "Pentagon", emoji: "⬟" },
  { value: "star5", label: "Star (5)", emoji: "⭐" },
  { value: "star6", label: "Star (6)", emoji: "✨" },
];

const ARENA_THEMES: { value: ArenaTheme; label: string; color: string }[] = [
  { value: "metrocity", label: "Metro City", color: "#3b82f6" },
  { value: "forest", label: "Forest", color: "#10b981" },
  { value: "safari", label: "Safari", color: "#f59e0b" },
  { value: "mountains", label: "Mountains", color: "#06b6d4" },
  { value: "prehistoric", label: "Prehistoric", color: "#ef4444" },
];

export default function BasicsTab({
  config,
  setConfig,
  onShapeChange,
  onLoadPreset,
}: BasicsTabProps) {
  return (
    <div className="space-y-6">
      {/* Arena Info */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Arena Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Arena Name</label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              placeholder="Enter arena name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={config.description}
              onChange={(e) =>
                setConfig({ ...config, description: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              placeholder="Enter arena description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Width (em)
              </label>
              <input
                type="number"
                value={config.width}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    width: parseFloat(e.target.value),
                  })
                }
                min={30}
                max={100}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Height (em)
              </label>
              <input
                type="number"
                value={config.height}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    height: parseFloat(e.target.value),
                  })
                }
                min={30}
                max={100}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shape Selection */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Arena Shape</h2>
        <div className="grid grid-cols-4 gap-3">
          {ARENA_SHAPES.map((shape) => (
            <button
              key={shape.value}
              onClick={() => onShapeChange(shape.value)}
              className={`px-4 py-3 rounded-lg border-2 transition ${
                config.shape === shape.value
                  ? "bg-blue-600 border-blue-400"
                  : "bg-gray-700 border-gray-600 hover:border-gray-500"
              }`}
            >
              <div className="text-2xl mb-1">{shape.emoji}</div>
              <div className="text-sm">{shape.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Theme Selection */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Arena Theme</h2>
        <div className="grid grid-cols-5 gap-3">
          {ARENA_THEMES.map((theme) => (
            <button
              key={theme.value}
              onClick={() => setConfig({ ...config, theme: theme.value })}
              className={`px-4 py-3 rounded-lg border-2 transition ${
                config.theme === theme.value
                  ? "border-white"
                  : "border-transparent hover:border-gray-500"
              }`}
              style={{ backgroundColor: theme.color }}
            >
              <div className="text-sm font-semibold text-white">
                {theme.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Rotation Settings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Auto-Rotation</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.autoRotate}
              onChange={(e) =>
                setConfig({ ...config, autoRotate: e.target.checked })
              }
              className="w-5 h-5"
            />
            <label className="text-sm font-medium">Enable Auto-Rotation</label>
          </div>

          {config.autoRotate && (
            <div className="space-y-4 pl-8">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rotation Speed: {config.rotationSpeed} RPM
                </label>
                <input
                  type="range"
                  value={config.rotationSpeed}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      rotationSpeed: parseFloat(e.target.value),
                    })
                  }
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Direction
                </label>
                <select
                  value={config.rotationDirection}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      rotationDirection: e.target.value as
                        | "clockwise"
                        | "counterclockwise",
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                >
                  <option value="clockwise">Clockwise ⟳</option>
                  <option value="counterclockwise">Counter-Clockwise ⟲</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Presets */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Load Preset</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.keys(ARENA_PRESETS).map((presetKey) => (
            <button
              key={presetKey}
              onClick={() =>
                onLoadPreset(presetKey as keyof typeof ARENA_PRESETS)
              }
              className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition"
            >
              {presetKey}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
