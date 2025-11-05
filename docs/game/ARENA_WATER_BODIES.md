# Arena Water Bodies

## Overview

Water bodies (liquid hazards) can now be rendered in three different types: center, moat, and ring (edge ring). This document covers the configuration, rendering, and usage of all water body types.

## Water Body Types

### 1. Center Type (Original)

A single liquid shape at the arena center.

**Configuration:**

```typescript
{
  type: "center",
  x: 25,           // Center X coordinate
  y: 25,           // Center Y coordinate
  radius: 5,       // Radius of the liquid body
  shape: "circle", // circle, square, triangle, star, hexagon
  liquidType: "water", // water, lava, acid, oil
  rotation: 0      // Rotation angle (optional)
}
```

**Rendering:**

- Single shape at specified position
- Wave circles at 30%, 50%, 70% of radius
- Uses `generateShapePath()` for various shapes

**Use Cases:**

- Central pool
- Decorative pond
- Hazard in arena center

### 2. Moat Type

A ring/moat of liquid around a loop path that **follows the loop's shape** with the **stadium floor visible in the center**.

**Configuration:**

```typescript
{
  type: "moat",
  loopIndex: 0,       // Index of the loop to follow (default: 0)
  innerRadius: 12,    // Inner edge of moat (optional, defaults to loop.radius - 3)
  outerRadius: 18,    // Outer edge of moat (optional, defaults to loop.radius + 3)
  liquidType: "water" // water, lava, acid, oil
}
```

**Rendering:**

- **Automatically follows the loop's shape** (circle, rectangle, star, hexagon, etc.)
- Uses SVG path-based rendering
- Outer shape filled with liquid color
- **Inner shape shows stadium floor** (rgba(255, 255, 255, 0.1)) - not white space
- Result: Concentric shape with visible arena floor in center
- Wave lines at 30%, 50%, 70% of moat width
- **Inherits rotation from the loop**

**Use Cases:**

- Moat around a loop path
- Defensive liquid barrier
- Visual separation of arena zones
- Shape-matched hazards (star-shaped lava moat around star loop)

**Important Notes:**

- `loopIndex` determines which loop to follow (0 = first loop, 1 = second loop, etc.)
- If `innerRadius`/`outerRadius` not specified, automatically uses loop radius ±3em
- Moat shape matches loop shape exactly (pentagon loop = pentagon moat)
- Rotation is inherited from the loop configuration
- **Center shows actual stadium floor, not empty white space**

### 3. Ring Type (Edge Ring)

A ring of liquid at the arena edges that **follows the stadium shape** with the **stadium floor visible in the center**. Ring thickness is automatically **10% of stadium width**.

**Configuration:**

```typescript
{
  type: "ring",
  liquidType: "lava"    // water, lava, acid, oil
  // No ringThickness needed - auto-calculated as 10% of stadium width
}
```

**Rendering:**

- **Automatically follows the arena's shape** (circle, rectangle, hexagon, etc.)
- **Thickness = 10% of arena width** (auto-calculated)
- Calculated from arena dimensions
- Uses path-based rendering (same as moat type)
- **Inner area shows stadium floor** (not white space)
- Wave lines within ring thickness
- **Inherits rotation from arena**

**Use Cases:**

- Arena boundary hazard
- Edge danger zone
- Creates "ring out" effect
- Shape-matched perimeter (rectangular arena = rectangular lava ring)
- Consistent 10% edge hazard zone

**Important Notes:**

- Automatically sized to arena dimensions
- Always at arena edges
- **Ring thickness is always 10% of arena.width**
- For 50em arena: ring thickness = 5em
- For 60em arena: ring thickness = 6em
- Ring shape matches arena shape exactly (hexagon arena = hexagon ring)
- Rotation is inherited from arena configuration
- **Center shows actual stadium floor, not empty white space**

## SVG Rendering Technique

All ring-type water bodies (moat and ring) use this rendering approach with **shape-aware paths**:

```typescript
// 1. Draw outer shape with liquid color
<path
  d={outerPath}  // Generated using loop/arena shape
  fill={color}
  fillOpacity={0.5}
/>

// 2. Draw inner shape with stadium floor color (not white!)
<path
  d={innerPath}  // Generated using loop/arena shape (smaller)
  fill="rgba(255, 255, 255, 0.1)"  // Stadium floor color
  fillOpacity={1}
/>

// 3. Draw wave paths between inner and outer
<path
  d={wavePath}  // Generated at intermediate sizes
  stroke={waveColor}
  strokeWidth="1"
  fill="none"
  opacity={0.6}
/>
```

**Result**: The inner shape shows the stadium floor (same as arena floor), creating a concentric ring with visible playing area.

**Shape Support**:

- Circle → Circular moat/ring with circular floor
- Rectangle → Rectangular moat/ring with rectangular floor
- Pentagon → Pentagon moat/ring with pentagon floor
- Hexagon → Hexagon moat/ring with hexagon floor
- Octagon → Octagon moat/ring with octagon floor
- Star → Star moat/ring with star floor
- Oval → Oval moat/ring with oval floor

## Liquid Types

Available liquid types and their visual properties:

| Liquid Type | Color               | Opacity | Effect                      |
| ----------- | ------------------- | ------- | --------------------------- |
| water       | #4299e1 (blue)      | 0.5     | Splashing, slowing          |
| lava        | #f56565 (red)       | 0.6     | Burning, damage over time   |
| acid        | #48bb78 (green)     | 0.5     | Corrosion, equipment damage |
| oil         | #2d3748 (dark gray) | 0.4     | Slippery, loss of control   |

## Implementation Details

### WaterBodyRenderer Component

**Location**: `src/components/admin/ArenaPreview.tsx`

**Type Handling:**

```typescript
if (config.type === "center") {
  // Render single shape at position
  const shapePath = generateShapePath(/* ... */);
  return (
    <>
      <path d={shapePath} fill={color} opacity={opacity} />
      {/* Wave paths */}
    </>
  );
}

else if (config.type === "moat") {
  // Render moat following loop shape
  const loop = arena.loops[config.loopIndex ?? 0];

  // Generate outer and inner paths using loop.shape
  const outerPath = generateShapePath(loop.shape, /* ... */, outerRadius);
  const innerPath = generateShapePath(loop.shape, /* ... */, innerRadius);

  return (
    <g transform={`rotate(${loop.rotation} ...)`}>
      <path d={outerPath} fill={color} opacity={opacity} />
      {/* Show stadium floor, not white space */}
      <path d={innerPath} fill="rgba(255, 255, 255, 0.1)" opacity={1} />
      {/* Wave paths in moat */}
    </g>
  );
}

else if (config.type === "ring") {
  // Render edge ring following arena shape
  const outerPath = generateShapePath(arena.shape, /* ... */, arenaRadius);
  const innerPath = generateShapePath(arena.shape, /* ... */, arenaRadius - thickness);

  return (
    <g transform={`rotate(${arena.rotation} ...)`}>
      <path d={outerPath} fill={color} opacity={opacity} />
      {/* Show stadium floor, not white space */}
      <path d={innerPath} fill="rgba(255, 255, 255, 0.1)" opacity={1} />
      {/* Wave paths in ring */}
    </g>
  );
}
```

### Wave Animation

All water body types include animated wave circles:

- 3 wave circles per body
- Positioned at 30%, 50%, 70% of width/radius
- Slight opacity (0.6-0.8)
- Thin stroke (0.5-1em)

## Configuration Examples

### Example 1: Central Pool

```typescript
{
  type: "center",
  x: 25,
  y: 25,
  radius: 5,
  shape: "circle",
  liquidType: "water",
  rotation: 0
}
```

Creates a 5em circular pool in the arena center.

### Example 2: Moat Around Loop (Shape-Matched)

```typescript
// Pentagon loop configuration
loops: [
  {
    radius: 15,
    shape: "pentagon",
    rotation: 45,
    speedBoost: 1.2
  }
],

// Water body (moat) - automatically matches pentagon shape
waterBody: {
  type: "moat",
  loopIndex: 0,        // Follow the first loop
  innerRadius: 12,     // 3em before the loop
  outerRadius: 18,     // 3em after the loop
  liquidType: "lava"
}
```

Creates a **pentagon-shaped** lava moat around a pentagon loop, rotated 45°, with the **pentagon stadium floor visible in the center**.

**Shape Inheritance**:

- Moat automatically uses pentagon shape from loop
- Rotation automatically inherited (45°)
- Stadium floor visible in center (not white space)
- No need to specify shape or rotation in water config

### Example 3: Lava Ring at Edges (10% Width)

```typescript
// Rectangle arena (50em wide)
{
  shape: "rectangle",
  width: 50,
  height: 50,
  rotation: 0,

  // Ring water body (auto 5em thick = 10% of 50em)
  waterBody: {
    type: "ring",
    liquidType: "lava"
  }
}
```

Creates a **rectangle-shaped** lava ring at arena edges with the **rectangular stadium floor visible**. Ring is automatically **5em thick (10% of 50em width)**.

**Shape Inheritance**:

- Ring automatically uses rectangle shape from arena
- Dimensions automatically calculated from arena width/height
- **Thickness = 10% of arena.width** (50 \* 0.1 = 5em)
- Rotation automatically inherited (0°)
- Stadium floor visible in center

### Example 4: Complex Arena with Shape-Matched Water

```typescript
{
  // Hexagon arena
  shape: "hexagon",
  width: 50,
  height: 50,
  rotation: 30,

  // Inner star loop with water moat
  loops: [
    {
      radius: 10,
      shape: "star",
      rotation: 0,
      speedBoost: 1.3
    }
  ],

  // Star-shaped moat around star loop
  waterBody: {
    type: "moat",
    loopIndex: 0,
    innerRadius: 8,
    outerRadius: 12,
    liquidType: "water"
  },

  // Note: Multiple water bodies not yet supported
  // Future: Add hexagon-shaped lava ring at edges
}
```

**Result**:

- Hexagon-shaped arena (rotated 30°)
- Star-shaped water moat around star loop (matches loop shape exactly)
- Future enhancement: Support multiple water bodies to add hexagon lava ring

## Interaction with Hazards

Water bodies can have hazards and loops on them:

```typescript
// Generate obstacles that CAN spawn on water
const excludeZones = buildExcludeZones(config, false); // false = allow on water
const obstacles = generateRandomObstacles(count, width, height, excludeZones);
```

**Realistic scenarios:**

- Rocks in water (obstacles on water)
- Pits in lava (pit on liquid)
- Bridge over moat (loop through water)

See [ARENA_COLLISION_SYSTEM.md](./ARENA_COLLISION_SYSTEM.md) for details.

## Testing Checklist

- [ ] Create center-type water body with each shape (circle, square, triangle, etc.)
- [ ] Create moat-type water body with circular loop
- [ ] Create moat-type water body with pentagon loop
- [ ] Create moat-type water body with star loop
- [ ] Create moat-type water body with hexagon loop
- [ ] Verify moat shape matches loop shape exactly
- [ ] Verify stadium floor visible in moat center (not white space)
- [ ] Create ring-type water body with circular arena
- [ ] Create ring-type water body with rectangular arena
- [ ] Create ring-type water body with hexagon arena
- [ ] Verify ring shape matches arena shape exactly
- [ ] Verify stadium floor visible in ring center (not white space)
- [ ] Test each liquid type (water, lava, acid, oil)
- [ ] Verify wave animations appear on all types
- [ ] Test rotation inheritance (moat type from loop, ring type from arena)
- [ ] Test water body with hazards on it
- [ ] Test loop running through water body
- [ ] Verify rendering at different arena scales

## Common Issues & Solutions

### Issue: Moat type not rendering

**Problem**: `loopIndex` points to non-existent loop
**Solution**: Ensure loop exists at specified index:

```typescript
{
  type: "moat",
  loopIndex: 0,  // First loop (must exist in arena.loops array)
}
```

### Issue: Ring type doesn't match arena shape

**Problem**: Using old configuration with x/y coordinates
**Solution**: Remove x/y - ring automatically uses arena shape and dimensions

### Issue: Moat doesn't match loop shape

**Problem**: Loop shape not properly configured
**Solution**: Ensure loop has shape property:

```typescript
loops: [
  {
    radius: 15,
    shape: "pentagon", // Must specify shape
    // ...
  },
];
```

### Issue: White space in center instead of stadium floor

**Problem**: Using old masking technique
**Solution**: The updated code now shows stadium floor (rgba(255, 255, 255, 0.1)) instead of white space. Make sure you're using the latest version.

### Issue: Ring type too thin/thick

**Problem**: Ring thickness not what you expected
**Solution**: Ring thickness is always 10% of arena width:

```typescript
{
  shape: "circle",
  width: 50,  // Ring will be 5em thick (10%)

  waterBody: {
    type: "ring",
    liquidType: "lava"
  }
}
```

To adjust ring thickness, change arena width:

- width: 50em → ring: 5em
- width: 60em → ring: 6em
- width: 40em → ring: 4em

### Issue: Rotation not applied

**Problem**: Trying to set rotation on water body config
**Solution**: Rotation is inherited:

- **Moat type**: Inherits from loop configuration
- **Ring type**: Inherits from arena configuration
- **Center type**: Use `rotation` property in config

### Issue: Water body obscures hazards

**Problem**: Opacity too high
**Solution**: Water bodies use 0.5-0.6 opacity by default, which should allow visibility. If needed, adjust in rendering code.

### Issue: Waves not visible

**Problem**: Wave color too similar to liquid color
**Solution**: Waves use darker shade of liquid color with 0.6-0.8 opacity. This is handled automatically.

## Future Enhancements

- [ ] Multiple water bodies per arena
- [ ] Custom shapes for loop/ring types
- [ ] Animated waves (rotation/movement)
- [ ] Water level variation
- [ ] Splash effects on impact
- [ ] Flow direction for moving liquids
- [ ] Gradient fills for more realistic appearance
- [ ] Particle effects (bubbles, steam, etc.)

## Related Documentation

- [Arena Collision System](./ARENA_COLLISION_SYSTEM.md)
- [Arena Configuration Reference](./BEYBLADE_ARENA_INTERFACES_COMPLETE.md)
- [Arena Preview Component](../../src/components/admin/ArenaPreview.tsx)
