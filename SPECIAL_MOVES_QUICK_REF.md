# Special Move Flags - Quick Reference

## All Available Flags (50+)

### Basic Movement & Control

| Flag         | Type    | Effect                  | Example             |
| ------------ | ------- | ----------------------- | ------------------- |
| `speedBoost` | number  | Speed multiplier        | `2.0` = 2x speed    |
| `cannotMove` | boolean | Freezes movement        | `true` = rooted     |
| `phasing`    | boolean | Pass through collisions | `true` = ghost mode |

### Defense

| Flag                | Type         | Effect                 | Example               |
| ------------------- | ------------ | ---------------------- | --------------------- |
| `damageReduction`   | number (0-1) | Reduce incoming damage | `0.8` = 80% reduction |
| `damageImmune`      | boolean      | Full damage immunity   | `true` = invincible   |
| `immuneToKnockback` | boolean      | Can't be pushed        | `true` = unmovable    |
| `reflectDamage`     | number (0-1) | Reflect damage back    | `0.5` = reflect 50%   |

### Offense

| Flag                  | Type    | Effect               | Example             |
| --------------------- | ------- | -------------------- | ------------------- |
| `damageMultiplier`    | number  | Damage amplification | `2.5` = 2.5x damage |
| `spinStealMultiplier` | number  | Spin steal boost     | `2.0` = 2x steal    |
| `counterAttack`       | boolean | Auto counter on hit  | `true` = counter    |

### Visual & Size

| Flag               | Type   | Effect      | Example            |
| ------------------ | ------ | ----------- | ------------------ |
| `radiusMultiplier` | number | Hitbox size | `1.5` = 50% larger |
| `visualScale`      | number | Visual size | `2.0` = 2x bigger  |

### Special Actions

| Flag          | Type    | Effect            | Example            |
| ------------- | ------- | ----------------- | ------------------ |
| `performLoop` | boolean | Trigger loop move | `true` = loop      |
| `healSpin`    | number  | Instant healing   | `20` = heal 20     |
| `gravityPull` | number  | Pull radius       | `200` = pull 200px |
| `pushAway`    | number  | Push radius       | `150` = push 150px |

### Complex Types

#### Berserk Mode

```typescript
berserkMode: {
  enabled: boolean,
  damageBoost: number,      // Damage multiplier
  speedBoost: number,       // Speed multiplier
  defenseReduction: number, // Take MORE damage
  visualIntensity: number   // Effect intensity
}
```

#### Phantom Mode

```typescript
phantomMode: {
  enabled: boolean,
  opacity: number,          // 0.0-1.0
  phaseThrough: boolean,    // Pass through collisions
  teleportOnHit: boolean    // Teleport when hit
}
```

#### Shield Dome

```typescript
shieldDome: {
  enabled: boolean,
  absorbDamage: boolean,    // Full immunity
  reflectPercentage: number,// 0-1, damage reflected
  pushRadius: number,       // Push enemies away
  healPerSecond: number     // Healing over time
}
```

#### Vortex Mode

```typescript
vortexMode: {
  enabled: boolean,
  pullRadius: number,       // Gravity range
  spinStealRate: number,    // Spin stolen/sec
  healFromSteal: boolean,   // Convert steal to heal
  slowOpponents: number     // Speed reduction (0.5 = 50% slower)
}
```

#### Rush Attack

```typescript
rushAttack: {
  enabled: boolean,
  dashCount: number,        // Number of dashes
  dashSpeed: number,        // Speed per dash
  damagePerDash: number,    // Damage per hit
  trailEffect: boolean      // Visual trail
}
```

#### Explosion

```typescript
explosion: {
  enabled: boolean,
  explosionRadius: number,  // Damage area
  explosionDamage: number,  // Damage amount
  knockbackForce: number,   // Push force
  selfDamage?: number       // Recoil (optional)
}
```

#### Magnet Mode

```typescript
magnetMode: {
  enabled: boolean,
  attractRadius: number,    // Effect range
  attractOpponents: boolean,// Pull enemies
  repelOpponents: boolean,  // Push enemies
  force: number             // Force strength
}
```

## Handler Functions

### Activation (One-time)

```typescript
applySpecialMoveEffects(beyblade, flags);
```

Applies: speed, phasing, size, loops, berserk, phantom, shield

### Continuous (Every Frame)

```typescript
applyContinuousEffects(beyblade, opponents, deltaTime);
```

Applies: healing, vortex, shield healing, time-based effects

### Collision (On Hit)

```typescript
calculateDamageWithSpecialMoves(attacker, defender, baseDamage);
calculateReflectedDamage(defender, incomingDamage);
calculateSpinSteal(attacker, defender, baseSpinSteal);
isImmuneToKnockback(beybladeId);
handlePhantomTeleport(beyblade, arenaRadius);
```

### Proximity (Area Effects)

```typescript
getSpecialMoveForces(beybladeId, targetPos, beybladePos);
applyVortexSpinSteal(beyblade, opponents, deltaTime);
getMagnetForce(beyblade, opponent);
```

### Special Actions

```typescript
triggerExplosion(beyblade, opponents);
executeRushAttack(beyblade, targetPosition);
shouldCounterAttack(beybladeId);
```

### Utility

```typescript
isPhasing(beybladeId);
cannotMove(beybladeId);
hasActiveSpecialMove(beybladeId);
getActiveSpecialMove(beybladeId);
```

## Template Examples

### Speed Demon

```typescript
{
  speedBoost: 2.5,
  damageMultiplier: 1.5,
  radiusMultiplier: 1.2,
  duration: 6,
  cooldown: 15
}
```

### Tank

```typescript
{
  damageReduction: 0.9,
  immuneToKnockback: true,
  healSpin: 40,
  reflectDamage: 0.4,
  duration: 12,
  cooldown: 25
}
```

### Vampire

```typescript
{
  spinStealMultiplier: 3.0,
  healSpin: 25,
  vortexMode: {
    enabled: true,
    pullRadius: 200,
    spinStealRate: 12,
    healFromSteal: true
  },
  duration: 10,
  cooldown: 20
}
```

### Assassin

```typescript
{
  phantomMode: {
    enabled: true,
    opacity: 0.3,
    phaseThrough: true,
    teleportOnHit: true
  },
  speedBoost: 2.0,
  damageMultiplier: 2.5,
  duration: 5,
  cooldown: 25
}
```

### Berserker

```typescript
{
  berserkMode: {
    enabled: true,
    damageBoost: 2.5,
    speedBoost: 1.8,
    defenseReduction: 0.6,
    visualIntensity: 3.0
  },
  duration: 8,
  cooldown: 30
}
```

### Black Hole

```typescript
{
  vortexMode: {
    enabled: true,
    pullRadius: 300,
    spinStealRate: 15,
    healFromSteal: true,
    slowOpponents: 0.5
  },
  magnetMode: {
    enabled: true,
    attractRadius: 300,
    attractOpponents: true,
    force: 180
  },
  duration: 12,
  cooldown: 35
}
```

### Nuke

```typescript
{
  explosion: {
    enabled: true,
    explosionRadius: 350,
    explosionDamage: 50,
    knockbackForce: 400,
    selfDamage: 15
  },
  duration: 0.5,
  cooldown: 40
}
```

### Lightning Strike

```typescript
{
  rushAttack: {
    enabled: true,
    dashCount: 6,
    dashSpeed: 850,
    damagePerDash: 10,
    trailEffect: true
  },
  speedBoost: 2.0,
  duration: 3,
  cooldown: 20
}
```

## Combining Flags

You can combine ANY flags for creative effects:

### Vampire Berserker

```typescript
{
  berserkMode: { enabled: true, damageBoost: 2.0, speedBoost: 1.6 },
  spinStealMultiplier: 2.5,
  healSpin: 20,
  vortexMode: {
    enabled: true,
    pullRadius: 180,
    spinStealRate: 10,
    healFromSteal: true
  }
}
```

### Phantom Tank

```typescript
{
  phantomMode: { enabled: true, opacity: 0.4, phaseThrough: true },
  shieldDome: {
    enabled: true,
    absorbDamage: true,
    healPerSecond: 8
  },
  damageImmune: true
}
```

### Explosive Rush

```typescript
{
  rushAttack: {
    enabled: true,
    dashCount: 5,
    dashSpeed: 800,
    damagePerDash: 8
  },
  explosion: {
    enabled: true,
    explosionRadius: 200,
    explosionDamage: 30,
    knockbackForce: 250
  }
}
```

## Power Costs

Standard power costs (0-25 range):

- **Light moves**: 10 power (dodge, quick boost)
- **Medium moves**: 15 power (heavy attack)
- **Ultimate moves**: 25 power (special cinematic moves)

Adjust `powerCost` in special move definition based on strength.

## See Also

- `COMPREHENSIVE_SPECIAL_MOVES.md` - Full documentation
- `beybladeStats.ts` - Complete type definitions
- `specialMovesManager.ts` - Implementation
