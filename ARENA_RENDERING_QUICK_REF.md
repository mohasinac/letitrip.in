# Arena Rendering - Quick Developer Reference

## Overview

Complete SVG-based rendering system for arena elements with 10-layer priority and theme-based visuals.

---

## Component Usage

### ArenaPreview (Main Component)

```tsx
import ArenaPreview from "@/components/admin/ArenaPreview";

<ArenaPreview arena={arenaConfig} width={400} height={400} />;
```

### Individual Renderers

#### LoopRenderer (Path Lines)

```tsx
import LoopRenderer from "@/components/arena/renderers/LoopRenderer";

<LoopRenderer
  loop={loopConfig}
  centerX={centerX}
  centerY={centerY}
  scale={scale}
/>;
```

**Key**: Renders as stroke-only path (4px width), NOT filled area

#### ChargePointRenderer (Button Numbers)

```tsx
import ChargePointRenderer from "@/components/arena/renderers/ChargePointRenderer";

<ChargePointRenderer
  chargePoint={chargePointConfig}
  loop={loopConfig}
  centerX={centerX}
  centerY={centerY}
  scale={scale}
/>;
```

**Key**: Displays button ID (1, 2, 3) in center

#### ObstacleRenderer (Theme Icons)

```tsx
import ObstacleRenderer from "@/components/arena/renderers/ObstacleRenderer";

<ObstacleRenderer obstacle={obstacleConfig} theme={arenaTheme} scale={scale} />;
```

**Key**: Uses emoji/icons based on theme (10 themes × 4 types)

#### PortalRenderer (Whirlpool Doors)

```tsx
import PortalRenderer from "@/components/arena/renderers/PortalRenderer";

<PortalRenderer portal={portalConfig} scale={scale} />;
```

**Key**: Animated 4-layer spiral, IN/OUT labels

#### RotationBodyRenderer (Force Fields)

```tsx
import RotationBodyRenderer from "@/components/arena/renderers/RotationBodyRenderer";

<RotationBodyRenderer rotationBody={rotationBodyConfig} scale={scale} />;
```

**Key**: RED color, rotation arrows, tangent force direction

---

## Utility Functions

### Path Generation

```typescript
import {
  generateShapePath,
  generateWhirlpoolSpiral,
  generateArc,
  generateRotationArrows,
  generateParticles,
} from "@/utils/pathGeneration";

// Generate shape path for any shape
const path = generateShapePath("hexagon", { x: 100, y: 100 }, 50);

// Generate whirlpool spiral for portals
const spiral = generateWhirlpoolSpiral({ x: 100, y: 100 }, 50, 0, 2, 50);

// Generate arc for walls/exits
const arc = generateArc({ x: 100, y: 100 }, 50, 0, 90);

// Generate rotation arrows
const arrows = generateRotationArrows({ x: 100, y: 100 }, 50, "clockwise", 8);

// Generate particle positions
const particles = generateParticles({ x: 100, y: 100 }, 50, 8);
```

### Obstacle Placement

```typescript
import {
  placeCenterObstacles,
  placeRandomObstacles,
  placeEvenlyDistributedObstacles,
  generateExcludedZones,
} from "@/utils/obstaclePlacement";

// Center placement (stacked at center)
const centerPositions = placeCenterObstacles(5, { x: 0, y: 0 }, 2);

// Random placement (collision avoidance)
const excludeZones = generateExcludedZones(portals, pits, waterBodies);
const randomPositions = placeRandomObstacles(10, 50, 50, excludeZones, 2);

// Evenly distributed (circle pattern)
const evenPositions = placeEvenlyDistributedObstacles(8, 25, excludeZones, 2);
```

---

## Type Definitions

### RotationBodyConfig (NEW)

```typescript
import { RotationBodyConfig } from "@/types/arenaConfig";

const rotationBody: RotationBodyConfig = {
  id: "rotation1",
  position: { x: 10, y: 10 },
  shape: "circle",
  radius: 5,
  rotationForce: 2.0,
  direction: "clockwise",
  falloff: 0.5,
  color: "#ef4444",
  opacity: 0.5,
  rotationAnimation: true,
};
```

### Existing Types

- `LoopConfig` - Loop paths with charge points
- `ChargePointConfig` - Dash exit buttons (1, 2, 3)
- `ObstacleConfig` - Obstacles with theme icons
- `PortalConfig` - Teleportation doors (IN/OUT)
- `WaterBodyConfig` - Liquid bodies with custom positioning
- `PitConfig` - Traps with depth
- `GoalObjectConfig` - Collectible objectives
- `WallConfig` - Boundaries with spikes/springs

---

## CSS Animations

Import in component:

```tsx
import "@/styles/arena-animations.css";
```

### Available Classes

- `.whirlpool-outer-ring` - Portal outer ring rotation (6s)
- `.whirlpool-layer-1` to `.whirlpool-layer-4` - Spiral layers (3-6s)
- `.whirlpool-particle` - Particle orbit (2s)
- `.portal-flow-animation` - Dashed line flow (1s)
- `.whirlpool-pulse` - Opacity pulse (2s)
- `.pulse-glow` - Charge point glow (2s)
- `.goal-collectible` - Float animation (2s)
- `.water-animation` - Wave animation (2s)
- `.arrow-animate-clockwise` - Rotation arrow CW (4s)
- `.arrow-animate-counter-clockwise` - Rotation arrow CCW (4s)

---

## Rendering Priority (Layer Order)

1. **Floor/Background** - Radial gradient based on theme
2. **Arena Shape** - Boundary outline
3. **Water Bodies** - Liquid areas (behind everything)
4. **Pits** - Traps with depth rings
5. **Rotation Bodies** - Force fields (RED)
6. **Loops** - Speed boost PATH LINES
7. **Charge Points** - Dash exit buttons
8. **Obstacles** - Theme-based icons/shapes
9. **Goal Objects** - Collectibles
10. **Portals** - Teleportation doors
11. **Walls/Exits** - Boundaries (BLACK/RED)
12. **Laser Guns** - Turrets

---

## Theme Colors

```typescript
const themeColors = {
  forest: "rgba(34, 139, 34, alpha)",
  mountains: "rgba(112, 128, 144, alpha)",
  grasslands: "rgba(124, 252, 0, alpha)",
  metrocity: "rgba(70, 130, 180, alpha)",
  safari: "rgba(210, 180, 140, alpha)",
  prehistoric: "rgba(139, 69, 19, alpha)",
  futuristic: "rgba(138, 43, 226, alpha)",
  desert: "rgba(244, 164, 96, alpha)",
  sea: "rgba(0, 191, 255, alpha)",
  riverbank: "rgba(95, 158, 160, alpha)",
};
```

---

## Obstacle Theme Icons

### Forest

- Rock: 🪨 | Pillar: 🌳 | Barrier: 🪵 | Wall: 🌿

### Futuristic

- Rock: 🔷 | Pillar: 🏢 | Barrier: ⚡ | Wall: 🛡️

### Desert

- Rock: 🏜️ | Pillar: 🌵 | Barrier: 🧱 | Wall: 🏗️

### Safari

- Rock: 🪨 | Pillar: 🌴 | Barrier: 🪵 | Wall: 🦁

### Prehistoric

- Rock: 🦴 | Pillar: 🦕 | Barrier: 🪨 | Wall: 🌋

### Mountains

- Rock: ⛰️ | Pillar: 🗻 | Barrier: 🪨 | Wall: 🏔️

### Grasslands

- Rock: 🪨 | Pillar: 🌾 | Barrier: 🪵 | Wall: 🌿

### Metrocity

- Rock: 🏗️ | Pillar: 🏙️ | Barrier: 🚧 | Wall: 🏢

### Sea

- Rock: 🪨 | Pillar: 🗿 | Barrier: ⚓ | Wall: 🐚

### Riverbank

- Rock: 🪨 | Pillar: 🌳 | Barrier: 🪵 | Wall: 🌊

---

## Common Patterns

### Scale Calculation

```typescript
const scale = Math.min(width, height) / (arena.width * 1.1);
```

### Center Positioning

```typescript
const centerX = width / 2;
const centerY = height / 2;
```

### Transform for Relative Positioning

```tsx
<g transform={`translate(${centerX}, ${centerY})`}>
  {/* Objects positioned relative to center */}
</g>
```

### Rotation Transform

```tsx
<g transform={`rotate(${angle} ${centerX} ${centerY})`}>
  {/* Rotated content */}
</g>
```

---

## Performance Tips

1. **Use SVG for static elements** (loops, walls, obstacles)
2. **Use Canvas for dynamic elements** (beyblades, particles)
3. **Leverage CSS animations** (GPU-accelerated)
4. **Memoize complex calculations**:
   ```tsx
   const shapePath = useMemo(
     () => generateShapePath(shape, position, radius),
     [shape, position, radius]
   );
   ```
5. **Implement viewport culling** for large arenas
6. **Lazy load theme assets** on demand

---

## Debugging

### Check Rendering

```typescript
console.log("Arena Preview", {
  scale,
  centerX,
  centerY,
  loopCount: arena.loops.length,
  obstacleCount: arena.obstacles.length,
  portalCount: arena.portals?.length || 0,
  rotationBodyCount: arena.rotationBodies?.length || 0,
});
```

### Verify Types

```typescript
// Type guards
const isLoop = (obj: any): obj is LoopConfig =>
  "radius" in obj && "speedBoost" in obj;

const hasChargePoints = (loop: LoopConfig): boolean =>
  !!loop.chargePoints && loop.chargePoints.length > 0;
```

---

## File Locations

```
src/
├── components/
│   ├── admin/
│   │   └── ArenaPreview.tsx
│   └── arena/
│       └── renderers/
│           ├── LoopRenderer.tsx
│           ├── ChargePointRenderer.tsx
│           ├── ObstacleRenderer.tsx
│           ├── PortalRenderer.tsx
│           └── RotationBodyRenderer.tsx
├── types/
│   └── arenaConfig.ts
├── utils/
│   ├── obstaclePlacement.ts
│   └── pathGeneration.ts
└── styles/
    └── arena-animations.css
```

---

## Testing

### Visual Test Checklist

- [ ] Loops render as lines (not filled)
- [ ] Charge points show button numbers
- [ ] Obstacles use theme icons
- [ ] Portals animate with spirals
- [ ] Rotation bodies show red with arrows
- [ ] Water bodies render shapes
- [ ] Walls BLACK, exits RED
- [ ] All animations smooth

### Integration Test

```tsx
import { render } from "@testing-library/react";
import ArenaPreview from "@/components/admin/ArenaPreview";
import { mockArenaConfig } from "@/test/mocks";

test("renders arena preview", () => {
  const { container } = render(<ArenaPreview arena={mockArenaConfig} />);

  const svg = container.querySelector("svg");
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveAttribute("width", "400");
});
```

---

## Next Steps

1. **Update ArenaConfigurator UI**:

   - Add rotation body controls
   - Add obstacle placement mode selector
   - Add water body position inputs

2. **Physics Integration**:

   - Implement loop boost detection
   - Add obstacle collision
   - Wire portal teleportation
   - Connect rotation body forces

3. **Optimization**:
   - Add viewport culling
   - Implement lazy loading
   - Profile performance

---

## Support

- **Documentation**: ARENA_RENDERING_GUIDE.md (2100+ lines)
- **Implementation**: ARENA_RENDERING_IMPLEMENTATION_COMPLETE.md
- **Quick Ref**: This file
- **Type Definitions**: src/types/arenaConfig.ts

---

**Status**: ✅ All rendering features implemented, 0 TypeScript errors
