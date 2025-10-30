/**
 * Multi-Step Beyblade Editor with Fixed Preview
 * Step 1: Name & Image Upload with WhatsApp-style editing
 * Step 2: Physical Properties (mass, radius, spikes, etc.)
 * Step 3: Special Move Configuration
 */

"use client";

import React, { useState, useRef } from "react";
import { BeybladeStats, SpecialMoveFlags } from "@/types/beybladeStats";
import BeybladePreview from "./BeybladePreview";

interface MultiStepBeybladeEditorProps {
  beyblade?: BeybladeStats | null;
  onSave: (beyblade: Partial<BeybladeStats>) => void;
  onCancel: () => void;
}

// Preset special moves
const PRESET_MOVES = [
  {
    name: "Speed Demon",
    description: "Massive speed boost",
    powerCost: 15,
    flags: {
      speedBoost: 2.5,
      radiusMultiplier: 1.2,
      duration: 6,
      cooldown: 15,
    },
  },
  {
    name: "Tank Mode",
    description: "Ultimate defense with healing",
    powerCost: 20,
    flags: {
      damageReduction: 0.9,
      immuneToKnockback: true,
      healSpin: 40,
      reflectDamage: 0.4,
      duration: 12,
      cooldown: 25,
    },
  },
  {
    name: "Vampire Spin",
    description: "Steal and heal from opponents",
    powerCost: 20,
    flags: {
      spinStealMultiplier: 3.0,
      vortexMode: {
        enabled: true,
        pullRadius: 180,
        spinStealRate: 15,
        healFromSteal: true,
        slowOpponents: 0.7,
      },
      healSpin: 20,
      speedBoost: 1.4,
      duration: 12,
      cooldown: 25,
    },
  },
  {
    name: "Berserker Rage",
    description: "High damage but vulnerable",
    powerCost: 25,
    flags: {
      berserkMode: {
        enabled: true,
        damageBoost: 2.5,
        speedBoost: 1.8,
        defenseReduction: 0.6,
        visualIntensity: 3.0,
      },
      duration: 8,
      cooldown: 30,
    },
  },
  {
    name: "Shadow Wraith",
    description: "Invisible phantom mode",
    powerCost: 25,
    flags: {
      phantomMode: {
        enabled: true,
        opacity: 0.3,
        phaseThrough: true,
        teleportOnHit: true,
      },
      speedBoost: 2.0,
      damageImmune: true,
      duration: 5,
      cooldown: 25,
    },
  },
  {
    name: "Fortress Shield",
    description: "Impenetrable defense with healing",
    powerCost: 25,
    flags: {
      shieldDome: {
        enabled: true,
        absorbDamage: true,
        reflectPercentage: 0.5,
        pushRadius: 150,
        healPerSecond: 8,
      },
      immuneToKnockback: true,
      duration: 12,
      cooldown: 30,
    },
  },
];

export default function MultiStepBeybladeEditor({
  beyblade,
  onSave,
  onCancel,
}: MultiStepBeybladeEditorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    beyblade?.imageUrl || ""
  );
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form data
  const [formData, setFormData] = useState<Partial<BeybladeStats>>({
    displayName: beyblade?.displayName || "",
    type: beyblade?.type || "balanced",
    spinDirection: beyblade?.spinDirection || "right",
    mass: beyblade?.mass || 45,
    radius: beyblade?.radius || 40,
    actualSize: beyblade?.actualSize || 80,
    maxSpin: beyblade?.maxSpin || 100,
    spinDecayRate: beyblade?.spinDecayRate || 1.5,
    spinStealFactor: beyblade?.spinStealFactor || 0.15,
    typeDistribution: beyblade?.typeDistribution || {
      attack: 100,
      defense: 110,
      stamina: 110,
      total: 320,
    },
    pointsOfContact: beyblade?.pointsOfContact || [
      { angle: 0, damageMultiplier: 1.2, width: 45 },
      { angle: 90, damageMultiplier: 1.0, width: 45 },
      { angle: 180, damageMultiplier: 1.2, width: 45 },
      { angle: 270, damageMultiplier: 1.0, width: 45 },
    ],
    specialMove: beyblade?.specialMove || {
      id: "balanced_move",
      name: "Balanced Strike",
      description: "Moderate speed and power boost",
      powerCost: 15,
      flags: {
        speedBoost: 1.5,
        damageMultiplier: 1.3,
        duration: 5,
        cooldown: 15,
      },
      category: "offensive",
    },
  });

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRotate = () => {
    setImageRotation((prev) => (prev + 90) % 360);
  };

  const applyPresetMove = (preset: (typeof PRESET_MOVES)[0]) => {
    setFormData({
      ...formData,
      specialMove: {
        id: preset.name.toLowerCase().replace(/\s+/g, "_"),
        name: preset.name,
        description: preset.description,
        powerCost: preset.powerCost,
        flags: preset.flags as SpecialMoveFlags,
        category: "offensive",
      },
    });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Upload image first if there's a new one
    let imageUrl = formData.imageUrl || imagePreview;

    if (imageFile) {
      const formDataToSend = new FormData();
      formDataToSend.append("file", imageFile);
      formDataToSend.append("beybladeId", beyblade?.id || "new");

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataToSend,
        });
        const data = await response.json();
        if (data.success) {
          imageUrl = data.url;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    onSave({
      ...formData,
      imageUrl,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {beyblade ? "Edit Beyblade" : "Create New Beyblade"}
            </h2>
            <p className="text-gray-600 mt-1">
              Step {currentStep} of 3:{" "}
              {currentStep === 1
                ? "Name & Image"
                : currentStep === 2
                ? "Physical Properties"
                : "Special Move"}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                    step === currentStep
                      ? "bg-blue-600 text-white"
                      : step < currentStep
                      ? "bg-green-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step < currentStep ? "✓" : step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-24 h-1 ${
                      step < currentStep ? "bg-green-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content Area with Fixed Preview */}
        <div className="flex-1 overflow-y-auto flex">
          {/* Left Side - Form Steps */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Step 1: Name & Image */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Beyblade Name *
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    placeholder="e.g., Storm Pegasus"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as any,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="attack">Attack</option>
                      <option value="defense">Defense</option>
                      <option value="stamina">Stamina</option>
                      <option value="balanced">Balanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Spin Direction *
                    </label>
                    <select
                      value={formData.spinDirection}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          spinDirection: e.target.value as any,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="right">Right</option>
                      <option value="left">Left</option>
                    </select>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Beyblade Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    {imagePreview ? (
                      <div className="space-y-4">
                        {/* Image Preview with Editing */}
                        <div
                          className="relative bg-gray-100 rounded-lg overflow-hidden"
                          style={{ height: "300px" }}
                        >
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{
                              transform: `scale(${imageScale}) rotate(${imageRotation}deg)`,
                              transition: "transform 0.3s ease",
                            }}
                          >
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        </div>

                        {/* Editing Controls (WhatsApp-style) */}
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                          <div className="flex-1">
                            <label className="text-xs font-semibold text-gray-700 mb-1 block">
                              Scale
                            </label>
                            <input
                              type="range"
                              min="0.5"
                              max="2"
                              step="0.1"
                              value={imageScale}
                              onChange={(e) =>
                                setImageScale(parseFloat(e.target.value))
                              }
                              className="w-full"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {(imageScale * 100).toFixed(0)}%
                            </div>
                          </div>

                          <button
                            onClick={handleImageRotate}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            🔄 Rotate
                          </button>

                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                          >
                            Change Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="mb-4">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Upload Image
                        </button>
                        <p className="text-xs text-gray-500 mt-2">
                          PNG, JPG or GIF (MAX. 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Physical Properties */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mass (kg) *
                    </label>
                    <input
                      type="number"
                      value={formData.mass}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mass: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Radius (px) *
                    </label>
                    <input
                      type="number"
                      value={formData.radius}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          radius: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Visual Size (px) *
                    </label>
                    <input
                      type="number"
                      value={formData.actualSize}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          actualSize: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Max Spin *
                    </label>
                    <input
                      type="number"
                      value={formData.maxSpin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxSpin: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Spin Decay Rate *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.spinDecayRate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          spinDecayRate: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Spin Steal Factor *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.spinStealFactor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          spinStealFactor: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Type Distribution */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type Distribution (Total:{" "}
                    {formData.typeDistribution?.total || 0}/320)
                  </label>
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-red-600">
                          Attack
                        </span>
                        <span className="text-sm font-bold">
                          {formData.typeDistribution?.attack}/150
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="150"
                        value={formData.typeDistribution?.attack || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            typeDistribution: {
                              ...formData.typeDistribution!,
                              attack: parseInt(e.target.value),
                              total:
                                parseInt(e.target.value) +
                                (formData.typeDistribution?.defense || 0) +
                                (formData.typeDistribution?.stamina || 0),
                            },
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-blue-600">
                          Defense
                        </span>
                        <span className="text-sm font-bold">
                          {formData.typeDistribution?.defense}/150
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="150"
                        value={formData.typeDistribution?.defense || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            typeDistribution: {
                              ...formData.typeDistribution!,
                              defense: parseInt(e.target.value),
                              total:
                                (formData.typeDistribution?.attack || 0) +
                                parseInt(e.target.value) +
                                (formData.typeDistribution?.stamina || 0),
                            },
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-green-600">
                          Stamina
                        </span>
                        <span className="text-sm font-bold">
                          {formData.typeDistribution?.stamina}/150
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="150"
                        value={formData.typeDistribution?.stamina || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            typeDistribution: {
                              ...formData.typeDistribution!,
                              stamina: parseInt(e.target.value),
                              total:
                                (formData.typeDistribution?.attack || 0) +
                                (formData.typeDistribution?.defense || 0) +
                                parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    {formData.typeDistribution?.total !== 320 && (
                      <div className="text-sm text-amber-600 font-medium">
                        ⚠️ Total must equal 320
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Points (Spikes) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Points (Spikes) -{" "}
                    {formData.pointsOfContact?.length || 0} points
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {formData.pointsOfContact?.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-white p-3 rounded border border-gray-200"
                      >
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">
                            Angle: {point.angle}°
                          </div>
                          <div className="text-xs text-gray-500">
                            Damage: {point.damageMultiplier}x
                          </div>
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          value={point.damageMultiplier}
                          onChange={(e) => {
                            const newPoints = [
                              ...(formData.pointsOfContact || []),
                            ];
                            newPoints[index].damageMultiplier = parseFloat(
                              e.target.value
                            );
                            setFormData({
                              ...formData,
                              pointsOfContact: newPoints,
                            });
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Special Move */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Choose Preset or Customize
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {PRESET_MOVES.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => applyPresetMove(preset)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          formData.specialMove?.name === preset.name
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        <div className="font-semibold text-gray-900 mb-1">
                          {preset.name}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {preset.description}
                        </div>
                        <div className="text-xs text-blue-600 font-medium">
                          Power Cost: {preset.powerCost}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Move Editor */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Customize Special Move
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Move Name
                      </label>
                      <input
                        type="text"
                        value={formData.specialMove?.name || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specialMove: {
                              ...formData.specialMove!,
                              name: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Power Cost
                      </label>
                      <input
                        type="number"
                        value={formData.specialMove?.powerCost || 15}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specialMove: {
                              ...formData.specialMove!,
                              powerCost: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.specialMove?.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialMove: {
                            ...formData.specialMove!,
                            description: e.target.value,
                          },
                        })
                      }
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Flag Editors */}
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Speed Boost
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={
                            (formData.specialMove?.flags as any)?.speedBoost ||
                            1.0
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              specialMove: {
                                ...formData.specialMove!,
                                flags: {
                                  ...formData.specialMove!.flags,
                                  speedBoost: parseFloat(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Damage Multiplier
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={
                            (formData.specialMove?.flags as any)
                              ?.damageMultiplier || 1.0
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              specialMove: {
                                ...formData.specialMove!,
                                flags: {
                                  ...formData.specialMove!.flags,
                                  damageMultiplier: parseFloat(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Duration (seconds)
                        </label>
                        <input
                          type="number"
                          value={formData.specialMove?.flags.duration || 5}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              specialMove: {
                                ...formData.specialMove!,
                                flags: {
                                  ...formData.specialMove!.flags,
                                  duration: parseInt(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Cooldown (seconds)
                        </label>
                        <input
                          type="number"
                          value={formData.specialMove?.flags.cooldown || 15}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              specialMove: {
                                ...formData.specialMove!,
                                flags: {
                                  ...formData.specialMove!.flags,
                                  cooldown: parseInt(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 mt-2">
                      💡 For advanced flags (berserk, phantom, vortex, etc.),
                      use the preset moves above
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Fixed Preview */}
          <div className="w-96 bg-gray-900 p-6 flex flex-col border-l border-gray-700">
            <h3 className="text-white text-lg font-bold mb-4">Live Preview</h3>
            <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden">
              <BeybladePreview
                beyblade={
                  {
                    ...formData,
                    id: beyblade?.id || "preview",
                    imageUrl: imagePreview || formData.imageUrl,
                  } as BeybladeStats
                }
              />
            </div>
          </div>
        </div>

        {/* Footer - Navigation Buttons */}
        <div className="p-6 border-t border-gray-200 flex justify-between bg-gray-50">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={formData.typeDistribution?.total !== 320}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {beyblade ? "Update Beyblade" : "Create Beyblade"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
