/**
 * Obstacle Renderer Component
 * Renders obstacles with theme-based visuals
 */

"use client";

import React from "react";
import { ObstacleConfig, ArenaTheme } from "@/types/arenaConfig";

interface ObstacleRendererProps {
  obstacle: ObstacleConfig;
  theme: ArenaTheme;
  scale: number;
}

// Theme-based icons mapping
const themeIcons: Record<ArenaTheme, Record<string, string>> = {
  forest: {
    rock: "🪨",
    pillar: "🌳",
    barrier: "🪵",
    wall: "🌿",
  },
  futuristic: {
    rock: "🔷",
    pillar: "🏢",
    barrier: "⚡",
    wall: "🛡️",
  },
  desert: {
    rock: "🏜️",
    pillar: "🌵",
    barrier: "🧱",
    wall: "🏗️",
  },
  safari: {
    rock: "🪨",
    pillar: "🌴",
    barrier: "🪵",
    wall: "🦁",
  },
  prehistoric: {
    rock: "🦴",
    pillar: "🦕",
    barrier: "🪨",
    wall: "🌋",
  },
  mountains: {
    rock: "⛰️",
    pillar: "🗻",
    barrier: "🪨",
    wall: "🏔️",
  },
  grasslands: {
    rock: "🪨",
    pillar: "🌾",
    barrier: "🪵",
    wall: "🌿",
  },
  metrocity: {
    rock: "🏗️",
    pillar: "🏙️",
    barrier: "🚧",
    wall: "🏢",
  },
  sea: {
    rock: "🪨",
    pillar: "🗿",
    barrier: "⚓",
    wall: "🐚",
  },
  riverbank: {
    rock: "🪨",
    pillar: "🌳",
    barrier: "🪵",
    wall: "🌊",
  },
};

export default function ObstacleRenderer({
  obstacle,
  theme,
  scale,
}: ObstacleRendererProps) {
  const x = obstacle.x * scale;
  const y = obstacle.y * scale;
  const radius = obstacle.radius * scale;
  const rotation = obstacle.rotation || 0;

  // Get theme icon or use custom if specified
  const icon =
    obstacle.themeIcon ||
    themeIcons[theme]?.[obstacle.type] ||
    getDefaultObstacleShape(obstacle.type);

  // Use emoji/icon if available, otherwise draw shape
  const useIcon = typeof icon === "string" && icon.length <= 4;

  return (
    <g className="obstacle" data-type={obstacle.type} data-theme={theme}>
      {useIcon ? (
        // Emoji/Icon rendering
        <>
          <circle
            cx={x}
            cy={y}
            r={radius * 1.2}
            fill="rgba(0,0,0,0.1)"
            filter="blur(2px)"
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={radius * 2}
            transform={`rotate(${rotation} ${x} ${y})`}
          >
            {icon}
          </text>
        </>
      ) : (
        // Shape rendering fallback
        <g transform={`rotate(${rotation} ${x} ${y})`}>
          {obstacle.type === "rock" && (
            <RockShape x={x} y={y} radius={radius} />
          )}
          {obstacle.type === "pillar" && (
            <PillarShape x={x} y={y} radius={radius} />
          )}
          {obstacle.type === "barrier" && (
            <BarrierShape x={x} y={y} radius={radius} />
          )}
          {obstacle.type === "wall" && (
            <WallShape x={x} y={y} radius={radius} />
          )}
        </g>
      )}

      {/* Health bar for destructible obstacles */}
      {obstacle.destructible && obstacle.health !== undefined && (
        <rect
          x={x - radius}
          y={y - radius - 8}
          width={radius * 2}
          height={4}
          fill="rgba(0,0,0,0.3)"
          rx={2}
        />
      )}
      {obstacle.destructible && obstacle.health !== undefined && (
        <rect
          x={x - radius}
          y={y - radius - 8}
          width={radius * 2 * ((obstacle.health || 100) / 100)}
          height={4}
          fill="#22c55e"
          rx={2}
        />
      )}
    </g>
  );
}

// Default obstacle shapes

function getDefaultObstacleShape(type: string): string {
  const defaults: Record<string, string> = {
    rock: "🪨",
    pillar: "⬛",
    barrier: "🚧",
    wall: "🧱",
  };
  return defaults[type] || "🪨";
}

function RockShape({ x, y, radius }: { x: number; y: number; radius: number }) {
  // Irregular rock shape
  const points = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const r = radius * (0.8 + Math.random() * 0.4);
    points.push(`${x + Math.cos(angle) * r},${y + Math.sin(angle) * r}`);
  }

  return (
    <polygon
      points={points.join(" ")}
      fill="#8b4513"
      stroke="#654321"
      strokeWidth={2}
    />
  );
}

function PillarShape({
  x,
  y,
  radius,
}: {
  x: number;
  y: number;
  radius: number;
}) {
  return (
    <>
      <rect
        x={x - radius}
        y={y - radius}
        width={radius * 2}
        height={radius * 2}
        fill="#666"
        stroke="#333"
        strokeWidth={2}
      />
      <rect
        x={x - radius * 0.8}
        y={y - radius * 0.8}
        width={radius * 1.6}
        height={radius * 1.6}
        fill="#888"
        opacity={0.5}
      />
    </>
  );
}

function BarrierShape({
  x,
  y,
  radius,
}: {
  x: number;
  y: number;
  radius: number;
}) {
  // Hexagonal barrier
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    points.push(`${x + Math.cos(angle) * radius},${y + Math.sin(angle) * radius}`);
  }

  return (
    <polygon
      points={points.join(" ")}
      fill="#fbbf24"
      stroke="#f59e0b"
      strokeWidth={3}
    />
  );
}

function WallShape({ x, y, radius }: { x: number; y: number; radius: number }) {
  return (
    <>
      <rect
        x={x - radius}
        y={y - radius}
        width={radius * 2}
        height={radius * 2}
        fill="#78716c"
        stroke="#57534e"
        strokeWidth={2}
      />
      {/* Brick pattern */}
      <line
        x1={x - radius}
        y1={y}
        x2={x + radius}
        y2={y}
        stroke="#57534e"
        strokeWidth={1}
      />
      <line
        x1={x}
        y1={y - radius}
        x2={x}
        y2={y}
        stroke="#57534e"
        strokeWidth={1}
      />
      <line
        x1={x - radius / 2}
        y1={y}
        x2={x - radius / 2}
        y2={y + radius}
        stroke="#57534e"
        strokeWidth={1}
      />
      <line
        x1={x + radius / 2}
        y1={y}
        x2={x + radius / 2}
        y2={y + radius}
        stroke="#57534e"
        strokeWidth={1}
      />
    </>
  );
}
