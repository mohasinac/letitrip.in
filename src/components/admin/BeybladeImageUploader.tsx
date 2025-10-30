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

interface BeybladeImageUploaderProps {
  currentImageUrl?: string;
  beybladeId: string;
  onImageUploaded: (imageUrl: string) => void;
}

export default function BeybladeImageUploader({
  currentImageUrl,
  beybladeId,
  onImageUploaded,
}: BeybladeImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || "");
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<"select" | "edit" | "preview">("select");

  // Image editing options
  const [removeBackgroundEnabled, setRemoveBackgroundEnabled] = useState(true);
  const [backgroundTolerance, setBackgroundTolerance] = useState(10);
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const editCanvasRef = useRef<HTMLCanvasElement>(null);

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
          {/* Preview */}
          <div className="text-center">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-64 h-64 mx-auto object-contain border-2 border-gray-300 rounded-lg"
            />
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
                    Remove Background
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
              onClick={processImage}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Process Image"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Upload */}
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
