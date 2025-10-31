"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ImageCropperProps {
  imageUrl: string;
  targetWidth?: number;
  targetHeight?: number;
}

interface ImageCropperRef {
  getCroppedImage: () => Promise<Blob>;
}

const ImageCropper = forwardRef<ImageCropperRef, ImageCropperProps>(
  ({ imageUrl, targetWidth = 400, targetHeight = 400 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageLoaded, setImageLoaded] = useState(false);

    // Load and draw image
    useEffect(() => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = imageUrl;

      image.onload = () => {
        imageRef.current = image;
        setImageLoaded(true);
        centerImage(image);
      };

      return () => {
        imageRef.current = null;
      };
    }, [imageUrl]);

    // Center image initially
    const centerImage = (image: HTMLImageElement) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const scale = Math.max(
        targetWidth / image.width,
        targetHeight / image.height
      );
      setZoom(scale);
      setPosition({ x: 0, y: 0 });
    };

    // Draw on canvas
    const drawImage = useCallback(() => {
      const canvas = canvasRef.current;
      const image = imageRef.current;
      if (!canvas || !image || !imageLoaded) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, targetWidth, targetHeight);

      // Calculate scaled dimensions
      const scaledWidth = image.width * zoom;
      const scaledHeight = image.height * zoom;

      // Calculate position (centered + offset)
      const x = (targetWidth - scaledWidth) / 2 + position.x;
      const y = (targetHeight - scaledHeight) / 2 + position.y;

      // Draw image
      ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
    }, [zoom, position, imageLoaded, targetWidth, targetHeight]);

    // Redraw when zoom or position changes
    useEffect(() => {
      drawImage();
    }, [drawImage]);

    // Handle mouse down
    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    // Handle mouse move
    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      setPosition({ x: newX, y: newY });
    };

    // Handle mouse up
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Handle touch events for mobile
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
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;

      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    // Zoom controls
    const handleZoomIn = () => {
      setZoom((prev) => Math.min(prev + 0.1, 3));
    };

    const handleZoomOut = () => {
      setZoom((prev) => Math.max(prev - 0.1, 0.1));
    };

    const handleReset = () => {
      if (imageRef.current) {
        centerImage(imageRef.current);
      }
    };

    // Get cropped image as blob
    const getCroppedImage = (): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const canvas = canvasRef.current;
        if (!canvas) {
          reject(new Error("Canvas not found"));
          return;
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          "image/jpeg",
          0.95
        );
      });
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      getCroppedImage,
    }));

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Adjust Image (Drag to move, scroll to zoom)
          </h3>

          {/* Canvas Preview */}
          <div className="flex justify-center">
            <div
              className={`relative border-2 border-blue-500 dark:border-blue-400 rounded overflow-hidden ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              style={{
                width: targetWidth,
                height: targetHeight,
                touchAction: "none",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <canvas
                ref={canvasRef}
                width={targetWidth}
                height={targetHeight}
                className="block w-full h-full"
              />

              {/* Size indicator */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {targetWidth} × {targetHeight}
              </div>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 0.1}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom out"
              >
                <ZoomOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>

              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                title={`Zoom: ${Math.round(zoom * 100)}%`}
              />

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom in"
              >
                <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Reset"
              >
                <RotateCcw className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Drag to reposition • Scroll or use slider to zoom • Click reset to
              center
            </p>
          </div>
        </div>
      </div>
    );
  }
);

ImageCropper.displayName = "ImageCropper";

export default ImageCropper;
export type { ImageCropperProps, ImageCropperRef };
