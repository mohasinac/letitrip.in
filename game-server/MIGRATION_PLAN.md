# Game Server Migration Plan - New Arena & State System

## Overview

Migrate game server to use new arena configuration and enhanced state management system.

## Phase 1: Update Type Definitions ✅

### New Types to Add

1. **TurretConfig** - Replace LaserGunConfig
   - Add attack types: beam, periodic, aoe, boomerang
   - Add animation states
2. **WaterBodyConfig** - Enhanced with multiple types
   - Moat, Zone, Wall-based
   - Multiple liquid types with preset effects
3. **SpeedPathConfig** - Enhanced LoopConfig
   - Charge points with pathPosition (0-100%)
   - Auto-placement options
4. **ObstacleConfig** - Simplified

   - Remove type property
   - Use indestructible instead of destructible

5. **ArenaConfig** - Updated
   - Remove: laserGuns, rotationBodies, goalObjects, exits
   - Add: turrets, waterBodies (array), speedPaths
   - Walls now have edge-based configuration

## Phase 2: Update GameState Schema ✅

### New Schema Classes

1. **TurretState** - Replace LaserGunState

   ```typescript
   - attackType: beam | periodic | aoe | boomerang
   - isCharging: boolean
   - chargeProgress: number
   - projectileType: bullet | missile | beam
   ```

2. **ProjectileState** - Enhanced

   ```typescript
   - type: bullet | missile | boomerang
   - isReturning: boolean (for boomerang)
   - explosionRadius: number (for missile)
   ```

3. **WaterBodyState** - Enhanced array
   ```typescript
   - id: string
   - type: moat | zone | wall-based
   - liquidType: water | lava | ice | healing | speedBoost | quicksand | oil | poison
   - effects: WaterEffectConfig
   ```

### Schema Classes to Remove

- GoalObjectState (feature removed)
- LaserGunState (replaced by TurretState)

### Schema Classes to Update

- ObstacleState - Remove type property
- LoopState - Rename to SpeedPathState

## Phase 3: Update Physics Engine ✅

### Collision Detection Updates

1. Update turret projectile collisions

   - Handle missile explosions (AOE damage)
   - Handle boomerang return path
   - Handle beam continuous damage

2. Update water body collisions

   - Support multiple water bodies
   - Apply liquid-specific effects
   - Handle moat/zone/wall-based detection

3. Update obstacle collisions
   - Simplified collision without type checks
   - Use indestructible flag

### New Physics Features

1. **Boomerang Path Calculation**
   - Circular orbit around turret
   - Return collision detection
2. **Missile Explosion**
   - AOE damage radius
   - Multiple target hit detection
3. **Beam Attack**
   - Continuous line collision
   - Duration-based damage

## Phase 4: Update Room Logic ✅

### TryoutRoom.ts Updates

1. Initialize turrets instead of laserGuns
2. Handle multiple waterBodies
3. Remove goalObjects logic
4. Update speedPaths with charge points
5. Wall collision based on edge configuration

### Message Handlers

1. Add turret control messages (if needed)
2. Update charge point dash messages
3. Remove goal object collection messages

## Phase 5: Testing ✅

### Test Cases

1. Turret attack types

   - Beam attack damage over time
   - Periodic bullet spread
   - Missile explosion AOE
   - Boomerang orbit and return

2. Water bodies

   - Multiple water zones
   - Liquid type effects
   - Moat boundaries

3. Speed paths

   - Charge point activation
   - Path position dash targets

4. Obstacles
   - Simplified collision
   - Indestructible flag

## Implementation Order

1. ✅ Update `/src/types/shared.ts` with new types
2. ✅ Update `/src/rooms/schema/GameState.ts` with new schemas
3. ✅ Update `/src/physics/PhysicsEngine.ts` for new collisions
4. ✅ Update `/src/rooms/TryoutRoom.ts` for initialization
5. ✅ Test all features
6. ✅ Update documentation

## Breaking Changes

### For Clients

- `laserGuns` → `turrets` in arena config
- `waterBody` → `waterBodies` (array)
- `loops` → `speedPaths` (though loops is still an alias)
- Removed: `goalObjects`, `rotationBodies`, `exits`

### For Server

- LaserGunState → TurretState
- New projectile types handling
- Multiple water body management
- Simplified obstacle system

## Migration Notes

### Data Migration

- Existing arena configs need conversion
- LaserGun → Turret mapping
- Single waterBody → waterBodies array
- Exit arrays → wall edge configuration

### Backward Compatibility

- Keep `loops` as alias for `speedPaths`
- Gracefully handle missing new properties
- Log warnings for deprecated properties
