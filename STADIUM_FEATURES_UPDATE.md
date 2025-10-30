# Stadium Configuration Features - Complete Update

## Overview

This document details all the new stadium/arena configuration features implemented in the admin panel.

## Table of Contents

1. [Exit Configuration](#exit-configuration)
2. [Portal System](#portal-system)
3. [Loop Charge Points](#loop-charge-points)
4. [Water Body Enhancements](#water-body-enhancements)
5. [Obstacle Placement Rules](#obstacle-placement-rules)
6. [Goal Objects (Collectibles)](#goal-objects-collectibles)
7. [Theme-Based Icons](#theme-based-icons)

---

## 1. Exit Configuration

### Wall Configuration Options

- **Enable Walls**: Toggle arena boundaries on/off
- **All Exits Mode**: When walls are disabled
  - `allExits: true` → Entire boundary is an exit zone
  - `allExits: false` → Closed boundary with no exits
- **Exits Between Walls**: Create automatic exit gaps between wall segments
  - Works with `wallCount` to determine exit placement
  - Shape-based exit distribution (pentagon = 5 exits, hexagon = 6 exits, etc.)

### Shape-Based Wall & Exit Determination

```typescript
interface WallConfig {
  enabled: boolean;
  allExits?: boolean; // Only when walls disabled
  wallCount?: number; // Number of wall segments (3-20)
  exitsBetweenWalls?: boolean; // Auto-create exits between segments
  // ...other properties
}
```

### Implementation Logic

- **Circle/Oval**: Exits evenly distributed around circumference
- **Polygon Shapes**: Exits placed at vertices or midpoints
- **Racetrack**: Exits at straight sections
- **Custom**: Based on `wallCount` setting

---

## 2. Portal System (Whirlpools)

### Configuration

- **Maximum**: 2 portals per arena
- **Visual Style**: Animated whirlpools with spiral vortex effect
- **Bidirectional**: Can travel both ways (toggle option)
- **Cooldown**: Configurable delay between uses (0-10 seconds)

### Portal Properties

```typescript
interface PortalConfig {
  id: string; // 'portal1' or 'portal2'
  inPoint: { x: number; y: number }; // Entry position (em units)
  outPoint: { x: number; y: number }; // Exit position (em units)
  radius: number; // Visual size (1-5em)
  cooldown?: number; // Seconds before reuse (default: 0)
  color?: string; // Visual color (default: purple/cyan)
  bidirectional?: boolean; // Two-way travel (default: true)
}
```

### Visual Design

- **Whirlpool Effect**: Multi-layered spiral animation
- **Entry Portal**: Clockwise rotating vortex with inward spiral
- **Exit Portal**: Counter-clockwise rotating vortex
- **Center Vortex**: Dark center representing the portal core
- **Particle Effects**: Swirling particles around the whirlpool edges
- **Flow Line**: Animated dashed line connecting entry to exit

### UI Controls

- Entry Point X/Y coordinates
- Exit Point X/Y coordinates
- Portal radius (whirlpool size)
- Cooldown timer
- Color picker (whirlpool color theme)
- Bidirectional checkbox

---

## 3. Loop Charge Points

### Features

- **Count**: 0-12 charge points per loop
- **Distribution**: Evenly spaced around loop path
- **Automatic Angles**: Calculated as `(360° / count) * index`
- **Interactive Dash**: Players press gamepad button (1, 2, or 3) to dash out of loop early

### Charge Point Properties

```typescript
interface ChargePointConfig {
  angle: number; // Position on loop (0-360°)
  target: "center" | "opponent"; // Dash towards center or opponent (fallback to center)
  dashSpeed?: number; // Speed multiplier during dash (default: 2.0)
  radius?: number; // Visual size (default 1em)
  color?: string; // Visual color (default: gold #fbbf24)
  buttonId?: 1 | 2 | 3; // Gamepad button to trigger (1, 2, or 3)
}

interface LoopConfig {
  // ...existing properties
  chargePoints?: ChargePointConfig[];
  chargePointCount?: number; // Convenience property for even distribution
  minLoopDuration?: number; // Minimum time in loop (2-5 seconds, default: 2)
  maxLoopDuration?: number; // Maximum time before forced exit (2-5 seconds, default: 5)
  renderStyle?: "outline" | "filled"; // Render as outline or filled (default: outline)
}
```

### UI Controls

- **Number of Charge Points**: Input (0-12)
- **Dash Target**: Center or Opponent (dropdown)
- **Dash Speed**: Multiplier for dash speed (1-5x)
- **Min Loop Duration**: Minimum time beyblade stays in loop (2-5s)
- **Max Loop Duration**: Maximum time before forced exit (2-5s)
- **Automatic Button Assignment**: Cycles through buttons 1, 2, 3

### Gameplay Mechanics

1. **Loop Entry**: Beyblade enters loop and travels along path
2. **Min Duration**: Must stay for at least `minLoopDuration` seconds
3. **Charge Point Trigger**: When passing a charge point, player can press assigned button
4. **Dash Action**: Beyblade dashes out toward target at `dashSpeed` multiplier
5. **Auto Exit**: If `maxLoopDuration` reached, forced exit from loop
6. **Target Selection**:
   - `center`: Dash toward arena center
   - `opponent`: Dash toward opponent position (fallback to center if no opponent)

### Example

```typescript
// 3 charge points at 0°, 120°, 240° with buttons 1, 2, 3
loop.chargePointCount = 3;
loop.minLoopDuration = 2; // Must stay 2 seconds minimum
loop.maxLoopDuration = 5; // Auto-exit after 5 seconds
// Generates:
// [
//   {angle: 0, target: 'center', dashSpeed: 2.0, buttonId: 1},
//   {angle: 120, target: 'center', dashSpeed: 2.0, buttonId: 2},
//   {angle: 240, target: 'center', dashSpeed: 2.0, buttonId: 3}
// ]
```

### Rendering

- **Loop Path**: Rendered as outline circle/shape (not filled)
- **Charge Points**: Small glowing circles at specified angles
- **Button Indicators**: Display button number (1, 2, or 3) near charge point
- **Active State**: Charge point glows when beyblade is in range

---

## 4. Water Body Enhancements

### Type Options

#### Center (Existing)

- Positioned at arena center
- Configurable shape and size
- All standard shapes supported

#### Loop (NEW - Moat Structure)

- Follows the center loop path as a water moat
- Always uses center position (loopIndex = 0)
- **New Properties**:
  - `loopIndex`: Always 0 (center loop)
  - `innerRadius`: Inner edge of moat (5-30em)
  - `outerRadius`: Outer edge of moat (5-35em)
  - `shape`: Shape of the moat (matches loop shape)

**Note**: Loop moat always follows the center position, not other loops.

#### Ring (Enhanced)

- Water at stadium edges
- `ringThickness`: Width of ring band (1-10em)
- Positioned at outer boundary
- Full 360° coverage or segmented

### Water Body Configuration

```typescript
interface WaterBodyConfig {
  enabled: boolean;
  type: "center" | "loop" | "ring";
  shape:
    | "circle"
    | "rectangle"
    | "pentagon"
    | "hexagon"
    | "octagon"
    | "star"
    | "oval"
    | "ring";

  // Type: center
  radius?: number;
  width?: number;
  height?: number;
  rotation?: number;

  // Type: loop (NEW)
  loopIndex?: number; // Always 0 for center loop
  innerRadius?: number;
  outerRadius?: number;

  // Type/Shape: ring
  ringThickness?: number;

  // Liquid properties
  liquidType: "water" | "blood" | "lava" | "acid" | "oil" | "ice";
  spinDrainRate: number;
  speedMultiplier: number;
  viscosity: number;
  color?: string;
  waveAnimation?: boolean;
}
```

### Loop Moat UI Example

```
Position Type: Loop
↓
ℹ️ Loop moat always follows center position
Inner Radius: 12em (inner edge)
Outer Radius: 18em (outer edge)
Shape: [Matches arena center]
Liquid Type: Water / Lava / etc.
```

---

## 5. Obstacle Placement Rules

### New Placement Logic

```typescript
interface ObstacleConfig {
  // ...existing properties
  canBeOnLoopPath?: boolean; // Default: false
  canBeInsideLoop?: boolean; // Default: true
  themeIcon?: string; // Theme-based visual
}
```

### Placement Rules

1. **Loop Path Line (Critical)**:

   - Obstacles **cannot** be placed ON the loop path line itself (unless `canBeOnLoopPath: true`)
   - The "loop path line" is where beyblades travel during looping
   - Prevents beyblades from hitting obstacles while looping
   - Default: `canBeOnLoopPath: false`

2. **Inside Loop Area (Allowed)**:

   - Obstacles **CAN** be placed inside the loop boundary area (default behavior)
   - "Inside" means within the enclosed space of the loop, but NOT on the path line
   - Creates strategic interior obstacles
   - Default: `canBeInsideLoop: true`
   - Example: Circle loop with radius 20em can have obstacles at center (0,0) or anywhere inside, just not on the circle line at radius 20em

3. **Outside Loops**:

   - Obstacles can be placed anywhere outside loop areas
   - No restrictions from loops

4. **Other Bodies**:
   - Can overlap with water bodies (creates islands)
   - Can be near pits
   - Can be anywhere not restricted by loop path lines

### Generation Algorithm Update

```typescript
function generateRandomObstacles(
  count: number,
  arenaWidth: number,
  arenaHeight: number,
  excludeZones: Zone[],
  loops: LoopConfig[]
): ObstacleConfig[] {
  // 1. Generate random position
  // 2. Check if position is ON a loop path line → reject if canBeOnLoopPath = false
  //    (Check distance from loop center to obstacle center ≈ loop radius)
  // 3. Check if position is INSIDE loop area → accept if canBeInsideLoop = true
  //    (Position inside loop but not on path line is allowed)
  // 4. Check other exclude zones (water bodies, etc.)
  // 5. Place obstacle if all checks pass
}

// Example collision detection
function isOnLoopPath(
  obstaclePos: { x: number; y: number },
  obstacleRadius: number,
  loop: LoopConfig
): boolean {
  const distanceFromCenter = Math.sqrt(
    Math.pow(obstaclePos.x - loop.center.x, 2) +
      Math.pow(obstaclePos.y - loop.center.y, 2)
  );
  const pathLineThreshold = 2; // em (safety margin)

  // Check if obstacle overlaps with loop path line
  return (
    Math.abs(distanceFromCenter - loop.radius) <
    obstacleRadius + pathLineThreshold
  );
}
```

---

## 6. Goal Objects (Collectibles)

### Updated Types

```typescript
interface GoalObjectConfig {
  id: string;
  x: number;
  y: number;
  radius: number;
  health: number;
  scoreValue: number;

  // NEW: Collectible types
  type: "star" | "crystal" | "coin" | "gem" | "relic" | "trophy";
  themeVariant?: string; // e.g., 'forest-star', 'futuristic-crystal'

  color?: string;
  shieldHealth?: number;

  // NEW: Collection behavior
  isCollectible?: boolean; // true = collect on touch, false = must destroy
}
```

### Theme-Based Goal Objects

| Theme           | Star         | Crystal         | Coin           | Gem           |
| --------------- | ------------ | --------------- | -------------- | ------------- |
| **Forest**      | 🌟 Leaf Star | 🟢 Emerald      | 🍂 Acorn       | 💚 Jade       |
| **Futuristic**  | ⭐ Neon Star | 🔷 Data Crystal | 💿 Credit Chip | 💎 Diamond    |
| **Desert**      | ✨ Sand Star | 🟡 Amber        | 🪙 Gold Coin   | 🧡 Topaz      |
| **Sea**         | 🌊 Wave Star | 🔵 Sapphire     | 🐚 Pearl       | 💙 Aquamarine |
| **Prehistoric** | 🦴 Bone Star | 🟤 Fossil       | 🥚 Egg         | 🟫 Amber      |
| **Metrocity**   | 💫 Neon Star | 🏙️ Tech Crystal | 💳 Token       | 💠 Silicon    |

### Behavior Modes

1. **Collectible Mode** (`isCollectible: true`):

   - Collected instantly on touch
   - No destruction required
   - Adds to score immediately
   - Visual: Glowing, spinning animation

2. **Destructible Mode** (`isCollectible: false`):
   - Must be hit/destroyed to collect
   - Uses health points
   - Optional shield mechanic
   - Visual: Solid, stationary object

---

## 7. Theme-Based Icons

### Obstacle Icons

```typescript
interface ObstacleConfig {
  type: "rock" | "pillar" | "barrier" | "wall";
  themeIcon?: string; // Theme-specific visual
}
```

### Theme Icon Mapping

| Theme           | Rock            | Pillar          | Barrier        | Wall         |
| --------------- | --------------- | --------------- | -------------- | ------------ |
| **Forest**      | 🪨 Boulder      | 🌳 Tree         | 🪵 Log Wall    | 🌿 Hedge     |
| **Futuristic**  | 🔷 Energy Block | 🏢 Tech Pillar  | ⚡ Force Field | 🛡️ Barrier   |
| **Desert**      | 🏜️ Rock         | 🗿 Stone Pillar | 🪨 Sand Wall   | 🧱 Adobe     |
| **Sea**         | 🪸 Coral         | 🐚 Shell Pillar | 🌊 Water Wall  | 🦈 Barrier   |
| **Prehistoric** | 🦴 Fossil       | 🗿 Totem        | 🦕 Bone Wall   | 🪨 Cave Wall |
| **Mountains**   | ⛰️ Boulder      | 🏔️ Peak         | 🪨 Rock Wall   | 🧗 Cliff     |
| **Safari**      | 🪨 Rock         | 🌴 Palm         | 🪵 Fence       | 🌿 Bush      |
| **Metrocity**   | 🏗️ Concrete     | 🏢 Building     | 🚧 Barrier     | 🛣️ Wall      |
| **Grasslands**  | 🪨 Stone        | 🌾 Hay Bale     | 🪵 Fence       | 🌿 Hedge     |
| **Riverbank**   | 🪨 River Rock   | 🪵 Log          | 🌊 Reed Wall   | 🪨 Stone     |

### Implementation

- **CSS Classes**: Theme-specific styling
- **SVG Icons**: Scalable vector graphics per theme
- **Dynamic Loading**: Load theme assets on demand
- **Fallback**: Generic icons if theme assets unavailable

---

## Implementation Summary

### Type Definitions (`src/types/arenaConfig.ts`)

✅ Added `ChargePointConfig` interface
✅ Updated `LoopConfig` with charge points
✅ Added `PortalConfig` interface
✅ Updated `WallConfig` with exit options
✅ Updated `ObstacleConfig` with placement rules
✅ Updated `WaterBodyConfig` with loop moat properties
✅ Updated `GoalObjectConfig` with collectible types
✅ Added `portals` to `ArenaConfig`

### Component Updates (`src/components/admin/ArenaConfigurator.tsx`)

✅ Wall exit configuration UI
✅ Portal system UI (max 2)
✅ Loop charge points UI
✅ Water body loop moat UI
✅ Theme-based icon selection (ready for implementation)

### Next Steps (Rendering)

- [ ] Implement portal rendering in game engine
- [ ] Add charge point visuals on loops
- [ ] Render loop moat water bodies
- [ ] Apply theme-based obstacle icons
- [ ] Implement collectible goal object behavior
- [ ] Add exit zone visual indicators
- [ ] Test all placement rules

---

## Configuration Examples

### Example 1: Portal Arena

```typescript
{
  name: "Portal Arena",
  shape: "hexagon",
  wall: { enabled: true, exitsBetweenWalls: true, wallCount: 6 },
  portals: [
    {
      id: "portal1",
      inPoint: { x: -15, y: 0 },
      outPoint: { x: 15, y: 0 },
      radius: 2,
      cooldown: 2,
      color: "#8b5cf6",
      bidirectional: true
    }
  ]
}
```

### Example 2: Moat Arena

```typescript
{
  name: "Moat Arena",
  loops: [
    { radius: 18, shape: "circle", speedBoost: 1.2, chargePointCount: 4 }
  ],
  waterBody: {
    enabled: true,
    type: "loop",
    loopIndex: 0,
    innerRadius: 15,
    outerRadius: 21,
    liquidType: "water",
    shape: "circle"
  }
}
```

### Example 3: Collectible Arena

```typescript
{
  name: "Star Collector",
  theme: "futuristic",
  goalObjects: [
    {
      id: "star1",
      type: "star",
      x: 10, y: 10,
      radius: 1.5,
      scoreValue: 100,
      themeVariant: "futuristic-star",
      isCollectible: true
    }
  ]
}
```

---

## Testing Checklist

### Exit System

- [ ] Walls disabled, allExits true → entire boundary is exit
- [ ] Walls disabled, allExits false → closed boundary
- [ ] Walls enabled, exitsBetweenWalls → gaps between segments
- [ ] Different shapes have appropriate exit counts

### Portals

- [ ] Can add up to 2 portals
- [ ] Bidirectional travel works
- [ ] Cooldown prevents immediate reuse
- [ ] Custom positioning (X/Y coordinates)
- [ ] Visual appearance matches configuration

### Loop Charge Points

- [ ] Even distribution around loop path
- [ ] Recharge rate applies correctly
- [ ] Different shapes (circle, hexagon, etc.)
- [ ] Multiple charge points per loop

### Water Body Moats

- [ ] Loop type follows selected loop
- [ ] Inner/outer radius creates moat effect
- [ ] Shape matches loop shape
- [ ] Liquid properties apply within moat area

### Obstacle Placement

- [ ] Cannot place on loop paths (default)
- [ ] Can place inside loop areas
- [ ] No restrictions outside loops
- [ ] Theme icons display correctly

### Goal Objects

- [ ] Stars display with theme variant
- [ ] Collectible mode = instant collection
- [ ] Destructible mode = requires hits
- [ ] Score updates correctly

---

## API Integration Points

### Frontend (Admin)

- ArenaConfigurator component
- ArenaPreview component (rendering)
- Type definitions and validation

### Backend (Firestore)

- Arena document schema updated
- Migration for existing arenas
- Validation rules in firestore.rules

### Game Engine

- Portal teleportation logic
- Charge point collision detection
- Loop moat rendering
- Exit zone detection
- Theme-based asset loading

---

## Performance Considerations

### Charge Points

- Limit to 12 per loop (max 120 for 10 loops)
- Simple circle collision detection
- Minimal performance impact

### Portals

- Max 2 per arena (minimal overhead)
- Cooldown prevents spam
- Simple position-based teleportation

### Water Moats

- Render as compound shapes (inner + outer circles)
- Same performance as ring water bodies
- Alpha blending for depth effect

### Theme Icons

- Lazy load theme assets
- Cache loaded icons
- Fallback to generic icons
- SVG preferred for scaling

---

## Version History

- **v1.0**: Initial implementation
  - Exit configuration
  - Portal system
  - Loop charge points
  - Water body moats
  - Obstacle placement rules
  - Theme-based goals and obstacles
