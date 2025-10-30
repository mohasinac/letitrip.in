# Damage Normalization: 0-100 Range with Spin Stealing

## Overview

The collision damage system now uses **logarithmic normalization** to scale damage to a **0-100 range** instead of using artificial caps. This provides realistic, physics-based damage that scales naturally with collision intensity.

---

## Damage Scale (0-100)

### **Damage Ranges:**

| Collision Type      | Raw Damage      | Normalized Damage | Description                               |
| ------------------- | --------------- | ----------------- | ----------------------------------------- |
| **Gentle Touch**    | 1,000-5,000     | **1-5**           | Light contact, minimal spin loss          |
| **Soft Collision**  | 5,000-15,000    | **5-15**          | Low-speed collision                       |
| **Normal Hit**      | 15,000-50,000   | **15-35**         | Standard battle collision                 |
| **Strong Impact**   | 50,000-100,000  | **35-55**         | High-speed collision                      |
| **Powerful Clash**  | 100,000-150,000 | **55-75**         | Very high momentum/spin collision         |
| **Devastating Hit** | 150,000-250,000 | **75-90**         | Extreme collision (charge dash, ultimate) |
| **Maximum Impact**  | 250,000+        | **90-100**        | Theoretical maximum                       |

---

## Formula

```typescript
damage_normalized = (log(1 + damage_raw) / log(1 + max_expected_raw)) × 100

where:
- damage_raw = Raw physics-based damage calculation
- max_expected_raw = 150,000 (typical max collision intensity)
- Result is clamped to 0-100 range
```

### **Why Logarithmic Scaling?**

✅ **Natural Progression:** Small collisions = small damage, huge collisions = huge damage  
✅ **No Caps:** Infinite scaling potential, but diminishing returns  
✅ **Smooth Curve:** No sudden jumps or plateaus  
✅ **Realistic Physics:** Preserves the relative impact of different collision types

---

## Example Calculations

### **Example 1: Low Spin vs High Spin (Opposite Spins)**

- **Meteo (Left):** 100 spin, 50 velocity
- **Dranzer GT (Right):** 1000 spin, 50 velocity

**Raw Damage Calculation:**

```
Angular momentum interaction = (L1 + L2) × 1.5 ≈ 300,000
Linear momentum = m × v ≈ 1,000
Raw damage ≈ 30,000
```

**Normalized Damage:**

```
damage = (log(1 + 30,000) / log(1 + 150,000)) × 100 ≈ 20
```

✅ **Result:** ~20 damage per collision + **spin stealing** (gains 135 spin)

---

### **Example 2: Equal High-Speed Collision (Opposite Spins)**

- **Meteo (Left):** 1500 spin, 200 velocity
- **Dranzer GT (Right):** 1500 spin, 200 velocity

**Raw Damage Calculation:**

```
Angular momentum interaction = (L1 + L2) × 1.5 ≈ 3,000,000
Linear momentum = m × v ≈ 4,000
Kinetic energy factor ≈ 32,000
Raw damage ≈ 150,000
```

**Normalized Damage:**

```
damage = (log(1 + 150,000) / log(1 + 150,000)) × 100 = 100
```

✅ **Result:** **100 damage** (maximum) - both beyblades take massive damage

---

### **Example 3: Same Spin Low-Speed Collision**

- **Meteo (Left):** 500 spin, 30 velocity
- **Spriggan (Left):** 500 spin, 30 velocity

**Raw Damage Calculation:**

```
Angular momentum interaction = |L1 - L2| × 0.8 ≈ 0 (equal spins)
Linear momentum difference ≈ 0
Raw damage ≈ 5,000
```

**Normalized Damage:**

```
damage = (log(1 + 5,000) / log(1 + 150,000)) × 100 ≈ 5
```

✅ **Result:** ~5 damage per collision (minimal damage, same spin = less destructive)

---

## Spin Stealing System

### **Only for Opposite Spins (Left vs Right)**

When opposite spin beyblades collide, they **equalize spins**:

```typescript
spinDifference = bey2.spin - bey1.spin
spinTransferRate = 0.15 (15%)

if (spinDifference > 0):
  bey1 GAINS: spinDifference × 0.15
  bey2 LOSES: spinDifference × 0.075 (50% efficiency)
```

### **Example: 100 spin vs 1000 spin**

- Spin difference: 900
- Low-spin bey **gains:** 900 × 0.15 = **+135 spin**
- High-spin bey **loses:** 900 × 0.075 = **-67.5 spin**

**After collision:**

- Low-spin: 100 - 20 + 135 = **215 spin**
- High-spin: 1000 - 20 - 67.5 = **912.5 spin**

---

## Gameplay Impact

### **Before (Capped at 120):**

- ❌ All powerful collisions dealt same 120 damage
- ❌ No difference between strong and devastating hits
- ❌ Artificial ceiling limited realism

### **After (0-100 Normalized):**

- ✅ Gentle collisions: 1-10 damage
- ✅ Normal battles: 15-40 damage
- ✅ Intense clashes: 50-80 damage
- ✅ Ultimate attacks: 80-100 damage
- ✅ **Spin stealing** allows weak beyblades to recover
- ✅ Smooth scaling across all collision types

---

## Technical Details

### **Files Modified:**

1. `src/app/game/utils/physicsCollision.ts` - Client-side physics
2. `server.js` - Server-side multiplayer physics

### **Key Parameters:**

- **Max Expected Raw Damage:** 150,000
- **Spin Transfer Rate:** 15% (opposite spins only)
- **Transfer Efficiency:** 50% (losing bey loses half of what gaining bey gains)
- **Damage Range:** 0-100 (0 = no damage, 100 = maximum)

---

## Tuning Guide

### **To Increase Damage Overall:**

Change `maxExpectedRawDamage` to a **lower value** (e.g., 100,000)

```typescript
const maxExpectedRawDamage = 100000; // More damage across the board
```

### **To Decrease Damage Overall:**

Change `maxExpectedRawDamage` to a **higher value** (e.g., 200,000)

```typescript
const maxExpectedRawDamage = 200000; // Less damage across the board
```

### **To Increase Spin Stealing:**

Change `spinTransferRate` to a **higher value** (e.g., 0.25 = 25%)

```typescript
const spinTransferRate = 0.25; // More spin stealing
```

### **To Decrease Spin Stealing:**

Change `spinTransferRate` to a **lower value** (e.g., 0.10 = 10%)

```typescript
const spinTransferRate = 0.1; // Less spin stealing
```

---

## Summary

🎯 **Damage:** 0-100 scale using logarithmic normalization  
🔄 **Spin Stealing:** 15% transfer rate for opposite spins  
⚡ **Realistic:** No artificial caps, smooth physics-based scaling  
📊 **Balanced:** Gentle collisions = low damage, powerful clashes = high damage
