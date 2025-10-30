# Contact Points / Spikes Editor Improvements

## Overview

Enhanced the Beyblade contact points editor with better precision controls and UX improvements for placing and editing contact points.

## Changes Made

### 1. **Reset Rotation to 0 When Placing Contact Points** ✅

**File**: `src/components/admin/BeybladePreview.tsx`

- When entering click mode (placing contact points), the Beyblade rotation is now reset to 0
- This ensures accurate placement of spikes as the visual matches the actual angle coordinates
- Spinning is also paused automatically for precision placement

**Impact**:

- Users can now place contact points accurately without worrying about rotation offset
- The angle shown (0° = top, 90° = right, 180° = bottom, 270° = left) matches the visual orientation

### 2. **Manual Angle Input** ✅

**File**: `src/components/admin/BeybladeImageUploader.tsx`

Added manual input fields for precise angle entry:

- Number input field (0-360°) next to the angle slider
- Allows direct entry of exact angles for precision placement
- Validates input to ensure it stays within 0-360 range
- Works in conjunction with the visual slider

**Usage**:

- Click on a contact point to select it
- Type the exact angle in the input field (e.g., "45" for 45°)
- Or use the slider for visual adjustment

### 3. **Manual Damage Multiplier Input** ✅

Added manual input for damage multiplier:

- Number input field (1.0x - 2.0x) with 0.01 step precision
- Shows both multiplier and damage points in real-time
- Validates input to stay within budget constraints

### 4. **Manual Width Input** ✅

Added manual input for spike width:

- Number input field (10° - 90°) for arc width
- Allows precise control over contact zone size
- Works alongside the visual slider

### 5. **Evenly Distribute Points** ✅

**File**: `src/components/admin/BeybladeImageUploader.tsx`

Added new function and button to evenly distribute contact points:

- **"⚖️ Distribute" button** automatically spaces all contact points equally around the beyblade
- Calculates even distribution: 360° / number of points
- Preserves damage multipliers and widths
- Perfect for creating balanced beyblades (defense type) or symmetrical attack patterns

**Usage**:

1. Add contact points (click or place manually)
2. Click the **"⚖️ Distribute"** button
3. All points are instantly redistributed evenly around the circle

**Example**:

- 3 points → 0°, 120°, 240° (triangle pattern)
- 4 points → 0°, 90°, 180°, 270° (square pattern)
- 6 points → 0°, 60°, 120°, 180°, 240°, 300° (hexagon pattern)

## UI Improvements

### Contact Points Editor Header

```
Contact Points (Spikes) - X points
[⚖️ Distribute] [+ Add Point]
```

### Point Property Inputs

Each contact point now shows:

```
Angle:     [45] °
           [====o=====] slider

Damage:    [1.50] x (50 pts)
           [====o=====] slider

Width:     [30] °
           [====o=====] slider
```

## Benefits

### 1. **Precision Placement**

- No more guessing angles due to rotation
- Direct angle input for exact positioning
- Perfect for recreating specific beyblade designs

### 2. **Symmetry & Balance**

- One-click even distribution for balanced designs
- Great for defense-type beyblades with circular patterns
- Creates professional-looking attack patterns

### 3. **Workflow Efficiency**

- Faster to type "45" than drag a slider
- Can copy angle values between beyblades
- Manual inputs work great for mathematical patterns

### 4. **Better UX**

- Clear visual feedback (rotation at 0 when placing)
- Multiple input methods (click, slider, or type)
- No confusion about angle orientation

## Recommended Workflow

### For Attack-Type Beyblades (Sharp Blades)

1. Add 3-4 contact points by clicking on blade edges
2. Manually adjust angles for exact blade positions (e.g., 0°, 120°, 240°)
3. Set high damage multipliers (1.8x - 2.0x)
4. Use narrow widths (15° - 25°)

### For Defense-Type Beyblades (Circular Defense)

1. Click **"+ Add Point"** multiple times (6-8 points)
2. Click **"⚖️ Distribute"** for perfect even spacing
3. Click **"⚖️ Auto Balance"** for equal damage distribution
4. Use wide widths (40° - 60°)

### For Balanced-Type Beyblades (Mixed Pattern)

1. Add 5-6 contact points
2. Manually set specific angles for attack zones (e.g., 0°, 144°, 288°)
3. Use **"⚖️ Distribute"** then manually adjust a few points
4. Mix damage multipliers (some high, some low)

## Technical Details

### Rotation Reset

```typescript
useEffect(() => {
  if (clickMode) {
    setIsSpinning(false);
    rotationRef.current = 0; // Reset rotation to 0 for accurate clicks
  }
}, [clickMode]);
```

### Even Distribution Algorithm

```typescript
const evenlyDistributePoints = () => {
  if (pointsOfContact.length === 0) return;

  const angleStep = 360 / pointsOfContact.length;
  const newPoints = pointsOfContact.map((point, index) => ({
    ...point,
    angle: Math.round(angleStep * index),
  }));

  setPointsOfContact(newPoints);
  onPointsOfContactUpdated?.(newPoints);
};
```

### Manual Input Validation

```typescript
// Angle validation (0-360°)
onChange={(e) => {
  const value = Number(e.target.value);
  if (value >= 0 && value <= 360) {
    updateSelectedPoint("angle", value);
  }
}}

// Damage validation (1.0x - 2.0x)
onChange={(e) => {
  const value = Number(e.target.value);
  if (value >= 1.0 && value <= 2.0) {
    updateSelectedPoint("damageMultiplier", value);
  }
}}

// Width validation (10° - 90°)
onChange={(e) => {
  const value = Number(e.target.value);
  if (value >= 10 && value <= 90) {
    updateSelectedPoint("width", value);
  }
}}
```

## Files Modified

1. **`src/components/admin/BeybladePreview.tsx`**

   - Reset rotation to 0 when entering click mode
   - Ensures accurate visual feedback during spike placement

2. **`src/components/admin/BeybladeImageUploader.tsx`**
   - Added `evenlyDistributePoints()` function
   - Added manual input fields for angle, damage, and width
   - Added "⚖️ Distribute" button in UI
   - Enhanced point editor with dual input methods (slider + number)

## Testing Checklist

- [x] Rotation resets to 0 when placing contact points
- [x] Manual angle input accepts values 0-360
- [x] Manual damage input accepts values 1.0-2.0
- [x] Manual width input accepts values 10-90
- [x] Even distribution button spaces points correctly
- [x] 3 points → 0°, 120°, 240°
- [x] 4 points → 0°, 90°, 180°, 270°
- [x] 6 points → 0°, 60°, 120°, 180°, 240°, 300°
- [x] Sliders and inputs stay in sync
- [x] Contact points update in real-time on canvas
- [x] Preview shows correct angle orientations
- [x] No TypeScript errors

## Future Enhancements

- [ ] Preset patterns (triangle, square, pentagon, hexagon)
- [ ] Copy/paste contact point configurations
- [ ] Mirror/flip points horizontally or vertically
- [ ] Rotate all points by X degrees
- [ ] Template library for common beyblade types
- [ ] Visual angle guides on canvas (0°, 90°, 180°, 270° markers)

## Related Documentation

- `BEYBLADE_POINTS_OF_CONTACT_EDITOR.md` - Original implementation guide
- `BEYBLADE_PREVIEW_ENHANCEMENTS.md` - Auto-pause spinning feature
- `BEYBLADE_FIX_QUICK_REF.md` - Contact points visualization

---

**Status**: ✅ Complete
**Date**: October 30, 2025
**Impact**: High - Significantly improves contact point placement accuracy and workflow efficiency
