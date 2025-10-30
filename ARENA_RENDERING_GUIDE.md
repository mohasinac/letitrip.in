# Arena Rendering Guide

## Overview

This guide provides specifications for rendering all arena elements in the preview and game engine.

---

## 1. Loop Rendering

### Concept: Loop as Path Line (Not Area)

**Important**: A loop is a **LINE/PATH** on which beyblades travel to gain speed boost, NOT an occupied area.

- The loop defines the PATH that beyblades follow
- Only the LINE itself provides boost mechanics
- The area inside/outside the loop is empty space

### Render Style: Outline Line (Always)

```typescript
// Loop rendering specification
interface LoopRenderSpec {
  strokeWidth: number; // Path line width: 3-5px
  strokeColor: string; // From loop.color or default blue (#3b82f6)
  glowEffect?: boolean; // Optional glow for speed boost indication
  dashPattern?: string; // Optional dashed pattern for visual effect
}
```

### Implementation Examples

#### SVG Rendering (Path Line)

```tsx
<g className="loop-path">
  {/* Optional glow effect */}
  <circle
    cx={centerX}
    cy={centerY}
    r={loop.radius}
    fill="none"
    stroke={loop.color || "#3b82f6"}
    strokeWidth="8"
    opacity="0.2"
    filter="blur(4px)"
  />

  {/* Main loop path line */}
  <circle
    cx={centerX}
    cy={centerY}
    r={loop.radius}
    fill="none"
    stroke={loop.color || "#3b82f6"}
    strokeWidth="4"
    opacity="0.8"
  />
</g>
```

#### Canvas Rendering (Path Line)

```typescript
ctx.save();

// Optional glow
if (loop.glowEffect) {
  ctx.shadowBlur = 10;
  ctx.shadowColor = loop.color || "#3b82f6";
}

// Draw loop path line
ctx.beginPath();
ctx.arc(centerX, centerY, loop.radius, 0, Math.PI * 2);
ctx.strokeStyle = loop.color || "#3b82f6";
ctx.lineWidth = 4;
ctx.globalAlpha = 0.8;
ctx.stroke();

ctx.restore();
```

### Shape-Specific Path Lines

| Shape         | Rendering Method               |
| ------------- | ------------------------------ |
| **Circle**    | Circular path line             |
| **Rectangle** | Rounded rectangle path outline |
| **Pentagon**  | 5-sided polygon path           |
| **Hexagon**   | 6-sided polygon path           |
| **Octagon**   | 8-sided polygon path           |
| **Star**      | Star-shaped path (5+ points)   |
| **Oval**      | Elliptical path line           |
| **Ring**      | Two concentric circular paths  |

---

## 2. Charge Point Rendering

### Visual Specification

```typescript
interface ChargePointVisual {
  position: { x: number; y: number }; // Calculated from angle
  radius: number; // Default: 1em (15-20px)
  color: string; // Default: #fbbf24 (gold)
  glow: boolean; // Active when beyblade in range
  buttonNumber: 1 | 2 | 3; // Display button ID
}
```

### Rendering Layers

1. **Background Glow** (when active)

   - Radial gradient from center
   - Outer radius: 2-3x charge point radius
   - Opacity: 0.3-0.5
   - Pulsing animation

2. **Charge Point Circle**

   - Solid fill with `color`
   - Border: 2px white stroke
   - Drop shadow for depth

3. **Button Number**
   - Center-aligned text
   - Font size: 0.6em
   - Color: Black or white (high contrast)
   - Font weight: Bold

### SVG Example

```tsx
<g className="charge-point" data-button={buttonId}>
  {/* Glow effect (active state) */}
  {isActive && (
    <circle
      cx={x}
      cy={y}
      r={radius * 3}
      fill="url(#chargeGlow)"
      opacity="0.5"
      className="pulse-animation"
    />
  )}

  {/* Main circle */}
  <circle
    cx={x}
    cy={y}
    r={radius}
    fill={color}
    stroke="white"
    strokeWidth="2"
    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
  />

  {/* Button number */}
  <text
    x={x}
    y={y}
    textAnchor="middle"
    dominantBaseline="middle"
    fontSize="0.6em"
    fontWeight="bold"
    fill="black"
  >
    {buttonId}
  </text>
</g>
```

### Animation States

#### Idle State

- Gentle pulse animation (scale 1.0 to 1.1)
- Duration: 2s infinite
- Easing: ease-in-out

#### Active State (Beyblade in Range)

- Faster pulse (scale 1.0 to 1.3)
- Duration: 0.5s infinite
- Glow effect visible
- Color intensity increased

#### Triggered State (Button Pressed)

- Flash animation (opacity 1 to 0.3 to 1)
- Duration: 0.3s once
- Particle burst effect
- Scale up then down

---

## 3. Obstacle Rendering

### Concept: 2D Collidable Objects

Obstacles are **2D objects** that:

- Cause damage to beyblades on collision
- Create rebound physics (reflect beyblade trajectory)
- Can be placed strategically in the arena

### Placement Options

```typescript
interface ObstacleConfig {
  type: "rock" | "pillar" | "barrier" | "wall";
  placement: "center" | "random" | "evenly-distributed";
  count: number; // Number of obstacles to generate
  position?: { x: number; y: number }; // Manual position (for 'center' or custom)
  radius: number;
  damage: number; // Damage dealt on collision
  rebound: number; // Rebound force multiplier (0.5-2.0)
  theme: ArenaTheme;
  themeIcon?: string;
}
```

### Placement Algorithms

#### Center Placement

```typescript
function placeCenterObstacles(
  count: number,
  arenaCenter: Point
): ObstacleConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    position: arenaCenter, // All at center (stacked or slightly offset)
    // ...other properties
  }));
}
```

#### Random Placement

```typescript
function placeRandomObstacles(
  count: number,
  arenaWidth: number,
  arenaHeight: number,
  excludeZones: Zone[] // portals, exits, pits
): ObstacleConfig[] {
  const obstacles: ObstacleConfig[] = [];

  for (let i = 0; i < count; i++) {
    let position: Point;
    let attempts = 0;

    do {
      position = {
        x: (Math.random() - 0.5) * arenaWidth,
        y: (Math.random() - 0.5) * arenaHeight,
      };
      attempts++;
    } while (isInExcludedZone(position, excludeZones) && attempts < 100);

    obstacles.push({ position /* ...other properties */ });
  }

  return obstacles;
}
```

#### Evenly Distributed Placement

```typescript
function placeEvenlyDistributedObstacles(
  count: number,
  arenaRadius: number,
  excludeZones: Zone[]
): ObstacleConfig[] {
  const obstacles: ObstacleConfig[] = [];
  const angleStep = (2 * Math.PI) / count;
  const distance = arenaRadius * 0.6; // 60% from center

  for (let i = 0; i < count; i++) {
    const angle = i * angleStep;
    const position = {
      x: distance * Math.cos(angle),
      y: distance * Math.sin(angle),
    };

    if (!isInExcludedZone(position, excludeZones)) {
      obstacles.push({ position /* ...other properties */ });
    }
  }

  return obstacles;
}
```

### Collision & Rebound Physics

```typescript
// On beyblade-obstacle collision
function handleObstacleCollision(
  beyblade: Beyblade,
  obstacle: ObstacleConfig
): void {
  // Apply damage
  beyblade.health -= obstacle.damage;

  // Calculate rebound angle
  const collisionAngle = Math.atan2(
    beyblade.position.y - obstacle.position.y,
    beyblade.position.x - obstacle.position.x
  );

  // Reflect velocity
  beyblade.velocity = {
    x: Math.cos(collisionAngle) * beyblade.speed * obstacle.rebound,
    y: Math.sin(collisionAngle) * beyblade.speed * obstacle.rebound,
  };
}
```

### Theme-Based Visual System

```typescript
interface ObstacleRender {
  type: "rock" | "pillar" | "barrier" | "wall";
  theme: ArenaTheme;
  themeIcon?: string; // Custom icon identifier
  position: { x: number; y: number };
  radius: number;
  rotation: number;
}
```

### Rendering Priorities

1. **Custom Theme Icon** (if specified)
2. **Theme-Based Default**
3. **Generic Fallback**

### Theme Icon Mapping

#### Forest Theme

```typescript
const forestIcons = {
  rock: "🪨", // Boulder icon or sprite
  pillar: "🌳", // Tree sprite
  barrier: "🪵", // Log pile
  wall: "🌿", // Hedge sprite
};
```

#### Futuristic Theme

```typescript
const futuristicIcons = {
  rock: "🔷", // Energy block with glow
  pillar: "🏢", // Tech pillar with lights
  barrier: "⚡", // Force field (animated)
  wall: "🛡️", // Barrier shield
};
```

### SVG Icon System

```tsx
<g className="obstacle" data-type={type} data-theme={theme}>
  <defs>
    <pattern id={`obstacle-${theme}-${type}`}>
      <image href={getThemeIcon(theme, type)} />
    </pattern>
  </defs>

  <circle
    cx={x}
    cy={y}
    r={radius}
    fill={`url(#obstacle-${theme}-${type})`}
    transform={`rotate(${rotation} ${x} ${y})`}
  />

  {/* Destructible health bar */}
  {destructible && (
    <rect
      x={x - radius}
      y={y - radius - 5}
      width={radius * 2 * (health / maxHealth)}
      height="3"
      fill="green"
    />
  )}
</g>
```

### Sprite-Based Rendering

```typescript
// Load theme sprite sheets
const spriteSheets = {
  forest: "/assets/obstacles/forest-sprites.png",
  futuristic: "/assets/obstacles/futuristic-sprites.png",
  desert: "/assets/obstacles/desert-sprites.png",
  // ... other themes
};

// Sprite coordinates for each obstacle type
const spriteCoords = {
  rock: { x: 0, y: 0, width: 32, height: 32 },
  pillar: { x: 32, y: 0, width: 32, height: 64 },
  barrier: { x: 64, y: 0, width: 64, height: 32 },
  wall: { x: 128, y: 0, width: 64, height: 64 },
};
```

---

## 4. Water/Liquid Body Rendering

### Concept: 2D Area with Physics Effects

Liquid bodies are **2D filled shapes** that:

- Slow down beyblades (speedMultiplier < 1.0)
- Can deal damage over time (lava, acid)
- Can be positioned at custom locations (not tied to loops)

### Configuration Types

```typescript
interface LiquidBodyConfig {
  type: "center" | "moat" | "ring" | "custom";
  liquidType: "water" | "blood" | "lava" | "acid" | "oil" | "ice";

  // Custom positioning (NOT loop-dependent)
  position: { x: number; y: number }; // Custom X, Y coordinates

  // Shape options
  shape:
    | "circle"
    | "rectangle"
    | "pentagon"
    | "hexagon"
    | "octagon"
    | "star"
    | "oval";

  // Single shape (filled)
  radius?: number; // For circle/star/polygon
  width?: number; // For rectangle
  height?: number; // For rectangle

  // Moat shape (two concentric shapes)
  innerRadius?: number; // Inner boundary
  outerRadius?: number; // Outer boundary
  innerShape?: string; // Can differ from outer
  outerShape?: string;

  // Ring at edges
  ringThickness?: number; // For edge ring

  // Physics
  speedMultiplier: number; // 0.3-0.9 (slows beyblades)
  spinDrainRate: number; // Damage per second
  viscosity: number; // Resistance to movement

  // Visual
  color?: string;
  waveAnimation?: boolean;
}
```

### Rendering: Single Filled Shape (Center/Custom)

```tsx
<g className="liquid-body" data-type={liquidType}>
  {/* Circle */}
  {shape === "circle" && (
    <circle
      cx={position.x}
      cy={position.y}
      r={radius}
      fill={getLiquidColor(liquidType)}
      opacity="0.6"
      className="water-animation"
    />
  )}

  {/* Rectangle */}
  {shape === "rectangle" && (
    <rect
      x={position.x - width / 2}
      y={position.y - height / 2}
      width={width}
      height={height}
      fill={getLiquidColor(liquidType)}
      opacity="0.6"
      className="water-animation"
    />
  )}

  {/* Star or polygon */}
  {["star", "pentagon", "hexagon", "octagon"].includes(shape) && (
    <path
      d={generateShapePath(shape, position, radius)}
      fill={getLiquidColor(liquidType)}
      opacity="0.6"
      className="water-animation"
    />
  )}
</g>
```

### Rendering: Moat Shape (Two Concentric Shapes)

```tsx
<g className="liquid-moat">
  {/* Using SVG mask for donut/ring effect */}
  <defs>
    <mask id={`moat-mask-${id}`}>
      {/* White outer shape */}
      <path
        d={generateShapePath(outerShape, position, outerRadius)}
        fill="white"
      />
      {/* Black inner shape (cutout) */}
      <path
        d={generateShapePath(innerShape, position, innerRadius)}
        fill="black"
      />
    </mask>
  </defs>

  {/* Apply mask */}
  <rect
    x={position.x - outerRadius}
    y={position.y - outerRadius}
    width={outerRadius * 2}
    height={outerRadius * 2}
    fill={getLiquidColor(liquidType)}
    opacity="0.6"
    mask={`url(#moat-mask-${id})`}
    className="water-animation"
  />
</g>;

{
  /* Alternative: Using path with fill-rule */
}
<path
  d={`
    ${generateShapePath(outerShape, position, outerRadius)}
    ${generateShapePath(innerShape, position, innerRadius)}
  `}
  fill={getLiquidColor(liquidType)}
  fillRule="evenodd"
  opacity="0.6"
  className="water-animation"
/>;
```

### Rendering: Ring at Stadium Edges

```typescript
// Ring at stadium edges
<rect
  x={0}
  y={0}
  width={arenaWidth}
  height={arenaHeight}
  fill="transparent"
  stroke={getLiquidColor(liquidType)}
  strokeWidth={ringThickness}
  opacity="0.6"
/>
```

### Liquid Colors

```typescript
const liquidColors = {
  water: "#4fc3f7",
  blood: "#c62828",
  lava: "#ff6f00",
  acid: "#76ff03",
  oil: "#424242",
  ice: "#00e5ff",
};
```

### Wave Animation

```css
@keyframes water-wave {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

.water-animation {
  animation: water-wave 2s ease-in-out infinite;
}
```

---

## 5. Portal Rendering (2D Doors)

### Concept: Spatial Connection Points

Portals are **2D door objects** that:

- Connect two points in space
- Teleport beyblades from entry to exit on contact
- Are generally mirrored but can be customized

### Visual Components

```typescript
interface PortalVisual {
  inPoint: { x: number; y: number }; // Entry door position
  outPoint: { x: number; y: number }; // Exit door position
  radius: number; // Door size
  color: string;
  style: "mirror" | "custom"; // Mirrored appearance or different
  connectionLine: boolean; // Show connection between portals
}
```

### Rendering Structure (Door/Whirlpool Style)

```tsx
<g className="portal-system">
  {/* Connection line (optional) */}
  {connectionLine && (
    <line
      x1={inPoint.x}
      y1={inPoint.y}
      x2={outPoint.x}
      y2={outPoint.y}
      stroke={color}
      strokeWidth="2"
      strokeDasharray="5,5"
      opacity="0.3"
      className="portal-flow-animation"
    />
  )}

  {/* Entry Portal Door */}
  <g className="portal-entry">
    {/* Outer frame */}
    <circle
      cx={inPoint.x}
      cy={inPoint.y}
      r={radius * 1.2}
      fill="none"
      stroke={color}
      strokeWidth="4"
      opacity="0.8"
    />

    {/* Portal interior (whirlpool/void effect) */}
    <circle
      cx={inPoint.x}
      cy={inPoint.y}
      r={radius}
      fill={`url(#portal-gradient-in)`}
    />

    {/* Spiral effect (optional) */}
    {[1, 2, 3].map((layer) => (
      <path
        key={layer}
        d={generateSpiral(inPoint, radius * (1 - layer * 0.25), layer * 120)}
        stroke={color}
        strokeWidth="2"
        fill="none"
        opacity={0.5 - layer * 0.1}
        className={`portal-spiral-layer-${layer}`}
      />
    ))}

    {/* Center */}
    <circle cx={inPoint.x} cy={inPoint.y} r={radius * 0.2} fill="#000" />

    {/* Label */}
    <text
      x={inPoint.x}
      y={inPoint.y - radius * 1.5}
      textAnchor="middle"
      fontSize="0.8em"
      fill="white"
      fontWeight="bold"
    >
      IN
    </text>
  </g>

  {/* Exit Portal Door (mirrored or custom) */}
  <g className="portal-exit">
    {/* Similar structure */}
    {/* For mirror style: same appearance, opposite rotation */}
    {/* For custom style: different color/effect */}

    <circle
      cx={outPoint.x}
      cy={outPoint.y}
      r={radius * 1.2}
      fill="none"
      stroke={style === "mirror" ? color : customColor}
      strokeWidth="4"
      opacity="0.8"
    />

    <circle
      cx={outPoint.x}
      cy={outPoint.y}
      r={radius}
      fill={`url(#portal-gradient-out)`}
    />

    {/* Reverse spiral for mirror effect */}
    {[1, 2, 3].map((layer) => (
      <path
        key={layer}
        d={generateSpiral(outPoint, radius * (1 - layer * 0.25), -layer * 120)}
        stroke={style === "mirror" ? color : customColor}
        strokeWidth="2"
        fill="none"
        opacity={0.5 - layer * 0.1}
        className={`portal-spiral-reverse-layer-${layer}`}
      />
    ))}

    <circle cx={outPoint.x} cy={outPoint.y} r={radius * 0.2} fill="#000" />

    <text
      x={outPoint.x}
      y={outPoint.y - radius * 1.5}
      textAnchor="middle"
      fontSize="0.8em"
      fill="white"
      fontWeight="bold"
    >
      OUT
    </text>
  </g>

  {/* Gradients */}
  <defs>
    <radialGradient id="portal-gradient-in" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#000" stopOpacity="0.9" />
      <stop offset="60%" stopColor={color} stopOpacity="0.6" />
      <stop offset="100%" stopColor={color} stopOpacity="0.2" />
    </radialGradient>

    <radialGradient id="portal-gradient-out" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#000" stopOpacity="0.9" />
      <stop
        offset="60%"
        stopColor={style === "mirror" ? color : customColor}
        stopOpacity="0.6"
      />
      <stop
        offset="100%"
        stopColor={style === "mirror" ? color : customColor}
        stopOpacity="0.2"
      />
    </radialGradient>
  </defs>
</g>
```

### Teleportation Physics

```typescript
function handlePortalCollision(beyblade: Beyblade, portal: PortalConfig): void {
  // Check if beyblade enters portal IN point
  if (isColliding(beyblade.position, portal.inPoint, portal.radius)) {
    // Teleport to OUT point
    beyblade.position = { ...portal.outPoint };
    // Maintain velocity and spin
    // Optional: apply cooldown to prevent immediate re-entry
    portal.lastUseTime = Date.now();
  }

  // Bidirectional support
  if (
    portal.bidirectional &&
    isColliding(beyblade.position, portal.outPoint, portal.radius)
  ) {
    beyblade.position = { ...portal.inPoint };
    portal.lastUseTime = Date.now();
  }
}
```

```tsx
<g className="portal-system">
  {/* Connection flow line */}
  <line
    x1={inPoint.x}
    y1={inPoint.y}
    x2={outPoint.x}
    y2={outPoint.y}
    stroke={color}
    strokeWidth="2"
    strokeDasharray="5,5"
    opacity="0.3"
    className="portal-flow-animation"
  />

  {/* Entry portal (whirlpool) */}
  <g className="portal-in whirlpool">
    {/* Outer vortex ring */}
    <circle
      cx={inPoint.x}
      cy={inPoint.y}
      r={radius * 1.8}
      fill="none"
      stroke={color}
      strokeWidth="3"
      opacity="0.3"
      strokeDasharray="10,5"
      className="whirlpool-outer-ring"
    />

    {/* Spiral layers (3-5 layers) */}
    {[1, 2, 3, 4].map((layer) => (
      <path
        key={layer}
        d={generateWhirlpoolSpiral(
          inPoint,
          radius * (1.5 - layer * 0.3),
          layer * 90
        )}
        stroke={color}
        strokeWidth="2"
        fill="none"
        opacity={0.6 - layer * 0.1}
        className={`whirlpool-spiral whirlpool-layer-${layer}`}
      />
    ))}

    {/* Center vortex (dark center) */}
    <circle
      cx={inPoint.x}
      cy={inPoint.y}
      r={radius * 0.3}
      fill="#000"
      opacity="0.8"
    />

    {/* Radial gradient background */}
    <defs>
      <radialGradient id={`whirlpool-gradient-in`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#000" stopOpacity="0.9" />
        <stop offset="40%" stopColor={color} stopOpacity="0.6" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
    </defs>
    <circle
      cx={inPoint.x}
      cy={inPoint.y}
      r={radius}
      fill={`url(#whirlpool-gradient-in)`}
    />

    {/* Particle effects (optional) */}
    <g className="whirlpool-particles">
      {generateParticles(inPoint, radius, 8).map((particle, idx) => (
        <circle
          key={idx}
          cx={particle.x}
          cy={particle.y}
          r="2"
          fill="white"
          opacity="0.6"
          className={`whirlpool-particle whirlpool-particle-${idx}`}
        />
      ))}
    </g>

    {/* Label */}
    <text
      x={inPoint.x}
      y={inPoint.y - radius * 2 - 5}
      textAnchor="middle"
      fontSize="0.8em"
      fill="white"
      fontWeight="bold"
    >
      IN
    </text>
  </g>

  {/* Exit portal (whirlpool) */}
  <g className="portal-out whirlpool">
    {/* Similar structure but reverse rotation */}
    {/* Outer vortex ring */}
    <circle
      cx={outPoint.x}
      cy={outPoint.y}
      r={radius * 1.8}
      fill="none"
      stroke={color}
      strokeWidth="3"
      opacity="0.3"
      strokeDasharray="10,5"
      className="whirlpool-outer-ring-reverse"
    />

    {/* Spiral layers (reverse rotation) */}
    {[1, 2, 3, 4].map((layer) => (
      <path
        key={layer}
        d={generateWhirlpoolSpiral(
          outPoint,
          radius * (1.5 - layer * 0.3),
          -layer * 90
        )}
        stroke={color}
        strokeWidth="2"
        fill="none"
        opacity={0.6 - layer * 0.1}
        className={`whirlpool-spiral-reverse whirlpool-layer-${layer}`}
      />
    ))}

    {/* Center vortex */}
    <circle
      cx={outPoint.x}
      cy={outPoint.y}
      r={radius * 0.3}
      fill="#000"
      opacity="0.8"
    />

    {/* Radial gradient */}
    <defs>
      <radialGradient id={`whirlpool-gradient-out`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#000" stopOpacity="0.9" />
        <stop offset="40%" stopColor={color} stopOpacity="0.6" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
    </defs>
    <circle
      cx={outPoint.x}
      cy={outPoint.y}
      r={radius}
      fill={`url(#whirlpool-gradient-out)`}
    />

    {/* Particles (reverse) */}
    <g className="whirlpool-particles">
      {generateParticles(outPoint, radius, 8).map((particle, idx) => (
        <circle
          key={idx}
          cx={particle.x}
          cy={particle.y}
          r="2"
          fill="white"
          opacity="0.6"
          className={`whirlpool-particle-reverse whirlpool-particle-${idx}`}
        />
      ))}
    </g>

    {/* Label */}
    <text
      x={outPoint.x}
      y={outPoint.y - radius * 2 - 5}
      textAnchor="middle"
      fontSize="0.8em"
      fill="white"
      fontWeight="bold"
    >
      OUT
    </text>
  </g>
</g>
```

### Helper Functions

```typescript
// Generate whirlpool spiral path
function generateWhirlpoolSpiral(
  center: { x: number; y: number },
  maxRadius: number,
  startAngle: number
): string {
  const points: string[] = [];
  const turns = 2; // Number of spiral turns
  const segments = 50; // Smoothness

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = startAngle + t * turns * 360;
    const radius = maxRadius * (1 - t * 0.7); // Spiral inward
    const rad = (angle * Math.PI) / 180;
    const x = center.x + radius * Math.cos(rad);
    const y = center.y + radius * Math.sin(rad);
    points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }

  return points.join(" ");
}

// Generate particles for whirlpool effect
function generateParticles(
  center: { x: number; y: number },
  radius: number,
  count: number
): Array<{ x: number; y: number }> {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360;
    const distance = radius * (0.8 + Math.random() * 0.4);
    const rad = (angle * Math.PI) / 180;
    return {
      x: center.x + distance * Math.cos(rad),
      y: center.y + distance * Math.sin(rad),
    };
  });
}
```

### Animations

```css
/* Outer ring rotation */
@keyframes whirlpool-outer-ring {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.whirlpool-outer-ring {
  animation: whirlpool-outer-ring 6s linear infinite;
  transform-origin: center;
}

.whirlpool-outer-ring-reverse {
  animation: whirlpool-outer-ring 6s linear infinite reverse;
  transform-origin: center;
}

/* Spiral layer rotations (different speeds) */
@keyframes whirlpool-spiral-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.whirlpool-spiral {
  transform-origin: center;
}

.whirlpool-layer-1 {
  animation: whirlpool-spiral-rotate 3s linear infinite;
}

.whirlpool-layer-2 {
  animation: whirlpool-spiral-rotate 4s linear infinite;
}

.whirlpool-layer-3 {
  animation: whirlpool-spiral-rotate 5s linear infinite;
}

.whirlpool-layer-4 {
  animation: whirlpool-spiral-rotate 6s linear infinite;
}

.whirlpool-spiral-reverse {
  transform-origin: center;
}

.whirlpool-spiral-reverse.whirlpool-layer-1 {
  animation: whirlpool-spiral-rotate 3s linear infinite reverse;
}

.whirlpool-spiral-reverse.whirlpool-layer-2 {
  animation: whirlpool-spiral-rotate 4s linear infinite reverse;
}

.whirlpool-spiral-reverse.whirlpool-layer-3 {
  animation: whirlpool-spiral-rotate 5s linear infinite reverse;
}

.whirlpool-spiral-reverse.whirlpool-layer-4 {
  animation: whirlpool-spiral-rotate 6s linear infinite reverse;
}

/* Particle spiral animation */
@keyframes whirlpool-particle-orbit {
  from {
    transform: rotate(0deg) translateX(0px);
    opacity: 0.6;
  }
  to {
    transform: rotate(360deg) translateX(-5px);
    opacity: 0.2;
  }
}

.whirlpool-particle {
  animation: whirlpool-particle-orbit 2s ease-in-out infinite;
  transform-origin: center;
}

.whirlpool-particle-reverse {
  animation: whirlpool-particle-orbit 2s ease-in-out infinite reverse;
  transform-origin: center;
}

/* Flow animation for connection line */
@keyframes portal-flow {
  from {
    stroke-dashoffset: 0;
  }
  to {
    stroke-dashoffset: 20;
  }
}

.portal-flow-animation {
  animation: portal-flow 1s linear infinite;
}

/* Pulsing glow effect */
@keyframes whirlpool-pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.9;
  }
}

.whirlpool {
  animation: whirlpool-pulse 2s ease-in-out infinite;
}
```

### Canvas Implementation (Alternative)

```typescript
// Canvas-based whirlpool rendering
function renderWhirlpool(
  ctx: CanvasRenderingContext2D,
  center: { x: number; y: number },
  radius: number,
  color: string,
  direction: 1 | -1 // 1 for clockwise, -1 for counter-clockwise
) {
  const time = Date.now() * 0.001; // Animation time

  // Radial gradient background
  const gradient = ctx.createRadialGradient(
    center.x,
    center.y,
    0,
    center.x,
    center.y,
    radius
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0.9)");
  gradient.addColorStop(0.4, color + "99"); // 60% opacity
  gradient.addColorStop(1, color + "1A"); // 10% opacity

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Draw spiral layers
  for (let layer = 1; layer <= 4; layer++) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6 - layer * 0.1;

    ctx.beginPath();
    const layerRadius = radius * (1.5 - layer * 0.3);
    const turns = 2;
    const segments = 50;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle =
        (layer * 90 + direction * time * 60 + t * turns * 360) *
        (Math.PI / 180);
      const r = layerRadius * (1 - t * 0.7);
      const x = center.x + r * Math.cos(angle);
      const y = center.y + r * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  // Draw center vortex
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Draw particles
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = "white";
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + direction * time;
    const distance = radius * 0.8;
    const x = center.x + distance * Math.cos(angle);
    const y = center.y + distance * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}
```

### Color Variations

```typescript
// Theme-based whirlpool colors
const whirlpoolColors = {
  default: "#8b5cf6", // Purple
  water: "#3b82f6", // Blue
  fire: "#ef4444", // Red
  nature: "#10b981", // Green
  dark: "#6b7280", // Gray
  electric: "#eab308", // Yellow
};
```

---

## 6. Walls and Exits Rendering

### Concept: Stadium Boundaries

Walls and exits are **arcs or lines** on the edges of the stadium based on arena shape:

- **Walls (Black)**: Solid boundaries that damage and rebound beyblades
- **Exits (Red)**: Open boundaries where beyblades go out of bounds (lose condition)
- **Spikes**: Increased damage on collision
- **Springs**: No damage, higher rebound force

### Configuration

```typescript
interface WallConfig {
  enabled: boolean;
  segments: WallSegment[];
}

interface WallSegment {
  type: "wall" | "exit";
  startAngle: number; // Degrees (0-360)
  endAngle: number;

  // Wall properties
  wallType?: "solid" | "spike" | "spring";
  damage?: number; // Collision damage
  reboundForce?: number; // 0.5-2.0 multiplier

  // Visual
  color?: string; // Black for walls, red for exits
  thickness?: number; // Line thickness
}
```

### Rendering: Circle Arena

```tsx
<g className="arena-boundaries">
  {arena.wall.segments.map((segment, idx) => {
    const startRad = (segment.startAngle * Math.PI) / 180;
    const endRad = (segment.endAngle * Math.PI) / 180;

    return (
      <path
        key={idx}
        d={generateArc(arena.center, arena.radius, startRad, endRad)}
        stroke={segment.type === "exit" ? "#ef4444" : "#000"}
        strokeWidth={segment.thickness || 6}
        fill="none"
        opacity="0.9"
        className={`boundary-${segment.type}`}
        data-wall-type={segment.wallType}
      />
    );
  })}
</g>
```

### Rendering: Polygon Arena (Pentagon, Hexagon, etc.)

```tsx
<g className="arena-boundaries">
  {arena.wall.segments.map((segment, idx) => {
    const vertices = getPolygonVertices(arena.shape, arena.radius, arena.sides);
    const startVertex = vertices[segment.startIndex];
    const endVertex = vertices[segment.endIndex];

    return (
      <line
        key={idx}
        x1={startVertex.x}
        y1={startVertex.y}
        x2={endVertex.x}
        y2={endVertex.y}
        stroke={segment.type === "exit" ? "#ef4444" : "#000"}
        strokeWidth={segment.thickness || 6}
        opacity="0.9"
        className={`boundary-${segment.type}`}
      />
    );
  })}
</g>
```

### Wall Type Visual Variations

```tsx
{
  /* Solid Wall - Plain black */
}
<path stroke="#000" strokeWidth="6" opacity="0.9" />;

{
  /* Spike Wall - Black with spike pattern */
}
<g className="spike-wall">
  <path stroke="#000" strokeWidth="6" />
  {/* Add spike decorations */}
  {generateSpikes(segment).map((spike, i) => (
    <polygon
      key={i}
      points={spike.points}
      fill="#333"
      stroke="#000"
      strokeWidth="1"
    />
  ))}
</g>;

{
  /* Spring Wall - Black with coil pattern */
}
<g className="spring-wall">
  <path stroke="#000" strokeWidth="6" />
  {/* Add spring coil decoration */}
  <path
    d={generateSpringCoil(segment)}
    stroke="#444"
    strokeWidth="2"
    fill="none"
  />
</g>;

{
  /* Exit - Red with dashed pattern */
}
<path
  stroke="#ef4444"
  strokeWidth="6"
  strokeDasharray="10,5"
  opacity="0.8"
  className="exit-pulse"
/>;
```

### Collision Physics

```typescript
function handleWallCollision(beyblade: Beyblade, segment: WallSegment): void {
  if (segment.type === "exit") {
    // Beyblade goes out of bounds - lose condition
    beyblade.status = "out-of-bounds";
    return;
  }

  // Calculate collision angle
  const normal = calculateWallNormal(segment, beyblade.position);

  // Apply damage
  let damage = segment.damage || 5;
  if (segment.wallType === "spike") {
    damage *= 2; // Double damage for spikes
  }
  beyblade.health -= damage;

  // Calculate rebound
  let reboundForce = segment.reboundForce || 0.8;
  if (segment.wallType === "spring") {
    reboundForce = 1.5; // Higher rebound, no damage
    beyblade.health += damage; // Undo damage
  }

  // Reflect velocity
  const dotProduct =
    beyblade.velocity.x * normal.x + beyblade.velocity.y * normal.y;
  beyblade.velocity = {
    x: (beyblade.velocity.x - 2 * dotProduct * normal.x) * reboundForce,
    y: (beyblade.velocity.y - 2 * dotProduct * normal.y) * reboundForce,
  };
}
```

---

## 7. Pit Rendering

### Concept: 2D Hole/Trap Object

Pits are **2D hole objects** that:

- Trap beyblades (stuck condition)
- Deal spin damage each second
- 50% chance per second to escape
- Beyblade stops or escapes to continue

### Configuration

```typescript
interface PitConfig {
  position: { x: number; y: number };
  radius: number;
  spinDamage: number; // Damage per second
  escapeChance: number; // 0.0-1.0 (default: 0.5)
  visualDepth: number; // Visual layers (1-5)
  swirlEffect: boolean;
}
```

### Star Rendering

```tsx
<g className="goal-star" data-theme={theme}>
  {/* Background glow */}
  <circle
    cx={x}
    cy={y}
    r={radius * 2}
    fill={color}
    opacity="0.3"
    className="pulse-glow"
  />

  {/* Star shape */}
  <path
    d={generateStarPath(x, y, radius, 5)}
    fill={color}
    stroke="white"
    strokeWidth="2"
    className="spin-animation"
  />

  {/* Score value */}
  <text
    x={x}
    y={y + radius + 15}
    textAnchor="middle"
    fontSize="0.6em"
    fill="white"
  >
    {scoreValue} pts
  </text>
</g>
```

### Crystal Rendering

```tsx
<g className="goal-crystal" data-theme={theme}>
  {/* Crystal polygon (hexagon) */}
  <polygon
    points={generateHexagonPoints(x, y, radius)}
    fill={color}
    stroke="white"
    strokeWidth="2"
    className="sparkle-effect"
  />

  {/* Shine effect */}
  <line
    x1={x - radius * 0.5}
    y1={y - radius * 0.5}
    x2={x + radius * 0.5}
    y2={y + radius * 0.5}
    stroke="white"
    strokeWidth="3"
    opacity="0.8"
    className="shine-animation"
  />
</g>
```

### Collectible vs Destructible States

#### Collectible (isCollectible: true)

```css
.goal-collectible {
  animation: float 2s ease-in-out infinite;
  cursor: pointer;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
```

#### Destructible (isCollectible: false)

```tsx
<g className="goal-destructible">
  {/* Main object */}
  <circle cx={x} cy={y} r={radius} fill={color} />

  {/* Health bar */}
  <rect
    x={x - radius}
    y={y - radius - 8}
    width={radius * 2 * (health / maxHealth)}
    height="4"
    fill="red"
  />

  {/* Shield (if exists) */}
  {shieldHealth > 0 && (
    <circle
      cx={x}
      cy={y}
      r={radius * 1.3}
      fill="none"
      stroke="cyan"
      strokeWidth="3"
      opacity="0.6"
    />
  )}
</g>
```

---

## 7. Pit Rendering (Continued)

### Visual Layers

```tsx
<g className="pit" data-depth={visualDepth}>
  {/* Outer glow/danger ring */}
  <circle
    cx={position.x}
    cy={position.y}
    r={radius * 1.3}
    fill="url(#pitGradient)"
    opacity="0.4"
  />

  {/* Main pit hole */}
  <circle
    cx={position.x}
    cy={position.y}
    r={radius}
    fill="#000"
    opacity="0.9"
  />

  {/* Swirl effect (if enabled) */}
  {swirlEffect && (
    <path
      d={generateSwirlPath(position, radius)}
      stroke="rgba(100,100,100,0.5)"
      strokeWidth="2"
      fill="none"
      className="swirl-rotate"
    />
  )}

  {/* Depth rings (concentric circles) */}
  {Array.from({ length: visualDepth }).map((_, i) => (
    <circle
      key={i}
      cx={position.x}
      cy={position.y}
      r={radius * (1 - (i + 1) * 0.15)}
      fill="none"
      stroke="rgba(50,50,50,0.4)"
      strokeWidth="1"
    />
  ))}
</g>

<defs>
  <radialGradient id="pitGradient">
    <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
    <stop offset="100%" stopColor="rgba(0,0,0,0.8)" />
  </radialGradient>
</defs>
```

### Pit Physics & Trap Mechanics

```typescript
function handlePitCollision(beyblade: Beyblade, pit: PitConfig): void {
  // Beyblade enters pit
  beyblade.status = "trapped";
  beyblade.trapStart = Date.now();

  // Trap mechanics interval (runs every second)
  const trapInterval = setInterval(() => {
    if (beyblade.status !== "trapped") {
      clearInterval(trapInterval);
      return;
    }

    // Apply spin damage
    beyblade.spin -= pit.spinDamage;

    // Check if beyblade stopped
    if (beyblade.spin <= 0) {
      beyblade.status = "stopped";
      beyblade.health = 0;
      clearInterval(trapInterval);
      return;
    }

    // 50% chance to escape each second
    if (Math.random() < (pit.escapeChance || 0.5)) {
      beyblade.status = "active";
      // Eject from pit
      const escapeAngle = Math.random() * Math.PI * 2;
      beyblade.position = {
        x: pit.position.x + (pit.radius + 5) * Math.cos(escapeAngle),
        y: pit.position.y + (pit.radius + 5) * Math.sin(escapeAngle),
      };
      clearInterval(trapInterval);
    }
  }, 1000); // Every 1 second
}
```

---

## 8. Goal Objects Rendering

### Concept: Collectible/Interactive Objects

Goals are **2D objects** scattered randomly in the arena (except on portals, exits, pits) that:

- Trigger effects on beyblade contact
- Can give spin, boosts, steal spin, or slow down
- Visual appearance based on theme

### Configuration

```typescript
interface GoalObjectConfig {
  type: "boost" | "spin" | "debuff" | "health";
  position: { x: number; y: number };
  radius: number;
  effect: {
    type: "add-spin" | "speed-boost" | "steal-spin" | "slow-down" | "heal";
    value: number; // Amount of effect
    duration?: number; // For temporary effects (ms)
  };

  // Theme-based visuals
  theme: ArenaTheme;
  visual:
    | "tree"
    | "person"
    | "dinosaur"
    | "alien"
    | "crystal"
    | "coin"
    | "star";

  // Behavior
  respawn: boolean; // Respawn after collection
  respawnTime: number; // Milliseconds
}
```

### Theme-Based Visuals

```tsx
<g className="goal-object" data-theme={theme} data-type={type}>
  {/* Background glow effect */}
  <circle
    cx={position.x}
    cy={position.y}
    r={radius * 2}
    fill={getGoalColor(type)}
    opacity="0.2"
    className="pulse-glow"
  />

  {/* Main object - use sprite or emoji based on theme */}
  {visual === "tree" && theme === "forest" && (
    <g>
      {/* Tree sprite/icon */}
      <rect
        x={position.x - radius * 0.3}
        y={position.y - radius}
        width={radius * 0.6}
        height={radius * 2}
        fill="#8B4513"
      />
      <circle
        cx={position.x}
        cy={position.y - radius}
        r={radius}
        fill="#228B22"
      />
    </g>
  )}

  {visual === "dinosaur" && theme === "prehistoric" && (
    <text
      x={position.x}
      y={position.y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={`${radius * 2}px`}
    >
      🦕
    </text>
  )}

  {visual === "alien" && theme === "futuristic" && (
    <text
      x={position.x}
      y={position.y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={`${radius * 2}px`}
    >
      👽
    </text>
  )}

  {/* Float animation */}
  <animateTransform
    attributeName="transform"
    type="translate"
    values="0,0; 0,-5; 0,0"
    dur="2s"
    repeatCount="indefinite"
  />
</g>
```

### Goal Collision & Effects

```typescript
function handleGoalCollision(beyblade: Beyblade, goal: GoalObjectConfig): void {
  switch (goal.effect.type) {
    case "add-spin":
      beyblade.spin += goal.effect.value;
      break;

    case "speed-boost":
      const boostMultiplier = 1 + goal.effect.value;
      beyblade.velocity.x *= boostMultiplier;
      beyblade.velocity.y *= boostMultiplier;
      // Temporary boost
      if (goal.effect.duration) {
        setTimeout(() => {
          beyblade.velocity.x /= boostMultiplier;
          beyblade.velocity.y /= boostMultiplier;
        }, goal.effect.duration);
      }
      break;

    case "steal-spin":
      beyblade.spin -= goal.effect.value;
      break;

    case "slow-down":
      beyblade.velocity.x *= 1 - goal.effect.value;
      beyblade.velocity.y *= 1 - goal.effect.value;
      break;

    case "heal":
      beyblade.health = Math.min(100, beyblade.health + goal.effect.value);
      break;
  }

  // Remove goal or set respawn timer
  goal.collected = true;
  if (goal.respawn) {
    setTimeout(() => {
      goal.collected = false;
    }, goal.respawnTime);
  }
}
```

---

## 9. Rotation Body Rendering

### Concept: 2D Rotational Force Field

Rotation bodies are **2D area objects** (similar to water bodies) that:

- Push beyblades in their spin tangent direction
- Don't add to spin value, only apply directional force
- Effect is stronger on low-spin/low-velocity beyblades
- Rendered in red color

### Configuration

```typescript
interface RotationBodyConfig {
  position: { x: number; y: number };
  shape: "circle" | "rectangle" | "star" | "polygon";
  radius?: number; // For circle/star/polygon
  width?: number; // For rectangle
  height?: number;

  // Rotation properties
  rotationForce: number; // Force applied (0.1-5.0)
  direction: "clockwise" | "counter-clockwise";
  falloff: number; // How force decreases with beyblade velocity (0.0-1.0)

  // Visual
  color: string; // Default: red (#ef4444)
  opacity: number; // Default: 0.5
  rotationAnimation: boolean; // Visual spinning effect
}
```

### Rendering

```tsx
<g className="rotation-body" data-direction={direction}>
  {/* Main rotation area */}
  {shape === "circle" && (
    <circle
      cx={position.x}
      cy={position.y}
      r={radius}
      fill={color || "#ef4444"}
      opacity={opacity || 0.5}
    />
  )}

  {shape === "rectangle" && (
    <rect
      x={position.x - width / 2}
      y={position.y - height / 2}
      width={width}
      height={height}
      fill={color || "#ef4444"}
      opacity={opacity || 0.5}
    />
  )}

  {/* Rotation direction indicators (arrows) */}
  {rotationAnimation && (
    <g className="rotation-arrows">
      {generateRotationArrows(position, radius, direction).map((arrow, i) => (
        <path
          key={i}
          d={arrow.path}
          fill="white"
          opacity="0.7"
          className={`arrow-animate-${direction}`}
        />
      ))}
    </g>
  )}

  {/* Visual spinning effect */}
  {rotationAnimation && (
    <animateTransform
      attributeName="transform"
      type="rotate"
      from={`0 ${position.x} ${position.y}`}
      to={`${direction === "clockwise" ? 360 : -360} ${position.x} ${
        position.y
      }`}
      dur="4s"
      repeatCount="indefinite"
    />
  )}
</g>
```

### Rotation Physics

```typescript
function handleRotationBodyEffect(
  beyblade: Beyblade,
  rotationBody: RotationBodyConfig
): void {
  // Check if beyblade is inside rotation body
  if (!isInside(beyblade.position, rotationBody)) return;

  // Calculate beyblade's velocity magnitude
  const speed = Math.sqrt(beyblade.velocity.x ** 2 + beyblade.velocity.y ** 2);

  // High velocity/spin beyblades can resist the effect
  const resistanceFactor = Math.min(
    1,
    (speed + beyblade.spin / 10) * rotationBody.falloff
  );
  const effectiveForce = rotationBody.rotationForce * (1 - resistanceFactor);

  // Calculate tangent direction (perpendicular to radius from center)
  const dx = beyblade.position.x - rotationBody.position.x;
  const dy = beyblade.position.y - rotationBody.position.y;
  const distance = Math.sqrt(dx ** 2 + dy ** 2);

  if (distance === 0) return;

  // Tangent vector (perpendicular)
  let tangentX, tangentY;
  if (rotationBody.direction === "clockwise") {
    tangentX = dy / distance;
    tangentY = -dx / distance;
  } else {
    tangentX = -dy / distance;
    tangentY = dx / distance;
  }

  // Apply force in tangent direction
  beyblade.velocity.x += tangentX * effectiveForce;
  beyblade.velocity.y += tangentY * effectiveForce;

  // Note: Does NOT add to spin value, only pushes in direction
}
```

---

## 10. ArenaPreview Component Update

### Implementation Priority

```typescript
// ArenaPreview.tsx
export function ArenaPreview({ arena, width, height }: Props) {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* 1. Floor/Background */}
      <rect
        fill={arena.floorColor || "#8b7355"}
        width={width}
        height={height}
      />

      {/* 2. Liquid bodies (behind everything) */}
      {arena.liquidBodies?.map((liquid) => (
        <LiquidBodyRenderer key={liquid.id} config={liquid} />
      ))}

      {/* 3. Rotation bodies */}
      {arena.rotationBodies?.map((rotation) => (
        <RotationBodyRenderer key={rotation.id} config={rotation} />
      ))}

      {/* 4. Pits */}
      {arena.pits.map((pit) => (
        <PitRenderer key={pit.id} pit={pit} />
      ))}

      {/* 5. Loops (PATH LINES only) */}
      {arena.loops.map((loop) => (
        <LoopRenderer key={loop.id} loop={loop} />
      ))}

      {/* 6. Charge points on loops */}
      {arena.loops.map((loop) =>
        loop.chargePoints?.map((cp) => (
          <ChargePointRenderer key={cp.angle} chargePoint={cp} loop={loop} />
        ))
      )}

      {/* 7. Obstacles (theme-based, placement-aware) */}
      {arena.obstacles.map((obstacle) => (
        <ObstacleRenderer
          key={obstacle.id}
          obstacle={obstacle}
          theme={arena.theme}
        />
      ))}

      {/* 8. Goal objects */}
      {arena.goalObjects.map((goal) => (
        <GoalRenderer key={goal.id} goal={goal} theme={arena.theme} />
      ))}

      {/* 9. Portals (2D doors) */}
      {arena.portals?.map((portal) => (
        <PortalRenderer key={portal.id} portal={portal} />
      ))}

      {/* 10. Walls and exits (edges) */}
      {arena.wall.segments.map((segment, idx) => (
        <WallSegmentRenderer
          key={idx}
          segment={segment}
          arenaShape={arena.shape}
        />
      ))}
    </svg>
  );
}
```

---

## 11. Testing Checklist

```typescript
// ArenaPreview.tsx
export function ArenaPreview({ arena, width, height }: Props) {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* 1. Floor/Background */}
      <rect fill={arena.floorColor || "#8b7355"} />

      {/* 2. Water bodies (behind everything) */}
      {arena.waterBody && <WaterBodyRenderer config={arena.waterBody} />}

      {/* 3. Pits */}
      {arena.pits.map(pit => <PitRenderer key={...} pit={pit} />)}

      {/* 4. Loops (OUTLINE only) */}
      {arena.loops.map(loop => (
        <LoopRenderer
          key={...}
          loop={loop}
          renderStyle="outline" // Force outline
        />
      ))}

      {/* 5. Charge points on loops */}
      {arena.loops.map(loop =>
        loop.chargePoints?.map(cp => (
          <ChargePointRenderer key={...} chargePoint={cp} loop={loop} />
        ))
      )}

      {/* 6. Obstacles (theme-based) */}
      {arena.obstacles.map(obstacle => (
        <ObstacleRenderer
          key={...}
          obstacle={obstacle}
          theme={arena.theme}
        />
      ))}

      {/* 7. Goal objects */}
      {arena.goalObjects.map(goal => (
        <GoalRenderer
          key={...}
          goal={goal}
          theme={arena.theme}
        />
      ))}

      {/* 8. Portals */}
      {arena.portals?.map(portal => (
        <PortalRenderer key={...} portal={portal} />
      ))}

      {/* 9. Walls and exits */}
      {arena.wall.enabled ? (
        <WallRenderer config={arena.wall} exits={arena.exits} />
      ) : (
        <ExitBoundaryRenderer allExits={arena.wall.allExits} />
      )}
    </svg>
  );
}
```

---

## 10. Performance Optimization

### Rendering Tips

1. **Use SVG for Static Elements**

   - Loops, walls, obstacles
   - Better for scaling and rotation

2. **Use Canvas for Dynamic Elements**

   - Beyblades, particles, effects
   - Better for animations and frequent updates

3. **Lazy Load Theme Assets**

   ```typescript
   const themeAssets = useMemo(() => {
     return loadThemeAssets(arena.theme);
   }, [arena.theme]);
   ```

4. **Memoize Complex Paths**

   ```typescript
   const loopPath = useMemo(() => {
     return generateLoopPath(loop);
   }, [loop.shape, loop.radius]);
   ```

5. **Use CSS Animations Over JS**

   - Leverage GPU acceleration
   - Better performance for simple animations

6. **Implement Viewport Culling**
   ```typescript
   // Only render objects in viewport
   const visibleObjects = objects.filter((obj) =>
     isInViewport(obj.position, viewport)
   );
   ```

---

## 11. Testing Checklist

### Visual Tests

- [ ] Loops render as PATH LINES (not filled areas)
- [ ] Charge points display with button numbers (1, 2, 3)
- [ ] Obstacles use theme-specific icons
- [ ] Obstacles placed correctly (center/random/evenly-distributed)
- [ ] Liquid bodies render at custom positions (not loop-dependent)
- [ ] Liquid moat shapes render correctly (two concentric shapes)
- [ ] Portals show as 2D doors with entry/exit
- [ ] Walls render in BLACK, exits in RED
- [ ] Wall types display correctly (solid/spike/spring)
- [ ] Pits show depth with concentric rings
- [ ] Goal objects match theme (tree/person/dinosaur/alien)
- [ ] Rotation bodies render in RED with rotation indicators

### Physics Tests

- [ ] Loop boosts work on PATH LINE contact
- [ ] Obstacles cause damage and rebound on collision
- [ ] Liquid bodies slow beyblades correctly
- [ ] Portals teleport beyblades from IN to OUT
- [ ] Walls damage and rebound beyblades
- [ ] Springs bounce without damage, increased force
- [ ] Spikes deal double damage
- [ ] Exits trigger out-of-bounds condition
- [ ] Pits trap beyblades with spin damage
- [ ] Pit escape chance works (50% per second)
- [ ] Goal objects trigger effects (spin/boost/debuff)
- [ ] Rotation bodies push in tangent direction
- [ ] Rotation effect weaker on high-velocity beyblades

### Animation Tests

- [ ] Charge points pulse when active
- [ ] Portal spirals rotate continuously
- [ ] Liquid wave animation smooth
- [ ] Goal collectibles float
- [ ] Exit zones pulse gently
- [ ] Rotation body arrows rotate
- [ ] Pit swirl effect rotates

### Theme Tests

- [ ] Each theme loads correct obstacle icons
- [ ] Goal objects match theme variants
- [ ] Floor textures apply correctly
- [ ] Theme colors are consistent

### Placement Tests

- [ ] Center placement puts all obstacles at center
- [ ] Random placement avoids portals, exits, pits
- [ ] Evenly distributed placement creates circle pattern
- [ ] Goals avoid portals, exits, and pits

### Performance Tests

- [ ] Arena with 10 loops + 50 obstacles renders smoothly
- [ ] Animations maintain 60fps
- [ ] Theme assets load without blocking
- [ ] Memory usage stays under 100MB

---

## 12. Summary

All rendering specifications are now defined with accurate physics and visual representations:

1. **Loops**: PATH LINES for boost mechanics (not filled areas)
2. **Charge Points**: Interactive dash exit buttons with gamepad mapping
3. **Obstacles**: 2D collidable objects with placement options (center/random/evenly)
4. **Liquid Bodies**: 2D areas with custom positioning, moat shapes, physics effects
5. **Portals**: 2D door connections between points (mirror/custom styles)
6. **Walls & Exits**: Edge boundaries (black walls, red exits, spike/spring variants)
7. **Pits**: 2D trap holes with spin damage and escape mechanics
8. **Goal Objects**: Theme-based collectibles with effect triggers
9. **Rotation Bodies**: 2D rotational force fields (red, tangent push)

Implementation should follow the ArenaPreview priority order for correct layering and visual hierarchy.
