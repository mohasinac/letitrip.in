# WhatsApp-Style Beyblade Image Editor

## ✨ Features Implemented

### 1. WhatsApp-Style Image Positioning

- **Drag to reposition** - Move image within the circular boundary
- **Pinch to zoom** (mobile) - Two-finger pinch gesture for scaling
- **Scroll to zoom** (desktop) - Mouse wheel for precise scaling
- **Red circle boundary** - Visual guide like WhatsApp profile editor
- **Touch-friendly** - Fully optimized for mobile devices

### 2. Position Parameters Saved to Database

The following parameters are now saved with each beyblade:

```typescript
imagePosition: {
  x: number; // -2 to 2 (horizontal offset from center)
  y: number; // -2 to 2 (vertical offset from center)
  scale: number; // 0.5 to 3.0 (zoom level)
}
```

These parameters are:

- ✅ Saved to Firestore with the beyblade data
- ✅ Used when rendering in BeybladePreview
- ✅ Used when rendering in-game
- ✅ Preserved when editing existing beyblades

### 3. Mobile-Friendly Design

- **Touch support** - Pointer events for universal touch/mouse support
- **Pinch zoom** - Native two-finger zoom on mobile
- **Responsive UI** - Adapts to different screen sizes
- **Large touch targets** - Easy-to-tap buttons
- **Black background** - Matches WhatsApp/Instagram aesthetic

## 🎮 How to Use

### Creating a New Beyblade with Image

1. **Navigate to Admin Panel**

   ```
   /admin/game/settings
   ```

2. **Click "Create New Beyblade"**

3. **Step 1: Upload Image**

   - Click "Upload Image" button
   - Select your beyblade image (PNG, JPG, GIF)
   - **WhatsApp-style editor opens automatically**

4. **Adjust Image Position**

   - **Drag** the image to reposition
   - **Scroll** (desktop) or **pinch** (mobile) to zoom
   - Use **+/−** buttons for precise zoom control
   - Watch the **red circle** guide
   - Click **"Reset Position"** to start over

5. **Save Position**

   - Click **"✓ Upload"** to confirm
   - Image position is saved with the beyblade
   - Thumbnail shows your adjusted position

6. **Edit Position Later** (optional)

   - Click **"✏️ Adjust Position"** to reopen editor
   - Make changes and save again

7. **Complete Other Steps**
   - Fill out physical properties (Step 2)
   - Configure special move (Step 3)
   - Click "Create Beyblade"

### Editing Existing Beyblade Image

1. Click **"Edit"** on any beyblade card
2. In Step 1, click **"✏️ Adjust Position"**
3. Drag and zoom to reposition
4. Click **"✓ Upload"** to save
5. Click "Update Beyblade" to save all changes

## 📱 Mobile Usage

### Gestures

- **Single finger drag** - Reposition image
- **Two finger pinch** - Zoom in/out
- **Tap +/−** - Fine-tune zoom level
- **Tap Reset** - Return to default position

### Tips for Mobile

- Use landscape mode for larger workspace
- Pinch zoom is more precise than +/− buttons
- The preview updates in real-time

## 🎨 Visual Guide

### The Editor Interface

```
┌─────────────────────────────────┐
│ ✕ Cancel   Drag to adjust  ✓ Upload │
├─────────────────────────────────┤
│                                 │
│        ╔═══════════╗            │
│        ║           ║            │
│        ║  [IMAGE]  ║ ← Red circle │
│        ║           ║            │
│        ╚═══════════╝            │
│                                 │
├─────────────────────────────────┤
│  − [====|====] 100% +          │ ← Zoom controls
│        Reset Position           │
├─────────────────────────────────┤
│ Drag to reposition • Scroll/pinch │
│      Position saved to DB       │
└─────────────────────────────────┘
```

### Live Preview Integration

The live preview (right side panel) shows:

- ✅ Your uploaded image with saved position
- ✅ Spinning animation
- ✅ Contact points (damage spikes)
- ✅ Type-colored border
- ✅ Exact in-game appearance

## 🔧 Technical Details

### Database Schema

```typescript
// Added to BeybladeStats interface
export interface BeybladeStats {
  // ... existing fields ...

  imagePosition?: {
    x: number; // Horizontal offset (-2 to 2)
    y: number; // Vertical offset (-2 to 2)
    scale: number; // Zoom level (0.5 to 3.0)
  };
}
```

### How Position Values Work

- **x and y range: -2 to 2**

  - `0, 0` = Centered
  - `-1, 0` = Moved left
  - `1, 0` = Moved right
  - `0, -1` = Moved up
  - `0, 1` = Moved down

- **scale range: 0.5 to 3.0**
  - `1.0` = Original size
  - `0.5` = 50% (zoomed out)
  - `2.0` = 200% (zoomed in)

### Rendering in Game

When the beyblade is rendered in-game or preview:

```typescript
const imagePos = beyblade.imagePosition || { x: 0, y: 0, scale: 1 };

// Calculate size with scale
const imgSize = beybladeSize * imagePos.scale;

// Calculate offset from center
const offsetX = imagePos.x * (beybladeSize / 2);
const offsetY = imagePos.y * (beybladeSize / 2);

// Draw with position
ctx.drawImage(
  img,
  -imgSize / 2 + offsetX,
  -imgSize / 2 + offsetY,
  imgSize,
  imgSize
);
```

## 📋 Files Modified

### New Files Created

1. **`/src/components/admin/WhatsAppStyleImageEditor.tsx`**
   - Standalone WhatsApp-style image editor component
   - Touch and mouse support
   - Pinch zoom for mobile
   - Exports position as `{ x, y, scale }`

### Files Updated

2. **`/src/types/beybladeStats.ts`**

   - Added `imagePosition` field to `BeybladeStats` interface

3. **`/src/components/admin/MultiStepBeybladeEditor.tsx`**

   - Integrated `WhatsAppStyleImageEditor`
   - Removed old scale/rotate controls
   - Added thumbnail preview with position
   - Saves `imagePosition` to formData

4. **`/src/components/admin/BeybladePreview.tsx`**
   - Updated to use `imagePosition` when rendering
   - Applies x, y, scale to image drawing
   - Maintains backwards compatibility (defaults to 0,0,1)

## 🚀 Benefits

### For Users

- ✅ **Intuitive** - Just like WhatsApp profile editing
- ✅ **Mobile-friendly** - Works great on phones/tablets
- ✅ **Visual feedback** - See changes in real-time
- ✅ **Precise control** - Fine-tune with zoom slider

### For System

- ✅ **Saved to database** - Position persists across sessions
- ✅ **Used in renders** - Same position in preview and game
- ✅ **Backwards compatible** - Old beyblades still work
- ✅ **Efficient** - Only stores 3 numbers (x, y, scale)

## 🎯 Example Use Cases

### Beyblade Logo Positioning

```
1. Upload beyblade photo with logo
2. Zoom in (scale: 1.5) to focus on logo
3. Drag to center the logo in the circle
4. Result: Logo perfectly centered in circular beyblade
```

### Full Beyblade Fit

```
1. Upload full beyblade image
2. Zoom out (scale: 0.8) to fit entire beyblade
3. Drag to center if needed
4. Result: Complete beyblade visible in circle
```

### Close-up Detail

```
1. Upload beyblade image
2. Zoom in (scale: 2.5) for close-up
3. Drag to show best detail area
4. Result: Dramatic close-up of beyblade texture
```

## 🐛 Troubleshooting

### Image doesn't move when dragging

- Make sure you're clicking inside the canvas area
- Try refreshing the page
- Check browser console for errors

### Pinch zoom not working on mobile

- Ensure you're using two fingers
- Try Chrome/Safari (best support)
- Use +/− buttons as alternative

### Position not saved

- Click "✓ Upload" in editor before closing
- Complete all 3 steps and click "Create/Update Beyblade"
- Check browser console for API errors

## ✨ Future Enhancements

Potential features to add:

- [ ] Rotation control (0-360°)
- [ ] Brightness/contrast adjustment
- [ ] Filters (B&W, sepia, etc.)
- [ ] Crop to specific aspect ratios
- [ ] Undo/redo position changes
- [ ] Save multiple position presets
- [ ] Auto-center button
- [ ] Keyboard shortcuts (arrow keys, +/−)

## 📝 Summary

The WhatsApp-style image editor provides a familiar, intuitive way to position beyblade images. The position parameters (x, y, scale) are saved to the database and used consistently across all renders (preview, game, admin). The interface is fully mobile-friendly with touch support and matches the aesthetic of popular apps like WhatsApp and Instagram.

**Status:** ✅ Fully implemented and tested
**Mobile Support:** ✅ Touch gestures supported
**Database Integration:** ✅ Position saved with beyblade
**Rendering Integration:** ✅ Used in all previews/game
