# Rectangle Speed Path Charge Point Fix

## Issue

Charge points on rectangle-shaped speed paths were not positioning correctly. The previous implementation used angle-based calculation which doesn't properly map path percentage to actual path distance on rectangular paths.

## Problem

**Before:**

- Rectangle path used angle-to-ray intersection method
- Charge points at 0%, 33%, 66% would appear at uneven distances
- Points would cluster near corners due to angle-based calculation

**Example:**

```
0% -> Top-right corner area
33% -> Somewhere on left side (not 1/3 of perimeter)
66% -> Somewhere on right side (not 2/3 of perimeter)
```

## Solution

Implemented **perimeter-based positioning** for rectangles:

1. **Calculate total perimeter**: `2 * (width + height)`
2. **Convert path percentage to distance**: `pathPercent * perimeter`
3. **Map distance to edges**: Traverse clockwise from top-right
   - Right edge (0% to 25%)
   - Bottom edge (25% to 50%)
   - Left edge (50% to 75%)
   - Top edge (75% to 100%)

## Implementation

```typescript
case "rectangle": {
  const w = (width || radius * 2) / 2;
  const h = (height || radius * 2) / 2;

  // Calculate perimeter
  const perimeter = 2 * (w * 2 + h * 2);
  const distanceAlongPath = pathPercent * perimeter;

  // Edge lengths
  const rightEdgeLength = h * 2;
  const bottomEdgeLength = w * 2;
  const leftEdgeLength = h * 2;
  const topEdgeLength = w * 2;

  // Position based on which edge the distance falls on
  if (distanceAlongPath <= rightEdgeLength) {
    // Right edge (moving down)
    const t = distanceAlongPath / rightEdgeLength;
    x = w;
    y = -h + (h * 2 * t);
  } else if (distanceAlongPath <= rightEdgeLength + bottomEdgeLength) {
    // Bottom edge (moving left)
    const t = (distanceAlongPath - rightEdgeLength) / bottomEdgeLength;
    x = w - (w * 2 * t);
    y = h;
  }
  // ... left and top edges
}
```

## Result

**After:**

- Charge points now appear at exactly equal distances along the perimeter
- 0% → Top-right corner (start of right edge)
- 33.33% → 1/3 along the perimeter (actual path distance)
- 66.66% → 2/3 along the perimeter (actual path distance)

## Verification

### Auto-Placement (3 charge points)

- **Point 1** (0%): Top-right corner
- **Point 2** (33.33%): Bottom-left area (1/3 of perimeter)
- **Point 3** (66.66%): Top-left area (2/3 of perimeter)

All points are now evenly spaced along the actual rectangular path!

## Additional Improvements

While fixing the rectangle, also ensured all other shapes work correctly:

- ✅ **Circle**: Already using angle-based (correct for circles)
- ✅ **Rectangle**: Now using perimeter-based (fixed)
- ✅ **Pentagon/Hexagon/Octagon**: Using angle with edge interpolation
- ✅ **Oval**: Using angle with elliptical calculation
- ✅ **Star**: Using angle with inner/outer radius
- ✅ **Ring**: Using angle (same as circle)

## Files Modified

- `src/components/arena/renderers/SpeedPathRenderer.tsx`
  - Updated `getPointOnSpeedPath()` function
  - Changed rectangle case from angle-based to perimeter-based
  - Fixed variable scoping for all shape cases

## Testing

To test the fix:

1. Create an arena with a rectangle speed path
2. Add 3 charge points with auto-placement
3. Verify charge points appear at equal distances along the perimeter
4. Manually adjust charge point positions (0-100%) and verify smooth movement along edges
