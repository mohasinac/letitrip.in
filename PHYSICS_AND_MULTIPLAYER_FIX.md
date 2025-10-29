# Physics-Based Collision & Multiplayer Control Fix

## Changes Implemented

### 1. **Physics-Based Damage Calculation**

- Created `physicsCollision.ts` with Newton's laws implementation
- Uses linear momentum (p = mv), angular momentum (L = Iω), rotational inertia (I = 0.5mr²)
- Considers mass, velocity, spin speed, spin direction, and radius
- Opposite spins cause 1.5x more damage (angular momenta add)
- Same spins cause less damage (angular momenta subtract)
- Server-side calculation for multiplayer authority

### 2. **Loop Direction Fix**

- ✅ Left spin = counter-clockwise (direction multiplier = -1)
- ✅ Right spin = clockwise (direction multiplier = +1)
- Verified in both `physicsCollision.ts` and `useGameState.ts`

### 3. **Spin Value Protection**

- All spin calculations use `Math.max(0, spin - damage)`
- Beyblades cannot go below 0 spin
- Spin reaching 0 triggers `isDead = true`

### 4. **Multiplayer Control Fix (CRITICAL)**

**Problem**: Both players were controlling the same beyblade (player 1's bey)

- Both clients created beyblades with index 0 = `isPlayer: true`
- Both clients looked for `b.isPlayer === true` to find "their" beyblade

**Solution**: Use player number-based identification in multiplayer

- Player 1 controls beyblade at index 0
- Player 2 controls beyblade at index 1
- Updated all beyblade finding logic to consider `playerNumber`

### 5. **Power System (Replacing Acceleration)**

- Renamed `acceleration` → `power`
- Power increases by 5 per second
- Power increases by 10 per second (2x) during loops or charge dash
- Power consumption:
  - Dodge: 10 power
  - Heavy Attack: 15 power
  - Ultimate Attack: 25 power

### 6. **Special Moves During Automated States**

- Players can now trigger special moves during loops and charge dash
- Special moves no longer lock controls
- Moves travel in direction of joystick/mouse until reaching target distance
- Removed automatic "no control" after special moves

### 7. **Server-Side Collision**

- Server calculates authoritative damage for multiplayer
- Clients send collision event with beyblade states
- Server broadcasts damage/knockback to both clients
- Prevents desync and cheating

## Files Modified

1. `src/app/game/utils/physicsCollision.ts` - NEW FILE
2. `src/app/game/hooks/useGameState.ts` - Power system, multiplayer control fix
3. `src/app/game/hooks/useMultiplayer.ts` - Server collision handler
4. `src/app/game/components/EnhancedBeybladeArena.tsx` - Server collision integration
5. `server.js` - Server-side physics calculation
6. `src/app/game/utils/collisionUtils.ts` - Kept for backwards compatibility

## Testing Required

1. Single-player: Verify power system works (increases by 5/sec, 10/sec in loops)
2. Multiplayer: Test that Player 2 can control their beyblade
3. Collisions: Verify damage values are realistic and consistent
4. Special moves: Test that moves work during loops/charge dash
5. Spin directions: Verify left spins CCW, right spins CW
