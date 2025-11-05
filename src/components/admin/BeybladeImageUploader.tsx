/**
 * Beyblade Image Upload Component
 * Advanced image editor with background removal, cropping, and resizing
 * Similar to LinkedIn/Facebook profile picture upload
 */

"use client";

import { useState, useRef, useEffect } from "react";
import {
  removeBackground,
  resizeImage,
  processSVG,
  createCircularPreview,
  convertToPNG,
  getImageDimensions,
  validateImageFile,
} from "@/lib/utils/imageProcessing";
import {
  generateEvenlyDistributedPoints,
  calculateBalancedDamageMultiplier,
  suggestContactPointsForType,
  getContactPointStats,
} from "@/lib/utils/contactPointsBalance";

interface BeybladeImageUploaderProps {
  currentImageUrl?: string;
  beybladeId: string;
  onImageUploaded: (imageUrl: string) => void;
  onPointsOfContactUpdated?: (points: PointOfContact[]) => void;
  initialPointsOfContact?: PointOfContact[];
  beybladeData?: {
    displayName?: string;
    type?: string;
    spinDirection?: string;
    radius?: number;
    mass?: number;
  };
}

interface PointOfContact {
  angle: number;
  damageMultiplier: number;
  width: number;
}

export default function BeybladeImageUploader({
  currentImageUrl,
  beybladeId,
  onImageUploaded,
  onPointsOfContactUpdated,
  initialPointsOfContact = [],
  beybladeData,
}: BeybladeImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || "");
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<"select" | "edit" | "points" | "preview">(
    "select"
  );

  // Image editing options
  const [removeBackgroundEnabled, setRemoveBackgroundEnabled] = useState(true);
  const [backgroundTolerance, setBackgroundTolerance] = useState(10);
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");
  const [scale, setScale] = useState(100);

  // Points of contact
  const [pointsOfContact, setPointsOfContact] = useState<PointOfContact[]>(
    initialPointsOfContact
  );
  const [isPlacingPoint, setIsPlacingPoint] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(
    null
  );

  // Calculate total damage points (base 1.0x + 100 bonus points = 200% max)
  const getTotalDamagePoints = () => {
    return (
      pointsOfContact.reduce(
        (sum, point) => sum + (point.damageMultiplier - 1.0),
        0
      ) * 100
    );
  };

  const getRemainingDamagePoints = () => {
    return 100 - getTotalDamagePoints();
  };

  // Auto-balance damage points equally
  const autoBalanceDamage = () => {
    if (pointsOfContact.length === 0) return;

    const equalDistribution = 100 / pointsOfContact.length;
    const newPoints = pointsOfContact.map((point) => ({
      ...point,
      damageMultiplier: 1.0 + equalDistribution / 100,
    }));

    setPointsOfContact(newPoints);
    if (onPointsOfContactUpdated) {
      onPointsOfContactUpdated(newPoints);
    }
  };

  // Evenly distribute contact points around the beyblade
  const evenlyDistributePoints = () => {
    if (pointsOfContact.length === 0) return;

    const angleStep = 360 / pointsOfContact.length;
    const newPoints = pointsOfContact.map((point, index) => ({
      ...point,
      angle: Math.round(angleStep * index),
    }));

    setPointsOfContact(newPoints);
    if (onPointsOfContactUpdated) {
      onPointsOfContactUpdated(newPoints);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const editCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const pointsCanvasRef = useRef<HTMLCanvasElement>(null);
  const livePreviewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Draw circle guide overlay
  const drawCircleGuide = () => {
    if (!overlayCanvasRef.current) return;

    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw circle guide (dashed border)
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();

    // Add text
    ctx.setLineDash([]);
    ctx.fillStyle = "#3b82f6";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Fit image within this circle", size / 2, size / 2 - 10);
    ctx.font = "12px sans-serif";
    ctx.fillText("300px diameter", size / 2, size / 2 + 10);
  };

  // Draw points of contact on the image
  const drawPointsOfContact = () => {
    if (!pointsCanvasRef.current) return;

    const canvas = pointsCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2;

    // Draw each point of contact
    pointsOfContact.forEach((point, index) => {
      const isSelected = selectedPointIndex === index;
      const angleRad = (point.angle - 90) * (Math.PI / 180); // -90 to start from top
      const widthRad = (point.width / 2) * (Math.PI / 180);

      // Calculate start and end angles for the arc
      const startAngle = angleRad - widthRad;
      const endAngle = angleRad + widthRad;

      // Draw the contact arc
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 5, startAngle, endAngle);
      ctx.lineWidth = isSelected ? 8 : 5;

      // Color based on damage multiplier
      const hue = Math.min(point.damageMultiplier * 60, 120); // 0=red, 120=green
      ctx.strokeStyle = isSelected
        ? `hsl(${hue}, 100%, 50%)`
        : `hsl(${hue}, 80%, 60%)`;
      ctx.stroke();

      // Draw arrow at the angle position
      const arrowX = centerX + (radius - 15) * Math.cos(angleRad);
      const arrowY = centerY + (radius - 15) * Math.sin(angleRad);

      ctx.save();
      ctx.translate(arrowX, arrowY);
      ctx.rotate(angleRad + Math.PI / 2);

      // Draw arrow
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(-5, 2);
      ctx.lineTo(5, 2);
      ctx.closePath();
      ctx.fillStyle = isSelected ? "#fff" : "#000";
      ctx.fill();

      // Draw point number
      ctx.restore();
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = isSelected ? "#fff" : "#000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText((index + 1).toString(), arrowX, arrowY);
    });
  };

  // Handle canvas click to add/select points
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!pointsCanvasRef.current) return;

    const canvas = pointsCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.width / 2;

    // Calculate angle from click position
    const dx = x - centerX;
    const dy = y - centerY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90; // +90 to start from top
    if (angle < 0) angle += 360;

    // Check if clicking near existing point
    const clickedIndex = pointsOfContact.findIndex((point) => {
      const angleDiff = Math.abs(point.angle - angle);
      return angleDiff < 15 || angleDiff > 345; // Within 15 degrees
    });

    if (clickedIndex !== -1) {
      setSelectedPointIndex(clickedIndex);
    } else if (isPlacingPoint) {
      // Add new point with default damage (equal distribution of remaining points)
      const remainingPoints = getRemainingDamagePoints();
      const defaultDamage =
        remainingPoints > 0
          ? 1.0 +
            Math.min(remainingPoints, 100 / (pointsOfContact.length + 1)) / 100
          : 1.0;

      const newPoint: PointOfContact = {
        angle: Math.round(angle),
        damageMultiplier: defaultDamage,
        width: 30,
      };
      const newPoints = [...pointsOfContact, newPoint];
      setPointsOfContact(newPoints);
      setSelectedPointIndex(newPoints.length - 1);
      setIsPlacingPoint(false);
      if (onPointsOfContactUpdated) {
        onPointsOfContactUpdated(newPoints);
      }
    }
  };

  // Update selected point property
  const updateSelectedPoint = (
    property: keyof PointOfContact,
    value: number
  ) => {
    if (selectedPointIndex === null) return;

    const newPoints = [...pointsOfContact];

    // If updating damage multiplier, ensure it doesn't exceed available points
    if (property === "damageMultiplier") {
      const currentPoint = newPoints[selectedPointIndex];
      const otherPointsTotal =
        newPoints
          .filter((_, i) => i !== selectedPointIndex)
          .reduce((sum, p) => sum + (p.damageMultiplier - 1.0), 0) * 100;

      const maxAllowed = 1.0 + (100 - otherPointsTotal) / 100;
      value = Math.min(value, maxAllowed);
      value = Math.max(value, 1.0); // Minimum 1.0x
    }

    newPoints[selectedPointIndex] = {
      ...newPoints[selectedPointIndex],
      [property]: value,
    };
    setPointsOfContact(newPoints);
    if (onPointsOfContactUpdated) {
      onPointsOfContactUpdated(newPoints);
    }
  };

  // Delete selected point
  const deleteSelectedPoint = () => {
    if (selectedPointIndex === null) return;

    const newPoints = pointsOfContact.filter(
      (_, i) => i !== selectedPointIndex
    );
    setPointsOfContact(newPoints);
    setSelectedPointIndex(null);
    if (onPointsOfContactUpdated) {
      onPointsOfContactUpdated(newPoints);
    }
  };

  // Update preview with scale
  const updateScaledPreview = () => {
    if (!previewUrl || !editCanvasRef.current) return;

    const canvas = editCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const size = 300;
      canvas.width = size;
      canvas.height = size;

      ctx.clearRect(0, 0, size, size);

      // Apply scale
      const scaleFactor = scale / 100;
      const scaledWidth = size * scaleFactor;
      const scaledHeight = size * scaleFactor;
      const x = (size - scaledWidth) / 2;
      const y = (size - scaledHeight) / 2;

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    };
    img.src = previewUrl;
  };

  // Update live preview with beyblade image and points
  const updateLivePreview = () => {
    if (!previewUrl || !livePreviewCanvasRef.current) return;

    const canvas = livePreviewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 200;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    const img = new Image();
    img.onload = () => {
      // Draw image in circular clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Apply scale
      const scaleFactor = scale / 100;
      const scaledWidth = size * scaleFactor;
      const scaledHeight = size * scaleFactor;
      const x = (size - scaledWidth) / 2;
      const y = (size - scaledHeight) / 2;

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      ctx.restore();

      // Draw points of contact on preview
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size / 2;

      pointsOfContact.forEach((point) => {
        const angleRad = (point.angle - 90) * (Math.PI / 180);
        const widthRad = (point.width / 2) * (Math.PI / 180);

        const startAngle = angleRad - widthRad;
        const endAngle = angleRad + widthRad;

        // Draw the contact arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 3, startAngle, endAngle);
        ctx.lineWidth = 4;

        // Color based on damage multiplier
        const hue = Math.min(point.damageMultiplier * 60, 120);
        ctx.strokeStyle = `hsl(${hue}, 90%, 60%)`;
        ctx.stroke();
      });

      // Draw radius indicator if beyblade data is available
      if (beybladeData?.radius) {
        const radiusScale = (beybladeData.radius / 50) * (size / 2); // Assuming max radius 50
        ctx.beginPath();
        ctx.arc(centerX, centerY, radiusScale, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(59, 130, 246, 0.5)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };
    img.crossOrigin = "anonymous";
    img.src = previewUrl;
  };

  // Update preview when scale changes
  useEffect(() => {
    if (step === "edit" && previewUrl) {
      updateScaledPreview();
      updateLivePreview();
    }
    if (step === "points" && previewUrl) {
      updateScaledPreview();
      updateLivePreview();
    }
  }, [scale, previewUrl, step, pointsOfContact, beybladeData]);

  // Draw circle guide when editing
  useEffect(() => {
    if (step === "edit" || step === "points") {
      drawCircleGuide();
    }
  }, [step]);

  // Draw points of contact when they change
  useEffect(() => {
    if (step === "points") {
      drawPointsOfContact();
    }
  }, [pointsOfContact, selectedPointIndex, step]);

  // Handle file selection
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    setSelectedFile(file);
    setError("");
    setScale(100); // Reset scale

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setStep("edit");
    };
    reader.readAsDataURL(file);
  };

  // Process image with all options
  const processImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError("");

    try {
      let processedFile: Blob = selectedFile;

      // Step 1: Convert to PNG if needed
      if (selectedFile.type === "image/svg+xml") {
        processedFile = await processSVG(selectedFile, 300);
      } else {
        processedFile = await convertToPNG(selectedFile);
      }

      // Step 2: Remove background if enabled
      if (removeBackgroundEnabled && selectedFile.type !== "image/svg+xml") {
        processedFile = await removeBackground(
          new File([processedFile], "image.png", { type: "image/png" }),
          backgroundTolerance
        );
      }

      // Step 3: Resize to 300x300
      processedFile = await resizeImage(processedFile, 300, fitMode);

      setProcessedBlob(processedFile);

      // Create preview URL
      const url = URL.createObjectURL(processedFile);
      setPreviewUrl(url);
      setStep("preview");

      // Draw circular preview
      if (previewCanvasRef.current) {
        createCircularPreview(url, previewCanvasRef.current, 300);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload to server
  const handleUpload = async () => {
    if (!processedBlob) return;

    setIsProcessing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", processedBlob, `beyblade-${beybladeId}.png`);
      formData.append("beybladeId", beybladeId);

      const response = await fetch("/api/beyblades/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onImageUploaded(data.imageUrl);
        setStep("select");
        setSelectedFile(null);
        setProcessedBlob(null);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset to start
  const handleReset = () => {
    setStep("select");
    setSelectedFile(null);
    setPreviewUrl(currentImageUrl || "");
    setProcessedBlob(null);
    setError("");
  };

  return (
    <div className="beyblade-image-uploader">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Step 1: Select File */}
      {step === "select" && (
        <div className="space-y-4">
          <div className="text-center">
            {currentImageUrl ? (
              <div className="mb-4">
                <img
                  src={currentImageUrl}
                  alt="Current Beyblade"
                  className="w-48 h-48 mx-auto object-contain rounded-full border-4 border-gray-200"
                />
              </div>
            ) : (
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No image</span>
              </div>
            )}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentImageUrl ? "Change Image" : "Upload Image"}
          </button>

          <div className="text-sm text-gray-600 text-center">
            <p>Upload a 300x300 image (PNG, JPG, SVG, or WebP)</p>
            <p>Max file size: 10MB</p>
          </div>
        </div>
      )}

      {/* Step 2: Edit Image */}
      {step === "edit" && (
        <div className="space-y-6">
          {/* Preview with Circle Guide and Live Preview Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Image Editor */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Image Editor
              </h3>
              <div className="relative text-center">
                <div className="relative inline-block">
                  {/* Image canvas (underneath) */}
                  <canvas
                    ref={editCanvasRef}
                    className="absolute top-0 left-0"
                    style={{ width: "300px", height: "300px" }}
                  />
                  {/* Circle guide overlay */}
                  <canvas
                    ref={overlayCanvasRef}
                    className="absolute top-0 left-0 pointer-events-none"
                    style={{ width: "300px", height: "300px" }}
                  />
                  {/* Display canvas (non-interactive) */}
                  <canvas
                    ref={pointsCanvasRef}
                    className="relative"
                    style={{
                      width: "300px",
                      height: "300px",
                      pointerEvents: "none",
                    }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Scale and adjust your image to fit within the circle
                </p>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Live Preview
              </h3>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border-2 border-gray-700">
                <div className="flex justify-center mb-4">
                  {/* Preview canvas with beyblade */}
                  <canvas
                    ref={livePreviewCanvasRef}
                    width="200"
                    height="200"
                    className="rounded-full border-4 border-blue-500 shadow-lg"
                  />
                </div>

                {/* Beyblade Stats */}
                {beybladeData && (
                  <div className="mt-4 space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="font-semibold text-white">
                        {beybladeData.displayName || "Unnamed"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="font-semibold capitalize text-white">
                        {beybladeData.type || "Balanced"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Spin:</span>
                      <span className="font-semibold capitalize text-white">
                        {beybladeData.spinDirection || "Right"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scale Control */}
          <div className="space-y-2 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <label className="flex items-center justify-between">
              <span className="text-sm font-semibold text-blue-900">Scale</span>
              <span className="text-lg font-bold text-blue-700">{scale}%</span>
            </label>
            <input
              type="range"
              min="10"
              max="200"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider-thumb-blue"
            />
            <div className="flex justify-between text-xs text-blue-600">
              <span>10%</span>
              <span>100%</span>
              <span>200%</span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900">Image Options</h3>

            {/* Background Removal */}
            {selectedFile?.type !== "image/svg+xml" && (
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={removeBackgroundEnabled}
                    onChange={(e) =>
                      setRemoveBackgroundEnabled(e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Remove Background (Recommended)
                  </span>
                </label>

                {removeBackgroundEnabled && (
                  <div className="ml-6 space-y-2">
                    <label className="text-xs text-gray-600">
                      Tolerance: {backgroundTolerance}
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={backgroundTolerance}
                      onChange={(e) =>
                        setBackgroundTolerance(Number(e.target.value))
                      }
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      Higher values remove more background (may remove parts of
                      the image)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Fit Mode */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Fit Mode
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="contain"
                    checked={fitMode === "contain"}
                    onChange={() => setFitMode("contain")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    Contain (fit inside)
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="cover"
                    checked={fitMode === "cover"}
                    onChange={() => setFitMode("cover")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    Cover (fill circle)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep("points")}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Next: Add Contact Points
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Contact Points Editor */}
      {step === "points" && (
        <div className="space-y-6">
          {/* Preview with Circle Guide and Live Preview Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Image Editor */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Contact Points Editor
              </h3>
              <div className="relative text-center">
                <div className="relative inline-block">
                  {/* Image canvas (underneath) */}
                  <canvas
                    ref={editCanvasRef}
                    className="absolute top-0 left-0"
                    style={{ width: "300px", height: "300px" }}
                  />
                  {/* Circle guide overlay */}
                  <canvas
                    ref={overlayCanvasRef}
                    className="absolute top-0 left-0 pointer-events-none"
                    style={{ width: "300px", height: "300px" }}
                  />
                  {/* Points of contact layer (interactive, on top) */}
                  <canvas
                    ref={pointsCanvasRef}
                    onClick={handleCanvasClick}
                    className="relative cursor-crosshair"
                    style={{ width: "300px", height: "300px" }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {isPlacingPoint
                    ? "Click on the image to place a contact point"
                    : "Click on existing points to edit them"}
                </p>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Live Preview
              </h3>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border-2 border-gray-700">
                <div className="flex justify-center mb-4">
                  {/* Preview canvas with beyblade */}
                  <canvas
                    ref={livePreviewCanvasRef}
                    width="200"
                    height="200"
                    className="rounded-full border-4 border-blue-500 shadow-lg"
                  />
                </div>

                {/* Beyblade Stats */}
                {beybladeData && (
                  <div className="mt-4 space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="font-semibold text-white">
                        {beybladeData.displayName || "Unnamed"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="font-semibold capitalize text-white">
                        {beybladeData.type || "Balanced"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Spin:</span>
                      <span className="font-semibold capitalize text-white">
                        {beybladeData.spinDirection || "Right"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Contact Points:</span>
                      <span className="font-semibold text-white">
                        {pointsOfContact.length}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Points of Contact Section */}
          <div className="space-y-4 bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-purple-900">
                Contact Points (Spikes) - {pointsOfContact.length} points
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={evenlyDistributePoints}
                  disabled={pointsOfContact.length === 0}
                  className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  title="Evenly distribute points around the beyblade"
                >
                  ⚖️ Distribute
                </button>
                <button
                  onClick={() => {
                    if (pointsOfContact.length < 10) {
                      setIsPlacingPoint(!isPlacingPoint);
                    }
                  }}
                  disabled={pointsOfContact.length >= 10}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isPlacingPoint
                      ? "bg-purple-600 text-white"
                      : pointsOfContact.length >= 10
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-purple-200 text-purple-900 hover:bg-purple-300"
                  }`}
                >
                  {isPlacingPoint ? "Cancel" : "+ Add Point"}
                </button>
              </div>
            </div>

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
                  disabled={pointsOfContact.length === 0}
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

              {getRemainingDamagePoints() > 5 && pointsOfContact.length > 0 && (
                <div className="bg-yellow-500 text-white p-2 rounded text-xs font-semibold">
                  💡 {getRemainingDamagePoints().toFixed(0)} points remaining -
                  increase damage or add more spikes!
                </div>
              )}
            </div>

            <div className="bg-blue-100 p-3 rounded-lg border border-blue-300">
              <p className="text-xs text-blue-900 font-semibold mb-1">
                ⚡ Damage System:
              </p>
              <p className="text-xs text-blue-800">
                • <strong>100 Bonus Points</strong> to distribute across spikes
                <br />• <strong>1 spike:</strong> Can set to 2.0x (uses all 100
                points)
                <br />• <strong>2 spikes:</strong> Each 1.5x (50 points each) or
                1.1x + 1.9x custom
                <br />• <strong>3 spikes:</strong> Each 1.33x or mix like 1.1x +
                1.1x + 1.8x
                <br />• <strong>Base damage:</strong> Always 1.0x when spike
                doesn't hit
                <br />• <strong>Spike hit:</strong> Base 1.0x + bonus = total
                damage multiplier
              </p>
            </div>

            {pointsOfContact.length === 0 && (
              <div className="text-center py-4 text-purple-600 text-sm">
                No contact points yet. Click "+ Add Point" to start.
                <br />
                <span className="text-xs text-purple-500">
                  You can add up to 10 contact points and distribute 100 damage
                  points.
                </span>
              </div>
            )}

            {/* List of all contact points */}
            {pointsOfContact.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <h4 className="text-xs font-semibold text-purple-800 sticky top-0 bg-purple-50 py-1">
                  All Contact Points - Click to edit
                </h4>
                {pointsOfContact.map((point, index) => {
                  const bonusPoints = (point.damageMultiplier - 1.0) * 100;
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
                            const newPoints = pointsOfContact.filter(
                              (_, i) => i !== index
                            );
                            setPointsOfContact(newPoints);
                            setSelectedPointIndex(null);
                            if (onPointsOfContactUpdated) {
                              onPointsOfContactUpdated(newPoints);
                            }
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
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="360"
                                  value={point.angle}
                                  onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (value >= 0 && value <= 360) {
                                      updateSelectedPoint("angle", value);
                                    }
                                  }}
                                  className="w-16 px-2 py-1 text-xs border border-purple-300 rounded text-center font-bold text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <span className="text-purple-600 font-bold">
                                  °
                                </span>
                              </div>
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
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="1.0"
                                  max="2.0"
                                  step="0.01"
                                  value={point.damageMultiplier.toFixed(2)}
                                  onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (value >= 1.0 && value <= 2.0) {
                                      updateSelectedPoint(
                                        "damageMultiplier",
                                        value
                                      );
                                    }
                                  }}
                                  className="w-16 px-2 py-1 text-xs border border-orange-300 rounded text-center font-bold text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <span className="text-orange-600 font-bold text-xs">
                                  x (
                                  {(
                                    (point.damageMultiplier - 1.0) *
                                    100
                                  ).toFixed(0)}{" "}
                                  pts)
                                </span>
                              </div>
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
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="10"
                                  max="90"
                                  value={point.width}
                                  onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (value >= 10 && value <= 90) {
                                      updateSelectedPoint("width", value);
                                    }
                                  }}
                                  className="w-16 px-2 py-1 text-xs border border-purple-300 rounded text-center font-bold text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <span className="text-purple-600 font-bold">
                                  °
                                </span>
                              </div>
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

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep("edit")}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Back to Image
            </button>
            <button
              onClick={processImage}
              disabled={isProcessing || pointsOfContact.length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Next: Preview & Upload"}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Preview & Upload */}
      {step === "preview" && (
        <div className="space-y-6">
          {/* Circular Preview */}
          <div className="text-center">
            <canvas
              ref={previewCanvasRef}
              className="mx-auto rounded-full shadow-lg"
            />
            <p className="mt-2 text-sm text-gray-600">
              Preview (as it will appear in-game)
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Start Over
            </button>
            <button
              onClick={() => setStep("edit")}
              className="flex-1 px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              Edit Again
            </button>
            <button
              onClick={handleUpload}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
