"use client";

import {
  Check,
  Move,
  RotateCw,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

interface ImageUploadWithCropProps {
  onUpload: (file: File, cropData?: CropData) => Promise<void>;
  maxSize?: number;
  aspectRatio?: number;
  className?: string;
  autoDelete?: boolean;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
  rotation: number;
}

export function ImageUploadWithCrop({
  onUpload,
  maxSize = 5 * 1024 * 1024, // 5MB
  aspectRatio,
  className = "",
  autoDelete = false,
}: ImageUploadWithCropProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        setError(
          `File size must be less than ${(maxSize / (1024 * 1024)).toFixed(
            0
          )}MB`
        );
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
        setZoom(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    },
    [maxSize]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const cropData: CropData = {
        x: position.x,
        y: position.y,
        width: imageRef.current?.naturalWidth || 0,
        height: imageRef.current?.naturalHeight || 0,
        zoom,
        rotation,
      };

      await onUpload(selectedFile, cropData);

      // Reset after successful upload
      setSelectedFile(null);
      setPreview(null);
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {!preview ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload-input"
          />
          <label
            htmlFor="image-upload-input"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 font-medium">
              Click to upload image
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Max size: {(maxSize / (1024 * 1024)).toFixed(0)}MB
            </p>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview Area */}
          <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
            <img
              ref={imageRef}
              src={preview}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-contain cursor-move select-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              draggable={false}
            />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 rounded-lg">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>

            <div className="flex-1 min-w-[100px]">
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-600 text-center mt-1">
                {(zoom * 100).toFixed(0)}%
              </p>
            </div>

            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            <button
              onClick={() => setRotation((rotation + 90) % 360)}
              className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              title="Rotate"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setPosition({ x: 0, y: 0 })}
              className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              title="Reset Position"
            >
              <Move className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Upload
                </>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
