# Beyblade Image Upload System

## Overview

Professional image upload system for Beyblades with automatic background removal, resizing, and circular cropping - similar to LinkedIn/Facebook profile picture uploads.

## Features

### ✅ Multi-Format Support

- **PNG** - Full transparency support
- **JPG/JPEG** - Automatic background removal
- **SVG** - Vector graphics with optimization
- **WebP** - Modern format with compression

### ✅ Image Processing Pipeline

```
Upload File → Validate → Process → Preview → Upload to Firebase
     ↓            ↓          ↓         ↓            ↓
   10MB max    Format    Remove     Circular     300x300
                check    Background  Preview      PNG
```

### ✅ Processing Options

1. **Background Removal** (PNG/JPG only)

   - Automatic corner-sampling detection
   - Adjustable tolerance (5-50)
   - Smart edge detection

2. **Fit Modes**

   - **Contain**: Fit entire image inside circle (recommended)
   - **Cover**: Fill entire circle, crop edges

3. **Output**
   - 300x300 pixels
   - Transparent background
   - PNG format
   - Optimized for web

## User Interface

### Step 1: Select Image

```
┌─────────────────────────────────────┐
│                                     │
│         [Current Image]             │
│       (or placeholder)              │
│                                     │
├─────────────────────────────────────┤
│    [Upload Image / Change Image]    │
├─────────────────────────────────────┤
│ Upload 300x300 (PNG, JPG, SVG, WebP)│
│         Max file size: 10MB         │
└─────────────────────────────────────┘
```

### Step 2: Edit & Process

```
┌─────────────────────────────────────┐
│                                     │
│         [Image Preview]             │
│          (256x256)                  │
│                                     │
├─────────────────────────────────────┤
│ Image Options:                      │
│ ☑ Remove Background                 │
│   Tolerance: [====●====] 10         │
│                                     │
│ Fit Mode:                           │
│ ⦿ Contain    ○ Cover                │
├─────────────────────────────────────┤
│   [Cancel]    [Process Image]       │
└─────────────────────────────────────┘
```

### Step 3: Preview & Upload

```
┌─────────────────────────────────────┐
│                                     │
│      [Circular Preview]             │
│         (300x300)                   │
│   Preview (as it will appear)       │
│                                     │
├─────────────────────────────────────┤
│ [Start Over] [Edit] [Upload ✓]     │
└─────────────────────────────────────┘
```

## Technical Implementation

### Image Processing Functions

#### 1. Background Removal (`removeBackground`)

```typescript
await removeBackground(file, tolerance);
```

- Samples corner pixels for background color
- Calculates color distance using Euclidean formula
- Makes similar pixels transparent
- Adjustable tolerance for fine-tuning

#### 2. Resize Image (`resizeImage`)

```typescript
await resizeImage(file, 300, "contain");
```

- Maintains aspect ratio
- Centers image in canvas
- Supports contain/cover modes
- Outputs transparent PNG

#### 3. SVG Processing (`processSVG`)

```typescript
await processSVG(file, 300);
```

- Optimizes SVG code
- Removes background rectangles/paths
- Sets proper viewBox
- Maintains vector quality

### Canvas Rendering

#### Basic Rendering

```typescript
import { drawBeyblade } from "@/app/game/utils/beybladeRenderer";

drawBeyblade(ctx, beyblade, stats, showDebug);
```

#### With Effects

```typescript
import { drawBeybladeComplete } from "@/app/game/utils/beybladeRenderer";

drawBeybladeComplete(ctx, beyblade, stats, {
  showShadow: true,
  showTrail: true,
  showGlow: beyblade.ultimateAttackActive,
  glowColor: "#FF00FF",
  glowIntensity: 1.5,
});
```

## Usage Examples

### In Admin Panel

```tsx
import BeybladeImageUploader from "@/components/admin/BeybladeImageUploader";

<BeybladeImageUploader
  currentImageUrl={beyblade.imageUrl}
  beybladeId={beyblade.id}
  onImageUploaded={(url) => {
    // Update Beyblade with new image URL
    console.log("Image uploaded:", url);
  }}
/>;
```

### In Game Canvas

```tsx
import {
  preloadBeybladeImages,
  drawBeybladeComplete,
} from "@/app/game/utils/beybladeRenderer";
import { getBeybladeStats } from "@/constants/beybladeStatsData";

// Preload on game start
useEffect(() => {
  const stats = beyblades.map((b) => getBeybladeStats(b.name)).filter(Boolean);
  preloadBeybladeImages(stats);
}, []);

// Render in game loop
const renderBeyblade = (ctx: CanvasRenderingContext2D) => {
  gameState.beyblades.forEach((beyblade) => {
    const stats = getBeybladeStats(beyblade.name);

    drawBeybladeComplete(ctx, beyblade, stats, {
      showShadow: true,
      showTrail: true,
      showGlow: beyblade.ultimateAttackActive,
      glowColor: beyblade.ultimateAttackActive ? "#FF00FF" : "#FFA500",
    });
  });
};
```

## File Structure

```
/src
  /lib
    /utils
      imageProcessing.ts           # Core image processing utilities
  /components
    /admin
      BeybladeImageUploader.tsx    # Upload component
  /app
    /game
      /utils
        beybladeRenderer.ts        # Canvas rendering
    /api
      /beyblades
        /upload-image
          route.ts                 # Upload API endpoint
```

## API Endpoint

### POST `/api/beyblades/upload-image`

**Request:**

```typescript
FormData {
  file: File,              // Image file
  beybladeId: string       // Beyblade ID
}
```

**Response:**

```typescript
{
  success: true,
  imageUrl: string,        // Firebase Storage URL
  metadata: {
    url: string,
    filepath: string,
    filename: string,
    size: number,
    type: string,
    bucket: string,
    createdAt: string,
    uploadedBy: string
  }
}
```

## Firebase Storage Structure

```
/storage
  /beyblades
    beyblade-dragoon-gt-1730332800000.png
    beyblade-meteo-1730332815000.png
    beyblade-valkyrie-1730332830000.png
    ...
```

## Best Practices

### Image Preparation Tips

1. **Use High-Quality Source Images**

   - Minimum 300x300 pixels
   - PNG with transparency preferred
   - Clear, centered subject

2. **Background Removal**

   - Solid color backgrounds work best
   - Start with tolerance = 10
   - Increase if background remains
   - Decrease if image parts removed

3. **Fit Mode Selection**
   - **Contain**: Best for full visibility
   - **Cover**: Best for circular badges

### Performance Optimization

1. **Preload Images**

```typescript
// Load all images before game starts
await preloadBeybladeImages(allBeybladeStats);
```

2. **Use Image Cache**

```typescript
// Images are automatically cached after first load
// No need to reload on every render
```

3. **Clear Cache When Done**

```typescript
// Clear cache when switching games
clearImageCache();
```

## Fallback System

If image fails to load or doesn't exist:

```typescript
// Automatic fallback to gradient circle with letter
drawBeyblade(ctx, beyblade, stats);
// Shows:
// - Type-colored gradient (red=attack, blue=defense, etc.)
// - First letter of Beyblade name
// - White border
```

## Image Specifications

| Property             | Value                   |
| -------------------- | ----------------------- |
| **Size**             | 300x300 pixels          |
| **Format**           | PNG (with transparency) |
| **Background**       | Transparent             |
| **Max File Size**    | 10MB                    |
| **Supported Inputs** | PNG, JPG, SVG, WebP     |
| **Color Space**      | sRGB                    |
| **Compression**      | Optimized for web       |

## Error Handling

### Common Errors

1. **"Invalid file type"**

   - Only PNG, JPG, SVG, WebP allowed
   - Check file extension

2. **"File size exceeds 10MB"**

   - Compress image before upload
   - Use smaller dimensions

3. **"Failed to process image"**

   - Check image format
   - Try different browser
   - Disable ad blockers

4. **"Upload failed"**
   - Check internet connection
   - Verify Firebase credentials
   - Check storage bucket permissions

## Examples

### Example 1: Upload from URL

```typescript
// Fetch image from URL
const response = await fetch(imageUrl);
const blob = await response.blob();
const file = new File([blob], "beyblade.png", { type: "image/png" });

// Process
const processed = await resizeImage(file, 300, "contain");
```

### Example 2: Drag & Drop

```tsx
<div
  onDrop={(e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    // Process file
  }}
  onDragOver={(e) => e.preventDefault()}
>
  Drop image here
</div>
```

### Example 3: Batch Upload

```typescript
const uploadMultiple = async (files: File[]) => {
  for (const file of files) {
    const processed = await resizeImage(file, 300, "contain");
    await uploadToFirebase(processed, beybladeId);
  }
};
```

## Troubleshooting

### Background Not Removed

- Increase tolerance slider
- Check if background is truly solid color
- Try manual editing in image editor first

### Image Quality Loss

- Use higher resolution source (600x600+)
- Use PNG instead of JPG
- Avoid multiple re-saves

### Slow Processing

- Reduce source image size
- Use faster browser (Chrome recommended)
- Close other tabs

### Upload Fails

- Check Firebase storage rules
- Verify authentication
- Check network connection

## Future Enhancements

- [ ] Advanced background removal (AI-powered)
- [ ] Color adjustment tools
- [ ] Brightness/contrast controls
- [ ] Rotation and flip tools
- [ ] Batch upload multiple Beyblades
- [ ] Image effects (glow, shadow, etc.)
- [ ] Custom border colors
- [ ] Animated GIF support

---

**Last Updated**: October 30, 2025  
**Version**: 1.0.0
