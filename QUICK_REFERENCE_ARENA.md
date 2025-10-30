# Quick Reference: Dynamic Arena & Stat System

## 🎮 Stat System (360 Points)

### Point Distribution

- **Total**: 360 points
- **Max per category**: 150 points
- **Categories**: Attack, Defense, Stamina

### Bonuses

```
Attack  → +1 damage/point, +1 speed/point
Defense → +1% reduction/point, +1 knockback/point
Stamina → +20 HP/point, +1 spin steal/point
```

### Base Values

```
Stamina: 2000 HP
Attack:  100 (10 damage base)
Defense: 100 (1.0x reduction)
Speed:   100 (10 units/sec)
```

---

## 🏟️ Arena System

### Shapes

`circle | rectangle | pentagon | hexagon | octagon | star | oval`

### Themes

`forest | mountains | grasslands | metrocity | safari | prehistoric | futuristic | desert | sea | riverbank`

### Game Modes

`player-vs-ai | player-vs-player | single-player-test`

---

## 📊 Arena Features

### 🔄 Loops (Speed Zones)

```typescript
{
  radius: 15,          // em from center (or size for shaped loops)
  shape: 'circle' | 'rectangle' | 'pentagon' | 'hexagon' | 'octagon' | 'star' | 'oval',
  speedBoost: 1.2,     // 20% faster
  spinBoost: 5,        // +5/sec recovery
  frictionMultiplier: 0.8,
  width: 30,           // For rectangle shape (em)
  height: 20,          // For rectangle shape (em)
  rotation: 45,        // Rotation angle (degrees)
  color: '#3b82f6'     // Visual color
}
```

### 🚪 Exits

```typescript
{
  angle: 0,      // 0-360°
  width: 30,     // degrees
  enabled: true
}
```

### 🧱 Walls

```typescript
{
  enabled: true,
  baseDamage: 5,
  recoilDistance: 2,     // em
  hasSpikes: true,       // 2x damage
  hasSprings: true,      // 1.5x recoil
  thickness: 0.5
}
```

### 🪨 Obstacles

```typescript
{
  type: 'rock' | 'pillar' | 'barrier' | 'wall',
  x: 5, y: 10,           // em
  radius: 2,             // em
  damage: 10,
  recoil: 3,
  destructible: true,
  health: 100
}
// Max: 50 obstacles
```

### 💧 Water

```typescript
{
  enabled: true,
  type: 'center' | 'loop',
  radius: 10,            // em (if center)
  spinDrainRate: 2,      // %/sec
  speedMultiplier: 0.6,  // 40% slower
  viscosity: 0.8,
  waveAnimation: true
}
```

### 🕳️ Pits

```typescript
{
  x: 0, y: 15,           // em
  radius: 2,             // em
  damagePerSecond: 10,   // % of current
  escapeChance: 0.5,     // 50%/sec
  visualDepth: 3,
  swirl: true
}
```

### 🔫 Laser Guns

```typescript
{
  x: 15, y: 15,          // em
  fireInterval: 3,        // seconds
  damage: 50,
  bulletSpeed: 20,        // em/sec
  targetMode: 'nearest' | 'random' | 'strongest',
  warmupTime: 0.5,
  cooldown: 1,
  range: 40              // em
}
// Max: 10 guns
```

### 🎯 Goals

```typescript
{
  id: 'tower1',
  x: 10, y: 10,          // em
  radius: 3,             // em
  health: 500,
  scoreValue: 100,
  type: 'target' | 'crystal' | 'tower' | 'relic',
  shieldHealth: 200      // optional
}
// Max: 20 goals
```

---

## 🎨 Presets

### Classic Stadium

- Circle shape
- 2 loops
- No hazards
- Simple walls

### Hazard Zone

- Octagon shape
- 3 loops, 4 exits
- Spiked walls with springs
- 1 central pit
- 2 laser guns

### Water World

- Circle shape
- 1 loop
- Central water body
- Simple walls

---

## ⚡ Physics Formulas

### Wall Collision

```
damage = base × (spikes ? 2.0 : 1.0)
recoil = dist × (springs ? 1.5 : 1.0)
```

### Water Effects

```
velocity *= speedMultiplier
stamina -= current × rate/100 × dt
accel *= (1 - viscosity)
```

### Pit Trap

```
if (random() < chance × dt) → escape
else → stamina -= current × dmg/100 × dt
```

### Loop Boost

```
velocity *= speedBoost
stamina += spinBoost × dt
friction *= frictionMult
```

---

## 📏 Units

**Using em units (not pixels)**

- 50em × 50em arena
- 1em ≈ 16px (typical)
- Responsive scaling

```typescript
const EM_TO_PX = 16;
emToPx(em) = em * 16;
pxToEm(px) = px / 16;
```

---

## 🛠️ Usage

### Create Arena

```typescript
import ArenaConfigurator from "@/components/admin/ArenaConfigurator";

<ArenaConfigurator
  arena={existing}
  onSave={(config) => save(config)}
  onCancel={() => close()}
/>;
```

### Load Preset

```typescript
import { ARENA_PRESETS } from "@/types/arenaConfig";

const arena = ARENA_PRESETS.classic;
```

### Validate

```typescript
import { validateArenaConfig } from "@/types/arenaConfig";

const { valid, errors } = validateArenaConfig(config);
```

### Generate Random

```typescript
import {
  generateRandomObstacles,
  generateRandomPits,
} from "@/types/arenaConfig";

const obstacles = generateRandomObstacles(10, 50, 50, excludeZones);
const pits = generateRandomPits(3, 25, "edges");
```

---

## 🎯 Implementation Status

### ✅ Complete

- Type definitions
- Arena configurator UI
- Preset system
- Validation
- Random generation
- Documentation

### ⏳ In Progress

- Arena renderer
- Physics engine
- Collision detection
- Animation system

### 📋 Planned

- Laser AI
- Goal mechanics
- Theme backgrounds
- Performance optimization

---

## 📖 Documentation

- **ARENA_SYSTEM_GUIDE.md** - Full guide (1000+ lines)
- **STAT_SYSTEM_REFACTOR.md** - Stat system docs
- **IMPLEMENTATION_SUMMARY.md** - What was built
- **This file** - Quick reference

---

## 🚀 Quick Start

1. Open admin panel
2. Click "Create Arena"
3. Load a preset or start from scratch
4. Adjust settings across 6 tabs:
   - Basic (shape, theme, mode)
   - Loops (speed zones)
   - Hazards (obstacles, water, pits)
   - Goals (objectives)
   - Theme (visual style)
   - Preview (summary)
5. Save and play!

---

## 💡 Pro Tips

- Use loops strategically for positioning
- Place pits at edges for risk/reward
- Water in center creates slow zone
- Laser guns add unpredictability
- Spiked walls = high risk arena
- No walls = exit-based gameplay
- Goal objects = objective mode
- Random generation for variety

---

## 🎮 Game Modes

### Player vs AI

- 4 difficulty levels
- AI uses loops strategically
- Avoids hazards (higher difficulty)

### Player vs Player

- Local: WASD vs Arrows
- Online: Multiplayer sync
- Competitive rankings

### Single Player Test

- No opponent
- Test beyblade builds
- Practice mechanics

---

## 🔧 Customization Limits

- Loops: 10 max
- Obstacles: 50 max
- Pits: Unlimited (performance)
- Lasers: 10 max
- Goals: 20 max
- Exits: Unlimited

---

**Ready to create infinite arena variations!** 🎉
