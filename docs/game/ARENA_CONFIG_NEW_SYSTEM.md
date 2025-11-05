# Arena Configuration System - Clean Rebuild

## Overview

A complete rebuild of the arena configuration system focusing on the core features:

- Arena basics (name, shape, theme)
- Auto-rotation
- Advanced wall system with multiple walls per edge
- Exits as gaps between walls

## Core Features

### 1. **Arena Basics**

```typescript
interface ArenaConfig {
  // Identity
  name: string;
  description?: string;

  // Geometry
  width: number; // em units (typically 50)
  height: number; // em units (typically 50)
  shape: ArenaShape;

  // Visual
  theme: ArenaTheme;
  backgroundColor?: string;
  floorColor?: string;
  floorTexture?: string;

  // Rotation
  autoRotate: boolean;
  rotationSpeed: number; // degrees per second
  rotationDirection: "clockwise" | "counterclockwise";

  // Walls
  wall: WallConfig;
}
```

### 2. **Supported Shapes**

| Shape    | Edges | Description            |
| -------- | ----- | ---------------------- |
| circle   | 1     | Classic circular arena |
| triangle | 3     | Triangular arena       |
| square   | 4     | Square arena           |
| pentagon | 5     | Pentagon arena         |
| hexagon  | 6     | Hexagon arena          |
| heptagon | 7     | Heptagon arena         |
| octagon  | 8     | Octagon arena          |

### 3. **Themes**

Available themes with unique color schemes:

- `forest` - Green nature theme
- `mountains` - Gray rocky theme
- `grasslands` - Bright green theme
- `metrocity` - Blue urban theme
- `safari` - Sandy brown theme
- `prehistoric` - Dark brown ancient theme
- `futuristic` - Purple sci-fi theme
- `desert` - Sandy orange theme
- `sea` - Blue aquatic theme
- `riverbank` - Teal water theme

### 4. **Auto-Rotation**

The arena can rotate continuously:

```typescript
{
  autoRotate: true,
  rotationSpeed: 6,  // 6°/sec = 360°/60sec = 1 minute per full rotation
  rotationDirection: "clockwise"
}
```

**Common rotation speeds:**

- `6` degrees/sec = 1 minute per rotation (slow, strategic)
- `12` degrees/sec = 30 seconds per rotation (medium)
- `36` degrees/sec = 10 seconds per rotation (fast, chaotic)

## Wall System

### Architecture

The wall system is edge-based:

1. Each shape has a specific number of edges
2. Each edge can have 1-3 wall segments
3. Gaps between walls become exits
4. Exits are shown as red zones with arrows pointing outward

### Wall Configuration

```typescript
interface WallConfig {
  enabled: boolean;

  // Edge-based configuration
  edges: EdgeWallConfig[];

  // Appearance
  wallStyle: "brick" | "metal" | "wood" | "stone";
  wallColor?: string;
  exitStyle: "arrows" | "glow" | "dashed";
  exitColor: string;

  // Physics
  baseDamage: number;
  recoilDistance: number;
  hasSpikes: boolean;
  spikeDamageMultiplier: number;
}

interface EdgeWallConfig {
  walls: WallSegment[]; // 1-3 wall segments per edge
}

interface WallSegment {
  width: number; // 0-100% of edge length
  thickness: number; // em units
  position: number; // 0-100% position along edge
}
```

### Example Configurations

#### Single Wall Per Edge (Full Coverage)

```typescript
{
  edges: [
    {
      walls: [
        {
          width: 100, // Covers 100% of edge
          thickness: 1, // 1em thick
          position: 0, // Starts at edge beginning
        },
      ],
    },
  ];
}
```

#### Two Walls Per Edge (Center Exit)

```typescript
{
  edges: [
    {
      walls: [
        {
          width: 40, // First wall: 40% of edge
          thickness: 1.5,
          position: 0, // Starts at beginning
        },
        {
          width: 40, // Second wall: 40% of edge
          thickness: 1.5,
          position: 60, // Starts at 60% (leaves 20% gap)
        },
      ],
    },
  ];
}
```

**Result:** 40% wall | 20% exit | 40% wall

#### Three Walls Per Edge (Two Exits)

```typescript
{
  edges: [
    {
      walls: [
        {
          width: 25, // First wall
          thickness: 1,
          position: 0,
        },
        {
          width: 30, // Center wall
          thickness: 1,
          position: 35, // 10% gap before
        },
        {
          width: 25, // Last wall
          thickness: 1,
          position: 75, // 10% gap after center
        },
      ],
    },
  ];
}
```

**Result:** 25% wall | 10% exit | 30% wall | 10% exit | 25% wall

### Random Wall Generation

```typescript
import { generateRandomWalls } from "@/types/arenaConfigNew";

const randomWalls = generateRandomWalls("hexagon");
// Returns a WallConfig with random wall patterns on each edge
```

**Random generation rules:**

- 1-3 walls per edge (random)
- Wall widths vary: 60-100% (single), 30-45% (dual), 20-30% (triple)
- Thickness varies: 0.5-2.0em
- Positions ensure gaps become exits

## Rendering

### Wall Rendering

**Brick Pattern:**

- Walls are rendered with a brick pattern using SVG patterns
- Pattern ID: `brickPattern`
- Colors: Brown (#8B4513) and tan (#A0522D)

**For Circular Arenas:**

- Walls rendered as arcs along the circle
- Position and width converted to angles (% → degrees)

**For Polygon Arenas:**

- Walls rendered as line segments on each edge
- Position and width as percentages of edge length

### Exit Rendering

**Red Zones:**

- Color: `#ef4444` (red)
- Style: Dashed line (10px dash, 5px gap)
- Width: 8px stroke

**Arrows:**

- Arrow markers pointing outward
- Positioned at the center of each exit
- 20px length from boundary

### Auto-Rotation Animation

Uses `requestAnimationFrame` for smooth 60fps animation:

```typescript
rotationRef.current += (arena.rotationSpeed / 60) * direction;
```

## Helper Functions

### `getEdgeCount(shape: ArenaShape): number`

Returns the number of edges for a shape.

```typescript
getEdgeCount("triangle"); // 3
getEdgeCount("hexagon"); // 6
getEdgeCount("circle"); // 1
```

### `initializeWallConfig(shape: ArenaShape): WallConfig`

Creates a default wall configuration with full walls on all edges.

```typescript
const walls = initializeWallConfig("pentagon");
// Returns WallConfig with 5 edges, each with 1 full wall
```

### `generateRandomWalls(shape: ArenaShape): WallConfig`

Generates random wall patterns.

```typescript
const randomWalls = generateRandomWalls("hexagon");
// Each of the 6 edges gets 1-3 random walls with gaps
```

## Usage Examples

### Example 1: Simple Circular Arena

```typescript
const arena: ArenaConfig = {
  name: "Classic Circle",
  width: 50,
  height: 50,
  shape: "circle",
  theme: "metrocity",
  autoRotate: false,
  rotationSpeed: 0,
  rotationDirection: "clockwise",
  wall: initializeWallConfig("circle"),
};
```

### Example 2: Rotating Hexagon with Exits

```typescript
const arena: ArenaConfig = {
  name: "Spinning Fortress",
  width: 50,
  height: 50,
  shape: "hexagon",
  theme: "futuristic",
  autoRotate: true,
  rotationSpeed: 12, // 30 seconds per rotation
  rotationDirection: "clockwise",
  wall: {
    enabled: true,
    edges: [
      // Edge 0: Two walls with center exit
      {
        walls: [
          { width: 45, thickness: 1.5, position: 0 },
          { width: 45, thickness: 1.5, position: 55 },
        ],
      },
      // Edge 1: Full wall
      {
        walls: [{ width: 100, thickness: 1.5, position: 0 }],
      },
      // Edge 2: Two walls with center exit
      {
        walls: [
          { width: 45, thickness: 1.5, position: 0 },
          { width: 45, thickness: 1.5, position: 55 },
        ],
      },
      // Edge 3: Full wall
      {
        walls: [{ width: 100, thickness: 1.5, position: 0 }],
      },
      // Edge 4: Two walls with center exit
      {
        walls: [
          { width: 45, thickness: 1.5, position: 0 },
          { width: 45, thickness: 1.5, position: 55 },
        ],
      },
      // Edge 5: Full wall
      {
        walls: [{ width: 100, thickness: 1.5, position: 0 }],
      },
    ],
    wallStyle: "brick",
    exitStyle: "arrows",
    exitColor: "#ef4444",
    baseDamage: 5,
    recoilDistance: 2,
    hasSpikes: false,
    spikeDamageMultiplier: 1.5,
  },
};
```

### Example 3: Random Chaos Arena

```typescript
const arena: ArenaConfig = {
  name: "Random Chaos",
  width: 50,
  height: 50,
  shape: "pentagon",
  theme: "prehistoric",
  autoRotate: true,
  rotationSpeed: 36, // 10 seconds per rotation (fast!)
  rotationDirection: "counterclockwise",
  wall: generateRandomWalls("pentagon"),
};
```

## Presets

Four built-in presets are available:

1. **classic** - Classic circular stadium
2. **square_arena** - Basic square arena
3. **hexagon_fortress** - Rotating hexagon (1 min rotation)
4. **pentagon_chaos** - Random walls, fast rotation

Access via:

```typescript
import { ARENA_PRESETS } from "@/types/arenaConfigNew";

const myArena = { ...ARENA_PRESETS.hexagon_fortress };
```

## Components

### ArenaPreviewBasic

Main preview component that renders the arena.

```typescript
import ArenaPreviewBasic from "@/components/admin/ArenaPreviewBasic";

<ArenaPreviewBasic arena={arenaConfig} width={600} height={600} />;
```

**Features:**

- Shows arena name, shape, theme info header
- Renders arena floor with theme colors
- Renders walls with brick pattern
- Renders exits with red zones and arrows
- Auto-rotation animation (60fps)
- Center dot for visual reference

## Visual Appearance

### Walls

- **Brick pattern** with brown/tan colors
- Shadows for depth (30% black overlay)
- Thickness scales with arena size
- Rounded caps for smooth appearance

### Exits

- **Red dashed lines** (#ef4444)
- 10px dash, 5px gap pattern
- **Red arrows** pointing outward
- Arrow markers at exit centers

### Rotation

- Smooth 60fps animation
- Center dot remains stationary
- Entire arena group rotates
- Direction: clockwise or counterclockwise

## File Structure

```
src/
  types/
    arenaConfigNew.ts           # Type definitions, helpers, presets
  components/
    admin/
      ArenaPreviewBasic.tsx     # Preview component with rendering
```

## Migration Notes

This is a **clean rebuild** focusing on core features. Future additions:

- Loops (speed boost paths)
- Obstacles (rocks, pillars)
- Water bodies (liquid hazards)
- Pits (trap zones)
- Portals (teleportation)
- Goal objects
- Laser guns
- Rotation bodies

The new system is designed to be modular and extensible for these future features.
