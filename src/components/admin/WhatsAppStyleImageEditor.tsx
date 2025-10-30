/**
 * WhatsApp-Style Image Editor for Beyblade
 * Drag to reposition, pinch/scroll to zoom
 * Mobile-friendly with touch support
 */

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface WhatsAppStyleImageEditorProps {
  imageUrl: string;
  onPositionChange: (position: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }) => void;
  initialPosition?: { x: number; y: number; scale: number; rotation: number };
  circleSize?: number; // Size of the circular viewport in pixels
  onSave?: () => void;
  onCancel?: () => void;
}

export default function WhatsAppStyleImageEditor({
  imageUrl,
  onPositionChange,
  initialPosition = { x: 0, y: 0, scale: 1, rotation: 0 },
  circleSize = 300,
  onSave,
  onCancel,
}: WhatsAppStyleImageEditorProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load image dimensions
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setImageLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Update position callback (only on actual position changes)
  useEffect(() => {
    onPositionChange(position);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position.x, position.y, position.scale, position.rotation]);

  // Draw to canvas for preview
  useEffect(() => {
    if (!canvasRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save context
      ctx.save();

      // Create circular clipping path
      ctx.beginPath();
      ctx.arc(circleSize / 2, circleSize / 2, circleSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Calculate image size and position with proper aspect ratio
      const aspectRatio = img.width / img.height;
      let scaledWidth, scaledHeight;

      if (aspectRatio > 1) {
        // Landscape image
        scaledWidth = circleSize * position.scale;
        scaledHeight = scaledWidth / aspectRatio;
      } else {
        // Portrait or square image
        scaledHeight = circleSize * position.scale;
        scaledWidth = scaledHeight * aspectRatio;
      }

      // Convert position from -2 to 2 range to pixel offset
      const offsetX = position.x * (circleSize / 4);
      const offsetY = position.y * (circleSize / 4);

      // Translate to center, apply rotation, then position
      ctx.translate(circleSize / 2 + offsetX, circleSize / 2 + offsetY);
      ctx.rotate((position.rotation * Math.PI) / 180);

      const x = -scaledWidth / 2;
      const y = -scaledHeight / 2;

      // Draw image
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      // Restore context
      ctx.restore();

      // Draw red circle border
      ctx.beginPath();
      ctx.arc(circleSize / 2, circleSize / 2, circleSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 4;
      ctx.stroke();
    };
    img.src = imageUrl;
  }, [imageUrl, position, circleSize, imageLoaded]);

  // Handle mouse/touch start
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x * (circleSize / 4),
        y: e.clientY - position.y * (circleSize / 4),
      });
    },
    [position, circleSize]
  );

  // Handle mouse/touch move
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      e.preventDefault();

      // Calculate new position
      const newX = (e.clientX - dragStart.x) / (circleSize / 4);
      const newY = (e.clientY - dragStart.y) / (circleSize / 4);

      // Clamp position to reasonable bounds
      const clampedX = Math.max(-4, Math.min(4, newX));
      const clampedY = Math.max(-4, Math.min(4, newY));

      setPosition((prev) => ({
        ...prev,
        x: clampedX,
        y: clampedY,
      }));
    },
    [isDragging, dragStart, circleSize]
  );

  // Handle mouse/touch end
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setPosition((prev) => ({
      ...prev,
      scale: Math.max(0.5, Math.min(3, prev.scale + delta)),
    }));
  }, []);

  // Handle pinch zoom on mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let initialDistance = 0;
    let initialScale = position.scale;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        initialScale = position.scale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const scale = (currentDistance / initialDistance) * initialScale;
        setPosition((prev) => ({
          ...prev,
          scale: Math.max(0.5, Math.min(3, scale)),
        }));
      }
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [position.scale]);

  // Zoom controls
  const handleZoomIn = () => {
    setPosition((prev) => ({
      ...prev,
      scale: Math.min(3, prev.scale + 0.1),
    }));
  };

  const handleZoomOut = () => {
    setPosition((prev) => ({
      ...prev,
      scale: Math.max(0.5, prev.scale - 0.1),
    }));
  };

  const handleRotate = () => {
    setPosition((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  const handleReset = () => {
    setPosition({ x: 0, y: 0, scale: 1, rotation: 0 });
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-black rounded-lg">
      {/* Header */}
      <div className="w-full flex justify-between items-center text-white">
        <button
          onClick={onCancel}
          className="text-lg hover:text-gray-300 transition-colors"
        >
          ✕ Cancel
        </button>
        <h3 className="text-lg font-semibold">Drag the image to adjust</h3>
        <button
          onClick={onSave}
          className="text-lg text-blue-400 hover:text-blue-300 transition-colors"
        >
          ✓ Upload
        </button>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="relative touch-none select-none"
        style={{
          width: `${circleSize}px`,
          height: `${circleSize}px`,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          width={circleSize}
          height={circleSize}
          className="rounded-lg"
        />
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-4 bg-gray-800 rounded-full px-6 py-3">
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 flex items-center justify-center text-white text-2xl hover:bg-gray-700 rounded-full transition-colors"
          disabled={position.scale <= 0.5}
        >
          −
        </button>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={position.scale}
            onChange={(e) =>
              setPosition((prev) => ({
                ...prev,
                scale: parseFloat(e.target.value),
              }))
            }
            className="w-32 md:w-48 accent-blue-500"
          />
          <span className="text-white text-sm font-medium min-w-[3rem]">
            {Math.round(position.scale * 100)}%
          </span>
        </div>

        <button
          onClick={handleZoomIn}
          className="w-10 h-10 flex items-center justify-center text-white text-2xl hover:bg-gray-700 rounded-full transition-colors"
          disabled={position.scale >= 3}
        >
          +
        </button>
      </div>

      {/* Rotation Control */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleRotate}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          🔄 Rotate
          <span className="text-xs text-gray-400">({position.rotation}°)</span>
        </button>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="text-white text-sm hover:text-gray-300 transition-colors"
      >
        Reset Position & Rotation
      </button>

      {/* Instructions */}
      <div className="text-center text-gray-400 text-sm space-y-1">
        <p>Drag to reposition • Scroll or pinch to zoom • Click rotate</p>
        <p className="text-xs">Position will be saved with the beyblade</p>
      </div>
    </div>
  );
}
