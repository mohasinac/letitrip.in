/**
 * PitsTab Component
 * Handles pit hazard configuration with position and radius sliders
 */

"use client";

import React from "react";
import {
  ArenaConfig,
  ArenaShape,
  ARENA_RESOLUTION,
  getEdgeCount,
} from "@/types/arenaConfigNew";

interface PitsTabProps {
  config: ArenaConfig;
  setConfig: (config: ArenaConfig) => void;
  calculatePolygonVertices: (
    shape: ArenaShape,
    centerX: number,
    centerY: number,
    radius: number,
    sides: number
  ) => Array<{ x: number; y: number }>;
  calculateStarVertices: (
    centerX: number,
    centerY: number,
    outerRadius: number,
    points: number
  ) => Array<{ x: number; y: number }>;
}

export default function PitsTab({
  config,
  setConfig,
  calculatePolygonVertices,
  calculateStarVertices,
}: PitsTabProps) {
  return (
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
                    const points = parseInt(config.shape.replace("star", ""));
                    vertices = calculateStarVertices(0, 0, pitDistance, points);
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
                    .map((vertex: { x: number; y: number }, i: number) => ({
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
                      angle: Math.atan2(vertex.y, vertex.x) * (180 / Math.PI),
                    }));

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
              <strong>Circle Arena:</strong> Creates a single large center pit
              (classic danger zone)
            </li>
            <li>
              <strong>Other Shapes:</strong> Creates small pits around arena
              edges (all at once based on shape)
            </li>
            <li>
              <strong>Crater Pits:</strong> Additional manual pits that can be
              placed anywhere (max 3)
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
              borderLeftColor: pit.type === "edge" ? "#ea580c" : "#7f1d1d",
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {pit.type === "edge" ? "🕳️ Edge Pit" : "⚫ Crater Pit"}
                <span className="text-gray-400 text-sm">({pit.id})</span>
              </h3>
              <button
                onClick={() => {
                  const newPits = config.pits.filter((_, i) => i !== idx);
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
                    Auto-placed at {pit.angle || idx * 120}° from center
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
                          newPits[idx].position.x = parseFloat(e.target.value);
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
                          newPits[idx].position.x = parseFloat(e.target.value);
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
                          newPits[idx].position.y = parseFloat(e.target.value);
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
                          newPits[idx].position.y = parseFloat(e.target.value);
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
                    {((pit.radius / ARENA_RESOLUTION) * 100).toFixed(1)}% of
                    arena)
                  </label>
                  <input
                    type="range"
                    value={pit.radius}
                    onChange={(e) => {
                      const newPits = [...config.pits];
                      newPits[idx].radius = parseFloat(e.target.value);
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
                    Escape Chance: {(pit.escapeChance * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    value={pit.escapeChance}
                    onChange={(e) => {
                      const newPits = [...config.pits];
                      newPits[idx].escapeChance = parseFloat(e.target.value);
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
                    Every second: {(pit.escapeChance * 100).toFixed(0)}% chance
                    to escape
                  </li>
                  <li>
                    If escape fails: -{pit.spinDamagePerSecond} spin damage
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
  );
}
