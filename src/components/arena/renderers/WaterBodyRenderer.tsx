/**
 * Water Body Renderer Component
 * Renders water bodies in the arena preview
 * Supports: Moat, Zone, and Wall-Based water bodies
 */

import React from "react";
import { WaterBodyConfig, ArenaShape } from "@/types/arenaConfigNew";
import { generateShapePath } from "@/utils/pathGeneration";

interface WaterBodyRendererProps {
  waterBody: WaterBodyConfig;
  arenaShape: ArenaShape;
  arenaRadius: number;
  centerX: number;
  centerY: number;
  scale: number;
  arenaWidth: number;
  arenaHeight: number;
}

export default function WaterBodyRenderer({
  waterBody,
  arenaShape,
  arenaRadius,
  centerX,
  centerY,
  scale,
  arenaWidth,
  arenaHeight,
}: WaterBodyRendererProps) {
  const waterColor = waterBody.color || "#3b82f6";
  const opacity = waterBody.opacity || 0.6;
  const depth = waterBody.depth || 5;

  // Create gradient for depth effect
  const gradientId = `waterGradient-${waterBody.id}`;

  switch (waterBody.type) {
    case "moat":
      return (
        <MoatWaterRenderer
          waterBody={waterBody}
          arenaShape={arenaShape}
          arenaRadius={arenaRadius}
          centerX={centerX}
          centerY={centerY}
          scale={scale}
          arenaWidth={arenaWidth}
          arenaHeight={arenaHeight}
          waterColor={waterColor}
          opacity={opacity}
          depth={depth}
          gradientId={gradientId}
        />
      );

    case "zone":
      return (
        <ZoneWaterRenderer
          waterBody={waterBody}
          centerX={centerX}
          centerY={centerY}
          scale={scale}
          waterColor={waterColor}
          opacity={opacity}
          depth={depth}
          gradientId={gradientId}
        />
      );

    case "wall-based":
      return (
        <WallBasedWaterRenderer
          waterBody={waterBody}
          arenaShape={arenaShape}
          arenaRadius={arenaRadius}
          centerX={centerX}
          centerY={centerY}
          scale={scale}
          arenaWidth={arenaWidth}
          arenaHeight={arenaHeight}
          waterColor={waterColor}
          opacity={opacity}
          depth={depth}
          gradientId={gradientId}
        />
      );

    default:
      return null;
  }
}

// ============================================================================
// MOAT WATER RENDERER
// ============================================================================

function MoatWaterRenderer({
  waterBody,
  arenaShape,
  arenaRadius,
  centerX,
  centerY,
  scale,
  arenaWidth,
  arenaHeight,
  waterColor,
  opacity,
  depth,
  gradientId,
}: any) {
  const thickness = waterBody.thickness * scale;
  const distanceFromArena = waterBody.distanceFromArena * scale;
  const followsArenaShape = waterBody.followsArenaShape;
  const moatShape = waterBody.moatShape || "circle"; // Custom moat shape (default: circle)

  // Calculate moat dimensions from CENTER
  // Inner boundary = X distance from center (inner edge of water)
  // Outer boundary = X + thickness (outer edge of water)
  // Water area = space between inner and outer boundaries
  const innerRadius = distanceFromArena; // Distance from center to inner edge
  const outerRadius = innerRadius + thickness; // Distance from center to outer edge

  // Determine which shape to use for the moat
  const effectiveShape = followsArenaShape ? arenaShape : moatShape;

  if (effectiveShape === "circle") {
    // Circular moat - create a ring/donut shape
    const maskId = `moat-water-mask-${waterBody.id}`;

    return (
      <g className="moat-water">
        <defs>
          <radialGradient id={gradientId}>
            <stop offset="0%" stopColor={waterColor} stopOpacity={opacity} />
            <stop
              offset="100%"
              stopColor={waterColor}
              stopOpacity={opacity * 0.5}
            />
          </radialGradient>
          {waterBody.wavyEffect && (
            <filter id={`waves-${waterBody.id}`}>
              <feTurbulence
                type="turbulence"
                baseFrequency="0.02"
                numOctaves="3"
                result="turbulence"
              >
                <animate
                  attributeName="baseFrequency"
                  dur="5s"
                  values="0.02;0.04;0.02"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in2="turbulence"
                in="SourceGraphic"
                scale={depth}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          )}
          {/* Mask to create donut/ring shape */}
          <mask id={maskId}>
            <circle cx={centerX} cy={centerY} r={outerRadius} fill="white" />
            <circle cx={centerX} cy={centerY} r={innerRadius} fill="black" />
          </mask>
        </defs>

        {/* Water ring with mask applied */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius}
          fill={waterColor}
          opacity={opacity}
          mask={`url(#${maskId})`}
          filter={
            waterBody.wavyEffect ? `url(#waves-${waterBody.id})` : undefined
          }
        />

        {/* Depth effect on outer edge */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius}
          fill="none"
          stroke={waterColor}
          strokeWidth={depth * 0.5}
          opacity={opacity * 0.3}
          pointerEvents="none"
        />

        {/* Depth effect on inner edge */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius}
          fill="none"
          stroke={waterColor}
          strokeWidth={depth * 0.5}
          opacity={opacity * 0.2}
          pointerEvents="none"
        />
      </g>
    );
  } else {
    // Shape-following moat - create a ring/donut shape
    const maskId = `moat-water-mask-${waterBody.id}`;

    const innerPath = generateShapePath(
      effectiveShape,
      { x: centerX, y: centerY },
      innerRadius,
      arenaWidth,
      arenaHeight
    );
    const outerPath = generateShapePath(
      effectiveShape,
      { x: centerX, y: centerY },
      outerRadius,
      arenaWidth * (outerRadius / innerRadius),
      arenaHeight * (outerRadius / innerRadius)
    );

    return (
      <g className="moat-water">
        <defs>
          <radialGradient id={gradientId}>
            <stop offset="0%" stopColor={waterColor} stopOpacity={opacity} />
            <stop
              offset="100%"
              stopColor={waterColor}
              stopOpacity={opacity * 0.5}
            />
          </radialGradient>
          {waterBody.wavyEffect && (
            <filter id={`waves-${waterBody.id}`}>
              <feTurbulence
                type="turbulence"
                baseFrequency="0.02"
                numOctaves="3"
                result="turbulence"
              >
                <animate
                  attributeName="baseFrequency"
                  dur="5s"
                  values="0.02;0.04;0.02"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in2="turbulence"
                in="SourceGraphic"
                scale={depth}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          )}
          {/* Mask to create donut/ring shape */}
          <mask id={maskId}>
            <path d={outerPath} fill="white" />
            <path d={innerPath} fill="black" />
          </mask>
        </defs>

        {/* Water ring with mask applied */}
        <path
          d={outerPath}
          fill={waterColor}
          opacity={opacity}
          mask={`url(#${maskId})`}
          filter={
            waterBody.wavyEffect ? `url(#waves-${waterBody.id})` : undefined
          }
        />

        {/* Depth effect on outer edge */}
        <path
          d={outerPath}
          fill="none"
          stroke={waterColor}
          strokeWidth={depth * 0.5}
          opacity={opacity * 0.3}
          pointerEvents="none"
        />

        {/* Depth effect on inner edge */}
        <path
          d={innerPath}
          fill="none"
          stroke={waterColor}
          strokeWidth={depth * 0.5}
          opacity={opacity * 0.2}
          pointerEvents="none"
        />
      </g>
    );
  }
}

// ============================================================================
// ZONE WATER RENDERER
// ============================================================================

function ZoneWaterRenderer({
  waterBody,
  centerX,
  centerY,
  scale,
  waterColor,
  opacity,
  depth,
  gradientId,
}: any) {
  const x = centerX + waterBody.position.x * scale;
  const y = centerY + waterBody.position.y * scale;
  const rotation = waterBody.rotation || 0;

  return (
    <g
      className="zone-water"
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={waterColor} stopOpacity={opacity} />
          <stop
            offset="100%"
            stopColor={waterColor}
            stopOpacity={opacity * 0.5}
          />
        </linearGradient>
        {waterBody.wavyEffect && (
          <filter id={`waves-${waterBody.id}`}>
            <feTurbulence
              type="turbulence"
              baseFrequency="0.02"
              numOctaves="3"
              result="turbulence"
            >
              <animate
                attributeName="baseFrequency"
                dur="5s"
                values="0.02;0.04;0.02"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in2="turbulence"
              in="SourceGraphic"
              scale={depth}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        )}
      </defs>

      {waterBody.shape === "circle" && (
        <>
          <circle
            cx={0}
            cy={0}
            r={(waterBody.radius || 5) * scale}
            fill={`url(#${gradientId})`}
            filter={
              waterBody.wavyEffect ? `url(#waves-${waterBody.id})` : undefined
            }
          />
          {/* Depth effect */}
          <circle
            cx={0}
            cy={0}
            r={(waterBody.radius || 5) * scale}
            fill="none"
            stroke={waterColor}
            strokeWidth={depth}
            opacity={opacity * 0.2}
          />
        </>
      )}

      {waterBody.shape === "square" && (
        <>
          <rect
            x={-((waterBody.width || 10) * scale) / 2}
            y={-((waterBody.height || 10) * scale) / 2}
            width={(waterBody.width || 10) * scale}
            height={(waterBody.height || 10) * scale}
            fill={`url(#${gradientId})`}
            filter={
              waterBody.wavyEffect ? `url(#waves-${waterBody.id})` : undefined
            }
          />
          {/* Depth effect */}
          <rect
            x={-((waterBody.width || 10) * scale) / 2}
            y={-((waterBody.height || 10) * scale) / 2}
            width={(waterBody.width || 10) * scale}
            height={(waterBody.height || 10) * scale}
            fill="none"
            stroke={waterColor}
            strokeWidth={depth}
            opacity={opacity * 0.2}
          />
        </>
      )}

      {waterBody.shape === "rectangle" && (
        <>
          <rect
            x={-((waterBody.width || 10) * scale) / 2}
            y={-((waterBody.height || 10) * scale) / 2}
            width={(waterBody.width || 10) * scale}
            height={(waterBody.height || 10) * scale}
            fill={`url(#${gradientId})`}
            filter={
              waterBody.wavyEffect ? `url(#waves-${waterBody.id})` : undefined
            }
          />
          {/* Depth effect */}
          <rect
            x={-((waterBody.width || 10) * scale) / 2}
            y={-((waterBody.height || 10) * scale) / 2}
            width={(waterBody.width || 10) * scale}
            height={(waterBody.height || 10) * scale}
            fill="none"
            stroke={waterColor}
            strokeWidth={depth}
            opacity={opacity * 0.2}
          />
        </>
      )}

      {waterBody.shape === "oval" && (
        <>
          <ellipse
            cx={0}
            cy={0}
            rx={((waterBody.width || 10) * scale) / 2}
            ry={((waterBody.height || 10) * scale) / 2}
            fill={`url(#${gradientId})`}
            filter={
              waterBody.wavyEffect ? `url(#waves-${waterBody.id})` : undefined
            }
          />
          {/* Depth effect */}
          <ellipse
            cx={0}
            cy={0}
            rx={((waterBody.width || 10) * scale) / 2}
            ry={((waterBody.height || 10) * scale) / 2}
            fill="none"
            stroke={waterColor}
            strokeWidth={depth}
            opacity={opacity * 0.2}
          />
        </>
      )}

      {/* Label */}
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fontWeight="bold"
        fill="white"
        stroke="black"
        strokeWidth="0.5"
      >
        {waterBody.id}
      </text>
    </g>
  );
}

// ============================================================================
// WALL-BASED WATER RENDERER
// ============================================================================

function WallBasedWaterRenderer({
  waterBody,
  arenaShape,
  arenaRadius,
  centerX,
  centerY,
  scale,
  arenaWidth,
  arenaHeight,
  waterColor,
  opacity,
  depth,
  gradientId,
}: any) {
  const thickness = waterBody.thickness * scale;
  const offsetFromEdge = waterBody.offsetFromEdge * scale;

  // Calculate water dimensions - water is AT the edge, not filling the whole arena
  // outerRadius is the arena boundary minus offset
  const outerRadius = arenaRadius - offsetFromEdge;
  // innerRadius is just inside the water strip
  const innerRadius = Math.max(0, outerRadius - thickness);

  if (arenaShape === "circle") {
    // Circular wall-based water - create a ring/donut shape
    const maskId = `wall-water-mask-${waterBody.id}`;

    return (
      <g className="wall-based-water">
        <defs>
          <radialGradient id={gradientId}>
            <stop offset="0%" stopColor={waterColor} stopOpacity={opacity} />
            <stop
              offset="100%"
              stopColor={waterColor}
              stopOpacity={opacity * 0.5}
            />
          </radialGradient>
          {waterBody.wavyEffect && (
            <filter id={`waves-${waterBody.id}`}>
              <feTurbulence
                type="turbulence"
                baseFrequency="0.02"
                numOctaves="3"
                result="turbulence"
              >
                <animate
                  attributeName="baseFrequency"
                  dur="5s"
                  values="0.02;0.04;0.02"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in2="turbulence"
                in="SourceGraphic"
                scale={depth}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          )}
          {/* Mask to create donut/ring shape */}
          <mask id={maskId}>
            <circle cx={centerX} cy={centerY} r={outerRadius} fill="white" />
            <circle cx={centerX} cy={centerY} r={innerRadius} fill="black" />
          </mask>
        </defs>

        {/* Water ring with mask applied */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius}
          fill={waterColor}
          opacity={opacity}
          mask={`url(#${maskId})`}
          filter={
            waterBody.wavyEffect ? `url(#waves-${waterBody.id})` : undefined
          }
        />

        {/* Depth effect on outer edge */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius}
          fill="none"
          stroke={waterColor}
          strokeWidth={depth * 0.5}
          opacity={opacity * 0.3}
          pointerEvents="none"
        />

        {/* Depth effect on inner edge */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius}
          fill="none"
          stroke={waterColor}
          strokeWidth={depth * 0.5}
          opacity={opacity * 0.2}
          pointerEvents="none"
        />
      </g>
    );
  } else {
    // Shape-following wall-based water - create a ring/donut shape
    const maskId = `wall-water-mask-${waterBody.id}`;

    // Calculate scale factors for inner and outer shapes
    const outerScaleFactor = outerRadius / arenaRadius;
    const innerScaleFactor = innerRadius / arenaRadius;

    const outerPath = generateShapePath(
      arenaShape,
      { x: centerX, y: centerY },
      outerRadius,
      arenaWidth * outerScaleFactor,
      arenaHeight * outerScaleFactor
    );
    const innerPath = generateShapePath(
      arenaShape,
      { x: centerX, y: centerY },
      innerRadius,
      arenaWidth * innerScaleFactor,
      arenaHeight * innerScaleFactor
    );

    return (
      <g className="wall-based-water">
        <defs>
          <radialGradient id={gradientId}>
            <stop offset="0%" stopColor={waterColor} stopOpacity={opacity} />
            <stop
              offset="100%"
              stopColor={waterColor}
              stopOpacity={opacity * 0.5}
            />
          </radialGradient>
          {waterBody.wavyEffect && (
            <filter id={`waves-${waterBody.id}`}>
              <feTurbulence
                type="turbulence"
                baseFrequency="0.02"
                numOctaves="3"
                result="turbulence"
              >
                <animate
                  attributeName="baseFrequency"
                  dur="5s"
                  values="0.02;0.04;0.02"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in2="turbulence"
                in="SourceGraphic"
                scale={depth}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          )}
          {/* Mask to create donut/ring shape */}
          <mask id={maskId}>
            <path d={outerPath} fill="white" />
            <path d={innerPath} fill="black" />
          </mask>
        </defs>

        {/* Water ring with mask applied */}
        <path
          d={outerPath}
          fill={waterColor}
          opacity={opacity}
          mask={`url(#${maskId})`}
          filter={
            waterBody.wavyEffect ? `url(#waves-${waterBody.id})` : undefined
          }
        />

        {/* Depth effect on outer edge */}
        <path
          d={outerPath}
          fill="none"
          stroke={waterColor}
          strokeWidth={depth * 0.5}
          opacity={opacity * 0.3}
          pointerEvents="none"
        />

        {/* Depth effect on inner edge */}
        <path
          d={innerPath}
          fill="none"
          stroke={waterColor}
          strokeWidth={depth * 0.5}
          opacity={opacity * 0.2}
          pointerEvents="none"
        />
      </g>
    );
  }
}
