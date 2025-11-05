# Arena Collision System

## Overview

The Arena Collision System ensures that all hazards (obstacles, pits, portals, goals, etc.) are properly placed without overlapping each other, loops, or other arena features. It uses a centralized collision detection approach with type discrimination for different zone types.

## Key Concepts

### Zone Types

The system distinguishes between two types of collision zones:

1. **"line" type**: Used for loops (circular paths)

   - Checks if an object is ON the path itself
   - Uses distance FROM the circular path: `|distance_to_center - path_radius| < threshold`
   - Buffer: 2em from the path line

2. **"zone" type**: Used for filled areas (water bodies, other hazards)
   - Checks if an object overlaps the filled area
   - Uses distance TO the center point: `distance_to_center < radius + buffer`
   - Buffer: 1-3em depending on hazard type

## Core Function: `buildExcludeZones`

Located in: `src/types/arenaConfig.ts`

### Signature

```typescript
export function buildExcludeZones(
  config: Partial<ArenaConfig>,
  includeWaterAsZone: boolean = true
): { x: number; y: number; radius: number; type?: "zone" | "line" }[];
```

### Parameters

- `config`: The arena configuration containing all hazards
- `includeWaterAsZone`: Whether to exclude water bodies (default: true)
  - `true`: Hazards cannot spawn on water
  - `false`: Hazards can spawn on water surfaces

### Returns

Array of exclude zones with:

- `x`, `y`: Center coordinates
- `radius`: Zone radius (with buffer added)
- `type`: "line" or "zone" (optional)

### What It Includes

1. **Loops** (type: "line")

   - All configured loops
   - Buffer: +1em to radius

2. **Water Bodies** (type: "zone", conditional)

   - Included if `includeWaterAsZone = true`
   - Handles all three types: center, loop, ring
   - Buffer: +1em to radius

3. **Obstacles** (type: "zone")

   - All existing obstacles
   - Buffer: +1em

4. **Pits** (type: "zone")

   - All existing pits
   - Buffer: +1em

5. **Portals** (type: "zone")

   - Both entry and exit points
   - Buffer: +1em

6. **Goal Objects** (type: "zone")
   - All goal object positions
   - Buffer: +1em

## Collision Detection Logic

### For Line Types (Loops)

```typescript
const dist = Math.sqrt((x - zone.x) ** 2 + (y - zone.y) ** 2);
const distanceFromLine = Math.abs(dist - zone.radius);
if (distanceFromLine < 2) {
  // Object is ON the loop path - collision detected
}
```

**Effect**: Objects can be inside or outside the loop, just not ON the path itself.

### For Zone Types (Water, Hazards)

```typescript
const dist = Math.sqrt((x - zone.x) ** 2 + (y - zone.y) ** 2);
if (dist < zone.radius + buffer) {
  // Object overlaps the zone - collision detected
}
```

**Effect**: Objects cannot overlap with the zone at all.

## Usage Examples

### Example 1: Generate Obstacles (Allow on Water)

```typescript
const excludeZones = buildExcludeZones(config, false); // false = allow on water
const obstacles = generateRandomObstacles(count, width, height, excludeZones);
```

**Result**: Obstacles avoid loops, other hazards, but CAN spawn on water surfaces.

### Example 2: Generate Pits (Avoid Everything)

```typescript
const excludeZones = buildExcludeZones(config, true); // true = avoid water
const pits = generateRandomPits(
  count,
  radius,
  placement,
  pitRadius,
  excludeZones
);
```

**Result**: Pits avoid loops, water bodies, and all other hazards.

### Example 3: Custom Collision Checking

```typescript
const excludeZones = buildExcludeZones(config, true);

// Check if a position is valid
function isPositionValid(x: number, y: number, objectRadius: number): boolean {
  for (const zone of excludeZones) {
    const dist = Math.sqrt((x - zone.x) ** 2 + (y - zone.y) ** 2);

    if (zone.type === "line") {
      // Check distance FROM the circular path
      const distanceFromLine = Math.abs(dist - zone.radius);
      if (distanceFromLine < objectRadius + 2) {
        return false; // Too close to loop path
      }
    } else {
      // Check distance TO the center point
      if (dist < zone.radius + objectRadius + 3) {
        return false; // Overlaps with zone
      }
    }
  }
  return true;
}
```

## Modified Functions

### `generateRandomObstacles`

- **Location**: `src/types/arenaConfig.ts`
- **Changes**:
  - Updated `excludeZones` parameter to include optional `type`
  - Added type-specific collision checking
  - Line type: checks if obstacle is ON the loop path (2em buffer)
  - Zone type: checks if obstacle overlaps zone (3em buffer)

### `generateRandomPits`

- **Location**: `src/types/arenaConfig.ts`
- **Changes**:
  - Added `excludeZones` parameter (was missing entirely)
  - Added 50-attempt collision checking loop
  - Checks against all exclude zones (supports line/zone types)
  - Checks against previously generated pits (pit-to-pit collision)
  - Random variation in placement angles/distances

### `handleGenerateObstacles` & `handleGeneratePits`

- **Location**: `src/components/admin/ArenaConfigurator.tsx`
- **Changes**:
  - Replaced manual exclude zone building with `buildExcludeZones()` call
  - Reduced code from ~30 lines to ~1 line per handler
  - Both use `includeWaterAsZone: false` to allow hazards on water

## Water Body Configuration

Water bodies can now have hazards and loops on them by passing `includeWaterAsZone: false` to `buildExcludeZones()`.

### Why This Works

- Water bodies are decorative environmental features
- Having hazards on water is realistic (rocks in water, pits in lava, etc.)
- Loops can run through water (bridge over moat)

### When to Exclude Water

Pass `includeWaterAsZone: true` when:

- Generating hazards that shouldn't be on liquid (e.g., spawn zones, exits)
- Creating features that need solid ground
- Implementing game-specific rules

## Testing Checklist

- [ ] Generate obstacles with loops present (should avoid loop paths)
- [ ] Generate obstacles with water present (should spawn on water)
- [ ] Generate pits with existing obstacles (should avoid obstacles)
- [ ] Generate multiple hazard types together (no overlaps)
- [ ] Create complex arena with loops + water + all hazards
- [ ] Verify loop paths remain clear
- [ ] Verify hazard-to-hazard spacing

## Buffer Distances

| Zone Type       | Buffer Distance | Reason                      |
| --------------- | --------------- | --------------------------- |
| Loop (line)     | 2em             | Minimum clearance from path |
| Water (zone)    | 1em             | Visual separation           |
| Obstacle (zone) | 1em             | Movement space              |
| Pit (zone)      | 1em             | Safety margin               |
| Portal (zone)   | 1em             | Interaction space           |
| Goal (zone)     | 1em             | Collection space            |
| Pit-to-Pit      | 2em             | Extra spacing for pits      |
| Obstacle Buffer | 3em             | Placement spacing           |

## Common Patterns

### Arena Initialization

```typescript
// 1. Set up basic arena
const config: ArenaConfig = {
  width: 50,
  height: 50,
  // ... other settings
};

// 2. Add loops
config.loops = [{ x: 25, y: 25, radius: 15 }];

// 3. Add water
config.waterBody = {
  type: "center",
  x: 25,
  y: 25,
  radius: 5,
  liquidType: "water",
};

// 4. Generate obstacles (can be on water)
const excludeZones = buildExcludeZones(config, false);
config.obstacles = generateRandomObstacles(10, 50, 50, excludeZones);

// 5. Generate pits (avoid all)
config.pits = generateRandomPits(
  5,
  config.width / 2,
  "ring",
  2,
  buildExcludeZones(config, false) // Updated config with obstacles
);
```

### Order Matters

Always generate hazards in this order:

1. Loops (permanent features)
2. Water bodies (permanent features)
3. Obstacles
4. Pits (should avoid obstacles)
5. Portals (should avoid pits)
6. Goals (should avoid everything)

Rebuild exclude zones after each step to include newly generated hazards.

## Future Enhancements

- [ ] Add collision avoidance for laser guns
- [ ] Add collision avoidance for rotation bodies
- [ ] Support for non-circular collision shapes
- [ ] Configurable buffer distances per hazard type
- [ ] Visualization of collision zones in preview
- [ ] Performance optimization for large numbers of hazards

## Related Documentation

- [Arena Configuration Reference](./BEYBLADE_ARENA_INTERFACES_COMPLETE.md)
- [Water Body Rendering](./ARENA_WATER_BODIES.md)
- [Loop Configuration](../guides/NAVIGATION_CONSTANTS.md)
