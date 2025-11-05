"use client";

import React, { useState } from "react";
import {
  BeybladeStats,
  PointOfContact,
  SpinStealPoint,
} from "@/types/beybladeStats";

interface Step3ContactPointsProps {
  formData: Partial<BeybladeStats>;
  selectedPointIndex: number | null;
  selectedSpinStealIndex: number | null;
  onFormDataChange: (data: Partial<BeybladeStats>) => void;
  onSelectedPointIndexChange: (index: number | null) => void;
  onSelectedSpinStealIndexChange: (index: number | null) => void;
  onGenerateContactPoints: (count: number) => void;
  onGenerateSpinStealPoints: (count: number) => void;
  onAutoBalanceDamage: () => void;
  onCopyContactPoints: () => void;
  onCopySpinStealPoints: () => void;
  onUpdateSelectedPoint: (field: string, value: number) => void;
  onUpdateSelectedSpinStealPoint: (field: string, value: number) => void;
  onRemoveContactPoint: (index: number) => void;
  onRemoveSpinStealPoint: (index: number) => void;
}

export default function Step3ContactPoints({
  formData,
  selectedPointIndex,
  selectedSpinStealIndex,
  onFormDataChange,
  onSelectedPointIndexChange,
  onSelectedSpinStealIndexChange,
  onGenerateContactPoints,
  onGenerateSpinStealPoints,
  onAutoBalanceDamage,
  onCopyContactPoints,
  onCopySpinStealPoints,
  onUpdateSelectedPoint,
  onUpdateSelectedSpinStealPoint,
  onRemoveContactPoint,
  onRemoveSpinStealPoint,
}: Step3ContactPointsProps) {
  const [isContactPointsCollapsed, setIsContactPointsCollapsed] =
    useState(false);
  const [isSpinStealCollapsed, setIsSpinStealCollapsed] = useState(false);

  return (
    <div className="space-y-6">
      {/* Contact Points (Damage) - Collapsible */}
      <div className="border-2 border-purple-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsContactPointsCollapsed(!isContactPointsCollapsed)}
          className="w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 transition-colors flex items-center justify-between"
        >
          <h3 className="font-semibold text-purple-900 flex items-center gap-2">
            <span>💥</span>
            <span>Contact Points (Damage Multipliers)</span>
            <span className="text-sm font-normal">
              - {formData.pointsOfContact?.length || 0} points
            </span>
          </h3>
          <svg
            className={`w-5 h-5 text-purple-900 transition-transform ${
              isContactPointsCollapsed ? "" : "rotate-180"
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

        {!isContactPointsCollapsed && (
          <div className="p-4 space-y-4 bg-purple-50">
            {/* Generate Points Form */}
            <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
              <label className="block text-sm font-semibold text-purple-900 mb-2">
                Generate Evenly Spaced Points
              </label>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    Number of Points (1-20)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    defaultValue="4"
                    id="contactPointCount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  onClick={() => {
                    const count = parseInt(
                      (
                        document.getElementById(
                          "contactPointCount"
                        ) as HTMLInputElement
                      )?.value || "4"
                    );
                    onGenerateContactPoints(count);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Generate
                </button>
                <button
                  onClick={onAutoBalanceDamage}
                  disabled={(formData.pointsOfContact?.length || 0) === 0}
                  className="px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Reset to 1.0x
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-100 p-3 rounded-lg border border-blue-300">
              <p className="text-xs text-blue-900 font-semibold mb-1">
                ⚡ Damage System:
              </p>
              <p className="text-xs text-blue-800">
                • <strong>Multiplier Range:</strong> 1.00x - 2.00x per point
                <br />• <strong>No point limit!</strong> Create as many points
                as you need
                <br />• <strong>Even Distribution:</strong> Use "Generate" to
                create equally spaced points
                <br />• <strong>Base damage:</strong> 1.0x when non-spike areas
                hit
              </p>
            </div>

            {(formData.pointsOfContact?.length || 0) === 0 && (
              <div className="text-center py-4 text-purple-600 text-sm">
                No contact points yet. Use "Generate" to create evenly spaced
                points.
              </div>
            )}

            {/* List of all contact points */}
            {(formData.pointsOfContact?.length || 0) > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <h4 className="text-xs font-semibold text-purple-800 sticky top-0 bg-purple-50 py-1">
                  All Contact Points - Click to edit
                </h4>
                {formData.pointsOfContact?.map((point, index) => {
                  const bonusPoints = (point.damageMultiplier - 1.0) * 100;
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedPointIndex === index
                          ? "bg-purple-100 border-purple-400 shadow-md"
                          : "bg-white border-purple-200 hover:border-purple-300"
                      }`}
                      onClick={() => onSelectedPointIndexChange(index)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold">
                            {index + 1}
                          </span>
                          <div className="text-xs">
                            <div className="font-semibold text-gray-800">
                              Angle: {point.angle}° | Width: {point.width}°
                            </div>
                            <div className="text-orange-600 font-bold">
                              {point.damageMultiplier.toFixed(2)}x damage
                              <span className="text-orange-500 ml-1">
                                ({bonusPoints.toFixed(0)} pts)
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveContactPoint(index);
                          }}
                          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>

                      {selectedPointIndex === index && (
                        <div className="space-y-3 pt-2 border-t border-purple-200">
                          <div className="space-y-1">
                            <label className="text-xs text-gray-700 font-medium flex justify-between">
                              <span>Angle</span>
                              <span className="text-purple-600 font-bold">
                                {point.angle}°
                              </span>
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              value={point.angle}
                              onChange={(e) =>
                                onUpdateSelectedPoint(
                                  "angle",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-gray-700 font-medium flex justify-between">
                              <span>Damage Multiplier</span>
                              <span className="text-orange-600 font-bold">
                                {point.damageMultiplier.toFixed(2)}x
                                <span className="text-xs ml-1">
                                  (
                                  {(
                                    (point.damageMultiplier - 1.0) *
                                    100
                                  ).toFixed(0)}{" "}
                                  pts)
                                </span>
                              </span>
                            </label>
                            <input
                              type="range"
                              min="1.0"
                              max="2.0"
                              step="0.01"
                              value={point.damageMultiplier}
                              onChange={(e) =>
                                onUpdateSelectedPoint(
                                  "damageMultiplier",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>1.0x (0 pts)</span>
                              <span>2.0x (100 pts)</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-gray-700 font-medium flex justify-between">
                              <span>Width (Arc)</span>
                              <span className="text-purple-600 font-bold">
                                {point.width}°
                              </span>
                            </label>
                            <input
                              type="range"
                              min="10"
                              max="90"
                              value={point.width}
                              onChange={(e) =>
                                onUpdateSelectedPoint(
                                  "width",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Spin Steal Points - Collapsible */}
      <div className="border-2 border-blue-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsSpinStealCollapsed(!isSpinStealCollapsed)}
          className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-between"
        >
          <h3 className="font-semibold text-blue-900 flex items-center gap-2">
            <span>🌀</span>
            <span>Spin Steal Points</span>
            <span className="text-sm font-normal">
              - {formData.spinStealPoints?.length || 0} points
            </span>
          </h3>
          <svg
            className={`w-5 h-5 text-blue-900 transition-transform ${
              isSpinStealCollapsed ? "" : "rotate-180"
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

        {!isSpinStealCollapsed && (
          <div className="p-4 space-y-4 bg-blue-50">
            <div className="flex items-center justify-end">
              <button
                onClick={onCopySpinStealPoints}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                📋 Copy JSON
              </button>
            </div>

            {/* Generate Points Form */}
            <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                Generate Evenly Spaced Points (Offset from Contact Points)
              </label>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    Number of Points (1-20)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    defaultValue="4"
                    id="spinStealPointCount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    const count = parseInt(
                      (
                        document.getElementById(
                          "spinStealPointCount"
                        ) as HTMLInputElement
                      )?.value || "4"
                    );
                    onGenerateSpinStealPoints(count);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate
                </button>
                <button
                  onClick={() => {
                    const defaultMultiplier = 1.0;
                    const updatedPoints = formData.spinStealPoints?.map(
                      (point) => ({
                        ...point,
                        spinStealMultiplier: defaultMultiplier,
                      })
                    );
                    onFormDataChange({
                      ...formData,
                      spinStealPoints: updatedPoints,
                    });
                  }}
                  disabled={(formData.spinStealPoints?.length || 0) === 0}
                  className="px-4 py-2 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Reset to 1.0x
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-cyan-100 p-3 rounded-lg border border-cyan-300">
              <p className="text-xs text-cyan-900 font-semibold mb-1">
                🌊 Spin Steal System:
              </p>
              <p className="text-xs text-cyan-800">
                • <strong>Multiplier Range:</strong> 1.00x - 2.00x per point
                <br />• <strong>Offset Placement:</strong> Generated between
                contact points
                <br />• <strong>Energy Transfer:</strong> Steal opponent's spin
                when these areas make contact
                <br />• <strong>Base steal:</strong> 1.0x when non-steal areas
                hit
              </p>
            </div>

            {(formData.spinStealPoints?.length || 0) === 0 && (
              <div className="text-center py-4 text-blue-600 text-sm">
                No spin steal points yet. Use "Generate" to create evenly spaced
                points.
              </div>
            )}

            {/* List of all spin steal points */}
            {(formData.spinStealPoints?.length || 0) > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <h4 className="text-xs font-semibold text-blue-800 sticky top-0 bg-blue-50 py-1">
                  All Spin Steal Points - Click to edit
                </h4>
                {formData.spinStealPoints?.map((point, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedSpinStealIndex === index
                        ? "bg-blue-100 border-blue-400 shadow-md"
                        : "bg-white border-blue-200 hover:border-blue-300"
                    }`}
                    onClick={() => onSelectedSpinStealIndexChange(index)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                          {index + 1}
                        </span>
                        <div className="text-xs">
                          <div className="font-semibold text-gray-800">
                            Angle: {point.angle}° | Width: {point.width}°
                          </div>
                          <div className="text-cyan-600 font-bold">
                            {point.spinStealMultiplier.toFixed(2)}x spin steal
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveSpinStealPoint(index);
                        }}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>

                    {selectedSpinStealIndex === index && (
                      <div className="space-y-3 pt-2 border-t border-blue-200">
                        <div className="space-y-1">
                          <label className="text-xs text-gray-700 font-medium flex justify-between">
                            <span>Angle</span>
                            <span className="text-blue-600 font-bold">
                              {point.angle}°
                            </span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={point.angle}
                            onChange={(e) =>
                              onUpdateSelectedSpinStealPoint(
                                "angle",
                                Number(e.target.value)
                              )
                            }
                            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-gray-700 font-medium flex justify-between">
                            <span>Spin Steal Multiplier</span>
                            <span className="text-cyan-600 font-bold">
                              {point.spinStealMultiplier.toFixed(2)}x
                            </span>
                          </label>
                          <input
                            type="range"
                            min="1.0"
                            max="2.0"
                            step="0.01"
                            value={point.spinStealMultiplier}
                            onChange={(e) =>
                              onUpdateSelectedSpinStealPoint(
                                "spinStealMultiplier",
                                Number(e.target.value)
                              )
                            }
                            className="w-full h-2 bg-cyan-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>1.0x</span>
                            <span>2.0x</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-gray-700 font-medium flex justify-between">
                            <span>Width (Arc)</span>
                            <span className="text-blue-600 font-bold">
                              {point.width}°
                            </span>
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="90"
                            value={point.width}
                            onChange={(e) =>
                              onUpdateSelectedSpinStealPoint(
                                "width",
                                Number(e.target.value)
                              )
                            }
                            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
