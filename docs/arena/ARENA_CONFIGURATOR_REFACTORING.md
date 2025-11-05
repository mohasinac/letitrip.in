# Arena Configurator Refactoring

## Overview

The `ArenaConfiguratorNew.tsx` component was too large (2300+ lines). We've split it into smaller, maintainable components organized in the `arena-tabs/` directory.

## New Structure

```
src/components/admin/
├── ArenaConfiguratorNew.tsx          (Main component - orchestrates tabs)
└── arena-tabs/
    ├── BasicsTab.tsx                 (Arena info, shape, theme, rotation)
    └── WaterBodiesTab.tsx            (Water bodies configuration)
```

## Components Created

### 1. BasicsTab.tsx

**Purpose**: Configure basic arena properties

- Arena name and description
- Arena dimensions (width, height)
- Shape selection (circle, square, hexagon, octagon, triangle, pentagon, star5, star6)
- Theme selection (metrocity, forest, safari, mountains, prehistoric)
- Auto-rotation settings (speed, direction)
- Preset loading

### 2. WaterBodiesTab.tsx

**Purpose**: Configure water bodies (max 3 per arena)

#### Three Types of Water Bodies:

##### 1. **Moat Water Body** 🌊

- Surrounds the arena in its shape
- Properties:
  - `thickness`: Width of the moat (1-10 em)
  - `distanceFromArena`: Gap between arena edge and moat (0-5 em)
  - `followsArenaShape`:
    - `true` = Star arena gets star moat
    - `false` = Always circular moat
- **Use Case**: Create a water barrier around the entire arena that matches its shape

##### 2. **Zone Water Body** 💧

- Positioned water with custom shape inside arena
- Properties:
  - `position`: X, Y coordinates (relative to center)
  - `shape`: circle, square, rectangle, or oval
  - `radius`: For circles (1-20 em)
  - `width/height`: For squares/rectangles/ovals (2-30 em)
  - `rotation`: Rotation angle (0-360°)
- **Use Case**: Place water hazards at specific locations (e.g., square water body at center)

##### 3. **Wall-Based Water Body** 🏖️

- Water at the edges of arena, in front of walls and exits
- Properties:
  - `thickness`: Width of water strip (1-5 em)
  - `offsetFromEdge`: Distance from arena edge inward (0-3 em)
  - `coversExits`: Whether water also covers exit zones
- **Use Case**: Create water along the arena perimeter, following its shape

#### Common Properties (All Water Types):

- `color`: Water color (color picker)
- `opacity`: Water transparency (0.1-1.0)
- `depth`: Visual depth effect (0-10)
- `wavyEffect`: Animated wavy effect (checkbox)

## Implementation Details

### Water Body Configuration Flow:

1. User clicks "+ Add Moat", "+ Add Zone", or "+ Add Wall-Based"
2. Water body is created with default values
3. User adjusts properties using sliders and inputs
4. Changes are immediately reflected in the live preview
5. Maximum 3 water bodies allowed per arena

### Key Features:

- **Slider-based controls** for all numeric adjustments
- **Visual color pickers** for water color
- **Real-time preview** in the side panel
- **Type-specific settings** shown only for relevant water body type
- **Clear visual indicators** with color-coded borders (blue for moat, cyan for zone, teal for wall-based)

## Usage Example

```typescript
// Moat around star arena (follows star shape)
{
  id: "water1",
  type: "moat",
  thickness: 3,
  distanceFromArena: 0,
  followsArenaShape: true,  // Star moat for star arena
  color: "#3b82f6",
  opacity: 0.6,
  depth: 5
}

// Square water zone at center
{
  id: "water2",
  type: "zone",
  position: { x: 0, y: 0 },
  shape: "square",
  width: 10,
  height: 10,
  rotation: 45,  // Rotated 45 degrees
  color: "#06b6d4",
  opacity: 0.7,
  depth: 6
}

// Water at arena edges (follows circle shape)
{
  id: "water3",
  type: "wall-based",
  thickness: 2,
  offsetFromEdge: 0,
  coversExits: true,
  color: "#14b8a6",
  opacity: 0.5,
  depth: 4
}
```

## Benefits of Refactoring

1. **Maintainability**: Each tab is now in its own file (~500 lines max)
2. **Reusability**: Tab components can be reused or modified independently
3. **Testability**: Easier to write unit tests for individual components
4. **Collaboration**: Multiple developers can work on different tabs simultaneously
5. **Performance**: Smaller component trees, easier for React to optimize

## Next Steps

### Recommended Additional Splits:

- `WallsTab.tsx` - Wall configuration (currently in main file)
- `SpeedPathsTab.tsx` - Speed paths/loops configuration
- `PortalsTab.tsx` - Portal configuration
- `PreviewTab.tsx` - Full preview panel

### Future Enhancements:

- Add water body templates (preset configurations)
- Add water animation controls
- Add water physics settings (drag, turbulence)
- Add water hazard effects (slowing beyblades, damage over time)

## Files Modified

1. ✅ Created `arena-tabs/BasicsTab.tsx`
2. ✅ Created `arena-tabs/WaterBodiesTab.tsx`
3. ✅ Modified `ArenaConfiguratorNew.tsx` to use new tab components
4. ✅ All TypeScript errors resolved
5. ✅ All components properly typed with ArenaConfig interfaces

## Testing Checklist

- [ ] Test all water body types can be added/removed
- [ ] Test maximum 3 water bodies limit
- [ ] Test moat with `followsArenaShape` true/false
- [ ] Test zone water body positioning and shapes
- [ ] Test wall-based water with `coversExits` true/false
- [ ] Test all sliders and color pickers
- [ ] Test live preview updates
- [ ] Test save/cancel functionality
- [ ] Test loading existing arenas with water bodies
- [ ] Test preset loading
