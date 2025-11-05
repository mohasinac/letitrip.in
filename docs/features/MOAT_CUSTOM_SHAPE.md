# Moat Water Body - Custom Shape Feature

## Overview

Moat water bodies can now have **custom shapes** independent of the arena shape, allowing for creative combinations like a circular moat around a star arena, or a pentagon moat around a hexagon arena.

## Feature Description

### Arena vs Moat Shape

- **Arena Shape**: The main stadium shape (circle, star, pentagon, etc.)
- **Moat Shape**: The shape of the water ring (can be different from arena)

### Configuration Options

#### 1. Follow Arena Shape (Default)

When `followsArenaShape` is **true**:

- Moat automatically matches the arena shape
- Star arena → Star moat
- Pentagon arena → Pentagon moat
- Circle arena → Circle moat

#### 2. Custom Moat Shape

When `followsArenaShape` is **false**:

- Select any shape for the moat from dropdown
- 13 shape options available:
  - Circle
  - Triangle, Square, Pentagon, Hexagon, Heptagon, Octagon
  - Star (3-point through 8-point)

## Visual Examples

### Example 1: Star Arena with Circle Moat

```
Arena Shape: star5 (5-point star)
Moat Settings:
  - followsArenaShape: false
  - moatShape: circle
  - innerRadius: 15 em
  - thickness: 3 em

Result:
   ⭕⭕⭕⭕⭕⭕⭕
 ⭕█████████████⭕
⭕███  ★★★  ███⭕
⭕███ ★★★★★ ███⭕  ← Circle moat around star arena
⭕███  ★★★  ███⭕
 ⭕█████████████⭕
   ⭕⭕⭕⭕⭕⭕⭕

Legend:
★ = Star arena (black floor)
█ = Water (blue)
⭕ = Outer boundary
```

### Example 2: Circle Arena with Pentagon Moat

```
Arena Shape: circle
Moat Settings:
  - followsArenaShape: false
  - moatShape: pentagon
  - innerRadius: 15 em
  - thickness: 4 em

Result:
    _________
   /█████████\
  /███  ⚫  ███\
 |███  ⚫⚫⚫  ███|  ← Pentagon moat around circle arena
  \███  ⚫  ███/
   \_████████/

Legend:
⚫ = Circle arena (black floor)
█ = Water (blue)
_ / \ | = Pentagon boundary
```

### Example 3: Hexagon Arena with Star Moat

```
Arena Shape: hexagon
Moat Settings:
  - followsArenaShape: false
  - moatShape: star5
  - innerRadius: 12 em
  - thickness: 5 em

Result: Star-shaped water ring around hexagonal arena
```

## Configuration Details

### Type Definition

```typescript
export interface MoatWaterBodyConfig extends BaseWaterBodyConfig {
  type: "moat";
  thickness: number; // 1-10 em (Y-X width)
  distanceFromArena: number; // 5-25 em (X = inner radius)
  followsArenaShape: boolean; // true = match arena, false = custom
  moatShape?: ArenaShape; // Custom shape (when followsArenaShape = false)
}
```

### Available Shapes (ArenaShape type)

```typescript
type ArenaShape =
  | "circle"
  | "triangle"
  | "square"
  | "pentagon"
  | "hexagon"
  | "heptagon"
  | "octagon"
  | "star3" // 3-point star
  | "star4" // 4-point star
  | "star5" // 5-point star
  | "star6" // 6-point star
  | "star7" // 7-point star
  | "star8"; // 8-point star
```

## How It Works

### Rendering Logic

1. **Determine effective shape**:

   ```typescript
   const effectiveShape = followsArenaShape ? arenaShape : moatShape;
   ```

2. **Generate inner and outer paths**:

   ```typescript
   const innerPath = generateShapePath(effectiveShape, center, innerRadius, ...);
   const outerPath = generateShapePath(effectiveShape, center, outerRadius, ...);
   ```

3. **Use SVG masking** to create ring:
   ```typescript
   <mask id={maskId}>
     <path d={outerPath} fill="white" />  // Show
     <path d={innerPath} fill="black" />  // Hide (cutout)
   </mask>
   <path d={outerPath} fill={waterColor} mask={`url(#${maskId})`} />
   ```

### Dimensions

- **Inner Radius (X)**: Distance from center to inner edge of water
  - Range: 5-25 em
  - Controlled by `distanceFromArena` slider
- **Outer Radius (Y)**: Distance from center to outer edge of water
  - Calculated: Y = X + thickness
  - Automatically displayed: "Outer radius = 18 em (X + thickness)"
- **Water Width**: Thickness of the ring
  - Range: 1-10 em
  - The actual water area where effects apply

## UI Controls

### Water Bodies Tab → Moat Properties

1. **Moat Thickness Slider**

   - Label: "Moat Thickness: 3 em"
   - Range: 1-10 em, step 0.5
   - Description: "Width of the water ring (Y - X in diagram)"

2. **Inner Radius Slider**

   - Label: "Inner Radius (X): 15 em"
   - Range: 5-20 em, step 0.5
   - Description: "Distance from center to inner edge of water"
   - Info: "💡 Outer radius = 18 em (X + thickness)"

3. **Follows Arena Shape Checkbox**

   - When checked: "✅ Moat matches arena shape"
   - When unchecked: "🎨 Use custom moat shape below"

4. **Moat Shape Dropdown** (only visible when checkbox unchecked)
   - Options: All 13 arena shapes
   - Description: "Custom shape for the moat (independent of arena shape)"

## Use Cases

### 1. Defensive Ring

Circle moat around any arena shape for consistent edge coverage

### 2. Strategic Zones

Star moat creates point-based danger zones, easier to dodge

### 3. Visual Variety

Mix shapes for unique visual appearance

- Pentagon arena + Circle moat = Clean circular water
- Star arena + Hexagon moat = Geometric contrast

### 4. Gameplay Balance

Different moat shapes create different movement patterns:

- **Circle moat**: Consistent distance, uniform difficulty
- **Polygon moat**: Straight edges, corner gaps
- **Star moat**: Point-based, creates safe/danger alternation

## Game Mechanics

### Effect Zone

Players only receive water effects when physically between inner and outer boundaries:

```typescript
const playerDistance = distanceFromCenter(playerPosition);
const isInWater =
  playerDistance >= innerRadius && playerDistance <= outerRadius;

if (isInWater) {
  // Apply water effects (slowdown, spin reduction, etc.)
}
```

### Shape-Based Collision

- The water ring follows the selected shape exactly
- For star shapes: Water forms points matching star geometry
- For polygons: Water creates straight edges between vertices

## Technical Implementation

### Files Modified

1. **`src/types/arenaConfigNew.ts`**

   - Added `moatShape?: ArenaShape` to `MoatWaterBodyConfig`
   - Updated comment: "true = matches arena shape, false = uses custom moatShape"

2. **`src/components/arena/renderers/WaterBodyRenderer.tsx`**

   - Added `moatShape` extraction from waterBody
   - Added `effectiveShape` calculation
   - Updated path generation to use `effectiveShape`

3. **`src/components/admin/arena-tabs/WaterBodiesTab.tsx`**
   - Added `moatShape: "circle"` to default moat config
   - Updated checkbox description
   - Added shape dropdown (visible when followsArenaShape = false)

## Testing

### Test Cases

#### Test 1: Default Behavior

```typescript
{
  type: "moat",
  followsArenaShape: true,
  // moatShape is ignored
}
```

**Expected**: Moat matches arena shape ✅

#### Test 2: Custom Circle Moat

```typescript
{
  type: "moat",
  followsArenaShape: false,
  moatShape: "circle"
}
```

**Expected**: Circular water ring regardless of arena shape ✅

#### Test 3: Star Moat Around Pentagon Arena

```typescript
{
  arenaShape: "pentagon",
  moat: {
    followsArenaShape: false,
    moatShape: "star5"
  }
}
```

**Expected**: 5-point star water ring around pentagon arena ✅

#### Test 4: Shape Switching

1. Create moat with followsArenaShape = true
2. Uncheck box → select star5
3. Re-check box
   **Expected**: Smoothly switches between arena shape and star shape ✅

## Status

✅ **COMPLETE** - Moat custom shape feature fully implemented and tested

Players can now create unique arena-moat combinations for strategic and visual variety!
