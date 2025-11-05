/**
 * Basic Arena Preview Component
 * Renders: Name, Shape, Theme, Auto-Rotate, Walls with brick pattern, Exits with arrows
 * With zoom controls for actual resolution viewing
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArenaConfig,
  ArenaShape,
  ArenaTheme,
  getEdgeCount,
  LoopConfig,
  PortalConfig,
  PitConfig,
  ARENA_RESOLUTION,
  OBSTACLE_ICONS,
  ObstacleConfig,
} from "@/types/arenaConfigNew";
import { generateShapePath } from "@/utils/pathGeneration";
import SpeedPathRenderer from "@/components/arena/renderers/SpeedPathRenderer";
import PortalRenderer from "@/components/arena/renderers/PortalRenderer";
import WaterBodyRenderer from "@/components/arena/renderers/WaterBodyRenderer";

interface ArenaPreviewBasicProps {
  arena: ArenaConfig;
  width?: number;
  height?: number;
  showZoomControls?: boolean; // New prop for zoom controls
}

export default function ArenaPreviewBasic({
  arena,
  width = 400,
  height = 400,
  showZoomControls = false,
}: ArenaPreviewBasicProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rotationRef = useRef<number>(0);
  const [zoom, setZoom] = useState<number>(1); // Zoom level: 0.5 to 2

  // Calculate scale using 1080x1080 resolution approach
  // Scale to fit the shortest dimension of the display area
  const displaySize = Math.min(width, height);
  const baseScale = displaySize / ARENA_RESOLUTION;
  const scale = baseScale * zoom; // Apply zoom multiplier
  const centerX = width / 2;
  const centerY = height / 2;
  const arenaRadius = (ARENA_RESOLUTION / 2) * scale;

  // Auto-rotation animation
  useEffect(() => {
    const arenaGroup = svgRef.current?.querySelector("#arena-rotating-group");

    if (!arena.autoRotate) {
      // Reset rotation to 0 when rotation is disabled
      if (arenaGroup) {
        // Smoothly animate back to 0
        const currentRotation = rotationRef.current;
        const resetDuration = 500; // 500ms animation
        const startTime = Date.now();

        const resetAnimation = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / resetDuration, 1);

          // Ease out animation
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          rotationRef.current = currentRotation * (1 - easeProgress);

          arenaGroup.setAttribute(
            "transform",
            `rotate(${rotationRef.current} ${centerX} ${centerY})`
          );

          if (progress < 1) {
            requestAnimationFrame(resetAnimation);
          } else {
            rotationRef.current = 0;
          }
        };

        resetAnimation();
      }
      return;
    }

    if (!svgRef.current) return;

    let animationFrameId: number;

    const animate = () => {
      const direction = arena.rotationDirection === "clockwise" ? 1 : -1;
      rotationRef.current += (arena.rotationSpeed / 60) * direction; // Convert to per-frame

      if (arenaGroup) {
        arenaGroup.setAttribute(
          "transform",
          `rotate(${rotationRef.current} ${centerX} ${centerY})`
        );
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    arena.autoRotate,
    arena.rotationSpeed,
    arena.rotationDirection,
    centerX,
    centerY,
  ]);

  return (
    <div className="arena-preview-container relative">
      {/* Zoom Controls */}
      {showZoomControls && (
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 bg-gray-800 rounded-lg p-2 shadow-lg">
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold"
            title="Zoom In"
          >
            +
          </button>
          <div className="text-white text-xs text-center font-mono">
            {Math.round(zoom * 100)}%
          </div>
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold"
            title="Zoom Out"
          >
            −
          </button>
          <button
            onClick={() => setZoom(1)}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs"
            title="Reset Zoom"
          >
            Reset
          </button>
          <div className="text-gray-400 text-xs text-center border-t border-gray-600 pt-2 mt-1">
            {ARENA_RESOLUTION}×{ARENA_RESOLUTION}
          </div>
        </div>
      )}

      {/* Arena Info Header */}
      <div className="arena-info mb-4 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-bold text-white mb-2">{arena.name}</h2>
        {arena.description && (
          <p className="text-gray-300 text-sm mb-2">{arena.description}</p>
        )}
        <div className="flex gap-4 text-sm text-gray-400">
          <span>
            Shape:{" "}
            <span className="text-blue-400 font-semibold">{arena.shape}</span>
          </span>
          <span>
            Theme:{" "}
            <span className="text-green-400 font-semibold">{arena.theme}</span>
          </span>
          {arena.autoRotate && (
            <span className="text-yellow-400">
              ⟳ Rotating {arena.rotationDirection} ({arena.rotationSpeed}°/s)
            </span>
          )}
        </div>
      </div>

      {/* SVG Arena Preview */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="rounded-lg border-2 border-gray-700"
        style={{
          maxWidth: "100%",
          height: "auto",
          background: getThemeBackgroundColor(arena.theme),
        }}
      >
        <defs>
          {/* Brick pattern for walls */}
          <pattern
            id="brickPattern"
            x="0"
            y="0"
            width="30"
            height="15"
            patternUnits="userSpaceOnUse"
          >
            {/* Brown brick base */}
            <rect width="30" height="15" fill="#8B4513" />
            {/* Top row bricks */}
            <rect
              x="0"
              y="0"
              width="14"
              height="7"
              fill="#A0522D"
              stroke="#654321"
              strokeWidth="0.5"
            />
            <rect
              x="16"
              y="0"
              width="14"
              height="7"
              fill="#A0522D"
              stroke="#654321"
              strokeWidth="0.5"
            />
            {/* Bottom row bricks - offset */}
            <rect
              x="-8"
              y="8"
              width="14"
              height="7"
              fill="#CD853F"
              stroke="#654321"
              strokeWidth="0.5"
            />
            <rect
              x="8"
              y="8"
              width="14"
              height="7"
              fill="#CD853F"
              stroke="#654321"
              strokeWidth="0.5"
            />
            <rect
              x="24"
              y="8"
              width="14"
              height="7"
              fill="#CD853F"
              stroke="#654321"
              strokeWidth="0.5"
            />
          </pattern>

          {/* Metal pattern for walls */}
          <pattern
            id="metalPattern"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <rect width="40" height="40" fill="#9CA3AF" />
            <line
              x1="0"
              y1="20"
              x2="40"
              y2="20"
              stroke="#6B7280"
              strokeWidth="2"
            />
            <line
              x1="20"
              y1="0"
              x2="20"
              y2="40"
              stroke="#6B7280"
              strokeWidth="2"
            />
            <circle cx="20" cy="20" r="3" fill="#4B5563" />
            <circle cx="0" cy="0" r="2" fill="#4B5563" />
            <circle cx="40" cy="0" r="2" fill="#4B5563" />
            <circle cx="0" cy="40" r="2" fill="#4B5563" />
            <circle cx="40" cy="40" r="2" fill="#4B5563" />
          </pattern>

          {/* Wood pattern for walls */}
          <pattern
            id="woodPattern"
            x="0"
            y="0"
            width="50"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <rect width="50" height="20" fill="#8B4513" />
            <rect x="0" y="0" width="49" height="19" fill="#A0522D" />
            <line
              x1="0"
              y1="4"
              x2="50"
              y2="4"
              stroke="#654321"
              strokeWidth="0.5"
              opacity="0.3"
            />
            <line
              x1="0"
              y1="9"
              x2="50"
              y2="9"
              stroke="#654321"
              strokeWidth="0.5"
              opacity="0.2"
            />
            <line
              x1="0"
              y1="14"
              x2="50"
              y2="14"
              stroke="#654321"
              strokeWidth="0.5"
              opacity="0.3"
            />
            <ellipse
              cx="10"
              cy="10"
              rx="3"
              ry="4"
              fill="#654321"
              opacity="0.2"
            />
            <ellipse
              cx="30"
              cy="8"
              rx="2"
              ry="3"
              fill="#654321"
              opacity="0.15"
            />
            <ellipse
              cx="45"
              cy="12"
              rx="2.5"
              ry="3.5"
              fill="#654321"
              opacity="0.18"
            />
          </pattern>

          {/* Stone pattern for walls */}
          <pattern
            id="stonePattern"
            x="0"
            y="0"
            width="45"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <rect width="45" height="30" fill="#808080" />
            <rect
              x="0"
              y="0"
              width="20"
              height="14"
              fill="#9E9E9E"
              stroke="#505050"
              strokeWidth="1"
            />
            <rect
              x="22"
              y="0"
              width="23"
              height="14"
              fill="#A9A9A9"
              stroke="#505050"
              strokeWidth="1"
            />
            <rect
              x="0"
              y="16"
              width="15"
              height="14"
              fill="#9E9E9E"
              stroke="#505050"
              strokeWidth="1"
            />
            <rect
              x="17"
              y="16"
              width="28"
              height="14"
              fill="#A9A9A9"
              stroke="#505050"
              strokeWidth="1"
            />
          </pattern>

          {/* Arrow marker for exits */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
          </marker>

          {/* Theme gradient */}
          <radialGradient id="floorGradient">
            <stop offset="0%" stopColor={getThemeColor(arena.theme, 0.3)} />
            <stop offset="100%" stopColor={getThemeColor(arena.theme, 0.1)} />
          </radialGradient>
        </defs>
        {/* Background floor */}
        <rect width={width} height={height} fill="url(#floorGradient)" />{" "}
        {/*
          Rotating group (if auto-rotate enabled)
          NOTE: All walls, exits, speed paths, and portals are inside this group,
          so rotation is automatically applied to exit arrows as well.
          Exit arrows are positioned relative to the arena geometry, not the viewport.
        */}
        <g id="arena-rotating-group">
          {/* Arena floor shape */}
          <ArenaFloor
            shape={arena.shape}
            centerX={centerX}
            centerY={centerY}
            width={ARENA_RESOLUTION}
            height={ARENA_RESOLUTION}
            scale={scale}
            theme={arena.theme}
          />

          {/* Water Bodies - Render BEFORE speed paths and portals */}
          {arena.waterBodies?.map((waterBody, idx) => (
            <WaterBodyRenderer
              key={waterBody.id || idx}
              waterBody={waterBody}
              arenaShape={arena.shape}
              arenaRadius={arenaRadius}
              centerX={centerX}
              centerY={centerY}
              scale={scale}
              arenaWidth={ARENA_RESOLUTION}
              arenaHeight={ARENA_RESOLUTION}
            />
          ))}

          {/* Speed Paths (speed boost paths that players travel along) */}
          {(arena.speedPaths || arena.loops)?.map((speedPath, idx) => (
            <SpeedPathRenderer
              key={idx}
              speedPath={{ ...speedPath, id: speedPath.id || idx + 1 }}
              centerX={centerX}
              centerY={centerY}
              scale={scale}
            />
          ))}

          {/* Portals (teleportation) */}
          {arena.portals?.map((portal, idx) => (
            <g key={portal.id} transform={`translate(${centerX}, ${centerY})`}>
              <PortalRenderer
                portal={{
                  ...portal,
                  portalNumber: portal.portalNumber || idx + 1,
                }}
                scale={scale}
              />
            </g>
          ))}

          {/* Pits (hazards) - Render BEFORE walls so walls are on top */}
          {arena.pits?.map((pit, idx) => (
            <g key={pit.id}>
              <PitRenderer
                pit={pit}
                scale={scale}
                theme={arena.theme}
                centerX={centerX}
                centerY={centerY}
              />
            </g>
          ))}

          {/* Obstacles - Render after pits but before walls */}
          {arena.obstacles?.map((obstacle, idx) => (
            <g key={obstacle.id || idx}>
              <ObstacleRenderer
                obstacle={obstacle}
                theme={arena.theme}
                scale={scale}
                centerX={centerX}
                centerY={centerY}
              />
            </g>
          ))}

          {/* Walls and Exits */}
          {arena.wall.enabled && (
            <WallsRenderer
              wall={arena.wall}
              shape={arena.shape}
              centerX={centerX}
              centerY={centerY}
              arenaRadius={arenaRadius}
              scale={scale}
            />
          )}
        </g>
        {/* Center dot (for visual reference) */}
        <circle cx={centerX} cy={centerY} r={3} fill="white" opacity={0.5} />
      </svg>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ArenaFloor({
  shape,
  centerX,
  centerY,
  width,
  height,
  scale,
  theme,
}: {
  shape: ArenaShape;
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
      stroke={getThemeColor(theme, 0.5)}
      strokeWidth={2}
    />
  );
}

function WallsRenderer({
  wall,
  shape,
  centerX,
  centerY,
  arenaRadius,
  scale,
}: {
  wall: any;
  shape: ArenaShape;
  centerX: number;
  centerY: number;
  arenaRadius: number;
  scale: number;
}) {
  const edgeCount = getEdgeCount(shape);

  if (shape === "circle") {
    return (
      <CircleWalls
        wall={wall}
        centerX={centerX}
        centerY={centerY}
        arenaRadius={arenaRadius}
        scale={scale}
      />
    );
  }

  return (
    <PolygonWalls
      wall={wall}
      shape={shape}
      edgeCount={edgeCount}
      centerX={centerX}
      centerY={centerY}
      arenaRadius={arenaRadius}
      scale={scale}
    />
  );
}

function CircleWalls({
  wall,
  centerX,
  centerY,
  arenaRadius,
  scale,
}: {
  wall: any;
  centerX: number;
  centerY: number;
  arenaRadius: number;
  scale: number;
}) {
  // Handle null/undefined wall or missing edges
  if (!wall || !wall.edges || wall.edges.length === 0) {
    return null;
  }

  const edgeConfig = wall.edges[0]; // Circle has only 1 edge

  return (
    <g className="circle-walls">
      {edgeConfig.walls.map((wallSegment: any, idx: number) => {
        // Convert position and width percentages to angles
        const startAngle = (wallSegment.position / 100) * 360;
        const endAngle = startAngle + (wallSegment.width / 100) * 360;
        const thickness = wallSegment.thickness * scale;

        // Draw wall arc at the edge (wall extends OUTWARD)
        const innerRadius = arenaRadius;
        const outerRadius = arenaRadius + thickness;

        // Create wall path as a filled arc segment
        const outerStart = polarToCartesian(
          centerX,
          centerY,
          outerRadius,
          startAngle
        );
        const outerEnd = polarToCartesian(
          centerX,
          centerY,
          outerRadius,
          endAngle
        );
        const innerStart = polarToCartesian(
          centerX,
          centerY,
          innerRadius,
          startAngle
        );
        const innerEnd = polarToCartesian(
          centerX,
          centerY,
          innerRadius,
          endAngle
        );

        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        const wallPath = [
          `M ${outerStart.x} ${outerStart.y}`,
          `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
          `L ${innerEnd.x} ${innerEnd.y}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
          `Z`,
        ].join(" ");

        // Calculate wall center for label
        const midAngle = (startAngle + endAngle) / 2;
        const labelRadius = arenaRadius + thickness / 2;
        const labelPos = polarToCartesian(
          centerX,
          centerY,
          labelRadius,
          midAngle
        );
        const wallId = wallSegment.id || `W${idx + 1}`;

        // Get wall pattern based on style
        const getWallPattern = (style: string) => {
          switch (style) {
            case "metal":
              return "url(#metalPattern)";
            case "wood":
              return "url(#woodPattern)";
            case "stone":
              return "url(#stonePattern)";
            case "brick":
            default:
              return "url(#brickPattern)";
          }
        };

        return (
          <g key={idx}>
            {/* Wall segment with pattern based on style */}
            <path
              d={wallPath}
              fill={getWallPattern(wall.wallStyle)}
              stroke="#654321"
              strokeWidth="1"
            />
            {/* Shadow */}
            <path d={wallPath} fill="rgba(0, 0, 0, 0.2)" pointerEvents="none" />

            {/* Wall ID Label */}
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="bold"
              fill="white"
              stroke="black"
              strokeWidth="0.5"
            >
              {wallId}
            </text>

            {/* Add spikes if enabled */}
            {wall.hasSpikes &&
              renderCircleSpikes(
                centerX,
                centerY,
                outerRadius,
                startAngle,
                endAngle,
                thickness
              )}
          </g>
        );
      })}

      {/* Draw exits (gaps between walls) */}
      {getCircleExits(edgeConfig).map((exit: any, idx: number) => {
        const exitSpan = exit.end - exit.start;

        // Draw a thin red passable wall structure
        const startAngle = exit.start;
        const endAngle = exit.end;
        const exitThickness = 3; // Thin red line

        // Create exit arc path (thin red line at arena edge)
        const innerRadius = arenaRadius;
        const outerRadius = arenaRadius + exitThickness;

        const outerStart = polarToCartesian(
          centerX,
          centerY,
          outerRadius,
          startAngle
        );
        const outerEnd = polarToCartesian(
          centerX,
          centerY,
          outerRadius,
          endAngle
        );
        const innerStart = polarToCartesian(
          centerX,
          centerY,
          innerRadius,
          startAngle
        );
        const innerEnd = polarToCartesian(
          centerX,
          centerY,
          innerRadius,
          endAngle
        );

        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        const exitPath = [
          `M ${outerStart.x} ${outerStart.y}`,
          `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
          `L ${innerEnd.x} ${innerEnd.y}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
          `Z`,
        ].join(" ");

        // Calculate exit center for label
        const midAngle = (startAngle + endAngle) / 2;
        const labelRadius = arenaRadius + exitThickness / 2;
        const labelPos = polarToCartesian(
          centerX,
          centerY,
          labelRadius,
          midAngle
        );

        return (
          <g key={`exit-${idx}`}>
            {/* Thin red passable wall structure */}
            <path
              d={exitPath}
              fill={wall.exitColor}
              opacity={0.6}
              pointerEvents="none"
            />
            {/* Exit ID Label */}
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="bold"
              fill="white"
              stroke="black"
              strokeWidth="0.5"
            >
              E{idx + 1}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function PolygonWalls({
  wall,
  shape,
  edgeCount,
  centerX,
  centerY,
  arenaRadius,
  scale,
}: {
  wall: any;
  shape: ArenaShape;
  edgeCount: number;
  centerX: number;
  centerY: number;
  arenaRadius: number;
  scale: number;
}) {
  // Calculate vertices based on shape type
  let vertices;
  if (shape.startsWith("star")) {
    const points = parseInt(shape.replace("star", ""));
    vertices = getStarVertices(centerX, centerY, arenaRadius, points);
  } else {
    vertices = getPolygonVertices(
      shape,
      centerX,
      centerY,
      arenaRadius,
      edgeCount
    );
  }

  // Handle null/undefined wall or missing edges
  if (!wall || !wall.edges || wall.edges.length === 0) {
    return null;
  }

  return (
    <g className="polygon-walls">
      {wall.edges.map((edgeConfig: any, edgeIdx: number) => {
        const v1 = vertices[edgeIdx];
        const v2 = vertices[(edgeIdx + 1) % vertices.length];
        const edgeLength = Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2);

        return (
          <g key={edgeIdx}>
            {/* Draw walls on this edge */}
            {edgeConfig.walls.map((wallSegment: any, wallIdx: number) => {
              const startPos = (wallSegment.position / 100) * edgeLength;
              const wallLength = (wallSegment.width / 100) * edgeLength;
              const thickness = wallSegment.thickness * scale;

              const startX = v1.x + (startPos / edgeLength) * (v2.x - v1.x);
              const startY = v1.y + (startPos / edgeLength) * (v2.y - v1.y);
              const endX = startX + (wallLength / edgeLength) * (v2.x - v1.x);
              const endY = startY + (wallLength / edgeLength) * (v2.y - v1.y);

              // Calculate perpendicular for wall thickness (OUTWARD from edge)
              const edgeVecX = v2.x - v1.x;
              const edgeVecY = v2.y - v1.y;
              let perpX = -edgeVecY;
              let perpY = edgeVecX;
              const perpLen = Math.sqrt(perpX ** 2 + perpY ** 2);
              perpX = (perpX / perpLen) * thickness;
              perpY = (perpY / perpLen) * thickness;

              // Check if perpendicular points inward to center
              const edgeMidX = (v1.x + v2.x) / 2;
              const edgeMidY = (v1.y + v2.y) / 2;
              const toCenter = { x: centerX - edgeMidX, y: centerY - edgeMidY };
              const dotProduct =
                (perpX / thickness) * toCenter.x +
                (perpY / thickness) * toCenter.y;

              if (dotProduct > 0) {
                // Pointing inward, flip it to point outward
                perpX = -perpX;
                perpY = -perpY;
              }

              // Create wall polygon (filled rectangle)
              const wallPath = `M ${startX} ${startY} L ${endX} ${endY} L ${
                endX + perpX
              } ${endY + perpY} L ${startX + perpX} ${startY + perpY} Z`;

              // Calculate wall center for label
              const wallCenterX =
                (startX + endX + startX + perpX + endX + perpX) / 4;
              const wallCenterY =
                (startY + endY + startY + perpY + endY + perpY) / 4;
              const wallId = wallSegment.id || `E${edgeIdx + 1}W${wallIdx + 1}`;

              // Get wall pattern based on style
              const getWallPattern = (style: string) => {
                switch (style) {
                  case "metal":
                    return "url(#metalPattern)";
                  case "wood":
                    return "url(#woodPattern)";
                  case "stone":
                    return "url(#stonePattern)";
                  case "brick":
                  default:
                    return "url(#brickPattern)";
                }
              };

              return (
                <g key={wallIdx}>
                  {/* Wall with pattern based on style */}
                  <path
                    d={wallPath}
                    fill={getWallPattern(wall.wallStyle)}
                    stroke="#654321"
                    strokeWidth="1"
                  />
                  {/* Shadow */}
                  <path
                    d={wallPath}
                    fill="rgba(0, 0, 0, 0.2)"
                    pointerEvents="none"
                  />

                  {/* Wall ID Label */}
                  <text
                    x={wallCenterX}
                    y={wallCenterY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="white"
                    stroke="black"
                    strokeWidth="0.5"
                  >
                    {wallId}
                  </text>

                  {/* Add spikes if enabled */}
                  {wall.hasSpikes &&
                    renderPolygonSpikes(
                      startX,
                      startY,
                      endX,
                      endY,
                      perpX,
                      perpY,
                      thickness
                    )}
                </g>
              );
            })}

            {/* Draw exits (gaps) on this edge */}
            {getEdgeExits(edgeConfig, v1, v2, edgeLength).map(
              (exit: any, exitIdx: number) => {
                const exitThickness = 3; // Thin red line

                // Calculate outward direction (perpendicular to edge)
                const edgeVecX = v2.x - v1.x;
                const edgeVecY = v2.y - v1.y;

                let perpX = -edgeVecY;
                let perpY = edgeVecX;

                const perpLen = Math.sqrt(perpX ** 2 + perpY ** 2);
                perpX = (perpX / perpLen) * exitThickness;
                perpY = (perpY / perpLen) * exitThickness;

                const edgeMidX = (v1.x + v2.x) / 2;
                const edgeMidY = (v1.y + v2.y) / 2;
                const toCenter = {
                  x: centerX - edgeMidX,
                  y: centerY - edgeMidY,
                };

                const dotProduct = perpX * toCenter.x + perpY * toCenter.y;
                if (dotProduct > 0) {
                  perpX = -perpX;
                  perpY = -perpY;
                }

                // Create thin red passable wall structure
                const exitPath = `M ${exit.start.x} ${exit.start.y} L ${
                  exit.end.x
                } ${exit.end.y} L ${exit.end.x + perpX} ${
                  exit.end.y + perpY
                } L ${exit.start.x + perpX} ${exit.start.y + perpY} Z`;

                // Calculate exit center for label
                const exitCenterX =
                  (exit.start.x +
                    exit.end.x +
                    exit.start.x +
                    perpX +
                    exit.end.x +
                    perpX) /
                  4;
                const exitCenterY =
                  (exit.start.y +
                    exit.end.y +
                    exit.start.y +
                    perpY +
                    exit.end.y +
                    perpY) /
                  4;

                return (
                  <g key={`exit-${exitIdx}`}>
                    {/* Thin red passable wall structure */}
                    <path
                      d={exitPath}
                      fill={wall.exitColor}
                      opacity={0.6}
                      pointerEvents="none"
                    />
                    {/* Exit ID Label */}
                    <text
                      x={exitCenterX}
                      y={exitCenterY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="white"
                      stroke="black"
                      strokeWidth="0.5"
                    >
                      E{edgeIdx + 1}X{exitIdx + 1}
                    </text>
                  </g>
                );
              }
            )}
          </g>
        );
      })}
    </g>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Pit Renderer - Renders a pit based on theme
function PitRenderer({
  pit,
  scale,
  theme,
  centerX,
  centerY,
}: {
  pit: PitConfig;
  scale: number;
  theme: ArenaTheme;
  centerX: number;
  centerY: number;
}) {
  const x = centerX + pit.position.x * scale;
  const y = centerY + pit.position.y * scale;
  const radius = pit.radius * scale;

  // Get theme-specific pit colors
  const getPitColors = (theme: ArenaTheme) => {
    const themeColors: Record<
      ArenaTheme,
      { outer: string; mid: string; inner: string; shadow: string }
    > = {
      forest: {
        outer: "#3d2817",
        mid: "#2d1810",
        inner: "#1a0f08",
        shadow: "rgba(0, 0, 0, 0.8)",
      },
      mountains: {
        outer: "#4a4a4a",
        mid: "#2f2f2f",
        inner: "#1a1a1a",
        shadow: "rgba(0, 0, 0, 0.7)",
      },
      grasslands: {
        outer: "#5d4a27",
        mid: "#3d2817",
        inner: "#1f1408",
        shadow: "rgba(0, 0, 0, 0.8)",
      },
      metrocity: {
        outer: "#3a3a3a",
        mid: "#252525",
        inner: "#0f0f0f",
        shadow: "rgba(0, 0, 0, 0.9)",
      },
      safari: {
        outer: "#8b7355",
        mid: "#5d4a27",
        inner: "#2d1810",
        shadow: "rgba(0, 0, 0, 0.7)",
      },
      prehistoric: {
        outer: "#5d3a1a",
        mid: "#3d2010",
        inner: "#1a0f08",
        shadow: "rgba(0, 0, 0, 0.8)",
      },
      futuristic: {
        outer: "#4a3d5c",
        mid: "#2f1f3d",
        inner: "#15081d",
        shadow: "rgba(138, 43, 226, 0.3)",
      },
      desert: {
        outer: "#c4a57b",
        mid: "#8b7355",
        inner: "#5d4a27",
        shadow: "rgba(0, 0, 0, 0.6)",
      },
      sea: {
        outer: "#1e5a7a",
        mid: "#0d3d5a",
        inner: "#05202d",
        shadow: "rgba(0, 0, 0, 0.7)",
      },
      ocean: {
        outer: "#1a4d6b",
        mid: "#0c3047",
        inner: "#051823",
        shadow: "rgba(0, 0, 0, 0.8)",
      },
      riverbank: {
        outer: "#4a6869",
        mid: "#2d4445",
        inner: "#152223",
        shadow: "rgba(0, 0, 0, 0.7)",
      },
    };
    return themeColors[theme] || themeColors.metrocity;
  };

  const colors = pit.color
    ? {
        outer: pit.color,
        mid: adjustBrightness(pit.color, -30),
        inner: adjustBrightness(pit.color, -60),
        shadow: "rgba(0, 0, 0, 0.7)",
      }
    : getPitColors(theme);

  // Create depth effect with multiple circles
  const depthLayers = Math.min(Math.max(3, pit.depth), 10);

  return (
    <g className="pit">
      {/* Shadow/glow around pit */}
      <circle
        cx={x}
        cy={y}
        r={radius * 1.2}
        fill={colors.shadow}
        opacity={0.5}
      />

      {/* Depth layers - create 3D hole effect */}
      {Array.from({ length: depthLayers }).map((_, i) => {
        const layerProgress = i / (depthLayers - 1);
        const layerRadius = radius * (1 - layerProgress * 0.6);
        const layerColor = interpolateColor(
          colors.outer,
          colors.inner,
          layerProgress
        );

        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={layerRadius}
            fill={layerColor}
            opacity={0.9}
          />
        );
      })}

      {/* Inner dark hole */}
      <circle cx={x} cy={y} r={radius * 0.4} fill={colors.inner} />

      {/* Edge highlight for crater type */}
      {pit.type === "crater" && (
        <circle
          cx={x}
          cy={y}
          r={radius}
          fill="none"
          stroke={colors.outer}
          strokeWidth={2}
          opacity={0.6}
        />
      )}

      {/* Pit label */}
      <text
        x={x}
        y={y + radius + 12}
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="white"
        stroke="black"
        strokeWidth="0.5"
      >
        {pit.type === "edge" ? "🕳️" : "⚫"} {pit.id}
      </text>
    </g>
  );
}

// Helper function to adjust color brightness
function adjustBrightness(hexColor: string, percent: number): string {
  // Convert hex to RGB
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Adjust brightness
  const newR = Math.max(0, Math.min(255, r + percent));
  const newG = Math.max(0, Math.min(255, g + percent));
  const newB = Math.max(0, Math.min(255, b + percent));

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, "0")}${newG
    .toString(16)
    .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

// Helper function to interpolate between two colors
function interpolateColor(
  color1: string,
  color2: string,
  factor: number
): string {
  // Convert hex to RGB
  const hex1 = color1.replace("#", "");
  const hex2 = color2.replace("#", "");

  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);

  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);

  // Interpolate
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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
    ocean: `rgba(0, 105, 148, ${alpha})`,
    riverbank: `rgba(95, 158, 160, ${alpha})`,
  };
  return colors[theme] || `rgba(128, 128, 128, ${alpha})`;
}

function getThemeBackgroundColor(theme: ArenaTheme): string {
  return getThemeColor(theme, 0.15);
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function getPolygonVertices(
  shape: ArenaShape,
  centerX: number,
  centerY: number,
  radius: number,
  sides: number
) {
  // Special case for square: use axis-aligned rectangle (no bounding box scaling)
  if (sides === 4) {
    return [
      { x: centerX - radius, y: centerY - radius },
      { x: centerX + radius, y: centerY - radius },
      { x: centerX + radius, y: centerY + radius },
      { x: centerX - radius, y: centerY + radius },
    ];
  }

  // For all other polygons, calculate base vertices and apply bounding box scaling
  const baseVertices: Array<{ x: number; y: number }> = [];
  const startAngle =
    sides % 2 === 0
      ? -Math.PI / 2 // Even sides: start at top
      : -Math.PI / 2 + Math.PI / sides; // Odd sides: offset for flat bottom

  for (let i = 0; i < sides; i++) {
    const angle = startAngle + (i * 2 * Math.PI) / sides;
    baseVertices.push({
      x: Math.cos(angle),
      y: Math.sin(angle),
    });
  }

  // Find bounding box of the normalized shape
  const minX = Math.min(...baseVertices.map((v) => v.x));
  const maxX = Math.max(...baseVertices.map((v) => v.x));
  const minY = Math.min(...baseVertices.map((v) => v.y));
  const maxY = Math.max(...baseVertices.map((v) => v.y));

  const width = maxX - minX;
  const height = maxY - minY;

  // Scale to fit the full radius in both dimensions
  const scaleX = (2 * radius) / width;
  const scaleY = (2 * radius) / height;

  // Apply scaling and centering
  return baseVertices.map((v) => ({
    x: centerX + (v.x - (minX + maxX) / 2) * scaleX,
    y: centerY + (v.y - (minY + maxY) / 2) * scaleY,
  }));
}

// Get vertices for star shapes
function getStarVertices(
  centerX: number,
  centerY: number,
  outerRadius: number,
  points: number
) {
  const innerRadius = outerRadius * 0.5;

  // Calculate base vertices with standard orientation
  const baseVertices: Array<{ x: number; y: number }> = [];
  const startAngle =
    points % 2 === 0 ? -Math.PI / 2 : -Math.PI / 2 + Math.PI / points;

  for (let i = 0; i < points * 2; i++) {
    const angle = startAngle + (i / (points * 2)) * Math.PI * 2;
    const radius = i % 2 === 0 ? 1 : innerRadius / outerRadius; // Normalize
    baseVertices.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }

  // Find bounding box of the normalized shape
  const minX = Math.min(...baseVertices.map((v) => v.x));
  const maxX = Math.max(...baseVertices.map((v) => v.x));
  const minY = Math.min(...baseVertices.map((v) => v.y));
  const maxY = Math.max(...baseVertices.map((v) => v.y));

  const width = maxX - minX;
  const height = maxY - minY;

  // Scale to fit the full outerRadius in both dimensions
  const scaleX = (2 * outerRadius) / width;
  const scaleY = (2 * outerRadius) / height;

  // Apply scaling and centering
  return baseVertices.map((v) => ({
    x: centerX + (v.x - (minX + maxX) / 2) * scaleX,
    y: centerY + (v.y - (minY + maxY) / 2) * scaleY,
  }));
}

// Render spikes for circular walls
function renderCircleSpikes(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  thickness: number
) {
  const spikes = [];
  const spikeSpacing = 15; // degrees between spikes
  const spikeCount = Math.floor((endAngle - startAngle) / spikeSpacing);
  const spikeHeight = thickness * 0.6;

  for (let i = 0; i <= spikeCount; i++) {
    const angle = startAngle + i * spikeSpacing;
    if (angle > endAngle) break;

    // Base is at the outer edge of wall, tip points OUTWARD away from arena
    const baseX = centerX + radius * Math.cos((angle * Math.PI) / 180);
    const baseY = centerY + radius * Math.sin((angle * Math.PI) / 180);
    const tipX =
      centerX + (radius + spikeHeight) * Math.cos((angle * Math.PI) / 180);
    const tipY =
      centerY + (radius + spikeHeight) * Math.sin((angle * Math.PI) / 180);

    const leftAngle = angle - 3;
    const rightAngle = angle + 3;
    const leftX = centerX + radius * Math.cos((leftAngle * Math.PI) / 180);
    const leftY = centerY + radius * Math.sin((leftAngle * Math.PI) / 180);
    const rightX = centerX + radius * Math.cos((rightAngle * Math.PI) / 180);
    const rightY = centerY + radius * Math.sin((rightAngle * Math.PI) / 180);

    spikes.push(
      <path
        key={i}
        d={`M ${leftX} ${leftY} L ${tipX} ${tipY} L ${rightX} ${rightY} Z`}
        fill="#654321"
        stroke="#3d2712"
        strokeWidth="0.5"
      />
    );
  }

  return <g className="spikes">{spikes}</g>;
}

// Render spikes for polygon walls
function renderPolygonSpikes(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  perpX: number,
  perpY: number,
  thickness: number
) {
  const spikes = [];
  const wallLength = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
  const spikeSpacing = 15; // pixels between spikes
  const spikeCount = Math.floor(wallLength / spikeSpacing);
  const spikeHeight = thickness * 0.6;

  // Normalize perpendicular to get spike direction (OUTWARD away from arena)
  const perpLen = Math.sqrt(perpX ** 2 + perpY ** 2);
  const normPerpX = -(perpX / perpLen) * spikeHeight;
  const normPerpY = -(perpY / perpLen) * spikeHeight;

  for (let i = 1; i <= spikeCount; i++) {
    const t = i / (spikeCount + 1);
    const baseX = startX + t * (endX - startX);
    const baseY = startY + t * (endY - startY);
    const tipX = baseX + normPerpX;
    const tipY = baseY + normPerpY;

    // Create triangle spike
    const spikeWidth = 8;
    const edgeVecX = endX - startX;
    const edgeVecY = endY - startY;
    const edgeLen = Math.sqrt(edgeVecX ** 2 + edgeVecY ** 2);
    const normEdgeX = (edgeVecX / edgeLen) * spikeWidth;
    const normEdgeY = (edgeVecY / edgeLen) * spikeWidth;

    const leftX = baseX - normEdgeX / 2;
    const leftY = baseY - normEdgeY / 2;
    const rightX = baseX + normEdgeX / 2;
    const rightY = baseY + normEdgeY / 2;

    spikes.push(
      <path
        key={i}
        d={`M ${leftX} ${leftY} L ${tipX} ${tipY} L ${rightX} ${rightY} Z`}
        fill="#654321"
        stroke="#3d2712"
        strokeWidth="0.5"
      />
    );
  }

  return <g className="spikes">{spikes}</g>;
}

function getCircleExits(edgeConfig: any) {
  const exits = [];
  const walls = edgeConfig.walls.sort(
    (a: any, b: any) => a.position - b.position
  );

  // If no walls, entire circle is an exit (0 to 360 degrees)
  if (walls.length === 0) {
    exits.push({ start: 0, end: 360 });
    return exits;
  }

  // Calculate wall end positions and convert to degrees
  const wallsInDegrees = walls.map((w: any) => ({
    start: (w.position / 100) * 360,
    end: ((w.position + w.width) / 100) * 360,
  }));

  // Find gaps between walls (exits)
  // First, check gap before first wall (from 0 to first wall start)
  if (wallsInDegrees[0].start > 0.1) {
    // 0.1 degree threshold to avoid tiny gaps
    exits.push({ start: 0, end: wallsInDegrees[0].start });
  }

  // Check gaps between consecutive walls
  for (let i = 0; i < wallsInDegrees.length - 1; i++) {
    const gapStart = wallsInDegrees[i].end;
    const gapEnd = wallsInDegrees[i + 1].start;
    if (gapEnd - gapStart > 0.1) {
      // 0.1 degree threshold
      exits.push({ start: gapStart, end: gapEnd });
    }
  }

  // Check gap after last wall (from last wall end to 360)
  const lastWallEnd = wallsInDegrees[wallsInDegrees.length - 1].end;
  if (360 - lastWallEnd > 0.1) {
    // 0.1 degree threshold
    exits.push({ start: lastWallEnd, end: 360 });
  }

  return exits;
}

function getEdgeExits(edgeConfig: any, v1: any, v2: any, edgeLength: number) {
  const exits = [];
  const walls = edgeConfig.walls.sort(
    (a: any, b: any) => a.position - b.position
  );

  // If no walls, entire edge is an exit
  if (walls.length === 0) {
    exits.push({ start: { x: v1.x, y: v1.y }, end: { x: v2.x, y: v2.y } });
    return exits;
  }

  // Helper to calculate point along edge
  const getPointAtPosition = (posPercent: number) => {
    const t = posPercent / 100;
    return {
      x: v1.x + t * (v2.x - v1.x),
      y: v1.y + t * (v2.y - v1.y),
    };
  };

  // Before first wall (0 to first wall start)
  if (walls[0].position > 0.1) {
    // 0.1% threshold to avoid tiny gaps
    exits.push({
      start: { x: v1.x, y: v1.y },
      end: getPointAtPosition(walls[0].position),
    });
  }

  // Between walls
  for (let i = 0; i < walls.length - 1; i++) {
    const gapStart = walls[i].position + walls[i].width;
    const gapEnd = walls[i + 1].position;

    if (gapEnd - gapStart > 0.1) {
      // 0.1% threshold
      exits.push({
        start: getPointAtPosition(gapStart),
        end: getPointAtPosition(gapEnd),
      });
    }
  }

  // After last wall (last wall end to 100%)
  const lastWall = walls[walls.length - 1];
  const lastWallEnd = lastWall.position + lastWall.width;

  if (100 - lastWallEnd > 0.1) {
    // 0.1% threshold
    exits.push({
      start: getPointAtPosition(lastWallEnd),
      end: { x: v2.x, y: v2.y },
    });
  }
  return exits;
}

// ============================================================================
// OBSTACLE RENDERER
// ============================================================================

function ObstacleRenderer({
  obstacle,
  theme,
  scale,
  centerX,
  centerY,
}: {
  obstacle: ObstacleConfig;
  theme: ArenaTheme;
  scale: number;
  centerX: number;
  centerY: number;
}) {
  const obstacleIcon = OBSTACLE_ICONS[theme] || "🔷";

  // Scale the obstacle position and size
  const scaledX = centerX + obstacle.x * scale;
  const scaledY = centerY + obstacle.y * scale;
  const scaledRadius = obstacle.radius * scale;

  // Get theme color or use custom color
  const color = obstacle.color || getThemeColor(theme, 0.8);

  return (
    <g>
      {/* Obstacle circle/collision area */}
      <circle
        cx={scaledX}
        cy={scaledY}
        r={scaledRadius}
        fill={color}
        fillOpacity={0.3}
        stroke={color}
        strokeWidth={2 * scale}
        strokeOpacity={0.8}
      />

      {/* Health indicator ring - only show for destructible obstacles */}
      {!obstacle.indestructible && (
        <circle
          cx={scaledX}
          cy={scaledY}
          r={scaledRadius + 3 * scale}
          fill="none"
          stroke={color}
          strokeWidth={1 * scale}
          strokeOpacity={0.5}
          strokeDasharray={`${(obstacle.health / 5) * 100}, 100`}
        />
      )}

      {/* Indestructible indicator - thick solid ring */}
      {obstacle.indestructible && (
        <circle
          cx={scaledX}
          cy={scaledY}
          r={scaledRadius + 3 * scale}
          fill="none"
          stroke={color}
          strokeWidth={2 * scale}
          strokeOpacity={0.9}
        />
      )}

      {/* Icon text - centered */}
      <text
        x={scaledX}
        y={scaledY}
        fontSize={scaledRadius * 1.5}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        style={{ userSelect: "none", pointerEvents: "none" }}
      >
        {obstacleIcon}
      </text>

      {/* Damage indicator (small text below) */}
      <text
        x={scaledX}
        y={scaledY + scaledRadius + 8 * scale}
        fontSize={8 * scale}
        textAnchor="middle"
        fill="rgba(255, 100, 100, 0.8)"
        fontWeight="bold"
        style={{ userSelect: "none", pointerEvents: "none" }}
      >
        {obstacle.damage}
      </text>
    </g>
  );
}
