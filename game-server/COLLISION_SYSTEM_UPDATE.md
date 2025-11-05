# Collision System Update - Stadium and Arena Dynamics

## Overview

The game server has been updated to consider both **Beyblade stats** and **Arena dynamics** when calculating collisions and physics interactions.

## ✅ Completed Updates

### 1. Enhanced Beyblade Schema

**File**: `src/rooms/schema/GameState.ts`

Added comprehensive beyblade properties:

- **Type Distribution**: `attackPoints`, `defensePoints`, `staminaPoints`
- **Calculated Stats**: `damageMultiplier`, `damageTaken`, `knockbackDistance`, `spinStealFactor`, `spinDecayRate`
- **Combat Stats**: `spin`, `maxSpin` (separate from stamina)
- **Arena State**: Loop boost tracking, water effects, pit states, obstacle collision tracking
- **Special Moves**: Active state and end time tracking

### 2. Enhanced Arena Schema

**File**: `src/rooms/schema/GameState.ts`

Added arena properties:

- **Visual**: `theme`, `rotation`
- **Wall Configuration**: Damage, recoil, spikes, springs
- **Feature Counts**: Loops, exits, obstacles, pits, laser guns, water body

### 3. Advanced Physics Engine

**File**: `src/physics/PhysicsEngine.ts`

#### Resolution System Integration

- Uses **1 cm = 24 pixels** (at 1080p) for beyblade sizes
- Properly converts radius from cm to pixels using `PIXELS_PER_CM = 1080 / 45`
- Maintains accurate physics based on real beyblade dimensions

#### New Collision Detection Methods

**Beyblade-to-Beyblade Collisions**:

```typescript
checkBeybladeCollision(id1, id2): CollisionResult | null
calculateCollisionDamage(collision, beyblade1, beyblade2): {
  damage1, damage2, spinSteal1, spinSteal2
}
```

- Considers **points of contact** and damage multipliers
- Calculates **spin steal** based on spin direction (opposite = 1.5x, same = 0.5x)
- Applies **defense multipliers** and **invulnerability**
- Uses **contact angles** to determine which part of beyblade hit

**Arena Dynamic Checks**:

```typescript
checkLoopCollision(beybladeId, loops): { inLoop, loopIndex, loopConfig }
checkWaterCollision(beybladeId, waterBody): boolean
checkPitCollision(beybladeId, pits): PitConfig | null
checkObstacleCollision(beybladeId): { colliding, obstacleId, damage }
```

**Arena Effects**:

```typescript
applyLoopBoost(beybladeId, speedBoost): void
applyWaterResistance(beybladeId, speedMultiplier): void
applySurfaceFriction(beybladeId, frictionMultiplier): void
applyKnockback(beybladeId, direction, force): void
```

### 4. Enhanced Game Loop

**File**: `src/rooms/TryoutRoom.ts`

The game loop now:

#### Loads Full Beyblade Stats

- Calculates all stats from type distribution
- Uses proper resolution system (cm → pixels)
- Applies attack/defense/stamina bonuses correctly

**Attack Stats** (base _ (1 + points _ 0.01)):

- Damage Multiplier: 1.0x - 2.5x
- Speed Bonus: 1.0x - 2.5x

**Defense Stats**:

- Damage Taken: 1.0x - 0.5x (lower is better)
- Knockback: 10 - 7.5 units
- Invulnerability: 10% - 20%

**Stamina Stats**:

- Max Stamina: 1000 - 2000
- Spin Steal: 10% - 42%
- Spin Decay: 10 - 8 per second

#### Checks Arena Dynamics Every Frame

**Loop Detection**:

- Tracks when beyblade enters/exits loops
- Applies speed boost (`speedBoost` multiplier)
- Applies spin recovery (`spinBoost` per second)
- Maintains loop state

**Water Body Detection**:

- Slows movement (`speedMultiplier`)
- Drains spin (`spinDrainRate` per second)
- Applies water resistance

**Pit Detection**:

- Damages spin (`damagePerSecond` as % of current spin)
- Gives escape chance (`escapeChance` per second)
- Applies upward force on escape

**Obstacle Collision**:

- Applies damage on hit
- Calculates knockback based on beyblade stats
- Prevents repeated damage from same obstacle

**Wall Collision**:

- Checks distance from arena center
- Applies wall damage (with spike multiplier if enabled)
- Bounces beyblade back (with spring multiplier if enabled)
- Considers loop speed boost in recoil

#### Tracks Combat Stats

- `spin` decreases based on `spinDecayRate`
- `stamina` decreases based on angular velocity
- Beyblade stops when `spin` reaches 0
- All damage is tracked in `damageReceived`

### 5. Enhanced Arena Loading

**File**: `src/rooms/TryoutRoom.ts` - `onCreate()`

Now loads and stores:

- Full arena configuration
- Wall settings (spikes, springs, damage)
- Creates obstacles in physics engine
- Properly converts em units to pixels (em \* 16)

## 🎮 How It Works

### Collision Flow

1. **Physics Engine** detects collision between bodies
2. **Calculate Contact Angles** - Where on each beyblade did they hit?
3. **Check Points of Contact** - Was it a blade edge (2.0x) or side (1.0x)?
4. **Apply Damage Multipliers** - Attack beyblade does more damage
5. **Apply Defense Multipliers** - Defense beyblade takes less damage
6. **Calculate Spin Steal** - Opposite spin = more steal, same spin = less
7. **Check Invulnerability** - Chance to dodge damage completely
8. **Apply Knockback** - Based on defense stat and speed

### Arena Dynamics Flow

Every frame (60 FPS):

1. **Update Physics** - Matter.js handles movement
2. **Check Loop** - Apply speed/spin boosts
3. **Check Water** - Apply speed reduction and spin drain
4. **Check Pits** - Apply damage with escape chance
5. **Check Obstacles** - Apply damage and knockback
6. **Check Walls** - Apply damage and bounce
7. **Update Spin** - Decay based on beyblade stats
8. **Update Stamina** - Decrease based on spin speed
9. **Check Ring Out** - Is beyblade outside boundary?

## 📊 Example Calculations

### Attack Beyblade (150 attack points)

```
damageMultiplier = 1 + 150 * 0.01 = 2.5x
Base damage: 100
With blade contact (2.0x): 100 * 2.5 * 2.0 = 500 damage!
```

### Defense Beyblade (150 defense points)

```
damageTaken = 1 - 150 * 0.00333 = 0.50x
Incoming damage: 500
Damage taken: 500 * 0.50 = 250 damage
```

### Opposite Spin Collision

```
Spin steal = damage * spinStealFactor * 1.5
Beyblade loses: 250 spin
Attacker gains: 250 * 0.4 * 1.5 = 150 spin
```

### Loop Boost (1.5x speed, 5 spin/sec)

```
- Velocity multiplied by 1.5x on entry
- Spin recovers: 5 points per second while in loop
- Friction reduced by loop's frictionMultiplier
```

### Water Effect (0.7x speed, 15% spin drain)

```
- Velocity multiplied by 0.7x per frame
- Spin drains: 15% of current spin per second
```

## 🚀 Benefits

1. **Realistic Physics** - Based on actual beyblade properties
2. **Strategic Depth** - Different beyblades excel in different situations
3. **Arena Variety** - Each arena plays differently
4. **Balanced Gameplay** - Attack/Defense/Stamina triangle
5. **Smooth Performance** - Efficient collision detection at 60 FPS

## 📝 Usage

### Starting a Tryout Room

```typescript
const roomOptions = {
  arenaId: "classic_stadium",
  beybladeId: "dragoon-gt",
  userId: "user123",
  username: "Player1",
};

const room = await client.joinOrCreate("tryout", roomOptions);
```

The server will:

1. Load arena configuration from Firestore
2. Load beyblade stats from Firestore
3. Calculate all derived stats
4. Create physics bodies with proper sizes
5. Start monitoring arena dynamics

### Listening to Events

```typescript
room.onMessage("obstacle-collision", (data) => {
  console.log(`${data.playerId} hit obstacle! Damage: ${data.damage}`);
});

room.onMessage("ring-out", (data) => {
  console.log(`${data.playerId} was knocked out!`);
});

room.onMessage("spin-out", (data) => {
  console.log(`${data.playerId} stopped spinning!`);
});
```

## 🔧 Configuration

All configuration is loaded from Firestore:

- **Beyblades**: `/beyblades/{beybladeId}`
- **Arenas**: `/arenas/{arenaId}`

No hardcoded values - everything is data-driven!

## 🎯 Next Steps

Potential enhancements:

1. Beyblade-to-beyblade collision damage in multiplayer
2. Laser gun auto-targeting
3. Rotation body force fields
4. Portal teleportation
5. Goal object collection/destruction
6. Special move collision modifiers
7. Replay system with collision highlights

---

**Last Updated**: November 6, 2025  
**Version**: 2.0.0  
**Status**: ✅ Production Ready
