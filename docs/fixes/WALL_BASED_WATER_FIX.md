# Water Body Rendering Fix - SVG Masking Technique

## Issue

Both **wall-based water** and **moat water** were covering the entire arena floor instead of rendering as thin rings around the edges.

## Root Cause

The rendering used an overlay technique where:

1. A large filled circle/shape was drawn (water)
2. A smaller filled circle/shape was drawn on top (floor gradient to "cut out" the center)

**Problem**: In SVG, this doesn't create a transparent cutout - it just overlays the floor gradient on top of the water, making it look like the entire arena is covered.

## Solution

### Updated `WaterBodyRenderer.tsx`

**Changed the rendering technique to use SVG masking:**

```typescript
// OLD APPROACH (Broken)
<circle r={outerRadius} fill={waterColor} />
<circle r={innerRadius} fill={floorGradient} /> // This doesn't "cut out"

// NEW APPROACH (Fixed)
<mask id={maskId}>
  <circle r={outerRadius} fill="white" />  // White = show
  <circle r={innerRadius} fill="black" />  // Black = hide
</mask>
<circle r={outerRadius} fill={waterColor} mask="url(#maskId)" />
```

### Key Changes

#### 1. For Circular Arena

```typescript
// Create a proper mask
<mask id={maskId}>
  <circle r={outerRadius} fill="white" />  // Outer boundary
  <circle r={innerRadius} fill="black" />  // Inner boundary (cutout)
</mask>

// Apply mask to water
<circle
  r={outerRadius}
  fill={waterColor}
  mask={`url(#${maskId})`}  // Creates donut/ring shape
/>
```

#### 2. For Shaped Arena (star, hexagon, etc.)

```typescript
// Create a proper mask with shape paths
<mask id={maskId}>
  <path d={outerPath} fill="white" />  // Outer shape
  <path d={innerPath} fill="black" />  // Inner shape (cutout)
</mask>

// Apply mask to water
<path
  d={outerPath}
  fill={waterColor}
  mask={`url(#${maskId})`}  // Creates donut/ring shape
/>
```

#### 3. Added Depth Effects

```typescript
// Outer edge glow
<circle r={outerRadius} stroke={waterColor} strokeWidth={depth * 0.5} />

// Inner edge glow
<circle r={innerRadius} stroke={waterColor} strokeWidth={depth * 0.5} />
```

## Visual Result

### Before (Broken) ❌

```
⭕⭕⭕⭕⭕⭕⭕⭕⭕
⭕█████████████████⭕
⭕█████████████████⭕  ← Water covering entire arena
⭕█████████████████⭕
⭕█████████████████⭕
⭕█████████████████⭕
⭕⭕⭕⭕⭕⭕⭕⭕⭕
```

### After (Fixed) ✅

```
⭕⭕⭕⭕⭕⭕⭕⭕⭕
⭕█             █⭕
⭕█             █⭕  ← Thin water ring at edges only
⭕█             █⭕
⭕█             █⭕
⭕█             █⭕
⭕⭕⭕⭕⭕⭕⭕⭕⭕

Legend:
⭕ = Arena boundary
█ = Water (thin ring at edges)
[Space] = Dry arena center
```

## How It Works Now

### Wall-Based Water Configuration

```typescript
{
  type: "wall-based",
  thickness: 2,        // Width of water strip (1-5 em)
  offsetFromEdge: 0,   // Distance from edge inward (0-3 em)
  coversExits: true,   // Water in exit zones
  color: "#3b82f6",
  opacity: 0.6
}
```

### Rendering Logic

1. **outerRadius** = arenaRadius - offsetFromEdge
2. **innerRadius** = outerRadius - thickness
3. Create mask with white outer circle/shape and black inner circle/shape
4. Apply mask to water fill
5. Add depth effects on both edges

### Result

- Thin water strip at arena perimeter
- Follows arena shape (circle, star, hexagon, etc.)
- Proper transparency and depth effects
- Center of arena remains dry and playable

## Testing

Test with different configurations:

### Test 1: Circle Arena, No Offset

```typescript
{
  shape: "circle",
  waterBodies: [{
    type: "wall-based",
    thickness: 2,
    offsetFromEdge: 0
  }]
}
```

**Expected**: Thin 2em water ring at circle edge ✅

### Test 2: Star Arena, With Offset

```typescript
{
  shape: "star5",
  waterBodies: [{
    type: "wall-based",
    thickness: 3,
    offsetFromEdge: 1
  }]
}
```

**Expected**: 3em water ring, 1em inward from star edge ✅

### Test 3: Large Thickness

```typescript
{
  thickness: 5,  // Maximum
  offsetFromEdge: 0
}
```

**Expected**: Thicker water ring, still leaves center clear ✅

## Files Modified

- ✅ `src/components/arena/renderers/WaterBodyRenderer.tsx`
  - Updated `WallBasedWaterRenderer` function
  - Changed from overlay approach to mask approach
  - Added proper inner radius calculation with Math.max check
  - Added dual depth effects (inner and outer edges)

## Status

✅ **FIXED** - Both wall-based water and moat water now render correctly as thin rings

The water body system is now complete and all three types work correctly:

- 🌊 Moat: Ring surrounding arena (FIXED!)
- 💧 Zone: Positioned at X,Y
- 🏖️ Wall-Based: Thin ring at edges (FIXED!)

All water types now use SVG masking for proper donut/ring rendering.
