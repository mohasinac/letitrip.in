/**
 * WallsTab Component
 * Handles wall system configuration for arena edges
 */

"use client";

import React from "react";
import { ArenaConfig, WallSegment } from "@/types/arenaConfigNew";

interface WallsTabProps {
  config: ArenaConfig;
  setConfig: (config: ArenaConfig) => void;
  edgeCount: number;
  selectedEdgeIndex: number;
  setSelectedEdgeIndex: (index: number) => void;
  currentEdge: any;
  handleToggleWalls: () => void;
  handleGenerateRandomWalls: () => void;
  handleGenerateEquidistantWalls: (count: number) => void;
  handleAddWallSegment: () => void;
  handleRemoveWallSegment: (wallIndex: number) => void;
  handleUpdateWallSegment: (
    wallIndex: number,
    property: keyof WallSegment,
    value: number | string
  ) => void;
}

export default function WallsTab({
  config,
  setConfig,
  edgeCount,
  selectedEdgeIndex,
  setSelectedEdgeIndex,
  currentEdge,
  handleToggleWalls,
  handleGenerateRandomWalls,
  handleGenerateEquidistantWalls,
  handleAddWallSegment,
  handleRemoveWallSegment,
  handleUpdateWallSegment,
}: WallsTabProps) {
  return (
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
              Generate Equidistant Walls - Edge {selectedEdgeIndex + 1}
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Generate evenly spaced walls with automatic exits between them
            </p>
            <div className="flex gap-3">
              {[1, 2, 3].map((count) => (
                <button
                  key={count}
                  onClick={() => handleGenerateEquidistantWalls(count)}
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
                {currentEdge.walls.map((wall: WallSegment, wallIdx: number) => (
                  <div key={wallIdx} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">Wall {wallIdx + 1}</h3>
                      <button
                        onClick={() => handleRemoveWallSegment(wallIdx)}
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
            <h2 className="text-xl font-semibold mb-4">Wall Appearance</h2>
            <div className="space-y-4">
              {/* Common Wall Thickness */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Wall Thickness: {config.wall.commonThickness || 10} px
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
                  Spike Damage Multiplier: {config.wall.spikeDamageMultiplier}x
                </label>
                <input
                  type="range"
                  value={config.wall.spikeDamageMultiplier}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      wall: {
                        ...config.wall,
                        spikeDamageMultiplier: parseFloat(e.target.value),
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
            <h2 className="text-xl font-semibold mb-4">Collision Properties</h2>
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
  );
}
