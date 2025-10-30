/**
 * Arena Configuration Editor
 * Create and customize dynamic battle arenas
 */

"use client";

import React, { useState } from "react";
import ArenaPreview from "./ArenaPreview";
import {
  ArenaConfig,
  ArenaShape,
  ArenaTheme,
  LoopConfig,
  ExitConfig,
  WallConfig,
  ObstacleConfig,
  WaterBodyConfig,
  PitConfig,
  LaserGunConfig,
  GoalObjectConfig,
  ARENA_PRESETS,
  generateRandomObstacles,
  generateRandomPits,
  validateArenaConfig,
} from "@/types/arenaConfig";

interface ArenaConfiguratorProps {
  arena?: ArenaConfig | null;
  onSave: (arena: ArenaConfig) => void;
  onCancel: () => void;
}

export default function ArenaConfigurator({
  arena,
  onSave,
  onCancel,
}: ArenaConfiguratorProps) {
  const [currentTab, setCurrentTab] = useState<
    "basic" | "loops" | "hazards" | "goals" | "theme" | "preview"
  >("basic");

  // Pit generation configuration
  const [pitConfig, setPitConfig] = useState({
    count: 4,
    radius: 1.5,
    placement: "edges" as "edges" | "center" | "random",
  });

  const [config, setConfig] = useState<ArenaConfig>(
    arena || {
      name: "New Arena",
      description: "",
      width: 50,
      height: 50,
      shape: "circle",
      theme: "metrocity",
      loops: [],
      exits: [],
      wall: {
        enabled: true,
        baseDamage: 5,
        recoilDistance: 2,
        hasSpikes: false,
        spikeDamageMultiplier: 1.0,
        hasSprings: false,
        springRecoilMultiplier: 1.0,
        thickness: 0.5,
      },
      obstacles: [],
      pits: [],
      laserGuns: [],
      goalObjects: [],
      requireAllGoalsDestroyed: false,
      backgroundLayers: [],
      gravity: 0,
      airResistance: 0.01,
      surfaceFriction: 0.02,
    }
  );

  const handleLoadPreset = (presetKey: string) => {
    const preset = ARENA_PRESETS[presetKey];
    if (preset) {
      setConfig({
        ...config,
        ...preset,
        width: config.width,
        height: config.height,
      } as ArenaConfig);
    }
  };

  const handleAddLoop = () => {
    setConfig({
      ...config,
      loops: [
        ...config.loops,
        {
          radius: 15 + config.loops.length * 5,
          shape: "circle",
          speedBoost: 1.2,
          frictionMultiplier: 1.0,
        },
      ],
    });
  };

  const handleRemoveLoop = (index: number) => {
    setConfig({
      ...config,
      loops: config.loops.filter((_, i) => i !== index),
    });
  };

  const handleUpdateLoop = (index: number, updates: Partial<LoopConfig>) => {
    const newLoops = [...config.loops];
    newLoops[index] = { ...newLoops[index], ...updates };
    setConfig({ ...config, loops: newLoops });
  };

  const handleGenerateObstacles = () => {
    const count = Math.floor(Math.random() * 10) + 5; // 5-15 obstacles
    const excludeZones = [
      ...config.loops.map((loop) => ({ x: 0, y: 0, radius: loop.radius })),
      ...(config.waterBody?.type === "center"
        ? [{ x: 0, y: 0, radius: config.waterBody.radius || 10 }]
        : []),
    ];

    const obstacles = generateRandomObstacles(
      count,
      config.width,
      config.height,
      excludeZones
    );
    setConfig({ ...config, obstacles });
  };

  const handleGeneratePits = (placement: "edges" | "center" | "random") => {
    const pits = generateRandomPits(
      pitConfig.count,
      config.width / 2,
      placement,
      pitConfig.radius
    );
    setConfig({ ...config, pits });
  };

  const handleSave = () => {
    const validation = validateArenaConfig(config);
    if (!validation.valid) {
      alert(`Validation errors:\n${validation.errors.join("\n")}`);
      return;
    }
    onSave(config);
  };

  const shapes: ArenaShape[] = [
    "circle",
    "rectangle",
    "pentagon",
    "hexagon",
    "octagon",
    "star",
    "oval",
    "racetrack",
  ];
  const themes: ArenaTheme[] = [
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
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {arena ? "Edit Arena" : "Create New Arena"}
              </h2>
              <p className="text-gray-600 mt-1">
                Design custom battle arenas with loops, hazards, and objectives
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 text-3xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            {[
              { id: "basic", label: "🏟️ Basic", icon: "" },
              { id: "loops", label: "🔄 Loops & Exits", icon: "" },
              { id: "hazards", label: "⚠️ Hazards", icon: "" },
              { id: "goals", label: "🎯 Goals", icon: "" },
              { id: "theme", label: "🎨 Theme", icon: "" },
              { id: "preview", label: "👁️ Preview", icon: "" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left Side - Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Tab */}
            {currentTab === "basic" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Arena Name *
                    </label>
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) =>
                        setConfig({ ...config, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Shape *
                    </label>
                    <select
                      value={config.shape}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          shape: e.target.value as ArenaShape,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    >
                      {shapes.map((shape) => (
                        <option key={shape} value={shape}>
                          {shape.charAt(0).toUpperCase() + shape.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Theme *
                    </label>
                    <select
                      value={config.theme}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          theme: e.target.value as ArenaTheme,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    >
                      {themes.map((theme) => (
                        <option key={theme} value={theme}>
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Arena Rotation (°)
                    </label>
                    <input
                      type="number"
                      value={config.rotation || 0}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          rotation: parseFloat(e.target.value),
                        })
                      }
                      min={0}
                      max={360}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Rotate the entire stadium (0-360°)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={config.description || ""}
                    onChange={(e) =>
                      setConfig({ ...config, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Preset Loader */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3">
                    Load Preset Arena
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.keys(ARENA_PRESETS).map((key) => (
                      <button
                        key={key}
                        onClick={() => handleLoadPreset(key)}
                        className="px-4 py-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-100"
                      >
                        {ARENA_PRESETS[key].name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wall Configuration */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Wall Settings
                  </h3>

                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      checked={config.wall.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          wall: { ...config.wall, enabled: e.target.checked },
                        })
                      }
                      className="w-5 h-5"
                    />
                    <label className="text-sm font-medium">Enable Walls</label>
                  </div>

                  {!config.wall.enabled && (
                    <div className="flex items-center gap-3 mb-4 ml-8">
                      <input
                        type="checkbox"
                        checked={config.wall.allExits || false}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            wall: { ...config.wall, allExits: e.target.checked },
                          })
                        }
                        className="w-5 h-5"
                      />
                      <label className="text-sm font-medium">
                        All Boundary is Exit Zone
                      </label>
                      <p className="text-xs text-gray-500">
                        (If unchecked, closed boundary with no exits)
                      </p>
                    </div>
                  )}

                  {config.wall.enabled && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Wall Count
                          </label>
                          <input
                            type="number"
                            value={config.wall.wallCount || 8}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                wall: {
                                  ...config.wall,
                                  wallCount: parseInt(e.target.value),
                                },
                              })
                            }
                            min={3}
                            max={20}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Number of wall segments (3-20)
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Base Damage
                          </label>
                          <input
                            type="number"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Recoil Distance (em)
                          </label>
                          <input
                            type="number"
                            step="0.5"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                          />
                        </div>

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
                            className="w-4 h-4"
                          />
                          <label className="text-sm">Spikes (2x damage)</label>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.wall.hasSprings}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                wall: {
                                  ...config.wall,
                                  hasSprings: e.target.checked,
                                },
                              })
                            }
                            className="w-4 h-4"
                          />
                          <label className="text-sm">Springs (1.5x recoil)</label>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.wall.exitsBetweenWalls || false}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                wall: {
                                  ...config.wall,
                                  exitsBetweenWalls: e.target.checked,
                                },
                              })
                            }
                            className="w-4 h-4"
                          />
                          <label className="text-sm">
                            Exits Between Wall Segments
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Loops Tab */}
            {currentTab === "loops" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">
                    Loops ({config.loops.length})
                  </h3>
                  <button
                    onClick={handleAddLoop}
                    disabled={config.loops.length >= 10}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    + Add Loop
                  </button>
                </div>

                {config.loops.map((loop, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-300"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">Loop {index + 1}</h4>
                      <button
                        onClick={() => handleRemoveLoop(index)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">
                          Shape
                        </label>
                        <select
                          value={loop.shape}
                          onChange={(e) =>
                            handleUpdateLoop(index, {
                              shape: e.target.value as any,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        >
                          <option value="circle">⭕ Circle</option>
                          <option value="rectangle">▭ Rectangle</option>
                          <option value="pentagon">⬠ Pentagon</option>
                          <option value="hexagon">⬡ Hexagon</option>
                          <option value="octagon">⯃ Octagon</option>
                          <option value="star">⭐ Star</option>
                          <option value="oval">⬭ Oval</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-700 mb-1">
                          Radius/Size (em)
                        </label>
                        <input
                          type="number"
                          value={loop.radius}
                          onChange={(e) =>
                            handleUpdateLoop(index, {
                              radius: parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    {loop.shape === "rectangle" && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-gray-700 mb-1">
                            Width (em)
                          </label>
                          <input
                            type="number"
                            value={loop.width || loop.radius * 2}
                            onChange={(e) =>
                              handleUpdateLoop(index, {
                                width: parseFloat(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-700 mb-1">
                            Height (em)
                          </label>
                          <input
                            type="number"
                            value={loop.height || loop.radius * 2}
                            onChange={(e) =>
                              handleUpdateLoop(index, {
                                height: parseFloat(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">
                          Speed Boost
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={loop.speedBoost}
                          onChange={(e) =>
                            handleUpdateLoop(index, {
                              speedBoost: parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-700 mb-1">
                          Spin Boost
                        </label>
                        <input
                          type="number"
                          value={loop.spinBoost || 0}
                          onChange={(e) =>
                            handleUpdateLoop(index, {
                              spinBoost: parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-700 mb-1">
                          Rotation (°)
                        </label>
                        <input
                          type="number"
                          value={loop.rotation || 0}
                          onChange={(e) =>
                            handleUpdateLoop(index, {
                              rotation: parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-700 mb-1">
                          Color
                        </label>
                        <input
                          type="color"
                          value={loop.color || "#3b82f6"}
                          onChange={(e) =>
                            handleUpdateLoop(index, {
                              color: e.target.value,
                            })
                          }
                          className="w-full h-10 border border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    {/* Charge Points Configuration */}
                    <div className="mt-3 bg-yellow-50 p-3 rounded border border-yellow-200">
                      <h5 className="text-sm font-semibold text-yellow-900 mb-2">
                        ⚡ Charge Points (Spin Recovery)
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-yellow-700 mb-1">
                            Number of Charge Points
                          </label>
                          <input
                            type="number"
                            value={loop.chargePointCount || 0}
                            onChange={(e) => {
                              const count = parseInt(e.target.value);
                              const points = count > 0
                                ? Array.from({ length: count }, (_, i) => ({
                                    angle: (360 / count) * i,
                                    rechargeRate: 5,
                                    radius: 1,
                                    color: "#fbbf24",
                                  }))
                                : undefined;
                              handleUpdateLoop(index, {
                                chargePointCount: count,
                                chargePoints: points,
                              });
                            }}
                            min={0}
                            max={12}
                            className="w-full px-3 py-2 border border-yellow-300 rounded"
                          />
                          <p className="text-xs text-yellow-600 mt-1">
                            Evenly distributed (0-12)
                          </p>
                        </div>

                        {(loop.chargePointCount || 0) > 0 && (
                          <div>
                            <label className="block text-xs text-yellow-700 mb-1">
                              Recharge Rate (%/sec)
                            </label>
                            <input
                              type="number"
                              value={loop.chargePoints?.[0]?.rechargeRate || 5}
                              onChange={(e) => {
                                const rate = parseFloat(e.target.value);
                                const updatedPoints = loop.chargePoints?.map(p => ({
                                  ...p,
                                  rechargeRate: rate,
                                }));
                                handleUpdateLoop(index, {
                                  chargePoints: updatedPoints,
                                });
                              }}
                              min={1}
                              max={20}
                              step="0.5"
                              className="w-full px-3 py-2 border border-yellow-300 rounded"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {config.loops.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No loops yet. Click "Add Loop" to create speed boost zones.
                  </div>
                )}

                {/* Portals Section */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-purple-900">
                      🌀 Portals (Teleportation) - Max 2
                    </h3>
                    <button
                      onClick={() => {
                        const portalCount = config.portals?.length || 0;
                        if (portalCount < 2) {
                          const newPortal: any = {
                            id: `portal${portalCount + 1}`,
                            inPoint: { x: 0, y: -15 + portalCount * 30 },
                            outPoint: { x: 0, y: 15 - portalCount * 30 },
                            radius: 2,
                            cooldown: 1,
                            color: portalCount === 0 ? "#8b5cf6" : "#06b6d4",
                            bidirectional: true,
                          };
                          setConfig({
                            ...config,
                            portals: [...(config.portals || []), newPortal],
                          });
                        }
                      }}
                      disabled={(config.portals?.length || 0) >= 2}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + Add Portal
                    </button>
                  </div>

                  {config.portals && config.portals.length > 0 ? (
                    <div className="space-y-4">
                      {config.portals.map((portal, index) => (
                        <div
                          key={portal.id}
                          className="bg-white p-4 rounded border border-purple-300"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-purple-900">
                              Portal {index + 1}
                            </h4>
                            <button
                              onClick={() => {
                                const newPortals = config.portals!.filter(
                                  (_, i) => i !== index
                                );
                                setConfig({
                                  ...config,
                                  portals:
                                    newPortals.length > 0
                                      ? newPortals
                                      : undefined,
                                });
                              }}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-xs text-purple-700 mb-1">
                                Entry Point X (em)
                              </label>
                              <input
                                type="number"
                                value={portal.inPoint.x}
                                onChange={(e) => {
                                  const newPortals = [...config.portals!];
                                  newPortals[index] = {
                                    ...portal,
                                    inPoint: {
                                      ...portal.inPoint,
                                      x: parseFloat(e.target.value),
                                    },
                                  };
                                  setConfig({ ...config, portals: newPortals });
                                }}
                                className="w-full px-3 py-2 border border-purple-300 rounded"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-purple-700 mb-1">
                                Entry Point Y (em)
                              </label>
                              <input
                                type="number"
                                value={portal.inPoint.y}
                                onChange={(e) => {
                                  const newPortals = [...config.portals!];
                                  newPortals[index] = {
                                    ...portal,
                                    inPoint: {
                                      ...portal.inPoint,
                                      y: parseFloat(e.target.value),
                                    },
                                  };
                                  setConfig({ ...config, portals: newPortals });
                                }}
                                className="w-full px-3 py-2 border border-purple-300 rounded"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-purple-700 mb-1">
                                Exit Point X (em)
                              </label>
                              <input
                                type="number"
                                value={portal.outPoint.x}
                                onChange={(e) => {
                                  const newPortals = [...config.portals!];
                                  newPortals[index] = {
                                    ...portal,
                                    outPoint: {
                                      ...portal.outPoint,
                                      x: parseFloat(e.target.value),
                                    },
                                  };
                                  setConfig({ ...config, portals: newPortals });
                                }}
                                className="w-full px-3 py-2 border border-purple-300 rounded"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-purple-700 mb-1">
                                Exit Point Y (em)
                              </label>
                              <input
                                type="number"
                                value={portal.outPoint.y}
                                onChange={(e) => {
                                  const newPortals = [...config.portals!];
                                  newPortals[index] = {
                                    ...portal,
                                    outPoint: {
                                      ...portal.outPoint,
                                      y: parseFloat(e.target.value),
                                    },
                                  };
                                  setConfig({ ...config, portals: newPortals });
                                }}
                                className="w-full px-3 py-2 border border-purple-300 rounded"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-purple-700 mb-1">
                                Portal Radius (em)
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                value={portal.radius}
                                onChange={(e) => {
                                  const newPortals = [...config.portals!];
                                  newPortals[index] = {
                                    ...portal,
                                    radius: parseFloat(e.target.value),
                                  };
                                  setConfig({ ...config, portals: newPortals });
                                }}
                                min={1}
                                max={5}
                                className="w-full px-3 py-2 border border-purple-300 rounded"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-purple-700 mb-1">
                                Cooldown (seconds)
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                value={portal.cooldown || 0}
                                onChange={(e) => {
                                  const newPortals = [...config.portals!];
                                  newPortals[index] = {
                                    ...portal,
                                    cooldown: parseFloat(e.target.value),
                                  };
                                  setConfig({ ...config, portals: newPortals });
                                }}
                                min={0}
                                max={10}
                                className="w-full px-3 py-2 border border-purple-300 rounded"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-purple-700 mb-1">
                                Portal Color
                              </label>
                              <input
                                type="color"
                                value={portal.color || "#8b5cf6"}
                                onChange={(e) => {
                                  const newPortals = [...config.portals!];
                                  newPortals[index] = {
                                    ...portal,
                                    color: e.target.value,
                                  };
                                  setConfig({ ...config, portals: newPortals });
                                }}
                                className="w-full h-10 border border-purple-300 rounded"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={portal.bidirectional !== false}
                                onChange={(e) => {
                                  const newPortals = [...config.portals!];
                                  newPortals[index] = {
                                    ...portal,
                                    bidirectional: e.target.checked,
                                  };
                                  setConfig({ ...config, portals: newPortals });
                                }}
                                className="w-4 h-4"
                              />
                              <label className="text-sm text-purple-700">
                                Bidirectional
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-purple-700 text-center py-4">
                      No portals. Add up to 2 portals for teleportation.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Hazards Tab */}
            {currentTab === "hazards" && (
              <div className="space-y-6">
                {/* Obstacles */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-orange-900">
                      🪨 Obstacles ({config.obstacles.length})
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleGenerateObstacles}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                      >
                        🎲 Generate Random
                      </button>
                      {config.obstacles.length > 0 && (
                        <button
                          onClick={() =>
                            setConfig({ ...config, obstacles: [] })
                          }
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          🗑️ Clear All
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-orange-700 mb-3">
                    Rocks, pillars, and barriers scattered in the arena
                  </p>

                  {config.obstacles.length > 0 && (
                    <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                      {config.obstacles.map((obstacle, index) => (
                        <div
                          key={index}
                          className="bg-white p-2 rounded border border-orange-200 flex justify-between items-center"
                        >
                          <div className="text-sm">
                            <span className="font-semibold">
                              {obstacle.type}
                            </span>{" "}
                            at ({obstacle.x.toFixed(1)}, {obstacle.y.toFixed(1)}
                            ) - Size: {obstacle.radius}em
                          </div>
                          <button
                            onClick={() => {
                              const newObstacles = config.obstacles.filter(
                                (_, i) => i !== index
                              );
                              setConfig({ ...config, obstacles: newObstacles });
                            }}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pits */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-purple-900">
                      🕳️ Pits ({config.pits.length})
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGeneratePits("edges")}
                        className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                      >
                        Edges
                      </button>
                      <button
                        onClick={() => handleGeneratePits("center")}
                        className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                      >
                        Center
                      </button>
                      <button
                        onClick={() => handleGeneratePits("random")}
                        className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                      >
                        Random
                      </button>
                      {config.pits.length > 0 && (
                        <button
                          onClick={() => setConfig({ ...config, pits: [] })}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          🗑️ Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pit Generation Controls */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-purple-700 mb-1">
                        Number of Pits
                      </label>
                      <input
                        type="number"
                        value={pitConfig.count}
                        onChange={(e) =>
                          setPitConfig({
                            ...pitConfig,
                            count: parseInt(e.target.value),
                          })
                        }
                        min={1}
                        max={20}
                        className="w-full px-3 py-2 border border-purple-300 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-purple-700 mb-1">
                        Pit Radius (em)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={pitConfig.radius}
                        onChange={(e) =>
                          setPitConfig({
                            ...pitConfig,
                            radius: parseFloat(e.target.value),
                          })
                        }
                        min={0.5}
                        max={5}
                        className="w-full px-3 py-2 border border-purple-300 rounded"
                      />
                    </div>
                  </div>

                  <p className="text-sm text-purple-700 mb-3">
                    Traps that drain spin (10%/sec) with 50% escape chance. Set
                    count and radius, then click placement button.
                  </p>

                  {config.pits.length > 0 && (
                    <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                      {config.pits.map((pit, index) => (
                        <div
                          key={index}
                          className="bg-white p-2 rounded border border-purple-200 flex justify-between items-center"
                        >
                          <div className="text-sm">
                            Pit at ({pit.x.toFixed(1)}, {pit.y.toFixed(1)}) -
                            Radius: {pit.radius}em - Drain:{" "}
                            {pit.damagePerSecond}%/s
                          </div>
                          <button
                            onClick={() => {
                              const newPits = config.pits.filter(
                                (_, i) => i !== index
                              );
                              setConfig({ ...config, pits: newPits });
                            }}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Water Body */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={config.waterBody?.enabled || false}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          waterBody: e.target.checked
                            ? {
                                enabled: true,
                                type: "center",
                                shape: "circle",
                                radius: 10,
                                liquidType: "water",
                                spinDrainRate: 2,
                                speedMultiplier: 0.6,
                                viscosity: 0.8,
                                color: "#4fc3f7",
                                waveAnimation: true,
                              }
                            : undefined,
                        })
                      }
                      className="w-5 h-5"
                    />
                    <h3 className="font-semibold text-blue-900">
                      💧 Liquid Body
                    </h3>
                  </div>

                  {config.waterBody?.enabled && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-blue-700 mb-1">
                            Position Type
                          </label>
                          <select
                            value={config.waterBody.type}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                waterBody: {
                                  ...config.waterBody!,
                                  type: e.target.value as
                                    | "center"
                                    | "loop"
                                    | "ring",
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-blue-300 rounded"
                          >
                            <option value="center">Center</option>
                            <option value="loop">Loop Path</option>
                            <option value="ring">Ring</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-blue-700 mb-1">
                            Shape
                          </label>
                          <select
                            value={config.waterBody.shape}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                waterBody: {
                                  ...config.waterBody!,
                                  shape: e.target.value as any,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-blue-300 rounded"
                          >
                            <option value="circle">Circle</option>
                            <option value="rectangle">Rectangle</option>
                            <option value="pentagon">Pentagon</option>
                            <option value="hexagon">Hexagon</option>
                            <option value="octagon">Octagon</option>
                            <option value="star">Star</option>
                            <option value="oval">Oval</option>
                            <option value="ring">Ring</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-blue-700 mb-1">
                            Liquid Type
                          </label>
                          <select
                            value={config.waterBody.liquidType}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                waterBody: {
                                  ...config.waterBody!,
                                  liquidType: e.target.value as any,
                                  color:
                                    e.target.value === "water"
                                      ? "#4fc3f7"
                                      : e.target.value === "blood"
                                      ? "#c62828"
                                      : e.target.value === "lava"
                                      ? "#ff6f00"
                                      : e.target.value === "acid"
                                      ? "#76ff03"
                                      : e.target.value === "oil"
                                      ? "#424242"
                                      : "#00e5ff", // ice
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-blue-300 rounded"
                          >
                            <option value="water">💧 Water</option>
                            <option value="blood">🩸 Blood</option>
                            <option value="lava">🌋 Lava</option>
                            <option value="acid">☢️ Acid</option>
                            <option value="oil">🛢️ Oil</option>
                            <option value="ice">❄️ Ice</option>
                          </select>
                        </div>

                        {config.waterBody.type === "center" && (
                          <>
                            {config.waterBody.shape === "circle" ||
                            config.waterBody.shape === "oval" ? (
                              <div>
                                <label className="block text-xs text-blue-700 mb-1">
                                  Radius (em)
                                </label>
                                <input
                                  type="number"
                                  value={config.waterBody.radius || 10}
                                  onChange={(e) =>
                                    setConfig({
                                      ...config,
                                      waterBody: {
                                        ...config.waterBody!,
                                        radius: parseFloat(e.target.value),
                                      },
                                    })
                                  }
                                  min={5}
                                  max={25}
                                  className="w-full px-3 py-2 border border-blue-300 rounded"
                                />
                              </div>
                            ) : (
                              <>
                                <div>
                                  <label className="block text-xs text-blue-700 mb-1">
                                    Width (em)
                                  </label>
                                  <input
                                    type="number"
                                    value={config.waterBody.width || 15}
                                    onChange={(e) =>
                                      setConfig({
                                        ...config,
                                        waterBody: {
                                          ...config.waterBody!,
                                          width: parseFloat(e.target.value),
                                        },
                                      })
                                    }
                                    min={5}
                                    max={30}
                                    className="w-full px-3 py-2 border border-blue-300 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-blue-700 mb-1">
                                    Height (em)
                                  </label>
                                  <input
                                    type="number"
                                    value={config.waterBody.height || 15}
                                    onChange={(e) =>
                                      setConfig({
                                        ...config,
                                        waterBody: {
                                          ...config.waterBody!,
                                          height: parseFloat(e.target.value),
                                        },
                                      })
                                    }
                                    min={5}
                                    max={30}
                                    className="w-full px-3 py-2 border border-blue-300 rounded"
                                  />
                                </div>
                              </>
                            )}

                            <div>
                              <label className="block text-xs text-blue-700 mb-1">
                                Rotation (°)
                              </label>
                              <input
                                type="number"
                                value={config.waterBody.rotation || 0}
                                onChange={(e) =>
                                  setConfig({
                                    ...config,
                                    waterBody: {
                                      ...config.waterBody!,
                                      rotation: parseFloat(e.target.value),
                                    },
                                  })
                                }
                                min={0}
                                max={360}
                                className="w-full px-3 py-2 border border-blue-300 rounded"
                              />
                            </div>
                          </>
                        )}

                        {/* Ring Thickness Control - for ring type or ring shape */}
                        {config.waterBody.shape === "ring" && (
                          <div>
                            <label className="block text-xs text-blue-700 mb-1">
                              Ring Thickness (em)
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              value={config.waterBody.ringThickness || 3}
                              onChange={(e) =>
                                setConfig({
                                  ...config,
                                  waterBody: {
                                    ...config.waterBody!,
                                    ringThickness: parseFloat(e.target.value),
                                  },
                                })
                              }
                              min={1}
                              max={10}
                              className="w-full px-3 py-2 border border-blue-300 rounded"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Width of the ring band
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-blue-700 mb-1">
                            Spin Drain Rate (%/sec)
                          </label>
                          <input
                            type="number"
                            value={config.waterBody.spinDrainRate}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                waterBody: {
                                  ...config.waterBody!,
                                  spinDrainRate: parseFloat(e.target.value),
                                },
                              })
                            }
                            step="0.1"
                            min={0}
                            max={10}
                            className="w-full px-3 py-2 border border-blue-300 rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-blue-700 mb-1">
                            Speed Multiplier
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={config.waterBody.speedMultiplier}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                waterBody: {
                                  ...config.waterBody!,
                                  speedMultiplier: parseFloat(e.target.value),
                                },
                              })
                            }
                            min={0.1}
                            max={2}
                            className="w-full px-3 py-2 border border-blue-300 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Laser Guns */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-900 mb-2">
                    Laser Guns ({config.laserGuns.length})
                  </h3>
                  <p className="text-sm text-red-700">
                    Coming soon: Auto-targeting turrets that fire at beyblades
                  </p>
                </div>
              </div>
            )}

            {/* Goals Tab */}
            {currentTab === "goals" && (
              <div className="space-y-6">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    Goal Objects ({config.goalObjects.length})
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Destructible objectives - destroy all to win!
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={config.requireAllGoalsDestroyed}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        requireAllGoalsDestroyed: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                  <label className="text-sm font-medium">
                    Require All Goals Destroyed to Win
                  </label>
                </div>
              </div>
            )}

            {/* Theme Tab */}
            {currentTab === "theme" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Arena Theme
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {themes.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setConfig({ ...config, theme })}
                        className={`p-6 rounded-lg border-2 transition-all ${
                          config.theme === theme
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        <div className="text-4xl mb-2">
                          {theme === "forest" && "🌲"}
                          {theme === "mountains" && "⛰️"}
                          {theme === "grasslands" && "🌾"}
                          {theme === "metrocity" && "🏙️"}
                          {theme === "safari" && "🦁"}
                          {theme === "prehistoric" && "🦕"}
                          {theme === "futuristic" && "🚀"}
                          {theme === "desert" && "🏜️"}
                          {theme === "sea" && "🌊"}
                          {theme === "riverbank" && "🏞️"}
                        </div>
                        <div className="font-semibold capitalize">{theme}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Floor Customization */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border-2 border-gray-300">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🎨</span> Floor Customization
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Floor Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.floorColor || "#8b7355"}
                          onChange={(e) =>
                            setConfig({ ...config, floorColor: e.target.value })
                          }
                          className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.floorColor || "#8b7355"}
                          onChange={(e) =>
                            setConfig({ ...config, floorColor: e.target.value })
                          }
                          placeholder="#8b7355"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        {config.floorColor && (
                          <button
                            onClick={() =>
                              setConfig({ ...config, floorColor: undefined })
                            }
                            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            title="Reset to default"
                          >
                            ↺
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Custom floor color (overrides theme default)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Floor Texture (Image URL)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={config.floorTexture || ""}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              floorTexture: e.target.value,
                            })
                          }
                          placeholder="https://example.com/texture.jpg"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        {config.floorTexture && (
                          <button
                            onClick={() =>
                              setConfig({ ...config, floorTexture: undefined })
                            }
                            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            title="Remove texture"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Optional texture image (repeating pattern)
                      </p>
                    </div>
                  </div>

                  {/* Preview */}
                  {(config.floorColor || config.floorTexture) && (
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Preview
                      </label>
                      <div
                        className="w-full h-32 rounded border-2 border-gray-400"
                        style={{
                          backgroundColor: config.floorColor || "#8b7355",
                          backgroundImage: config.floorTexture
                            ? `url(${config.floorTexture})`
                            : undefined,
                          backgroundSize: "cover",
                          backgroundRepeat: "repeat",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {currentTab === "preview" && (
              <div className="space-y-4">
                {/* Actual Arena Rendering */}
                <div className="bg-gray-900 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">
                    🏟️ Live Arena Preview
                  </h3>
                  <div className="flex justify-center bg-gray-800 rounded-lg p-8">
                    <ArenaPreview arena={config} width={600} height={600} />
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-300">
                    <h4 className="font-semibold text-blue-900 mb-3">
                      📊 Arena Stats
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span className="font-bold">
                          {config.width}em × {config.height}em
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shape:</span>
                        <span className="font-bold capitalize">
                          {config.shape}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Theme:</span>
                        <span className="font-bold capitalize">
                          {config.theme}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-300">
                    <h4 className="font-semibold text-purple-900 mb-3">
                      ⚔️ Hazards & Features
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>🔄 Loops:</span>
                        <span className="font-bold">{config.loops.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🪨 Obstacles:</span>
                        <span className="font-bold">
                          {config.obstacles.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>🕳️ Pits:</span>
                        <span className="font-bold">{config.pits.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>💧 Liquid:</span>
                        <span className="font-bold">
                          {config.waterBody?.enabled
                            ? `${config.waterBody.liquidType} (${config.waterBody.shape})`
                            : "None"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>🎯 Goals:</span>
                        <span className="font-bold">
                          {config.goalObjects.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuration JSON */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center justify-between">
                    <span>📝 Configuration JSON</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          JSON.stringify(config, null, 2)
                        );
                        alert("Configuration copied to clipboard!");
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      📋 Copy
                    </button>
                  </h4>
                  <pre className="text-xs bg-white p-3 rounded overflow-auto max-h-96 font-mono">
                    {JSON.stringify(config, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Live Preview (Desktop Only) */}
          <div className="hidden lg:flex lg:w-96 bg-gray-900 p-6 flex-col border-l border-gray-700 sticky top-0 self-start max-h-screen">
            <h3 className="text-white text-lg font-bold mb-4">Live Preview</h3>
            <div className="flex-1 bg-gray-800 rounded-lg p-4 overflow-auto flex items-center justify-center">
              <ArenaPreview arena={config} width={350} height={350} />
            </div>
            <div className="mt-4 text-sm text-white space-y-2">
              <div className="bg-gray-700 p-3 rounded space-y-1">
                <div>
                  📏 Size: {config.width}em × {config.height}em
                </div>
                <div>🔷 Shape: {config.shape}</div>
                <div>🎨 Theme: {config.theme}</div>
              </div>

              <div className="bg-gray-700 p-3 rounded space-y-1">
                <div>🔄 Loops: {config.loops.length}</div>
                <div>🪨 Obstacles: {config.obstacles.length}</div>
                <div>🕳️ Pits: {config.pits.length}</div>
                <div>
                  💧 Liquid:{" "}
                  {config.waterBody?.enabled
                    ? config.waterBody.liquidType
                    : "None"}
                </div>
                <div>🎯 Goals: {config.goalObjects.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between bg-gray-50">
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {arena ? "Update Arena" : "Create Arena"}
          </button>
        </div>
      </div>
    </div>
  );
}
