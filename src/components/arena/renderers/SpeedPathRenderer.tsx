/**
 * Speed Path Renderer Component
 * Renders speed paths as PATH LINES (not filled areas)
 * Players travel along these paths to gain speed boosts
 */

"use client";

import React from "react";
import { SpeedPathConfig } from "@/types/arenaConfigNew";
import { generateShapePath } from "@/utils/pathGeneration";

interface SpeedPathRendererProps {
  speedPath: SpeedPathConfig;
  centerX: number;
  centerY: number;
  scale: number;
}

export default function SpeedPathRenderer({
  speedPath,
  centerX,
  centerY,
  scale,
}: SpeedPathRendererProps) {
  const radius = speedPath.radius * scale;
  const width = speedPath.width ? speedPath.width * scale : radius * 2;
  const height = speedPath.height ? speedPath.height * scale : radius * 2;
  const color = speedPath.color || "#3b82f6";
  const rotation = speedPath.rotation || 0;

  // Generate path based on shape
  const shapePath = generateShapePath(
    speedPath.shape,
    { x: centerX, y: centerY },
    radius,
    width,
    height
  );

  // Auto-generate charge points if enabled
  let chargePoints = speedPath.chargePoints || [];
  if (speedPath.autoPlaceChargePoints && speedPath.chargePointCount) {
    const count = Math.min(speedPath.chargePointCount, 3); // Max 3
    chargePoints = [];
    for (let i = 0; i < count; i++) {
      const pathPosition = (100 / count) * i; // Distribute evenly: 0%, 33.33%, 66.66% or 0%, 50% etc
      chargePoints.push({
        id: i + 1,
        pathPosition,
        target: "center",
        radius: 1,
        color: "#fbbf24",
      });
    }
  } else if (chargePoints.length > 0) {
    // Ensure existing charge points have IDs
    chargePoints = chargePoints.map((cp, idx) => ({
      ...cp,
      id: cp.id || idx + 1,
    }));
  }

  // Helper to get point on speed path at path percentage (0-100%)
  const getPointOnSpeedPath = (pathPosition: number) => {
    // Convert path percentage to position along the path
    const pathPercent = pathPosition / 100; // 0 to 1

    switch (speedPath.shape) {
      case "circle":
        // For circle, use angle-based positioning
        const angle = pathPosition * 3.6; // 0-100% => 0-360°
        const rad = ((angle - 90) * Math.PI) / 180;
        return {
          x: centerX + radius * Math.cos(rad),
          y: centerY + radius * Math.sin(rad),
        };

      case "rectangle": {
        const w = (width || radius * 2) / 2;
        const h = (height || radius * 2) / 2;

        // Calculate perimeter
        const perimeter = 2 * (w * 2 + h * 2);
        const distanceAlongPath = pathPercent * perimeter;

        // Start at top-right corner, go clockwise: right edge -> bottom edge -> left edge -> top edge
        const rightEdgeLength = h * 2;
        const bottomEdgeLength = w * 2;
        const leftEdgeLength = h * 2;
        const topEdgeLength = w * 2;

        let x, y;

        if (distanceAlongPath <= rightEdgeLength) {
          // Right edge (moving down)
          const t = distanceAlongPath / rightEdgeLength;
          x = w;
          y = -h + h * 2 * t;
        } else if (distanceAlongPath <= rightEdgeLength + bottomEdgeLength) {
          // Bottom edge (moving left)
          const t = (distanceAlongPath - rightEdgeLength) / bottomEdgeLength;
          x = w - w * 2 * t;
          y = h;
        } else if (
          distanceAlongPath <=
          rightEdgeLength + bottomEdgeLength + leftEdgeLength
        ) {
          // Left edge (moving up)
          const t =
            (distanceAlongPath - rightEdgeLength - bottomEdgeLength) /
            leftEdgeLength;
          x = -w;
          y = h - h * 2 * t;
        } else {
          // Top edge (moving right)
          const t =
            (distanceAlongPath -
              rightEdgeLength -
              bottomEdgeLength -
              leftEdgeLength) /
            topEdgeLength;
          x = -w + w * 2 * t;
          y = -h;
        }

        return { x: centerX + x, y: centerY + y };
      }

      case "pentagon":
      case "hexagon":
      case "octagon": {
        const sides =
          speedPath.shape === "pentagon"
            ? 5
            : speedPath.shape === "hexagon"
            ? 6
            : 8;

        // Convert path position to angle for polygons
        const angleFromPath = pathPosition * 3.6; // 0-100% => 0-360°

        // Find which edge the angle falls on and interpolate
        const anglePerSide = 360 / sides;
        const sideIndex = Math.floor(
          ((angleFromPath + anglePerSide / 2) % 360) / anglePerSide
        );
        const angleInSide =
          ((angleFromPath + anglePerSide / 2) % 360) % anglePerSide;

        // Get the two vertices of this side
        const angle1 = -90 + sideIndex * anglePerSide;
        const angle2 = -90 + (sideIndex + 1) * anglePerSide;
        const rad1 = (angle1 * Math.PI) / 180;
        const rad2 = (angle2 * Math.PI) / 180;

        const v1 = { x: radius * Math.cos(rad1), y: radius * Math.sin(rad1) };
        const v2 = { x: radius * Math.cos(rad2), y: radius * Math.sin(rad2) };

        // Interpolate along the edge
        const t = angleInSide / anglePerSide;
        return {
          x: centerX + v1.x + t * (v2.x - v1.x),
          y: centerY + v1.y + t * (v2.y - v1.y),
        };
      }

      case "oval": {
        const angleOval = pathPosition * 3.6; // 0-100% => 0-360°
        const radOval = ((angleOval - 90) * Math.PI) / 180;
        const radiusX = radius;
        const radiusY = radius * 0.7;
        return {
          x: centerX + radiusX * Math.cos(radOval),
          y: centerY + radiusY * Math.sin(radOval),
        };
      }

      case "star": {
        const angleStar = pathPosition * 3.6; // 0-100% => 0-360°
        const radStar = ((angleStar - 90) * Math.PI) / 180;
        // 5-pointed star
        const points = 5;
        const innerRadius = radius * 0.5;
        const anglePerPoint = 360 / points;
        const isOuter =
          Math.floor(
            ((angleStar + anglePerPoint / 4) % 360) / (anglePerPoint / 2)
          ) %
            2 ===
          0;
        const r = isOuter ? radius : innerRadius;
        return {
          x: centerX + r * Math.cos(radStar),
          y: centerY + r * Math.sin(radStar),
        };
      }

      case "ring": {
        const angleRing = pathPosition * 3.6; // 0-100% => 0-360°
        const radRing = ((angleRing - 90) * Math.PI) / 180;
        // Ring is just a circle
        return {
          x: centerX + radius * Math.cos(radRing),
          y: centerY + radius * Math.sin(radRing),
        };
      }

      default: {
        // Default to circle
        const angleDefault = pathPosition * 3.6; // 0-100% => 0-360°
        const radDefault = ((angleDefault - 90) * Math.PI) / 180;
        return {
          x: centerX + radius * Math.cos(radDefault),
          y: centerY + radius * Math.sin(radDefault),
        };
      }
    }
  };

  return (
    <g
      className="speed-path"
      transform={`rotate(${rotation} ${centerX} ${centerY})`}
    >
      {/* Optional glow effect */}
      <path
        d={shapePath}
        fill="none"
        stroke={color}
        strokeWidth={8}
        opacity={0.2}
        filter="blur(4px)"
      />

      {/* Main speed path line */}
      <path
        d={shapePath}
        fill="none"
        stroke={color}
        strokeWidth={4}
        opacity={0.8}
        strokeLinecap="round"
      />

      {/* Speed Path ID Label */}
      {speedPath.id && (
        <text
          x={centerX}
          y={centerY - radius - 10}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill={color}
          stroke="black"
          strokeWidth="0.5"
        >
          Speed Path {speedPath.id}
        </text>
      )}

      {/* Render charge points */}
      {chargePoints.map((cp, idx) => {
        const pos = getPointOnSpeedPath(cp.pathPosition);
        const cpRadius = (cp.radius || 1) * scale;
        const cpColor = cp.color || "#fbbf24";

        return (
          <g key={idx}>
            {/* Charge point circle */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={cpRadius * 3}
              fill={cpColor}
              opacity={0.8}
              stroke="white"
              strokeWidth="2"
            />
            {/* Charge point number */}
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="14"
              fontWeight="bold"
              fill="black"
            >
              {cp.id || idx + 1}
            </text>
          </g>
        );
      })}
    </g>
  );
}
