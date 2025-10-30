# Beyblade Points of Contact Editor

## Overview

The Beyblade Image Uploader now includes a **visual editor** for setting Points of Contact directly on the beyblade image. This allows users to define exactly where collision damage occurs and how much damage each contact point deals.

## Features

### ✨ Visual Point Placement

- **Click to place**: Click anywhere on the beyblade image to add a contact point
- **Interactive arrows**: Each point is shown as an arrow pointing outward from the center
- **Color-coded**: Points are colored based on damage multiplier (red = low, yellow = medium, green = high)
- **Numbered**: Each point is numbered for easy identification

### 🎨 Live Preview

- **Real-time visualization**: See exactly where each contact point is located
- **Three-layer canvas**:
  1. **Image layer** (bottom): The scaled beyblade image
  2. **Circle guide layer** (middle): 300px diameter guide circle
  3. **Points layer** (top): Interactive contact points with arrows

### ⚙️ Point Properties

Each contact point has three adjustable properties:

1. **Angle** (0-360°)

   - Position around the beyblade in degrees
   - 0° = top, 90° = right, 180° = bottom, 270° = left
   - Adjustable via slider

2. **Damage Multiplier** (0.5x - 3.0x)

   - How much damage this point deals on collision
   - 1.0x = normal damage
   - 3.0x = triple damage (for blade edges)
   - Adjustable via slider

3. **Width** (10° - 90°)
   - Angular width of the contact zone
   - Larger width = easier to hit with this point
   - Adjustable via slider

## How to Use

### Adding Points

1. Upload or select a beyblade image
2. Click the **"+ Add Point"** button (purple section)
3. Click on the beyblade image where you want to place a contact point
4. The point appears with default settings (1.0x damage, 30° width)

### Editing Points

1. **Select a point**: Click on any existing point to select it
2. The selected point highlights with a brighter color
3. Adjust properties using the sliders:
   - **Angle**: Rotate the point around the beyblade
   - **Damage Multiplier**: Increase/decrease damage dealt
   - **Width**: Make the contact zone wider/narrower
4. Changes apply instantly to the visual

### Deleting Points

1. Select the point you want to remove
2. Click the **"Delete"** button in the properties panel
3. The point is removed immediately

## Best Practices

### Attack Type Beyblades

- **3-4 points** with **high damage** (2.0x - 3.0x)
- Place points at blade edges/protrusions
- Narrow width (15-25°) for precise hits
- Example: Pegasus with 3 wing blades

### Defense Type Beyblades

- **6-8 points** with **moderate damage** (1.0x - 1.5x)
- Evenly distributed around the perimeter
- Wide width (40-60°) for consistent contact
- Example: Leone with circular defense ring

### Stamina Type Beyblades

- **4-6 points** with **low-moderate damage** (0.8x - 1.2x)
- Evenly spaced for balance
- Medium width (30-40°)
- Example: Phantom with smooth ring

### Balanced Type Beyblades

- **5-6 points** with **varied damage** (1.0x - 2.0x)
- Mix of wide and narrow zones
- Combination of high/low damage points
- Example: Diablo with alternating attack/defense zones

## Visual Guide

```
         0° (Top)
          ↑
          │
  270° ←──┼──→ 90°
          │
          ↓
       180° (Bottom)
```

### Color Coding

- **Red**: Low damage (0.5x - 1.0x)
- **Yellow**: Medium damage (1.0x - 1.8x)
- **Green**: High damage (1.8x - 3.0x)

## Integration

### Component Props

```tsx
<BeybladeImageUploader
  currentImageUrl={beyblade.imageUrl}
  beybladeId={beyblade.id}
  onImageUploaded={(url) => handleImageUploaded(beyblade.id, url)}
  onPointsOfContactUpdated={(points) => handlePointsUpdate(points)}
  initialPointsOfContact={beyblade.pointsOfContact}
/>
```

### Props

- `currentImageUrl`: Current beyblade image URL
- `beybladeId`: Unique beyblade identifier
- `onImageUploaded`: Callback when image is uploaded
- `onPointsOfContactUpdated`: Callback when points change (optional)
- `initialPointsOfContact`: Existing points to load (optional)

### Data Structure

```typescript
interface PointOfContact {
  angle: number; // 0-360 degrees
  damageMultiplier: number; // 0.5-3.0
  width: number; // 10-90 degrees
}
```

## Tips

1. **Start with scale**: Adjust image scale first, then add points
2. **Use the guide**: The blue circle shows the final beyblade size
3. **Test in game**: Play a match to see how points feel
4. **Iterate**: Adjust multipliers based on gameplay balance
5. **Symmetry**: For balanced beyblades, use symmetrical point placement

## Example Configurations

### Aggressive Attack (Pegasus)

```javascript
[
  { angle: 0, damageMultiplier: 2.5, width: 20 }, // Top blade
  { angle: 120, damageMultiplier: 2.5, width: 20 }, // Right blade
  { angle: 240, damageMultiplier: 2.5, width: 20 }, // Left blade
];
```

### Solid Defense (Leone)

```javascript
[
  { angle: 0, damageMultiplier: 1.2, width: 50 },
  { angle: 60, damageMultiplier: 1.2, width: 50 },
  { angle: 120, damageMultiplier: 1.2, width: 50 },
  { angle: 180, damageMultiplier: 1.2, width: 50 },
  { angle: 240, damageMultiplier: 1.2, width: 50 },
  { angle: 300, damageMultiplier: 1.2, width: 50 },
];
```

### Balanced Attack (Diablo)

```javascript
[
  { angle: 0, damageMultiplier: 2.0, width: 25 }, // Attack point
  { angle: 72, damageMultiplier: 1.0, width: 45 }, // Defense zone
  { angle: 144, damageMultiplier: 2.0, width: 25 }, // Attack point
  { angle: 216, damageMultiplier: 1.0, width: 45 }, // Defense zone
  { angle: 288, damageMultiplier: 2.0, width: 25 }, // Attack point
];
```

## Technical Details

### Canvas Layers

- **Layer 1** (editCanvasRef): Displays the scaled image
- **Layer 2** (overlayCanvasRef): Shows the 300px guide circle (non-interactive)
- **Layer 3** (pointsCanvasRef): Interactive layer for point placement and selection

### State Management

- Points are stored in component state
- Changes trigger the `onPointsOfContactUpdated` callback
- Parent component can save points to database
- Initial points loaded from `initialPointsOfContact` prop

### Coordinate System

- Center of beyblade = (150, 150) in 300x300 canvas
- Angles measured clockwise from top (North)
- Arrow direction points outward from center

## Files Modified

- `src/components/admin/BeybladeImageUploader.tsx` - Main component with point editor
- `src/app/globals.css` - Slider styling (already present)

## Future Enhancements

- [ ] Preset templates for common beyblade types
- [ ] Duplicate/copy points
- [ ] Rotate all points at once
- [ ] Export/import point configurations
- [ ] Visual simulation of collision zones
- [ ] Undo/redo for point edits
