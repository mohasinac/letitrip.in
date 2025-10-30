/**
 * Charge Point Renderer Component
 * Renders charge points with button numbers
 */

"use client";

import React from "react";
import { ChargePointConfig, LoopConfig } from "@/types/arenaConfig";

interface ChargePointRendererProps {
  chargePoint: ChargePointConfig;
  loop: LoopConfig;
  centerX: number;
  centerY: number;
  scale: number;
}

export default function ChargePointRenderer({
  chargePoint,
  loop,
  centerX,
  centerY,
  scale,
}: ChargePointRendererProps) {
  const radius = (chargePoint.radius || 1) * scale;
  const color = chargePoint.color || "#fbbf24";

  // Calculate position based on angle on the loop
  const angleRad = (chargePoint.angle * Math.PI) / 180;
  const loopRadius = loop.radius * scale;
  const x = centerX + loopRadius * Math.cos(angleRad);
  const y = centerY + loopRadius * Math.sin(angleRad);

  return (
    <g className="charge-point" data-button={chargePoint.buttonId}>
      {/* Background glow (pulsing) */}
      <circle
        cx={x}
        cy={y}
        r={radius * 2.5}
        fill={color}
        opacity={0.3}
        className="animate-pulse"
      />

      {/* Main circle */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={color}
        stroke="white"
        strokeWidth={2}
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
      />

      {/* Button number */}
      {chargePoint.buttonId && (
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={radius}
          fontWeight="bold"
          fill="black"
        >
          {chargePoint.buttonId}
        </text>
      )}
    </g>
  );
}
