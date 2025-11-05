/**
 * New Arena Configurator - Edge-Based Wall System
 * Focuses on: Name, Shape, Theme, Auto-Rotate, Advanced Wall System
 */

"use client";

import React, { useState } from "react";
import ArenaPreviewBasic from "./ArenaPreviewBasic";
import BasicsTab from "./arena-tabs/BasicsTab";
import WaterBodiesTab from "./arena-tabs/WaterBodiesTab";
import PortalsTab from "./arena-tabs/PortalsTab";
import PitsTab from "./arena-tabs/PitsTab";
import {
  ArenaConfig,
  ArenaShape,
  ArenaTheme,
  WallSegment,
  EdgeWallConfig,
  ARENA_PRESETS,
  generateRandomWalls,
  initializeWallConfig,
  getEdgeCount,
  ARENA_RESOLUTION,
} from "@/types/arenaConfigNew";

// ============================================================================
// VERTEX CALCULATION HELPERS (same logic as ArenaPreviewBasic)
// ============================================================================

function calculatePolygonVertices(
  shape: ArenaShape,
  centerX: number,
  centerY: number,
  radius: number,
  sides: number
): Array<{ x: number; y: number }> {
  // Special case for square: use axis-aligned rectangle (no bounding box scaling)
  if (sides === 4) {
    return [
      { x: centerX - radius, y: centerY - radius },
      { x: centerX + radius, y: centerY - radius },
      { x: centerX + radius, y: centerY + radius },
      { x: centerX - radius, y: centerY + radius },
    ];
  }

  // For all other polygons, calculate base vertices and apply bounding box scaling
  const baseVertices: Array<{ x: number; y: number }> = [];
  const startAngle =
    sides % 2 === 0
      ? -Math.PI / 2 // Even sides: start at top
      : -Math.PI / 2 + Math.PI / sides; // Odd sides: offset for flat bottom

  for (let i = 0; i < sides; i++) {
    const angle = startAngle + (i * 2 * Math.PI) / sides;
    baseVertices.push({
      x: Math.cos(angle),
      y: Math.sin(angle),
    });
  }

  // Find bounding box of the normalized shape
  const minX = Math.min(...baseVertices.map((v) => v.x));
  const maxX = Math.max(...baseVertices.map((v) => v.x));
  const minY = Math.min(...baseVertices.map((v) => v.y));
  const maxY = Math.max(...baseVertices.map((v) => v.y));

  const width = maxX - minX;
  const height = maxY - minY;

  // Scale to fit the full radius in both dimensions
  const scaleX = (2 * radius) / width;
  const scaleY = (2 * radius) / height;

  // Apply scaling and centering
  return baseVertices.map((v) => ({
    x: centerX + (v.x - (minX + maxX) / 2) * scaleX,
    y: centerY + (v.y - (minY + maxY) / 2) * scaleY,
  }));
}

function calculateStarVertices(
  centerX: number,
  centerY: number,
  outerRadius: number,
  points: number
): Array<{ x: number; y: number }> {
  const innerRadius = outerRadius * 0.5;

  // Calculate base vertices with standard orientation
  const baseVertices: Array<{ x: number; y: number }> = [];
  const startAngle =
    points % 2 === 0 ? -Math.PI / 2 : -Math.PI / 2 + Math.PI / points;

  for (let i = 0; i < points * 2; i++) {
    const angle = startAngle + (i / (points * 2)) * Math.PI * 2;
    const radius = i % 2 === 0 ? 1 : innerRadius / outerRadius; // Normalize
    baseVertices.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }

  // Find bounding box of the normalized shape
  const minX = Math.min(...baseVertices.map((v) => v.x));
  const maxX = Math.max(...baseVertices.map((v) => v.x));
  const minY = Math.min(...baseVertices.map((v) => v.y));
  const maxY = Math.max(...baseVertices.map((v) => v.y));

  const width = maxX - minX;
  const height = maxY - minY;

  // Scale to fit the full outerRadius in both dimensions
  const scaleX = (2 * outerRadius) / width;
  const scaleY = (2 * outerRadius) / height;

  // Apply scaling and centering
  return baseVertices.map((v) => ({
    x: centerX + (v.x - (minX + maxX) / 2) * scaleX,
    y: centerY + (v.y - (minY + maxY) / 2) * scaleY,
  }));
}

// ============================================================================

interface ArenaConfiguratorNewProps {
  arena?: ArenaConfig | null;
  onSave: (arena: ArenaConfig) => void;
  onCancel: () => void;
}

export default function ArenaConfiguratorNew({
  arena,
  onSave,
  onCancel,
}: ArenaConfiguratorNewProps) {
  const [currentTab, setCurrentTab] = useState<
    "basics" | "walls" | "loops" | "portals" | "water" | "pits" | "preview"
  >("basics");

  const [config, setConfig] = useState<ArenaConfig>(
    arena || {
      name: "New Arena",
      description: "A custom battle arena",
      width: 1080, // Standard resolution
      height: 1080, // Standard resolution
      shape: "circle",
      theme: "metrocity",
      autoRotate: false,
      rotationSpeed: 6,
      rotationDirection: "clockwise",
      wall: initializeWallConfig("circle"),
      speedPaths: [],
      portals: [],
      waterBodies: [],
      pits: [],
    }
  );

  const [selectedEdgeIndex, setSelectedEdgeIndex] = useState<number>(0);

  // Handle shape change - reset all shape-dependent features
  const handleShapeChange = (newShape: ArenaShape) => {
    setConfig({
      ...config,
      shape: newShape,
      wall: initializeWallConfig(newShape),
      // Reset shape-dependent features
      speedPaths: [], // Speed paths are shape-dependent
      portals: [], // Portal positions depend on shape
      waterBodies: [], // Water body positions depend on shape
      pits: [], // Pit positions depend on shape (especially edge pits)
    });
    setSelectedEdgeIndex(0);
  };

  // Handle preset load
  const handleLoadPreset = (presetKey: keyof typeof ARENA_PRESETS) => {
    const preset = ARENA_PRESETS[presetKey];
    setConfig({ ...config, ...preset });
    setSelectedEdgeIndex(0);
  };

  // Handle random walls generation
  const handleGenerateRandomWalls = () => {
    setConfig({
      ...config,
      wall: generateRandomWalls(config.shape),
    });
  };

  // Generate equidistant walls for selected edge
  const handleGenerateEquidistantWalls = (count: number) => {
    if (count < 1 || count > 3) return;

    const newEdges = [...config.wall.edges];
    const currentEdge = newEdges[selectedEdgeIndex];

    // Clear existing walls
    currentEdge.walls = [];

    // Calculate spacing: walls and exits alternate
    // For N walls: wall-exit-wall-exit-wall-exit... (N walls, N exits)
    const segmentCount = count * 2; // walls + exits
    const segmentWidth = 100 / segmentCount; // Each segment gets equal space

    // Create walls at even positions (0, 2, 4...)
    for (let i = 0; i < count; i++) {
      currentEdge.walls.push({
        width: segmentWidth, // Each wall takes one segment
        thickness: 10, // 10px = 1em in old system
        position: i * segmentWidth * 2, // Position at 0%, 33.33%, 66.66% etc
      });
    }

    setConfig({
      ...config,
      wall: {
        ...config.wall,
        edges: newEdges,
      },
    });
  };

  // Add wall segment to selected edge
  const handleAddWallSegment = () => {
    const newEdges = [...config.wall.edges];
    const currentEdge = newEdges[selectedEdgeIndex];

    if (currentEdge.walls.length < 3) {
      // Max 3 walls per edge
      currentEdge.walls.push({
        width: 25,
        thickness: 10, // 10px = 1em in old system
        position: 50,
      });

      setConfig({
        ...config,
        wall: {
          ...config.wall,
          edges: newEdges,
        },
      });
    }
  };

  // Remove wall segment from selected edge
  const handleRemoveWallSegment = (wallIndex: number) => {
    const newEdges = [...config.wall.edges];
    const currentEdge = newEdges[selectedEdgeIndex];

    if (currentEdge.walls.length > 0) {
      currentEdge.walls.splice(wallIndex, 1);

      setConfig({
        ...config,
        wall: {
          ...config.wall,
          edges: newEdges,
        },
      });
    }
  };

  // Update wall segment
  const handleUpdateWallSegment = (
    wallIndex: number,
    property: keyof WallSegment,
    value: number | string
  ) => {
    const newEdges = [...config.wall.edges];
    const currentEdge = newEdges[selectedEdgeIndex];

    (currentEdge.walls[wallIndex] as any)[property] = value;

    setConfig({
      ...config,
      wall: {
        ...config.wall,
        edges: newEdges,
      },
    });
  };

  // Toggle walls enabled
  const handleToggleWalls = () => {
    setConfig({
      ...config,
      wall: {
        ...config.wall,
        enabled: !config.wall.enabled,
      },
    });
  };

  // Save handler
  const handleSave = () => {
    onSave(config);
  };

  const edgeCount = getEdgeCount(config.shape);
  const currentEdge = config.wall.edges[selectedEdgeIndex];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            🎯 Arena Configurator - New System
          </h1>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
            >
              Save Arena
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(
            [
              "basics",
              "walls",
              "loops",
              "portals",
              "water",
              "pits",
              "preview",
            ] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                currentTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* BASICS TAB */}
            {currentTab === "basics" && (
              <BasicsTab
                config={config}
                setConfig={setConfig}
                onShapeChange={handleShapeChange}
                onLoadPreset={handleLoadPreset}
              />
            )}

            {/* WALLS TAB */}
            {currentTab === "walls" && (
              <div className="space-y-6">
                {/* Wall Toggle */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Wall System</h2>
                      <p className="text-sm text-gray-400 mt-1">
                        Configure walls for each edge of your arena
                      </p>
                    </div>
                    <button
                      onClick={handleToggleWalls}
                      className={`px-6 py-3 rounded-lg font-semibold transition ${
                        config.wall.enabled
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {config.wall.enabled ? "✓ Enabled" : "✗ Disabled"}
                    </button>
                  </div>

                  {config.wall.enabled && (
                    <div className="mt-4">
                      <button
                        onClick={handleGenerateRandomWalls}
                        className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
                      >
                        🎲 Generate Random Walls
                      </button>
                    </div>
                  )}
                </div>

                {config.wall.enabled && (
                  <>
                    {/* Edge Selector */}
                    <div className="bg-gray-800 rounded-lg p-6">
                      <h2 className="text-xl font-semibold mb-4">
                        Select Edge ({edgeCount} total)
                      </h2>
                      <div className="grid grid-cols-4 gap-3">
                        {config.wall.edges.map((edge, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedEdgeIndex(idx)}
                            className={`px-4 py-6 rounded-lg font-semibold transition ${
                              selectedEdgeIndex === idx
                                ? "bg-blue-600 text-white ring-2 ring-blue-400"
                                : "bg-gray-700 hover:bg-gray-600"
                            }`}
                          >
                            <div className="text-lg">Edge {idx + 1}</div>
                            <div className="text-xs opacity-75 mt-1">
                              {edge.walls.length} wall
                              {edge.walls.length !== 1 ? "s" : ""}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Equidistant Wall Generator */}
                    <div className="bg-gray-800 rounded-lg p-6">
                      <h2 className="text-xl font-semibold mb-4">
                        Generate Equidistant Walls - Edge{" "}
                        {selectedEdgeIndex + 1}
                      </h2>
                      <p className="text-sm text-gray-400 mb-4">
                        Generate evenly spaced walls with automatic exits
                        between them
                      </p>
                      <div className="flex gap-3">
                        {[1, 2, 3].map((count) => (
                          <button
                            key={count}
                            onClick={() =>
                              handleGenerateEquidistantWalls(count)
                            }
                            className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
                          >
                            {count} Wall{count > 1 ? "s" : ""}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Example: 2 walls = Wall-Exit-Wall-Exit pattern
                      </p>
                    </div>

                    {/* Wall Segments for Selected Edge */}
                    <div className="bg-gray-800 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                          Edge {selectedEdgeIndex + 1} - Wall Segments
                        </h2>
                        <button
                          onClick={handleAddWallSegment}
                          disabled={currentEdge.walls.length >= 3}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          + Add Wall
                        </button>
                      </div>

                      {currentEdge.walls.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <p className="text-lg">No walls on this edge</p>
                          <p className="text-sm mt-2">
                            This edge is a complete exit zone
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {currentEdge.walls.map((wall, wallIdx) => (
                            <div
                              key={wallIdx}
                              className="bg-gray-700 rounded-lg p-4"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold">
                                  Wall {wallIdx + 1}
                                </h3>
                                <button
                                  onClick={() =>
                                    handleRemoveWallSegment(wallIdx)
                                  }
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Width (% of edge)
                                  </label>
                                  <input
                                    type="range"
                                    value={wall.width}
                                    onChange={(e) =>
                                      handleUpdateWallSegment(
                                        wallIdx,
                                        "width",
                                        parseFloat(e.target.value)
                                      )
                                    }
                                    min={10}
                                    max={100}
                                    step={5}
                                    className="w-full"
                                  />
                                  <div className="text-xs text-gray-400 mt-1">
                                    {wall.width}%
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Thickness (px)
                                  </label>
                                  <input
                                    type="range"
                                    value={wall.thickness}
                                    onChange={(e) =>
                                      handleUpdateWallSegment(
                                        wallIdx,
                                        "thickness",
                                        parseFloat(e.target.value)
                                      )
                                    }
                                    min={5}
                                    max={30}
                                    step={1}
                                    className="w-full"
                                  />
                                  <div className="text-xs text-gray-400 mt-1">
                                    {wall.thickness}px
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Position (% along edge)
                                  </label>
                                  <input
                                    type="range"
                                    value={wall.position}
                                    onChange={(e) =>
                                      handleUpdateWallSegment(
                                        wallIdx,
                                        "position",
                                        parseFloat(e.target.value)
                                      )
                                    }
                                    min={0}
                                    max={100}
                                    step={5}
                                    className="w-full"
                                  />
                                  <div className="text-xs text-gray-400 mt-1">
                                    {wall.position}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Wall Style Settings */}
                    <div className="bg-gray-800 rounded-lg p-6">
                      <h2 className="text-xl font-semibold mb-4">
                        Wall Appearance
                      </h2>
                      <div className="space-y-4">
                        {/* Common Wall Thickness */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Wall Thickness: {config.wall.commonThickness || 10}{" "}
                            px
                          </label>
                          <input
                            type="range"
                            value={config.wall.commonThickness || 10}
                            onChange={(e) => {
                              const thickness = parseFloat(e.target.value);
                              setConfig({
                                ...config,
                                wall: {
                                  ...config.wall,
                                  commonThickness: thickness,
                                  edges: config.wall.edges.map((edge) => ({
                                    ...edge,
                                    walls: edge.walls.map((wall) => ({
                                      ...wall,
                                      thickness: thickness,
                                    })),
                                  })),
                                },
                              });
                            }}
                            min={5}
                            max={50}
                            step={1}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Applies to all walls across all edges
                          </p>
                        </div>

                        {/* Spikes */}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.wall.hasSpikes}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                wall: {
                                  ...config.wall,
                                  hasSpikes: e.target.checked,
                                },
                              })
                            }
                            className="w-5 h-5"
                            id="wall-spikes"
                          />
                          <label
                            htmlFor="wall-spikes"
                            className="text-sm font-medium cursor-pointer"
                          >
                            Spikes (extra damage)
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Spike Damage Multiplier:{" "}
                            {config.wall.spikeDamageMultiplier}x
                          </label>
                          <input
                            type="range"
                            value={config.wall.spikeDamageMultiplier}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                wall: {
                                  ...config.wall,
                                  spikeDamageMultiplier: parseFloat(
                                    e.target.value
                                  ),
                                },
                              })
                            }
                            min={1}
                            max={5}
                            step={0.1}
                            className="w-full"
                            disabled={!config.wall.hasSpikes}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Wall Pattern
                          </label>
                          <select
                            value={config.wall.wallStyle}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                wall: {
                                  ...config.wall,
                                  wallStyle: e.target.value as
                                    | "brick"
                                    | "metal"
                                    | "wood"
                                    | "stone",
                                },
                              })
                            }
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                          >
                            <option value="brick">Brick Pattern</option>
                            <option value="metal">Metal Wall</option>
                            <option value="wood">Wood Wall</option>
                            <option value="stone">Stone Wall</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Exit Style
                          </label>
                          <select
                            value={config.wall.exitStyle}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                wall: {
                                  ...config.wall,
                                  exitStyle: e.target.value as
                                    | "arrows"
                                    | "glow"
                                    | "dashed",
                                },
                              })
                            }
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                          >
                            <option value="arrows">Arrows</option>
                            <option value="glow">Glow Effect</option>
                            <option value="dashed">Dashed Line</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Exit Color
                          </label>
                          <input
                            type="color"
                            value={config.wall.exitColor}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                wall: {
                                  ...config.wall,
                                  exitColor: e.target.value,
                                },
                              })
                            }
                            className="w-full h-12 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Collision Settings */}
                    <div className="bg-gray-800 rounded-lg p-6">
                      <h2 className="text-xl font-semibold mb-4">
                        Collision Properties
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Base Damage: {config.wall.baseDamage}
                          </label>
                          <input
                            type="range"
                            value={config.wall.baseDamage}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                wall: {
                                  ...config.wall,
                                  baseDamage: parseFloat(e.target.value),
                                },
                              })
                            }
                            min={0}
                            max={50}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Recoil Distance: {config.wall.recoilDistance} px
                          </label>
                          <input
                            type="range"
                            value={config.wall.recoilDistance}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                wall: {
                                  ...config.wall,
                                  recoilDistance: parseFloat(e.target.value),
                                },
                              })
                            }
                            min={0}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* SPEED PATHS TAB */}
            {currentTab === "loops" && (
              <div className="space-y-6">
                {/* Speed Paths Header */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">
                        Speed Paths ({config.speedPaths.length}/10)
                      </h2>
                      <p className="text-sm text-gray-400 mt-1">
                        Paths that beyblades travel along for speed boosts
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (config.speedPaths.length < 10) {
                          setConfig({
                            ...config,
                            speedPaths: [
                              ...config.speedPaths,
                              {
                                radius: 15 + config.speedPaths.length * 3,
                                shape: "circle",
                                speedBoost: 1.5,
                                color: "#3b82f6",
                                renderStyle: "outline",
                              },
                            ],
                          });
                        }
                      }}
                      disabled={config.speedPaths.length >= 10}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      + Add Speed Path
                    </button>
                  </div>
                </div>

                {/* Speed Path List */}
                {config.speedPaths.length === 0 ? (
                  <div className="bg-gray-800 rounded-lg p-12 text-center">
                    <p className="text-gray-400 text-lg">
                      No speed paths yet. Click "+ Add Speed Path" to create
                      one.
                    </p>
                  </div>
                ) : (
                  config.speedPaths.map((speedPath, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                          Speed Path {idx + 1}
                        </h3>
                        <button
                          onClick={() => {
                            const newSpeedPaths = [...config.speedPaths];
                            newSpeedPaths.splice(idx, 1);
                            setConfig({ ...config, speedPaths: newSpeedPaths });
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Radius (px)
                          </label>
                          <input
                            type="number"
                            value={speedPath.radius}
                            onChange={(e) => {
                              const newSpeedPaths = [...config.speedPaths];
                              newSpeedPaths[idx].radius = parseFloat(
                                e.target.value
                              );
                              setConfig({
                                ...config,
                                speedPaths: newSpeedPaths,
                              });
                            }}
                            min={5}
                            max={ARENA_RESOLUTION / 2 - 2}
                            step={0.5}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Shape
                          </label>
                          <select
                            value={speedPath.shape}
                            onChange={(e) => {
                              const newSpeedPaths = [...config.speedPaths];
                              newSpeedPaths[idx].shape = e.target.value as any;
                              setConfig({
                                ...config,
                                speedPaths: newSpeedPaths,
                              });
                            }}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                          >
                            <option value="circle">Circle</option>
                            <option value="rectangle">Rectangle</option>
                            <option value="pentagon">Pentagon</option>
                            <option value="hexagon">Hexagon</option>
                            <option value="octagon">Octagon</option>
                            <option value="oval">Oval</option>
                            <option value="star">Star</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Speed Boost
                          </label>
                          <input
                            type="range"
                            value={speedPath.speedBoost}
                            onChange={(e) => {
                              const newSpeedPaths = [...config.speedPaths];
                              newSpeedPaths[idx].speedBoost = parseFloat(
                                e.target.value
                              );
                              setConfig({
                                ...config,
                                speedPaths: newSpeedPaths,
                              });
                            }}
                            min={1}
                            max={3}
                            step={0.1}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-400 mt-1">
                            {speedPath.speedBoost}x speed
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Color
                          </label>
                          <input
                            type="color"
                            value={speedPath.color || "#3b82f6"}
                            onChange={(e) => {
                              const newSpeedPaths = [...config.speedPaths];
                              newSpeedPaths[idx].color = e.target.value;
                              setConfig({
                                ...config,
                                speedPaths: newSpeedPaths,
                              });
                            }}
                            className="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Rotation (degrees)
                          </label>
                          <input
                            type="number"
                            value={speedPath.rotation || 0}
                            onChange={(e) => {
                              const newSpeedPaths = [...config.speedPaths];
                              newSpeedPaths[idx].rotation = parseFloat(
                                e.target.value
                              );
                              setConfig({
                                ...config,
                                speedPaths: newSpeedPaths,
                              });
                            }}
                            min={0}
                            max={360}
                            step={15}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Charge Points Section */}
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-semibold">
                            Charge Points ({speedPath.chargePoints?.length || 0}
                            )
                          </h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const newSpeedPaths = [...config.speedPaths];
                                newSpeedPaths[idx].autoPlaceChargePoints = true;
                                newSpeedPaths[idx].chargePointCount = 3;
                                setConfig({
                                  ...config,
                                  speedPaths: newSpeedPaths,
                                });
                              }}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition"
                            >
                              Auto-Place (Max 3)
                            </button>
                            <button
                              onClick={() => {
                                const newSpeedPaths = [...config.speedPaths];
                                if (!newSpeedPaths[idx].chargePoints) {
                                  newSpeedPaths[idx].chargePoints = [];
                                }
                                if (
                                  newSpeedPaths[idx].chargePoints!.length < 3
                                ) {
                                  const cpId =
                                    newSpeedPaths[idx].chargePoints!.length + 1;
                                  newSpeedPaths[idx].chargePoints!.push({
                                    id: cpId,
                                    pathPosition: cpId * 33.33,
                                    target: "center",
                                    dashSpeed: 2,
                                    radius: 25, // Fixed 25px radius (will be clamped to 10-50px)
                                    color: "#fbbf24",
                                    buttonId: cpId as 1 | 2 | 3,
                                  });
                                }
                                newSpeedPaths[idx].autoPlaceChargePoints =
                                  false;
                                setConfig({
                                  ...config,
                                  speedPaths: newSpeedPaths,
                                });
                              }}
                              disabled={
                                (speedPath.chargePoints?.length || 0) >= 3
                              }
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition disabled:opacity-50"
                            >
                              + Add Charge Point
                            </button>
                          </div>
                        </div>

                        {/* Auto-place controls */}
                        {speedPath.autoPlaceChargePoints && (
                          <div className="mb-3 p-3 bg-gray-700 rounded">
                            <label className="block text-xs font-medium mb-2">
                              Number of Charge Points (Max 3)
                            </label>
                            <input
                              type="number"
                              value={speedPath.chargePointCount || 3}
                              onChange={(e) => {
                                const newSpeedPaths = [...config.speedPaths];
                                newSpeedPaths[idx].chargePointCount = Math.min(
                                  Math.max(1, parseInt(e.target.value)),
                                  3
                                );
                                setConfig({
                                  ...config,
                                  speedPaths: newSpeedPaths,
                                });
                              }}
                              min={1}
                              max={3}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                            />
                            <p className="text-xs text-gray-400 mt-2">
                              Auto-placed at equal distances along the path
                            </p>
                          </div>
                        )}

                        {speedPath.chargePoints &&
                        speedPath.chargePoints.length > 0 ? (
                          <div className="space-y-3">
                            {speedPath.chargePoints.map((cp, cpIdx) => (
                              <div
                                key={cpIdx}
                                className="bg-gray-700 rounded p-3 space-y-2"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-semibold">
                                    Charge Point {cpIdx + 1}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const newSpeedPaths = [
                                        ...config.speedPaths,
                                      ];
                                      newSpeedPaths[idx].chargePoints!.splice(
                                        cpIdx,
                                        1
                                      );
                                      setConfig({
                                        ...config,
                                        speedPaths: newSpeedPaths,
                                      });
                                    }}
                                    className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded"
                                  >
                                    Remove
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-xs mb-1">
                                      Path Position:{" "}
                                      {cp.pathPosition?.toFixed(1) || 0}%
                                    </label>
                                    <input
                                      type="range"
                                      value={cp.pathPosition || 0}
                                      onChange={(e) => {
                                        const newSpeedPaths = [
                                          ...config.speedPaths,
                                        ];
                                        newSpeedPaths[idx].chargePoints![
                                          cpIdx
                                        ].pathPosition = parseFloat(
                                          e.target.value
                                        );
                                        setConfig({
                                          ...config,
                                          speedPaths: newSpeedPaths,
                                        });
                                      }}
                                      min={0}
                                      max={100}
                                      step={1}
                                      className="w-full"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs mb-1">
                                      Target
                                    </label>
                                    <select
                                      value={cp.target}
                                      onChange={(e) => {
                                        const newSpeedPaths = [
                                          ...config.speedPaths,
                                        ];
                                        newSpeedPaths[idx].chargePoints![
                                          cpIdx
                                        ].target = e.target.value as
                                          | "center"
                                          | "opponent";
                                        setConfig({
                                          ...config,
                                          speedPaths: newSpeedPaths,
                                        });
                                      }}
                                      className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs"
                                    >
                                      <option value="center">Center</option>
                                      <option value="opponent">Opponent</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-xs mb-1">
                                      Dash Speed: {cp.dashSpeed || 2}x
                                    </label>
                                    <input
                                      type="range"
                                      value={cp.dashSpeed || 2}
                                      onChange={(e) => {
                                        const newSpeedPaths = [
                                          ...config.speedPaths,
                                        ];
                                        newSpeedPaths[idx].chargePoints![
                                          cpIdx
                                        ].dashSpeed = parseFloat(
                                          e.target.value
                                        );
                                        setConfig({
                                          ...config,
                                          speedPaths: newSpeedPaths,
                                        });
                                      }}
                                      min={1}
                                      max={5}
                                      step={0.1}
                                      className="w-full"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs mb-1">
                                      Radius: {cp.radius || 25}px
                                    </label>
                                    <input
                                      type="range"
                                      value={cp.radius || 25}
                                      onChange={(e) => {
                                        const newSpeedPaths = [
                                          ...config.speedPaths,
                                        ];
                                        newSpeedPaths[idx].chargePoints![
                                          cpIdx
                                        ].radius = parseFloat(e.target.value);
                                        setConfig({
                                          ...config,
                                          speedPaths: newSpeedPaths,
                                        });
                                      }}
                                      min={10}
                                      max={50}
                                      step={1}
                                      className="w-full"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs mb-1">
                                      Button ID
                                    </label>
                                    <select
                                      value={cp.buttonId || 1}
                                      onChange={(e) => {
                                        const newSpeedPaths = [
                                          ...config.speedPaths,
                                        ];
                                        newSpeedPaths[idx].chargePoints![
                                          cpIdx
                                        ].buttonId = parseInt(
                                          e.target.value
                                        ) as 1 | 2 | 3;
                                        setConfig({
                                          ...config,
                                          speedPaths: newSpeedPaths,
                                        });
                                      }}
                                      className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs"
                                    >
                                      <option value="1">Button 1</option>
                                      <option value="2">Button 2</option>
                                      <option value="3">Button 3</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-xs mb-1">
                                      Radius: {cp.radius || 1.5}em
                                    </label>
                                    <input
                                      type="range"
                                      value={cp.radius || 1.5}
                                      onChange={(e) => {
                                        const newSpeedPaths = [
                                          ...config.speedPaths,
                                        ];
                                        newSpeedPaths[idx].chargePoints![
                                          cpIdx
                                        ].radius = parseFloat(e.target.value);
                                        setConfig({
                                          ...config,
                                          speedPaths: newSpeedPaths,
                                        });
                                      }}
                                      min={0.5}
                                      max={3}
                                      step={0.1}
                                      className="w-full"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs mb-1">
                                      Color
                                    </label>
                                    <input
                                      type="color"
                                      value={cp.color || "#fbbf24"}
                                      onChange={(e) => {
                                        const newSpeedPaths = [
                                          ...config.speedPaths,
                                        ];
                                        newSpeedPaths[idx].chargePoints![
                                          cpIdx
                                        ].color = e.target.value;
                                        setConfig({
                                          ...config,
                                          speedPaths: newSpeedPaths,
                                        });
                                      }}
                                      className="w-full h-8 bg-gray-600 border border-gray-500 rounded cursor-pointer"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 text-center py-2">
                            No charge points. Add one to create dash attack
                            opportunities.
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PORTALS TAB */}
            {currentTab === "portals" && (
              <PortalsTab config={config} setConfig={setConfig} />
            )}

            {/* PORTALS TAB - OLD (REMOVED) */}
            {false && currentTab === "portals" && (
              <div className="space-y-6">
                {/* Portals Header */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-xl font-semibold">
                        Linked Teleportation Portals ({config.portals.length}/4)
                      </h2>
                      <p className="text-sm text-gray-400 mt-1">
                        All portals are interconnected - entering any portal
                        teleports to another based on directional input or
                        randomly
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (config.portals.length < 4) {
                            const portalNum = config.portals.length + 1;
                            const distance = 15; // Distance from center
                            // Place portals at equal angles (0°, 90°, 180°, 270°)
                            const angle = (portalNum - 1) * 90;
                            const rad = (angle * Math.PI) / 180;
                            const x = distance * Math.cos(rad);
                            const y = distance * Math.sin(rad);

                            // Portal colors
                            const colors = [
                              "#8b5cf6",
                              "#ec4899",
                              "#10b981",
                              "#f59e0b",
                            ];

                            setConfig({
                              ...config,
                              portals: [
                                ...config.portals,
                                {
                                  id: `portal${portalNum}`,
                                  portalNumber: portalNum,
                                  position: { x, y },
                                  radius: ARENA_RESOLUTION * 0.04, // 4% of arena (43.2px @ 1080)
                                  color: colors[portalNum - 1],
                                  autoPlace: true,
                                  distanceFromCenter: distance,
                                  angle: angle,
                                },
                              ],
                            });
                          }
                        }}
                        disabled={config.portals.length >= 4}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Auto-Place Portal
                      </button>
                      <button
                        onClick={() => {
                          if (config.portals.length < 4) {
                            const portalNum = config.portals.length + 1;
                            const colors = [
                              "#8b5cf6",
                              "#ec4899",
                              "#10b981",
                              "#f59e0b",
                            ];
                            const offset = 10 + portalNum * 2;

                            setConfig({
                              ...config,
                              portals: [
                                ...config.portals,
                                {
                                  id: `portal${portalNum}`,
                                  portalNumber: portalNum,
                                  position: { x: offset, y: 0 },
                                  radius: ARENA_RESOLUTION * 0.04, // 4% of arena (43.2px @ 1080)
                                  color: colors[portalNum - 1],
                                  autoPlace: false,
                                },
                              ],
                            });
                          }
                        }}
                        disabled={config.portals.length >= 4}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        + Manual Portal
                      </button>
                    </div>
                  </div>

                  {/* Info about auto-placement and mechanics */}
                  <div className="mt-4 p-3 bg-gray-700 rounded space-y-2">
                    <p className="text-xs text-gray-300">
                      <strong>Auto-Place:</strong> Portals are positioned at
                      equal angles from center:
                    </p>
                    <ul className="text-xs text-gray-300 ml-4 list-disc">
                      <li>2 portals: 0° and 180° (opposite sides)</li>
                      <li>3 portals: 0°, 120°, and 240° (triangle)</li>
                      <li>4 portals: 0°, 90°, 180°, and 270° (square)</li>
                    </ul>
                    <p className="text-xs text-gray-300 mt-2">
                      <strong>Teleportation:</strong> Use directional input
                      (↑/↓/←/→) to choose destination portal, or no input for
                      random teleportation.
                    </p>
                  </div>
                </div>

                {/* Portal List */}
                {config.portals.length === 0 ? (
                  <div className="bg-gray-800 rounded-lg p-12 text-center">
                    <p className="text-gray-400 text-lg">
                      No portals yet. Click "Auto-Place Portal" to create one.
                    </p>
                  </div>
                ) : (
                  config.portals.map((portal, idx) => (
                    <div key={portal.id} className="bg-gray-800 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                          Portal {idx + 1}
                        </h3>
                        <button
                          onClick={() => {
                            const newPortals = [...config.portals];
                            newPortals.splice(idx, 1);
                            // Renumber remaining portals
                            newPortals.forEach((p, i) => {
                              p.portalNumber = i + 1;
                              p.id = `portal${i + 1}`;
                            });
                            setConfig({ ...config, portals: newPortals });
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Auto-placement control */}
                        {portal.autoPlace && (
                          <div className="p-3 bg-gray-700 rounded">
                            <label className="block text-sm font-medium mb-2">
                              Distance from Center (px)
                            </label>
                            <input
                              type="number"
                              value={portal.distanceFromCenter || 15}
                              onChange={(e) => {
                                const newPortals = [...config.portals];
                                const distance = parseFloat(e.target.value);
                                newPortals[idx].distanceFromCenter = distance;

                                // Update position based on angle
                                const angle = portal.angle || idx * 90;
                                const rad = (angle * Math.PI) / 180;
                                const x = distance * Math.cos(rad);
                                const y = distance * Math.sin(rad);

                                newPortals[idx].position = { x, y };

                                setConfig({ ...config, portals: newPortals });
                              }}
                              min={5}
                              max={ARENA_RESOLUTION / 2 - 5}
                              step={0.5}
                              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg"
                            />
                            <p className="text-xs text-gray-400 mt-2">
                              Portal {idx + 1} positioned at{" "}
                              {portal.angle || idx * 90}°
                            </p>
                            <button
                              onClick={() => {
                                const newPortals = [...config.portals];
                                newPortals[idx].autoPlace = false;
                                setConfig({ ...config, portals: newPortals });
                              }}
                              className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                            >
                              Switch to Manual Positioning
                            </button>
                          </div>
                        )}

                        {/* Manual positioning controls */}
                        {!portal.autoPlace && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Position X: {portal.position.x.toFixed(1)} px
                                </label>
                                <input
                                  type="range"
                                  value={portal.position.x}
                                  onChange={(e) => {
                                    const newPortals = [...config.portals];
                                    newPortals[idx].position.x = parseFloat(
                                      e.target.value
                                    );
                                    setConfig({
                                      ...config,
                                      portals: newPortals,
                                    });
                                  }}
                                  min={-ARENA_RESOLUTION / 2 + 5}
                                  max={ARENA_RESOLUTION / 2 - 5}
                                  step={1}
                                  className="w-full"
                                />
                                <input
                                  type="number"
                                  value={portal.position.x}
                                  onChange={(e) => {
                                    const newPortals = [...config.portals];
                                    newPortals[idx].position.x = parseFloat(
                                      e.target.value
                                    );
                                    setConfig({
                                      ...config,
                                      portals: newPortals,
                                    });
                                  }}
                                  min={-ARENA_RESOLUTION / 2 + 5}
                                  max={ARENA_RESOLUTION / 2 - 5}
                                  step={0.5}
                                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg mt-2"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Position Y: {portal.position.y.toFixed(1)} px
                                </label>
                                <input
                                  type="range"
                                  value={portal.position.y}
                                  onChange={(e) => {
                                    const newPortals = [...config.portals];
                                    newPortals[idx].position.y = parseFloat(
                                      e.target.value
                                    );
                                    setConfig({
                                      ...config,
                                      portals: newPortals,
                                    });
                                  }}
                                  min={-ARENA_RESOLUTION / 2 + 5}
                                  max={ARENA_RESOLUTION / 2 - 5}
                                  step={1}
                                  className="w-full"
                                />
                                <input
                                  type="number"
                                  value={portal.position.y}
                                  onChange={(e) => {
                                    const newPortals = [...config.portals];
                                    newPortals[idx].position.y = parseFloat(
                                      e.target.value
                                    );
                                    setConfig({
                                      ...config,
                                      portals: newPortals,
                                    });
                                  }}
                                  min={-ARENA_RESOLUTION / 2 + 5}
                                  max={ARENA_RESOLUTION / 2 - 5}
                                  step={0.5}
                                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg mt-2"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Radius: {portal.radius.toFixed(1)} px (
                                  {(
                                    (portal.radius / ARENA_RESOLUTION) *
                                    100
                                  ).toFixed(1)}
                                  % of arena)
                                </label>
                                <input
                                  type="range"
                                  value={portal.radius}
                                  onChange={(e) => {
                                    const newPortals = [...config.portals];
                                    newPortals[idx].radius = parseFloat(
                                      e.target.value
                                    );
                                    setConfig({
                                      ...config,
                                      portals: newPortals,
                                    });
                                  }}
                                  min={ARENA_RESOLUTION * 0.01}
                                  max={ARENA_RESOLUTION * 0.1}
                                  step={0.5}
                                  className="w-full"
                                />
                                <input
                                  type="number"
                                  value={portal.radius}
                                  onChange={(e) => {
                                    const newPortals = [...config.portals];
                                    newPortals[idx].radius = parseFloat(
                                      e.target.value
                                    );
                                    setConfig({
                                      ...config,
                                      portals: newPortals,
                                    });
                                  }}
                                  min={ARENA_RESOLUTION * 0.01}
                                  max={ARENA_RESOLUTION * 0.1}
                                  step={0.5}
                                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg mt-2"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Color
                                </label>
                                <input
                                  type="color"
                                  value={portal.color || "#8b5cf6"}
                                  onChange={(e) => {
                                    const newPortals = [...config.portals];
                                    newPortals[idx].color = e.target.value;
                                    setConfig({
                                      ...config,
                                      portals: newPortals,
                                    });
                                  }}
                                  className="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                                />
                              </div>
                            </div>

                            {/* Note about bidirectional */}
                            <div className="bg-gray-700 rounded p-3">
                              <p className="text-xs text-gray-300">
                                ℹ️{" "}
                                <strong>All portals are bidirectional</strong> -
                                Beyblades can travel in both directions through
                                any portal connection.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* WATER BODIES TAB */}
            {currentTab === "water" && (
              <WaterBodiesTab config={config} setConfig={setConfig} />
            )}

            {/* PITS TAB */}
            {currentTab === "pits" && (
              <PitsTab
                config={config}
                setConfig={setConfig}
                calculatePolygonVertices={calculatePolygonVertices}
                calculateStarVertices={calculateStarVertices}
              />
            )}

            {/* PITS TAB - OLD (REMOVED) */}
            {false && currentTab === "pits" && (
              <div className="space-y-6">
                {/* Pits Header */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-xl font-semibold">
                        Pit Hazards ({config.pits?.length || 0} active)
                      </h2>
                      <p className="text-sm text-gray-400 mt-1">
                        Dangerous pits that trap beyblades and drain spin
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          // For circle arenas, create a single center pit
                          // For other shapes, create edge pits at equal angles
                          if (config.shape === "circle") {
                            setConfig({
                              ...config,
                              pits: [
                                {
                                  id: "pit1",
                                  type: "crater" as const,
                                  position: { x: 0, y: 0 },
                                  radius: ARENA_RESOLUTION * 0.04, // 4% of arena (43.2px @ 1080)
                                  depth: 9,
                                  spinDamagePerSecond: 25,
                                  escapeChance: 0.5,
                                  color: "#2d1810",
                                  autoPlace: false,
                                },
                              ],
                            });
                          } else {
                            // Create edge pits using the same vertex logic as walls
                            const edgeCount = getEdgeCount(config.shape);
                            const pitCount = Math.min(edgeCount, 8); // Max 8 edge pits
                            const arenaRadius = ARENA_RESOLUTION / 2; // Use standard resolution
                            const pitDistance = arenaRadius * 0.85; // 85% of radius (near edge)

                            // Calculate vertices using the same logic as walls
                            let vertices: Array<{ x: number; y: number }>;
                            if (config.shape.startsWith("star")) {
                              const points = parseInt(
                                config.shape.replace("star", "")
                              );
                              vertices = calculateStarVertices(
                                0,
                                0,
                                pitDistance,
                                points
                              );
                            } else {
                              vertices = calculatePolygonVertices(
                                config.shape,
                                0,
                                0,
                                pitDistance,
                                edgeCount
                              );
                            }

                            const newPits = vertices
                              .slice(0, pitCount)
                              .map(
                                (
                                  vertex: { x: number; y: number },
                                  i: number
                                ) => ({
                                  id: `pit${i + 1}`,
                                  type: "edge" as const,
                                  position: { x: vertex.x, y: vertex.y },
                                  radius: ARENA_RESOLUTION * 0.015, // 1.5% of arena (16.2px @ 1080)
                                  depth: 7,
                                  spinDamagePerSecond: 20,
                                  escapeChance: 0.5,
                                  color: "#3c1810",
                                  autoPlace: true,
                                  edgeOffset: pitDistance,
                                  angle:
                                    Math.atan2(vertex.y, vertex.x) *
                                    (180 / Math.PI),
                                })
                              );

                            setConfig({
                              ...config,
                              pits: newPits,
                            });
                          }
                        }}
                        disabled={(config.pits?.length || 0) > 0}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {config.shape === "circle"
                          ? "+ Add Center Pit"
                          : "+ Add Edge Pits (All)"}
                      </button>
                      <button
                        onClick={() => {
                          if ((config.pits?.length || 0) < 3) {
                            const pitNum = (config.pits?.length || 0) + 1;
                            setConfig({
                              ...config,
                              pits: [
                                ...(config.pits || []),
                                {
                                  id: `pit${pitNum}`,
                                  type: "crater",
                                  position: { x: 0, y: 0 },
                                  radius: ARENA_RESOLUTION * 0.03, // 3% of arena (32.4px @ 1080)
                                  depth: 8,
                                  spinDamagePerSecond: 25,
                                  escapeChance: 0.5,
                                  color: "#2d1810",
                                  autoPlace: false,
                                },
                              ],
                            });
                          }
                        }}
                        disabled={(config.pits?.length || 0) >= 3}
                        className="px-4 py-2 bg-red-900 hover:bg-red-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        + Add Crater Pit
                      </button>
                      {(config.pits?.length || 0) > 0 && (
                        <button
                          onClick={() => {
                            setConfig({
                              ...config,
                              pits: [],
                            });
                          }}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
                        >
                          Clear All Pits
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Info about pits */}
                  <div className="mt-4 p-3 bg-gray-700 rounded space-y-2">
                    <p className="text-xs text-gray-300">
                      <strong>⚠️ How Pits Work:</strong>
                    </p>
                    <ul className="text-xs text-gray-300 ml-4 list-disc space-y-1">
                      <li>Beyblade enters pit → loses control</li>
                      <li>Every second: 50% chance to escape before damage</li>
                      <li>If fails escape: takes spin damage</li>
                      <li>Continues until escape or spin reaches zero</li>
                    </ul>
                    <p className="text-xs text-gray-300 mt-2">
                      <strong>Pit Types:</strong>
                    </p>
                    <ul className="text-xs text-gray-300 ml-4 list-disc space-y-1">
                      <li>
                        <strong>Circle Arena:</strong> Creates a single large
                        center pit (classic danger zone)
                      </li>
                      <li>
                        <strong>Other Shapes:</strong> Creates small pits around
                        arena edges (all at once based on shape)
                      </li>
                      <li>
                        <strong>Crater Pits:</strong> Additional manual pits
                        that can be placed anywhere (max 3)
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Pits List */}
                {!config.pits || config.pits.length === 0 ? (
                  <div className="bg-gray-800 rounded-lg p-12 text-center">
                    <p className="text-gray-400 text-lg">
                      No pits yet. Click a button above to add one.
                    </p>
                  </div>
                ) : (
                  config.pits.map((pit, idx) => (
                    <div
                      key={pit.id}
                      className="bg-gray-800 rounded-lg p-6 border-l-4"
                      style={{
                        borderLeftColor:
                          pit.type === "edge" ? "#ea580c" : "#7f1d1d",
                      }}
                    >
                      {/* Header */}
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          {pit.type === "edge"
                            ? "🕳️ Edge Pit"
                            : "⚫ Crater Pit"}
                          <span className="text-gray-400 text-sm">
                            ({pit.id})
                          </span>
                        </h3>
                        <button
                          onClick={() => {
                            const newPits = config.pits.filter(
                              (_, i) => i !== idx
                            );
                            setConfig({ ...config, pits: newPits });
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Auto-placement for edge pits */}
                        {pit.type === "edge" && pit.autoPlace && (
                          <div className="p-3 bg-gray-700 rounded">
                            <label className="block text-sm font-medium mb-2">
                              Distance from Center (px)
                            </label>
                            <input
                              type="number"
                              value={pit.edgeOffset || 18}
                              onChange={(e) => {
                                const newPits = [...config.pits];
                                const distance = parseFloat(e.target.value);
                                newPits[idx].edgeOffset = distance;

                                const angle = pit.angle || idx * 120;
                                const rad = (angle * Math.PI) / 180;
                                const x = distance * Math.cos(rad);
                                const y = distance * Math.sin(rad);
                                newPits[idx].position = { x, y };

                                setConfig({ ...config, pits: newPits });
                              }}
                              min={10}
                              max={ARENA_RESOLUTION / 2 - 3}
                              step={0.5}
                              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg"
                            />
                            <p className="text-xs text-gray-400 mt-2">
                              Auto-placed at {pit.angle || idx * 120}° from
                              center
                            </p>
                            <button
                              onClick={() => {
                                const newPits = [...config.pits];
                                newPits[idx].autoPlace = false;
                                setConfig({ ...config, pits: newPits });
                              }}
                              className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                            >
                              Switch to Manual Position
                            </button>
                          </div>
                        )}

                        {/* Manual positioning */}
                        {!pit.autoPlace && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Position X: {pit.position.x.toFixed(1)} px
                                </label>
                                <input
                                  type="range"
                                  value={pit.position.x}
                                  onChange={(e) => {
                                    const newPits = [...config.pits];
                                    newPits[idx].position.x = parseFloat(
                                      e.target.value
                                    );
                                    setConfig({ ...config, pits: newPits });
                                  }}
                                  min={-ARENA_RESOLUTION / 2 + 3}
                                  max={ARENA_RESOLUTION / 2 - 3}
                                  step={1}
                                  className="w-full"
                                />
                                <input
                                  type="number"
                                  value={pit.position.x}
                                  onChange={(e) => {
                                    const newPits = [...config.pits];
                                    newPits[idx].position.x = parseFloat(
                                      e.target.value
                                    );
                                    setConfig({ ...config, pits: newPits });
                                  }}
                                  min={-ARENA_RESOLUTION / 2 + 3}
                                  max={ARENA_RESOLUTION / 2 - 3}
                                  step={0.5}
                                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg mt-2"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Position Y: {pit.position.y.toFixed(1)} px
                                </label>
                                <input
                                  type="range"
                                  value={pit.position.y}
                                  onChange={(e) => {
                                    const newPits = [...config.pits];
                                    newPits[idx].position.y = parseFloat(
                                      e.target.value
                                    );
                                    setConfig({ ...config, pits: newPits });
                                  }}
                                  min={-ARENA_RESOLUTION / 2 + 3}
                                  max={ARENA_RESOLUTION / 2 - 3}
                                  step={1}
                                  className="w-full"
                                />
                                <input
                                  type="number"
                                  value={pit.position.y}
                                  onChange={(e) => {
                                    const newPits = [...config.pits];
                                    newPits[idx].position.y = parseFloat(
                                      e.target.value
                                    );
                                    setConfig({ ...config, pits: newPits });
                                  }}
                                  min={-ARENA_RESOLUTION / 2 + 3}
                                  max={ARENA_RESOLUTION / 2 - 3}
                                  step={0.5}
                                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg mt-2"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Pit properties */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Radius: {pit.radius.toFixed(1)} px (
                              {((pit.radius / ARENA_RESOLUTION) * 100).toFixed(
                                1
                              )}
                              % of arena)
                            </label>
                            <input
                              type="range"
                              value={pit.radius}
                              onChange={(e) => {
                                const newPits = [...config.pits];
                                newPits[idx].radius = parseFloat(
                                  e.target.value
                                );
                                setConfig({ ...config, pits: newPits });
                              }}
                              min={ARENA_RESOLUTION * 0.005}
                              max={ARENA_RESOLUTION * 0.08}
                              step={0.5}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Visual Depth: {pit.depth}
                            </label>
                            <input
                              type="range"
                              value={pit.depth}
                              onChange={(e) => {
                                const newPits = [...config.pits];
                                newPits[idx].depth = parseFloat(e.target.value);
                                setConfig({ ...config, pits: newPits });
                              }}
                              min={1}
                              max={10}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Spin Damage/Second: {pit.spinDamagePerSecond}
                            </label>
                            <input
                              type="range"
                              value={pit.spinDamagePerSecond}
                              onChange={(e) => {
                                const newPits = [...config.pits];
                                newPits[idx].spinDamagePerSecond = parseFloat(
                                  e.target.value
                                );
                                setConfig({ ...config, pits: newPits });
                              }}
                              min={5}
                              max={50}
                              step={5}
                              className="w-full"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                              Damage applied if escape fails
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Escape Chance:{" "}
                              {(pit.escapeChance * 100).toFixed(0)}%
                            </label>
                            <input
                              type="range"
                              value={pit.escapeChance}
                              onChange={(e) => {
                                const newPits = [...config.pits];
                                newPits[idx].escapeChance = parseFloat(
                                  e.target.value
                                );
                                setConfig({ ...config, pits: newPits });
                              }}
                              min={0}
                              max={1}
                              step={0.05}
                              className="w-full"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                              Chance to escape each second
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Pit Color
                          </label>
                          <input
                            type="color"
                            value={pit.color || "#3c1810"}
                            onChange={(e) => {
                              const newPits = [...config.pits];
                              newPits[idx].color = e.target.value;
                              setConfig({ ...config, pits: newPits });
                            }}
                            className="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                          />
                        </div>

                        {/* Pit mechanics info */}
                        <div className="bg-gray-700 rounded p-3">
                          <p className="text-xs text-gray-300">
                            ⚙️ <strong>Pit Mechanics:</strong>
                          </p>
                          <ul className="text-xs text-gray-400 ml-4 mt-1 space-y-1">
                            <li>
                              Every second:{" "}
                              {(pit.escapeChance * 100).toFixed(0)}% chance to
                              escape
                            </li>
                            <li>
                              If escape fails: -{pit.spinDamagePerSecond} spin
                              damage
                            </li>
                            <li>Beyblade cannot be controlled while in pit</li>
                            <li>Continues until escape or spin reaches zero</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PREVIEW TAB */}
            {currentTab === "preview" && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Full Preview</h2>
                <div className="flex justify-center">
                  <ArenaPreviewBasic
                    arena={config}
                    width={700}
                    height={700}
                    showZoomControls={true}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Side Preview Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
              <ArenaPreviewBasic arena={config} width={350} height={350} />

              {/* Arena Stats */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Shape:</span>
                  <span className="font-semibold">{config.shape}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Edges:</span>
                  <span className="font-semibold">{edgeCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Theme:</span>
                  <span className="font-semibold">{config.theme}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rotation:</span>
                  <span className="font-semibold">
                    {config.autoRotate ? "ON" : "OFF"}
                  </span>
                </div>
                {config.wall.enabled && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Walls:</span>
                      <span className="font-semibold">
                        {config.wall.edges.reduce(
                          (sum, edge) => sum + edge.walls.length,
                          0
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
