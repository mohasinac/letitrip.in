"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Crosshair,
  Crop,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { EditorState, MediaFile } from "@/types/media";
import { applyImageEdits } from "@/lib/media/image-processor";
import Image from "next/image";
import Cropper, { Area, Point } from "react-easy-crop";

interface ImageEditorProps {
  media: MediaFile;
  onSave: (editedMedia: MediaFile) => void;
  onCancel: () => void;
  showFocusPoint?: boolean;
  aspectRatio?: number;
}

// Aspect ratio presets
const ASPECT_RATIOS = [
  { label: "Free", value: undefined },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:4", value: 3 / 4 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
] as const;

export default function ImageEditor({
  media,
  onSave,
  onCancel,
  showFocusPoint = true,
  aspectRatio: initialAspectRatio,
}: ImageEditorProps) {
  const [editorState, setEditorState] = useState<EditorState>({
    rotation: 0,
    flip: {
      horizontal: false,
      vertical: false,
    },
    zoom: 1,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    filter: "none",
    focusPoint: { x: 50, y: 50 },
  });

  // Crop state
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(
    initialAspectRatio
  );

  // Editor mode: 'crop' | 'adjust' | 'focus'
  const [activeTab, setActiveTab] = useState<"crop" | "adjust" | "focus">(
    "crop"
  );

  const [previewUrl, setPreviewUrl] = useState<string>(media.preview);
  const [isProcessing, setIsProcessing] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Update preview when editor state changes
  useEffect(() => {
    updatePreview();
  }, [editorState]);

  const updatePreview = async () => {
    try {
      const editedBlob = await applyImageEdits(media.file, editorState);
      const url = URL.createObjectURL(editedBlob);
      setPreviewUrl(url);
    } catch (error) {
      console.error("Error updating preview:", error);
    }
  };

  // Handle crop complete
  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Create cropped image from canvas
  const getCroppedImage = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = new window.Image();
    image.src = imageSrc;
    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Could not create blob"));
        },
        "image/jpeg",
        0.92
      );
    });
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      let processedBlob: Blob;

      // First apply crop if we have crop data
      if (croppedAreaPixels) {
        processedBlob = await getCroppedImage(media.preview, croppedAreaPixels);
        // Then apply other edits on the cropped image
        const croppedFile = new File([processedBlob], media.file.name, {
          type: "image/jpeg",
        });
        processedBlob = await applyImageEdits(croppedFile, editorState);
      } else {
        // No crop, just apply edits
        processedBlob = await applyImageEdits(media.file, editorState);
      }

      const editedFile = new File([processedBlob], media.file.name, {
        type: "image/jpeg",
      });

      const editedMedia: MediaFile = {
        ...media,
        file: editedFile,
        preview: URL.createObjectURL(processedBlob),
        metadata: {
          ...media.metadata!,
          size: editedFile.size,
          focusX: editorState.focusPoint?.x ?? 50,
          focusY: editorState.focusPoint?.y ?? 50,
        },
      };

      onSave(editedMedia);
    } catch (error) {
      console.error("Error saving edits:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const rotate = () => {
    setEditorState((prev) => ({
      ...prev,
      rotation: ((prev.rotation || 0) + 90) % 360,
    }));
  };

  const flipHorizontal = () => {
    setEditorState((prev) => ({
      ...prev,
      flip: {
        ...prev.flip,
        horizontal: !prev.flip.horizontal,
      },
    }));
  };

  const flipVertical = () => {
    setEditorState((prev) => ({
      ...prev,
      flip: {
        ...prev.flip,
        vertical: !prev.flip.vertical,
      },
    }));
  };

  const updateAdjustment = (
    key: "brightness" | "contrast" | "saturation",
    value: number
  ) => {
    setEditorState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateFilter = (filter: EditorState["filter"]) => {
    setEditorState((prev) => ({
      ...prev,
      filter,
    }));
  };

  const resetAll = () => {
    setEditorState({
      rotation: 0,
      flip: {
        horizontal: false,
        vertical: false,
      },
      zoom: 1,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      filter: "none",
      focusPoint: { x: 50, y: 50 },
    });
    setCrop({ x: 0, y: 0 });
    setCropZoom(1);
    setCroppedAreaPixels(null);
    setAspectRatio(initialAspectRatio);
    setFocusMode(false);
    setActiveTab("crop");
  };

  // Handle focus point click
  const handleFocusClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!focusMode || !imageContainerRef.current) return;

      const rect = imageContainerRef.current.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

      setEditorState((prev) => ({
        ...prev,
        focusPoint: {
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
        },
      }));
    },
    [focusMode]
  );

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between p-4 bg-black/50 border-b border-white/10">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">Edit Image</h2>
          {/* Tab Buttons */}
          <div className="flex gap-1 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("crop")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === "crop"
                  ? "bg-white text-black"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <Crop className="w-4 h-4" />
              Crop
            </button>
            <button
              onClick={() => setActiveTab("adjust")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "adjust"
                  ? "bg-white text-black"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Adjust
            </button>
            {showFocusPoint && (
              <button
                onClick={() => setActiveTab("focus")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === "focus"
                    ? "bg-white text-black"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Crosshair className="w-4 h-4" />
                Focus
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetAll}
            className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
          >
            Reset
          </button>
          <button
            onClick={onCancel}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 relative">
          {/* Crop Mode */}
          {activeTab === "crop" && (
            <div className="absolute inset-0">
              <Cropper
                image={media.preview}
                crop={crop}
                zoom={cropZoom}
                aspect={aspectRatio}
                rotation={editorState.rotation}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setCropZoom}
                showGrid
                classes={{
                  containerClassName: "!bg-black",
                  cropAreaClassName: "!border-2 !border-blue-500",
                }}
              />
            </div>
          )}

          {/* Adjust Mode */}
          {activeTab === "adjust" && (
            <div className="flex items-center justify-center p-8 h-full">
              <div className="relative max-w-full max-h-full">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    transform: `rotate(${editorState.rotation}deg) scaleX(${
                      editorState.flip.horizontal ? -1 : 1
                    }) scaleY(${editorState.flip.vertical ? -1 : 1})`,
                  }}
                />
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* Focus Mode */}
          {activeTab === "focus" && (
            <div className="flex items-center justify-center p-8 h-full">
              <div
                ref={imageContainerRef}
                className="relative max-w-full max-h-full cursor-crosshair"
                onClick={handleFocusClick}
              >
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain"
                />
                {/* Focus Point Indicator */}
                {editorState.focusPoint && (
                  <div
                    className="absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                      left: `${editorState.focusPoint.x}%`,
                      top: `${editorState.focusPoint.y}%`,
                    }}
                  >
                    <div
                      className="w-full h-full border-2 border-white rounded-full animate-pulse"
                      style={{
                        boxShadow:
                          "0 0 0 3px rgba(59, 130, 246, 0.8), inset 0 0 0 1px rgba(255,255,255,0.5)",
                      }}
                    >
                      <Crosshair className="w-full h-full text-white p-1.5" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="w-80 bg-gray-900 overflow-y-auto p-6 space-y-6">
          {/* Crop Controls */}
          {activeTab === "crop" && (
            <>
              {/* Aspect Ratio */}
              <div>
                <h3 className="text-white font-medium mb-3">Aspect Ratio</h3>
                <div className="grid grid-cols-3 gap-2">
                  {ASPECT_RATIOS.map((ar) => (
                    <button
                      key={ar.label}
                      onClick={() => setAspectRatio(ar.value)}
                      className={`p-3 rounded-lg transition-colors text-white text-xs ${
                        aspectRatio === ar.value
                          ? "bg-blue-600"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      {ar.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zoom */}
              <div>
                <h3 className="text-white font-medium mb-3">Zoom</h3>
                <div className="flex items-center gap-3">
                  <ZoomOut className="w-5 h-5 text-gray-400" />
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={cropZoom}
                    onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <ZoomIn className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-500 text-xs mt-2 text-center">
                  {Math.round(cropZoom * 100)}%
                </p>
              </div>

              {/* Rotation */}
              <div>
                <h3 className="text-white font-medium mb-3">Rotation</h3>
                <div className="flex gap-2">
                  <button
                    onClick={rotate}
                    className="flex-1 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-5 h-5" />
                    <span className="text-sm">Rotate 90°</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Adjust Controls */}
          {activeTab === "adjust" && (
            <>
              {/* Transform */}
              <div>
                <h3 className="text-white font-medium mb-3">Transform</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={rotate}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white flex flex-col items-center gap-1"
                  >
                    <RotateCw className="w-5 h-5" />
                    <span className="text-xs">Rotate</span>
                  </button>
                  <button
                    onClick={flipHorizontal}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white flex flex-col items-center gap-1"
                  >
                    <FlipHorizontal className="w-5 h-5" />
                    <span className="text-xs">Flip H</span>
                  </button>
                  <button
                    onClick={flipVertical}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white flex flex-col items-center gap-1"
                  >
                    <FlipVertical className="w-5 h-5" />
                    <span className="text-xs">Flip V</span>
                  </button>
                </div>
              </div>

              {/* Adjustments */}
              <div>
                <h3 className="text-white font-medium mb-3">Adjustments</h3>
                <div className="space-y-4">
                  {/* Brightness */}
                  <div>
                    <label
                      htmlFor="editor-brightness"
                      className="text-white text-sm mb-2 flex justify-between"
                    >
                      <span>Brightness</span>
                      <span>{editorState.brightness}</span>
                    </label>
                    <input
                      id="editor-brightness"
                      type="range"
                      min="-100"
                      max="100"
                      value={editorState.brightness}
                      onChange={(e) =>
                        updateAdjustment("brightness", parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <label
                      htmlFor="editor-contrast"
                      className="text-white text-sm mb-2 flex justify-between"
                    >
                      <span>Contrast</span>
                      <span>{editorState.contrast}</span>
                    </label>
                    <input
                      id="editor-contrast"
                      type="range"
                      min="-100"
                      max="100"
                      value={editorState.contrast}
                      onChange={(e) =>
                        updateAdjustment("contrast", parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <label
                      htmlFor="editor-saturation"
                      className="text-white text-sm mb-2 flex justify-between"
                    >
                      <span>Saturation</span>
                      <span>{editorState.saturation}</span>
                    </label>
                    <input
                      id="editor-saturation"
                      type="range"
                      min="-100"
                      max="100"
                      value={editorState.saturation}
                      onChange={(e) =>
                        updateAdjustment("saturation", parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div>
                <h3 className="text-white font-medium mb-3">Filters</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      "none",
                      "grayscale",
                      "sepia",
                      "vintage",
                      "cold",
                      "warm",
                    ] as const
                  ).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => updateFilter(filter)}
                      className={`p-3 rounded-lg transition-colors text-white text-xs capitalize ${
                        editorState.filter === filter
                          ? "bg-blue-600"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Focus Controls */}
          {activeTab === "focus" && (
            <>
              <div>
                <h3 className="text-white font-medium mb-3">
                  Mobile Focus Point
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Click on the image to set the focus point. This area will be
                  prioritized when the image is displayed on smaller screens.
                </p>
                {editorState.focusPoint && (
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-white text-sm text-center">
                      Focus at:{" "}
                      <span className="font-mono text-blue-400">
                        {editorState.focusPoint.x}%, {editorState.focusPoint.y}%
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Preview at different sizes */}
              <div>
                <h3 className="text-white font-medium mb-3">Preview</h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">Desktop (Full)</p>
                    <div className="w-full aspect-video overflow-hidden rounded bg-gray-800">
                      <Image
                        src={previewUrl}
                        alt="Desktop preview"
                        width={320}
                        height={180}
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: `${
                            editorState.focusPoint?.x || 50
                          }% ${editorState.focusPoint?.y || 50}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">
                      Mobile (Cropped to focus)
                    </p>
                    <div className="w-24 h-24 mx-auto overflow-hidden rounded bg-gray-800">
                      <Image
                        src={previewUrl}
                        alt="Mobile preview"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: `${
                            editorState.focusPoint?.x || 50
                          }% ${editorState.focusPoint?.y || 50}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-4 bg-black/50 border-t border-white/10">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isProcessing}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
        >
          {isProcessing ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
