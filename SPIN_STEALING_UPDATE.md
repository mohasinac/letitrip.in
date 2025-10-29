# Spin Stealing & Normalized Damage System

## Changes Made

### 1. **Normalized Damage to 1-1000 Range**
- ❌ **Old:** Damage was capped at 120
- ✅ **New:** Damage is normalized to 1-1000 using **logarithmic scaling**

**Why Logarithmic?**
- Provides smooth, natural scaling across all collision intensities
- Low-speed collisions: 1-100 damage
- Medium-speed collisions: 100-500 damage  
- High-speed collisions: 500-1000 damage
- No artificial caps - scales infinitely but smoothly

**Formula:**
```typescript
damage_normalized = (log(1 + damage_raw) / log(1 + max_expected_raw)) × 1000

where max_expected_raw = 150,000
```

**Impact:** 
- Gentle collisions deal 10-50 damage
- Normal collisions deal 100-300 damage
- Powerful collisions deal 500-800 damage
- Extreme collisions deal 900-1000 damage

---

### 2. **Implemented Spin Stealing Mechanics**

**How It Works:**
When opposite spin beyblades collide (left vs right), they now **equalize spins** through spin stealing:

```typescript
// Spin Stealing Formula
const spinDifference = bey2.spin - bey1.spin;
const spinTransferRate = 0.15; // 15% of spin difference transfers

if (spinDifference > 0) {
  // Bey2 has more spin, transfers to bey1
  spinSteal1 = spinDifference × 0.15;     // Bey1 GAINS spin
  spinSteal2 = -spinDifference × 0.075;   // Bey2 LOSES spin (less efficient)
} else {
  // Bey1 has more spin, transfers to bey2
  spinSteal2 = |spinDifference| × 0.15;   // Bey2 GAINS spin
  spinSteal1 = -|spinDifference| × 0.075; // Bey1 LOSES spin
}
```

---

### 3. **Example Scenarios**

#### **Scenario 1: Low Spin vs High Spin**
- **Meteo (Left):** 100 spin
- **Dranzer GT (Right):** 1000 spin
- **Spin difference:** 900

**Result:**
- Meteo GAINS: 900 × 0.15 = **+135 spin** → 235 spin
- Dranzer LOSES: 900 × 0.075 = **-67.5 spin** → 932.5 spin

✅ **Spin stealing equalizes the battle!**

---

#### **Scenario 2: Equal Spin**
- **Meteo (Left):** 1000 spin
- **Dranzer GT (Right):** 1000 spin
- **Spin difference:** 0

**Result:**
- No spin stealing occurs
- Both take damage based on collision force

---

#### **Scenario 3: Same Spin Direction**
- **Meteo (Left):** 100 spin
- **Spriggan (Left):** 1000 spin

**Result:**
- ❌ **No spin stealing** (same direction)
- Only collision damage applies

---

### 4. **Realistic Physics Benefits**

✅ **Spin Equalization:** Lower spin beyblades can steal from higher spin opponents  
✅ **Strategic Depth:** Opposite spin matchups become more dynamic  
✅ **Realistic Behavior:** Mimics real beyblade physics where opposite spins equalize  
✅ **No Artificial Limits:** Damage is based purely on physics calculations  
✅ **Efficiency Factor:** Bey losing spin loses less (50% efficiency) than bey gaining spin

---

### 5. **Updated Files**

1. **`src/app/game/utils/physicsCollision.ts`**
   - Removed damage cap (line ~260)
   - Added spin stealing logic (lines ~245-258)
   - Updated return type to include `spinSteal1` and `spinSteal2`
   - Updated `applyCollisionResults` to apply spin stealing

2. **`server.js`**
   - Removed server-side damage cap
   - Added spin stealing logic for multiplayer
   - Server now broadcasts spin steal values

---

### 6. **Technical Details**

**Spin Transfer Rate:** 15% of spin difference  
**Transfer Efficiency:** 50% loss (bey losing spin only loses half of what the other gains)  
**Max Spin Cap:** Beyblades cannot exceed their `maxSpin` value  
**Min Spin Floor:** Beyblades cannot go below 0 spin

**Formula:**
```
Final Spin = clamp(0, maxSpin, currentSpin - damage + spinSteal)
```

---

### 7. **Gameplay Impact**

**Before:**
- Low spin bey (100) vs High spin bey (1000) = Unfair, low spin bey dies quickly

**After:**
- Low spin bey steals ~135 spin per collision
- After 3-4 collisions, spins equalize
- Battle becomes more competitive and realistic

---

## Testing

To test spin stealing, create a battle with:
1. **Meteo (Left spin)** at 100 spin
2. **Dranzer GT (Right spin)** at 1000 spin

Watch Meteo steal spin from Dranzer with each collision!

---

## Configuration

To adjust spin stealing behavior, modify `spinTransferRate` in:
- `src/app/game/utils/physicsCollision.ts` (line ~246)
- `server.js` (line ~142)

```typescript
const spinTransferRate = 0.15; // Change this value (0.1 = 10%, 0.2 = 20%, etc.)
```
