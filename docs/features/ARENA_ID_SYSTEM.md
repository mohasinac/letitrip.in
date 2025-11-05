# Arena ID System and Auto-Placement Features

This document describes the ID numbering system and auto-placement features for all arena elements.

## Overview

All arena features now have visible ID numbers for easy identification and reference:

- **Walls**: Each wall segment has a unique ID
- **Exits**: Each exit (gap between walls) has a unique ID
- **Loops**: Each loop has an ID number
- **Charge Points**: Each charge point on a loop has a number (1-3)
- **Portals**: Each portal has a number (1-2)

## Feature Details

### 1. Wall IDs

**Circle Arena:**

- Wall IDs: `W1`, `W2`, `W3`, etc.
- Rendered at the center of each wall segment
- White text with black outline for visibility

**Polygon Arena (Triangle, Square, Pentagon, etc.):**

- Wall IDs: `E1W1`, `E2W1`, `E3W2`, etc.
  - Format: `E{EdgeNumber}W{WallNumber}`
  - Example: `E1W1` = Edge 1, Wall 1
  - Example: `E3W2` = Edge 3, Wall 2
- Rendered at the center of each wall segment

### 2. Exit IDs

**Circle Arena:**

- Exit IDs: `E1`, `E2`, `E3`, etc.
- Rendered at the center of each exit gap
- White text with black outline

**Polygon Arena:**

- Exit IDs: `E1X1`, `E2X1`, `E3X2`, etc.
  - Format: `E{EdgeNumber}X{ExitNumber}`
  - Example: `E1X1` = Edge 1, Exit 1
  - Example: `E3X2` = Edge 3, Exit 2
- Rendered at the center of each exit gap

### 3. Loop IDs

- Loop IDs: `Loop 1`, `Loop 2`, etc.
- Rendered above the loop path
- Automatically assigned based on order (1, 2, 3, ...)
- Color matches the loop color

### 4. Charge Point Numbers

**Auto-Placement Feature:**

- Click "Auto-Place (Max 3)" button to automatically distribute charge points evenly around a loop
- Select 1-3 charge points
- Points are distributed at equal intervals along the path:
  - 1 point: 0%
  - 2 points: 0%, 50%
  - 3 points: 0%, 33.33%, 66.66%

**Display:**

- Each charge point shows its number (1, 2, or 3)
- Rendered as a large colored circle with the number in the center
- Default color: Gold/Yellow (#fbbf24)
- Customizable per charge point

**Properties:**

- ID: 1, 2, or 3
- Path Position: Position on loop path (0-100%) - controlled via slider
- Target: "center" or "opponent" (dash target)
- Dash Speed: Speed multiplier for dash attack (1-5x) - controlled via slider
- Radius: Visual size (0.5-3em) - controlled via slider
- Color: Custom color - controlled via color picker
- Button ID: Gamepad button mapping (1, 2, or 3)

### 5. Portal Numbers

**Auto-Placement Feature:**

- Click "Auto-Place Portal" button to automatically position portals
- Portals are placed at equal distance from center in opposite directions
- Portal 1: 0° (right side)
- Portal 2: 180° (left side)
- Each portal's IN and OUT points are also opposite to each other

**Manual Placement:**

- Click "+ Manual Portal" for custom positioning
- Manually set X/Y coordinates for IN and OUT points

**Display:**

- Portal number (1 or 2) displayed in the center of each portal vortex
- Large white number with colored outline
- Separate IN and OUT labels above each portal point

**Properties:**

- ID: "portal1" or "portal2"
- Portal Number: 1 or 2 (for display)
- In Point: Entry location (x, y)
- Out Point: Exit location (x, y)
- Distance from Center: Auto-placement distance (adjustable)
- Radius: Visual size
- Color: Custom color (default: purple for portal1, pink for portal2)
- Bidirectional: Always true

**Auto-Placement Controls:**

- Distance slider: Adjust how far from center portals are placed
- Maintains opposite positioning (180° apart)
- Switch to manual positioning at any time

## Type Definitions

### WallSegment

```typescript
interface WallSegment {
  id?: string; // Wall ID (e.g., "E1W1" or "W1")
  width: number;
  thickness: number;
  position: number;
}
```

### LoopConfig

```typescript
interface LoopConfig {
  id?: number; // Loop ID (1, 2, 3, ...)
  radius: number;
  shape: string;
  speedBoost: number;
  autoPlaceChargePoints?: boolean; // Enable auto-placement
  chargePointCount?: number; // Number of points (1-3)
  chargePoints?: ChargePointConfig[];
  // ... other properties
}
```

### ChargePointConfig

```typescript
interface ChargePointConfig {
  id?: number; // Charge point number (1, 2, or 3)
  pathPosition: number; // Position on loop path (0-100%)
  target: "center" | "opponent";
  dashSpeed?: number;
  radius?: number;
  color?: string;
  buttonId?: 1 | 2 | 3;
}
```

### PortalConfig

```typescript
interface PortalConfig {
  id: string; // "portal1" or "portal2"
  portalNumber?: number; // Display number (1 or 2)
  inPoint: { x: number; y: number };
  outPoint: { x: number; y: number };
  radius: number;
  autoPlace?: boolean; // Use auto-placement
  distanceFromCenter?: number; // Distance for auto-placement
  color?: string;
  bidirectional?: boolean; // Always true
}
```

## UI Features

### Loop Configuration

1. **Charge Points Section** with two buttons:

   - "Auto-Place (Max 3)": Automatically distribute points evenly along the path
   - "+ Add Charge Point": Manually add individual points (max 3)

2. **Auto-Place Controls** (when enabled):

   - Number selector (1-3)
   - Points distributed at equal path intervals (0%, 33%, 66% or 0%, 50%)
   - Automatically assigns IDs 1-3

3. **Charge Point Editing** (per charge point):
   - **Path Position Slider**: 0-100% along the loop path
   - **Target Dropdown**: Center or Opponent
   - **Dash Speed Slider**: 1-5x speed multiplier
   - **Button ID Dropdown**: Gamepad button (1, 2, or 3)
   - **Radius Slider**: 0.5-3em visual size
   - **Color Picker**: Custom color selection

### Portal Configuration

1. **Portal Header** with two buttons:

   - "Auto-Place Portal": Create portal at opposite side with auto-positioning
   - "+ Manual Portal": Create portal with manual X/Y positioning

2. **Auto-Place Controls** (per portal):

   - Distance from Center slider
   - Maintains opposite positioning (180° apart)
   - Switch to manual positioning button

3. **Info Box**:
   - Explains auto-placement behavior
   - Shows angular positions

## Visual Rendering

### Text Labels

- Font size: 10-18px depending on element
- Font weight: Bold
- Fill: White
- Stroke: Black (width 0.5-2px)
- Text anchor: middle
- Dominant baseline: middle

### Label Positions

- **Walls**: Center of wall segment
- **Exits**: Center of exit gap
- **Loops**: Above loop path (10px offset)
- **Charge Points**: Center of charge point circle
- **Portals**: Center of portal vortex

## Usage Examples

### Creating a Loop with Auto-Placed Charge Points

1. Click "+ Add Loop"
2. Configure loop properties (radius, shape, etc.)
3. In Charge Points section, click "Auto-Place (Max 3)"
4. Select number of charge points (1-3)
5. Charge points automatically distributed evenly
6. Each point numbered 1-3

### Creating Auto-Placed Portals

1. Click "Auto-Place Portal" (first portal)
2. Adjust distance from center if needed
3. Click "Auto-Place Portal" again (second portal)
4. Portals positioned at opposite sides (0° and 180°)
5. Each portal numbered 1-2

### Viewing IDs in Arena Preview

1. Navigate to any arena with configured elements
2. All walls show their IDs (W1, E1W1, etc.)
3. All exits show their IDs (E1, E1X1, etc.)
4. All loops show "Loop 1", "Loop 2", etc.
5. All charge points show numbers 1-3
6. All portals show numbers 1-2

## Benefits

1. **Easy Identification**: Quickly reference specific arena elements
2. **Configuration Aid**: Know which element you're editing
3. **Testing & Debugging**: Identify problematic elements
4. **Documentation**: Reference specific walls/exits in guides
5. **Auto-Placement**: Quick setup with optimal positioning
6. **Consistency**: Equal spacing for competitive fairness

## Implementation Files

- `src/types/arenaConfigNew.ts` - Type definitions with ID fields
- `src/components/admin/ArenaPreviewBasic.tsx` - Rendering with ID labels
- `src/components/arena/renderers/LoopRenderer.tsx` - Loop and charge point rendering
- `src/components/arena/renderers/PortalRenderer.tsx` - Portal number rendering
- `src/components/admin/ArenaConfiguratorNew.tsx` - Auto-placement controls
