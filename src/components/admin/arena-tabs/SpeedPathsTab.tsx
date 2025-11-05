/**
 * SpeedPathsTab Component
 * Handles speed path (loops) configuration with charge points
 */

"use client";

import React from "react";
import { ArenaConfig } from "@/types/arenaConfigNew";

interface SpeedPathsTabProps {
  config: ArenaConfig;
  setConfig: (config: ArenaConfig) => void;
  ARENA_RESOLUTION: number;
}

export default function SpeedPathsTab({
  config,
  setConfig,
  ARENA_RESOLUTION,
}: SpeedPathsTabProps) {
  return (
    <div className="space-y-6">
      {/* Add Speed Path Header */}
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
            No speed paths yet. Click "+ Add Speed Path" to create one.
          </p>
        </div>
      ) : (
        config.speedPaths.map((speedPath, idx) => (
          <div key={idx} className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Speed Path {idx + 1}</h3>
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
                    newSpeedPaths[idx].radius = parseFloat(e.target.value);
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
                <label className="block text-sm font-medium mb-2">Shape</label>
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
                    newSpeedPaths[idx].speedBoost = parseFloat(e.target.value);
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
                <label className="block text-sm font-medium mb-2">Color</label>
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
                    newSpeedPaths[idx].rotation = parseFloat(e.target.value);
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
                  Charge Points ({speedPath.chargePoints?.length || 0})
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
                      if (newSpeedPaths[idx].chargePoints!.length < 3) {
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
                      newSpeedPaths[idx].autoPlaceChargePoints = false;
                      setConfig({
                        ...config,
                        speedPaths: newSpeedPaths,
                      });
                    }}
                    disabled={(speedPath.chargePoints?.length || 0) >= 3}
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

              {speedPath.chargePoints && speedPath.chargePoints.length > 0 ? (
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
                            const newSpeedPaths = [...config.speedPaths];
                            newSpeedPaths[idx].chargePoints!.splice(cpIdx, 1);
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
                            Path Position: {cp.pathPosition?.toFixed(1) || 0}%
                          </label>
                          <input
                            type="range"
                            value={cp.pathPosition || 0}
                            onChange={(e) => {
                              const newSpeedPaths = [...config.speedPaths];
                              newSpeedPaths[idx].chargePoints![
                                cpIdx
                              ].pathPosition = parseFloat(e.target.value);
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
                          <label className="block text-xs mb-1">Target</label>
                          <select
                            value={cp.target}
                            onChange={(e) => {
                              const newSpeedPaths = [...config.speedPaths];
                              newSpeedPaths[idx].chargePoints![cpIdx].target = e
                                .target.value as "center" | "opponent";
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
                              const newSpeedPaths = [...config.speedPaths];
                              newSpeedPaths[idx].chargePoints![
                                cpIdx
                              ].dashSpeed = parseFloat(e.target.value);
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
                              const newSpeedPaths = [...config.speedPaths];
                              newSpeedPaths[idx].chargePoints![cpIdx].radius =
                                parseFloat(e.target.value);
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
                              const newSpeedPaths = [...config.speedPaths];
                              newSpeedPaths[idx].chargePoints![cpIdx].buttonId =
                                parseInt(e.target.value) as 1 | 2 | 3;
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
                          <label className="block text-xs mb-1">Color</label>
                          <input
                            type="color"
                            value={cp.color || "#fbbf24"}
                            onChange={(e) => {
                              const newSpeedPaths = [...config.speedPaths];
                              newSpeedPaths[idx].chargePoints![cpIdx].color =
                                e.target.value;
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
                  No charge points. Add one to create dash attack opportunities.
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
