/**
 * Water Bodies Configuration Tab
 * Supports 3 types of water bodies (max 3 total):
 * 1. Moat - Surrounds arena in its shape (star moat around star arena, etc.)
 * 2. Zone - Positioned water with custom shape (circle, square, rectangle, oval)
 * 3. Wall-Based - Water at arena edges, follows arena shape
 */

"use client";

import React from "react";
import {
  ArenaConfig,
  WaterBodyConfig,
  MoatWaterBodyConfig,
  ZoneWaterBodyConfig,
  WallBasedWaterBodyConfig,
  LIQUID_PRESETS,
  LiquidType,
} from "@/types/arenaConfigNew";

interface WaterBodiesTabProps {
  config: ArenaConfig;
  setConfig: (config: ArenaConfig) => void;
}

export default function WaterBodiesTab({
  config,
  setConfig,
}: WaterBodiesTabProps) {
  const waterBodies = config.waterBodies || [];

  // Add Moat Water Body
  const handleAddMoat = () => {
    if (waterBodies.length >= 3) return;

    const liquidPreset = LIQUID_PRESETS["water"];
    const newWater: MoatWaterBodyConfig = {
      id: `water${waterBodies.length + 1}`,
      type: "moat",
      liquidType: "water",
      thickness: 3,
      distanceFromArena: 15, // Inner radius from center (X in diagram)
      followsArenaShape: true, // Star arena = star moat, circle arena = circle moat
      moatShape: "circle", // Default custom shape (used when followsArenaShape is false)
      color: liquidPreset.color,
      opacity: liquidPreset.opacity,
      depth: 5,
      wavyEffect: false,
      effects: { ...liquidPreset.effects },
    };

    setConfig({
      ...config,
      waterBodies: [...waterBodies, newWater],
    });
  };

  // Add Zone Water Body
  const handleAddZone = () => {
    if (waterBodies.length >= 3) return;

    const liquidPreset = LIQUID_PRESETS["water"];
    const newWater: ZoneWaterBodyConfig = {
      id: `water${waterBodies.length + 1}`,
      type: "zone",
      liquidType: "water",
      position: { x: 0, y: 0 },
      shape: "square",
      width: 10,
      height: 10,
      rotation: 0,
      color: liquidPreset.color,
      opacity: liquidPreset.opacity,
      depth: 5,
      wavyEffect: false,
      effects: { ...liquidPreset.effects },
    };

    setConfig({
      ...config,
      waterBodies: [...waterBodies, newWater],
    });
  };

  // Add Wall-Based Water Body
  const handleAddWallBased = () => {
    if (waterBodies.length >= 3) return;

    const liquidPreset = LIQUID_PRESETS["water"];
    const newWater: WallBasedWaterBodyConfig = {
      id: `water${waterBodies.length + 1}`,
      type: "wall-based",
      liquidType: "water",
      thickness: 2,
      offsetFromEdge: 0,
      coversExits: true,
      color: liquidPreset.color,
      opacity: liquidPreset.opacity,
      depth: 5,
      wavyEffect: false,
      effects: { ...liquidPreset.effects },
    };

    setConfig({
      ...config,
      waterBodies: [...waterBodies, newWater],
    });
  };

  // Remove Water Body
  const handleRemoveWater = (index: number) => {
    const newWaterBodies = waterBodies.filter((_, i) => i !== index);
    setConfig({
      ...config,
      waterBodies: newWaterBodies,
    });
  };

  // Update Water Body Property
  const updateWaterProperty = (index: number, property: string, value: any) => {
    const newWaterBodies = [...waterBodies];
    (newWaterBodies[index] as any)[property] = value;
    setConfig({
      ...config,
      waterBodies: newWaterBodies,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">
              Water Bodies ({waterBodies.length}/3)
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Add up to 3 water bodies to your arena
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-700 rounded p-3">
            <div className="text-blue-400 font-semibold mb-1">🌊 Moat</div>
            <p className="text-xs text-gray-300">
              Water ring at distance X from center (both inner & outer
              boundaries follow shape)
            </p>
          </div>
          <div className="bg-gray-700 rounded p-3">
            <div className="text-cyan-400 font-semibold mb-1">💧 Zone</div>
            <p className="text-xs text-gray-300">
              Positioned water with custom shape inside arena
            </p>
          </div>
          <div className="bg-gray-700 rounded p-3">
            <div className="text-teal-400 font-semibold mb-1">
              🏖️ Wall-Based
            </div>
            <p className="text-xs text-gray-300">
              Water at arena edges, follows arena shape
            </p>
          </div>
        </div>

        {/* Add Buttons */}
        {waterBodies.length < 3 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAddMoat}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition"
            >
              + Add Moat
            </button>
            <button
              onClick={handleAddZone}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-semibold transition"
            >
              + Add Zone
            </button>
            <button
              onClick={handleAddWallBased}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-sm font-semibold transition"
            >
              + Add Wall-Based
            </button>
          </div>
        )}
      </div>

      {/* Water Bodies List */}
      {waterBodies.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400 text-lg">
            No water bodies yet. Click a button above to add one.
          </p>
        </div>
      ) : (
        waterBodies.map((water, idx) => (
          <div
            key={water.id}
            className="bg-gray-800 rounded-lg p-6 border-l-4"
            style={{
              borderLeftColor:
                water.type === "moat"
                  ? "#3b82f6"
                  : water.type === "zone"
                  ? "#06b6d4"
                  : "#14b8a6",
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                {water.type === "moat" && "🌊 Moat"}
                {water.type === "zone" && "💧 Zone"}
                {water.type === "wall-based" && "🏖️ Wall-Based"}
                <span className="text-gray-400 text-sm">({water.id})</span>
              </h3>
              <button
                onClick={() => handleRemoveWater(idx)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
              >
                Remove
              </button>
            </div>

            {/* Common Properties */}
            <div className="space-y-4">
              {/* Liquid Type Selector */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Liquid Type
                </label>
                <select
                  value={water.liquidType || "water"}
                  onChange={(e) => {
                    const liquidType = e.target.value as LiquidType;
                    const preset = LIQUID_PRESETS[liquidType];
                    updateWaterProperty(idx, "liquidType", liquidType);
                    updateWaterProperty(idx, "color", preset.color);
                    updateWaterProperty(idx, "opacity", preset.opacity);
                    updateWaterProperty(idx, "effects", { ...preset.effects });
                  }}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                >
                  {(Object.keys(LIQUID_PRESETS) as LiquidType[]).map((type) => (
                    <option key={type} value={type}>
                      {LIQUID_PRESETS[type].name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {LIQUID_PRESETS[water.liquidType || "water"].description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Custom Color Override */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Custom Color (Optional)
                  </label>
                  <input
                    type="color"
                    value={water.color || LIQUID_PRESETS[water.liquidType || "water"].color}
                    onChange={(e) =>
                      updateWaterProperty(idx, "color", e.target.value)
                    }
                    className="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Override preset color
                  </p>
                </div>

                {/* Opacity */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Opacity: {(water.opacity || 0.6).toFixed(2)}
                  </label>
                  <input
                    type="range"
                    value={water.opacity || 0.6}
                    onChange={(e) =>
                      updateWaterProperty(
                        idx,
                        "opacity",
                        parseFloat(e.target.value)
                      )
                    }
                    min={0.1}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Depth Effect */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Depth Effect: {water.depth || 5}
                </label>
                <input
                  type="range"
                  value={water.depth || 5}
                  onChange={(e) =>
                    updateWaterProperty(
                      idx,
                      "depth",
                      parseFloat(e.target.value)
                    )
                  }
                  min={0}
                  max={10}
                  step={0.5}
                  className="w-full"
                />
              </div>

              {/* Wavy Effect Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={water.wavyEffect || false}
                  onChange={(e) =>
                    updateWaterProperty(idx, "wavyEffect", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                <label className="text-sm">Animated Wavy Effect</label>
              </div>

              {/* Water Effects Section */}
              <WaterEffectsProperties
                water={water}
                index={idx}
                updateProperty={updateWaterProperty}
              />

              {/* Type-Specific Properties */}
              {water.type === "moat" && (
                <MoatProperties
                  water={water as MoatWaterBodyConfig}
                  index={idx}
                  updateProperty={updateWaterProperty}
                />
              )}

              {water.type === "zone" && (
                <ZoneProperties
                  water={water as ZoneWaterBodyConfig}
                  index={idx}
                  updateProperty={updateWaterProperty}
                  arenaWidth={config.width}
                  arenaHeight={config.height}
                />
              )}

              {water.type === "wall-based" && (
                <WallBasedProperties
                  water={water as WallBasedWaterBodyConfig}
                  index={idx}
                  updateProperty={updateWaterProperty}
                />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Moat-specific properties
function MoatProperties({
  water,
  index,
  updateProperty,
}: {
  water: MoatWaterBodyConfig;
  index: number;
  updateProperty: (index: number, property: string, value: any) => void;
}) {
  return (
    <div className="border-t border-gray-700 pt-4 space-y-4">
      <h4 className="text-sm font-semibold text-blue-400">Moat Settings</h4>

      {/* Thickness */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Moat Thickness: {water.thickness} em
        </label>
        <input
          type="range"
          value={water.thickness}
          onChange={(e) =>
            updateProperty(index, "thickness", parseFloat(e.target.value))
          }
          min={1}
          max={10}
          step={0.5}
          className="w-full"
        />
        <p className="text-xs text-gray-400 mt-1">
          Width of the water ring (Y - X in diagram)
        </p>
      </div>

      {/* Distance from Center (Inner Radius) */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Inner Radius (X): {water.distanceFromArena} em
        </label>
        <input
          type="range"
          value={water.distanceFromArena}
          onChange={(e) =>
            updateProperty(
              index,
              "distanceFromArena",
              parseFloat(e.target.value)
            )
          }
          min={5}
          max={20}
          step={0.5}
          className="w-full"
        />
        <p className="text-xs text-gray-400 mt-1">
          Distance from center to inner edge of water (pentagon at X distance)
        </p>
        <p className="text-xs text-gray-500 mt-1">
          💡 Outer radius = {water.distanceFromArena + water.thickness} em (X +
          thickness)
        </p>
      </div>

      {/* Follows Arena Shape */}
      <div className="bg-gray-700 rounded p-3">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={water.followsArenaShape}
            onChange={(e) =>
              updateProperty(index, "followsArenaShape", e.target.checked)
            }
            className="w-4 h-4"
          />
          <label className="text-sm font-medium">Follows Arena Shape</label>
        </div>
        <p className="text-xs text-gray-400">
          {water.followsArenaShape
            ? "✅ Moat matches arena shape (star arena = star moat)"
            : "🎨 Use custom moat shape below"}
        </p>
      </div>

      {/* Custom Moat Shape (only when NOT following arena shape) */}
      {!water.followsArenaShape && (
        <div>
          <label className="block text-sm font-medium mb-2">Moat Shape</label>
          <select
            value={water.moatShape || "circle"}
            onChange={(e) => updateProperty(index, "moatShape", e.target.value)}
            className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg"
          >
            <option value="circle">Circle</option>
            <option value="triangle">Triangle</option>
            <option value="square">Square</option>
            <option value="pentagon">Pentagon</option>
            <option value="hexagon">Hexagon</option>
            <option value="heptagon">Heptagon</option>
            <option value="octagon">Octagon</option>
            <option value="star3">Star (3-point)</option>
            <option value="star4">Star (4-point)</option>
            <option value="star5">Star (5-point)</option>
            <option value="star6">Star (6-point)</option>
            <option value="star7">Star (7-point)</option>
            <option value="star8">Star (8-point)</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Custom shape for the moat (independent of arena shape)
          </p>
        </div>
      )}
    </div>
  );
}

// Zone-specific properties
function ZoneProperties({
  water,
  index,
  updateProperty,
  arenaWidth,
  arenaHeight,
}: {
  water: ZoneWaterBodyConfig;
  index: number;
  updateProperty: (index: number, property: string, value: any) => void;
  arenaWidth: number;
  arenaHeight: number;
}) {
  return (
    <div className="border-t border-gray-700 pt-4 space-y-4">
      <h4 className="text-sm font-semibold text-cyan-400">Zone Settings</h4>

      {/* Position */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Position X: {water.position.x.toFixed(1)} em
          </label>
          <input
            type="range"
            value={water.position.x}
            onChange={(e) =>
              updateProperty(index, "position", {
                ...water.position,
                x: parseFloat(e.target.value),
              })
            }
            min={-arenaWidth / 2 + 5}
            max={arenaWidth / 2 - 5}
            step={0.5}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Position Y: {water.position.y.toFixed(1)} em
          </label>
          <input
            type="range"
            value={water.position.y}
            onChange={(e) =>
              updateProperty(index, "position", {
                ...water.position,
                y: parseFloat(e.target.value),
              })
            }
            min={-arenaHeight / 2 + 5}
            max={arenaHeight / 2 - 5}
            step={0.5}
            className="w-full"
          />
        </div>
      </div>

      {/* Shape Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Water Shape</label>
        <select
          value={water.shape}
          onChange={(e) =>
            updateProperty(
              index,
              "shape",
              e.target.value as "circle" | "square" | "rectangle" | "oval"
            )
          }
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
        >
          <option value="circle">Circle</option>
          <option value="square">Square</option>
          <option value="rectangle">Rectangle</option>
          <option value="oval">Oval</option>
        </select>
      </div>

      {/* Circle/Oval Radius */}
      {water.shape === "circle" && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Radius: {water.radius || 5} em
          </label>
          <input
            type="range"
            value={water.radius || 5}
            onChange={(e) =>
              updateProperty(index, "radius", parseFloat(e.target.value))
            }
            min={1}
            max={20}
            step={0.5}
            className="w-full"
          />
        </div>
      )}

      {/* Square/Rectangle/Oval Dimensions */}
      {(water.shape === "square" ||
        water.shape === "rectangle" ||
        water.shape === "oval") && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Width: {water.width || 10} em
            </label>
            <input
              type="range"
              value={water.width || 10}
              onChange={(e) =>
                updateProperty(index, "width", parseFloat(e.target.value))
              }
              min={2}
              max={30}
              step={0.5}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Height: {water.height || 10} em
            </label>
            <input
              type="range"
              value={water.height || 10}
              onChange={(e) =>
                updateProperty(index, "height", parseFloat(e.target.value))
              }
              min={2}
              max={30}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Rotation */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Rotation: {water.rotation || 0}°
        </label>
        <input
          type="range"
          value={water.rotation || 0}
          onChange={(e) =>
            updateProperty(index, "rotation", parseFloat(e.target.value))
          }
          min={0}
          max={360}
          step={5}
          className="w-full"
        />
      </div>
    </div>
  );
}

// Wall-Based specific properties
function WallBasedProperties({
  water,
  index,
  updateProperty,
}: {
  water: WallBasedWaterBodyConfig;
  index: number;
  updateProperty: (index: number, property: string, value: any) => void;
}) {
  return (
    <div className="border-t border-gray-700 pt-4 space-y-4">
      <h4 className="text-sm font-semibold text-teal-400">
        Wall-Based Settings
      </h4>

      {/* Thickness */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Water Thickness: {water.thickness} em
        </label>
        <input
          type="range"
          value={water.thickness}
          onChange={(e) =>
            updateProperty(index, "thickness", parseFloat(e.target.value))
          }
          min={1}
          max={5}
          step={0.5}
          className="w-full"
        />
        <p className="text-xs text-gray-400 mt-1">
          Width of water strip at arena edges
        </p>
      </div>

      {/* Offset from Edge */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Offset from Edge: {water.offsetFromEdge} em
        </label>
        <input
          type="range"
          value={water.offsetFromEdge}
          onChange={(e) =>
            updateProperty(index, "offsetFromEdge", parseFloat(e.target.value))
          }
          min={0}
          max={3}
          step={0.5}
          className="w-full"
        />
        <p className="text-xs text-gray-400 mt-1">
          Distance from arena edge inward
        </p>
      </div>

      {/* Covers Exits */}
      <div className="bg-gray-700 rounded p-3">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={water.coversExits}
            onChange={(e) =>
              updateProperty(index, "coversExits", e.target.checked)
            }
            className="w-4 h-4"
          />
          <label className="text-sm font-medium">Covers Exit Zones</label>
        </div>
        <p className="text-xs text-gray-400">
          {water.coversExits
            ? "✅ Water also covers exit zones between walls"
            : "❌ Water only in front of walls, exits are dry"}
        </p>
      </div>
    </div>
  );
}

// Water effects properties (damage, speed, freeze, etc.)
function WaterEffectsProperties({
  water,
  index,
  updateProperty,
}: {
  water: WaterBodyConfig;
  index: number;
  updateProperty: (index: number, property: string, value: any) => void;
}) {
  const effects = water.effects || {};

  const updateEffect = (effectKey: string, value: any) => {
    updateProperty(index, "effects", {
      ...effects,
      [effectKey]: value,
    });
  };

  return (
    <div className="border-t border-gray-700 pt-4 space-y-4">
      <h4 className="text-sm font-semibold text-yellow-400">⚡ Water Effects</h4>
      <p className="text-xs text-gray-400">
        Configure gameplay effects when beyblade is in this water body
      </p>

      {/* Damage/Heal */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            💔 Damage/sec: {effects.damagePerSecond || 0}
          </label>
          <input
            type="range"
            value={effects.damagePerSecond || 0}
            onChange={(e) =>
              updateEffect("damagePerSecond", parseFloat(e.target.value))
            }
            min={0}
            max={10}
            step={0.5}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            💚 Heal/sec: {effects.healPerSecond || 0}
          </label>
          <input
            type="range"
            value={effects.healPerSecond || 0}
            onChange={(e) =>
              updateEffect("healPerSecond", parseFloat(e.target.value))
            }
            min={0}
            max={10}
            step={0.5}
            className="w-full"
          />
        </div>
      </div>

      {/* Speed Effects */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            🚀 Speed Boost: {(effects.speedBoost || 1.0).toFixed(1)}x
          </label>
          <input
            type="range"
            value={effects.speedBoost || 1.0}
            onChange={(e) =>
              updateEffect("speedBoost", parseFloat(e.target.value))
            }
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            {effects.speedBoost && effects.speedBoost > 1.0
              ? `${((effects.speedBoost - 1) * 100).toFixed(0)}% faster`
              : "No boost"}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            🐌 Speed Loss: {(effects.speedLoss || 1.0).toFixed(1)}x
          </label>
          <input
            type="range"
            value={effects.speedLoss || 1.0}
            onChange={(e) =>
              updateEffect("speedLoss", parseFloat(e.target.value))
            }
            min={0.1}
            max={1.0}
            step={0.1}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            {effects.speedLoss && effects.speedLoss < 1.0
              ? `${((1 - effects.speedLoss) * 100).toFixed(0)}% slower`
              : "No slowdown"}
          </p>
        </div>
      </div>

      {/* Spin Effects */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            ⚡ Spin Drain/sec: {effects.spinDrainPerSecond || 0}
          </label>
          <input
            type="range"
            value={effects.spinDrainPerSecond || 0}
            onChange={(e) =>
              updateEffect("spinDrainPerSecond", parseFloat(e.target.value))
            }
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            💫 Spin Boost/sec: {effects.spinBoostPerSecond || 0}
          </label>
          <input
            type="range"
            value={effects.spinBoostPerSecond || 0}
            onChange={(e) =>
              updateEffect("spinBoostPerSecond", parseFloat(e.target.value))
            }
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>
      </div>

      {/* Friction */}
      <div>
        <label className="block text-sm font-medium mb-2">
          🌊 Friction Multiplier: {(effects.frictionMultiplier || 1.0).toFixed(1)}x
        </label>
        <input
          type="range"
          value={effects.frictionMultiplier || 1.0}
          onChange={(e) =>
            updateEffect("frictionMultiplier", parseFloat(e.target.value))
          }
          min={0.5}
          max={3.0}
          step={0.1}
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          Higher friction = harder to move through water
        </p>
      </div>

      {/* Freeze Effect */}
      <div className="bg-blue-900/30 rounded p-3 space-y-3">
        <h5 className="text-sm font-semibold text-blue-300">❄️ Freeze Effect</h5>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              ⏱️ Time to Freeze: {effects.freezeThreshold || 5}s
            </label>
            <input
              type="range"
              value={effects.freezeThreshold || 5}
              onChange={(e) =>
                updateEffect("freezeThreshold", parseFloat(e.target.value))
              }
              min={1}
              max={10}
              step={0.5}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              ❄️ Freeze Duration: {effects.freezeDuration || 0}s
            </label>
            <input
              type="range"
              value={effects.freezeDuration || 0}
              onChange={(e) =>
                updateEffect("freezeDuration", parseFloat(e.target.value))
              }
              min={0}
              max={10}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400">
          {effects.freezeDuration && effects.freezeDuration > 0
            ? `⚠️ After ${effects.freezeThreshold || 5}s in water, beyblade freezes for ${effects.freezeDuration}s`
            : "No freeze effect"}
        </p>
      </div>

      {/* Stun Effect */}
      <div className="bg-purple-900/30 rounded p-3 space-y-3">
        <h5 className="text-sm font-semibold text-purple-300">⚡ Stun Effect</h5>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              ⏱️ Time to Stun: {effects.stunThreshold || 3}s
            </label>
            <input
              type="range"
              value={effects.stunThreshold || 3}
              onChange={(e) =>
                updateEffect("stunThreshold", parseFloat(e.target.value))
              }
              min={1}
              max={10}
              step={0.5}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              ⚡ Stun Duration: {effects.stunDuration || 0}s
            </label>
            <input
              type="range"
              value={effects.stunDuration || 0}
              onChange={(e) =>
                updateEffect("stunDuration", parseFloat(e.target.value))
              }
              min={0}
              max={5}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400">
          {effects.stunDuration && effects.stunDuration > 0
            ? `⚠️ After ${effects.stunThreshold || 3}s in water, beyblade stunned for ${effects.stunDuration}s`
            : "No stun effect"}
        </p>
      </div>

      {/* Push/Pull Forces */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            ⬆️ Push Force: {effects.pushForce || 0}
          </label>
          <input
            type="range"
            value={effects.pushForce || 0}
            onChange={(e) =>
              updateEffect("pushForce", parseFloat(e.target.value))
            }
            min={0}
            max={10}
            step={0.5}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Push away from water center
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            ⬇️ Pull Force: {effects.pullForce || 0}
          </label>
          <input
            type="range"
            value={effects.pullForce || 0}
            onChange={(e) =>
              updateEffect("pullForce", parseFloat(e.target.value))
            }
            min={0}
            max={10}
            step={0.5}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Pull toward water center (whirlpool)
          </p>
        </div>
      </div>

      {/* Visual Effects */}
      <div className="border-t border-gray-600 pt-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={effects.showParticles !== false}
            onChange={(e) =>
              updateEffect("showParticles", e.target.checked)
            }
            className="w-4 h-4"
          />
          <label className="text-sm font-medium">Show Water Particles</label>
        </div>
        {effects.showParticles !== false && (
          <div className="mt-2">
            <label className="block text-sm font-medium mb-2">
              Particle Color
            </label>
            <input
              type="color"
              value={effects.particleColor || water.color || "#3b82f6"}
              onChange={(e) =>
                updateEffect("particleColor", e.target.value)
              }
              className="w-full h-10 bg-gray-600 border border-gray-500 rounded-lg cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
}
