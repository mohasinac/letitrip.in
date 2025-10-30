# Stamina Stats Adjustment - Complete

## Overview

Adjusted the stamina stat formulas to provide more balanced scaling at maximum points (150), with special consideration for spin steal mechanics.

## Changes to Stamina Stats at 150 Points

### Previous Values (at 150 stamina points)

- ❌ Max Stamina: 4000 HP
- ❌ Spin Steal: 70% chance
- ❌ Spin Decay: 2.5 per second

### New Values (at 150 stamina points)

- ✅ Max Stamina: 3000 HP (3x base)
- ✅ Spin Steal: 50% chance (1 in 2 hits)
- ✅ Spin Decay: 7.5 per second (25% reduction)

## New Stamina Formulas

### Max Stamina (HP)

- **Formula:** `base * (1 + points * 0.01333)`
- **Base:** 1000 HP
- **At 150 points:** 3000 HP (3x multiplier)
- **Per point:** +1.333% HP

### Spin Steal Chance

- **Formula:** `base * (1 + points * 0.02667)`
- **Base:** 10% (1 in 10 hits)
- **At 150 points:** 50% (1 in 2 hits)
- **Per point:** +2.667% chance
- **Special:** 25% effectiveness in same spin matchups (50% → 25%)

### Spin Decay Rate

- **Formula:** `base * (1 - points * 0.00167)`
- **Base:** 10 per second
- **At 150 points:** 7.5 per second (25% reduction)
- **Per point:** -0.167 decay

## Example Stat Progression

### 0 Stamina Points (Base)

- Max HP: 1000
- Spin Steal: 10% (1 in 10)
- Decay: 10/sec

### 50 Stamina Points

- Max HP: 1667
- Spin Steal: 23.3%
- Decay: 9.17/sec

### 100 Stamina Points

- Max HP: 2333
- Spin Steal: 36.7%
- Decay: 8.33/sec

### 150 Stamina Points (Maximum)

- Max HP: 3000 ✅
- Spin Steal: 50% (1 in 2) ✅
- Decay: 7.5/sec ✅

## Spin Steal Mechanics

### Opposite Spin Matchup (Left vs Right)

- **Full effectiveness:** Uses calculated percentage
- **150 points:** 50% chance to steal spin instead of taking damage
- **Example:** Attack deals 100 damage → Either take 100 damage OR gain 100 HP

### Same Spin Matchup (Left vs Left, Right vs Right)

- **Half effectiveness:** 50% of calculated percentage
- **150 points:** 25% chance to steal spin (50% × 0.5)
- **More realistic:** Harder to steal spin from same direction

### How It Works

1. When hit, roll for spin steal chance
2. If successful:
   - **Don't take damage** from that hit
   - **Gain HP** equal to the damage that would have been dealt
3. If failed:
   - Take damage normally

## Balanced Distribution (120/120/120)

With stamina at 120 points:

- Max HP: 2600
- Spin Steal: 42% (opposite spin) / 21% (same spin)
- Decay: 8 per second

## Reasoning for Changes

### 1. Max HP Cap

**Old:** 4000 HP at 150 points (4x base)
**New:** 3000 HP at 150 points (3x base)

- More reasonable scaling
- Still significant 3x improvement
- Prevents extremely long battles
- Balances with attack damage (250 max)

### 2. Spin Steal Chance

**Old:** 70% at 150 points (very high)
**New:** 50% at 150 points (1 in 2)

- More balanced proc rate
- Clear "coin flip" mechanic
- Same spin = 25% (more realistic)
- Rewards timing and strategy

### 3. Decay Rate Reduction

**Old:** 2.5/sec at 150 points (75% reduction)
**New:** 7.5/sec at 150 points (25% reduction)

- More modest reduction
- Still noticeable improvement
- Prevents extremely slow decay
- Maintains battle pacing

## Comparison Table

| Points | Max HP | Spin Steal (Opp/Same) | Decay/sec |
| ------ | ------ | --------------------- | --------- |
| 0      | 1000   | 10% / 5%              | 10.0      |
| 30     | 1400   | 18% / 9%              | 9.5       |
| 60     | 1800   | 26% / 13%             | 9.0       |
| 90     | 2200   | 34% / 17%             | 8.5       |
| 120    | 2600   | 42% / 21%             | 8.0       |
| 150    | 3000   | 50% / 25%             | 7.5       |

## Files Updated

1. ✅ `src/types/beybladeStats.ts` - Updated stamina calculation formulas
2. ✅ `src/components/admin/MultiStepBeybladeEditor.tsx` - Updated UI descriptions
3. ✅ `BASE_STATS_UPDATE.md` - Updated documentation with new values

## Testing Recommendations

- [ ] Test a 0/0/360 (pure stamina) Beyblade - should have 3000 HP max
- [ ] Test spin steal in opposite spin battle - should proc ~50% at max stamina
- [ ] Test spin steal in same spin battle - should proc ~25% at max stamina
- [ ] Verify decay rate is 7.5/sec at 150 stamina points
- [ ] Test balanced 120/120/120 build - should have 2600 HP
- [ ] Observe battle length with new HP/decay values

## Impact

**Positive:**

- More balanced stamina builds
- Reasonable max HP (3000 vs 4000)
- Clear spin steal mechanics (50% opposite, 25% same)
- Better battle pacing
- Encourages strategic play

**Minimal:**

- Existing Beyblades automatically use new formulas
- No database migration required
- All changes are calculation-only

## Related Files

- See `BASE_STATS_UPDATE.md` for complete stats system
- See `DEFENSE_STATS_ADJUSTMENT.md` for defense changes
- See `beybladeStats.ts` for implementation details

## Battle Strategy Notes

### High Stamina Build (0/60/300)

- ~2800 HP
- ~46% spin steal (opposite) / 23% (same)
- ~8.5 decay/sec
- Strategy: Outlast opponents, steal spin when hit

### Balanced Build (120/120/120)

- 2600 HP
- 42% spin steal (opposite) / 21% (same)
- 8 decay/sec
- Strategy: Well-rounded, adaptable to situations

### Tank Build (0/240/120)

- Takes 20% damage
- 2600 HP
- 42% spin steal + damage reduction = very tanky
- Strategy: Absorb hits, steal spin, wear down opponent
