/**
 * Portal Renderer Component
 * Renders portals as 2D doors with whirlpool effect
 */

"use client";

import React from "react";
import { PortalConfig } from "@/types/arenaConfig";
import {
  generateWhirlpoolSpiral,
  generateParticles,
} from "@/utils/pathGeneration";
import "@/styles/arena-animations.css";

interface PortalRendererProps {
  portal: PortalConfig;
  scale: number;
}

export default function PortalRenderer({ portal, scale }: PortalRendererProps) {
  const inX = portal.inPoint.x * scale;
  const inY = portal.inPoint.y * scale;
  const outX = portal.outPoint.x * scale;
  const outY = portal.outPoint.y * scale;
  const radius = portal.radius * scale;
  const color = portal.color || "#8b5cf6";

  // Generate particles
  const inParticles = generateParticles({ x: inX, y: inY }, radius, 8);
  const outParticles = generateParticles({ x: outX, y: outY }, radius, 8);

  return (
    <g className="portal-system">
      {/* Connection line */}
      <line
        x1={inX}
        y1={inY}
        x2={outX}
        y2={outY}
        stroke={color}
        strokeWidth={2}
        strokeDasharray="5,5"
        opacity={0.3}
        className="portal-flow-animation"
      />

      {/* Entry Portal (IN) */}
      <g className="portal-in whirlpool">
        {/* Outer vortex ring */}
        <circle
          cx={inX}
          cy={inY}
          r={radius * 1.8}
          fill="none"
          stroke={color}
          strokeWidth={3}
          opacity={0.3}
          strokeDasharray="10,5"
          className="whirlpool-outer-ring"
        />

        {/* Background gradient */}
        <defs>
          <radialGradient id={`whirlpool-gradient-${portal.id}-in`}>
            <stop offset="0%" stopColor="#000" stopOpacity={0.9} />
            <stop offset="40%" stopColor={color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={color} stopOpacity={0.1} />
          </radialGradient>
        </defs>
        <circle
          cx={inX}
          cy={inY}
          r={radius}
          fill={`url(#whirlpool-gradient-${portal.id}-in)`}
        />

        {/* Spiral layers */}
        {[1, 2, 3, 4].map((layer) => (
          <path
            key={layer}
            d={generateWhirlpoolSpiral(
              { x: inX, y: inY },
              radius * (1.5 - layer * 0.3),
              layer * 90,
            )}
            stroke={color}
            strokeWidth={2}
            fill="none"
            opacity={0.6 - layer * 0.1}
            className={`whirlpool-spiral whirlpool-layer-${layer}`}
          />
        ))}

        {/* Center vortex */}
        <circle cx={inX} cy={inY} r={radius * 0.3} fill="#000" opacity={0.8} />

        {/* Particles */}
        <g className="whirlpool-particles">
          {inParticles.map((particle, idx) => (
            <circle
              key={idx}
              cx={particle.x}
              cy={particle.y}
              r={2}
              fill="white"
              opacity={0.6}
              className={`whirlpool-particle whirlpool-particle-${idx}`}
            />
          ))}
        </g>

        {/* Label */}
        <text
          x={inX}
          y={inY - radius * 2 - 5}
          textAnchor="middle"
          fontSize="0.8em"
          fill="white"
          fontWeight="bold"
        >
          IN
        </text>
      </g>

      {/* Exit Portal (OUT) */}
      <g className="portal-out whirlpool">
        {/* Outer vortex ring */}
        <circle
          cx={outX}
          cy={outY}
          r={radius * 1.8}
          fill="none"
          stroke={color}
          strokeWidth={3}
          opacity={0.3}
          strokeDasharray="10,5"
          className="whirlpool-outer-ring-reverse"
        />

        {/* Background gradient */}
        <defs>
          <radialGradient id={`whirlpool-gradient-${portal.id}-out`}>
            <stop offset="0%" stopColor="#000" stopOpacity={0.9} />
            <stop offset="40%" stopColor={color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={color} stopOpacity={0.1} />
          </radialGradient>
        </defs>
        <circle
          cx={outX}
          cy={outY}
          r={radius}
          fill={`url(#whirlpool-gradient-${portal.id}-out)`}
        />

        {/* Spiral layers (reverse rotation) */}
        {[1, 2, 3, 4].map((layer) => (
          <path
            key={layer}
            d={generateWhirlpoolSpiral(
              { x: outX, y: outY },
              radius * (1.5 - layer * 0.3),
              -layer * 90,
            )}
            stroke={color}
            strokeWidth={2}
            fill="none"
            opacity={0.6 - layer * 0.1}
            className={`whirlpool-spiral-reverse whirlpool-layer-${layer}`}
          />
        ))}

        {/* Center vortex */}
        <circle
          cx={outX}
          cy={outY}
          r={radius * 0.3}
          fill="#000"
          opacity={0.8}
        />

        {/* Particles */}
        <g className="whirlpool-particles">
          {outParticles.map((particle, idx) => (
            <circle
              key={idx}
              cx={particle.x}
              cy={particle.y}
              r={2}
              fill="white"
              opacity={0.6}
              className={`whirlpool-particle-reverse whirlpool-particle-${idx}`}
            />
          ))}
        </g>

        {/* Label */}
        <text
          x={outX}
          y={outY - radius * 2 - 5}
          textAnchor="middle"
          fontSize="0.8em"
          fill="white"
          fontWeight="bold"
        >
          OUT
        </text>
      </g>
    </g>
  );
}
