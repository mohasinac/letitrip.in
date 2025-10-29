# Viewport-Fixed Joystick Positioning

## Overview

Updated the virtual joystick (DraggableVirtualDPad) to be positioned fixed to the browser viewport bottom, completely independent of the game canvas/arena container.

## Changes Made

### 1. Positioning System Change

**Before:** Canvas-relative positioning

- Used `position: absolute` with container wrapper
- Positioned relative to canvas parent element
- Joystick moved when canvas scrolled

**After:** Viewport-fixed positioning

- Uses `position: fixed` directly on joystick Box
- Positioned relative to browser viewport
- Joystick stays fixed when page scrolls
- Completely independent of canvas position

### 2. Component Structure Simplification

**Removed:**

```tsx
// Old container wrapper (removed)
<Box
  ref={containerRef}
  sx={{
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  }}
>
  {/* Joystick content */}
</Box>
```

**New:**

```tsx
// Direct viewport-fixed positioning
<Box
  ref={dpadRef}
  sx={{
    position: "fixed",
    left: position.x,
    top: position.y < 0 ? "auto" : position.y,
    bottom: position.y < 0 ? Math.abs(position.y) : "auto",
    zIndex: 1000,
    // ...other styles
  }}
>
  {/* Joystick content */}
</Box>
```

### 3. Drag Calculation Updates

**Before:** Container-relative calculations

```tsx
const containerRect = containerRef.current.getBoundingClientRect();
let newX = (clientX - containerRect.left) / scale - dragOffset.x;
const maxX = containerRect.width / scale - dpadSize / scale;
```

**After:** Viewport-relative calculations

```tsx
let newX = clientX / scale - dragOffset.x;
const maxX = window.innerWidth / scale - dpadSize / scale;
```

### 4. Move-to-Bottom Function Update

**Before:** Centered relative to canvas

```tsx
const containerRect = containerRef.current.getBoundingClientRect();
const centerX = (containerRect.width - actualWidth) / 2;
```

**After:** Centered relative to viewport

```tsx
const centerX = (window.innerWidth - actualWidth) / 2 / scale;
```

## Benefits

1. **Consistent Positioning**: Joystick stays at viewport bottom regardless of page scroll
2. **Better UX**: More predictable behavior for mobile users
3. **Simplified Code**: Removed unnecessary container wrapper
4. **Independence**: Joystick positioning completely independent of canvas layout
5. **Accessibility**: Always visible and accessible at bottom of screen

## Technical Details

### Z-Index

- Set to `1000` to ensure joystick appears above game canvas
- High enough to stay on top of most page elements

### Transform Origin

- Still uses `transformOrigin: "bottom left"` for scale operations
- Scale changes grow/shrink from bottom-left corner

### Coordinate System

- Negative Y values position from viewport bottom
- Example: `{ x: 100, y: -16 }` = 100px from left, 16px from bottom

## Usage in EnhancedBeybladeArena

The component can now be used directly without additional wrapper:

```tsx
<DraggableVirtualDPad
  onDirectionChange={handleVirtualDPad}
  onActionButton={handleVirtualAction}
/>
```

The Box wrapper in `EnhancedBeybladeArena.tsx` is now only for hiding on desktop (display: none above md breakpoint), not for positioning constraints.

## Cookie Persistence

Position and scale are still saved to cookies:

- `dpad-position`: Stores { x, y } coordinates
- `dpad-scale`: Stores scale value (0.5 to 2.0)

Default position: `{ x: 16, y: -16 }` (bottom-right with 16px offset)

## Testing Checklist

- ✅ Joystick appears at viewport bottom
- ✅ Dragging works correctly
- ✅ Move-to-bottom button centers in viewport
- ✅ Scale operations work (0.5x to 2.0x)
- ✅ Position persists across page reloads
- ✅ Lock/unlock functionality works
- ✅ Joystick stays fixed when scrolling page
- ✅ Controls still respond correctly

## Future Enhancements

Potential improvements:

1. Add option to position at top/middle of viewport
2. Snap-to-corners functionality
3. Multi-touch drag support for better mobile UX
4. Orientation change handling (landscape/portrait)
5. Safe area insets for notched devices
