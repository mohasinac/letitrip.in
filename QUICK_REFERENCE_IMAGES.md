# 🎮 Quick Reference: Beyblade Image System

## Upload Image (Admin)

```
1. Go to: /admin/beyblade-stats
2. Click: 📷 icon on Beyblade card
3. Upload: PNG/JPG/SVG (300x300)
4. Adjust: Background removal tolerance
5. Preview: Circular crop
6. Upload: Save to Firebase
```

## Render Image (Game)

```typescript
// Preload (once)
await preloadBeybladeImages(stats);

// Render (every frame)
drawBeybladeComplete(ctx, beyblade, stats, {
  showShadow: true,
  showTrail: true,
  showGlow: beyblade.ultimateAttackActive,
});
```

## Image Specs

| Property  | Value               |
| --------- | ------------------- |
| Size      | 300x300 px          |
| Format    | PNG (transparent)   |
| Max File  | 10 MB               |
| Supported | PNG, JPG, SVG, WebP |

## Common Tasks

### Upload New Image

```
Admin Panel → Click 📷 → Select File → Process → Upload
```

### Change Existing Image

```
Admin Panel → Click 📷 → Change Image → Process → Upload
```

### Remove Background

```
Upload → ☑ Remove Background → Tolerance: 10-30 → Process
```

### Test in Game

```
npm run dev
Start Game → Check Beyblade has image (not circle)
```

## Files Created

```
/src/lib/utils/imageProcessing.ts          # Processing utilities
/src/components/admin/BeybladeImageUploader.tsx  # Upload UI
/src/app/game/utils/beybladeRenderer.ts    # Canvas rendering
/src/app/api/beyblades/upload-image/route.ts  # Upload API
```

## Key Functions

### Upload Component

```tsx
<BeybladeImageUploader
  currentImageUrl={url}
  beybladeId={id}
  onImageUploaded={(url) => console.log(url)}
/>
```

### Canvas Rendering

```typescript
// Simple
drawBeyblade(ctx, beyblade, stats);

// With effects
drawBeybladeComplete(ctx, beyblade, stats, options);

// Glow
drawBeybladeWithGlow(ctx, beyblade, stats, "#FF00FF", 1.5);
```

### Image Processing

```typescript
// Background removal
await removeBackground(file, tolerance);

// Resize
await resizeImage(file, 300, "contain");

// SVG optimize
await processSVG(file, 300);
```

## Troubleshooting

| Issue               | Fix                   |
| ------------------- | --------------------- |
| Background not gone | ↑ Tolerance (10→30)   |
| Image blurry        | Use higher res source |
| Upload fails        | Check Firebase rules  |
| Not showing         | Verify imageUrl saved |

## API Endpoint

```
POST /api/beyblades/upload-image

Body: FormData {
  file: File
  beybladeId: string
}

Response: {
  success: true,
  imageUrl: string
}
```

## Quick Test

```bash
# 1. Start server
npm run dev

# 2. Open admin
http://localhost:3000/admin/beyblade-stats

# 3. Upload test image
Click 📷 → Select PNG → Upload

# 4. Start game
http://localhost:3000/game

# 5. Verify
Should see image, not circle ✓
```

## Documentation

- 📖 Full Guide: `/docs/BEYBLADE_IMAGE_UPLOAD.md`
- 🏗️ Architecture: `/SYSTEM_ARCHITECTURE.md`
- 📊 Stats System: `/docs/BEYBLADE_STATS_SYSTEM.md`
- 🔌 Integration: `/INTEGRATION_GUIDE.md`

---

**Quick Start**: Upload images via admin panel, render with `drawBeybladeComplete()` in game canvas!
