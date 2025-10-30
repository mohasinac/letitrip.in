/**
 * Beyblade Preview Component
 * Displays live preview of Beyblade with special move animation
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { BeybladeStats } from "@/types/beybladeStats";

interface BeybladePreviewProps {
  beyblade: BeybladeStats;
}

const BeybladePreview: React.FC<BeybladePreviewProps> = ({ beyblade }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const animationFrameRef = useRef<number>();
  const rotationRef = useRef(0);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

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
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw center circle
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 150, 0, Math.PI * 2);
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw beyblade
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const size = beyblade.actualSize || 80;

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
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Apply image rotation (in addition to beyblade spin rotation)
        ctx.rotate((imagePos.rotation * Math.PI) / 180);

        // Calculate image size with scale
        const imgSize = size * imagePos.scale;

        // Calculate position offset from center
        // imagePos x and y are from -2 to 2, convert to pixels
        const offsetX = imagePos.x * (size / 2);
        const offsetY = imagePos.y * (size / 2);

        // Draw the image with position, scale, and rotation
        ctx.drawImage(
          imageRef.current,
          -imgSize / 2 + offsetX,
          -imgSize / 2 + offsetY,
          imgSize,
          imgSize
        );

        // Reset clipping
        ctx.restore();
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotationRef.current);

        // Draw border around the image
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.strokeStyle = getTypeColor(beyblade.type);
        ctx.lineWidth = 4;
        ctx.stroke();
      } else {
        // Fallback: Draw colored circle with type indicator
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = getTypeColor(beyblade.type);
        ctx.fill();
        ctx.strokeStyle = "#1f2937";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Spin direction indicator
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(beyblade.spinDirection === "left" ? "◄" : "►", 0, 0);
      }

      ctx.restore();

      // Update rotation
      const spinSpeed = beyblade.spinDirection === "left" ? -0.1 : 0.1;
      rotationRef.current += spinSpeed;

      // Draw special move animation if active
      if (showAnimation) {
        drawSpecialMoveAnimation(ctx, canvas.width, canvas.height);
      }

      // Draw contact points (spikes)
      if (beyblade.pointsOfContact && beyblade.pointsOfContact.length > 0) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotationRef.current);

        beyblade.pointsOfContact.forEach((point) => {
          const angleRad = (point.angle - 90) * (Math.PI / 180);
          const widthRad = (point.width / 2) * (Math.PI / 180);
          const contactRadius = size / 2 + 5; // Just outside the beyblade

          const startAngle = angleRad - widthRad;
          const endAngle = angleRad + widthRad;

          // Draw contact arc
          ctx.beginPath();
          ctx.arc(0, 0, contactRadius, startAngle, endAngle);
          ctx.lineWidth = 4;

          // Color based on damage multiplier
          const hue = Math.min((point.damageMultiplier - 1.0) * 300, 120);
          ctx.strokeStyle = `hsl(${hue}, 90%, 50%)`;
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
  }, [beyblade, showAnimation, imageLoaded]);

  const drawSpecialMoveAnimation = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;

    // Orbital Attack Animation
    if (beyblade.specialMove?.flags.orbitalAttack) {
      const orbitalConfig = beyblade.specialMove.flags.orbitalAttack;
      const radius = orbitalConfig.orbitRadius || 80;

      // Draw orbit path
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(147, 51, 234, 0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw attack points
      const attackCount = orbitalConfig.attackCount || 3;
      const angleIncrement = (Math.PI * 2) / attackCount;

      for (let i = 0; i < attackCount; i++) {
        const angle = i * angleIncrement + rotationRef.current;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(147, 51, 234, 0.8)";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Time Skip Animation
    if (beyblade.specialMove?.flags.timeSkip) {
      // Draw freeze effect
      ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
      ctx.fillRect(0, 0, width, height);

      // Draw time ripples
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(
          centerX,
          centerY,
          50 + i * 30 + ((rotationRef.current * 100) % 30),
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.5 - i * 0.15})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
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

  const hasSpecialMove =
    beyblade.specialMove?.flags.orbitalAttack ||
    beyblade.specialMove?.flags.timeSkip;

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Live Preview</h3>

      {/* Canvas Preview */}
      <div className="mb-4">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full border-2 border-gray-300 rounded-lg"
        />
      </div>

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
          <span className="text-gray-600">Special Move:</span>
          <span className="font-medium">
            {beyblade.specialMove?.name || "None"}
          </span>
        </div>
        {beyblade.specialMove?.flags.orbitalAttack && (
          <div className="flex justify-between text-purple-600">
            <span>Move Type:</span>
            <span className="font-medium">Orbital Attack</span>
          </div>
        )}
        {beyblade.specialMove?.flags.timeSkip && (
          <div className="flex justify-between text-blue-600">
            <span>Move Type:</span>
            <span className="font-medium">Time Skip</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeybladePreview;
