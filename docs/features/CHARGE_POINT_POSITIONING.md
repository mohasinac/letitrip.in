# Charge Point Positioning on Loop Paths

## Overview

Charge points are correctly positione## Example Usage

```typescript
// In LoopRenderer component
const pos = getPointOnLoopPath(cp.pathPosition);

// Render charge point at calculated position
<circle
  cx={pos.x}
  cy={pos.y}
  r={cpRadius * 3}
  fill={cpColor}
  opacity={0.8}
  stroke="white"
  strokeWidth="2"
/>;
```

## User Interface

### Slider Control

- **Label**: "Path Position: X.X%"
- **Range**: 0-100%
- **Step**: 1%
- **Visual feedback**: Displays current percentage value
- **Real-time update**: Charge point moves as slider is adjusted

### Other Sliders

- **Dash Speed**: 1-5x (step 0.1)
- **Radius**: 0.5-3em (step 0.1)
- **Number of Points**: 1-3 (for auto-placement)oop path geometry using **path percentage (0-100%)** rather than angles. This ensures that regardless of the loop shape (circle, rectangle, pentagon, hexagon, octagon, oval, star, ring), the charge points follow the exact path of the loop.

## Implementation

### Function: `getPointOnLoopPath(pathPosition: number)`

This function calculates the exact position on a loop path based on the path percentage (0-100%) and the loop's shape. The path position is converted to an angle internally for calculation.

**Path Position to Angle Conversion:**

- 0% = 0° (start of path)
- 25% = 90° (quarter way)
- 50% = 180° (halfway)
- 75% = 270° (three quarters)
- 100% = 360° (full circle, back to start)

### Supported Shapes

#### 1. **Circle**

- Simple circular path
- Uses standard trigonometry: `x = centerX + radius * cos(angle)`, `y = centerY + radius * sin(angle)`

#### 2. **Rectangle**

- Points positioned on the rectangular edges
- Calculates intersection with rectangle based on angle
- Divides into 4 regions based on corner angles
- Each region maps to a specific edge (right, top, left, bottom)

#### 3. **Pentagon, Hexagon, Octagon**

- Points positioned on polygon edges
- Determines which edge the angle falls on
- Calculates two vertices of that edge
- Interpolates between vertices based on angle position within the edge
- Uses bounding box scaling for consistent sizing

#### 4. **Oval**

- Elliptical path with different X and Y radii
- Radius X = full radius
- Radius Y = 0.7 × radius (creates oval shape)
- Uses parametric ellipse equation

#### 5. **Star**

- 5-pointed star with alternating outer and inner points
- Inner radius = 0.5 × outer radius
- Determines if angle falls on outer or inner point
- Uses appropriate radius for calculation

#### 6. **Ring**

- Circular path (same as circle)
- Ring shape is defined by stroke width, not path

## Positioning Logic

### Angle Convention

- **0°** = Right (3 o'clock position)
- **90°** = Bottom (6 o'clock position)
- **180°** = Left (9 o'clock position)
- **270°** = Top (12 o'clock position)

The angle is adjusted by -90° internally to align with SVG coordinate system where 0° points upward.

### Auto-Placement

When auto-placing charge points:

- **1 point**: Placed at 0°
- **2 points**: Placed at 0°, 180°
- **3 points**: Placed at 0°, 120°, 240°

These angles are then transformed to the actual loop path geometry.

## Visual Result

### Before (Incorrect)

- Charge points were always on a circular path
- Did not match non-circular loop shapes
- Pentagon/hexagon/rectangle loops looked misaligned

### After (Correct)

- Charge points follow the exact loop path
- Rectangle points on corners/edges
- Pentagon/hexagon points on vertices/edges
- Perfect alignment with loop geometry

## Example Usage

```typescript
// In LoopRenderer component
const pos = getPointOnLoopPath(cp.angle);

// Render charge point at calculated position
<circle
  cx={pos.x}
  cy={pos.y}
  r={cpRadius * 3}
  fill={cpColor}
  opacity={0.8}
  stroke="white"
  strokeWidth="2"
/>;
```

## Technical Details

### Rectangle Edge Detection

```typescript
const cornerAngle1 = (Math.atan2(h, w) * 180) / Math.PI;
const cornerAngle2 = 180 - cornerAngle1;
const cornerAngle3 = 180 + cornerAngle1;
const cornerAngle4 = 360 - cornerAngle1;
```

These corner angles divide the 360° space into 4 regions, each corresponding to one edge of the rectangle.

### Polygon Edge Interpolation

```typescript
const anglePerSide = 360 / sides;
const sideIndex = Math.floor(((angle + anglePerSide / 2) % 360) / anglePerSide);
const angleInSide = ((angle + anglePerSide / 2) % 360) % anglePerSide;
const t = angleInSide / anglePerSide;
```

This determines which edge the angle falls on and where along that edge to place the point.

### Star Alternation

```typescript
const anglePerPoint = 360 / points;
const isOuter =
  Math.floor(((angle + anglePerPoint / 4) % 360) / (anglePerPoint / 2)) % 2 ===
  0;
const r = isOuter ? radius : innerRadius;
```

Alternates between outer and inner radii based on the angle's position.

## Benefits

1. **Accurate Positioning**: Charge points now precisely follow loop geometry
2. **Consistent Behavior**: Works correctly for all loop shapes
3. **Visual Clarity**: Players can see charge points exactly where they'll trigger
4. **Gameplay Balance**: Fair positioning regardless of loop shape choice

## Files Modified

- `src/components/arena/renderers/LoopRenderer.tsx`
  - Replaced `getPointOnCircle()` with `getPointOnLoopPath()`
  - Added shape-specific positioning logic for all loop types
  - Maintained rotation support via transform group

## Testing Recommendations

Test charge point positioning on:

- ✅ Circle loops - should be evenly distributed around circumference
- ✅ Rectangle loops - should be on edges/corners
- ✅ Pentagon/Hexagon/Octagon loops - should be on vertices and edges
- ✅ Oval loops - should follow elliptical path
- ✅ Star loops - should alternate between outer and inner points
- ✅ Rotated loops - should maintain correct positioning relative to loop
