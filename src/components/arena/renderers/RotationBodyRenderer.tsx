/**
 * Rotation Body Renderer Component
 * Renders rotation bodies as red force fields with rotation indicators
 */

"use client";

import React from "react";
import { RotationBodyConfig } from "@/types/arenaConfig";
import {
  generateShapePath,
  generateRotationArrows,
} from "@/utils/pathGeneration";
import "@/styles/arena-animations.css";

interface RotationBodyRendererProps {
  rotationBody: RotationBodyConfig;
  scale: number;
}

export default function RotationBodyRenderer({
  rotationBody,
  scale,
}: RotationBodyRendererProps) {
  const x = rotationBody.position.x * scale;
  const y = rotationBody.position.y * scale;
  const color = rotationBody.color || "#ef4444";
  const opacity = rotationBody.opacity || 0.5;

  // Generate shape path
  let shapePath: string;
  if (rotationBody.shape === "circle") {
    const radius = (rotationBody.radius || 5) * scale;
    shapePath = generateShapePath("circle", { x, y }, radius);
  } else if (rotationBody.shape === "rectangle") {
    const width = (rotationBody.width || 10) * scale;
    const height = (rotationBody.height || 10) * scale;
    shapePath = generateShapePath("rectangle", { x, y }, 0, width, height);
  } else if (rotationBody.shape === "star") {
    const radius = (rotationBody.radius || 5) * scale;
    shapePath = generateShapePath("star", { x, y }, radius);
  } else {
    // Polygon
    const radius = (rotationBody.radius || 5) * scale;
    const sides = rotationBody.sides || 6;
    shapePath = generateShapePath(
      sides === 5
        ? "pentagon"
        : sides === 6
          ? "hexagon"
          : sides === 8
            ? "octagon"
            : "hexagon",
      { x, y },
      radius,
    );
  }

  // Generate rotation arrows
  const radius = rotationBody.radius
    ? rotationBody.radius * scale
    : rotationBody.width
      ? Math.min(
          (rotationBody.width || 10) * scale,
          (rotationBody.height || 10) * scale,
        ) / 2
      : 5 * scale;

  const arrows = generateRotationArrows(
    { x, y },
    radius,
    rotationBody.direction,
    8,
  );

  return (
    <g className="rotation-body" data-direction={rotationBody.direction}>
      {/* Main rotation area */}
      <path d={shapePath} fill={color} opacity={opacity} />

      {/* Rotation direction indicators (arrows) */}
      {rotationBody.rotationAnimation && (
        <g className="rotation-arrows">
          {arrows.map((arrow, i) => (
            <path
              key={i}
              d={arrow.path}
              fill="white"
              opacity={0.7}
              className={`arrow-animate-${rotationBody.direction}`}
            />
          ))}
        </g>
      )}

      {/* Visual spinning effect (optional animated border) */}
      {rotationBody.rotationAnimation && (
        <path
          d={shapePath}
          fill="none"
          stroke="white"
          strokeWidth={2}
          opacity={0.5}
          strokeDasharray="5,5"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${x} ${y}`}
            to={`${
              rotationBody.direction === "clockwise" ? 360 : -360
            } ${x} ${y}`}
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
      )}
    </g>
  );
}
