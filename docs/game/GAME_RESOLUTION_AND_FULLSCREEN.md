# Game Resolution and Fullscreen Guide

## Overview

The game runs at a fixed **720p resolution (1280x720)** with fullscreen support for optimal performance and consistent gameplay experience across different devices.

---

## Resolution Settings

### Fixed 720p Resolution

- **Width:** 1280 pixels
- **Height:** 720 pixels
- **Aspect Ratio:** 16:9
- **Frame Rate:** 60 FPS (target)

### Why 720p?

✅ **Performance:** Lower resolution = better FPS on mid-range devices  
✅ **Consistency:** Same gameplay experience for all players  
✅ **Optimization:** Easier to balance graphics and performance  
✅ **Bandwidth:** Lower resolution = less data for multiplayer sync

---

## Fullscreen Modes

### Windowed Mode (Default)

```
┌─────────────────────────────────────┐
│         Browser Window              │
│  ┌───────────────────────────────┐ │
│  │                               │ │
│  │    Game Area (1280x720)       │ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

- Game displays at 1280x720 in the center of the screen
- Black letterboxing if browser window is larger
- Maintains 16:9 aspect ratio
- UI elements stay within game bounds

### Fullscreen Mode

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│        Game Fills Screen            │
│      (Scales to fit while           │
│     maintaining aspect ratio)       │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

- Game scales to fill the entire screen
- Maintains 16:9 aspect ratio (no stretching)
- Black bars on sides/top if screen isn't 16:9
- Hides browser UI for immersive experience

---

## Fullscreen Controls

### Keyboard Shortcuts

| Key     | Action                            |
| ------- | --------------------------------- |
| **F11** | Toggle fullscreen on/off          |
| **ESC** | Exit fullscreen (browser default) |
| **F3**  | Toggle debug info                 |

### Button Controls

- **Fullscreen Button** (top-right) - Click to toggle
  - Icon: Maximize ⛶ (windowed) / Minimize ⊟ (fullscreen)
  - Shows current state
  - Works on mobile/tablet touch

### Auto-Detection

The game automatically detects fullscreen state changes:

- Monitors `document.fullscreenElement`
- Updates UI when user presses ESC
- Syncs button icon with actual state

---

## Implementation Details

### Canvas Sizing

```typescript
// Fixed game resolution
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

// Canvas always renders at 720p internally
<Canvas
  width={GAME_WIDTH}
  height={GAME_HEIGHT}
  gameState={gameState}
  beyblades={beyblades}
/>;
```

### Container Scaling

```tsx
<div
  style={{
    width: isFullscreen ? "100%" : "1280px",
    height: isFullscreen ? "100%" : "720px",
    aspectRatio: "1280 / 720",
    maxWidth: "100%",
    maxHeight: "100%",
  }}
>
```

**Windowed Mode:**

- Fixed 1280x720 size
- Centered on screen
- Scrolls if browser window is smaller

**Fullscreen Mode:**

- 100% width and height
- CSS `aspect-ratio` maintains 16:9
- Browser handles scaling/letterboxing

---

## Browser Compatibility

### Fullscreen API Support

| Browser      | Support | Notes               |
| ------------ | ------- | ------------------- |
| Chrome 71+   | ✅ Full | Recommended         |
| Firefox 64+  | ✅ Full | Works perfectly     |
| Safari 16.4+ | ✅ Full | iOS/macOS supported |
| Edge 79+     | ✅ Full | Chromium-based      |
| Opera 58+    | ✅ Full | Chromium-based      |

### Fallback Behavior

If fullscreen API is not supported:

- Button shows but may not work
- F11 falls back to browser fullscreen
- Game still playable in windowed mode

---

## Mobile & Tablet Support

### Responsive Behavior

**Small Screens (< 1280px width):**

```
Game scales down to fit screen width
Maintains 16:9 aspect ratio
Touch controls available (future)
```

**Portrait Mode:**

```
Game rotates 90° (future feature)
Or shows "Please rotate device" message
```

**Landscape Mode (Recommended):**

```
Game fills screen width
Black bars on top/bottom if needed
Fullscreen recommended for best experience
```

### Touch Controls (Future)

- Virtual joystick for movement
- Tap buttons for actions
- Pinch to zoom (spectator mode)
- Swipe gestures for special moves

---

## Performance Considerations

### Why Fixed Resolution?

1. **Predictable Performance**

   - Same pixel count for all players
   - No dynamic resolution changes
   - Consistent frame times

2. **Network Sync**

   - All players see same game state
   - No viewport size mismatches
   - Fair competitive play

3. **GPU Optimization**
   - Canvas renders at 720p internally
   - Browser handles upscaling (if needed)
   - GPU acceleration works better

### Performance Targets

| Resolution | Target FPS | Hardware            |
| ---------- | ---------- | ------------------- |
| 720p       | 60 FPS     | Mid-range PC/Laptop |
| 720p       | 60 FPS     | Modern tablets      |
| 720p       | 30-60 FPS  | Older devices       |

---

## User Experience

### Recommended Setup

**For Best Experience:**

1. Use fullscreen mode (F11 or button)
2. Close other browser tabs
3. Disable browser extensions
4. Use wired internet (PvP mode)
5. Enable hardware acceleration in browser

**Display Settings:**

- Native 1080p or higher screen
- 60Hz or higher refresh rate
- 16:9 aspect ratio preferred

### Quality Settings (Future)

Planned quality presets:

- **Low:** Minimal effects, high FPS
- **Medium:** Balanced (default)
- **High:** Max effects, requires powerful GPU
- **Auto:** Adjusts based on FPS

---

## Testing

### Test Fullscreen Functionality

1. **Enter Fullscreen**

   ```
   Click maximize button or press F11
   Verify: Game fills entire screen
   Verify: No browser UI visible
   Verify: Aspect ratio maintained
   ```

2. **Exit Fullscreen**

   ```
   Click minimize button, press F11, or ESC
   Verify: Returns to windowed mode
   Verify: Button icon updates
   Verify: Game stays centered
   ```

3. **Responsive Behavior**

   ```
   Resize browser window smaller than 1280px
   Verify: Game scales down proportionally
   Verify: No horizontal scrolling in fullscreen
   ```

4. **State Persistence**
   ```
   Toggle fullscreen multiple times
   Verify: No visual glitches
   Verify: Canvas re-renders correctly
   Verify: HUD elements stay positioned
   ```

### Debug Checks

Press F3 to see debug info:

```
Resolution: 1280x720
FPS: 60
Fullscreen: true/false
Canvas Size: 1280x720
Container Size: varies
Aspect Ratio: 16:9
```

---

## Common Issues & Solutions

### Issue: Black Bars Appear

**Cause:** Screen aspect ratio isn't 16:9  
**Solution:** This is intentional to prevent stretching

### Issue: Game Looks Blurry in Fullscreen

**Cause:** Browser upscaling from 720p to higher resolution  
**Solution:** Enable "Image Smoothing" or accept slight blur for performance

### Issue: Fullscreen Button Doesn't Work

**Cause:** Browser blocked fullscreen request  
**Solution:** User must interact with page first (click something)

### Issue: Game Clips on Small Screens

**Cause:** Browser window smaller than 1280px  
**Solution:** Game automatically scales down - this is normal

---

## Future Enhancements

### Planned Features

1. **Dynamic Resolution**

   - Auto-adjust based on FPS
   - 480p, 720p, 1080p options
   - Quality presets

2. **Ultra-wide Support**

   - 21:9 aspect ratio
   - Extended field of view
   - Balanced for fairness

3. **VR Mode**

   - WebXR support
   - 3D first-person view
   - Motion controls

4. **HDR Support**
   - Better colors on HDR displays
   - Improved contrast
   - Brighter effects

---

## Code Examples

### Toggle Fullscreen Function

```typescript
const toggleFullscreen = async () => {
  if (!containerRef.current) return;

  try {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      // Exit fullscreen
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  } catch (err) {
    console.error("Error toggling fullscreen:", err);
  }
};
```

### Listen for Fullscreen Changes

```typescript
useEffect(() => {
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  document.addEventListener("fullscreenchange", handleFullscreenChange);
  return () => {
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
  };
}, []);
```

### Keyboard Shortcut Handler

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "F11") {
      e.preventDefault(); // Prevent browser default
      toggleFullscreen();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

---

## Summary

✅ **Fixed 720p resolution** for consistent performance  
✅ **Fullscreen support** via F11 or button  
✅ **Aspect ratio maintained** in all modes  
✅ **Responsive scaling** for smaller screens  
✅ **Smooth transitions** between modes  
✅ **Browser-native** fullscreen API

The 720p + fullscreen setup provides an optimal balance between performance, visual quality, and cross-device compatibility! 🎮
