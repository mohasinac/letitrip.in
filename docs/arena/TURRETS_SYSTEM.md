# Arena Turrets System

## Overview

Turrets are automated defensive structures that actively attack beyblades in the arena. They add strategic depth by forcing players to navigate threats while battling opponents.

## Key Features

- **5 Attack Types**: Each with unique behavior and danger patterns
- **Destructible & Indestructible**: Tactical choices for arena design
- **Inter-Turret Combat**: Destructible turrets can damage each other
- **High Health**: 500-1000 HP to prevent instant elimination
- **Spawn Options**: Center, manual placement, or shape-based generation
- **Attack Range Visualization**: Shows effective range in preview

---

## Attack Types

### 1. 🎲 Random Attack
- **Description**: Shoots projectiles in random directions
- **Properties**: Damage, range, cooldown
- **Strategy**: Unpredictable threat, forces constant movement

### 2. ⚡ Beam Attack
- **Description**: Continuous beam with charge period
- **Properties**: 
  - Beam Duration: 1-5 seconds
  - Charge Period: 0.5-3 seconds
  - Damage, range, cooldown
- **Strategy**: Predictable charge gives warning, sustained damage during beam

### 3. 🔫 Periodic Bullets
- **Description**: Shoots bullets periodically at regular intervals
- **Properties**:
  - Bullet Speed: 100-500 px/s
  - Bullet Count: 1-5 bullets per shot
  - Damage, range, cooldown
- **Strategy**: Avoidable projectiles, multiple bullets increase hit chance

### 4. 💣 AOE Missile
- **Description**: Area of effect blast at target location
- **Properties**:
  - AOE Radius: 50-150px (blast area)
  - Damage Radius: 20-100px (damage zone within blast)
  - Damage, range, cooldown
- **Strategy**: Large damage zone, affects multiple targets

### 5. 🪃 Boomerang
- **Description**: Throws boomerang that returns to turret
- **Properties**:
  - Return Time: 2-5 seconds
  - Damage, range, cooldown
- **Strategy**: Threatens outbound and return paths

---

## Turret Configuration

### Common Properties
- **Position**: X/Y coordinates (center-relative, ±540px max)
- **Size**: 15-40px radius
- **Health**: 500-1000 HP
- **Indestructible**: Toggle for permanent turrets
- **Color**: Custom or theme-based

### Attack Properties
- **Attack Type**: Dropdown selector (5 types)
- **Attack Damage**: 10-50 per hit
- **Attack Range**: 100-400px
- **Attack Cooldown**: 1-10 seconds between attacks

### Type-Specific Properties
Each attack type has additional controls based on its mechanics (see Attack Types section above).

---

## Spawn Options

### 1. Spawn at Center
- Places single turret at arena center (0, 0)
- Useful for central defensive point

### 2. Manual Placement
- Add turrets at specific positions
- Full control over position and properties
- Adjust X/Y with sliders (-490 to +490px)

### 3. Shape-Based Generation
- Generate multiple turrets evenly around arena
- Options: 2, 3, 4, 6, or 8 turrets
- Places at 35% from center (80% of arena radius)
- Default to periodic attack type with 2 bullets

---

## Destructible vs Indestructible

### Destructible Turrets
- **Health**: 500-1000 HP
- **Vulnerable to**: Players AND other turrets
- **Strategy**: Can be eliminated tactically
- **Visual**: Dashed health ring
- **Use Cases**: 
  - Temporary defenses
  - Strategic positioning puzzles
  - Resource management challenges

### Indestructible Turrets
- **Health**: Infinite (∞)
- **Vulnerable to**: Nothing
- **Strategy**: Must be avoided, cannot be destroyed
- **Visual**: Solid yellow ring
- **Use Cases**:
  - Permanent arena hazards
  - Force specific navigation paths
  - Increase difficulty without elimination option

---

## Inter-Turret Combat

Destructible turrets can damage each other, enabling strategic positioning:

### Tactical Considerations
1. **Crossfire Zones**: Position turrets to accidentally hit each other
2. **Player-Triggered**: Players can bait turrets into attacking each other
3. **Defensive Cascades**: Destroying one turret may expose another
4. **Attack Range Overlap**: Turrets with overlapping ranges may conflict

### Example Scenarios
- **Beam + Periodic**: Beam turret charges while periodic fires, bullets may hit beam turret
- **AOE + Clustered**: AOE blast may damage nearby turrets
- **Random + Random**: Unpredictable crossfire between random attackers

---

## Animation Features

### Turret Animations (Preview)

All turrets include visual animations to show they are active and dangerous:

#### Common Animations
- **Pulsing Attack Range**: Range indicator gently pulses to show active zone
- **Cooldown Indicator**: Circular progress indicator around turret showing cooldown progress
- **Health Ring Glow**: Indestructible turrets have a pulsing yellow glow

#### Attack Type Specific Animations

**🎲 Random Attack**
- Rotating scanning line that sweeps around the turret
- **Cycles through other attack types**: beam, periodic, AOE, boomerang
- Shows current attack type icon on scanning line
- Randomly selects next attack after current one completes
- Each attack fully executes before switching
- Creates unpredictable threat patterns

**⚡ Beam Attack**
- Rotating barrel indicator showing aim direction
- Charging phase before beam activates
- Continuous beam fired at random angle
- Beam has core (white) and outer glow (turret color)
- Pulsing opacity effect on core beam
- Charge period: 0.5-3s (configurable)
- Beam duration: 1-5s (configurable)

**🔫 Periodic Bullets**
- Rotating barrel showing current aim
- Multiple projectile bullets (1-5 configurable)
- Bullets spread in a cone pattern
- Projectiles have pulsing animation
- Fires at random direction each burst
- Bullet speed: 100-500 px/s (configurable)

**💣 AOE Missile**
- **Missile Launch**: Large projectile with flame trail
- Fires to random location within range
- Slower travel speed than bullets (more dramatic)
- **Explosion Animation**: Multi-layered blast effect
  - Outer blast wave (AOE radius)
  - Middle damage zone (damage radius)
  - Inner core (yellow flash)
  - Initial white flash on impact
- Explosion expands and fades over 0.8 seconds
- Waits for explosion to complete before next attack

**🪃 Boomerang**
- Orbiting boomerang projectile
- Follows circular path around turret
- Single rotation per attack (not continuous)
- Trail effect shows path
- Return time matches configuration (2-5s)
- Waits for complete orbit before next attack

#### Random Shooting (No Beyblade Target)

When there are no beyblades in the arena (preview mode), turrets shoot randomly:

1. **Random Attack**: Cycles through all other attack types
   - Beam: Fires beam at random angle
   - Periodic: Fires bullet bursts at random angles
   - AOE: Launches missiles to random locations with explosions
   - Boomerang: Sends boomerang in orbit
   - Shows current attack type icon on scanning line
   - Waits for previous attack to complete before next

2. **Beam Attack**: Fires beam at random angle after charge period
3. **Periodic Attack**: Fires bullet bursts in random directions
4. **AOE Attack**: Launches missiles to random locations with full explosion effects
5. **Boomerang**: Completes full orbit, waits for return before next attack
6. **Cooldown Timing**: All attacks respect configured cooldown periods
7. **Attack Sequencing**: Each attack fully completes before next begins

#### Projectile Physics
- **Bullets**: Fast projectiles with pulsing size
  - Smooth motion from turret to target
  - Fading opacity as projectile travels
  - Expanding/contracting size for pulse effect
  - Trail effect shows projectile path
  - Auto-removed on impact or timeout
  
- **Missiles**: Slower, more dramatic projectiles
  - Larger size (2x bullets)
  - Flame trail (orange/yellow layers)
  - Warhead glow (pulsing yellow)
  - Explosion on impact:
    * Outer blast wave (configurable AOE radius)
    * Middle damage zone (configurable damage radius)  
    * Inner core flash (yellow)
    * Initial white flash (first 30% of explosion)
    * Expands and fades over 0.8 seconds
  
- **Beams**: Continuous laser attacks
  - Core beam (white, pulsing)
  - Outer glow (turret color)
  - Fixed at random angle per attack
  - Duration: 1-5 seconds
  
- **Boomerangs**: Orbital projectiles
  - Single orbit per attack (not continuous)
  - Circular path around turret
  - Trail effect during orbit
  - Returns before next attack

---

## Visual Indicators (Preview)

### Turret Base
- Circle filled with turret color (40% opacity)
- Stroke with full color (2px width)

### Health Ring
- **Destructible**: Dashed ring (1.5px, 60% opacity)
- **Indestructible**: Solid yellow ring (2px, 90% opacity)

### Attack Range
- Dashed circle showing attack range
- 20% opacity in turret color
- 5px dash pattern

### Attack Type Icon
- Large emoji centered in turret (1.2x radius)
- Shows attack behavior at a glance

### Health Display
- **Destructible**: Green text above turret (e.g., "750 HP")
- **Indestructible**: Yellow infinity symbol (∞)

### Damage Display
- Red text below turret with sword icon (⚔️)
- Shows attack damage value

---

## Type Definitions

```typescript
export type TurretAttackType = 
  | "random"
  | "beam" 
  | "periodic"
  | "aoe"
  | "boomerang";

export interface TurretConfig {
  id: number;
  x: number;
  y: number;
  radius: number;
  health: number; // 500-1000
  indestructible?: boolean;
  
  // Attack configuration
  attackType: TurretAttackType;
  attackDamage: number; // 10-50
  attackRange: number; // 100-400px
  attackCooldown: number; // 1-10 seconds
  
  // Type-specific properties
  beamDuration?: number; // 1-5s (beam only)
  beamChargePeriod?: number; // 0.5-3s (beam only)
  bulletSpeed?: number; // 100-500 px/s (periodic only)
  bulletCount?: number; // 1-5 (periodic only)
  aoeRadius?: number; // 50-150px (aoe only)
  aoeDamageRadius?: number; // 20-100px (aoe only)
  boomerangReturnTime?: number; // 2-5s (boomerang only)
  
  color?: string;
  autoPlaced?: boolean;
}
```

---

## Files Modified

### Created
- `src/components/admin/arena-tabs/TurretsTab.tsx` (~600 lines)
  - Spawn options UI
  - Attack type selector
  - All turret configuration controls
  - Type-specific property controls

### Updated
- `src/types/arenaConfigNew.ts`
  - Added `TurretAttackType` type
  - Added `TurretConfig` interface
  - Added `turrets?: TurretConfig[]` to `ArenaConfig`

- `src/components/admin/ArenaPreviewBasic.tsx`
  - Added `TurretRenderer` component
  - Renders turrets with attack range, health ring, icons

- `src/components/admin/ArenaConfiguratorNew.tsx`
  - Added TurretsTab import
  - Added "turrets" to tab navigation
  - Initialized turrets: [] in default config
  - Added turret tab content section

---

## Design Philosophy

### Balance Considerations
1. **High Health (500-1000)**: Prevents instant elimination, requires strategic engagement
2. **Attack Cooldowns**: Gives players windows to act safely
3. **Attack Ranges**: Limited to prevent unavoidable scenarios
4. **Type Variety**: Different threats require different tactics
5. **Inter-Turret Combat**: Rewards positioning and baiting strategies

### Gameplay Impact
- **Increased Complexity**: Players juggle battle + turret threats
- **Strategic Depth**: Turret positioning affects battle flow
- **Risk/Reward**: Destructible turrets can be eliminated for safer zones
- **Skill Expression**: Dodging projectiles, timing movements, baiting attacks

### Arena Design Options
- **Light Defense**: 1-2 turrets with low damage, high cooldown
- **Heavy Defense**: 6-8 turrets with overlapping ranges
- **Puzzle Arena**: Strategic turret positioning for inter-turret combat
- **Boss Arena**: Single indestructible turret with high damage

---

## Testing Checklist

- [x] Navigate to Turrets tab → renders correctly
- [x] Spawn at center → turret created at (0, 0)
- [x] Add manual turret → turret created with default properties
- [x] Generate on shape (2, 3, 4, 6, 8) → turrets at shape vertices
- [x] Select attack type → type-specific controls appear
- [x] Adjust attack properties → values update
- [x] Toggle indestructible → health slider disables, ring changes
- [x] Remove turret → turret disappears from preview
- [x] Clear all → all turrets removed
- [x] Save arena → reload → turrets persist
- [x] Verify attack range visualization in preview
- [x] Test all 5 attack types render correctly
- [x] Verify health display (destructible vs indestructible)
- [x] Verify damage display below turret

---

## Future Enhancements

### Potential Additions
1. **Attack Animation Preview**: Show projectile paths in preview
2. **Turret Targeting Modes**: 
   - Closest target
   - Lowest health target
   - Random target
   - Fixed direction
3. **Attack Effects**:
   - Slow effect
   - Knockback effect
   - Status debuffs
4. **Advanced Turret Types**:
   - Shield generator (protects area)
   - Heal turret (restores HP)
   - Speed booster (increases speed in area)
5. **Turret Upgrade System**: Turrets level up during match
6. **Turret Networks**: Linked turrets with synchronized attacks

### Performance Considerations
- Limit to 8 turrets to prevent visual clutter
- Attack calculations happen server-side (game-server)
- Preview only shows static visualization
- Actual projectile physics handled by game engine

---

## Related Documentation

- **Arena Configurator Overview**: `docs/arena/ARENA_CONFIGURATOR_REFACTORING.md`
- **Obstacles System**: `docs/arena/OBSTACLES_SYSTEM.md`
- **Arena Types**: `docs/refactoring/ARENA_CONFIGURATOR_TABS_EXTRACTION.md`
- **Water Bodies**: `docs/arena/WATER_BODIES_IMPLEMENTATION_COMPLETE.md`

---

**Last Updated**: Phase 4 Complete - Turret System Implementation
**Status**: ✅ Fully Implemented and Tested
