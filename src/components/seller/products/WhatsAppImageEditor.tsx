"use client";

import React, { useState, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import Cropper from "react-easy-crop";

interface Point {
  x: number;
  y: number;
}

interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface WhatsAppCropData {
  crop: Point;
  zoom: number;
  croppedAreaPixels: Area;
}

interface WhatsAppImageEditorProps {
  open: boolean;
  imageUrl: string;
  initialCrop?: Point;
  initialZoom?: number;
  onClose: () => void;
  onSave: (cropData: WhatsAppCropData) => void;
}

/**
 * Create canvas from cropped area
 */
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

/**
 * Get cropped image as blob
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Set canvas size to 800x800 (WhatsApp format)
  const targetSize = 800;
  canvas.width = targetSize;
  canvas.height = targetSize;

  // Draw white background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Calculate scaling to fit the cropped area into 800x800
  const scaleX = targetSize / pixelCrop.width;
  const scaleY = targetSize / pixelCrop.height;
  const scale = Math.min(scaleX, scaleY);

  // Calculate position to center the image
  const offsetX = (targetSize - pixelCrop.width * scale) / 2;
  const offsetY = (targetSize - pixelCrop.height * scale) / 2;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    offsetX,
    offsetY,
    pixelCrop.width * scale,
    pixelCrop.height * scale
  );

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Canvas is empty"));
      }
    }, "image/jpeg");
  });
}

export default function WhatsAppImageEditor({
  open,
  imageUrl,
  initialCrop,
  initialZoom,
  onClose,
  onSave,
}: WhatsAppImageEditorProps) {
  const [crop, setCrop] = useState<Point>(initialCrop || { x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialZoom || 1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      setSaving(true);
      // Save crop data instead of generating image
      onSave({
        crop,
        zoom,
        croppedAreaPixels,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                WhatsApp Image Editor (800x800)
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Drag image to position • Scroll or use slider to zoom
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="relative w-full h-[500px] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              minZoom={0.1}
              maxZoom={3}
              zoomSpeed={0.5}
              restrictPosition={false}
              style={{
                containerStyle: {
                  backgroundColor: "#f0f0f0",
                  cursor: "move",
                },
                cropAreaStyle: {
                  border: "2px solid #25D366",
                  boxShadow: "0 0 20px rgba(37, 211, 102, 0.3)",
                },
                mediaStyle: {
                  cursor: "grab",
                },
              }}
            />
            {/* 800x800 Frame Overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border-3 border-dashed border-[#25D366] pointer-events-none flex items-start justify-center pt-4 shadow-[inset_0_0_30px_rgba(37,211,102,0.1)]">
              <span className="bg-[#25D366] text-white px-3 py-1 rounded text-xs font-semibold">
                📱 800x800 WhatsApp Frame
              </span>
            </div>

            {/* Drag Instruction Overlay */}
            {zoom === (initialZoom || 1) && crop.x === 0 && crop.y === 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg pointer-events-none flex items-center gap-2">
                <span className="text-sm">👆 Drag image to reposition</span>
              </div>
            )}
          </div>

          {/* Zoom Control */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Zoom: {zoom.toFixed(1)}x (0.1x - 3x)
              </label>
            </div>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#25D366]"
              style={{
                background: `linear-gradient(to right, #25D366 0%, #25D366 ${
                  ((zoom - 0.1) / 2.9) * 100
                }%, rgb(229 231 235) ${
                  ((zoom - 0.1) / 2.9) * 100
                }%, rgb(229 231 235) 100%)`,
              }}
            />
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            <strong>Drag</strong> the image to adjust position.{" "}
            <strong>Zoom</strong> in/out to fit your content. Settings are saved
            without uploading.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[#25D366] hover:bg-[#128C7E] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving..." : "Save Crop Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
