# Beyblade Preview Resolution Fix

## Problem

The beyblade preview was displaying with poor, pixelated quality due to low canvas resolution being scaled up with CSS.

### Root Cause

- Canvas was set to `400x400` pixels
- CSS was stretching it with `w-full` class
- This caused severe pixelation, especially on high-DPI displays
- Similar to displaying a 400x400 image at 800x800 - blurry and pixelated

## Solution

Implemented high-resolution canvas rendering with proper scaling:

### Changes Made

1. **High-Resolution Canvas**

   ```typescript
   const CANVAS_RESOLUTION = 800; // 2x resolution for crisp rendering
   const DISPLAY_SIZE = 400; // Actual display size
   ```

2. **Canvas Element Update**

   ```tsx
   <canvas
     ref={canvasRef}
     width={CANVAS_RESOLUTION} // Internal resolution: 800x800
     height={CANVAS_RESOLUTION}
     style={{
       width: `${DISPLAY_SIZE}px`, // Display size: 400x400
       height: `${DISPLAY_SIZE}px`,
     }}
   />
   ```

3. **Scale Factor for All Drawing**

   ```typescript
   const scaleFactor = canvas.width / DISPLAY_SIZE; // 2x

   // Apply to all rendering:
   ctx.lineWidth = 4 * scaleFactor;
   ctx.font = `bold ${20 * scaleFactor}px Arial`;
   const contactRadius = displayRadius + 5 * scaleFactor;
   ```

4. **Click Coordinate Adjustment**
   ```typescript
   // Account for canvas resolution vs display size
   const scaleX = canvas.width / rect.width;
   const scaleY = canvas.height / rect.height;
   const x = (e.clientX - rect.left) * scaleX - canvas.width / 2;
   const y = (e.clientY - rect.top) * scaleY - canvas.height / 2;
   ```

## Benefits

1. **✅ Crisp, High-Quality Rendering**

   - 2x resolution provides sharp visuals
   - Matches retina/high-DPI display quality
   - No pixelation or blurriness

2. **✅ Accurate Scaling**

   - All elements (lines, fonts, radii) scale properly
   - Consistent proportions at all zoom levels
   - Resolution-independent appearance

3. **✅ Proper Click Handling**

   - Mouse clicks accurately map to canvas coordinates
   - Spike placement works correctly despite resolution difference

4. **✅ Performance**
   - 800x800 is reasonable for modern browsers
   - Smooth animation maintained
   - No noticeable performance impact

## Technical Details

### Before

```tsx
// Low resolution
<canvas width={400} height={400} className="w-full" />
// Result: 400x400 canvas stretched to fill container = blurry
```

### After

```tsx
// High resolution with CSS scaling
<canvas width={800} height={800} style={{ width: "400px", height: "400px" }} />
// Result: 800x800 canvas displayed at 400x400 = crisp
```

### Why This Works

1. **Canvas Internal Resolution**: 800x800 pixels

   - All drawing happens at high resolution
   - More pixels = sharper image

2. **CSS Display Size**: 400x400 pixels

   - Browser downscales the canvas
   - Downscaling looks sharp (unlike upscaling)

3. **Scale Factor**: 2x
   - All drawing coordinates and sizes multiplied by 2
   - Maintains correct proportions

## Example Calculation

For a beyblade with 4cm radius:

```typescript
// 1. Calculate base radius in pixels
const baseRadiusPixels = getBeybladeDisplayRadius(4); // 96px

// 2. Scale to preview canvas
const previewScale = getBeybladePreviewScale(400); // 0.37

// 3. Apply zoom
const zoomedRadius = baseRadiusPixels * previewScale * (zoom / 100);

// 4. Apply canvas scale factor
const displayRadius = zoomedRadius * scaleFactor; // 2x for sharp rendering
```

## Future Improvements

Potential enhancements:

1. Dynamic resolution based on device pixel ratio
2. Configurable quality settings (low/medium/high)
3. SVG rendering for vector graphics (infinite scaling)
4. WebGL for even better performance

## Files Modified

- `src/components/admin/BeybladePreview.tsx`
  - Added `CANVAS_RESOLUTION` and `DISPLAY_SIZE` constants
  - Updated canvas element with proper width/height and style
  - Added `scaleFactor` to all drawing operations
  - Fixed click coordinate calculations

## Testing

Test scenarios:

- ✅ Preview displays clearly without pixelation
- ✅ Zoom in/out maintains quality
- ✅ Spinning animation is smooth
- ✅ Click placement for spikes is accurate
- ✅ Works on different screen sizes
- ✅ High-DPI displays show crisp rendering

---

**Fixed**: November 6, 2025
**Issue**: Low resolution canvas causing pixelation
**Solution**: 2x high-resolution canvas with CSS scaling
