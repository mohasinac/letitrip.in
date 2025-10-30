/**
 * Beyblade Editor Component
 * Create and edit Beyblade stats with live preview
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  BeybladeStats,
  BeybladeType,
  SpinDirection,
} from "@/types/beybladeStats";
import BeybladePreview from "./BeybladePreview";

interface BeybladeEditorProps {
  beyblade?: BeybladeStats | null;
  onSave: (beyblade: Partial<BeybladeStats>) => Promise<void>;
  onCancel: () => void;
}

const BeybladeEditor: React.FC<BeybladeEditorProps> = ({
  beyblade,
  onSave,
  onCancel,
}) => {
  const isEditing = !!beyblade;
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<BeybladeStats>>({
    displayName: "",
    fileIdentifier: "",
    type: "balanced",
    spinDirection: "right",
    weight: 50,
    diameter: 40,
    height: 20,
    attackPower: 50,
    defense: 50,
    stamina: 50,
    spin: 1000,
    specialMove: {
      id: "",
      name: "",
      description: "",
      powerCost: 25,
      category: "offensive",
      flags: {
        duration: 4,
        cooldown: 10,
      },
    },
  });

  useEffect(() => {
    if (beyblade) {
      setFormData(beyblade);
    }
  }, [beyblade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecialMoveChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      specialMove: {
        ...prev.specialMove!,
        [field]: value,
      },
    }));
  };

  const handleFlagChange = (flag: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      specialMove: {
        ...prev.specialMove!,
        flags: {
          ...prev.specialMove!.flags,
          [flag]: value,
        },
      },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">
            {isEditing ? `Edit ${beyblade.displayName}` : "Create New Beyblade"}
          </h2>
          <p className="text-blue-100 mt-1">
            {isEditing
              ? "Modify Beyblade stats and special moves"
              : "Define stats, special move, and preview your creation"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Basic Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={(e) =>
                        handleChange("displayName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Dragoon GT"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File Identifier *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fileIdentifier}
                      onChange={(e) =>
                        handleChange("fileIdentifier", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., dragoon-gt"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Used for image filename (e.g., dragoon-gt.svg)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          handleChange("type", e.target.value as BeybladeType)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="attack">Attack</option>
                        <option value="defense">Defense</option>
                        <option value="stamina">Stamina</option>
                        <option value="balanced">Balanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Spin Direction *
                      </label>
                      <select
                        value={formData.spinDirection}
                        onChange={(e) =>
                          handleChange(
                            "spinDirection",
                            e.target.value as SpinDirection
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="right">Right</option>
                        <option value="left">Left</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Stats */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Physical Stats
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attack Power: {formData.attackPower}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.attackPower}
                      onChange={(e) =>
                        handleChange("attackPower", parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Defense: {formData.defense}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.defense}
                      onChange={(e) =>
                        handleChange("defense", parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stamina: {formData.stamina}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.stamina}
                      onChange={(e) =>
                        handleChange("stamina", parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Spin: {formData.spin}
                    </label>
                    <input
                      type="range"
                      min="500"
                      max="2000"
                      step="100"
                      value={formData.spin}
                      onChange={(e) =>
                        handleChange("spin", parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Special Move */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Special Move
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Move Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.specialMove?.name}
                      onChange={(e) =>
                        handleSpecialMoveChange("name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Phantom Hurricane"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.specialMove?.description}
                      onChange={(e) =>
                        handleSpecialMoveChange("description", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Describe the special move..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Power Cost
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="25"
                        value={formData.specialMove?.powerCost}
                        onChange={(e) =>
                          handleSpecialMoveChange(
                            "powerCost",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.specialMove?.category}
                        onChange={(e) =>
                          handleSpecialMoveChange("category", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="offensive">Offensive</option>
                        <option value="defensive">Defensive</option>
                        <option value="support">Support</option>
                        <option value="ultimate">Ultimate</option>
                      </select>
                    </div>
                  </div>

                  {/* Move Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Move Type
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!!formData.specialMove?.flags.orbitalAttack}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleFlagChange("orbitalAttack", {
                                enabled: true,
                                orbitRadius: 80,
                                attackCount: 3,
                                damagePerHit: 105,
                                orbitSpeed: 2.0,
                              });
                            } else {
                              handleFlagChange("orbitalAttack", undefined);
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">
                          Orbital Attack (Barrage)
                        </span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!!formData.specialMove?.flags.timeSkip}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleFlagChange("timeSkip", {
                                enabled: true,
                                freezeDuration: 3,
                                repositionOpponent: {
                                  enabled: true,
                                  direction: "center",
                                  distance: 80,
                                },
                                loopRing: {
                                  enabled: true,
                                  ringType: "charge",
                                  duration: 3,
                                  disableChargePoints: true,
                                },
                                spinDrainOnEnd: 400,
                              });
                            } else {
                              handleFlagChange("timeSkip", undefined);
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">
                          Time Skip (Freeze & Loop)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-6">
              <BeybladePreview beyblade={formData as BeybladeStats} />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEditing
                ? "Update Beyblade"
                : "Create Beyblade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BeybladeEditor;
