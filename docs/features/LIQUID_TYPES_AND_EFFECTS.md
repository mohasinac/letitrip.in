# Liquid Types and Effects System

## Overview

Water bodies now use **predefined liquid types** with automatic effect configurations. Each liquid type has unique visual properties and gameplay effects.

## Liquid Types

### 1. 💧 Water (Normal)

**Default blue water with slight slowdown**

- **Color**: Blue (#3b82f6)
- **Opacity**: 0.6
- **Effects**:
  - 20% speed reduction
  - 30% increased friction
  - Water splash particles

**Use Case**: Standard hazard, balanced difficulty

---

### 2. 🔥 Lava

**Extreme heat - damages beyblades**

- **Color**: Red-orange (#ef4444)
- **Opacity**: 0.8
- **Effects**:
  - **5 HP damage per second** ⚠️
  - 40% speed reduction
  - 2x friction
  - Push force (heat repels)
  - Orange fire particles

**Use Case**: High-risk zones, death traps

---

### 3. ❄️ Ice Water

**Freezing cold - slows and freezes**

- **Color**: Light blue (#60a5fa)
- **Opacity**: 0.7
- **Effects**:
  - 50% speed reduction
  - 50% increased friction
  - **10 spin drain per second**
  - **Freeze after 5 seconds** (lasts 3 seconds) ⚠️
  - Light blue ice particles

**Use Case**: Trap zones, control effects

---

### 4. 💚 Healing Spring

**Restores HP and spin - no penalties**

- **Color**: Green (#10b981)
- **Opacity**: 0.5
- **Effects**:
  - **+3 HP per second** ✅
  - **+20 spin per second** ✅
  - No friction penalty
  - Green healing particles

**Use Case**: Recovery zones, strategic positioning

---

### 5. ⚡ Energy Drink

**Speed boost zone**

- **Color**: Yellow (#eab308)
- **Opacity**: 0.6
- **Effects**:
  - **50% speed boost** ✅
  - 30% friction reduction (slippery)
  - +10 spin per second
  - Yellow lightning particles

**Use Case**: Speed paths alternative, momentum zones

---

### 6. 🏜️ Quicksand

**High friction - pulls inward**

- **Color**: Brown-orange (#d97706)
- **Opacity**: 0.7
- **Effects**:
  - **70% speed reduction** ⚠️
  - **3x friction**
  - **Pull force 5** (strong suction)
  - 20 spin drain per second
  - **Stun after 4 seconds** (lasts 2 seconds)
  - Brown sand particles

**Use Case**: Traps, slow zones, strategic hazards

---

### 7. 🛢️ Oil Slick

**Very slippery - hard to control**

- **Color**: Dark gray (#374151)
- **Opacity**: 0.5
- **Effects**:
  - 20% speed boost (uncontrolled)
  - **70% friction reduction** (very slippery)
  - Gray oil particles

**Use Case**: Chaos zones, skill-based areas

---

### 8. ☠️ Poison

**Toxic - damages HP and spin**

- **Color**: Purple (#8b5cf6)
- **Opacity**: 0.7
- **Effects**:
  - **2 HP damage per second**
  - **30 spin drain per second** ⚠️
  - 30% speed reduction
  - 20% increased friction
  - Purple toxic particles

**Use Case**: Medium difficulty hazard zones

---

## How It Works

### 1. Liquid Type Selection

When creating or editing a water body:

1. Select liquid type from dropdown
2. Preset effects automatically apply
3. Color and opacity set to defaults
4. Can override color/effects if needed

### 2. Preset Configuration

```typescript
const LIQUID_PRESETS: Record<
  LiquidType,
  {
    name: string;
    color: string;
    opacity: number;
    description: string;
    effects: WaterEffectConfig;
  }
> = {
  water: {
    /* ... */
  },
  lava: {
    /* ... */
  },
  // ... etc
};
```

### 3. Effect Application

```typescript
// When liquid type changes
const preset = LIQUID_PRESETS[liquidType];
waterBody.color = preset.color;
waterBody.opacity = preset.opacity;
waterBody.effects = { ...preset.effects };
```

## Effect Properties

### Damage/Healing

- `damagePerSecond` (0-10): HP loss per second
- `healPerSecond` (0-10): HP gain per second

### Speed Effects

- `speedBoost` (0.5-2.0): Speed multiplier (>1 = faster)
- `speedLoss` (0.1-1.0): Speed reduction (< 1 = slower)

### Spin Effects

- `spinDrainPerSecond` (0-100): Spin loss per second
- `spinBoostPerSecond` (0-100): Spin gain per second

### Friction

- `frictionMultiplier` (0.5-3.0): Drag factor (higher = harder to move)

### Status Effects

- `freezeDuration` (0-10s): Time frozen
- `freezeThreshold` (1-10s): Time before freeze triggers
- `stunDuration` (0-5s): Time stunned
- `stunThreshold` (1-10s): Time before stun triggers

### Forces

- `pushForce` (0-10): Repel from center
- `pullForce` (0-10): Attract to center (whirlpool)

### Visual

- `showParticles` (boolean): Display particles
- `particleColor` (hex): Particle color

## UI Controls

### Liquid Type Selector

```typescript
<select value={water.liquidType}>
  <option value="water">💧 Water</option>
  <option value="lava">🔥 Lava</option>
  <option value="ice">❄️ Ice Water</option>
  <option value="healing">💚 Healing Spring</option>
  <option value="speedBoost">⚡ Energy Drink</option>
  <option value="quicksand">🏜️ Quicksand</option>
  <option value="oil">🛢️ Oil Slick</option>
  <option value="poison">☠️ Poison</option>
</select>
```

### Custom Overrides

- **Custom Color**: Override preset color
- **Effects Tab**: Fine-tune individual effects
- **Opacity**: Adjust transparency

## Gameplay Examples

### Example 1: Lava Moat

```typescript
{
  type: "moat",
  liquidType: "lava",
  thickness: 3,
  distanceFromArena: 18,
  // Auto-applied effects:
  // - 5 damage/sec
  // - 40% slower
  // - Push force
}
```

**Result**: Ring of lava around arena - touching = rapid damage

### Example 2: Healing Zone

```typescript
{
  type: "zone",
  liquidType: "healing",
  position: { x: 0, y: 0 },
  shape: "circle",
  radius: 8,
  // Auto-applied effects:
  // - +3 HP/sec
  // - +20 spin/sec
}
```

**Result**: Center recovery zone - strategic positioning

### Example 3: Quicksand Trap

```typescript
{
  type: "zone",
  liquidType: "quicksand",
  position: { x: 10, y: 10 },
  shape: "square",
  width: 12,
  height: 12,
  // Auto-applied effects:
  // - 70% slower
  // - Pull force
  // - Stun after 4s
}
```

**Result**: Corner trap - hard to escape once in

### Example 4: Oil Ring

```typescript
{
  type: "wall-based",
  liquidType: "oil",
  thickness: 2,
  offsetFromEdge: 0,
  // Auto-applied effects:
  // - 20% faster (slippery)
  // - 70% friction reduction
}
```

**Result**: Slippery edge - hard to control near walls

## Strategic Combinations

### 1. Risk-Reward Arena

- **Center**: Healing spring (recovery)
- **Middle Ring**: Normal water (neutral)
- **Edges**: Lava moat (danger)

### 2. Speed Arena

- **Inner Circle**: Energy drink (speed boost)
- **Outer Ring**: Ice water (freeze trap)

### 3. Trap Arena

- **Corners**: Quicksand zones (traps)
- **Edges**: Poison wall-based (constant damage)

## Technical Implementation

### Files Modified

1. **`src/types/arenaConfigNew.ts`**

   - Added `LiquidType` enum
   - Added `LIQUID_PRESETS` configuration
   - Updated `BaseWaterBodyConfig` with `liquidType` property
   - Added 8 predefined liquid types with full effects

2. **`src/components/admin/arena-tabs/WaterBodiesTab.tsx`**
   - Imported `LIQUID_PRESETS` and `LiquidType`
   - Updated default water body creation to use presets
   - Replaced color picker with liquid type selector
   - Auto-apply preset effects when liquid type changes
   - Added description display
   - Kept custom color override option

### Type Definitions

```typescript
export type LiquidType =
  | "water"
  | "lava"
  | "ice"
  | "healing"
  | "speedBoost"
  | "quicksand"
  | "oil"
  | "poison";

export interface BaseWaterBodyConfig {
  id: string;
  type: WaterBodyType;
  liquidType: LiquidType; // NEW: Required liquid type
  color?: string; // Optional override
  opacity?: number;
  effects?: WaterEffectConfig; // Optional override
  // ...
}
```

## Benefits

### 1. User-Friendly

- Clear visual indicators (emojis + names)
- Descriptive effect summaries
- No need to configure individual effects

### 2. Balanced

- Predefined values ensure fair gameplay
- Tested combinations
- Can still override for custom scenarios

### 3. Intuitive

- "Lava damages" - obvious
- "Healing spring restores" - clear
- "Ice freezes" - expected behavior

### 4. Extensible

- Easy to add new liquid types
- Simple to adjust balance
- All presets in one location

## Testing

### Test Each Liquid Type

1. Create moat with each type
2. Verify color matches
3. Check effects apply correctly
4. Test gameplay behavior

### Test Overrides

1. Select liquid type
2. Change custom color
3. Verify color overrides preset
4. Verify effects remain from preset

### Test Switching

1. Create water body with "water"
2. Change to "lava"
3. Verify effects update
4. Change back to "water"
5. Verify effects revert

## Status

✅ **COMPLETE** - 8 predefined liquid types with auto-configuring effects

Players can now easily create varied water hazards without manually configuring complex effect values!
