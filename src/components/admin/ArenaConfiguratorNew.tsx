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
import WallsTab from "./arena-tabs/WallsTab";
import SpeedPathsTab from "./arena-tabs/SpeedPathsTab";
import ObstaclesTab from "./arena-tabs/ObstaclesTab";
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
    | "basics"
    | "walls"
    | "loops"
    | "portals"
    | "water"
    | "pits"
    | "obstacles"
    | "preview"
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
      obstacles: [],
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
      obstacles: [], // Reset obstacles when shape changes
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
              "obstacles",
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
              <WallsTab
                config={config}
                setConfig={setConfig}
                edgeCount={edgeCount}
                selectedEdgeIndex={selectedEdgeIndex}
                setSelectedEdgeIndex={setSelectedEdgeIndex}
                currentEdge={currentEdge}
                handleToggleWalls={handleToggleWalls}
                handleGenerateRandomWalls={handleGenerateRandomWalls}
                handleGenerateEquidistantWalls={handleGenerateEquidistantWalls}
                handleAddWallSegment={handleAddWallSegment}
                handleRemoveWallSegment={handleRemoveWallSegment}
                handleUpdateWallSegment={handleUpdateWallSegment}
              />
            )}

            {/* SPEED PATHS TAB */}
            {currentTab === "loops" && (
              <SpeedPathsTab
                config={config}
                setConfig={setConfig}
                ARENA_RESOLUTION={ARENA_RESOLUTION}
              />
            )}

            {/* PORTALS TAB */}
            {currentTab === "portals" && (
              <PortalsTab config={config} setConfig={setConfig} />
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

            {/* OBSTACLES TAB */}
            {currentTab === "obstacles" && (
              <ObstaclesTab config={config} setConfig={setConfig} />
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
