"use client";

import React, { useState } from "react";
import ArenaPreviewBasic from "@/components/admin/ArenaPreviewBasic";
import {
  ArenaConfig,
  ARENA_PRESETS,
  generateRandomWalls,
  initializeWallConfig,
  getEdgeCount,
  ArenaShape,
} from "@/types/arenaConfigNew";

export default function ArenaTestPage() {
  const [selectedPreset, setSelectedPreset] = useState<string>("classic");
  const [arena, setArena] = useState<ArenaConfig>(ARENA_PRESETS.classic);

  const loadPreset = (presetName: string) => {
    setSelectedPreset(presetName);
    setArena(ARENA_PRESETS[presetName as keyof typeof ARENA_PRESETS]);
  };

  const generateRandom = () => {
    const shapes: ArenaShape[] = [
      "circle",
      "triangle",
      "square",
      "pentagon",
      "hexagon",
      "heptagon",
      "octagon",
    ];
    const themes = [
      "forest",
      "mountains",
      "grasslands",
      "metrocity",
      "safari",
      "prehistoric",
      "futuristic",
      "desert",
      "sea",
      "riverbank",
    ] as const;

    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const randomRotate = Math.random() > 0.5;
    const randomSpeed = Math.floor(Math.random() * 20) + 5;

    const newArena: ArenaConfig = {
      name: `Random ${
        randomShape.charAt(0).toUpperCase() + randomShape.slice(1)
      } Arena`,
      description: `Randomly generated ${randomShape} arena with ${randomTheme} theme`,
      width: 50,
      height: 50,
      shape: randomShape,
      theme: randomTheme,
      autoRotate: randomRotate,
      rotationSpeed: randomSpeed,
      rotationDirection: Math.random() > 0.5 ? "clockwise" : "counterclockwise",
      wall: generateRandomWalls(randomShape),
    };

    setArena(newArena);
    setSelectedPreset("");
  };

  const toggleRotation = () => {
    setArena({
      ...arena,
      autoRotate: !arena.autoRotate,
    });
  };

  const changeShape = (newShape: ArenaShape) => {
    setArena({
      ...arena,
      shape: newShape,
      wall: initializeWallConfig(newShape),
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          🎯 Arena System Test - New Wall System
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Presets */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Load Presets</h2>
              <div className="space-y-2">
                {Object.keys(ARENA_PRESETS).map((presetName) => (
                  <button
                    key={presetName}
                    onClick={() => loadPreset(presetName)}
                    className={`w-full px-4 py-2 rounded-lg transition ${
                      selectedPreset === presetName
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {presetName.replace(/_/g, " ").toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Random Generator */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Random Arena</h2>
              <button
                onClick={generateRandom}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
              >
                🎲 Generate Random Arena
              </button>
            </div>

            {/* Shape Selector */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Change Shape</h2>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    "circle",
                    "triangle",
                    "square",
                    "pentagon",
                    "hexagon",
                    "heptagon",
                    "octagon",
                  ] as ArenaShape[]
                ).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => changeShape(shape)}
                    className={`px-3 py-2 rounded text-sm transition ${
                      arena.shape === shape
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {shape.toUpperCase()}
                    <div className="text-xs opacity-75">
                      {getEdgeCount(shape)} edge
                      {getEdgeCount(shape) > 1 ? "s" : ""}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Rotation Control */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Rotation</h2>
              <button
                onClick={toggleRotation}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition ${
                  arena.autoRotate
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {arena.autoRotate ? "🔄 Rotation ON" : "⏸️ Rotation OFF"}
              </button>
              {arena.autoRotate && (
                <div className="mt-3 text-sm text-gray-400">
                  Speed: {arena.rotationSpeed} rpm
                  <br />
                  Direction: {arena.rotationDirection}
                  <br />
                  Time per rotation: ~{(60 / arena.rotationSpeed).toFixed(1)}s
                </div>
              )}
            </div>

            {/* Arena Info */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Arena Info</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Name:</strong> {arena.name}
                </div>
                <div>
                  <strong>Shape:</strong> {arena.shape}
                </div>
                <div>
                  <strong>Edges:</strong> {getEdgeCount(arena.shape)}
                </div>
                <div>
                  <strong>Theme:</strong> {arena.theme}
                </div>
                <div>
                  <strong>Walls Enabled:</strong>{" "}
                  {arena.wall.enabled ? "Yes" : "No"}
                </div>
                {arena.wall.enabled && (
                  <div>
                    <strong>Total Wall Segments:</strong>{" "}
                    {arena.wall.edges.reduce(
                      (sum, edge) => sum + edge.walls.length,
                      0
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
              <div className="flex justify-center">
                <ArenaPreviewBasic arena={arena} width={600} height={600} />
              </div>

              {/* Legend */}
              <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-amber-800 to-amber-600 rounded"></div>
                  <span>Brick Walls</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-dashed border-red-500 rounded"></div>
                  <span>Exit Zones</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center text-red-500 border border-red-500 rounded">
                    →
                  </div>
                  <span>Exit Arrows</span>
                </div>
              </div>

              {/* Wall Configuration Details */}
              {arena.wall.enabled && (
                <div className="mt-6 bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Wall Configuration</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {arena.wall.edges.map((edge, edgeIdx) => (
                      <div key={edgeIdx} className="bg-gray-600 rounded p-3">
                        <div className="font-semibold mb-2">
                          Edge {edgeIdx + 1}
                        </div>
                        <div className="space-y-1">
                          <div>Walls: {edge.walls.length}</div>
                          {edge.walls.map((wall, wallIdx) => (
                            <div
                              key={wallIdx}
                              className="text-xs text-gray-300"
                            >
                              • Width: {wall.width}%, Pos: {wall.position}%
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
