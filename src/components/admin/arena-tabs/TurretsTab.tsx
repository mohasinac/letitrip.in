/**
 * TurretsTab Component
 * Handles turret configuration with various attack types
 */

"use client";

import React from "react";
import { ArenaConfig, TurretConfig, TurretAttackType } from "@/types/arenaConfigNew";

const ARENA_RESOLUTION = 1080;

interface TurretsTabProps {
  config: ArenaConfig;
  setConfig: (config: ArenaConfig) => void;
}

// Attack type descriptions
const ATTACK_TYPE_INFO = {
  random: {
    name: "Random Attack",
    icon: "🎲",
    description: "Shoots in random directions",
  },
  beam: {
    name: "Beam Attack",
    icon: "⚡",
    description: "Continuous beam with charge period",
  },
  periodic: {
    name: "Periodic Bullets",
    icon: "🔫",
    description: "Shoots bullets periodically",
  },
  aoe: {
    name: "AOE Missile",
    icon: "💣",
    description: "Area of effect blast at target location",
  },
  boomerang: {
    name: "Boomerang",
    icon: "🪃",
    description: "Throws boomerang that returns",
  },
};

export default function TurretsTab({ config, setConfig }: TurretsTabProps) {
  const turrets = config.turrets || [];

  // Place turret at center
  const handlePlaceAtCenter = () => {
    if (turrets.length >= 8) return;

    const newTurrets = [...turrets];
    newTurrets.push({
      id: turrets.length + 1,
      x: 0,
      y: 0,
      radius: 25,
      health: 750,
      indestructible: false,
      attackType: "random",
      attackDamage: 25,
      attackRange: 250,
      attackCooldown: 3,
      autoPlaced: false,
    });

    setConfig({
      ...config,
      turrets: newTurrets,
    });
  };

  // Add manual turret
  const handleAddTurret = () => {
    if (turrets.length >= 8) return;

    const newTurrets = [...turrets];
    newTurrets.push({
      id: turrets.length + 1,
      x: 0,
      y: 100,
      radius: 25,
      health: 750,
      indestructible: false,
      attackType: "random",
      attackDamage: 25,
      attackRange: 250,
      attackCooldown: 3,
      autoPlaced: false,
    });

    setConfig({
      ...config,
      turrets: newTurrets,
    });
  };

  // Generate turrets on shape
  const handleGenerateOnShape = (count: number) => {
    if (count < 1 || count > 8) return;

    const newTurrets: TurretConfig[] = [];
    const radius = ARENA_RESOLUTION * 0.35; // 35% from center

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2; // Start from top
      newTurrets.push({
        id: i + 1,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        radius: 25,
        health: 750,
        indestructible: false,
        attackType: "periodic",
        attackDamage: 25,
        attackRange: 250,
        attackCooldown: 3,
        bulletSpeed: 200,
        bulletCount: 2,
        autoPlaced: true,
      });
    }

    setConfig({
      ...config,
      turrets: newTurrets,
    });
  };

  // Remove turret
  const handleRemoveTurret = (index: number) => {
    const newTurrets = [...turrets];
    newTurrets.splice(index, 1);
    setConfig({
      ...config,
      turrets: newTurrets,
    });
  };

  // Update turret property
  const handleUpdateTurret = (
    index: number,
    property: keyof TurretConfig,
    value: number | string | boolean
  ) => {
    const newTurrets = [...turrets];
    (newTurrets[index] as any)[property] = value;
    setConfig({
      ...config,
      turrets: newTurrets,
    });
  };

  // Clear all turrets
  const handleClearTurrets = () => {
    setConfig({
      ...config,
      turrets: [],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Turrets ({turrets.length}/8)</h2>
            <p className="text-sm text-gray-400 mt-1">
              Defensive structures that attack beyblades
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePlaceAtCenter}
              disabled={turrets.length >= 8}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              📍 Center
            </button>
            <button
              onClick={handleAddTurret}
              disabled={turrets.length >= 8}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              + Add Turret
            </button>
          </div>
        </div>
      </div>

      {/* Quick Setup */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Generate on Shape</h3>
        <p className="text-sm text-gray-400 mb-4">
          Place turrets evenly around the arena perimeter
        </p>
        <div className="grid grid-cols-4 gap-3">
          {[2, 3, 4, 6, 8].map((count) => (
            <button
              key={count}
              onClick={() => handleGenerateOnShape(count)}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
            >
              {count} Turrets
            </button>
          ))}
        </div>
        {turrets.length > 0 && (
          <button
            onClick={handleClearTurrets}
            className="w-full mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Turret List */}
      {turrets.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400 text-lg mb-2">No turrets yet</p>
          <p className="text-sm text-gray-500">
            Add turrets to create automated defenses that attack beyblades
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {turrets.map((turret, idx) => {
            const attackInfo = ATTACK_TYPE_INFO[turret.attackType];
            return (
              <div key={idx} className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-2xl">{attackInfo.icon}</span>
                    Turret {idx + 1}
                    {turret.autoPlaced && (
                      <span className="text-xs px-2 py-1 bg-purple-600 rounded">
                        Auto
                      </span>
                    )}
                    {turret.indestructible && (
                      <span className="text-xs px-2 py-1 bg-yellow-600 rounded">
                        ∞
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => handleRemoveTurret(idx)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Position X */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Position X: {turret.x.toFixed(0)}px
                    </label>
                    <input
                      type="range"
                      value={turret.x}
                      onChange={(e) =>
                        handleUpdateTurret(idx, "x", parseFloat(e.target.value))
                      }
                      min={-ARENA_RESOLUTION / 2 + 50}
                      max={ARENA_RESOLUTION / 2 - 50}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Position Y */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Position Y: {turret.y.toFixed(0)}px
                    </label>
                    <input
                      type="range"
                      value={turret.y}
                      onChange={(e) =>
                        handleUpdateTurret(idx, "y", parseFloat(e.target.value))
                      }
                      min={-ARENA_RESOLUTION / 2 + 50}
                      max={ARENA_RESOLUTION / 2 - 50}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Size: {turret.radius.toFixed(0)}px
                    </label>
                    <input
                      type="range"
                      value={turret.radius}
                      onChange={(e) =>
                        handleUpdateTurret(idx, "radius", parseFloat(e.target.value))
                      }
                      min={15}
                      max={40}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Health */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Health: {turret.indestructible ? "∞" : `${turret.health} HP`}
                    </label>
                    <input
                      type="range"
                      value={turret.health}
                      onChange={(e) =>
                        handleUpdateTurret(idx, "health", parseInt(e.target.value))
                      }
                      min={500}
                      max={1000}
                      step={50}
                      className="w-full"
                      disabled={turret.indestructible}
                    />
                  </div>

                  {/* Indestructible Toggle */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={turret.indestructible || false}
                        onChange={(e) =>
                          handleUpdateTurret(idx, "indestructible", e.target.checked)
                        }
                        className="w-5 h-5 cursor-pointer"
                        id={`turret-indestructible-${idx}`}
                      />
                      <label
                        htmlFor={`turret-indestructible-${idx}`}
                        className="text-sm cursor-pointer font-medium"
                      >
                        Indestructible (Cannot be destroyed by players or other turrets)
                      </label>
                    </div>
                  </div>

                  {/* Attack Type */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Attack Type
                    </label>
                    <select
                      value={turret.attackType}
                      onChange={(e) =>
                        handleUpdateTurret(
                          idx,
                          "attackType",
                          e.target.value as TurretAttackType
                        )
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    >
                      {Object.entries(ATTACK_TYPE_INFO).map(([type, info]) => (
                        <option key={type} value={type}>
                          {info.icon} {info.name} - {info.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Attack Damage */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Attack Damage: {turret.attackDamage}
                    </label>
                    <input
                      type="range"
                      value={turret.attackDamage}
                      onChange={(e) =>
                        handleUpdateTurret(
                          idx,
                          "attackDamage",
                          parseInt(e.target.value)
                        )
                      }
                      min={10}
                      max={50}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Attack Range */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Attack Range: {turret.attackRange}px
                    </label>
                    <input
                      type="range"
                      value={turret.attackRange}
                      onChange={(e) =>
                        handleUpdateTurret(
                          idx,
                          "attackRange",
                          parseInt(e.target.value)
                        )
                      }
                      min={100}
                      max={400}
                      step={10}
                      className="w-full"
                    />
                  </div>

                  {/* Attack Cooldown */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Cooldown: {turret.attackCooldown}s
                    </label>
                    <input
                      type="range"
                      value={turret.attackCooldown}
                      onChange={(e) =>
                        handleUpdateTurret(
                          idx,
                          "attackCooldown",
                          parseFloat(e.target.value)
                        )
                      }
                      min={1}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Attack Type Specific Controls */}
                  {turret.attackType === "beam" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Beam Duration: {turret.beamDuration || 2}s
                        </label>
                        <input
                          type="range"
                          value={turret.beamDuration || 2}
                          onChange={(e) =>
                            handleUpdateTurret(
                              idx,
                              "beamDuration",
                              parseFloat(e.target.value)
                            )
                          }
                          min={1}
                          max={5}
                          step={0.5}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Charge Period: {turret.beamChargePeriod || 1.5}s
                        </label>
                        <input
                          type="range"
                          value={turret.beamChargePeriod || 1.5}
                          onChange={(e) =>
                            handleUpdateTurret(
                              idx,
                              "beamChargePeriod",
                              parseFloat(e.target.value)
                            )
                          }
                          min={0.5}
                          max={3}
                          step={0.5}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  {turret.attackType === "periodic" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Bullet Speed: {turret.bulletSpeed || 200}px/s
                        </label>
                        <input
                          type="range"
                          value={turret.bulletSpeed || 200}
                          onChange={(e) =>
                            handleUpdateTurret(
                              idx,
                              "bulletSpeed",
                              parseInt(e.target.value)
                            )
                          }
                          min={100}
                          max={500}
                          step={25}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Bullets per Shot: {turret.bulletCount || 1}
                        </label>
                        <input
                          type="range"
                          value={turret.bulletCount || 1}
                          onChange={(e) =>
                            handleUpdateTurret(
                              idx,
                              "bulletCount",
                              parseInt(e.target.value)
                            )
                          }
                          min={1}
                          max={5}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  {turret.attackType === "aoe" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          AOE Radius: {turret.aoeRadius || 100}px
                        </label>
                        <input
                          type="range"
                          value={turret.aoeRadius || 100}
                          onChange={(e) =>
                            handleUpdateTurret(
                              idx,
                              "aoeRadius",
                              parseInt(e.target.value)
                            )
                          }
                          min={50}
                          max={150}
                          step={10}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Damage Radius: {turret.aoeDamageRadius || 50}px
                        </label>
                        <input
                          type="range"
                          value={turret.aoeDamageRadius || 50}
                          onChange={(e) =>
                            handleUpdateTurret(
                              idx,
                              "aoeDamageRadius",
                              parseInt(e.target.value)
                            )
                          }
                          min={20}
                          max={100}
                          step={10}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  {turret.attackType === "boomerang" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Return Time: {turret.boomerangReturnTime || 3}s
                      </label>
                      <input
                        type="range"
                        value={turret.boomerangReturnTime || 3}
                        onChange={(e) =>
                          handleUpdateTurret(
                            idx,
                            "boomerangReturnTime",
                            parseFloat(e.target.value)
                          )
                        }
                        min={2}
                        max={5}
                        step={0.5}
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Custom Color */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Turret Color (optional)
                    </label>
                    <input
                      type="color"
                      value={turret.color || "#ff6b6b"}
                      onChange={(e) =>
                        handleUpdateTurret(idx, "color", e.target.value)
                      }
                      className="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          ℹ️ How Turrets Work
        </h4>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• Turrets are automated defenses that attack beyblades</li>
          <li>• Destructible turrets (500-1000 HP) can be destroyed by players or other turrets</li>
          <li>• Indestructible turrets are permanent and cannot be destroyed</li>
          <li>• Different attack types have different behaviors and dangers</li>
          <li>• Players can avoid projectiles and position turrets to attack each other</li>
          <li>• High health ensures players must strategically deal with turrets</li>
        </ul>
        <div className="mt-3 pt-3 border-t border-blue-700">
          <h5 className="text-xs font-semibold mb-2">Attack Types:</h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(ATTACK_TYPE_INFO).map(([type, info]) => (
              <div key={type}>
                <span className="font-semibold">{info.icon} {info.name}:</span>
                <p className="text-gray-400">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
