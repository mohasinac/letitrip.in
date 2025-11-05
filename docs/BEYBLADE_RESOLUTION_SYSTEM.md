# Beyblade Resolution System

## Overview

The beyblade system now follows the same resolution-based approach as arenas, ensuring consistent scaling and proper physical representation across all devices.

## Core Principle

**1 cm = ARENA_RESOLUTION / 45 pixels**

For a 1080px arena:
- **1 cm = 24 pixels**

This provides a scalable system where beyblades maintain proper proportions relative to the arena, regardless of display size.

## Formula

```typescript
PIXELS_PER_CM = ARENA_RESOLUTION / 45
// For 1080px arena: 24 pixels per cm

displayRadius = radiusCm * PIXELS_PER_CM
displayDiameter = radiusCm * PIXELS_PER_CM * 2
```

## Standard Beyblade Sizes

Based on real-world beyblade dimensions (typically 3-5cm diameter):

| Size | Radius (cm) | Diameter (pixels @ 1080p) | Use Case |
|------|-------------|---------------------------|----------|
| Mini | 2.5 | 60px | Small, fast beyblades |
| Small | 3.0 | 72px | Light attackers |
| **Standard** | **4.0** | **96px** | **Default size** |
| Large | 5.0 | 120px | Heavy defenders |
| XL | 7.5 | 180px | Boss beyblades |
| XXL | 10.0 | 240px | Special events |
| Giant | 15.0 | 360px | Arena hazards |
| Mega | 20.0 | 480px | Ultimate bosses |

## Size Constraints

```typescript
MIN_RADIUS_CM: 1.5    // 36px at 1080p
MAX_RADIUS_CM: 25     // 600px at 1080p
DEFAULT_RADIUS_CM: 4  // 96px at 1080p (standard)
```

## Mass Recommendations

Mass should scale roughly with the area (radius²):

```typescript
// Standard: 4cm radius = 50g (similar to real beyblades)
recommendedMass = (radiusCm / 4)² * 50

Examples:
- 3cm → 28g (light)
- 4cm → 50g (standard)
- 5cm → 78g (heavy)
- 10cm → 312g (very heavy)
```

## Implementation

### Constants File

Location: `src/constants/beybladeConstants.ts`

Key functions:
```typescript
// Convert cm to pixels
cmToPixels(cm: number): number

// Convert pixels to cm
pixelsToCm(pixels: number): number

// Get display radius
getBeybladeDisplayRadius(radiusCm: number): number

// Get display diameter
getBeybladeDisplayDiameter(radiusCm: number): number

// Calculate preview scale
getBeybladePreviewScale(canvasSize: number): number

// Get recommended mass
getRecommendedMass(radiusCm: number): number
```

### Beyblade Stats Type

Location: `src/types/beybladeStats.ts`

```typescript
interface BeybladeStats {
  // Physical Properties
  mass: number;    // grams (10-2000g recommended)
  radius: number;  // cm (1.5-25cm, standard: 4cm)
  
  // DEPRECATED - Do not use
  actualSize?: number; // Use getBeybladeDisplayRadius() instead
}
```

### Preview Component

Location: `src/components/admin/BeybladePreview.tsx`

The preview component now:
1. Uses `getBeybladeDisplayRadius()` to calculate size
2. Applies `getBeybladePreviewScale()` for canvas scaling
3. Shows both cm and pixel measurements
4. Displays resolution system info

## Examples

### Creating a Standard Beyblade

```typescript
const standardBeyblade: BeybladeStats = {
  id: "standard-001",
  displayName: "Standard Beyblade",
  radius: 4,     // 4cm = 96px diameter at 1080p
  mass: 50,      // Standard weight
  type: "balanced",
  spinDirection: "right",
  // ... other properties
};
```

### Creating a Mini Beyblade

```typescript
const miniBeyblade: BeybladeStats = {
  id: "mini-001",
  displayName: "Mini Speed",
  radius: 2.5,   // 2.5cm = 60px diameter at 1080p
  mass: 28,      // Lighter (calculated: (2.5/4)² * 50)
  type: "attack",
  spinDirection: "right",
  // ... other properties
};
```

### Creating a Giant Beyblade

```typescript
const giantBeyblade: BeybladeStats = {
  id: "giant-001",
  displayName: "Giant Destroyer",
  radius: 15,    // 15cm = 360px diameter at 1080p
  mass: 700,     // Much heavier (calculated: (15/4)² * 50)
  type: "defense",
  spinDirection: "left",
  // ... other properties
};
```

## Rendering on Arena

When rendering beyblades in the arena:

```typescript
import { getBeybladeDisplayRadius } from '@/constants/beybladeConstants';
import { ARENA_RESOLUTION } from '@/types/arenaConfigNew';

// Calculate scale for current display
const displaySize = Math.min(canvasWidth, canvasHeight);
const arenaScale = displaySize / ARENA_RESOLUTION;

// Get beyblade radius in pixels
const beybladeRadiusPixels = getBeybladeDisplayRadius(beyblade.radius);

// Apply arena scale
const displayRadius = beybladeRadiusPixels * arenaScale;

// Draw beyblade
ctx.arc(x, y, displayRadius, 0, Math.PI * 2);
```

## Benefits

1. **Consistent Scaling**: Beyblades maintain proper proportions across all screen sizes
2. **Real-world Accuracy**: Based on actual beyblade dimensions (3-5cm)
3. **Predictable Physics**: Size directly relates to mass and collision behavior
4. **Easy Balancing**: Clear relationship between size, mass, and power
5. **Resolution Independence**: Works at any arena resolution

## Migration Guide

If updating existing beyblades:

1. **Old system**: `actualSize` property in pixels
2. **New system**: `radius` property in cm

```typescript
// OLD (deprecated)
const beyblade = {
  radius: 8,        // cm (not used correctly)
  actualSize: 80,   // pixels (display size)
};

// NEW (correct)
const beyblade = {
  radius: 4,        // cm (standard size)
  // actualSize removed - calculated automatically
};

// Get display size:
const displayRadius = getBeybladeDisplayRadius(beyblade.radius);
// Result: 96px at 1080p
```

## Future Enhancements

Potential additions:
1. Size-based stat modifiers
2. Visual size indicators in editor
3. Comparison tools for different sizes
4. Arena size recommendations
5. Collision prediction based on size

## Related Documentation

- [Arena Resolution System](./arena/ARENA_RESOLUTION.md)
- [Beyblade Stats System](./BEYBLADE_STATS.md)
- [Physics System](./game/PHYSICS.md)

---

**Last Updated**: November 6, 2025
**Version**: 1.0
