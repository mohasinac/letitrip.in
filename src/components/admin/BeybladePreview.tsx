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

      // Draw beyblade placeholder
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const size = 40;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationRef.current);

      // Main beyblade circle
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fillStyle = getTypeColor(beyblade.type);
      ctx.fill();
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Spin direction indicator
      const arrowSize = 20;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(beyblade.spinDirection === "left" ? "◄" : "►", 0, 0);

      ctx.restore();

      // Update rotation
      rotationRef.current += beyblade.spinDirection === "left" ? -0.05 : 0.05;

      // Draw special move animation if active
      if (showAnimation) {
        drawSpecialMoveAnimation(ctx, canvas.width, canvas.height);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [beyblade, showAnimation]);

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
