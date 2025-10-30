# Beyblade Damage Points System

## Overview

Each Beyblade has **100 bonus damage points** to distribute across its contact points (spikes). This creates a balanced system where players can customize their attack strategy.

## Core Mechanics

### Base System

- **Base Damage**: 1.0x (when spike doesn't make contact)
- **Bonus Pool**: 100 points to distribute across spikes
- **Maximum per Spike**: 2.0x damage (uses all 100 points)
- **Minimum per Spike**: 1.0x damage (uses 0 points)

### Damage Formula

```
Final Damage Multiplier = 1.0 + (Allocated Points / 100)
```

## Examples

### 1 Spike Configuration

- **Option A**: Single spike at 2.0x (all 100 points)
  - High damage when it hits
  - Low hit frequency
  - Best for: Precision attackers

### 2 Spike Configuration

- **Balanced**: 1.5x + 1.5x (50 points each)
- **Custom**: 1.1x + 1.9x (10 + 90 points)
- **Custom**: 1.3x + 1.7x (30 + 70 points)

### 3 Spike Configuration

- **Balanced**: 1.33x + 1.33x + 1.34x (~33 points each)
- **Sniper**: 1.1x + 1.1x + 1.8x (10 + 10 + 80 points)
- **Dual Power**: 1.0x + 1.5x + 1.5x (0 + 50 + 50 points)

### 4+ Spike Configurations

- **4 Spikes Balanced**: 1.25x each (25 points each)
- **10 Spikes Balanced**: 1.1x each (10 points each)
- **Mixed Strategy**: Any combination that totals 100 points

## Strategic Implications

### High Spike Count (7-10 spikes)

- ✅ Consistent damage output
- ✅ More contact opportunities
- ❌ Lower peak damage per hit
- **Best for**: Stamina and balanced types

### Low Spike Count (1-3 spikes)

- ✅ High peak damage
- ✅ Devastating single hits
- ❌ Less consistent contact
- **Best for**: Attack types

### Medium Spike Count (4-6 spikes)

- ✅ Balance between consistency and power
- ✅ Flexible strategy
- **Best for**: Balanced types

## UI Features

### Auto-Balance Button

- Distributes 100 points equally across all spikes
- Example: 3 spikes → 1.33x, 1.33x, 1.34x

### Manual Adjustment

- Drag sliders to customize each spike's damage
- Visual feedback shows remaining points
- Prevents over-allocation (enforces 100 point limit)

### Budget Tracker

- Progress bar shows used/remaining points
- Warnings if over budget
- Tips if points are unused

## Physics Integration

### Collision Detection

```typescript
// In collision system
if (spikeContact) {
  const damageMultiplier = contactPoint.damageMultiplier; // 1.0 to 2.0
  const finalDamage = baseDamage * damageMultiplier;
  applyDamage(finalDamage);
} else {
  const finalDamage = baseDamage * 1.0; // Base damage
  applyDamage(finalDamage);
}
```

### Balance Considerations

1. Total damage potential is constant (100 bonus points)
2. More spikes = more consistent, less burst
3. Fewer spikes = high burst, less consistent
4. Players choose their strategy
5. All configurations are balanced overall

## Example Configurations

### "Glass Cannon" (1 spike)

```
Spike 1: 2.0x damage (100 points)
Strategy: High risk, high reward
```

### "Twin Blade" (2 spikes)

```
Spike 1: 1.5x damage (50 points)
Spike 2: 1.5x damage (50 points)
Strategy: Balanced dual attack
```

### "Sniper" (3 spikes)

```
Spike 1: 1.1x damage (10 points)
Spike 2: 1.1x damage (10 points)
Spike 3: 1.8x damage (80 points)
Strategy: Two weak hits, one devastating blow
```

### "Saw Blade" (10 spikes)

```
All spikes: 1.1x damage (10 points each)
Strategy: Constant chip damage
```

## Implementation Notes

### Frontend (BeybladeImageUploader)

- Real-time budget tracking
- Visual point allocation feedback
- Automatic constraint enforcement
- Auto-balance helper function

### Backend (Database)

- Store damage multipliers per spike
- Validate total doesn't exceed 100 points
- Type: `Array<{angle: number, damageMultiplier: number, width: number}>`

### Game Physics

- Use stored multipliers in collision detection
- Apply to damage calculations
- No runtime validation needed (validated on save)

## Future Enhancements

### Possible Additions

1. **Damage Type**: Different damage types (pierce, blunt, spin)
2. **Conditional Multipliers**: Bonus damage vs specific types
3. **Charge System**: Build up damage over time
4. **Combo Multipliers**: Consecutive hits increase damage
5. **Position-based**: Different damage from different arena positions

### Balance Tweaks

- Adjust total bonus pool (currently 100)
- Add minimum damage per spike requirement
- Implement diminishing returns for high concentration
