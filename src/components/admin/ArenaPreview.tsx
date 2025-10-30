/**
 * Arena Preview Component
 * Renders a live preview of an arena configuration on canvas
 */

"use client";

import React, { useEffect, useRef } from "react";
import { ArenaConfig, LoopConfig } from "@/types/arenaConfig";

interface ArenaPreviewProps {
  arena: ArenaConfig;
  width?: number;
  height?: number;
}

export default function ArenaPreview({
  arena,
  width = 400,
  height = 400,
}: ArenaPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up coordinate system (center origin)
    ctx.save();
    ctx.translate(width / 2, height / 2);

    // Calculate scale (arena is 50em, canvas is width pixels)
    const scale = Math.min(width, height) / (arena.width * 1.1);

    // Draw background
    const bgGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, width / 2);
    bgGradient.addColorStop(0, getThemeColor(arena.theme, 0.3));
    bgGradient.addColorStop(1, getThemeColor(arena.theme, 0.1));
    ctx.fillStyle = bgGradient;
    ctx.fillRect(-width / 2, -height / 2, width, height);

    // Draw arena shape (main boundary)
    drawArenaShape(ctx, arena.shape, arena.width, arena.height, scale);

    // Draw water body (if enabled)
    if (arena.waterBody?.enabled && arena.waterBody.type === "center") {
      drawWater(ctx, arena.waterBody.radius || 10, scale);
    }

    // Draw loops (speed zones)
    arena.loops.forEach((loop, index) => {
      drawLoop(ctx, loop, scale, index);
    });

    // Draw obstacles
    arena.obstacles.forEach((obstacle) => {
      drawObstacle(
        ctx,
        obstacle.x * scale,
        obstacle.y * scale,
        obstacle.radius * scale,
        obstacle.type
      );
    });

    // Draw pits
    arena.pits.forEach((pit) => {
      drawPit(ctx, pit.x * scale, pit.y * scale, pit.radius * scale);
    });

    // Draw laser guns
    arena.laserGuns.forEach((laser) => {
      drawLaserGun(ctx, laser.x * scale, laser.y * scale);
    });

    // Draw goal objects
    arena.goalObjects.forEach((goal) => {
      drawGoal(
        ctx,
        goal.x * scale,
        goal.y * scale,
        goal.radius * scale,
        goal.type
      );
    });

    // Draw exits
    if (arena.wall.enabled) {
      arena.exits.forEach((exit) => {
        if (exit.enabled) {
          drawExit(ctx, exit.angle, exit.width, arena.width, scale);
        }
      });
    }

    ctx.restore();
  }, [arena, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg"
      style={{ maxWidth: "100%", height: "auto" }}
    />
  );
}

// Helper function to get theme colors
function getThemeColor(theme: string, alpha: number = 1): string {
  const colors: Record<string, string> = {
    forest: `rgba(34, 139, 34, ${alpha})`,
    mountains: `rgba(112, 128, 144, ${alpha})`,
    grasslands: `rgba(124, 252, 0, ${alpha})`,
    metrocity: `rgba(70, 130, 180, ${alpha})`,
    safari: `rgba(210, 180, 140, ${alpha})`,
    prehistoric: `rgba(139, 69, 19, ${alpha})`,
    futuristic: `rgba(138, 43, 226, ${alpha})`,
    desert: `rgba(244, 164, 96, ${alpha})`,
    sea: `rgba(0, 191, 255, ${alpha})`,
    riverbank: `rgba(95, 158, 160, ${alpha})`,
  };
  return colors[theme] || `rgba(128, 128, 128, ${alpha})`;
}

// Draw arena main shape
function drawArenaShape(
  ctx: CanvasRenderingContext2D,
  shape: string,
  arenaWidth: number,
  arenaHeight: number,
  scale: number
) {
  const radius = (arenaWidth / 2) * scale;

  ctx.beginPath();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 3;
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";

  switch (shape) {
    case "circle":
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      break;

    case "rectangle":
      const w = arenaWidth * scale;
      const h = arenaHeight * scale;
      ctx.rect(-w / 2, -h / 2, w, h);
      break;

    case "pentagon":
      drawPolygon(ctx, 0, 0, radius, 5);
      break;

    case "hexagon":
      drawPolygon(ctx, 0, 0, radius, 6);
      break;

    case "octagon":
      drawPolygon(ctx, 0, 0, radius, 8);
      break;

    case "star":
      drawStar(ctx, 0, 0, radius, radius * 0.5, 5);
      break;

    case "oval":
      ctx.ellipse(0, 0, radius, radius * 0.7, 0, 0, Math.PI * 2);
      break;

    case "loop":
      // Double circle for loop shape
      ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
      break;

    default:
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
  }

  ctx.fill();
  ctx.stroke();
}

// Draw loop (speed zone)
function drawLoop(
  ctx: CanvasRenderingContext2D,
  loop: LoopConfig,
  scale: number,
  index: number
) {
  const radius = loop.radius * scale;

  ctx.save();
  if (loop.rotation) {
    ctx.rotate((loop.rotation * Math.PI) / 180);
  }

  ctx.beginPath();
  ctx.strokeStyle = loop.color || `hsl(${index * 60}, 70%, 50%)`;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);

  switch (loop.shape) {
    case "circle":
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      break;

    case "rectangle":
      const w = (loop.width || loop.radius * 2) * scale;
      const h = (loop.height || loop.radius * 2) * scale;
      ctx.rect(-w / 2, -h / 2, w, h);
      break;

    case "pentagon":
      drawPolygon(ctx, 0, 0, radius, 5);
      break;

    case "hexagon":
      drawPolygon(ctx, 0, 0, radius, 6);
      break;

    case "octagon":
      drawPolygon(ctx, 0, 0, radius, 8);
      break;

    case "star":
      drawStar(ctx, 0, 0, radius, radius * 0.5, 5);
      break;

    case "oval":
      ctx.ellipse(0, 0, radius, radius * 0.7, 0, 0, Math.PI * 2);
      break;

    default:
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
  }

  ctx.stroke();
  ctx.setLineDash([]);

  // Draw speed boost indicator
  ctx.fillStyle = loop.color || `hsl(${index * 60}, 70%, 50%)`;
  ctx.globalAlpha = 0.1;
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

// Draw water body
function drawWater(
  ctx: CanvasRenderingContext2D,
  radius: number,
  scale: number
) {
  const r = radius * scale;

  ctx.beginPath();
  ctx.fillStyle = "rgba(79, 195, 247, 0.5)";
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Water wave lines
  ctx.strokeStyle = "rgba(33, 150, 243, 0.7)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3 + i * r * 0.2, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// Draw obstacle
function drawObstacle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  type: string
) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "#8b4513";
  ctx.strokeStyle = "#654321";
  ctx.lineWidth = 2;

  switch (type) {
    case "rock":
      // Irregular rock shape
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const r = radius * (0.8 + Math.random() * 0.4);
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      break;

    case "pillar":
      // Square pillar
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
      ctx.strokeRect(-radius, -radius, radius * 2, radius * 2);
      ctx.restore();
      return;

    case "barrier":
      // Hexagonal barrier
      drawPolygon(ctx, 0, 0, radius, 6);
      break;

    default:
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
  }

  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// Draw pit
function drawPit(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
) {
  ctx.save();
  ctx.translate(x, y);

  // Pit gradient (dark center)
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  gradient.addColorStop(0, "#000");
  gradient.addColorStop(0.6, "#222");
  gradient.addColorStop(1, "#444");

  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Swirl lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.3 + i * radius * 0.2, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

// Draw laser gun
function drawLaserGun(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  ctx.save();
  ctx.translate(x, y);

  // Gun base
  ctx.fillStyle = "#555";
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();

  // Gun barrel
  ctx.fillStyle = "#ff3333";
  ctx.fillRect(-2, -12, 4, 12);

  // Warning light
  ctx.fillStyle = "#ffff00";
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw goal object
function drawGoal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  type: string
) {
  ctx.save();
  ctx.translate(x, y);

  const colors: Record<string, string> = {
    target: "#ff6b6b",
    crystal: "#4ecdc4",
    tower: "#ffd93d",
    relic: "#a29bfe",
  };

  ctx.fillStyle = colors[type] || "#888";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;

  switch (type) {
    case "tower":
      // Tower shape
      ctx.fillRect(-radius * 0.6, -radius, radius * 1.2, radius * 2);
      ctx.fillRect(-radius * 0.4, -radius * 1.5, radius * 0.8, radius * 0.5);
      break;

    case "crystal":
      // Diamond shape
      ctx.beginPath();
      ctx.moveTo(0, -radius);
      ctx.lineTo(radius * 0.6, 0);
      ctx.lineTo(0, radius);
      ctx.lineTo(-radius * 0.6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    default:
      // Circle for target and relic
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Target rings
      if (type === "target") {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
        ctx.stroke();
      }
  }

  ctx.restore();
}

// Draw exit
function drawExit(
  ctx: CanvasRenderingContext2D,
  angle: number,
  width: number,
  arenaWidth: number,
  scale: number
) {
  const radius = (arenaWidth / 2) * scale;
  const startAngle = ((angle - width / 2) * Math.PI) / 180;
  const endAngle = ((angle + width / 2) * Math.PI) / 180;

  ctx.save();
  ctx.strokeStyle = "#00ff00";
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 5]);

  ctx.beginPath();
  ctx.arc(0, 0, radius, startAngle, endAngle);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.restore();
}

// Helper: Draw polygon
function drawPolygon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  sides: number
) {
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// Helper: Draw star
function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerRadius: number,
  innerRadius: number,
  points: number
) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}
