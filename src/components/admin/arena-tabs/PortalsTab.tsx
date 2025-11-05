/**
 * PortalsTab Component
 * Handles portal configuration with position and radius sliders
 */

"use client";

import React from "react";
import { ArenaConfig, ARENA_RESOLUTION } from "@/types/arenaConfigNew";

interface PortalsTabProps {
  config: ArenaConfig;
  setConfig: (config: ArenaConfig) => void;
}

export default function PortalsTab({ config, setConfig }: PortalsTabProps) {
  return (
    <div className="space-y-6">
      {/* Portals Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">
              Linked Teleportation Portals ({config.portals.length}/4)
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              All portals are interconnected - entering any portal teleports to
              another based on directional input or randomly
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
                  const colors = ["#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];

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
                  const colors = ["#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];
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
            <strong>Auto-Place:</strong> Portals are positioned at equal angles
            from center:
          </p>
          <ul className="text-xs text-gray-300 ml-4 list-disc">
            <li>2 portals: 0° and 180° (opposite sides)</li>
            <li>3 portals: 0°, 120°, and 240° (triangle)</li>
            <li>4 portals: 0°, 90°, 180°, and 270° (square)</li>
          </ul>
          <p className="text-xs text-gray-300 mt-2">
            <strong>Teleportation:</strong> Use directional input (↑/↓/←/→) to
            choose destination portal, or no input for random teleportation.
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
              <h3 className="text-lg font-semibold">Portal {idx + 1}</h3>
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
                    Portal {idx + 1} positioned at {portal.angle || idx * 90}°
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
                        {((portal.radius / ARENA_RESOLUTION) * 100).toFixed(1)}%
                        of arena)
                      </label>
                      <input
                        type="range"
                        value={portal.radius}
                        onChange={(e) => {
                          const newPortals = [...config.portals];
                          newPortals[idx].radius = parseFloat(e.target.value);
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
                          newPortals[idx].radius = parseFloat(e.target.value);
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
                      ℹ️ <strong>All portals are bidirectional</strong> -
                      Beyblades can travel in both directions through any portal
                      connection.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
