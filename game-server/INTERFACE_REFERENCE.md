# Quick Reference: Updated Interfaces

## Beyblade Schema

```typescript
class Beyblade extends Schema {
  // Identity
  @type("string") id: string;
  @type("string") userId: string;
  @type("string") username: string;
  @type("string") beybladeId: string;
  @type("boolean") isAI: boolean;

  // Physics
  @type("number") x: number;
  @type("number") y: number;
  @type("number") rotation: number;
  @type("number") velocityX: number;
  @type("number") velocityY: number;
  @type("number") angularVelocity: number;

  // Base Stats
  @type("string") type: string; // attack, defense, stamina, balanced
  @type("string") spinDirection: string; // left, right
  @type("number") mass: number; // grams
  @type("number") radius: number; // cm (4cm standard)
  @type("number") actualSize: number; // pixels (radius * 24)

  // Type Distribution (from BeybladeStats)
  @type("number") attackPoints: number; // 0-150
  @type("number") defensePoints: number; // 0-150
  @type("number") staminaPoints: number; // 0-150

  // Calculated Combat Stats
  @type("number") damageMultiplier: number; // 1.0 - 2.5x
  @type("number") damageTaken: number; // 1.0 - 0.5x
  @type("number") knockbackDistance: number; // 10 - 7.5 units
  @type("number") spinStealFactor: number; // 0.1 - 0.42
  @type("number") spinDecayRate: number; // 10 - 8 per second
  @type("number") speedBonus: number; // 1.0 - 2.5x
  @type("number") invulnerabilityChance: number; // 0.1 - 0.2

  // Dynamic Combat Values
  @type("number") health: number; // 0-100
  @type("number") stamina: number; // 0-maxStamina
  @type("number") maxStamina: number; // 1000-2000
  @type("number") spin: number; // 0-maxSpin
  @type("number") maxSpin: number; // 2000-3000

  // Combat Tracking
  @type("number") damageDealt: number;
  @type("number") damageReceived: number;
  @type("number") collisions: number;

  // State Flags
  @type("boolean") isActive: boolean;
  @type("boolean") isRingOut: boolean;
  @type("boolean") isInvulnerable: boolean;
  @type("number") invulnerabilityTimer: number;

  // Loop State
  @type("boolean") inLoop: boolean;
  @type("number") loopIndex: number;
  @type("number") loopEntryTime: number;
  @type("number") loopSpeedBoost: number;
  @type("number") loopSpinBoost: number;

  // Water State
  @type("boolean") inWater: boolean;
  @type("number") waterSpeedMultiplier: number;
  @type("number") waterSpinDrain: number;

  // Pit State
  @type("boolean") inPit: boolean;
  @type("string") currentPitId: string;
  @type("number") pitDamageRate: number;

  // Obstacle State
  @type("boolean") collidingWithObstacle: boolean;
  @type("string") lastObstacleId: string;

  // Cooldowns
  @type("number") specialCooldown: number;
  @type("number") attackCooldown: number;

  // Special Move State
  @type("boolean") specialMoveActive: boolean;
  @type("number") specialMoveEndTime: number;
}
```

## Arena Schema

```typescript
class ArenaState extends Schema {
  // Basic Info
  @type("string") id: string;
  @type("string") name: string;
  @type("number") width: number; // em units (50em standard)
  @type("number") height: number; // em units
  @type("string") shape: string; // circle, rectangle, etc.
  @type("string") theme: string; // metrocity, forest, etc.
  @type("number") rotation: number; // 0-360 degrees

  // Physics
  @type("number") gravity: number;
  @type("number") airResistance: number;
  @type("number") surfaceFriction: number;

  // Wall Configuration
  @type("boolean") wallEnabled: boolean;
  @type("number") wallBaseDamage: number;
  @type("number") wallRecoilDistance: number;
  @type("boolean") wallHasSpikes: boolean;
  @type("number") wallSpikeDamageMultiplier: number;
  @type("boolean") wallHasSprings: boolean;
  @type("number") wallSpringRecoilMultiplier: number;

  // Feature Counts (for UI display)
  @type("number") loopCount: number;
  @type("number") exitCount: number;
  @type("number") obstacleCount: number;
  @type("number") pitCount: number;
  @type("number") laserGunCount: number;
  @type("boolean") hasWaterBody: boolean;
}
```

## PhysicsEngine Methods

### Core Methods

```typescript
// Setup
setArenaConfig(config: ArenaConfig): void
createBeyblade(id, x, y, radiusCm, mass, stats?): Matter.Body
createObstacles(obstacles: ObstacleConfig[]): void
createCircularArena(centerX, centerY, radius): void
createRectangularArena(width, height): void

// Physics Control
applyForce(id, forceX, forceY): void
setAngularVelocity(id, velocity): void
update(): void
getBodyState(id): { x, y, rotation, velocityX, velocityY, angularVelocity } | null

// Collision Detection
checkBeybladeCollision(id1, id2): CollisionResult | null
calculateCollisionDamage(collision, beyblade1, beyblade2): {
  damage1, damage2, spinSteal1, spinSteal2
}
checkLoopCollision(beybladeId, loops): { inLoop, loopIndex, loopConfig }
checkWaterCollision(beybladeId, waterBody): boolean
checkPitCollision(beybladeId, pits): PitConfig | null
checkObstacleCollision(beybladeId): { colliding, obstacleId, damage }

// Arena Effects
applyLoopBoost(beybladeId, speedBoost): void
applyWaterResistance(beybladeId, speedMultiplier): void
applySurfaceFriction(beybladeId, frictionMultiplier): void
applyKnockback(beybladeId, direction, force): void

// Utilities
removeBeyblade(id): void
isOutOfBounds(id, arenaRadius, centerX, centerY): boolean
getAllBeybladeIds(): string[]
destroy(): void
```

## Key Constants

```typescript
// Resolution System
ARENA_RESOLUTION = 1080; // Base resolution
PIXELS_PER_CM = 24; // 1080 / 45
PIXELS_PER_EM = 16; // Standard em to pixel

// Beyblade Sizes
MIN_RADIUS_CM = 1.5;    // 36px
STANDARD_RADIUS_CM = 4; // 96px
MAX_RADIUS_CM = 25;     // 600px

// Standard Sizes
MINI = 2.5cm (60px)
SMALL = 3.0cm (72px)
STANDARD = 4.0cm (96px)
LARGE = 5.0cm (120px)
XL = 7.5cm (180px)
```

## Stat Formulas

### Attack (0-150 points)

```
damageMultiplier = 1 + points * 0.01
speedBonus = 1 + points * 0.01

Example (150 points):
- Damage: 2.5x
- Speed: 2.5x
```

### Defense (0-150 points)

```
damageTaken = 1 - points * 0.00333
knockback = 10 * (1 - points * 0.00167)
invulnerability = 0.1 * (1 + points * 0.00667)

Example (150 points):
- Damage taken: 0.5x (50%)
- Knockback: 7.5 units
- Invuln chance: 20%
```

### Stamina (0-150 points)

```
maxStamina = 1000 * (1 + points * 0.01333)
spinSteal = 0.1 * (1 + points * 0.02667)
spinDecay = 10 * (1 - points * 0.00167)

Example (150 points):
- Max stamina: 2000
- Spin steal: 50%
- Decay: 7.5/sec
```

### Spin Steal Modifiers

```
Opposite spin: spinSteal * 1.5
Same spin: spinSteal * 0.5
```

## Event Messages

```typescript
// Client → Server
"input" - { moveLeft, moveRight, attack, specialMove, direction };
"action" - { type: "charge" | "dash" | "special" };

// Server → Client
"attack" - { playerId };
"special-move" - { playerId, type };
"obstacle-collision" - { playerId, damage };
"wall-collision" - { playerId, damage };
"ring-out" - { playerId };
"spin-out" - { playerId };
```

## Example Usage

### Check Collision and Apply Damage

```typescript
const collision = physics.checkBeybladeCollision(id1, id2);
if (collision) {
  const damage = physics.calculateCollisionDamage(
    collision,
    beyblade1,
    beyblade2
  );

  beyblade1.health -= damage.damage1;
  beyblade2.health -= damage.damage2;

  beyblade1.spin += damage.spinSteal1;
  beyblade2.spin += damage.spinSteal2;
}
```

### Check Loop Entry

```typescript
const loopCheck = physics.checkLoopCollision(beybladeId, arena.loops);
if (loopCheck.inLoop && !beyblade.inLoop) {
  beyblade.inLoop = true;
  beyblade.loopSpeedBoost = loopCheck.loopConfig.speedBoost;
  physics.applyLoopBoost(beybladeId, loopCheck.loopConfig.speedBoost);
}
```

### Check Water Effects

```typescript
const inWater = physics.checkWaterCollision(beybladeId, arena.waterBody);
if (inWater) {
  physics.applyWaterResistance(beybladeId, waterBody.speedMultiplier);
  beyblade.spin -= waterBody.spinDrainRate * deltaTime;
}
```

---

**Tip**: All units are converted at the physics engine level:

- Beyblade radius: cm → pixels (× 24)
- Arena features: em → pixels (× 16)
- Formulas use the base values from database
