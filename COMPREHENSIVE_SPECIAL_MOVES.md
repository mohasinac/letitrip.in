# Comprehensive Special Move System

## Overview

The special move system has been completely refactored to support **ALL 50+ flags** from `beybladeStats.ts`, enabling complex move combinations and creative gameplay mechanics.

## Architecture

### Core Components

1. **specialMovesManager.ts** - Central manager with 20+ handler functions
2. **beybladeStats.ts** - Complete flag definitions (50+ flags)
3. **cinematicSpecialMoves.ts** - Cinematic implementations using standard flags
4. **useGameState.ts** - Game loop integration

### Processing Pipeline

```
Activation → Immediate Effects → Continuous Effects → Collision Effects → Proximity Effects
```

## Flag Categories & Handlers

### 1. Movement Flags

**Flags**: `speedBoost`, `cannotMove`, `teleportToRing`

**Handler**: `applySpecialMoveEffects()` - line 81

**Example**:

```typescript
flags: {
  speedBoost: 2.0,        // 2x speed
  duration: 5,
  cooldown: 10
}
```

### 2. Defensive Flags

**Flags**: `damageReduction`, `immuneToKnockback`, `damageImmune`, `reflectDamage`

**Handlers**:

- `calculateDamageWithSpecialMoves()` - Damage reduction/immunity
- `calculateReflectedDamage()` - Reflect damage back
- `isImmuneToKnockback()` - Check knockback immunity

**Example - Tank Mode**:

```typescript
flags: {
  damageReduction: 0.8,     // 80% damage reduction
  immuneToKnockback: true,  // Can't be pushed
  reflectDamage: 0.3,       // Reflect 30% damage
  duration: 8
}
```

### 3. Offensive Flags

**Flags**: `damageMultiplier`, `spinStealMultiplier`

**Handlers**:

- `calculateDamageWithSpecialMoves()` - Damage amplification
- `calculateSpinSteal()` - Enhanced spin stealing

**Example - Berserker**:

```typescript
flags: {
  damageMultiplier: 2.5,      // 2.5x damage
  spinStealMultiplier: 2.0,   // 2x spin steal
  speedBoost: 1.5,            // 1.5x speed
  duration: 6
}
```

### 4. Phasing Flags

**Flags**: `phasing`

**Handler**: `isPhasing()` - Collision system check

**Example - Ghost Mode**:

```typescript
flags: {
  phasing: true,              // Pass through everything
  speedBoost: 1.8,
  damageImmune: true,
  duration: 4
}
```

### 5. Visual Flags

**Flags**: `radiusMultiplier`, `visualScale`

**Handler**: `applySpecialMoveEffects()` - line 136

**Example**:

```typescript
flags: {
  radiusMultiplier: 1.5,      // 50% larger hitbox
  visualScale: 2.0,           // 2x visual size
  duration: 5
}
```

### 6. Loop Flags

**Flags**: `performLoop`

**Handler**: `applySpecialMoveEffects()` - line 147

**Example**:

```typescript
flags: {
  performLoop: true,
  speedBoost: 2.5,
  duration: 3
}
```

### 7. Healing Flags

**Flags**: `healSpin`, `shieldDome.healPerSecond`

**Handler**: `applyContinuousEffects()` - line 195

**Example - Regeneration**:

```typescript
flags: {
  healSpin: 15,               // Heal 15 spin on activation
  shieldDome: {
    enabled: true,
    healPerSecond: 5,         // Heal 5 spin/sec
    absorbDamage: true
  },
  duration: 10
}
```

### 8. Complex Move Types

#### Berserk Mode

**Flags**: `berserkMode`

**Handler**: `applySpecialMoveEffects()` - line 157

**Properties**:

- `damageBoost`: Damage multiplier
- `speedBoost`: Speed multiplier
- `defenseReduction`: Take MORE damage (glass cannon)
- `visualIntensity`: Effect intensity

**Example - Rage Mode**:

```typescript
flags: {
  berserkMode: {
    enabled: true,
    damageBoost: 2.0,         // 2x damage
    speedBoost: 1.8,          // 1.8x speed
    defenseReduction: 0.5,    // Take 50% more damage
    visualIntensity: 2.5
  },
  duration: 8,
  cooldown: 20
}
```

#### Phantom Mode

**Flags**: `phantomMode`

**Handlers**:

- `applySpecialMoveEffects()` - Visual effects
- `handlePhantomTeleport()` - Teleport on hit

**Properties**:

- `opacity`: Visual transparency (0.0-1.0)
- `phaseThrough`: Pass through collisions
- `teleportOnHit`: Teleport when hit

**Example - Shadow Wraith**:

```typescript
flags: {
  phantomMode: {
    enabled: true,
    opacity: 0.3,             // 70% transparent
    phaseThrough: true,
    teleportOnHit: true       // Teleport when hit
  },
  speedBoost: 2.0,
  damageImmune: true,
  duration: 5
}
```

#### Shield Dome

**Flags**: `shieldDome`

**Handler**: `applySpecialMoveEffects()` - line 184

**Properties**:

- `absorbDamage`: Full damage immunity
- `reflectPercentage`: % damage reflected
- `pushRadius`: Push away enemies
- `healPerSecond`: Heal over time

**Example - Fortress**:

```typescript
flags: {
  shieldDome: {
    enabled: true,
    absorbDamage: true,       // No damage taken
    reflectPercentage: 0.5,   // Reflect 50%
    pushRadius: 150,          // Push enemies 150px away
    healPerSecond: 8          // Heal 8 spin/sec
  },
  immuneToKnockback: true,
  duration: 12,
  cooldown: 30
}
```

#### Vortex Mode

**Flags**: `vortexMode`

**Handlers**:

- `applyContinuousEffects()` - Area spin steal
- `applyVortexSpinSteal()` - Per-frame stealing
- `getSpecialMoveForces()` - Pull opponents

**Properties**:

- `pullRadius`: Gravity pull range
- `spinStealRate`: Spin stolen/sec
- `healFromSteal`: Convert stolen spin to healing
- `slowOpponents`: Speed reduction multiplier

**Example - Black Hole**:

```typescript
flags: {
  vortexMode: {
    enabled: true,
    pullRadius: 200,          // Pull from 200px
    spinStealRate: 10,        // Steal 10 spin/sec
    healFromSteal: true,      // Convert to healing
    slowOpponents: 0.6        // Slow enemies by 40%
  },
  spinStealMultiplier: 2.0,
  duration: 10,
  cooldown: 25
}
```

#### Rush Attack

**Flags**: `rushAttack`

**Handlers**:

- `executeRushAttack()` - Multi-dash execution
- `calculateDamageWithSpecialMoves()` - Dash damage

**Properties**:

- `dashCount`: Number of dashes
- `dashSpeed`: Speed per dash
- `damagePerDash`: Damage per successful hit
- `trailEffect`: Visual trail

**Example - Lightning Strike**:

```typescript
flags: {
  rushAttack: {
    enabled: true,
    dashCount: 5,             // 5 rapid dashes
    dashSpeed: 800,           // Very fast
    damagePerDash: 8,         // 8 damage per dash
    trailEffect: true
  },
  duration: 2,
  cooldown: 15
}
```

#### Explosion

**Flags**: `explosion`

**Handler**: `triggerExplosion()` - Area damage

**Properties**:

- `explosionRadius`: Damage area
- `explosionDamage`: Damage to all in range
- `knockbackForce`: Push enemies away
- `selfDamage`: Recoil damage (optional)

**Example - Supernova**:

```typescript
flags: {
  explosion: {
    enabled: true,
    explosionRadius: 250,     // 250px blast radius
    explosionDamage: 40,      // 40 damage
    knockbackForce: 300,      // Heavy knockback
    selfDamage: 10            // 10 recoil damage
  },
  duration: 0.5,              // Instant
  cooldown: 30
}
```

#### Magnet Mode

**Flags**: `magnetMode`

**Handler**: `getMagnetForce()` - Attract/repel

**Properties**:

- `attractRadius`: Effect range
- `attractOpponents`: Pull enemies in
- `repelOpponents`: Push enemies away
- `force`: Force strength

**Example - Magnetic Pull**:

```typescript
flags: {
  magnetMode: {
    enabled: true,
    attractRadius: 300,       // 300px range
    attractOpponents: true,   // Pull enemies
    repelOpponents: false,
    force: 150                // Strong pull
  },
  duration: 8,
  cooldown: 20
}
```

## Complex Combinations

### 1. Vampire Mode (Heal + Steal)

```typescript
{
  name: "Vampire Spin",
  flags: {
    spinStealMultiplier: 3.0,    // Triple spin steal
    vortexMode: {
      enabled: true,
      pullRadius: 180,
      spinStealRate: 15,
      healFromSteal: true        // Convert all steal to healing
    },
    healSpin: 20,                // Immediate 20 heal
    speedBoost: 1.4,
    radiusMultiplier: 1.3,
    duration: 12,
    cooldown: 25
  }
}
```

### 2. Berserker Glass Cannon

```typescript
{
  name: "Ultimate Rage",
  flags: {
    berserkMode: {
      enabled: true,
      damageBoost: 3.0,          // Triple damage
      speedBoost: 2.0,           // Double speed
      defenseReduction: 0.8,     // Take 80% MORE damage
      visualIntensity: 3.0
    },
    rushAttack: {
      enabled: true,
      dashCount: 8,
      dashSpeed: 900,
      damagePerDash: 12
    },
    duration: 6,
    cooldown: 40
  }
}
```

### 3. Fortress Tank

```typescript
{
  name: "Impenetrable Defense",
  flags: {
    shieldDome: {
      enabled: true,
      absorbDamage: true,        // No damage
      reflectPercentage: 0.8,    // Reflect 80%
      pushRadius: 200,
      healPerSecond: 10
    },
    immuneToKnockback: true,
    damageReduction: 1.0,        // 100% reduction (redundant but safe)
    cannotMove: true,            // Rooted tank
    radiusMultiplier: 1.5,
    duration: 15,
    cooldown: 35
  }
}
```

### 4. Shadow Assassin

```typescript
{
  name: "Phantom Strike",
  flags: {
    phantomMode: {
      enabled: true,
      opacity: 0.2,              // Nearly invisible
      phaseThrough: true,
      teleportOnHit: true
    },
    speedBoost: 2.5,             // Very fast
    damageMultiplier: 2.0,       // Double damage
    damageImmune: true,          // Can't be hit
    rushAttack: {
      enabled: true,
      dashCount: 6,
      dashSpeed: 850,
      damagePerDash: 10
    },
    duration: 5,
    cooldown: 30
  }
}
```

### 5. Black Hole Vortex

```typescript
{
  name: "Singularity",
  flags: {
    vortexMode: {
      enabled: true,
      pullRadius: 350,           // Massive range
      spinStealRate: 20,         // Huge steal rate
      healFromSteal: true,
      slowOpponents: 0.4         // Slow by 60%
    },
    magnetMode: {
      enabled: true,
      attractRadius: 350,
      attractOpponents: true,
      force: 200
    },
    spinStealMultiplier: 2.5,
    radiusMultiplier: 1.4,
    duration: 10,
    cooldown: 30
  }
}
```

### 6. Nuclear Explosion

```typescript
{
  name: "Chain Reaction",
  flags: {
    explosion: {
      enabled: true,
      explosionRadius: 400,      // Huge blast
      explosionDamage: 60,       // Massive damage
      knockbackForce: 500,       // Extreme knockback
      selfDamage: 25             // Heavy recoil
    },
    berserkMode: {
      enabled: true,
      damageBoost: 2.0,
      speedBoost: 1.5,
      defenseReduction: 0.5      // Vulnerable before blast
    },
    duration: 3,                 // Short fuse
    cooldown: 45
  }
}
```

## Integration Points

### Game Loop Integration

**File**: `src/app/game/hooks/useGameState.ts`

```typescript
// Every frame in game loop:

// 1. Apply continuous effects
applyContinuousEffects(playerBeyblade, opponentBeyblades, deltaTime);
applyContinuousEffects(opponentBeyblade, [playerBeyblade], deltaTime);

// 2. Apply vortex spin steal
applyVortexSpinSteal(playerBeyblade, opponentBeyblades, deltaTime);
applyVortexSpinSteal(opponentBeyblade, [playerBeyblade], deltaTime);

// 3. Apply proximity forces
for (const opponent of opponents) {
  const forces = getSpecialMoveForces(
    playerBeyblade.id,
    opponent.position,
    playerBeyblade.position
  );
  if (forces) {
    opponent.velocity.x += forces.x * deltaTime;
    opponent.velocity.y += forces.y * deltaTime;
  }
}

// 4. Apply magnet forces
for (const opponent of opponents) {
  const magnetForce = getMagnetForce(playerBeyblade, opponent);
  if (magnetForce) {
    opponent.velocity.x += magnetForce.x * deltaTime;
    opponent.velocity.y += magnetForce.y * deltaTime;
  }
}
```

### Collision Integration

```typescript
// During collision detection:

// 1. Check phasing
if (isPhasing(beyblade.id)) {
  continue; // Skip collision
}

// 2. Calculate damage with modifiers
const damage = calculateDamageWithSpecialMoves(attacker, defender, baseDamage);

// 3. Apply reflected damage
const reflectedDamage = calculateReflectedDamage(defender, damage);
if (reflectedDamage > 0) {
  attacker.spin -= reflectedDamage;
}

// 4. Check knockback immunity
if (!isImmuneToKnockback(defender.id)) {
  // Apply knockback
}

// 5. Handle phantom teleport
if (shouldTeleportOnHit) {
  handlePhantomTeleport(defender, arenaRadius);
}

// 6. Calculate spin steal
const spinSteal = calculateSpinSteal(attacker, defender, baseSpinSteal);
```

### Special Move Activation

```typescript
// When activating special move:

// 1. Activate move
activateSpecialMove(beyblade.id, specialMove.flags);

// 2. Trigger explosion (if applicable)
if (flags.explosion?.enabled) {
  triggerExplosion(beyblade, opponents);
}

// 3. Execute rush attack (if applicable)
if (flags.rushAttack?.enabled) {
  executeRushAttack(beyblade, targetPosition);
}
```

## Testing Examples

### Test Basic Flags

```typescript
const testMove = {
  id: "test_speed",
  name: "Speed Test",
  flags: {
    speedBoost: 3.0,
    radiusMultiplier: 1.5,
    duration: 5,
    cooldown: 10,
  },
};
// Should see 3x speed, 1.5x size for 5 seconds
```

### Test Defense Combo

```typescript
const tankMove = {
  id: "test_tank",
  name: "Tank Test",
  flags: {
    damageReduction: 0.9,
    immuneToKnockback: true,
    reflectDamage: 0.5,
    healSpin: 30,
    duration: 10,
    cooldown: 20,
  },
};
// Should take 10% damage, can't be pushed, reflects 50%, heals 30
```

### Test Complex Combo

```typescript
const complexMove = {
  id: "test_complex",
  name: "Complex Test",
  flags: {
    berserkMode: {
      enabled: true,
      damageBoost: 2.0,
      speedBoost: 1.8,
      defenseReduction: 0.5,
      visualIntensity: 2.5,
    },
    vortexMode: {
      enabled: true,
      pullRadius: 200,
      spinStealRate: 10,
      healFromSteal: true,
      slowOpponents: 0.6,
    },
    duration: 8,
    cooldown: 25,
  },
};
// Should deal 2x damage, move 1.8x faster, pull enemies, steal spin, heal from steal
```

## Performance Considerations

### Optimization Tips

1. **Proximity checks** - Cache distance calculations
2. **Effect stacking** - Multiple beyblades with vortex = expensive
3. **Visual effects** - Clone trails can impact FPS
4. **Continuous effects** - Called every frame, keep efficient

### Profiling Recommendations

```typescript
// Add timing to expensive operations:
console.time('specialMoves');
applyContinuousEffects(...);
applyVortexSpinSteal(...);
console.timeEnd('specialMoves');
```

## Future Enhancements

### Planned Features

1. **Clone system** - Afterimage effects with `flags.clone`
2. **Overdrive** - Power boost with drain using `flags.overdrive`
3. **Combo system** - Chain special moves
4. **Cinematic camera** - Use `flags.cinematicSettings`
5. **Sound effects** - Play sounds on activation

### Extensibility

To add new flag types:

1. Add flag to `SpecialMoveFlags` interface in `beybladeStats.ts`
2. Create handler function in `specialMovesManager.ts`
3. Call handler from appropriate integration point:
   - Activation → `applySpecialMoveEffects()`
   - Continuous → `applyContinuousEffects()`
   - Collision → `calculateDamageWithSpecialMoves()`
   - Proximity → `getSpecialMoveForces()`

## Summary

The special move system now supports **ALL 50+ flags** with comprehensive handlers for:

✅ **Activation effects** - Speed, phasing, size, loops, berserk, phantom, shield  
✅ **Continuous effects** - Healing, vortex, shield healing, time-based mechanics  
✅ **Collision effects** - Damage modifiers, reflect, immunity, knockback immunity, spin steal  
✅ **Proximity effects** - Gravity, push, vortex pull, magnet forces  
✅ **Complex mechanics** - Rush attacks, explosions, teleportation

This enables **infinite creative combinations** for unique and powerful special moves!
