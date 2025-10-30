/**
 * Arena Preview Component
 * Renders a live preview of an arena configuration using SVG
 */

"use client";

import React from "react";
import {
  ArenaConfig,
  WaterBodyConfig,
  PitConfig,
  GoalObjectConfig,
  ExitConfig,
  WallConfig,
  LaserGunConfig,
  ArenaShape as ArenaShapeType,
  ArenaTheme,
} from "@/types/arenaConfig";
import LoopRenderer from "@/components/arena/renderers/LoopRenderer";
import ChargePointRenderer from "@/components/arena/renderers/ChargePointRenderer";
import ObstacleRenderer from "@/components/arena/renderers/ObstacleRenderer";
import PortalRenderer from "@/components/arena/renderers/PortalRenderer";
import RotationBodyRenderer from "@/components/arena/renderers/RotationBodyRenderer";
import { generateShapePath, generateArc } from "@/utils/pathGeneration";

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
  // Calculate scale (arena is 50em, canvas is width pixels)
  const scale = Math.min(width, height) / (arena.width * 1.1);
  const centerX = width / 2;
  const centerY = height / 2;

  // Arena boundary dimensions
  const arenaRadius = (arena.width / 2) * scale;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="rounded-lg"
      style={{ maxWidth: "100%", height: "auto" }}
    >
      {/* 1. Floor/Background */}
      <defs>
        <radialGradient id={`bg-gradient-${arena.id}`}>
          <stop offset="0%" stopColor={getThemeColor(arena.theme, 0.3)} />
          <stop offset="100%" stopColor={getThemeColor(arena.theme, 0.1)} />
        </radialGradient>
      </defs>
      <rect
        width={width}
        height={height}
        fill={`url(#bg-gradient-${arena.id})`}
      />

      {/* 2. Arena boundary/shape */}
      <ArenaShape
        shape={arena.shape}
        centerX={centerX}
        centerY={centerY}
        width={arena.width}
        height={arena.height}
        scale={scale}
        theme={arena.theme}
      />

      {/* 3. Water bodies */}
      {arena.waterBody?.enabled && (
        <WaterBodyRenderer
          config={arena.waterBody}
          centerX={centerX}
          centerY={centerY}
          scale={scale}
        />
      )}

      {/* 4. Pits */}
      {arena.pits.map((pit, idx) => (
        <PitRenderer
          key={idx}
          pit={pit}
          centerX={centerX}
          centerY={centerY}
          scale={scale}
        />
      ))}

      {/* 4.5 Rotation Bodies */}
      {arena.rotationBodies?.map((rotationBody, idx) => (
        <g key={idx} transform={`translate(${centerX}, ${centerY})`}>
          <RotationBodyRenderer rotationBody={rotationBody} scale={scale} />
        </g>
      ))}

      {/* 5. Loops (PATH LINES only) */}
      {arena.loops.map((loop, idx) => (
        <LoopRenderer
          key={idx}
          loop={loop}
          centerX={centerX}
          centerY={centerY}
          scale={scale}
        />
      ))}

      {/* 6. Charge points on loops */}
      {arena.loops.map((loop, loopIdx) =>
        loop.chargePoints?.map((cp, cpIdx) => (
          <ChargePointRenderer
            key={`${loopIdx}-${cpIdx}`}
            chargePoint={cp}
            loop={loop}
            centerX={centerX}
            centerY={centerY}
            scale={scale}
          />
        ))
      )}

      {/* 7. Obstacles */}
      {arena.obstacles.map((obstacle, idx) => (
        <g key={idx} transform={`translate(${centerX}, ${centerY})`}>
          <ObstacleRenderer
            obstacle={obstacle}
            theme={arena.theme}
            scale={scale}
          />
        </g>
      ))}

      {/* 8. Goal objects */}
      {arena.goalObjects.map((goal, idx) => (
        <GoalRenderer
          key={idx}
          goal={goal}
          centerX={centerX}
          centerY={centerY}
          scale={scale}
          theme={arena.theme}
        />
      ))}

      {/* 9. Portals */}
      {arena.portals?.map((portal) => (
        <g key={portal.id} transform={`translate(${centerX}, ${centerY})`}>
          <PortalRenderer portal={portal} scale={scale} />
        </g>
      ))}

      {/* 10. Walls and exits */}
      {arena.wall.enabled ? (
        <WallsRenderer
          exits={arena.exits}
          wall={arena.wall}
          centerX={centerX}
          centerY={centerY}
          arenaRadius={arenaRadius}
          shape={arena.shape}
        />
      ) : (
        arena.exits.map((exit, idx) =>
          exit.enabled ? (
            <ExitRenderer
              key={idx}
              exit={exit}
              centerX={centerX}
              centerY={centerY}
              arenaRadius={arenaRadius}
            />
          ) : null
        )
      )}

      {/* 11. Laser guns */}
      {arena.laserGuns.map((laser, idx) => (
        <LaserGunRenderer
          key={idx}
          laser={laser}
          centerX={centerX}
          centerY={centerY}
          scale={scale}
        />
      ))}
    </svg>
  );
}

// Helper function to get theme colors
function getThemeColor(theme: ArenaTheme, alpha: number = 1): string {
  const colors: Record<ArenaTheme, string> = {
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

// Arena Shape Component
function ArenaShape({
  shape,
  centerX,
  centerY,
  width,
  height,
  scale,
  theme,
}: {
  shape: ArenaShapeType;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  scale: number;
  theme: ArenaTheme;
}) {
  const radius = (width / 2) * scale;
  const shapePath = generateShapePath(
    shape,
    { x: centerX, y: centerY },
    radius,
    width * scale,
    height * scale
  );

  return (
    <path
      d={shapePath}
      fill="rgba(255, 255, 255, 0.1)"
      stroke="#333"
      strokeWidth={3}
    />
  );
}

// Water Body Renderer
function WaterBodyRenderer({
  config,
  centerX,
  centerY,
  scale,
}: {
  config: WaterBodyConfig;
  centerX: number;
  centerY: number;
  scale: number;
}) {
  const liquidColors: Record<string, string> = {
    water: "#4fc3f7",
    blood: "#c62828",
    lava: "#ff6f00",
    acid: "#76ff03",
    oil: "#424242",
    ice: "#00e5ff",
  };

  const color = config.color || liquidColors[config.liquidType] || "#4fc3f7";
  const radius = (config.radius || 10) * scale;

  const shapePath = generateShapePath(
    config.shape,
    { x: centerX, y: centerY },
    radius
  );

  return (
    <g className="water-body">
      <path d={shapePath} fill={color} opacity={0.5} />
      {/* Wave lines */}
      {[0.3, 0.5, 0.7].map((factor, idx) => (
        <path
          key={idx}
          d={generateShapePath(
            config.shape === "circle" ? "circle" : config.shape,
            { x: centerX, y: centerY },
            radius * factor
          )}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.7}
        />
      ))}
    </g>
  );
}

// Pit Renderer
function PitRenderer({
  pit,
  centerX,
  centerY,
  scale,
}: {
  pit: PitConfig;
  centerX: number;
  centerY: number;
  scale: number;
}) {
  const x = centerX + pit.x * scale;
  const y = centerY + pit.y * scale;
  const radius = pit.radius * scale;

  return (
    <g className="pit">
      <defs>
        <radialGradient id={`pit-gradient-${pit.x}-${pit.y}`}>
          <stop offset="0%" stopColor="#000" stopOpacity={0.9} />
          <stop offset="60%" stopColor="#222" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#444" stopOpacity={0.6} />
        </radialGradient>
      </defs>

      {/* Main pit */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={`url(#pit-gradient-${pit.x}-${pit.y})`}
      />

      {/* Depth rings */}
      {Array.from({ length: pit.visualDepth || 3 }).map((_, i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={radius * (1 - (i + 1) * 0.15)}
          fill="none"
          stroke="rgba(50,50,50,0.4)"
          strokeWidth={1}
        />
      ))}
    </g>
  );
}

// Goal Object Renderer
function GoalRenderer({
  goal,
  centerX,
  centerY,
  scale,
  theme,
}: {
  goal: GoalObjectConfig;
  centerX: number;
  centerY: number;
  scale: number;
  theme: ArenaTheme;
}) {
  const x = centerX + goal.x * scale;
  const y = centerY + goal.y * scale;
  const radius = goal.radius * scale;

  const goalIcons: Record<string, string> = {
    star: "⭐",
    crystal: "💎",
    coin: "🪙",
    gem: "💠",
    relic: "🏺",
    trophy: "🏆",
  };

  const icon = goalIcons[goal.type] || "⭐";

  return (
    <g className="goal-object">
      {/* Glow effect */}
      <circle
        cx={x}
        cy={y}
        r={radius * 2}
        fill={goal.color || "#fbbf24"}
        opacity={0.2}
        className="animate-pulse"
      />

      {/* Icon */}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={radius * 2}
      >
        {icon}
      </text>
    </g>
  );
}

// Walls Renderer
function WallsRenderer({
  exits,
  wall,
  centerX,
  centerY,
  arenaRadius,
  shape,
}: {
  exits: ExitConfig[];
  wall: WallConfig;
  centerX: number;
  centerY: number;
  arenaRadius: number;
  shape: ArenaShapeType;
}) {
  // Simple implementation: draw full boundary in black, then exits in red
  const fullCircle = `
    M ${centerX - arenaRadius} ${centerY}
    A ${arenaRadius} ${arenaRadius} 0 1 0 ${centerX + arenaRadius} ${centerY}
    A ${arenaRadius} ${arenaRadius} 0 1 0 ${centerX - arenaRadius} ${centerY}
  `;

  return (
    <g className="walls">
      {/* Wall boundary */}
      <path
        d={fullCircle}
        fill="none"
        stroke="#000"
        strokeWidth={wall.thickness * 10 || 4}
      />

      {/* Exits overlay */}
      {exits.map(
        (exit, idx) =>
          exit.enabled && (
            <ExitRenderer
              key={idx}
              exit={exit}
              centerX={centerX}
              centerY={centerY}
              arenaRadius={arenaRadius}
            />
          )
      )}
    </g>
  );
}

// Exit Renderer
function ExitRenderer({
  exit,
  centerX,
  centerY,
  arenaRadius,
}: {
  exit: ExitConfig;
  centerX: number;
  centerY: number;
  arenaRadius: number;
}) {
  const arcPath = generateArc(
    { x: centerX, y: centerY },
    arenaRadius,
    exit.angle - exit.width / 2,
    exit.angle + exit.width / 2
  );

  return (
    <path
      d={arcPath}
      fill="none"
      stroke="#ef4444"
      strokeWidth={6}
      strokeDasharray="10,5"
    />
  );
}

// Laser Gun Renderer
function LaserGunRenderer({
  laser,
  centerX,
  centerY,
  scale,
}: {
  laser: LaserGunConfig;
  centerX: number;
  centerY: number;
  scale: number;
}) {
  const x = centerX + laser.x * scale;
  const y = centerY + laser.y * scale;

  return (
    <g className="laser-gun">
      {/* Base */}
      <circle cx={x} cy={y} r={8} fill="#555" />

      {/* Barrel */}
      <rect x={x - 2} y={y - 12} width={4} height={12} fill="#ff3333" />

      {/* Warning light */}
      <circle cx={x} cy={y} r={3} fill="#ffff00" className="animate-pulse" />
    </g>
  );
}
