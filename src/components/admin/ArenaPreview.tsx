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
import SpeedPathRenderer from "@/components/arena/renderers/SpeedPathRenderer";
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

      {/* 3. Loops (PATH LINES) - Render BEFORE water so they're visible */}
      {arena.loops.map((loop, idx) => (
        <SpeedPathRenderer
          key={idx}
          loop={loop}
          centerX={centerX}
          centerY={centerY}
          scale={scale}
        />
      ))}

      {/* 4. Water bodies - Render AFTER loops so loops are visible on top */}
      {arena.waterBody?.enabled && (
        <WaterBodyRenderer
          config={arena.waterBody}
          arena={arena}
          centerX={centerX}
          centerY={centerY}
          scale={scale}
        />
      )}

      {/* 5. Pits */}
      {arena.pits.map((pit, idx) => (
        <PitRenderer
          key={idx}
          pit={pit}
          centerX={centerX}
          centerY={centerY}
          scale={scale}
        />
      ))}

      {/* 5.5 Rotation Bodies */}
      {arena.rotationBodies?.map((rotationBody, idx) => (
        <g key={idx} transform={`translate(${centerX}, ${centerY})`}>
          <RotationBodyRenderer rotationBody={rotationBody} scale={scale} />
        </g>
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
          arenaWidth={arena.width}
          arenaHeight={arena.height}
          scale={scale}
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
      strokeWidth={2}
    />
  );
}

// Water Body Renderer
function WaterBodyRenderer({
  config,
  arena,
  centerX,
  centerY,
  scale,
}: {
  config: WaterBodyConfig;
  arena: ArenaConfig;
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

  // Handle different water body types
  if (config.type === "center") {
    // CENTER TYPE: Single shape at arena center
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
  } else if (config.type === "moat") {
    // MOAT TYPE: Moat/ring following the loop's shape with stadium floor in center
    const loopIndex = config.loopIndex ?? 0;
    const loop = arena.loops[loopIndex];

    if (!loop) {
      return null; // No loop found at index
    }

    const innerRadius = (config.innerRadius || loop.radius - 3) * scale;
    const outerRadius = (config.outerRadius || loop.radius + 3) * scale;
    const loopWidth = loop.width ? loop.width * scale : innerRadius * 2;
    const loopHeight = loop.height ? loop.height * scale : innerRadius * 2;
    const rotation = loop.rotation || 0;

    // Generate outer and inner shape paths based on loop shape
    const outerPath = generateShapePath(
      loop.shape,
      { x: centerX, y: centerY },
      outerRadius,
      loopWidth * (outerRadius / innerRadius),
      loopHeight * (outerRadius / innerRadius)
    );

    const innerPath = generateShapePath(
      loop.shape,
      { x: centerX, y: centerY },
      innerRadius,
      loopWidth,
      loopHeight
    );

    return (
      <g
        className="water-body-moat"
        transform={`rotate(${rotation} ${centerX} ${centerY})`}
      >
        {/* Outer shape */}
        <path d={outerPath} fill={color} opacity={0.5} />
        {/* Show stadium floor in center instead of white space */}
        <path d={innerPath} fill="rgba(255, 255, 255, 0.1)" opacity={1} />
        {/* Wave lines on moat */}
        {[0.3, 0.5, 0.7].map((factor, idx) => {
          const waveRadius = innerRadius + (outerRadius - innerRadius) * factor;
          const waveWidth =
            loopWidth +
            (loopWidth * (outerRadius / innerRadius) - loopWidth) * factor;
          const waveHeight =
            loopHeight +
            (loopHeight * (outerRadius / innerRadius) - loopHeight) * factor;

          return (
            <path
              key={idx}
              d={generateShapePath(
                loop.shape,
                { x: centerX, y: centerY },
                waveRadius,
                waveWidth,
                waveHeight
              )}
              fill="none"
              stroke={color}
              strokeWidth={1}
              opacity={0.6}
            />
          );
        })}
      </g>
    );
  } else if (config.type === "ring") {
    // RING TYPE: Ring/donut shape using the selected shape with inner and outer radius
    const outerRadius = (config.radius || 15) * scale;
    const thickness = (config.ringThickness || 3) * scale;
    const innerRadius = outerRadius - thickness;
    const rotation = config.rotation || 0;

    // For rectangle/oval, use width/height if provided
    const outerWidth = config.width ? config.width * scale : outerRadius * 2;
    const outerHeight = config.height ? config.height * scale : outerRadius * 2;
    const innerWidth = config.width
      ? (config.width - thickness * 2) * scale
      : innerRadius * 2;
    const innerHeight = config.height
      ? (config.height - thickness * 2) * scale
      : innerRadius * 2;

    // Generate outer and inner shape paths based on selected shape
    const outerPath = generateShapePath(
      config.shape,
      { x: centerX, y: centerY },
      outerRadius,
      outerWidth,
      outerHeight
    );

    const innerPath = generateShapePath(
      config.shape,
      { x: centerX, y: centerY },
      innerRadius,
      innerWidth,
      innerHeight
    );

    return (
      <g
        className="water-body-ring"
        transform={`rotate(${rotation} ${centerX} ${centerY})`}
      >
        {/* Outer shape */}
        <path d={outerPath} fill={color} opacity={0.5} />
        {/* Show stadium floor in center instead of white space */}
        <path d={innerPath} fill="rgba(255, 255, 255, 0.1)" opacity={1} />
        {/* Wave lines on ring */}
        {[0.3, 0.5, 0.7].map((factor, idx) => {
          const waveThickness = thickness * (1 - factor);
          const waveRadius = outerRadius - waveThickness;
          const waveWidth = outerWidth - waveThickness * 2;
          const waveHeight = outerHeight - waveThickness * 2;

          return (
            <path
              key={idx}
              d={generateShapePath(
                config.shape,
                { x: centerX, y: centerY },
                waveRadius,
                waveWidth,
                waveHeight
              )}
              fill="none"
              stroke={color}
              strokeWidth={1}
              opacity={0.6}
            />
          );
        })}
      </g>
    );
  }

  return null;
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
  arenaWidth,
  arenaHeight,
  scale,
}: {
  exits: ExitConfig[];
  wall: WallConfig;
  centerX: number;
  centerY: number;
  arenaRadius: number;
  shape: ArenaShapeType;
  arenaWidth: number;
  arenaHeight: number;
  scale: number;
}) {
  // Get wall widths (em units)
  const wallWidths = wall.wallWidths || {};
  const uniformWidth = wallWidths.uniform ?? wall.thickness ?? 1;

  // For circle shape, use uniform width
  if (shape === "circle") {
    const wallWidth = uniformWidth;

    if (wallWidth === 0) {
      // No walls, entire perimeter is exit
      return (
        <g className="walls">
          <circle
            cx={centerX}
            cy={centerY}
            r={arenaRadius}
            fill="none"
            stroke="#ef4444"
            strokeWidth={4}
            strokeDasharray="10,5"
          />
        </g>
      );
    }

    // Draw wall segments with exits
    return (
      <g className="walls">
        {/* Main wall circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={arenaRadius}
          fill="none"
          stroke="#000"
          strokeWidth={wallWidth * scale}
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

  // For polygon shapes (rectangle, pentagon, hexagon, etc.)
  // Draw walls on each edge based on wallWidths
  const widthScaled = arenaWidth * scale;
  const heightScaled = arenaHeight * scale;

  // Get individual edge widths (0 = no wall = exit)
  const topWidth = wallWidths.top ?? uniformWidth;
  const rightWidth = wallWidths.right ?? uniformWidth;
  const bottomWidth = wallWidths.bottom ?? uniformWidth;
  const leftWidth = wallWidths.left ?? uniformWidth;

  // Generate arena shape path for reference
  const arenaBoundary = generateShapePath(
    shape,
    { x: centerX, y: centerY },
    arenaRadius,
    widthScaled,
    heightScaled
  );

  return (
    <g className="walls">
      {/* Base arena outline (thin) */}
      <path
        d={arenaBoundary}
        fill="none"
        stroke="#333"
        strokeWidth={1}
        opacity={0.3}
      />

      {/* For rectangle, draw individual walls on each edge */}
      {shape === "rectangle" && (
        <>
          {/* Top wall */}
          {topWidth > 0 ? (
            <line
              x1={centerX - widthScaled / 2}
              y1={centerY - heightScaled / 2}
              x2={centerX + widthScaled / 2}
              y2={centerY - heightScaled / 2}
              stroke="#000"
              strokeWidth={topWidth * scale}
            />
          ) : (
            <line
              x1={centerX - widthScaled / 2}
              y1={centerY - heightScaled / 2}
              x2={centerX + widthScaled / 2}
              y2={centerY - heightScaled / 2}
              stroke="#ef4444"
              strokeWidth={4}
              strokeDasharray="10,5"
            />
          )}

          {/* Right wall */}
          {rightWidth > 0 ? (
            <line
              x1={centerX + widthScaled / 2}
              y1={centerY - heightScaled / 2}
              x2={centerX + widthScaled / 2}
              y2={centerY + heightScaled / 2}
              stroke="#000"
              strokeWidth={rightWidth * scale}
            />
          ) : (
            <line
              x1={centerX + widthScaled / 2}
              y1={centerY - heightScaled / 2}
              x2={centerX + widthScaled / 2}
              y2={centerY + heightScaled / 2}
              stroke="#ef4444"
              strokeWidth={4}
              strokeDasharray="10,5"
            />
          )}

          {/* Bottom wall */}
          {bottomWidth > 0 ? (
            <line
              x1={centerX - widthScaled / 2}
              y1={centerY + heightScaled / 2}
              x2={centerX + widthScaled / 2}
              y2={centerY + heightScaled / 2}
              stroke="#000"
              strokeWidth={bottomWidth * scale}
            />
          ) : (
            <line
              x1={centerX - widthScaled / 2}
              y1={centerY + heightScaled / 2}
              x2={centerX + widthScaled / 2}
              y2={centerY + heightScaled / 2}
              stroke="#ef4444"
              strokeWidth={4}
              strokeDasharray="10,5"
            />
          )}

          {/* Left wall */}
          {leftWidth > 0 ? (
            <line
              x1={centerX - widthScaled / 2}
              y1={centerY - heightScaled / 2}
              x2={centerX - widthScaled / 2}
              y2={centerY + heightScaled / 2}
              stroke="#000"
              strokeWidth={leftWidth * scale}
            />
          ) : (
            <line
              x1={centerX - widthScaled / 2}
              y1={centerY - heightScaled / 2}
              x2={centerX - widthScaled / 2}
              y2={centerY + heightScaled / 2}
              stroke="#ef4444"
              strokeWidth={4}
              strokeDasharray="10,5"
            />
          )}
        </>
      )}

      {/* For other polygon shapes, draw wall outline */}
      {shape !== "rectangle" && (
        <>
          {uniformWidth > 0 ? (
            <path
              d={arenaBoundary}
              fill="none"
              stroke="#000"
              strokeWidth={uniformWidth * scale}
            />
          ) : (
            <path
              d={arenaBoundary}
              fill="none"
              stroke="#ef4444"
              strokeWidth={4}
              strokeDasharray="10,5"
            />
          )}

          {/* Exits overlay for polygon shapes */}
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
        </>
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
