# Beyblade Constants Quick Reference

## 🎯 Core Formula

```
1 cm = ARENA_RESOLUTION / 45 pixels
1 cm = 24 pixels (at 1080p)
```

## 📏 Standard Sizes

| Name | Radius | Diameter @ 1080p | Mass |
|------|--------|------------------|------|
| MINI | 2.5 cm | 60px | 28g |
| SMALL | 3.0 cm | 72px | 40g |
| **STANDARD** | **4.0 cm** | **96px** | **50g** |
| LARGE | 5.0 cm | 120px | 78g |
| XL | 7.5 cm | 180px | 175g |
| XXL | 10.0 cm | 240px | 312g |
| GIANT | 15.0 cm | 360px | 700g |
| MEGA | 20.0 cm | 480px | 1250g |

## 🔧 Key Functions

```typescript
import {
  cmToPixels,
  pixelsToCm,
  getBeybladeDisplayRadius,
  getBeybladeDisplayDiameter,
  getBeybladePreviewScale,
  getRecommendedMass,
  STANDARD_BEYBLADE_SIZES,
  BEYBLADE_SIZE_CONSTRAINTS,
  PIXELS_PER_CM
} from '@/constants/beybladeConstants';
```

### Size Conversion

```typescript
// Convert cm to pixels
const pixels = cmToPixels(4);  // 96px at 1080p

// Convert pixels to cm
const cm = pixelsToCm(96);     // 4cm

// Get display radius
const radius = getBeybladeDisplayRadius(4);  // 96px

// Get display diameter
const diameter = getBeybladeDisplayDiameter(4);  // 192px
```

### Mass Calculation

```typescript
// Get recommended mass for size
const mass = getRecommendedMass(4);  // 50g
const heavyMass = getRecommendedMass(10);  // 312g
```

### Preview Scaling

```typescript
// Get scale for preview canvas
const scale = getBeybladePreviewScale(400);
// Returns: 400/1080 = 0.37
```

## 🎨 Usage in Components

### Basic Rendering

```typescript
import { getBeybladeDisplayRadius } from '@/constants/beybladeConstants';

const BeybladeRenderer = ({ beyblade, scale }) => {
  const radius = getBeybladeDisplayRadius(beyblade.radius) * scale;
  
  return (
    <circle 
      cx={x} 
      cy={y} 
      r={radius} 
      fill={color} 
    />
  );
};
```

### Canvas Drawing

```typescript
import { 
  getBeybladeDisplayRadius, 
  getBeybladePreviewScale 
} from '@/constants/beybladeConstants';

const drawBeyblade = (ctx, beyblade, canvasSize) => {
  const baseRadius = getBeybladeDisplayRadius(beyblade.radius);
  const scale = getBeybladePreviewScale(canvasSize);
  const displayRadius = baseRadius * scale;
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, displayRadius, 0, Math.PI * 2);
  ctx.fill();
};
```

## 🎮 Creating Beyblades

### Standard Beyblade

```typescript
const beyblade: BeybladeStats = {
  id: "std-001",
  displayName: "Standard Fighter",
  radius: STANDARD_BEYBLADE_SIZES.STANDARD,  // 4cm
  mass: getRecommendedMass(4),               // 50g
  type: "balanced",
  spinDirection: "right",
  // ...
};
```

### Custom Size

```typescript
const customBeyblade: BeybladeStats = {
  id: "custom-001",
  displayName: "Custom Size",
  radius: 6,                      // 6cm = 144px at 1080p
  mass: getRecommendedMass(6),    // ~112g
  type: "defense",
  spinDirection: "left",
  // ...
};
```

## 📊 Size Categories

### Attack Types (Light & Fast)
- **Recommended**: 2.5 - 3.5 cm
- **Mass**: 28 - 50g
- **Speed**: High
- **Use**: Quick strikes

### Defense Types (Heavy & Stable)
- **Recommended**: 4.5 - 7.5 cm
- **Mass**: 80 - 175g
- **Speed**: Low-Medium
- **Use**: Tank builds

### Stamina Types (Balanced)
- **Recommended**: 3.5 - 5 cm
- **Mass**: 50 - 78g
- **Speed**: Medium
- **Use**: Long battles

### Balanced Types
- **Recommended**: 4 cm (standard)
- **Mass**: 50g
- **Speed**: Medium
- **Use**: All-around

## ⚠️ Constraints

```typescript
MIN_RADIUS_CM: 1.5     // 36px - Absolute minimum
MAX_RADIUS_CM: 25      // 600px - Absolute maximum
DEFAULT_RADIUS_CM: 4   // 96px - Standard size
```

## 🔄 Mass Formula

```typescript
mass = (radius / 4)² * 50

Examples:
- radius 2cm  → mass 12g
- radius 4cm  → mass 50g (standard)
- radius 8cm  → mass 200g
- radius 16cm → mass 800g
```

## 📱 Preview Settings

```typescript
BEYBLADE_PREVIEW_SETTINGS = {
  CANVAS_SIZE: 400,
  PREVIEW_SCALE: 1,
  BACKGROUND_COLOR: "#f3f4f6",
  GRID_COLOR: "#d1d5db",
  CENTER_CIRCLE_RADIUS: 150,
}
```

## 🎯 Best Practices

1. **Use standard sizes** when possible
2. **Calculate mass** using `getRecommendedMass()`
3. **Apply scale** in rendering logic
4. **Validate** radius is within constraints
5. **Test** at different arena resolutions

## 🔗 Related Constants

```typescript
import { ARENA_RESOLUTION } from '@/types/arenaConfigNew';
// 1080px - Base resolution for all calculations
```

---

**Quick Tip**: For most beyblades, use `STANDARD_BEYBLADE_SIZES.STANDARD` (4cm) as it provides the best balance and is based on real beyblade dimensions!
