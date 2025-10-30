# Dynamic Arena System - Complete Guide

## Overview

A comprehensive arena configuration system that supports dynamic battle environments with loops, hazards, objectives, and themes. Built using em units for responsive scaling.

## Architecture

### Core Components

#### 1. Type Definitions (`src/types/arenaConfig.ts`)

- **ArenaConfig**: Main configuration interface
- **LoopConfig**: Speed boost circular paths
- **WallConfig**: Boundary damage and recoil
- **ObstacleConfig**: Static barriers and objects
- **WaterBodyConfig**: Slowing zones with spin drain
- **PitConfig**: Traps that capture beyblades
- **LaserGunConfig**: Auto-targeting turrets
- **GoalObjectConfig**: Destructible objectives

#### 2. Arena Configurator (`src/components/admin/ArenaConfigurator.tsx`)

Visual editor for creating and customizing arenas with:

- 6 tabs: Basic, Loops, Hazards, Goals, Theme, Preview
- Preset loader for quick start
- Real-time validation
- Random generation for obstacles and pits

#### 3. Arena Renderer (To Be Created)

Will render the configured arena in game with proper physics

## Features

### 1. Loops (Speed Boost Zones)

```typescript
loops: [
  {
    radius: 15, // em units from center
    speedBoost: 1.2, // 20% faster
    spinBoost: 5, // +5 spin per second
    frictionMultiplier: 0.8, // 20% less friction
    color: "#4fc3f7", // Visual ring color
  },
];
```

**Gameplay:**

- Beyblades inside loop move faster
- Can recover spin while on loop
- Strategic positioning advantage
- Maximum 10 loops per arena

### 2. Exits (Lose Conditions)

```typescript
exits: [
  {
    angle: 0, // Position in degrees
    width: 30, // Opening width in degrees
    enabled: true, // Can be disabled
  },
];
```

**Gameplay:**

- Beyblades exit = instant loss
- Can have 0 exits (closed arena)
- Or multiple exits (high risk arena)

### 3. Walls

```typescript
wall: {
  enabled: true,
  baseDamage: 5,                // Damage on collision
  recoilDistance: 2,            // Bounce back distance (em)
  hasSpikes: true,              // 2x damage multiplier
  spikeDamageMultiplier: 2.0,
  hasSprings: true,             // 1.5x recoil multiplier
  springRecoilMultiplier: 1.5,
  thickness: 0.5                // Visual thickness (em)
}
```

**Animations Needed:**

- Spike flash on collision
- Spring compression/expansion
- Impact particles

### 4. Obstacles

```typescript
obstacles: [
  {
    type: "rock" | "pillar" | "barrier" | "wall",
    x: 5,
    y: 10, // Position (em)
    radius: 2, // Size (em)
    rotation: 45, // For non-circular
    damage: 10, // Collision damage
    recoil: 3, // Knockback force
    destructible: true, // Can be destroyed
    health: 100, // Health if destructible
  },
];
```

**Features:**

- Random generation avoiding loops/water
- Different types with unique visuals
- Destructible obstacles create dynamic gameplay
- Maximum 50 for performance

### 5. Water Bodies

```typescript
waterBody: {
  enabled: true,
  type: 'center',           // or 'loop'
  radius: 10,               // For center type (em)
  spinDrainRate: 2,         // % per second
  speedMultiplier: 0.6,     // 40% slower
  viscosity: 0.8,           // Affects acceleration
  color: '#4fc3f7',
  waveAnimation: true
}
```

**Physics:**

```typescript
// When beyblade enters water
if (isInWater) {
  // Drain spin
  stamina -= ((currentStamina * waterBody.spinDrainRate) / 100) * deltaTime;

  // Slow movement
  velocity *= waterBody.speedMultiplier;

  // Apply viscosity (affects acceleration)
  acceleration *= 1 - waterBody.viscosity;
}
```

**Animations:**

- Wave ripples
- Splash effects on entry/exit
- Slower beyblade rotation in water

### 6. Pits

```typescript
pits: [
  {
    x: 0,
    y: 15, // Position (em)
    radius: 2, // Size (em)
    damagePerSecond: 10, // % of current spin
    escapeChance: 0.5, // 50% chance per second
    visualDepth: 3, // Visual depth effect
    swirl: true, // Swirling animation
  },
];
```

**Gameplay Loop:**

```typescript
// When beyblade enters pit
beybladeState.trapped = true;
beybladeState.position = pit.position; // Lock position

// Each frame while trapped
if (Math.random() < pit.escapeChance * deltaTime) {
  beybladeState.trapped = false; // Escaped!
  // Apply exit velocity in random direction
} else {
  // Take damage
  stamina -= ((currentStamina * pit.damagePerSecond) / 100) * deltaTime;
}

// Game over if stamina reaches 0 while trapped
if (stamina <= 0) {
  gameOver(beybladeId);
}
```

**Animations:**

- Swirl effect pulling beyblade in
- Rotation while trapped
- Dramatic escape burst

### 7. Laser Guns

```typescript
laserGuns: [
  {
    x: 15,
    y: 15, // Position (em)
    angle: 0, // Current aim
    fireInterval: 3, // Seconds between shots
    damage: 50, // Hit damage
    bulletSpeed: 20, // em/second
    targetMode: "nearest", // or 'random', 'strongest'
    warmupTime: 0.5, // Aim time
    cooldown: 1, // After-fire cooldown
    range: 40, // Max range (em)
    laserColor: "#ff0000",
  },
];
```

**AI Behavior:**

```typescript
// Laser gun state machine
enum LaserState {
  IDLE,
  TARGETING,
  FIRING,
  COOLDOWN,
}

// Update cycle
function updateLaserGun(gun, beyblades, deltaTime) {
  switch (gun.state) {
    case IDLE:
      if (gun.timer >= gun.fireInterval) {
        gun.target = selectTarget(beyblades, gun.targetMode);
        gun.state = TARGETING;
        gun.timer = 0;
      }
      break;

    case TARGETING:
      // Rotate towards target
      gun.angle = angleTo(gun.position, gun.target.position);
      if (gun.timer >= gun.warmupTime) {
        fireLaser(gun);
        gun.state = COOLDOWN;
        gun.timer = 0;
      }
      break;

    case COOLDOWN:
      if (gun.timer >= gun.cooldown) {
        gun.state = IDLE;
        gun.timer = 0;
      }
      break;
  }
  gun.timer += deltaTime;
}
```

**Animations:**

- Red targeting laser during warmup
- Bright laser beam on fire
- Impact explosion
- Smoke trail from gun

### 8. Goal Objects

```typescript
goalObjects: [
  {
    id: "tower1",
    x: 10,
    y: 10, // Position (em)
    radius: 3, // Size (em)
    health: 500, // Hit points
    scoreValue: 100, // Points on destroy
    type: "tower", // Visual type
    color: "#ffd700",
    shieldHealth: 200, // Optional shield
  },
];
```

**Win Condition:**

```typescript
if (requireAllGoalsDestroyed) {
  const allDestroyed = goalObjects.every((g) => g.health <= 0);
  if (allDestroyed) {
    gameWon();
  }
}
```

**Animations:**

- Damage cracks appearing
- Shield shimmer
- Destruction explosion
- Score popup

### 9. Arena Shapes

#### Circle

```typescript
shape: "circle";
// Uses radius from center
// Exits as arc openings
```

#### Rectangle

```typescript
shape: "rectangle";
// Width × Height
// Exits on sides
// Corners handled specially
```

#### Pentagon/Hexagon/Octagon

```typescript
shape: "pentagon"; // or 'hexagon', 'octagon'
// N-sided polygon
// Exits between vertices
// Loops follow perimeter
```

#### Star

```typescript
shape: "star";
// 5 or more points
// Exits at points or valleys
// Complex collision detection
```

#### Oval

```typescript
shape: "oval";
// Elliptical arena
// Asymmetric gameplay
// Strategic positioning
```

### 10. Themes

Each theme provides:

- Background image/gradient
- Color palette
- Ambient sounds
- Particle effects
- Visual style

#### Forest 🌲

- Green tones
- Tree shadows
- Leaf particles
- Bird sounds

#### Mountains ⛰️

- Rocky textures
- Snow caps
- Echo sounds
- Altitude vibe

#### Grasslands 🌾

- Golden wheat
- Wind effects
- Rustling sounds
- Open feel

#### Metro City 🏙️

- Concrete/metal
- Neon lights
- Traffic sounds
- Urban style

#### Safari 🦁

- Savanna colors
- Animal sounds
- Dust particles
- Wild atmosphere

#### Prehistoric 🦕

- Volcanic rocks
- Fern vegetation
- Roar sounds
- Ancient feel

#### Futuristic 🚀

- Holographic effects
- Glowing edges
- Tech sounds
- Sci-fi aesthetic

#### Desert 🏜️

- Sand texture
- Heat shimmer
- Wind sounds
- Arid vibe

#### Sea 🌊

- Blue water
- Wave motion
- Seagull sounds
- Nautical theme

#### River Bank 🏞️

- Flowing water
- Rocks/reeds
- River sounds
- Natural beauty

## Units System

### Why em Units?

- Responsive to screen size
- Better than pixels for scaling
- 1em typically = 16px at base font size
- Arena: 50em × 50em = 800px × 800px

### Conversion

```typescript
// Base conversion (adjustable)
const EM_TO_PX = 16;

function emToPx(em: number): number {
  return em * EM_TO_PX;
}

function pxToEm(px: number): number {
  return px / EM_TO_PX;
}
```

## Game Modes

### Player vs AI

```typescript
gameMode: "player-vs-ai";
aiDifficulty: "easy" | "medium" | "hard" | "extreme";
```

**AI Behavior:**

- **Easy**: Random movement, occasional attacks
- **Medium**: Targets player, uses loops strategically
- **Hard**: Advanced patterns, avoids hazards
- **Extreme**: Perfect optimization, frame-perfect reactions

### Player vs Player

```typescript
gameMode: "player-vs-player";
```

**Features:**

- Split controls (WASD vs Arrow keys)
- Or online multiplayer
- Competitive rankings
- Replays

### Single Player Test

```typescript
gameMode: "single-player-test";
```

**Features:**

- No opponent
- Test beyblade stats
- Practice with hazards
- Debug mode available

## Performance Optimization

### Pre-rendering Strategy

#### 1. Static Layer Caching

```typescript
// Render static elements once
const staticCanvas = document.createElement("canvas");
const staticCtx = staticCanvas.getContext("2d");

// Draw loops, obstacles, walls (non-moving)
renderLoops(staticCtx, config.loops);
renderObstacles(staticCtx, config.obstacles);
renderWalls(staticCtx, config.wall);

// Cache as image
const staticLayer = staticCanvas.toDataURL();
```

#### 2. Dynamic Layer

```typescript
// Only render moving elements each frame
function renderFrame() {
  // Draw cached static layer
  ctx.drawImage(staticLayerImage, 0, 0);

  // Draw dynamic elements
  renderBeyblades(ctx, beyblades);
  renderWater(ctx, waterBody); // Animated
  renderPits(ctx, pits); // Swirl animation
  renderLasers(ctx, laserGuns); // Projectiles
  renderParticles(ctx, particles);
}
```

#### 3. Server-Side Pre-rendering

```typescript
// API endpoint: /api/arena/render
// Generates static arena image on server
// Client downloads and caches

// Benefits:
// - Faster initial load
// - Consistent visuals
// - Reduced client computation
// - Better for mobile
```

### Object Pooling

```typescript
// Reuse particle objects
const particlePool = {
  available: [],
  active: [],

  get() {
    return this.available.pop() || new Particle();
  },

  release(particle) {
    particle.reset();
    this.available.push(particle);
  },
};
```

### Spatial Partitioning

```typescript
// Grid-based collision detection
const GRID_SIZE = 10; // em

class SpatialGrid {
  cells: Map<string, GameObject[]>;

  insert(obj: GameObject) {
    const cell = this.getCell(obj.x, obj.y);
    this.cells.get(cell).push(obj);
  }

  query(x: number, y: number, radius: number): GameObject[] {
    // Only check nearby cells
    const cells = this.getCellsInRadius(x, y, radius);
    return cells.flatMap((c) => this.cells.get(c) || []);
  }
}

// Check collisions only with nearby objects
const nearbyObjects = grid.query(beyblade.x, beyblade.y, beyblade.radius);
```

## Physics Integration

### Collision Detection

#### Beyblade vs Wall

```typescript
function checkWallCollision(beyblade, arena) {
  const distFromCenter = distance(beyblade.pos, arena.center);

  if (distFromCenter + beyblade.radius > arena.radius) {
    // Hit wall
    const damage = arena.wall.baseDamage;
    const multiplier = arena.wall.hasSpikes
      ? arena.wall.spikeDamageMultiplier
      : 1;
    beyblade.stamina -= damage * multiplier;

    // Recoil
    const recoilMultiplier = arena.wall.hasSprings
      ? arena.wall.springRecoilMultiplier
      : 1;
    const recoilDist = arena.wall.recoilDistance * recoilMultiplier;

    // Bounce back
    const normal = normalize(subtract(beyblade.pos, arena.center));
    beyblade.pos = subtract(beyblade.pos, scale(normal, recoilDist));
    beyblade.velocity = reflect(beyblade.velocity, normal);

    // Trigger animations
    if (arena.wall.hasSpikes) playSpikeAnimation(beyblade.pos);
    if (arena.wall.hasSprings) playSpringAnimation(beyblade.pos);
  }
}
```

#### Beyblade vs Obstacle

```typescript
function checkObstacleCollision(beyblade, obstacle) {
  if (circleCollision(beyblade, obstacle)) {
    // Apply damage
    beyblade.stamina -= obstacle.damage;

    // Knockback
    const direction = normalize(subtract(beyblade.pos, obstacle.pos));
    beyblade.velocity = add(
      beyblade.velocity,
      scale(direction, obstacle.recoil)
    );

    // Damage obstacle if destructible
    if (obstacle.destructible) {
      obstacle.health -= beyblade.calculatedStats.damagePerHit;
      if (obstacle.health <= 0) {
        destroyObstacle(obstacle);
      }
    }
  }
}
```

#### Beyblade vs Laser

```typescript
function checkLaserHit(bullet, beyblade) {
  if (
    lineCircleIntersection(
      bullet.start,
      bullet.end,
      beyblade.pos,
      beyblade.radius
    )
  ) {
    beyblade.stamina -= bullet.damage;
    playLaserHitAnimation(beyblade.pos);
    return true;
  }
  return false;
}
```

### Movement Physics

#### In Water

```typescript
function updateBeybladeInWater(beyblade, waterBody, deltaTime) {
  // Apply speed reduction
  beyblade.velocity = scale(beyblade.velocity, waterBody.speedMultiplier);

  // Apply viscosity to acceleration
  beyblade.acceleration = scale(beyblade.acceleration, 1 - waterBody.viscosity);

  // Drain spin
  const drainAmount =
    ((beyblade.stamina * waterBody.spinDrainRate) / 100) * deltaTime;
  beyblade.stamina -= drainAmount;

  // Visual feedback
  createWaterRipples(beyblade.pos);
}
```

#### On Loop

```typescript
function updateBeybladeOnLoop(beyblade, loop, deltaTime) {
  // Speed boost
  const boostedSpeed = beyblade.speed * loop.speedBoost;
  beyblade.velocity = setMagnitude(beyblade.velocity, boostedSpeed);

  // Spin recovery
  if (loop.spinBoost) {
    beyblade.stamina = Math.min(
      beyblade.maxStamina,
      beyblade.stamina + loop.spinBoost * deltaTime
    );
  }

  // Reduced friction
  const frictionMultiplier = loop.frictionMultiplier || 1.0;
  beyblade.friction = beyblade.baseFriction * frictionMultiplier;

  // Visual trail effect
  createSpeedTrail(beyblade.pos);
}
```

#### In Pit

```typescript
function updateBeybladeInPit(beyblade, pit, deltaTime) {
  // Lock position to pit center (with small orbit)
  const orbitRadius = 0.5;
  const orbitSpeed = 2; // radians per second
  beyblade.pitOrbitAngle =
    (beyblade.pitOrbitAngle || 0) + orbitSpeed * deltaTime;

  beyblade.pos = {
    x: pit.x + Math.cos(beyblade.pitOrbitAngle) * orbitRadius,
    y: pit.y + Math.sin(beyblade.pitOrbitAngle) * orbitRadius,
  };

  // Take damage
  const damageAmount =
    ((beyblade.stamina * pit.damagePerSecond) / 100) * deltaTime;
  beyblade.stamina -= damageAmount;

  // Escape check
  if (Math.random() < pit.escapeChance * deltaTime) {
    // Escaped!
    beyblade.trappedInPit = false;

    // Launch out in random direction
    const escapeAngle = Math.random() * Math.PI * 2;
    beyblade.velocity = {
      x: Math.cos(escapeAngle) * 10,
      y: Math.sin(escapeAngle) * 10,
    };

    playEscapeAnimation(beyblade.pos);
  }

  // Check for knockout
  if (beyblade.stamina <= 0) {
    knockoutBeyblade(beyblade, "pit");
  }
}
```

## Next Steps

### Immediate (Phase 1)

1. ✅ Create type definitions
2. ✅ Create arena configurator UI
3. ⏳ Create arena renderer component
4. ⏳ Implement basic collision system
5. ⏳ Add loop physics

### Short Term (Phase 2)

6. ⏳ Implement water physics
7. ⏳ Implement pit mechanics
8. ⏳ Add obstacle collisions
9. ⏳ Create animation system
10. ⏳ Add theme backgrounds

### Medium Term (Phase 3)

11. ⏳ Implement laser guns
12. ⏳ Add goal objects
13. ⏳ Create AI system
14. ⏳ Add game modes
15. ⏳ Performance optimization

### Long Term (Phase 4)

16. ⏳ Server-side rendering
17. ⏳ Multiplayer support
18. ⏳ Replay system
19. ⏳ Leaderboards
20. ⏳ Custom theme editor

## File Structure

```
src/
├── types/
│   ├── arenaConfig.ts          ✅ Arena configuration types
│   └── beybladeStats.ts        ✅ Beyblade stats (updated)
├── components/
│   ├── admin/
│   │   ├── ArenaConfigurator.tsx  ✅ Arena editor UI
│   │   └── MultiStepBeybladeEditor.tsx ✅ Beyblade editor
│   └── game/
│       ├── ArenaRenderer.tsx      ⏳ Renders configured arena
│       ├── BeybladeSprite.tsx     ⏳ Renders beyblade
│       ├── PhysicsEngine.tsx      ⏳ Physics calculations
│       └── GameManager.tsx        ⏳ Game state management
├── hooks/
│   ├── useArenaPhysics.ts      ⏳ Physics hook
│   └── useGameState.ts         ⏳ Game state hook
├── utils/
│   ├── collision.ts            ⏳ Collision detection
│   ├── physics.ts              ⏳ Physics helpers
│   └── rendering.ts            ⏳ Rendering utilities
└── app/
    ├── admin/
    │   └── arena/
    │       └── page.tsx           ⏳ Arena management page
    └── game/
        └── [arenaId]/
            └── page.tsx           ⏳ Game play page
```

## Testing Checklist

- [ ] Create circular arena with loops
- [ ] Create arena with obstacles
- [ ] Test water physics (slow + drain)
- [ ] Test pit trap mechanics
- [ ] Test laser gun targeting
- [ ] Test goal destruction
- [ ] Test all arena shapes
- [ ] Test all themes
- [ ] Test wall collisions (spikes/springs)
- [ ] Test exit boundaries
- [ ] Performance test with max objects
- [ ] Mobile responsiveness
- [ ] AI behavior
- [ ] Multiplayer sync

## Configuration Examples

### Beginner Arena

- Simple circle
- 2 loops
- No hazards
- Walls without spikes
- No exits (can't lose by exit)

### Intermediate Arena

- Octagon shape
- 3 loops
- 5-10 obstacles
- Water at center
- 2 exits
- Walls with springs

### Advanced Arena

- Star shape
- 4 loops
- 15-20 obstacles
- Multiple pits
- Water loop
- 2 laser guns
- 4 exits
- Walls with spikes and springs

### Challenge Arena

- Oval shape
- 5 loops
- 30 obstacles
- Central water + 3 pits
- 4 laser guns
- 10 goal objects
- 6 exits
- Maximum wall damage

This system provides infinite arena variety and strategic depth!
