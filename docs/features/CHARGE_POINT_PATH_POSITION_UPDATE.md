# Charge Point Configuration Changes - Path Position & Sliders

## Summary

Updated the charge point configuration system to use **path position percentage (0-100%)** instead of degrees, and implemented **slider controls** for all numeric values for better user experience.

## Changes Made

### 1. Type Definition Update

**File**: `src/types/arenaConfigNew.ts`

**Changed**:

```typescript
// Before
angle: number; // Angle in degrees (0-360) on the loop

// After
pathPosition: number; // Position on loop path (0-100%)
```

**Rationale**: Path percentage is more intuitive and shape-agnostic than angles. It represents the relative position along any path shape.

### 2. Renderer Update

**File**: `src/components/arena/renderers/LoopRenderer.tsx`

**Key Changes**:

- Function signature: `getPointOnLoopPath(pathPosition: number)` instead of `getPointOnLoopPath(angle: number)`
- Converts path position to angle internally: `const angle = (pathPosition / 100) * 360;`
- Auto-placement now uses path percentages:
  - 1 point: 0%
  - 2 points: 0%, 50%
  - 3 points: 0%, 33.33%, 66.66%
- All calculations remain the same after conversion to angle

### 3. Configurator UI Update

**File**: `src/components/admin/ArenaConfiguratorNew.tsx`

**Slider Controls Added**:

#### Path Position Slider

```tsx
<label>Path Position: {cp.pathPosition?.toFixed(1) || 0}%</label>
<input
  type="range"
  value={cp.pathPosition || 0}
  min={0}
  max={100}
  step={1}
/>
```

- Shows current percentage in label
- Real-time visual feedback
- 1% step for fine control

#### Dash Speed Slider

```tsx
<label>Dash Speed: {cp.dashSpeed || 2}x</label>
<input
  type="range"
  value={cp.dashSpeed || 2}
  min={1}
  max={5}
  step={0.1}
/>
```

- Shows speed multiplier in label
- 0.1x increments for precise control
- Range: 1x to 5x

#### Radius Slider

```tsx
<label>Radius: {cp.radius || 1.5}em</label>
<input
  type="range"
  value={cp.radius || 1.5}
  min={0.5}
  max={3}
  step={0.1}
/>
```

- Shows size in em units
- 0.1em increments
- Range: 0.5em to 3em

**Kept as Dropdowns**:

- Target (center/opponent) - Binary choice
- Button ID (1, 2, 3) - Limited options
- Color - Uses color picker

**Manual Add Charge Point**:

- Updated initial path position: `pathPosition: cpId * 33.33`
- Distributes at 33%, 66%, 99% for sequential additions

## Benefits

### 1. Intuitive Path Position

- **0-100%** is universally understood
- Works consistently across all loop shapes
- No need to think about circular geometry
- "50% along the path" is clearer than "180 degrees"

### 2. Better UX with Sliders

- **Visual feedback**: See value while dragging
- **Continuous adjustment**: Smooth value changes
- **Bounded input**: Can't enter invalid values
- **Touch-friendly**: Works well on tablets/touch screens
- **Accessibility**: Easier than typing numbers

### 3. Consistent Interface

- All numeric values use sliders
- Similar interaction pattern throughout
- Reduces cognitive load
- Professional appearance

## Path Position Mapping

### Conversion Formula

```typescript
angle = (pathPosition / 100) * 360;
```

### Examples

| Path Position | Angle | Visual Position |
| ------------- | ----- | --------------- |
| 0%            | 0°    | Start (right)   |
| 25%           | 90°   | Quarter way     |
| 50%           | 180°  | Halfway (left)  |
| 75%           | 270°  | Three quarters  |
| 100%          | 360°  | Full circle     |

### Shape-Specific Behavior

The path position maps to different visual results depending on loop shape:

- **Circle**: Simple angular position
- **Rectangle**: Proportional distance along edges
- **Pentagon/Hexagon**: Proportional distance along sides
- **Oval**: Elliptical path position
- **Star**: Alternates outer/inner points

## Migration Notes

### Existing Data

If you have existing arenas with charge points using `angle` property:

1. **Automatic conversion** (recommended):

```typescript
if (cp.angle !== undefined && cp.pathPosition === undefined) {
  cp.pathPosition = (cp.angle / 360) * 100;
}
```

2. **Manual conversion**:

- 0° → 0%
- 120° → 33.33%
- 180° → 50%
- 240° → 66.66%
- 360° → 100%

### Code Updates

Search for `cp.angle` and replace with `cp.pathPosition` in:

- Game logic that reads charge point positions
- Database queries/schemas
- API endpoints
- Documentation

## Testing Checklist

- ✅ Path position slider moves charge point correctly
- ✅ Values 0-100% cover full loop path
- ✅ Auto-placement distributes evenly
- ✅ Works on all loop shapes (circle, rectangle, polygon, oval, star)
- ✅ Dash speed slider shows correct multiplier
- ✅ Radius slider changes visual size
- ✅ All sliders show current value in label
- ✅ No TypeScript compilation errors
- ✅ Documentation updated

## UI Screenshots

### Before (Number Inputs)

```
Angle (degrees): [____] (0-360)
Dash Speed: [____] (1-5)
Radius: [____] (0.5-5)
```

### After (Sliders)

```
Path Position: 45.0% [=========>-----------] (0-100)
Dash Speed: 2.5x      [=======>-------------] (1-5)
Radius: 1.8em         [=======>-------------] (0.5-3)
```

## Documentation Updates

Updated files:

- ✅ `docs/features/ARENA_ID_SYSTEM.md`
  - Changed angle to pathPosition
  - Added slider descriptions
  - Updated auto-placement percentages
- ✅ `docs/features/CHARGE_POINT_POSITIONING.md`
  - Explained path position conversion
  - Added slider UI section
  - Updated examples

## Future Enhancements

Potential improvements:

1. **Visual path indicator**: Show path percentage on loop preview
2. **Snap to percentage**: Quick buttons for 0%, 25%, 50%, 75%, 100%
3. **Copy position**: Copy path position from one point to another
4. **Keyboard shortcuts**: Arrow keys for fine adjustment
5. **Path preview**: Animate along path to show position
