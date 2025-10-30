# Stat System Refactor - Complete

## Overview

Refactored the beyblade stat allocation system to make it more meaningful and balanced. All stats are now calculated from a 360-point budget distributed across Attack, Defense, and Stamina categories.

## Changes Summary

### 1. New Stat Allocation System

- **Total Points**: 360 (increased from 320)
- **Max Per Category**: 150 points
- **Categories**: Attack, Defense, Stamina

### 2. Stat Calculation Formulas

#### Base Values

- **Stamina**: 2000 HP
- **Attack Power**: 100 (= 1.0x multiplier)
- **Defense Power**: 100 (= 1.0x multiplier)
- **Speed**: 100 (= 1.0x multiplier)
- **Spin Steal**: 100 (= 1.0x multiplier)
- **Knockback Resistance**: 100 (= 1.0x multiplier)

#### Point Bonuses

Each stat category provides specific bonuses:

**Attack Points** (0-150):

- +1 Attack Power per point (base 10 damage/hit)
- +1 Speed per point (base 10 units/sec)

**Defense Points** (0-150):

- +1 Defense Power per point (reduces incoming damage)
- +1 Knockback Resistance per point (base 10 units)

**Stamina Points** (0-150):

- +20 Max Stamina per point (base 2000 HP)
- +1 Spin Steal Power per point (base 10 points/hit)

### 3. Calculated Stats Formula

```typescript
attackPower = 100 + attackPoints
  → damagePerHit = attackPower * 0.1  // So 100 = 10 damage

speedMultiplier = 100 + attackPoints
  → speedPerSecond = speedMultiplier * 0.1  // So 100 = 10 units/sec

defensePower = 100 + defensePoints
  → damageReduction = defensePower * 0.01  // So 100 = 1.0x, 150 = 1.5x

knockbackResistance = 100 + defensePoints
  → knockbackDistance = knockbackResistance * 0.1  // So 100 = 10 units

maxStamina = 2000 + (staminaPoints * 20)  // So 60 = 3200 HP

spinStealPower = 100 + staminaPoints
  → spinStealAmount = spinStealPower * 0.1  // So 100 = 10 points/hit

spinDecayRate = 100 / (staminaPoints + 60)  // More stamina = slower decay
```

### 4. Removed Manual Input Fields

The following fields are now **calculated automatically**:

- `stamina` - Calculated from stamina points
- `spinStealFactor` - Calculated from stamina points
- `spinDecayRate` - Calculated from stamina points
- `actualSize` - Calculated as `radius * 10`
- `speed` - Calculated from attack points

### 5. UI Changes

#### MultiStepBeybladeEditor

- **Removed** manual input fields for stamina, spinStealFactor, spinDecayRate, actualSize
- **Added** calculated stats display showing:
  - Attack Power (damage per hit)
  - Speed (units/second)
  - Defense (damage reduction multiplier)
  - Knockback Resistance
  - Max Stamina (health points)
  - Spin Steal (points per hit)
  - Spin Decay Rate (stamina loss/sec)
- **Updated** type distribution sliders to show real-time stat bonuses
- **Updated** validation to require 360 total points (was 320)

#### BeybladePreview

- Now receives calculated stats instead of manual values
- `actualSize` auto-calculated from radius

### 6. Type System Files Updated

#### `src/types/beybladeStats.ts`

- Updated `TypeDistribution` interface with new 360-point system
- Added `CalculatedStats` interface
- Added `calculateStats()` function for deriving all stats from point distribution
- Updated `validateTypeDistribution()` to use 360 points
- Made stat fields optional with CALCULATED comments
- Removed dependency on manual stat input

#### `src/components/admin/MultiStepBeybladeEditor.tsx`

- Imported `calculateStats` function
- Added `useMemo` hook to calculate stats in real-time
- Removed manual stat input fields from Step 2
- Added comprehensive calculated stats display panel
- Updated sliders to show stat bonuses inline
- Pass calculated values to preview component

### 7. Game Balance Examples

#### Balanced Build (120/120/120)

- Attack Power: 220 → 22 damage/hit
- Speed: 220 → 22 units/sec
- Defense: 220 → 2.2x damage reduction
- Knockback: 220 → 22 units resistance
- Max Stamina: 4400 HP
- Spin Steal: 220 → 22 points/hit

#### Glass Cannon (150/60/150)

- Attack Power: 250 → 25 damage/hit
- Speed: 250 → 25 units/sec
- Defense: 160 → 1.6x damage reduction
- Knockback: 160 → 16 units resistance
- Max Stamina: 5000 HP
- Spin Steal: 250 → 25 points/hit

#### Tank Build (60/150/150)

- Attack Power: 160 → 16 damage/hit
- Speed: 160 → 16 units/sec
- Defense: 250 → 2.5x damage reduction
- Knockback: 250 → 25 units resistance
- Max Stamina: 5000 HP
- Spin Steal: 250 → 25 points/hit

### 8. Physics Integration (Ready for Implementation)

The calculated stats are designed for an 800x800 pixel arena:

**Movement**: Use `speedPerSecond` value directly (10-25 units/sec typical range)

**Collision Damage**:

```typescript
const damage = attackerStats.damagePerHit * contactMultiplier;
const actualDamage = damage / targetStats.damageReduction;
targetStamina -= actualDamage;
```

**Knockback**:

```typescript
const knockback = baseKnockback - targetStats.knockbackDistance;
const actualKnockback = Math.max(0, knockback);
```

**Spin Steal**:

```typescript
if (collision && oppositeSpinDirection) {
  const stolen = attackerStats.spinStealAmount;
  targetStamina -= stolen;
  attackerStamina += stolen * 0.5; // Recover 50% of stolen
}
```

**Stamina Decay**:

```typescript
// Per frame (60 FPS)
staminaLoss = stats.spinDecayRate / 60;
currentStamina -= staminaLoss;
```

### 9. Backward Compatibility

- Old TypeBonuses system still present for any legacy code
- Manual stat fields made optional (marked with `?`)
- Existing beyblades will work but should be migrated to use calculated stats

### 10. Next Steps

1. ✅ Update type definitions
2. ✅ Update editor UI
3. ✅ Add calculated stats display
4. ✅ Remove manual stat inputs
5. ⏳ Update game physics to use new stat values
6. ⏳ Update collision system
7. ⏳ Update movement system
8. ⏳ Migrate existing beyblades to new system
9. ⏳ Update admin display pages

## Testing Checklist

- [ ] Create new beyblade with 360-point distribution
- [ ] Verify calculated stats display correctly
- [ ] Test extreme builds (all points in one category)
- [ ] Test balanced builds (even distribution)
- [ ] Verify validation (must equal 360)
- [ ] Test radius → actualSize calculation
- [ ] Preview shows correct stats
- [ ] Save/load preserves distribution points

## Benefits

1. **More Meaningful**: Each point has a clear, measurable impact
2. **Better Balance**: 360 points with 150 max prevents extreme builds
3. **Simplified**: No manual stat tweaking needed
4. **Transparent**: Players see exactly what they get
5. **Flexible**: Can create diverse beyblade builds
6. **Physics-Ready**: Stats map directly to game mechanics
