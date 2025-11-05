/**
 * Multi-Step Beyblade Editor with Fixed Preview
 * Step 1: Name & Image Upload with WhatsApp-style editing
 * Step 2: Type Distribution & Stats
 * Step 3: Contact Points & Spin Steal Points
 */

"use client";

import React, { useState, useCallback, useMemo } from "react";
import { BeybladeStats, calculateStats } from "@/types/beybladeStats";
import BeybladePreview from "./BeybladePreview";
import {
  Step1BasicInfo,
  Step2TypeDistribution,
  Step3ContactPoints,
} from "./beyblade-editor";

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

  // Spike editing state
  const [isPlacingPoint, setIsPlacingPoint] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(
    null
  );
  const [selectedSpinStealIndex, setSelectedSpinStealIndex] = useState<
    number | null
  >(null);

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
    spinStealPoints: beyblade?.spinStealPoints || [
      { angle: 45, spinStealMultiplier: 1.0, width: 45 },
      { angle: 135, spinStealMultiplier: 1.0, width: 45 },
      { angle: 225, spinStealMultiplier: 1.0, width: 45 },
      { angle: 315, spinStealMultiplier: 1.0, width: 45 },
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

  // Helper functions for damage points budget - REMOVED 100 POINT LIMIT
  const getTotalDamagePoints = () => {
    return formData.pointsOfContact?.length || 0;
  };

  const autoBalanceDamage = () => {
    if (!formData.pointsOfContact || formData.pointsOfContact.length === 0)
      return;

    const newPoints = formData.pointsOfContact.map((point) => ({
      ...point,
      damageMultiplier: 1.0,
    }));

    setFormData({
      ...formData,
      pointsOfContact: newPoints,
    });
  };

  // Helper functions for spin steal points
  const autoBalanceSpinSteal = () => {
    if (!formData.spinStealPoints || formData.spinStealPoints.length === 0)
      return;

    const newPoints = formData.spinStealPoints.map((point) => ({
      ...point,
      spinStealMultiplier: 1.0,
    }));

    setFormData({
      ...formData,
      spinStealPoints: newPoints,
    });
  };

  // Generate evenly spaced contact points
  const generateContactPoints = (count: number) => {
    if (count < 1 || count > 20) return;

    const angleStep = 360 / count;
    const newPoints = Array.from({ length: count }, (_, i) => ({
      angle: Math.round(i * angleStep),
      damageMultiplier: 1.0,
      width: Math.min(45, (360 / count) * 0.8), // Width is 80% of space between points
    }));

    setFormData({
      ...formData,
      pointsOfContact: newPoints,
    });
  };

  // Generate evenly spaced spin steal points
  const generateSpinStealPoints = (count: number) => {
    if (count < 1 || count > 20) return;

    const angleStep = 360 / count;
    const offset = angleStep / 2; // Offset by half to place between contact points
    const newPoints = Array.from({ length: count }, (_, i) => ({
      angle: Math.round(i * angleStep + offset),
      spinStealMultiplier: 1.0,
      width: Math.min(45, (360 / count) * 0.8),
    }));

    setFormData({
      ...formData,
      spinStealPoints: newPoints,
    });
  };

  // Copy points to clipboard
  const copyContactPointsToClipboard = () => {
    const json = JSON.stringify(formData.pointsOfContact, null, 2);
    navigator.clipboard.writeText(json);
    alert("Contact points copied to clipboard!");
  };

  const copySpinStealPointsToClipboard = () => {
    const json = JSON.stringify(formData.spinStealPoints, null, 2);
    navigator.clipboard.writeText(json);
    alert("Spin steal points copied to clipboard!");
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

  const updateSelectedSpinStealPoint = (field: string, value: number) => {
    if (selectedSpinStealIndex === null || !formData.spinStealPoints) return;

    const newPoints = [...formData.spinStealPoints];
    newPoints[selectedSpinStealIndex] = {
      ...newPoints[selectedSpinStealIndex],
      [field]: value,
    };

    setFormData({
      ...formData,
      spinStealPoints: newPoints,
    });
  };

  const addContactPoint = (angle: number) => {
    if (!formData.pointsOfContact || formData.pointsOfContact.length >= 20)
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

  const removeSpinStealPoint = (index: number) => {
    if (!formData.spinStealPoints) return;

    const newPoints = formData.spinStealPoints.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      spinStealPoints: newPoints,
    });

    if (selectedSpinStealIndex === index) {
      setSelectedSpinStealIndex(null);
    }
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
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {beyblade ? "Edit Beyblade" : "Create New Beyblade"}
            </h2>
            <p className="text-gray-600 mt-1">
              Step {currentStep} of 3:{" "}
              {currentStep === 1
                ? "Basic Info & Physical Properties"
                : currentStep === 2
                ? "Type Distribution & Stats"
                : "Contact Points"}
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
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
          {/* Left Side - Form Steps */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <Step1BasicInfo
                formData={formData}
                imagePreview={imagePreview}
                showImageEditor={showImageEditor}
                imagePosition={imagePosition}
                onFormDataChange={setFormData}
                onImageSelect={handleImageSelect}
                onImagePositionChange={handleImagePositionChange}
                onShowImageEditor={setShowImageEditor}
                onImageEditorSave={handleImageEditorSave}
                onImageEditorCancel={handleImageEditorCancel}
              />
            )}

            {/* Step 2: Type Distribution */}
            {currentStep === 2 && (
              <Step2TypeDistribution
                formData={formData}
                calculatedStats={calculatedStats}
                onFormDataChange={setFormData}
              />
            )}

            {/* Step 3: Contact Points & Spin Steal Points */}
            {currentStep === 3 && (
              <Step3ContactPoints
                formData={formData}
                selectedPointIndex={selectedPointIndex}
                selectedSpinStealIndex={selectedSpinStealIndex}
                onFormDataChange={setFormData}
                onSelectedPointIndexChange={setSelectedPointIndex}
                onSelectedSpinStealIndexChange={setSelectedSpinStealIndex}
                onGenerateContactPoints={generateContactPoints}
                onGenerateSpinStealPoints={generateSpinStealPoints}
                onAutoBalanceDamage={autoBalanceDamage}
                onCopyContactPoints={copyContactPointsToClipboard}
                onCopySpinStealPoints={copySpinStealPointsToClipboard}
                onUpdateSelectedPoint={updateSelectedPoint}
                onUpdateSelectedSpinStealPoint={updateSelectedSpinStealPoint}
                onRemoveContactPoint={removeContactPoint}
                onRemoveSpinStealPoint={removeSpinStealPoint}
              />
            )}
          </div>

          {/* Right Side - Fixed Preview */}
          <div className="hidden lg:flex lg:w-96 bg-gray-900 p-6 flex-col border-l border-gray-700 sticky top-0 self-start max-h-screen overflow-y-auto">
            <h3 className="text-white text-lg font-bold mb-4">Live Preview</h3>
            {/* Container with aspect ratio preserved */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <BeybladePreview
                beyblade={
                  {
                    ...formData,
                    id: beyblade?.id || "preview",
                    fileName: beyblade?.fileName || "preview.svg",
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
