/**
 * Loop Renderer Component
 * Renders loops as PATH LINES (not filled areas)
 */

"use client";

import React from "react";
import { LoopConfig } from "@/types/arenaConfig";
import { generateShapePath } from "@/utils/pathGeneration";

interface LoopRendererProps {
  loop: LoopConfig;
  centerX: number;
  centerY: number;
  scale: number;
}

export default function LoopRenderer({
  loop,
  centerX,
  centerY,
  scale,
}: LoopRendererProps) {
  const radius = loop.radius * scale;
  const width = loop.width ? loop.width * scale : radius * 2;
  const height = loop.height ? loop.height * scale : radius * 2;
  const color = loop.color || "#3b82f6";
  const rotation = loop.rotation || 0;

  // Generate path based on shape
  const shapePath = generateShapePath(
    loop.shape,
    { x: centerX, y: centerY },
    radius,
    width,
    height,
  );

  return (
    <g
      className="loop-path"
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

      {/* Main loop path line */}
      <path
        d={shapePath}
        fill="none"
        stroke={color}
        strokeWidth={4}
        opacity={0.8}
        strokeLinecap="round"
      />
    </g>
  );
}
