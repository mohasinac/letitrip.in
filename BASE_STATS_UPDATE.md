# Base Stats Update - Complete

## Overview

Updated the base stats system to provide clear starting values that apply before any type distribution points are allocated.

## New Base Stats (0 Distribution Points)

### Attack Base Stats

- **Base Damage:** 100
- **Base Speed:** 10 units/second
- **Base Rotation:** 10 spins/second

### Defense Base Stats

- **Base Knockback Distance:** 10 units
- **Base Damage Taken:** 1.0x (100% - take damage as is)
- **Base Invulnerability Chance:** 10% (1 in 10 attacks triggers 1.5 sec invulnerability)

### Stamina Base Stats

- **Base Stamina (HP):** 1000
- **Base Spin Steal:** 10% of damage taken
- **Base Spin Decay:** 10 per second

## Type Distribution Bonuses (0-150 points per stat, 360 total)

### Attack Points (0-150)

Each point provides **+1% to all attack stats (multiplicative)**:

- **Damage multiplier:** base _ (1 + points _ 0.01)
- **Speed:** base _ (1 + points _ 0.01)
- **Rotation:** base _ (1 + points _ 0.01)

Example ranges:

- 0 points: 100 damage (1.0x), 10 speed, 10 rotation
- 75 points: 175 damage (1.75x), 17.5 speed, 17.5 rotation
- 150 points: 250 damage (2.5x), 25 speed, 25 rotation

### Defense Points (0-150)

Each point provides **-0.33% damage taken, -0.167% knockback, +0.667% invulnerability (multiplicative)**:

- **Damage taken:** base _ (1 - points _ 0.00333)
- **Knockback distance:** base _ (1 - points _ 0.00167)
- **Invulnerability chance:** base _ (1 + points _ 0.00667)

Example ranges:

- 0 points: 1.0x damage taken (100%), 10 knockback, 10% invulnerability
- 75 points: 0.75x damage taken (75%), 8.75 knockback, 15% invulnerability
- 150 points: 0.5x damage taken (50%), 7.5 knockback, 20% invulnerability

### Stamina Points (0-150)

Each point provides **+1.333% HP, +2.667% spin steal, -0.167% decay (multiplicative)**:

- **Max HP:** base _ (1 + points _ 0.01333)
- **Spin steal %:** base _ (1 + points _ 0.02667)
- **Decay rate:** base _ (1 - points _ 0.00167)

Example ranges:

- 0 points: 1000 HP, 10% steal, 10 decay/sec
- 75 points: 2000 HP, 30% steal, 8.75 decay/sec
- 150 points: 3000 HP, 50% steal (1 in 2 hits), 7.5 decay/sec

**Note:** Spin steal is 50% chance in opposite spin matchups, 25% in same spin matchups (half effectiveness)

## Balanced Distribution Example (120/120/120)

With an even distribution of 120 points each:

**Attack (120 points):**

- Damage: 220 (2.2x multiplier = base 100 \* 2.2)
- Speed: 22 units/sec (base 10 \* 2.2)
- Rotation: 22 spins/sec (base 10 \* 2.2)

**Defense (120 points):**

- Damage Taken: 0.6x (60% - takes 40% less damage = base 1.0 * (1 - 120*0.00333))
- Knockback: 8 units (base 10 * (1 - 120*0.00167))
- Invulnerability: 18% chance (base 10% * (1 + 120*0.00667))

**Stamina (120 points):**

- Max HP: 2600 (base 1000 * (1 + 120*0.01333))
- Spin Steal: 42% (base 10% * (1 + 120*0.02667))
- Decay Rate: 8 per second (base 10 * (1 - 120*0.00167))

## Files Updated

### 1. `src/types/beybladeStats.ts`

- Updated `calculateStats()` function with new multiplicative formulas
- Changed from additive (`base + points * increment`) to multiplicative (`base * (1 + points * factor)`)
- Updated all documentation comments to reflect multiplicative bonuses

### 2. `src/components/admin/MultiStepBeybladeEditor.tsx`

- Updated info box to show base stats clearly
- Updated bonus descriptions to match new formulas

## Migration Notes

**No database migration required!** The system uses the same `typeDistribution` values (0-150 per stat, 360 total). The only change is how those points are calculated into final stats.

Existing Beyblades will automatically use the new calculation formulas.

## Testing Checklist

- [ ] Create a new Beyblade with 0/0/360 distribution - should show stamina-focused stats
- [ ] Create a new Beyblade with 360/0/0 distribution - should show attack-focused stats
- [ ] Create a new Beyblade with 120/120/120 distribution - should show balanced stats
- [ ] Verify preview canvas shows correct values
- [ ] Test in actual battle to confirm stats work as expected

## Related Documentation

- See `BEYBLADE_STATS_IMPLEMENTATION.md` for full stats system
- See `TYPE_DISTRIBUTION_GUIDE.md` for distribution strategies
