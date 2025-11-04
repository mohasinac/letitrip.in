/**
 * Arena Renderer Utility
 * Handles rendering of complex arena configurations from database
 */

import {
  ArenaConfig,
  LoopConfig,
  ExitConfig,
  ObstacleConfig,
} from "@/types/arenaConfig";
import { Stadium } from "../types/game";

/**
 * Convert ArenaConfig to Stadium dimensions
 */
export function arenaConfigToStadium(arena: ArenaConfig): Stadium {
  // Convert em units to pixels (1em ≈ 16px)
  const pixelWidth = arena.width * 16;
  const pixelHeight = arena.height * 16;

  // Calculate radii based on shape and size
  const minDimension = Math.min(pixelWidth, pixelHeight);

  return {
    center: { x: pixelWidth / 2, y: pixelHeight / 2 },
    innerRadius: minDimension * 0.45, // 90% of half dimension
    outerRadius: minDimension * 0.475, // 95% of half dimension
    exitRadius: minDimension * 0.475,
    chargeDashRadius: minDimension * 0.375, // 75% for charge dash
    normalLoopRadius: minDimension * 0.25, // 50% for normal loop
    width: pixelWidth,
    height: pixelHeight,
  };
}

/**
 * Render arena background and floor
 */
export function renderArenaBackground(
  ctx: CanvasRenderingContext2D,
  arena: ArenaConfig,
  stadium: Stadium,
): void {
  const { width, height } = stadium;

  // Background
  ctx.fillStyle = arena.backgroundColor || "#1a1a2e";
  ctx.fillRect(0, 0, width, height);

  // Background layers (decorative elements)
  if (arena.backgroundLayers && arena.backgroundLayers.length > 0) {
    arena.backgroundLayers.forEach((layer) => {
      if (layer.imageUrl) {
        // Image-based background layer
        ctx.globalAlpha = layer.opacity || 0.3;
        // Note: Image loading would be handled separately in the component
        ctx.globalAlpha = 1;
      }
    });
  }
}

/**
 * Render arena floor based on shape
 */
export function renderArenaFloor(
  ctx: CanvasRenderingContext2D,
  arena: ArenaConfig,
  stadium: Stadium,
): void {
  const { center, innerRadius } = stadium;
  const baseColor = arena.floorColor || "#2a2a3a";

  // Create gradient for depth
  const floorGradient = ctx.createRadialGradient(
    center.x,
    center.y,
    0,
    center.x,
    center.y,
    innerRadius,
  );
  floorGradient.addColorStop(0, lightenColor(baseColor, 20));
  floorGradient.addColorStop(0.7, baseColor);
  floorGradient.addColorStop(1, darkenColor(baseColor, 20));

  ctx.fillStyle = floorGradient;

  // Render based on shape
  switch (arena.shape) {
    case "circle":
      ctx.beginPath();
      ctx.arc(center.x, center.y, innerRadius, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "rectangle":
      const rectWidth = innerRadius * 1.6;
      const rectHeight = innerRadius * 1.6;
      ctx.fillRect(
        center.x - rectWidth / 2,
        center.y - rectHeight / 2,
        rectWidth,
        rectHeight,
      );
      break;

    case "hexagon":
      renderPolygon(
        ctx,
        center.x,
        center.y,
        innerRadius,
        6,
        arena.rotation || 0,
      );
      ctx.fill();
      break;

    case "octagon":
      renderPolygon(
        ctx,
        center.x,
        center.y,
        innerRadius,
        8,
        arena.rotation || 0,
      );
      ctx.fill();
      break;

    case "pentagon":
      renderPolygon(
        ctx,
        center.x,
        center.y,
        innerRadius,
        5,
        arena.rotation || 0,
      );
      ctx.fill();
      break;

    default:
      // Default to circle
      ctx.beginPath();
      ctx.arc(center.x, center.y, innerRadius, 0, Math.PI * 2);
      ctx.fill();
  }
}

/**
 * Render arena walls and exits
 */
export function renderWallsAndExits(
  ctx: CanvasRenderingContext2D,
  arena: ArenaConfig,
  stadium: Stadium,
): void {
  const { center, innerRadius, outerRadius } = stadium;
  const { wall, exits } = arena;

  if (!wall.enabled) {
    // No walls - render all as exits or nothing
    if (wall.allExits) {
      // Entire boundary is exit zone
      ctx.strokeStyle = "#EF4444";
      ctx.lineWidth = outerRadius - innerRadius;
      ctx.beginPath();
      ctx.arc(
        center.x,
        center.y,
        (innerRadius + outerRadius) / 2,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    return;
  }

  // Render exits first
  exits.forEach((exit) => {
    if (!exit.enabled) return;

    const startAngle = ((exit.angle - exit.width / 2) * Math.PI) / 180;
    const endAngle = ((exit.angle + exit.width / 2) * Math.PI) / 180;

    // Red exit zones
    ctx.fillStyle = "#EF4444";
    ctx.beginPath();
    ctx.arc(center.x, center.y, outerRadius, startAngle, endAngle);
    ctx.arc(center.x, center.y, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fill();

    // Warning icon
    const centerAngle = (startAngle + endAngle) / 2;
    const iconRadius = (outerRadius + innerRadius) / 2;
    const iconX = center.x + Math.cos(centerAngle) * iconRadius;
    const iconY = center.y + Math.sin(centerAngle) * iconRadius;
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚠️", iconX, iconY);
  });

  // Render walls in gaps between exits
  const wallColor = "#FBBF24"; // Gold color for walls
  const sortedExits = [...exits].sort((a, b) => a.angle - b.angle);

  for (let i = 0; i < sortedExits.length; i++) {
    const currentExit = sortedExits[i];
    const nextExit = sortedExits[(i + 1) % sortedExits.length];

    const wallStartAngle =
      ((currentExit.angle + currentExit.width / 2) * Math.PI) / 180;
    let wallEndAngle = ((nextExit.angle - nextExit.width / 2) * Math.PI) / 180;

    // Handle wraparound
    if (wallEndAngle < wallStartAngle) {
      wallEndAngle += Math.PI * 2;
    }

    // Draw wall segment
    ctx.fillStyle = wallColor;
    ctx.beginPath();
    ctx.arc(center.x, center.y, outerRadius, wallStartAngle, wallEndAngle);
    ctx.arc(
      center.x,
      center.y,
      innerRadius,
      wallEndAngle,
      wallStartAngle,
      true,
    );
    ctx.closePath();
    ctx.fill();

    // Wall details (spikes or springs)
    if (wall.hasSpikes) {
      renderSpikes(
        ctx,
        center,
        innerRadius,
        outerRadius,
        wallStartAngle,
        wallEndAngle,
      );
    }
  }
}

/**
 * Render loops (speed boost zones)
 */
export function renderLoops(
  ctx: CanvasRenderingContext2D,
  arena: ArenaConfig,
  stadium: Stadium,
): void {
  const { center } = stadium;

  arena.loops.forEach((loop) => {
    const loopRadius = loop.radius * 16; // Convert em to pixels
    const loopColor = loop.color || "#3B82F6";

    ctx.strokeStyle = loopColor;
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 4]);

    switch (loop.shape) {
      case "circle":
      case "ring":
        ctx.beginPath();
        ctx.arc(center.x, center.y, loopRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Render charge points on loop
        if (loop.chargePoints) {
          loop.chargePoints.forEach((chargePoint) => {
            const angle = (chargePoint.angle * Math.PI) / 180;
            const x = center.x + Math.cos(angle) * loopRadius;
            const y = center.y + Math.sin(angle) * loopRadius;

            ctx.fillStyle = chargePoint.color || "#FBBF24";
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();

            // Button indicator
            if (chargePoint.buttonId) {
              ctx.fillStyle = "#000000";
              ctx.font = "bold 10px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(chargePoint.buttonId.toString(), x, y);
            }
          });
        }
        break;

      case "rectangle":
        const width = (loop.width || loop.radius) * 16;
        const height = (loop.height || loop.radius) * 16;
        ctx.strokeRect(
          center.x - width / 2,
          center.y - height / 2,
          width,
          height,
        );
        break;

      case "hexagon":
        renderPolygon(
          ctx,
          center.x,
          center.y,
          loopRadius,
          6,
          loop.rotation || 0,
          true,
        );
        break;

      case "octagon":
        renderPolygon(
          ctx,
          center.x,
          center.y,
          loopRadius,
          8,
          loop.rotation || 0,
          true,
        );
        break;
    }

    ctx.setLineDash([]);
  });
}

/**
 * Render obstacles
 */
export function renderObstacles(
  ctx: CanvasRenderingContext2D,
  arena: ArenaConfig,
  stadium: Stadium,
): void {
  const { center } = stadium;

  arena.obstacles.forEach((obstacle) => {
    const x = center.x + obstacle.x * 16;
    const y = center.y + obstacle.y * 16;
    const radius = obstacle.radius * 16;

    // Obstacle color based on type
    let color = "#666666";
    switch (obstacle.type) {
      case "rock":
        color = "#8B7355";
        break;
      case "pillar":
        color = "#A0A0A0";
        break;
      case "barrier":
        color = "#FF6B6B";
        break;
      case "wall":
        color = "#4A4A4A";
        break;
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = darkenColor(color, 30);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Destructible indicator
    if (obstacle.destructible) {
      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💥", x, y);
    }
  });
}

/**
 * Helper: Render polygon
 */
function renderPolygon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  sides: number,
  rotation: number,
  strokeOnly: boolean = false,
): void {
  const angle = (Math.PI * 2) / sides;
  const rotationRad = (rotation * Math.PI) / 180;

  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const pointAngle = angle * i + rotationRad;
    const px = x + Math.cos(pointAngle) * radius;
    const py = y + Math.sin(pointAngle) * radius;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();

  if (strokeOnly) {
    ctx.stroke();
  }
}

/**
 * Helper: Render spikes on wall
 */
function renderSpikes(
  ctx: CanvasRenderingContext2D,
  center: { x: number; y: number },
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
): void {
  const numSpikes = Math.floor((endAngle - startAngle) / (Math.PI / 12));
  const spikeSpacing = (endAngle - startAngle) / numSpikes;

  ctx.fillStyle = "#FF4444";
  for (let i = 0; i < numSpikes; i++) {
    const angle = startAngle + spikeSpacing * i + spikeSpacing / 2;
    const innerX = center.x + Math.cos(angle) * innerRadius;
    const innerY = center.y + Math.sin(angle) * innerRadius;
    const outerX = center.x + Math.cos(angle) * (outerRadius + 10);
    const outerY = center.y + Math.sin(angle) * (outerRadius + 10);
    const sideOffset = 5;

    ctx.beginPath();
    ctx.moveTo(innerX, innerY);
    ctx.lineTo(
      innerX + Math.cos(angle - Math.PI / 2) * sideOffset,
      innerY + Math.sin(angle - Math.PI / 2) * sideOffset,
    );
    ctx.lineTo(outerX, outerY);
    ctx.lineTo(
      innerX + Math.cos(angle + Math.PI / 2) * sideOffset,
      innerY + Math.sin(angle + Math.PI / 2) * sideOffset,
    );
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * Helper: Lighten color
 */
function lightenColor(color: string, amount: number): string {
  const col = color.replace("#", "");
  const num = parseInt(col, 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Helper: Darken color
 */
function darkenColor(color: string, amount: number): string {
  return lightenColor(color, -amount);
}
