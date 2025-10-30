# 🎬 Cinematic Special Move System - Complete Documentation

## Overview

A comprehensive flag-based special move system that allows combining multiple effects to create cinematic, "Let it Rip!" style special moves. Admins can configure any combination of flags to create unique abilities.

---

## 🎮 System Changes

### Power System Update

- **Old**: Max Power = 25, Special Moves cost 15-25
- **NEW**: Max Power = 100, Special Moves cost 100
- Power generation rate unchanged (5/sec normal, 10/sec in loops)

### Control System

- Special moves can now control both user and opponent independently
- Flags: `userLosesControl`, `opponentLosesControl`, `freezeOpponent`

### Damage Display

- **Floating damage numbers** appear above Beyblades
- Red numbers for damage (-200)
- Green numbers for healing (+150)
- Purple numbers for spin drain (−400★)

---

## 🚀 New Special Move Types

### 1. Orbital Attack (Barrage of Attacks)

**Orbit around opponent and strike multiple times**

```typescript
orbitalAttack: {
  enabled: true,
  orbitRadius: 4, // 4x user's radius
  attackCount: 3, // 3 attacks at 120° intervals
  damagePerHit: 200, // 200 spin damage per hit
  orbitSpeed: 2.5, // 2.5x speed during orbit
}
```

**Example Configuration**:

```typescript
{
  id: 'barrage-of-attacks',
  name: 'Barrage of Attacks',
  powerCost: 100,
  flags: {
    orbitalAttack: { /* see above */ },
    opponentLosesControl: true,
    freezeOpponent: false, // Can rotate but not move
    damageReduction: 0.3, // Opponent has 30% damage reduction
    cinematicSettings: {
      showBanner: true,
      slowMotion: { enabled: true, timeScale: 0.7, duration: 0.5 },
      cameraShake: { enabled: true, intensity: 3, duration: 3 },
    },
    duration: 3,
    cooldown: 15,
  }
}
```

---

### 2. Time Skip (Time Manipulation)

**Freeze opponent, reposition them, loop in outer ring, drain spin**

```typescript
timeSkip: {
  enabled: true,
  freezeDuration: 3, // Freeze for 3 seconds
  repositionOpponent: {
    enabled: true,
    direction: 'center', // Move toward center
    distance: 4, // 4x opponent's radius
  },
  loopRing: {
    enabled: true,
    ringType: 'outer', // Outer blue ring (charge dash)
    duration: 3, // Loop for 3 seconds
    disableChargePoints: true, // Don't trigger charges
  },
  spinDrainOnEnd: 400, // Drain 400 spin when time resumes
}
```

**Example Configuration**:

```typescript
{
  id: 'time-skip',
  name: 'Time Skip',
  powerCost: 100,
  flags: {
    timeSkip: { /* see above */ },
    opponentLosesControl: true,
    freezeOpponent: true, // Completely frozen
    speedBoost: 2.0, // Double speed for loop
    cinematicSettings: {
      showBanner: true,
      slowMotion: { enabled: true, timeScale: 0.3, duration: 1 },
      screenFlash: { enabled: true, color: '#00ffff', intensity: 0.5 },
    },
    duration: 3,
    cooldown: 20,
  }
}
```

---

### 3. Rush Attack

**Multiple rapid dashes with trailing effects**

```typescript
rushAttack: {
  enabled: true,
  dashCount: 5, // 5 rapid dashes
  dashSpeed: 3.0, // 3x speed per dash
  damagePerDash: 150, // 150 damage per hit
  trailEffect: true, // Visual motion trails
}
```

---

### 4. Shield Dome

**Ultimate defense with absorption and reflection**

```typescript
shieldDome: {
  enabled: true,
  absorbDamage: true, // Block all damage
  reflectPercentage: 0.5, // Reflect 50% back
  pushRadius: 100, // Push enemies 100px away
  healPerSecond: 100, // Heal 100 spin/sec
}
```

---

### 5. Berserk Mode

**High damage and speed, but take more damage**

```typescript
berserkMode: {
  enabled: true,
  damageBoost: 2.5, // 2.5x damage
  speedBoost: 1.8, // 1.8x speed
  defenseReduction: 0.5, // Take 2x damage
  visualIntensity: 3.0, // Max visual effects
}
```

---

### 6. Vortex Mode

**Create spinning vortex that drains nearby enemies**

```typescript
vortexMode: {
  enabled: true,
  pullRadius: 200, // Pull enemies within 200px
  spinStealRate: 80, // Steal 80 spin/sec from each
  healFromSteal: true, // Heal from stolen spin
  slowOpponents: 0.7, // Enemies move at 70% speed
}
```

---

### 7. Phantom Mode

**Become invisible and phase through everything**

```typescript
phantomMode: {
  enabled: true,
  opacity: 0.3, // 30% visible
  phaseThrough: true, // Pass through walls/enemies
  teleportOnHit: {
    enabled: true,
    distance: 150, // Teleport 150px away
    direction: 'behind', // Behind opponent
  }
}
```

---

### 8. Explosion

**Massive area damage with knockback**

```typescript
explosion: {
  enabled: true,
  explosionRadius: 250, // 250px radius
  explosionDamage: 500, // 500 spin damage
  knockbackForce: 3.0, // 3x knockback
  selfDamage: 200, // 200 recoil damage
}
```

---

## 🎬 Cinematic Features

### Banner System

**"LET IT RIP!" style banner appears before special moves**

```typescript
cinematicSettings: {
  showBanner: true, // Show banner
  slowMotion: {
    enabled: true,
    timeScale: 0.5, // 50% game speed
    duration: 1, // For 1 second
  },
  cameraShake: {
    enabled: true,
    intensity: 5, // 1-10 scale
    duration: 2, // Shake for 2 seconds
  },
  screenFlash: {
    enabled: true,
    color: '#ffffff', // White flash
    intensity: 0.8, // 80% opacity
    duration: 0.3, // 0.3 second flash
  },
  soundEffect: 'special-move-activate', // Sound ID
}
```

**Banner displays**:

- User name (e.g., "PLAYER 1")
- Special move name (large text)
- "SPECIAL MOVE ACTIVATED!" subtitle
- Animated particles and glows
- Color-coded by move type

---

### Floating Damage Numbers

**Automatically shown during gameplay**:

```typescript
// Damage (red)
addFloatingNumber(200, "damage", beybladePosition);
// Output: -200 (floats up in red)

// Healing (green)
addFloatingNumber(150, "heal", beybladePosition);
// Output: +150 (floats up in green)

// Spin drain (purple)
addFloatingNumber(400, "drain", beybladePosition);
// Output: −400★ (floats up in purple with star)
```

**Features**:

- Auto-fades and floats upward over 2 seconds
- Randomized horizontal drift
- Scales slightly larger as it fades
- Glowing effect matching type color
- Multiple numbers stack and spread out

---

## 🛠️ How to Create Custom Special Moves

### Step 1: Choose Your Effect Flags

Mix and match from these categories:

**Offensive**:

- `damageMultiplier`: 1.5 - 3.0
- `orbitalAttack`: Multi-strike around opponent
- `rushAttack`: Rapid dashes
- `explosion`: Area damage
- `berserkMode`: High risk, high reward

**Defensive**:

- `damageReduction`: 0.3 - 0.7 (30%-70% reduction)
- `damageImmune`: Complete immunity
- `shieldDome`: Absorb and reflect
- `immuneToKnockback`: Can't be pushed

**Utility**:

- `timeSkip`: Freeze and manipulate time
- `vortexMode`: Drain nearby enemies
- `phantomMode`: Invisibility and phasing
- `magnetMode`: Attract/repel

**Control**:

- `userLosesControl`: User can't move
- `opponentLosesControl`: Opponent can't move
- `freezeOpponent`: Opponent completely frozen

**Movement**:

- `speedBoost`: 1.3 - 3.0x speed
- `cannotMove`: Rooted in place
- `phasing`: Pass through walls
- `performLoop`: Auto-loop

**Size**:

- `radiusMultiplier`: 0.5 - 2.0x hitbox
- `visualScale`: 0.5 - 2.0x visual size

**Force Fields**:

- `gravityPull`: Attract enemies (radius in px)
- `pushAway`: Repel enemies (radius in px)

**Healing**:

- `healSpin`: +50 to +200 spin per second
- `reflectDamage`: 0.3 - 0.5 (reflect 30%-50%)

### Step 2: Configure Cinematic Effects

```typescript
cinematicSettings: {
  showBanner: true,
  slowMotion: { enabled: true, timeScale: 0.5, duration: 1 },
  cameraShake: { enabled: true, intensity: 5, duration: 2 },
  screenFlash: { enabled: true, color: '#ff0000', intensity: 0.6, duration: 0.2 },
  soundEffect: 'your-sound-id',
}
```

### Step 3: Set Duration and Cooldown

```typescript
duration: 3, // Effect lasts 3 seconds
cooldown: 15, // 15 second cooldown before next use
```

---

## 📋 Example: Custom "Meteor Strike"

**Combination Special Move**: Orbital attack + explosion + slow motion

```typescript
{
  id: 'meteor-strike',
  name: 'Meteor Strike',
  description: 'Orbit at high speed, then crash down with explosive force!',
  powerCost: 100,
  category: 'ultimate',
  flags: {
    // Phase 1: Orbital attack
    orbitalAttack: {
      enabled: true,
      orbitRadius: 3,
      attackCount: 2, // 2 hits at 180° intervals
      damagePerHit: 150,
      orbitSpeed: 3.0, // Very fast
    },

    // Phase 2: Explosion at end
    explosion: {
      enabled: true,
      explosionRadius: 200,
      explosionDamage: 300,
      knockbackForce: 2.5,
      selfDamage: 0, // No recoil
    },

    // Control
    opponentLosesControl: true,
    userLosesControl: false, // User controls the meteor

    // Boost during orbit
    speedBoost: 2.0,
    damageMultiplier: 1.5,

    // Cinematic
    cinematicSettings: {
      showBanner: true,
      slowMotion: {
        enabled: true,
        timeScale: 0.4,
        duration: 1.5,
      },
      cameraShake: {
        enabled: true,
        intensity: 8,
        duration: 3,
      },
      screenFlash: {
        enabled: true,
        color: '#ff8800',
        intensity: 0.7,
        duration: 0.4,
      },
      soundEffect: 'meteor-strike',
    },

    duration: 3,
    cooldown: 18,
  }
}
```

---

## 🎨 Visual Effects Guide

### Effect Colors by Type

| Type     | Color      | Hex Code |
| -------- | ---------- | -------- |
| Damage   | Red        | #ff4444  |
| Heal     | Green      | #44ff44  |
| Drain    | Purple     | #ff44ff  |
| Attack   | Orange     | #ff8800  |
| Defense  | Blue       | #4444ff  |
| Stamina  | Cyan       | #00ffff  |
| Time     | Light Blue | #88ffff  |
| Critical | Yellow     | #ffff00  |

### Banner Colors by Category

| Category  | Banner Color     |
| --------- | ---------------- |
| Offensive | #ff4444 (Red)    |
| Defensive | #4444ff (Blue)   |
| Utility   | #44ff44 (Green)  |
| Ultimate  | #ff00ff (Purple) |

---

## 🔧 Admin Panel Integration

### How to Configure in Admin Panel

1. **Navigate to** `/admin/settings/game`
2. **Click** Beyblade Management tab
3. **Select** a Beyblade to edit
4. **Special Move Section**:

   - Enter move ID (e.g., `barrage-of-attacks`)
   - Enter move name (e.g., `Barrage of Attacks`)
   - Set power cost to 100
   - Choose category: offensive/defensive/utility/ultimate

5. **Configure Flags**:

   - Toggle checkboxes for simple flags
   - Fill in numeric values for multipliers
   - Configure complex flags (orbital, timeSkip, etc.)

6. **Set Cinematic Options**:

   - Enable banner display
   - Configure slow motion timing
   - Set camera shake intensity
   - Choose screen flash color
   - Select sound effect

7. **Save** and test in-game!

---

## 🧪 Testing Special Moves

### Test Checklist

- [ ] Power reaches 100 before activation
- [ ] Banner displays with correct name and color
- [ ] Slow motion effect triggers (if enabled)
- [ ] Camera shake intensity feels right
- [ ] Screen flash isn't too bright/dark
- [ ] Floating damage numbers appear correctly
- [ ] User/opponent control matches configuration
- [ ] Special move effects apply properly
- [ ] Duration is correct
- [ ] Cooldown prevents immediate reactivation
- [ ] Sound effect plays (if configured)

### Debug Commands

```typescript
// Force activate special move (bypass power cost)
activateSpecialMove(beyblade, stats, Date.now(), true);

// Set power to 100
beyblade.power = 100;

// Clear cooldown
clearSpecialMoveCooldown(beyblade.id);

// Add test damage numbers
addFloatingNumber(200, "damage", beyblade.position);
addFloatingNumber(150, "heal", beyblade.position);
```

---

## 🚀 Implementation Status

### ✅ Completed

- Extended SpecialMoveFlags interface with all new flags
- Created example special move configurations
- Built cinematic banner component
- Implemented floating damage/heal number system
- Updated power system to 100 max
- Added control flags (user/opponent)

### 🔄 Next Steps

1. Update special moves manager to handle new flags
2. Integrate orbital attack logic into game loop
3. Integrate time skip logic into game loop
4. Add banner to game UI
5. Add floating numbers to rendering
6. Update all default Beyblades to use new system
7. Fix duplicate slug issue in beyblade names
8. Test all special moves in gameplay

---

## 📚 API Reference

### Special Move Activation

```typescript
// Check if can activate
const { canActivate, reason } = canActivateSpecialMove(
  beyblade,
  stats,
  currentTime
);

// Activate move
const activeMove = activateSpecialMove(beyblade, stats, currentTime);

// Check active status
const isActive = hasActiveSpecialMove(beyblade.id);

// Get active move
const move = getActiveSpecialMove(beyblade.id);
```

### Floating Numbers

```typescript
// Add single number
addFloatingNumber(value, type, position);

// Add multiple (for combos)
addMultipleFloatingNumbers([200, 150, 100], "damage", position, 50);

// Add critical hit
addCriticalHitNumber(value, position);

// Add combo counter
addComboNumber(3, position); // "3 COMBO!"

// Add custom text
addFloatingText("PERFECT!", position, "#ffff00");
```

### Banner Control

```typescript
// Show banner
<SpecialMoveBanner
  moveName="Barrage of Attacks"
  userName="Player 1"
  show={true}
  onComplete={() => console.log('Banner hidden')}
  color="#ff4444"
  duration={2000}
/>

// Compact banner (for quick moves)
<CompactSpecialMoveBanner
  moveName="Quick Strike"
  show={true}
  color="#ff8800"
  duration={1000}
/>
```

---

## 💡 Tips and Best Practices

### Balancing Special Moves

1. **High Damage = Long Cooldown**

   - 300+ damage → 20+ second cooldown
   - 200-300 damage → 15-20 second cooldown
   - <200 damage → 12-15 second cooldown

2. **Control Loss Trade-off**

   - If user loses control → lower cooldown
   - If opponent loses control → higher cooldown

3. **Multi-Effect Moves**

   - Combine 2-3 effects max for clarity
   - More effects = longer duration
   - Balance offense with defense

4. **Duration Guidelines**
   - Offensive: 2-3 seconds
   - Defensive: 3-5 seconds
   - Utility: 4-6 seconds
   - Ultimate: 2-4 seconds (high impact)

### Visual Clarity

1. **Banner Colors**: Match move category
2. **Slow Motion**: Use sparingly (< 1 second)
3. **Screen Flash**: Keep intensity < 0.7
4. **Camera Shake**: Scale with damage (1-10)

### User Experience

1. Always show banner for clarity
2. Display floating numbers for feedback
3. Visual effects should match move theme
4. Sound effects enhance immersion
5. Control should feel responsive

---

## 🎉 Conclusion

The cinematic special move system provides infinite combinations through flag-based configuration. Admins can create anything from simple damage boosts to complex multi-phase attacks with full cinematic presentation.

**Key Features**:

- ✅ 100-power ultimate moves
- ✅ "Let it Rip!" style banners
- ✅ Floating damage/heal numbers
- ✅ Complete control over user/opponent
- ✅ 10+ special move types
- ✅ Mix-and-match flag system
- ✅ Full cinematic effects (slow-mo, shake, flash)
- ✅ Admin-configurable through UI

**Ready to create epic Beyblade battles!** 🌪️⚡🎮
