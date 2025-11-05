/**
 * Game Canvas Component
 * Renders the game using HTML5 Canvas
 */

"use client";

import React, { useRef, useEffect } from "react";
import type { ServerGameState, ServerBeyblade } from "@/lib/game/types";

export interface GameCanvasProps {
  gameState: ServerGameState | null;
  beyblades: Map<string, ServerBeyblade>;
  width?: number;
  height?: number;
  className?: string;
}

export function GameCanvas({
  gameState,
  beyblades,
  width = 800,
  height = 600,
  className = "",
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Animation loop
    const render = () => {
      // Clear canvas
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, width, height);

      // Draw arena
      if (gameState.arena) {
        drawArena(ctx, gameState.arena, width, height);
      }

      // Draw beyblades
      beyblades.forEach((beyblade) => {
        drawBeyblade(ctx, beyblade, width, height);
      });

      requestAnimationFrame(render);
    };

    render();
  }, [gameState, beyblades, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`border border-gray-700 rounded-lg ${className}`}
    />
  );
}

// Helper function to draw arena
function drawArena(
  ctx: CanvasRenderingContext2D,
  arena: any,
  canvasWidth: number,
  canvasHeight: number
) {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const radius = Math.min(canvasWidth, canvasHeight) * 0.4;

  // Draw arena circle
  ctx.strokeStyle = "#3498db";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Draw arena fill with gradient
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius
  );
  gradient.addColorStop(0, "#2c3e50");
  gradient.addColorStop(1, "#1a252f");
  ctx.fillStyle = gradient;
  ctx.fill();
}

// Helper function to draw beyblade
function drawBeyblade(
  ctx: CanvasRenderingContext2D,
  beyblade: ServerBeyblade,
  canvasWidth: number,
  canvasHeight: number
) {
  // Map game coordinates to canvas coordinates
  const x = beyblade.x + canvasWidth / 2;
  const y = beyblade.y + canvasHeight / 2;
  const radius = beyblade.radius || 15;

  // Draw beyblade circle
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(beyblade.rotation);

  // Draw beyblade body
  ctx.fillStyle = beyblade.isAI ? "#e74c3c" : "#3498db";
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Draw direction indicator
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(radius, 0);
  ctx.stroke();

  // Draw health bar above beyblade
  ctx.restore();
  const healthBarWidth = 40;
  const healthBarHeight = 4;
  const healthPercent = beyblade.health / 100;

  ctx.fillStyle = "#34495e";
  ctx.fillRect(
    x - healthBarWidth / 2,
    y - radius - 10,
    healthBarWidth,
    healthBarHeight
  );

  ctx.fillStyle =
    healthPercent > 0.5
      ? "#2ecc71"
      : healthPercent > 0.25
      ? "#f39c12"
      : "#e74c3c";
  ctx.fillRect(
    x - healthBarWidth / 2,
    y - radius - 10,
    healthBarWidth * healthPercent,
    healthBarHeight
  );

  // Draw username
  ctx.fillStyle = "#ffffff";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(beyblade.username, x, y - radius - 15);
}

export default GameCanvas;
