/**
 * Multi-Step Beyblade Editor with Fixed Preview
 * Step 1: Name & Image Upload with WhatsApp-style editing
 * Step 2: Physical Properties (mass, radius, spikes, etc.)
 */

"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import { BeybladeStats, calculateStats } from "@/types/beybladeStats";
import BeybladePreview from "./BeybladePreview";
import WhatsAppStyleImageEditor from "./WhatsAppStyleImageEditor";

interface MultiStepBeybladeEditorProps {
  beyblade?: BeybladeStats | null;
  onSave: (beyblade: Partial<BeybladeStats>) => void;
  onCancel: () => void;
}

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
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imagePosition, setImagePosition] = useState<{
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }>(beyblade?.imagePosition || { x: 0, y: 0, scale: 1, rotation: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Spike editing state
  const [isPlacingPoint, setIsPlacingPoint] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(
    null
  );

  // Form data
  const [formData, setFormData] = useState<Partial<BeybladeStats>>({
    displayName: beyblade?.displayName || "",
    type: beyblade?.type || "balanced",
    spinDirection: beyblade?.spinDirection || "right",
    mass: beyblade?.mass || 50, // grams (real beyblades are typically 40-60g)
    radius: beyblade?.radius || 4, // cm (typical beyblade radius is 3.5-4.5cm)
    imagePosition: beyblade?.imagePosition || {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
    },
    typeDistribution: beyblade?.typeDistribution || {
      attack: 120,
      defense: 120,
      stamina: 120,
      total: 360,
    },
    pointsOfContact: beyblade?.pointsOfContact || [
      { angle: 0, damageMultiplier: 1.2, width: 45 },
      { angle: 90, damageMultiplier: 1.0, width: 45 },
      { angle: 180, damageMultiplier: 1.2, width: 45 },
      { angle: 270, damageMultiplier: 1.0, width: 45 },
    ],
  });

  // Calculate stats from type distribution
  const calculatedStats = useMemo(() => {
    if (formData.typeDistribution) {
      return calculateStats(formData.typeDistribution);
    }
    return null;
  }, [formData.typeDistribution]);

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setShowImageEditor(true); // Open WhatsApp-style editor
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagePositionChange = useCallback(
    (position: { x: number; y: number; scale: number; rotation: number }) => {
      setImagePosition(position);
      setFormData((prev) => ({
        ...prev,
        imagePosition: position,
      }));
    },
    []
  );

  const handleImageEditorSave = () => {
    setShowImageEditor(false);
  };

  const handleImageEditorCancel = () => {
    setShowImageEditor(false);
    if (!beyblade?.imageUrl) {
      // If no existing image, clear the preview
      setImagePreview("");
      setImageFile(null);
    }
  };

  // Helper functions for damage points budget
  const getTotalDamagePoints = () => {
    return (
      formData.pointsOfContact?.reduce(
        (sum, point) => sum + (point.damageMultiplier - 1.0) * 100,
        0
      ) || 0
    );
  };

  const getRemainingDamagePoints = () => {
    return 100 - getTotalDamagePoints();
  };

  const autoBalanceDamage = () => {
    if (!formData.pointsOfContact || formData.pointsOfContact.length === 0)
      return;

    const equalDamage = 1.0 + 100 / formData.pointsOfContact.length / 100;
    const newPoints = formData.pointsOfContact.map((point) => ({
      ...point,
      damageMultiplier: Math.round(equalDamage * 100) / 100,
    }));

    setFormData({
      ...formData,
      pointsOfContact: newPoints,
    });
  };

  const updateSelectedPoint = (field: string, value: number) => {
    if (selectedPointIndex === null || !formData.pointsOfContact) return;

    const newPoints = [...formData.pointsOfContact];
    newPoints[selectedPointIndex] = {
      ...newPoints[selectedPointIndex],
      [field]: value,
    };

    setFormData({
      ...formData,
      pointsOfContact: newPoints,
    });
  };

  const addContactPoint = (angle: number) => {
    if (!formData.pointsOfContact || formData.pointsOfContact.length >= 10)
      return;

    const newPoint = {
      angle: Math.round(angle),
      damageMultiplier: 1.0,
      width: 45,
    };

    setFormData({
      ...formData,
      pointsOfContact: [...formData.pointsOfContact, newPoint],
    });

    setIsPlacingPoint(false);
  };

  const removeContactPoint = (index: number) => {
    if (!formData.pointsOfContact) return;

    const newPoints = formData.pointsOfContact.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      pointsOfContact: newPoints,
    });

    if (selectedPointIndex === index) {
      setSelectedPointIndex(null);
    }
  };

  const handleNext = () => {
    if (currentStep < 2) {
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
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {beyblade ? "Edit Beyblade" : "Create New Beyblade"}
            </h2>
            <p className="text-gray-600 mt-1">
              Step {currentStep} of 2:{" "}
              {currentStep === 1 ? "Name & Image" : "Physical Properties"}
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
            {[1, 2].map((step) => (
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
                {step < 2 && (
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
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
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
                    {imagePreview && !showImageEditor ? (
                      <div className="space-y-4">
                        {/* Image Preview Thumbnail */}
                        <div className="flex items-center justify-center">
                          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-red-500">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              style={{
                                transform: `scale(${
                                  imagePosition.scale
                                }) translate(${imagePosition.x * 50}%, ${
                                  imagePosition.y * 50
                                }%) rotate(${imagePosition.rotation}deg)`,
                                transformOrigin: "center",
                              }}
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={() => setShowImageEditor(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            ✏️ Adjust Position
                          </button>

                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            🔄 Change Image
                          </button>
                        </div>
                      </div>
                    ) : imagePreview && showImageEditor ? (
                      <WhatsAppStyleImageEditor
                        imageUrl={imagePreview}
                        onPositionChange={handleImagePositionChange}
                        initialPosition={imagePosition}
                        circleSize={300}
                        onSave={handleImageEditorSave}
                        onCancel={handleImageEditorCancel}
                      />
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mass (grams) *
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
                      min={10}
                      max={2000}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Affects collision physics (real beyblades: 40-60g)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Radius (cm) *
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
                      min={3}
                      max={50}
                      step={0.1}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Physical radius (real beyblades: 3.5-4.5cm, display size =
                      radius × 10px)
                    </p>
                  </div>
                </div>

                {/* Calculated Stats Display */}
                {calculatedStats && (
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200">
                    <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                      📊 Calculated Stats
                      <span className="text-sm font-normal text-purple-600">
                        (Based on {formData.typeDistribution?.total || 0}/360
                        points)
                      </span>
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">
                          Attack Power
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                          {calculatedStats.damagePerHit.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">
                          damage per hit
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Speed</div>
                        <div className="text-2xl font-bold text-orange-600">
                          {calculatedStats.speedPerSecond.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">
                          units/second
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">
                          Defense
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {calculatedStats.damageReduction.toFixed(2)}x
                        </div>
                        <div className="text-xs text-gray-500">
                          damage reduction
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">
                          Knockback Resistance
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {calculatedStats.knockbackDistance.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">
                          resistance units
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">
                          Max Stamina
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {calculatedStats.maxStamina}
                        </div>
                        <div className="text-xs text-gray-500">
                          health points
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">
                          Spin Steal
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {calculatedStats.spinStealAmount.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">
                          points per hit
                        </div>
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

                {/* Type Distribution */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type Distribution (Total:{" "}
                    {formData.typeDistribution?.total || 0}/360)
                  </label>
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-4">
                      <p className="text-xs font-semibold text-blue-900 mb-1">
                        💡 Stat Bonuses (360 points total, max 150 each):
                      </p>
                      <ul className="text-xs text-blue-800 space-y-0.5">
                        <li>• Attack: +1 damage, +1 speed per point</li>
                        <li>
                          • Defense: +1% damage reduction, +1 knockback
                          resistance per point
                        </li>
                        <li>
                          • Stamina: +20 max health, +1 spin steal per point
                        </li>
                      </ul>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-red-600">
                          Attack{" "}
                          {calculatedStats &&
                            `(+${calculatedStats.damagePerHit.toFixed(
                              1
                            )} dmg, +${calculatedStats.speedPerSecond.toFixed(
                              1
                            )} speed)`}
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
                          Defense{" "}
                          {calculatedStats &&
                            `(${calculatedStats.damageReduction.toFixed(
                              2
                            )}x reduction, +${calculatedStats.knockbackDistance.toFixed(
                              1
                            )} knockback)`}
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
                          Stamina{" "}
                          {calculatedStats &&
                            `(${
                              calculatedStats.maxStamina
                            } HP, +${calculatedStats.spinStealAmount.toFixed(
                              1
                            )} steal)`}
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

                    {formData.typeDistribution?.total !== 360 && (
                      <div className="text-sm text-amber-600 font-medium">
                        ⚠️ Total must equal 360 (currently:{" "}
                        {formData.typeDistribution?.total})
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Points (Spikes) - Enhanced */}
                <div className="space-y-4 bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-purple-900">
                      Contact Points (Spikes) -{" "}
                      {formData.pointsOfContact?.length || 0} points
                    </h3>
                    <button
                      onClick={() => {
                        if ((formData.pointsOfContact?.length || 0) < 10) {
                          setIsPlacingPoint(!isPlacingPoint);
                        }
                      }}
                      disabled={(formData.pointsOfContact?.length || 0) >= 10}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isPlacingPoint
                          ? "bg-purple-600 text-white"
                          : (formData.pointsOfContact?.length || 0) >= 10
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-purple-200 text-purple-900 hover:bg-purple-300"
                      }`}
                    >
                      {isPlacingPoint ? "Cancel" : "+ Add Point"}
                    </button>
                  </div>

                  {isPlacingPoint && (
                    <div className="bg-blue-100 p-3 rounded-lg border border-blue-300">
                      <p className="text-xs text-blue-900 font-semibold">
                        📍 Click on the preview canvas to place a spike
                      </p>
                    </div>
                  )}

                  {/* Damage Points Budget */}
                  <div className="bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-lg border-2 border-orange-300">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-orange-900">
                          💥 Damage Points Budget
                        </p>
                        <p className="text-xs text-orange-700">
                          Distribute 100 bonus damage points across your spikes
                        </p>
                      </div>
                      <button
                        onClick={autoBalanceDamage}
                        disabled={(formData.pointsOfContact?.length || 0) === 0}
                        className="px-3 py-1.5 bg-orange-600 text-white text-xs font-semibold rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        ⚖️ Auto Balance
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1">
                        <div className="h-6 bg-white rounded-full overflow-hidden border-2 border-orange-400">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-orange-500 transition-all duration-300"
                            style={{ width: `${getTotalDamagePoints()}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-orange-900">
                          {getTotalDamagePoints().toFixed(0)}/100
                        </p>
                        <p className="text-xs text-orange-700">points used</p>
                      </div>
                    </div>

                    {getRemainingDamagePoints() < 0 && (
                      <div className="bg-red-500 text-white p-2 rounded text-xs font-semibold">
                        ⚠️ Over budget! Reduce damage multipliers by{" "}
                        {Math.abs(getRemainingDamagePoints()).toFixed(0)} points
                      </div>
                    )}

                    {getRemainingDamagePoints() > 5 &&
                      (formData.pointsOfContact?.length || 0) > 0 && (
                        <div className="bg-yellow-500 text-white p-2 rounded text-xs font-semibold">
                          💡 {getRemainingDamagePoints().toFixed(0)} points
                          remaining - increase damage or add more spikes!
                        </div>
                      )}
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-100 p-3 rounded-lg border border-blue-300">
                    <p className="text-xs text-blue-900 font-semibold mb-1">
                      ⚡ Damage System:
                    </p>
                    <p className="text-xs text-blue-800">
                      • <strong>100 Bonus Points</strong> to distribute across
                      spikes
                      <br />• <strong>1 spike:</strong> Can set to 2.0x (uses
                      all 100 points)
                      <br />• <strong>2 spikes:</strong> Each 1.5x (50 points
                      each)
                      <br />• <strong>Base damage:</strong> Always 1.0x when
                      spike doesn't hit
                    </p>
                  </div>

                  {(formData.pointsOfContact?.length || 0) === 0 && (
                    <div className="text-center py-4 text-purple-600 text-sm">
                      No contact points yet. Click "+ Add Point" to start.
                      <br />
                      <span className="text-xs text-purple-500">
                        You can add up to 10 contact points and distribute 100
                        damage points.
                      </span>
                    </div>
                  )}

                  {/* List of all contact points */}
                  {(formData.pointsOfContact?.length || 0) > 0 && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <h4 className="text-xs font-semibold text-purple-800 sticky top-0 bg-purple-50 py-1">
                        All Contact Points - Click to edit
                      </h4>
                      {formData.pointsOfContact?.map((point, index) => {
                        const bonusPoints =
                          (point.damageMultiplier - 1.0) * 100;
                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                              selectedPointIndex === index
                                ? "bg-purple-100 border-purple-400 shadow-md"
                                : "bg-white border-purple-200 hover:border-purple-300"
                            }`}
                            onClick={() => setSelectedPointIndex(index)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold">
                                  {index + 1}
                                </span>
                                <div className="text-xs">
                                  <div className="font-semibold text-gray-800">
                                    Angle: {point.angle}° | Width: {point.width}
                                    °
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
                                  removeContactPoint(index);
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
                                      updateSelectedPoint(
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
                                      updateSelectedPoint(
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
                                      updateSelectedPoint(
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
              </div>
            )}
          </div>

          {/* Right Side - Fixed Preview */}
          <div className="hidden lg:flex lg:w-96 bg-gray-900 p-6 flex-col border-l border-gray-700 sticky top-0 self-start max-h-screen">
            <h3 className="text-white text-lg font-bold mb-4">Live Preview</h3>
            <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden min-h-[500px]">
              <BeybladePreview
                beyblade={
                  {
                    ...formData,
                    id: beyblade?.id || "preview",
                    fileName: beyblade?.fileName || "preview.svg",
                    actualSize: (formData.radius || 4) * 10, // Calculate from radius
                    stamina: calculatedStats?.maxStamina || 2000,
                    spinStealFactor: calculatedStats?.spinStealPower || 100,
                    spinDecayRate: calculatedStats?.spinDecayRate || 1.67,
                    speed: calculatedStats?.speedMultiplier || 100,
                    imageUrl: imagePreview || formData.imageUrl,
                  } as BeybladeStats
                }
                onCanvasClick={isPlacingPoint ? addContactPoint : undefined}
                clickMode={isPlacingPoint}
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

            {currentStep < 2 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={formData.typeDistribution?.total !== 360}
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
