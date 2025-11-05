/**
 * Portal Renderer Component
 * Renders linked portals - all portals are interconnected
 * Entering any portal can teleport to any other portal based on directional input or randomly
 */

"use client";

import React from "react";
import { PortalConfig } from "@/types/arenaConfigNew";
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
  const x = portal.position.x * scale;
  const y = portal.position.y * scale;
  const radius = portal.radius * scale;
  const color = portal.color || "#8b5cf6";
  const portalNum =
    portal.portalNumber || parseInt(portal.id.replace(/\D/g, "")) || 1;

  // Generate particles
  const particles = generateParticles({ x, y }, radius, 8);

  return (
    <g className="portal-linked">
      {/* Portal Whirlpool */}
      <g className="portal whirlpool">
        {/* Outer vortex ring */}
        <circle
          cx={x}
          cy={y}
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
          <radialGradient id={`whirlpool-gradient-${portal.id}`}>
            <stop offset="0%" stopColor="#000" stopOpacity={0.9} />
            <stop offset="40%" stopColor={color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={color} stopOpacity={0.1} />
          </radialGradient>
        </defs>
        <circle
          cx={x}
          cy={y}
          r={radius}
          fill={`url(#whirlpool-gradient-${portal.id})`}
        />

        {/* Spiral layers */}
        {[1, 2, 3, 4].map((layer) => (
          <path
            key={layer}
            d={generateWhirlpoolSpiral(
              { x, y },
              radius * (1.5 - layer * 0.3),
              layer * 90
            )}
            stroke={color}
            strokeWidth={2}
            fill="none"
            opacity={0.6 - layer * 0.1}
            className={`whirlpool-spiral whirlpool-layer-${layer}`}
          />
        ))}

        {/* Center vortex */}
        <circle cx={x} cy={y} r={radius * 0.3} fill="#000" opacity={0.8} />

        {/* Particles */}
        <g className="whirlpool-particles">
          {particles.map((particle, idx) => (
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

        {/* Portal Number (centered) */}
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="20"
          fill="white"
          fontWeight="bold"
          stroke={color}
          strokeWidth="2"
        >
          {portalNum}
        </text>

        {/* Label */}
        <text
          x={x}
          y={y - radius * 2 - 5}
          textAnchor="middle"
          fontSize="12"
          fill={color}
          fontWeight="bold"
          stroke="black"
          strokeWidth="0.5"
        >
          Portal {portalNum}
        </text>
      </g>
    </g>
  );
}
