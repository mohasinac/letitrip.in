# Arena Walls and Exits System

## Overview

The arena walls system now supports flexible wall configuration with per-edge widths, shape-aware rendering, and automatic exit generation. Walls can be individually configured for each edge of the arena, with 0 width indicating an exit (open boundary).

## Key Features

### 1. **Shape-Aware Rendering**

- Arena shape (circle, rectangle, pentagon, etc.) determines wall structure
- Walls automatically follow the arena's shape
- Exits are clearly marked with red dashed lines

### 2. **Per-Edge Wall Widths**

- **Circle**: Single uniform width around entire perimeter
- **Rectangle**: Individual widths for top, right, bottom, left edges
- **Other shapes**: Uniform width around entire perimeter
- **0 width = Exit**: Any edge with 0 width becomes an exit

### 3. **Random Wall Generation**

- `randomWalls: true` automatically generates random wall widths
- 30% chance for each edge to be an exit (width = 0)
- 70% chance for wall with random width (0-2 em units)

## Wall Configuration

### WallConfig Interface

```typescript
export interface WallConfig {
  enabled: boolean; // Master switch for walls

  // Wall width configuration (em units, 0 = exit)
  wallWidths?: {
    uniform?: number; // For all shapes (circle, polygons)
    top?: number; // Rectangle only
    right?: number; // Rectangle only
    bottom?: number; // Rectangle only
    left?: number; // Rectangle only
  };

  randomWalls?: boolean; // Auto-generate random walls

  // Legacy properties (still supported)
  allExits?: boolean;
  wallCount?: number;
  exitsBetweenWalls?: boolean;

  // Wall properties
  baseDamage: number; // Damage on collision
  recoilDistance: number; // Bounce-back distance (em)
  hasSpikes: boolean; // Increases damage
  spikeDamageMultiplier: number; // Damage multiplier with spikes
  hasSprings: boolean; // Increases recoil
  springRecoilMultiplier: number; // Recoil multiplier with springs
  thickness: number; // Default thickness (em)
}
```

## Configuration Examples

### Example 1: Circle Arena with Uniform Walls

```typescript
{
  shape: "circle",
  width: 50,
  height: 50,

  wall: {
    enabled: true,
    wallWidths: {
      uniform: 1.5  // 1.5em wall around entire circle
    },
    baseDamage: 10,
    recoilDistance: 2,
    hasSpikes: false,
    spikeDamageMultiplier: 2.0,
    hasSprings: false,
    springRecoilMultiplier: 1.5,
    thickness: 1
  }
}
```

**Result**: Circular arena with 1.5em thick walls around entire perimeter.

### Example 2: Circle Arena with No Walls (All Exits)

```typescript
{
  shape: "circle",
  wall: {
    enabled: true,
    wallWidths: {
      uniform: 0  // 0 = entire perimeter is exit
    },
    baseDamage: 0,
    recoilDistance: 0,
    hasSpikes: false,
    spikeDamageMultiplier: 1.0,
    hasSprings: false,
    springRecoilMultiplier: 1.0,
    thickness: 0
  }
}
```

**Result**: Circular arena with red dashed line around perimeter (all exit).

### Example 3: Rectangle with Mixed Walls and Exits

```typescript
{
  shape: "rectangle",
  width: 50,
  height: 50,

  wall: {
    enabled: true,
    wallWidths: {
      top: 2,      // Solid wall
      right: 0,    // EXIT (no wall)
      bottom: 1.5, // Solid wall
      left: 0      // EXIT (no wall)
    },
    baseDamage: 15,
    recoilDistance: 3,
    hasSpikes: true,
    spikeDamageMultiplier: 2.0,
    hasSprings: false,
    springRecoilMultiplier: 1.0,
    thickness: 1
  }
}
```

**Result**:

- Top edge: 2em thick wall (black)
- Right edge: Open exit (red dashed)
- Bottom edge: 1.5em thick wall (black)
- Left edge: Open exit (red dashed)

### Example 4: Random Walls for Rectangle

```typescript
{
  shape: "rectangle",
  width: 50,
  height: 50,

  wall: {
    enabled: true,
    randomWalls: true,  // Auto-generate random walls
    baseDamage: 10,
    recoilDistance: 2,
    hasSpikes: false,
    spikeDamageMultiplier: 2.0,
    hasSprings: false,
    springRecoilMultiplier: 1.0,
    thickness: 1
  }
}
```

**Result**: Each edge (top, right, bottom, left) randomly assigned:

- 30% chance: Exit (0 width, red dashed)
- 70% chance: Wall (0-2em width, black solid)

### Example 5: Pentagon with Uniform Walls

```typescript
{
  shape: "pentagon",
  width: 50,
  height: 50,

  wall: {
    enabled: true,
    wallWidths: {
      uniform: 1.8
    },
    baseDamage: 12,
    recoilDistance: 2.5,
    hasSpikes: false,
    spikeDamageMultiplier: 2.0,
    hasSprings: true,
    springRecoilMultiplier: 1.5,
    thickness: 1
  }
}
```

**Result**: Pentagon-shaped arena with 1.8em thick walls around entire perimeter.

## Helper Functions

### generateRandomWallWidths()

Generates random wall widths based on arena shape.

```typescript
import { generateRandomWallWidths } from "@/types/arenaConfig";

// For circle
const circleWalls = generateRandomWallWidths("circle");
// Returns: { uniform: 0-2 or 0 }

// For rectangle
const rectWalls = generateRandomWallWidths("rectangle");
// Returns: { top: 0-2, right: 0-2, bottom: 0-2, left: 0-2 }

// For other shapes
const pentagonWalls = generateRandomWallWidths("pentagon");
// Returns: { uniform: 0-2 or 0 }
```

**Usage Example:**

```typescript
const arenaConfig: ArenaConfig = {
  shape: "rectangle",
  width: 50,
  height: 50,

  wall: {
    enabled: true,
    wallWidths: generateRandomWallWidths("rectangle"),
    baseDamage: 10,
    recoilDistance: 2,
    hasSpikes: false,
    spikeDamageMultiplier: 2.0,
    hasSprings: false,
    springRecoilMultiplier: 1.0,
    thickness: 1,
  },
};
```

## Visual Rendering

### Wall Colors

- **Black solid line**: Wall present (width > 0)
- **Red dashed line**: Exit/no wall (width = 0)
- **Thin gray line**: Arena boundary reference

### Wall Width Scale

- Width is in **em units**
- Rendered width = `width * scale`
- Typical range: 0.5 - 3 em
- 0 em = exit (no wall)

### Shape-Specific Rendering

#### Circle

```
┌─────────────────┐
│   ●●●●●●●●●●●  │  Uniform wall around
│  ●         ●   │  entire perimeter
│ ●   Arena   ●  │  or red dashed for
│  ●         ●   │  all-exit mode
│   ●●●●●●●●●●●  │
└─────────────────┘
```

#### Rectangle

```
┌─────────────────┐
│ ████████████████│  Top: Wall or Exit
│█              █│  Right: Wall or Exit
│█    Arena     █│  Bottom: Wall or Exit
│█              █│  Left: Wall or Exit
│ ████████████████│
└─────────────────┘
```

#### Pentagon/Hexagon/Octagon

```
    /────────\
   /          \     Uniform wall
  /   Arena    \    around entire
  \            /    perimeter shape
   \__________/
```

## Migration from Legacy System

### Old System

```typescript
wall: {
  enabled: true,
  thickness: 1  // Single thickness for all
}
```

### New System (Equivalent)

```typescript
wall: {
  enabled: true,
  wallWidths: {
    uniform: 1  // Explicit uniform width
  },
  thickness: 1  // Kept for backwards compatibility
}
```

### Automatic Migration

- If `wallWidths` not specified, falls back to `thickness`
- If `randomWalls: true`, ignores `wallWidths` and generates random

## Integration with Exits

### Old Exit System

```typescript
exits: [
  { angle: 0, width: 30, enabled: true },
  { angle: 180, width: 30, enabled: true },
];
```

### New Exit System (Wall Width = 0)

```typescript
// Circle: Use exits array (legacy)
exits: [
  { angle: 0, width: 30, enabled: true }
]

// Rectangle: Use wall widths
wall: {
  wallWidths: {
    top: 2,
    right: 0,    // Exit here!
    bottom: 2,
    left: 0      // Exit here!
  }
}
```

### Combined System

- **Circle**: Uses `exits` array for angular exits
- **Rectangle**: Uses `wallWidths` (0 = exit) for edge exits
- Both systems can coexist

## Common Patterns

### Pattern 1: Safe Arena (All Walls)

```typescript
wall: {
  enabled: true,
  wallWidths: { uniform: 2 }
}
```

### Pattern 2: Dangerous Arena (All Exits)

```typescript
wall: {
  enabled: true,
  wallWidths: { uniform: 0 }
}
```

### Pattern 3: Strategic Arena (Mixed)

```typescript
wall: {
  enabled: true,
  wallWidths: {
    top: 2,
    right: 0,   // Exit
    bottom: 2,
    left: 1.5
  }
}
```

### Pattern 4: Chaotic Arena (Random)

```typescript
wall: {
  enabled: true,
  randomWalls: true
}
```

## Testing Checklist

- [ ] Circle arena with uniform wall
- [ ] Circle arena with uniform exit (0 width)
- [ ] Circle arena with angular exits
- [ ] Rectangle arena with all walls
- [ ] Rectangle arena with all exits
- [ ] Rectangle arena with mixed walls/exits
- [ ] Rectangle arena with random walls
- [ ] Pentagon arena with uniform wall
- [ ] Hexagon arena with uniform exit
- [ ] Wall damage and recoil working
- [ ] Spike and spring modifiers working
- [ ] Visual rendering correct (black walls, red exits)

## Future Enhancements

- [ ] Per-edge damage/recoil configuration
- [ ] Animated wall effects (spikes, springs)
- [ ] Curved walls for polygon shapes
- [ ] Wall health/destructibility
- [ ] Dynamic walls (moving, rotating)
- [ ] Portal integration with walls
- [ ] Wall-specific visual themes

## Related Documentation

- [Arena Configuration Reference](./BEYBLADE_ARENA_INTERFACES_COMPLETE.md)
- [Arena Collision System](./ARENA_COLLISION_SYSTEM.md)
- [Arena Water Bodies](./ARENA_WATER_BODIES.md)
