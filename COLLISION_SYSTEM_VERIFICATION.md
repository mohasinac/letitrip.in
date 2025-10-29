# Collision System Verification - Single Player & Multiplayer

## ✅ CONFIRMED: AI (Single-Player) Uses New Physics System

### Code Location

**File:** `src/app/game/hooks/useGameState.ts`  
**Lines:** 662-735

### Collision Detection Loop (Applies to ALL modes)

```typescript
// Check collisions
for (let i = 0; i < newState.beyblades.length; i++) {
  for (let j = i + 1; j < newState.beyblades.length; j++) {
    const bey1 = newState.beyblades[i];
    const bey2 = newState.beyblades[j];

    if (
      !bey1.isDead &&
      !bey1.isOutOfBounds &&
      !bey2.isDead &&
      !bey2.isOutOfBounds
    ) {
      if (checkCollision(bey1, bey2)) {
        // Store pre-collision state for comparison
        const bey1SpinBefore = bey1.spin;
        const bey2SpinBefore = bey2.spin;

        // ✅ Use NEW physics-based collision system
        // This line runs for BOTH single-player AND multiplayer
        const collisionResult = resolvePhysicsCollision(bey1, bey2);

        // The following block ONLY runs in multiplayer (sends to server)
        if (isMultiplayer && onCollision) {
          // ... multiplayer-specific server sync code ...
        }
      }
    }
  }
}
```

## How It Works

### Single-Player (Player vs AI)

1. **Collision Detection:** Loop checks all beyblades
2. **Physics Calculation:** `resolvePhysicsCollision(bey1, bey2)` calculates damage using Newton's laws
3. **Local Application:** Damage, knockback, and velocity changes applied immediately
4. **No Server Sync:** `isMultiplayer` is false, so server sync is skipped

### Multiplayer (Player vs Player)

1. **Collision Detection:** Loop checks all beyblades
2. **Physics Calculation:** `resolvePhysicsCollision(bey1, bey2)` calculates damage using Newton's laws (same as single-player)
3. **Local Application:** Damage, knockback, and velocity changes applied immediately
4. **Server Sync:** `onCollision()` sends collision data to server for authoritative validation
5. **Server Calculation:** Server independently calculates damage and broadcasts to both clients

## Physics Calculations (Applied to Both Modes)

### From `physicsCollision.ts`:

1. **Angular Velocity:**

   ```
   ω = (spin / maxSpin) × 20 rotations/sec × direction
   ```

2. **Moment of Inertia:**

   ```
   I = 0.5 × mass × radius²
   ```

3. **Angular Momentum:**

   ```
   L = I × ω
   ```

4. **Linear Momentum:**

   ```
   p = mass × velocity
   ```

5. **Collision Force:**

   ```
   F = (momentum_difference + total_momentum × 0.3) × relative_speed × 0.01
       + angular_momentum_interaction × 0.02
   ```

6. **Damage Distribution:**

   - Based on mass ratios (heavier bey takes less damage)
   - Modified by attack multipliers (1.0x normal, 1.5x heavy, 2.0x ultimate)
   - Adjusted for spin resistance
   - Opposite spins: 1.5x multiplier to angular momentum interaction
   - Same spins: 0.8x multiplier to angular momentum interaction

7. **Knockback:**
   ```
   knockback_magnitude = (collision_force / mass) × mass_ratio × charge_dash_multiplier
   ```

## Verification Steps

### To Test Single-Player AI Physics:

1. **Start Single-Player Game**
2. **Observe Collision Behavior:**

   - Opposite spin collisions should cause more damage
   - Heavier beyblades should take less damage
   - Velocity and spin should affect damage
   - Knockback should be physics-based (not fixed)

3. **Check Console Logs:**
   - No "opponent collision" messages (only in multiplayer)
   - Collisions happen instantly (no server delay)

### To Test Multiplayer Physics:

1. **Start Multiplayer Game** (2 browser windows)
2. **Observe Collision Behavior:**

   - Same physics as single-player
   - Server collision logs in terminal
   - Both clients should see consistent results

3. **Check Console Logs:**
   - "Server collision result" messages
   - Damage values from server

## Old vs New System Comparison

### Old System (Acceleration-Based) - REMOVED

```typescript
// OLD - No longer used
damage = (acceleration + opponent_acceleration × multiplier) × 0.9
```

- ❌ Only used acceleration (derived from velocity / 10)
- ❌ Didn't consider mass or radius
- ❌ Simple formula, not physics-based
- ❌ Distance-dependent (removed per your request)

### New System (Physics-Based) - ACTIVE

```typescript
// NEW - Active for both single-player and multiplayer
damage = (momentum_based + energy_factor) × attack_multiplier × spin_resistance
```

- ✅ Uses mass, velocity, spin speed, spin direction, radius
- ✅ Conservation of momentum
- ✅ Rotational inertia (I = 0.5mr²)
- ✅ Angular momentum (L = Iω)
- ✅ No distance dependency (as requested)
- ✅ No acceleration dependency for damage (as requested)

## Summary

✅ **Single-Player AI** uses the new physics-based collision system  
✅ **Multiplayer** uses the same physics system with server validation  
✅ **Old acceleration-based system** is no longer in use  
✅ **Both modes** calculate damage using Newton's laws

The only difference between modes:

- **Single-player:** Local physics only
- **Multiplayer:** Local physics + server validation/sync
