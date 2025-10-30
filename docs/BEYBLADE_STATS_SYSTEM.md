# Beyblade Stats System Documentation

## Overview

This document describes the comprehensive Beyblade stats system that makes each Beyblade unique with special moves, contact points, type distributions, and physics-based properties.

## System Architecture

### 1. **Beyblade Stats (`BeybladeStats`)**

Located in `/src/types/beybladeStats.ts`

Each Beyblade has the following properties:

#### Basic Properties

- **id**: Unique identifier (e.g., "dragoon-gt")
- **name**: Internal name
- **displayName**: User-friendly name (e.g., "Dragoon GT")
- **type**: One of `attack`, `defense`, `stamina`, or `balanced`
- **spinDirection**: `left` or `right`

#### Physical Properties

- **mass**: 10-30 kg, affects collision physics
- **radius**: 25-55 pixels, visual display size in 800x800 arena
- **actualSize**: Collision hitbox size
- **spinStealFactor**: 0-1, probability to steal spin on collision (e.g., 0.75 for Meteo with rubber)

#### Spin Properties

- **maxSpin**: Maximum spin value (typical: 2000-4000)
- **spinDecayRate**: Spin loss per second (typical: 3-8)

#### Type Distribution (320 points total, max 150 per stat)

```typescript
{
  attack: 0-150,   // Determines attack damage bonus (0-20%)
  defense: 0-150,  // Determines damage reduction (0-20%)
  stamina: 0-150,  // Determines spin power/decay (0-20%)
  total: 320       // Must always equal 320
}
```

**Type Bonuses Calculation:**

- Attack Multiplier: `1.0 + (attack / 150) * 0.2` (1.0 to 1.2x)
- Defense Multiplier: `1.0 - (defense / 150) * 0.2` (0.8 to 1.0x)
- Stamina Multiplier: `1.0 + (stamina / 150) * 0.2` (1.0 to 1.2x)

**Examples:**

- **Attack Type**: 120 attack, 90 defense, 110 stamina
- **Defense Type**: 90 attack, 140 defense, 90 stamina
- **Stamina Type**: 90 attack, 90 defense, 140 stamina
- **Balanced Type**: 110 attack, 110 defense, 100 stamina

### 2. **Point of Contact System**

Located in `/src/app/game/utils/enhancedCollision.ts`

Each Beyblade has multiple contact points (like blade edges):

```typescript
{
  angle: 0-360,           // Position in degrees
  damageMultiplier: 1.0-2.5, // Damage boost when this point hits
  width: 15-40            // Angular width of the contact zone
}
```

**How it works:**

1. On collision, calculate the angle of impact relative to each Beyblade's rotation
2. Check if the impact angle matches any contact point
3. Apply the damage multiplier if hit (visual indicator shows "PERFECT!" or "Good!")
4. Non-contact collisions use 1.0x multiplier

**Example - Valkyrie (Attack Type):**

- Blade at 0°: 2.1x damage (strongest)
- Blades at 120° and 240°: 1.7x damage
- Other angles: 1.0x damage (base collision)

### 3. **Special Moves System**

Located in `/src/app/game/utils/specialMovesManager.ts`

Each Beyblade has a unique special move with flags defining its behavior:

#### Special Move Flags

**Defensive Flags:**

- `damageReduction: 0-1` - Percentage of damage reduced (0.5 = 50% less damage)
- `immuneToKnockback: boolean` - Cannot be knocked back
- `damageImmune: boolean` - Takes 0 damage (like Spriggan's Counter Break)

**Offensive Flags:**

- `damageMultiplier: 1.0-2.5` - Damage boost during move
- `spinStealMultiplier: 1.0-3.0` - Spin steal effectiveness boost

**Movement Flags:**

- `performLoop: boolean` - Performs a stadium loop
- `counterAttack: boolean` - Counter-attacks after taking hit
- `speedBoost: 1.0-2.0` - Speed multiplier during move

**Special Mechanics:**

- `reflectDamage: 0-1` - Percentage of damage reflected back
- `healSpin: number` - Spin healed per second during move

**Timing:**

- `duration: number` - How long the move lasts (seconds)
- `cooldown: number` - Cooldown after move ends (seconds)

#### Special Move Examples

**1. Meteo - Absorb Mode (Stamina)**

```typescript
{
  powerCost: 18,
  flags: {
    spinStealMultiplier: 2.0,  // 2x spin steal
    healSpin: 15,              // Heal 15 spin/sec
    duration: 3,
    cooldown: 10
  }
}
```

_Effect: Rubber absorption mode increases spin steal by 2x and heals 15 spin per second for 3 seconds_

**2. Hells Hammer - Iron Fortress (Defense)**

```typescript
{
  powerCost: 20,
  flags: {
    damageReduction: 0.5,      // 50% damage reduction
    immuneToKnockback: true,   // Cannot be moved
    duration: 5,
    cooldown: 15
  }
}
```

_Effect: Becomes an immovable fortress taking 50% less damage for 5 seconds_

**3. Spriggan - Counter Break (Balanced)**

```typescript
{
  powerCost: 22,
  flags: {
    damageImmune: true,        // Takes 0 damage
    counterAttack: true,       // Auto counter-attack
    performLoop: true,         // Performs loop
    damageMultiplier: 1.8,     // 1.8x damage on counter
    duration: 2,
    cooldown: 12
  }
}
```

_Effect: After taking a hit, becomes invincible and performs a devastating loop counter-attack_

**4. Valkyrie - Victory Rush (Attack)**

```typescript
{
  powerCost: 25,             // Requires FULL power bar!
  flags: {
    damageMultiplier: 2.2,   // 2.2x damage (highest)
    speedBoost: 1.7,         // 1.7x speed
    duration: 2.5,
    cooldown: 15
  }
}
```

_Effect: Ultimate rush attack with extreme damage and speed_

### 4. **Collision Physics**

The enhanced collision system (`resolveEnhancedCollision`) calculates:

1. **Contact Point Multiplier**: Check if collision hit a contact point
2. **Type Bonuses**: Apply attack/defense modifiers from type distribution
3. **Mass-Based Physics**: Heavier Beyblades deal more damage
4. **Velocity**: Higher collision speed = more damage
5. **Special Move Modifiers**: Apply active special move effects
6. **Spin Steal**: Calculate spin transfer based on:
   - Spin steal factor
   - Rotation direction (opposite = 1.5x, same = 0.5x)
   - Special move spin steal multipliers
   - Cap at 30% of defender's spin

**Damage Formula:**

```
baseDamage = collisionForce * (opponentMass / totalMass) * 10
finalDamage = baseDamage
  * contactMultiplier
  * attackBonus
  * defenseBonus
  * specialMoveModifiers
  * chargeDashBonus
```

### 5. **Firebase Integration**

#### Database Structure

Collection: `beyblade_stats`

```typescript
{
  id: "dragoon-gt",
  name: "dragoon-gt",
  displayName: "Dragoon GT",
  type: "attack",
  spinDirection: "left",
  mass: 18,
  radius: 42,
  actualSize: 40,
  spinStealFactor: 0.35,
  maxSpin: 3200,
  spinDecayRate: 5,
  typeDistribution: { attack: 120, defense: 90, stamina: 110, total: 320 },
  pointsOfContact: [...],
  specialMove: {...},
  speed: 1.5,
  createdAt: "2025-10-30T...",
  updatedAt: "2025-10-30T...",
  createdBy: "system"
}
```

#### API Endpoints

**GET /api/beyblades**

- Query params: `?type=attack` or `?search=dragoon`
- Returns all Beyblade stats

**GET /api/beyblades/[id]**

- Returns specific Beyblade stats

**POST /api/beyblades/init**

- Initializes default Beyblade stats (doesn't overwrite existing)

### 6. **Admin Interface**

Access at: `/admin/beyblade-stats`

Features:

- View all Beyblades with full stats
- Filter by type (attack/defense/stamina/balanced)
- Search by name
- Initialize default data
- Visual stat displays with progress bars
- Special move information cards

### 7. **Visual Indicators**

Located in `/src/app/game/utils/visualIndicators.ts`

**Contact Point Arrows:**

- Show as colored arrows on Beyblade during attacks
- Color intensity based on damage multiplier
- Red = high damage, Yellow = medium damage

**Special Move Aura:**

- Purple glow for ultimate attacks
- Orange glow for heavy attacks
- Pulsing animation

**Hit Quality Indicators:**

- "PERFECT!" - Gold text for 1.8x+ contact hits
- "Good!" - Orange text for 1.4x+ contact hits
- "Hit" - White text for normal collisions

**Type Badges:**

- Small circular badge on Beyblade
- Color-coded: Red (Attack), Blue (Defense), Green (Stamina), Purple (Balanced)

## Usage Examples

### Loading Beyblade Stats in Game

```typescript
import { getBeybladeStats } from "@/constants/beybladeStatsData";
import { calculateTypeBonuses } from "@/types/beybladeStats";

const stats = getBeybladeStats("dragoon-gt");
if (stats) {
  const bonuses = calculateTypeBonuses(stats.typeDistribution);
  console.log(`Attack: ${bonuses.attackMultiplier}x`);
  console.log(`Defense: ${bonuses.defenseMultiplier}x`);
  console.log(`Stamina: ${bonuses.staminaMultiplier}x`);
}
```

### Activating Special Move

```typescript
import {
  activateSpecialMove,
  canActivateSpecialMove,
} from "@/app/game/utils/specialMovesManager";

const currentTime = Date.now();
const check = canActivateSpecialMove(beyblade, stats, currentTime);

if (check.canActivate) {
  const activeMove = activateSpecialMove(beyblade, stats, currentTime);
  console.log(`${stats.specialMove.name} activated!`);
} else {
  console.log(`Cannot activate: ${check.reason}`);
}
```

### Enhanced Collision with Point of Contact

```typescript
import {
  resolveEnhancedCollision,
  getContactHitQuality,
} from "@/app/game/utils/enhancedCollision";

const result = resolveEnhancedCollision(bey1, stats1, bey2, stats2);

console.log(`Collision Force: ${result.collisionForce}`);
console.log(`Bey1 Contact: ${result.bey1ContactMultiplier}x`);
console.log(`Bey2 Contact: ${result.bey2ContactMultiplier}x`);
console.log(`Bey1 Spin Steal: ${result.bey1SpinSteal}`);

const quality = getContactHitQuality(result.bey1ContactMultiplier);
// Returns: 'perfect' | 'good' | 'normal'
```

## Balancing Guidelines

### Attack Type

- High attack (120-135)
- Low defense (75-90)
- Medium stamina (105-115)
- **Playstyle**: Aggressive, high damage, risky

### Defense Type

- Low attack (80-95)
- High defense (130-150)
- Low stamina (75-95)
- **Playstyle**: Tank, absorbs damage, outlasts opponent

### Stamina Type

- Low attack (85-95)
- Low defense (85-95)
- High stamina (130-150)
- **Playstyle**: Endurance, survives longer, spin steal

### Balanced Type

- Medium all stats (100-115 each)
- **Playstyle**: Versatile, adaptable, no weaknesses

## Future Enhancements

1. **Custom Beyblade Creator**: Let users create custom Beyblades
2. **Combo System**: Chain multiple special moves
3. **Evolution System**: Upgrade Beyblades over time
4. **Team Battles**: 3v3 with stat synergies
5. **Tournament Mode**: Bracket system with stat tracking
6. **Leaderboards**: Track wins by Beyblade type/stats

## Technical Notes

- All stats are validated before saving to Firebase
- Type distribution must sum to exactly 320
- Special moves use a global registry for tracking
- Collision calculations run at 60 FPS
- Visual indicators are GPU-accelerated using Canvas
- Point of contact angles are relative to Beyblade rotation

---

**Last Updated**: October 30, 2025
**Version**: 1.0.0
