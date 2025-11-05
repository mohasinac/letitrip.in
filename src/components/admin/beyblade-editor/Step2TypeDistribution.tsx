"use client";

import React, { useState } from "react";
import { BeybladeStats } from "@/types/beybladeStats";

interface CalculatedStats {
  damagePerHit: number;
  damageMultiplier: number;
  speedPerSecond: number;
  rotationSpeed: number;
  damageTaken: number;
  damageReduction: number;
  knockbackDistance: number;
  invulnerabilityChance: number;
  maxStamina: number;
  spinStealPercent: number;
  spinStealAmount: number;
  spinDecayRate: number;
  spinStealPower?: number;
  speedMultiplier?: number;
}

interface Step2TypeDistributionProps {
  formData: Partial<BeybladeStats>;
  calculatedStats: CalculatedStats | null;
  onFormDataChange: (data: Partial<BeybladeStats>) => void;
}

export default function Step2TypeDistribution({
  formData,
  calculatedStats,
  onFormDataChange,
}: Step2TypeDistributionProps) {
  const [isDistributionCollapsed, setIsDistributionCollapsed] = useState(false);
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false);

  return (
    <div className="space-y-6">
      {/* Type Distribution Section */}
      <div className="border-2 border-blue-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsDistributionCollapsed(!isDistributionCollapsed)}
          className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-between"
        >
          <h3 className="font-semibold text-blue-900 flex items-center gap-2">
            <span>⚔️</span>
            <span>
              Type Distribution ({formData.typeDistribution?.total || 0}/360)
            </span>
          </h3>
          <svg
            className={`w-5 h-5 text-blue-900 transition-transform ${
              isDistributionCollapsed ? "" : "rotate-180"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {!isDistributionCollapsed && (
          <div className="p-4">
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-4">
                <p className="text-xs font-semibold text-blue-900 mb-1">
                  📊 Base Stats & Bonuses (360 points total, max 150 each):
                </p>
                <ul className="text-xs text-blue-800 space-y-0.5">
                  <li>
                    • <strong>Base:</strong> 100 dmg, 10 speed, 10 rotation, 10
                    knockback, 1x dmg taken, 10% invuln, 1000 HP, 10% steal, 10
                    decay/sec
                  </li>
                  <li>
                    • <strong>Attack:</strong> +1% per point (multiplicative) -
                    150pts = 2.5x all stats
                  </li>
                  <li>
                    • <strong>Defense:</strong> At 150pts: 50% dmg taken, 7.5
                    knockback, 20% invuln (multiplicative)
                  </li>
                  <li>
                    • <strong>Stamina:</strong> At 150pts: 3000 HP, 50% steal (1
                    in 2), 7.5 decay (multiplicative)
                  </li>
                </ul>
              </div>

              {/* Attack Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-red-600">
                    Attack{" "}
                    {calculatedStats &&
                      `(+${calculatedStats.damagePerHit.toFixed(
                        1
                      )} dmg, +${calculatedStats.speedPerSecond.toFixed(
                        1
                      )} speed)`}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="150"
                      value={formData.typeDistribution?.attack || 0}
                      onChange={(e) => {
                        const newAttack = Math.min(
                          150,
                          Math.max(0, parseInt(e.target.value) || 0)
                        );
                        const defense = formData.typeDistribution?.defense || 0;
                        const stamina = formData.typeDistribution?.stamina || 0;
                        const currentTotal = defense + stamina;
                        const availablePoints = 360 - currentTotal;
                        const finalAttack = Math.min(
                          newAttack,
                          availablePoints
                        );

                        onFormDataChange({
                          ...formData,
                          typeDistribution: {
                            ...formData.typeDistribution!,
                            attack: finalAttack,
                            total: finalAttack + currentTotal,
                          },
                        });
                      }}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                    />
                    <span className="text-sm font-bold text-gray-700">
                      /150
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={formData.typeDistribution?.attack || 0}
                  onChange={(e) => {
                    const newAttack = parseInt(e.target.value);
                    const defense = formData.typeDistribution?.defense || 0;
                    const stamina = formData.typeDistribution?.stamina || 0;
                    const currentTotal = defense + stamina;
                    const availablePoints = 360 - currentTotal;
                    const finalAttack = Math.min(newAttack, availablePoints);

                    onFormDataChange({
                      ...formData,
                      typeDistribution: {
                        ...formData.typeDistribution!,
                        attack: finalAttack,
                        total: finalAttack + currentTotal,
                      },
                    });
                  }}
                  className="w-full"
                />
              </div>

              {/* Defense Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-600">
                    Defense{" "}
                    {calculatedStats &&
                      `(${calculatedStats.damageReduction.toFixed(
                        2
                      )}x reduction, +${calculatedStats.knockbackDistance.toFixed(
                        1
                      )} knockback)`}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="150"
                      value={formData.typeDistribution?.defense || 0}
                      onChange={(e) => {
                        const newDefense = Math.min(
                          150,
                          Math.max(0, parseInt(e.target.value) || 0)
                        );
                        const attack = formData.typeDistribution?.attack || 0;
                        const stamina = formData.typeDistribution?.stamina || 0;
                        const currentTotal = attack + stamina;
                        const availablePoints = 360 - currentTotal;
                        const finalDefense = Math.min(
                          newDefense,
                          availablePoints
                        );

                        onFormDataChange({
                          ...formData,
                          typeDistribution: {
                            ...formData.typeDistribution!,
                            defense: finalDefense,
                            total: attack + finalDefense + stamina,
                          },
                        });
                      }}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                    />
                    <span className="text-sm font-bold text-gray-700">
                      /150
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={formData.typeDistribution?.defense || 0}
                  onChange={(e) => {
                    const newDefense = parseInt(e.target.value);
                    const attack = formData.typeDistribution?.attack || 0;
                    const stamina = formData.typeDistribution?.stamina || 0;
                    const currentTotal = attack + stamina;
                    const availablePoints = 360 - currentTotal;
                    const finalDefense = Math.min(newDefense, availablePoints);

                    onFormDataChange({
                      ...formData,
                      typeDistribution: {
                        ...formData.typeDistribution!,
                        defense: finalDefense,
                        total: attack + finalDefense + stamina,
                      },
                    });
                  }}
                  className="w-full"
                />
              </div>

              {/* Stamina Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-green-600">
                    Stamina{" "}
                    {calculatedStats &&
                      `(${
                        calculatedStats.maxStamina
                      } HP, +${calculatedStats.spinStealAmount.toFixed(
                        1
                      )} steal)`}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="150"
                      value={formData.typeDistribution?.stamina || 0}
                      onChange={(e) => {
                        const newStamina = Math.min(
                          150,
                          Math.max(0, parseInt(e.target.value) || 0)
                        );
                        const attack = formData.typeDistribution?.attack || 0;
                        const defense = formData.typeDistribution?.defense || 0;
                        const currentTotal = attack + defense;
                        const availablePoints = 360 - currentTotal;
                        const finalStamina = Math.min(
                          newStamina,
                          availablePoints
                        );

                        onFormDataChange({
                          ...formData,
                          typeDistribution: {
                            ...formData.typeDistribution!,
                            stamina: finalStamina,
                            total: attack + defense + finalStamina,
                          },
                        });
                      }}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                    />
                    <span className="text-sm font-bold text-gray-700">
                      /150
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={formData.typeDistribution?.stamina || 0}
                  onChange={(e) => {
                    const newStamina = parseInt(e.target.value);
                    const attack = formData.typeDistribution?.attack || 0;
                    const defense = formData.typeDistribution?.defense || 0;
                    const currentTotal = attack + defense;
                    const availablePoints = 360 - currentTotal;
                    const finalStamina = Math.min(newStamina, availablePoints);

                    onFormDataChange({
                      ...formData,
                      typeDistribution: {
                        ...formData.typeDistribution!,
                        stamina: finalStamina,
                        total: attack + defense + finalStamina,
                      },
                    });
                  }}
                  className="w-full"
                />
              </div>

              {formData.typeDistribution?.total !== 360 && (
                <div className="text-sm text-amber-600 font-medium">
                  ⚠️ Total must equal 360 (currently:{" "}
                  {formData.typeDistribution?.total})
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Calculated Stats Display */}
      {calculatedStats && (
        <div className="border-2 border-purple-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-colors flex items-center justify-between"
          >
            <h3 className="font-semibold text-purple-900 flex items-center gap-2">
              <span>📊</span>
              <span>Calculated Stats</span>
              <span className="text-sm font-normal text-purple-600">
                ({formData.typeDistribution?.total || 0}/360 points)
              </span>
            </h3>
            <svg
              className={`w-5 h-5 text-purple-900 transition-transform ${
                isStatsCollapsed ? "" : "rotate-180"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {!isStatsCollapsed && (
            <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Attack Power</div>
                  <div className="text-2xl font-bold text-red-600">
                    {calculatedStats.damagePerHit.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">
                    damage per hit (
                    {calculatedStats.damageMultiplier.toFixed(2)}x)
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Speed</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {calculatedStats.speedPerSecond.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">units/second</div>
                </div>

                <div className="bg-white p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">
                    Rotation Speed
                  </div>
                  <div className="text-2xl font-bold text-pink-600">
                    {calculatedStats.rotationSpeed.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">spins/second</div>
                </div>

                <div className="bg-white p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Damage Taken</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {(calculatedStats.damageTaken * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    of incoming damage (
                    {calculatedStats.damageReduction.toFixed(2)}x reduction)
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">
                    Knockback Distance
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {calculatedStats.knockbackDistance.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">units</div>
                </div>

                <div className="bg-white p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">
                    Invulnerability
                  </div>
                  <div className="text-2xl font-bold text-cyan-600">
                    {calculatedStats.invulnerabilityChance.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    chance (1.5s duration)
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Max Stamina</div>
                  <div className="text-2xl font-bold text-green-600">
                    {calculatedStats.maxStamina}
                  </div>
                  <div className="text-xs text-gray-500">health points</div>
                </div>

                <div className="bg-white p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Spin Steal</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {calculatedStats.spinStealPercent.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">of damage taken</div>
                </div>

                <div className="bg-white p-3 rounded-lg col-span-2">
                  <div className="text-xs text-gray-600 mb-1">
                    Spin Decay Rate
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {calculatedStats.spinDecayRate.toFixed(2)}/sec
                  </div>
                  <div className="text-xs text-gray-500">
                    stamina loss per second
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
