/**
 * Beyblade Preview Component
 * Displays live preview of Beyblade with special move animation
 * Uses resolution-based sizing: 1cm = ARENA_RESOLUTION / 45 pixels
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { BeybladeStats } from "@/types/beybladeStats";
import { 
  getBeybladeDisplayRadius, 
  getBeybladePreviewScale,
  BEYBLADE_PREVIEW_SETTINGS 
} from "@/constants/beybladeConstants";
import { ARENA_RESOLUTION } from "@/types/arenaConfigNew";

interface BeybladePreviewProps {
  beyblade: BeybladeStats;
  onCanvasClick?: (angle: number) => void;
  clickMode?: boolean;
}

const BeybladePreview: React.FC<BeybladePreviewProps> = ({
  beyblade,
  onCanvasClick,
  clickMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const animationFrameRef = useRef<number>();
  const rotationRef = useRef(0);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSpinning, setIsSpinning] = useState(true);
  const [zoom, setZoom] = useState(100);
  
  // High-res canvas size (2x for retina displays)
  const CANVAS_RESOLUTION = 800; // High resolution for crisp rendering
  const DISPLAY_SIZE = 400; // Display size in pixels

  // Auto-pause spinning when in click mode (placing contact points)
  // Also reset rotation to 0 for accurate spike placement
  useEffect(() => {
    if (clickMode) {
      setIsSpinning(false);
      rotationRef.current = 0; // Reset rotation to 0 for accurate clicks
    }
  }, [clickMode]);

  // Handle canvas click for spike placement
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!clickMode || !onCanvasClick) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Account for canvas resolution vs display size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX - canvas.width / 2;
    const y = (e.clientY - rect.top) * scaleY - canvas.height / 2;

    // Calculate angle from center
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle = (angle + 360) % 360; // Normalize to 0-360

    onCanvasClick(angle);
  };

  // Load beyblade image
  useEffect(() => {
    if (beyblade.imageUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageRef.current = img;
        setImageLoaded(true);
      };
      img.onerror = () => {
        console.error("Failed to load beyblade image:", beyblade.imageUrl);
        setImageLoaded(false);
      };
      img.src = beyblade.imageUrl;
    } else {
      setImageLoaded(false);
    }
  }, [beyblade.imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stadium background
      ctx.fillStyle = BEYBLADE_PREVIEW_SETTINGS.BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw center circle (reference) - scale to canvas resolution
      const scaleFactor = canvas.width / DISPLAY_SIZE;
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2, 
        canvas.height / 2, 
        BEYBLADE_PREVIEW_SETTINGS.CENTER_CIRCLE_RADIUS * scaleFactor, 
        0, 
        Math.PI * 2
      );
      ctx.strokeStyle = BEYBLADE_PREVIEW_SETTINGS.GRID_COLOR;
      ctx.lineWidth = 2 * scaleFactor;
      ctx.stroke();

      // Calculate beyblade size using resolution-based system
      // 1 cm = ARENA_RESOLUTION / 45 pixels
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Get display radius from beyblade's radius in cm
      const baseRadiusPixels = getBeybladeDisplayRadius(beyblade.radius);
      
      // Scale to preview canvas (which is smaller than full arena)
      const previewScale = getBeybladePreviewScale(DISPLAY_SIZE);
      const displayRadius = baseRadiusPixels * previewScale * (zoom / 100) * scaleFactor;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationRef.current);

      // If image is loaded, draw it in a circular clip
      if (imageLoaded && imageRef.current) {
        // Get image position settings (WhatsApp-style positioning)
        const imagePos = beyblade.imagePosition || {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
        };

        // Create circular clipping path
        ctx.beginPath();
        ctx.arc(0, 0, displayRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Apply image rotation (in addition to beyblade spin rotation)
        ctx.rotate((imagePos.rotation * Math.PI) / 180);

        // Calculate image size with proper aspect ratio
        const img = imageRef.current;
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        let imgWidth, imgHeight;

        if (aspectRatio > 1) {
          // Landscape image
          imgWidth = (displayRadius * 2) * imagePos.scale;
          imgHeight = imgWidth / aspectRatio;
        } else {
          // Portrait or square image
          imgHeight = (displayRadius * 2) * imagePos.scale;
          imgWidth = imgHeight * aspectRatio;
        }

        // Calculate position offset from center
        // imagePos x and y are from -4 to 4, convert to pixels
        const offsetX = imagePos.x * (displayRadius / 2);
        const offsetY = imagePos.y * (displayRadius / 2);

        // Draw the image with position, scale, and rotation
        ctx.drawImage(
          imageRef.current,
          -imgWidth / 2 + offsetX,
          -imgHeight / 2 + offsetY,
          imgWidth,
          imgHeight
        );

        // Reset clipping
        ctx.restore();
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotationRef.current);

        // Draw border around the image
        ctx.beginPath();
        ctx.arc(0, 0, displayRadius, 0, Math.PI * 2);
        ctx.strokeStyle = getTypeColor(beyblade.type);
        ctx.lineWidth = 4 * scaleFactor;
        ctx.stroke();
      } else {
        // Fallback: Draw colored circle with type indicator
        ctx.beginPath();
        ctx.arc(0, 0, displayRadius, 0, Math.PI * 2);
        ctx.fillStyle = getTypeColor(beyblade.type);
        ctx.fill();
        ctx.strokeStyle = "#1f2937";
        ctx.lineWidth = 3 * scaleFactor;
        ctx.stroke();

        // Spin direction indicator
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${20 * scaleFactor}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(beyblade.spinDirection === "left" ? "◄" : "►", 0, 0);
      }

      ctx.restore();

      // Update rotation only if spinning is enabled
      if (isSpinning) {
        const spinSpeed = beyblade.spinDirection === "left" ? -0.1 : 0.1;
        rotationRef.current += spinSpeed;
      }

      // Draw special move animation if active
      if (showAnimation) {
        drawSpecialMoveAnimation(ctx, canvas.width, canvas.height);
      }

      // Draw contact points (spikes) - Red/Orange/Yellow for damage
      if (beyblade.pointsOfContact && beyblade.pointsOfContact.length > 0) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotationRef.current);

        beyblade.pointsOfContact.forEach((point, index) => {
          const angleRad = (point.angle - 90) * (Math.PI / 180);
          const widthRad = (point.width / 2) * (Math.PI / 180);
          const contactRadius = displayRadius + 5 * scaleFactor; // Just outside the beyblade

          const startAngle = angleRad - widthRad;
          const endAngle = angleRad + widthRad;

          // Draw contact arc
          ctx.beginPath();
          ctx.arc(0, 0, contactRadius, startAngle, endAngle);
          ctx.lineWidth = 6 * scaleFactor; // Thicker for visibility

          // Color based on damage multiplier (red to yellow gradient)
          const hue = Math.min((point.damageMultiplier - 1.0) * 300, 120);
          ctx.strokeStyle = `hsl(${hue}, 90%, 50%)`;
          ctx.stroke();
          
          // Add glow effect for contact points
          ctx.beginPath();
          ctx.arc(0, 0, contactRadius, startAngle, endAngle);
          ctx.lineWidth = 12 * scaleFactor;
          ctx.strokeStyle = `hsla(${hue}, 90%, 60%, 0.3)`;
          ctx.stroke();
          
          // Add small indicator dot at the center of the contact point
          const indicatorAngle = point.angle * (Math.PI / 180) - Math.PI / 2;
          const indicatorX = Math.cos(indicatorAngle) * contactRadius;
          const indicatorY = Math.sin(indicatorAngle) * contactRadius;
          
          ctx.beginPath();
          ctx.arc(indicatorX, indicatorY, 3 * scaleFactor, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
          ctx.fill();
          ctx.strokeStyle = "white";
          ctx.lineWidth = 1 * scaleFactor;
          ctx.stroke();
        });

        ctx.restore();
      }

      // Draw spin steal points - Blue/Cyan for energy transfer
      if (beyblade.spinStealPoints && beyblade.spinStealPoints.length > 0) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotationRef.current);

        beyblade.spinStealPoints.forEach((point, index) => {
          const angleRad = (point.angle - 90) * (Math.PI / 180);
          const widthRad = (point.width / 2) * (Math.PI / 180);
          const spinStealRadius = displayRadius + 12 * scaleFactor; // Slightly further out than contact points

          const startAngle = angleRad - widthRad;
          const endAngle = angleRad + widthRad;

          // Draw spin steal arc with glow effect
          ctx.beginPath();
          ctx.arc(0, 0, spinStealRadius, startAngle, endAngle);
          ctx.lineWidth = 6 * scaleFactor; // Thicker for visibility
          
          // Cyan/Blue color based on spin steal multiplier
          // 1.0x = cyan (180), 2.0x = deep blue (220)
          const hue = 180 + (point.spinStealMultiplier - 1.0) * 40;
          ctx.strokeStyle = `hsl(${hue}, 90%, 50%)`;
          ctx.stroke();
          
          // Add glow effect
          ctx.beginPath();
          ctx.arc(0, 0, spinStealRadius, startAngle, endAngle);
          ctx.lineWidth = 12 * scaleFactor;
          ctx.strokeStyle = `hsla(${hue}, 90%, 60%, 0.3)`;
          ctx.stroke();
          
          // Add small indicator dot at the center of the spin steal point
          const indicatorAngle = point.angle * (Math.PI / 180) - Math.PI / 2;
          const indicatorX = Math.cos(indicatorAngle) * spinStealRadius;
          const indicatorY = Math.sin(indicatorAngle) * spinStealRadius;
          
          ctx.beginPath();
          ctx.arc(indicatorX, indicatorY, 3 * scaleFactor, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
          ctx.fill();
          ctx.strokeStyle = "white";
          ctx.lineWidth = 1 * scaleFactor;
          ctx.stroke();
        });

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [beyblade, showAnimation, imageLoaded, isSpinning, zoom]);

  const drawSpecialMoveAnimation = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Special moves have been removed from the system
    // This function is kept for potential future use
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "attack":
        return "#ef4444";
      case "defense":
        return "#3b82f6";
      case "stamina":
        return "#22c55e";
      case "balanced":
        return "#a855f7";
      default:
        return "#6b7280";
    }
  };

  const hasSpecialMove = false;

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Live Preview</h3>

      {/* Canvas Preview - Fixed aspect ratio */}
      <div className="mb-4 flex justify-center">
        <canvas
          ref={canvasRef}
          width={CANVAS_RESOLUTION}
          height={CANVAS_RESOLUTION}
          onClick={handleCanvasClick}
          style={{ 
            width: `${DISPLAY_SIZE}px`, 
            height: `${DISPLAY_SIZE}px`,
            maxWidth: '100%',
            aspectRatio: '1 / 1' 
          }}
          className={`border-2 border-gray-300 rounded-lg ${
            clickMode ? "cursor-crosshair" : ""
          }`}
        />
      </div>
      
      {/* Aspect Ratio Notice */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-blue-600 text-lg">ℹ️</span>
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-1">Gameplay Note:</p>
            <p>During actual gameplay, beyblades maintain perfect circular shape (1:1 aspect ratio). 
            If this preview appears squished, it's due to display container constraints and won't affect in-game rendering.</p>
          </div>
        </div>
      </div>

      {clickMode && (
        <p className="text-xs text-blue-600 mb-4 text-center font-medium">
          📍 Click on the canvas to place a spike (Spinning paused)
        </p>
      )}

      {/* Special Move Test Button */}
      {hasSpecialMove && (
        <button
          type="button"
          onClick={() => {
            setShowAnimation(true);
            setTimeout(() => setShowAnimation(false), 3000);
          }}
          disabled={showAnimation}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 mb-4"
        >
          {showAnimation ? "Playing Animation..." : "Test Special Move"}
        </button>
      )}

      {/* Zoom and Spin Controls */}
      <div className="space-y-3 mb-4">
        {/* Spin Control */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Spinning:</span>
          <button
            onClick={() => setIsSpinning(!isSpinning)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isSpinning
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            {isSpinning ? "⚡ ON" : "⏸ OFF"}
          </button>
        </div>

        {/* Zoom Control */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Zoom:</span>
            <span className="text-sm font-semibold text-blue-600">{zoom}%</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-bold"
            >
              −
            </button>
            <input
              type="range"
              min="50"
              max="200"
              value={zoom}
              onChange={(e) => setZoom(parseInt(e.target.value))}
              className="flex-1"
            />
            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-bold"
            >
              +
            </button>
            <button
              onClick={() => setZoom(100)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Name:</span>
          <span className="font-medium">
            {beyblade.displayName || "Unnamed"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Type:</span>
          <span className="font-medium capitalize">{beyblade.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Spin Direction:</span>
          <span className="font-medium capitalize">
            {beyblade.spinDirection}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Radius:</span>
          <span className="font-medium">
            {beyblade.radius} cm ({getBeybladeDisplayRadius(beyblade.radius).toFixed(0)}px)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Mass:</span>
          <span className="font-medium">{beyblade.mass}g</span>
        </div>
      </div>

      {/* Resolution Info */}
      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
        <div className="font-semibold mb-1">📐 Resolution System:</div>
        <div>1 cm = {(ARENA_RESOLUTION / 45).toFixed(1)}px (at {ARENA_RESOLUTION}px arena)</div>
        <div className="text-blue-600 mt-1">
          Standard: 4cm = 96px diameter
        </div>
      </div>

      {/* Point Legend */}
      {((beyblade.pointsOfContact && beyblade.pointsOfContact.length > 0) ||
        (beyblade.spinStealPoints && beyblade.spinStealPoints.length > 0)) && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">
            Point Legend:
          </h4>
          <div className="space-y-1 text-xs">
            {beyblade.pointsOfContact &&
              beyblade.pointsOfContact.length > 0 && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-1 rounded"
                    style={{
                      background:
                        "linear-gradient(to right, hsl(0, 90%, 50%), hsl(60, 90%, 50%))",
                    }}
                  ></div>
                  <span className="text-gray-600">
                    💥 Contact Points (Red→Yellow:{" "}
                    {beyblade.pointsOfContact.length})
                  </span>
                </div>
              )}
            {beyblade.spinStealPoints &&
              beyblade.spinStealPoints.length > 0 && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-1 rounded"
                    style={{
                      background:
                        "linear-gradient(to right, hsl(180, 90%, 50%), hsl(220, 90%, 50%))",
                    }}
                  ></div>
                  <span className="text-gray-600">
                    🌀 Spin Steal Points (Cyan→Blue:{" "}
                    {beyblade.spinStealPoints.length})
                  </span>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BeybladePreview;
