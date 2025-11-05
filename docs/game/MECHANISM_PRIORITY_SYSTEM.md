# Mechanism Priority System

## Overview

The arena contains multiple interactive mechanisms (speed paths, portals, water bodies, pits). To prevent overlapping triggers and ensure predictable gameplay, a **priority system** determines which mechanisms can activate simultaneously.

## Priority Rule: Speed Path Override

### Primary Rule

**When a beyblade is on a speed path, all other mechanisms are disabled.**

This ensures:

- Clean, uninterrupted speed path traversal
- No accidental portal teleportation while speeding
- No water effects while boosting
- No pit falls while on the path
- Predictable charge point behavior

## Mechanism Types

### 1. Speed Paths (HIGHEST PRIORITY)

**Status**: Active mechanism that overrides others

When beyblade is on speed path:

- ✅ Speed boost applied
- ✅ Spin boost applied (if configured)
- ✅ Friction reduction active
- ✅ Charge points can be triggered
- ❌ Portals disabled
- ❌ Water effects disabled
- ❌ Pit detection disabled
- ❌ Wall collision (still active for safety)

### 2. Portals (MEDIUM PRIORITY)

**Status**: Disabled when on speed path

Normal behavior (when NOT on speed path):

- Detects beyblade entry
- Teleports to another portal
- Respects cooldown timer

Disabled behavior (when ON speed path):

- No entry detection
- Beyblade can pass through/over
- Cooldown continues normally

### 3. Water Bodies (MEDIUM PRIORITY)

**Status**: Disabled when on speed path

Normal behavior (when NOT on speed path):

- Applies liquid effects (damage, heal, speed, etc.)
- Shows particles
- Accumulates time for freeze/stun

Disabled behavior (when ON speed path):

- No effect application
- No particle display
- Time counters don't accumulate

### 4. Pits/Hazards (MEDIUM PRIORITY)

**Status**: Disabled when on speed path

Normal behavior (when NOT on speed path):

- Detects beyblade position
- Triggers fall/elimination
- Applies damage

Disabled behavior (when ON speed path):

- No pit detection
- Beyblade can safely cross over
- Path acts as bridge

### 5. Walls (ALWAYS ACTIVE)

**Status**: Always enabled for safety

- Wall collision always active
- Prevents beyblades from leaving arena
- Applies damage/recoil as configured
- Cannot be disabled

## Configuration

### Speed Path Settings

```typescript
export interface SpeedPathConfig {
  // ... other properties
  disableOtherMechanics?: boolean; // Default: true
}
```

### Default Behavior

By default, `disableOtherMechanics` is `true`, meaning:

- Speed paths automatically disable other mechanisms
- This is the recommended setting for most arenas

### Override Option

Set `disableOtherMechanics: false` to allow:

- Portal teleportation while on speed path (chaotic!)
- Water effects while boosting
- Pit falls while speeding (dangerous!)

**⚠️ Warning**: Setting to `false` creates unpredictable behavior and is not recommended.

## Implementation

### 1. Beyblade State Tracking

```typescript
interface BeybladeState {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  onSpeedPath: boolean; // NEW: Tracks if on speed path
  currentSpeedPath?: number; // ID of current speed path
  speedPathEntryTime?: number; // When entered path
  // ... other state
}
```

### 2. Mechanism Check Order

```typescript
function updateBeyblade(beyblade: BeybladeState, arena: ArenaConfig) {
  // 1. Check speed path (highest priority)
  const onPath = checkSpeedPathCollision(beyblade, arena.speedPaths);

  if (onPath) {
    beyblade.onSpeedPath = true;
    beyblade.currentSpeedPath = onPath.id;
    applySpeedPathEffects(beyblade, onPath);

    // Exit early - skip other mechanisms
    if (onPath.disableOtherMechanics !== false) {
      return;
    }
  } else {
    beyblade.onSpeedPath = false;
    beyblade.currentSpeedPath = undefined;
  }

  // 2. Check portals (only if not on speed path)
  if (!beyblade.onSpeedPath) {
    checkPortalTeleportation(beyblade, arena.portals);
  }

  // 3. Check water bodies (only if not on speed path)
  if (!beyblade.onSpeedPath) {
    applyWaterEffects(beyblade, arena.waterBodies);
  }

  // 4. Check pits (only if not on speed path)
  if (!beyblade.onSpeedPath) {
    checkPitFalls(beyblade, arena.pits);
  }

  // 5. Check walls (always)
  checkWallCollisions(beyblade, arena.wall);
}
```

### 3. Speed Path Detection

```typescript
function checkSpeedPathCollision(
  beyblade: BeybladeState,
  speedPaths: SpeedPathConfig[]
): SpeedPathConfig | null {
  for (const path of speedPaths) {
    const distanceFromCenter = Math.sqrt(
      beyblade.position.x ** 2 + beyblade.position.y ** 2
    );

    // Check if beyblade is within path radius range
    const pathWidth = path.ringThickness || 2; // Default 2em width
    const innerRadius = path.radius - pathWidth / 2;
    const outerRadius = path.radius + pathWidth / 2;

    if (
      distanceFromCenter >= innerRadius &&
      distanceFromCenter <= outerRadius
    ) {
      return path; // Beyblade is on this speed path
    }
  }

  return null; // Not on any speed path
}
```

## Gameplay Examples

### Example 1: Speed Path Over Water

```
Arena Layout:
- Speed path (circle, radius 15em)
- Water body (moat, inner radius 10em, thickness 8em)

Scenario:
1. Beyblade enters water at radius 12em
   → Water effects apply (slowdown)
2. Beyblade reaches speed path at radius 15em
   → Enters speed path
   → Water effects immediately stop
   → Speed boost applied
3. Beyblade exits speed path at radius 15em
   → Speed boost stops
   → Water effects resume
```

### Example 2: Speed Path Through Portal

```
Arena Layout:
- Speed path (rectangle, rotated)
- Portal at position (10, 10)

Scenario:
1. Beyblade traveling on speed path
2. Path crosses portal position
3. Beyblade passes through portal location
   → Portal does NOT trigger
   → Beyblade continues on speed path
4. Beyblade exits speed path
5. If beyblade then hits portal
   → Portal triggers normally
```

### Example 3: Charge Point on Speed Path

```
Arena Layout:
- Speed path with 3 charge points
- Water body covering same area

Scenario:
1. Beyblade enters speed path
   → Water effects disabled
2. Beyblade reaches charge point
   → Charge point triggers normally ✅
   → Can dash to center/opponent
3. Dash exits speed path
   → Water effects resume during dash
```

### Example 4: Path Duration Limits

```
Speed Path Config:
- minPathDuration: 2 seconds
- maxPathDuration: 5 seconds

Scenario:
1. Beyblade enters speed path
   → Timer starts
2. At 1.5 seconds, beyblade tries to exit
   → Forced to stay on path (min 2s)
3. At 2.5 seconds, beyblade can exit voluntarily
   → Or continue on path
4. At 5 seconds, automatic ejection
   → Forced off path (max 5s)
   → Other mechanisms resume
```

## Visual Indicators

### On Speed Path

- Beyblade glows with path color
- Speed trail particles
- HUD shows "ON SPEED PATH" indicator
- Portal icons dimmed/grayed out
- Water splash effects hidden

### Off Speed Path

- Normal beyblade appearance
- Portal icons fully visible
- Water particles visible
- All mechanisms active

## Edge Cases

### Case 1: Multiple Speed Paths Overlap

**Resolution**: First detected path takes priority

```typescript
// In checkSpeedPathCollision, return first match
for (const path of speedPaths) {
  if (isOnPath(beyblade, path)) {
    return path; // Use this one, ignore others
  }
}
```

### Case 2: Speed Path + Portal at Same Position

**Resolution**: Speed path wins

```typescript
if (beyblade.onSpeedPath) {
  // Skip portal check
  return;
}
```

### Case 3: Exiting Speed Path Into Water

**Resolution**: Water effects apply immediately after exit

```typescript
// Frame N: On speed path
beyblade.onSpeedPath = true; // No water effects

// Frame N+1: Just exited
beyblade.onSpeedPath = false;
applyWaterEffects(); // Water effects resume instantly
```

### Case 4: Charge Point Dash Into Portal

**Resolution**: Dash exits speed path, portal can trigger

```typescript
// Charge point triggered
dashToTarget();
beyblade.onSpeedPath = false; // Dash exits path

// Next frame
if (isInPortal()) {
  teleport(); // Portal can now trigger
}
```

## Balance Considerations

### Advantages of Speed Paths

- ✅ Safe traversal through hazards
- ✅ Guaranteed speed boost
- ✅ Predictable behavior
- ✅ Strategic positioning tool

### Disadvantages of Speed Paths

- ⚠️ Forced trajectory (limited control)
- ⚠️ Duration limits (min/max)
- ⚠️ Exposed to opponents
- ⚠️ Predictable movement

### Design Recommendations

1. **Don't stack too many mechanisms**

   - If speed path, minimize water/portals in same area
   - Let speed path be the primary feature

2. **Use paths strategically**

   - Place over dangerous terrain (lava, quicksand)
   - Create safe routes through hazard zones
   - Reward risk-taking with speed boosts

3. **Duration balance**

   - Short paths (2-3s): Quick boost, frequent entry/exit
   - Long paths (4-5s): Committed traversal, strategic decision

4. **Charge point placement**
   - Place at path midpoint for strategic dash opportunity
   - Don't place too close to path exit
   - Consider dash destination (center vs opponent)

## Testing Checklist

### Speed Path Priority

- [ ] Enter speed path → other mechanisms stop
- [ ] Exit speed path → other mechanisms resume
- [ ] Pass through portal while on path → no teleport
- [ ] Pass through water while on path → no effects
- [ ] Pass over pit while on path → no fall

### Charge Points

- [ ] Trigger charge point on path → dash works
- [ ] Dash exits path → mechanisms re-enable
- [ ] Dash into portal → portal triggers
- [ ] Dash into water → water effects apply

### Duration Limits

- [ ] Try exit before minPathDuration → forced to stay
- [ ] Exit after minPathDuration → successful exit
- [ ] Reach maxPathDuration → automatic ejection

### Visual Feedback

- [ ] Portal icons dim when on path
- [ ] Water particles stop when on path
- [ ] Speed boost particles show
- [ ] HUD indicator displays

## Status

✅ **IMPLEMENTED** - Speed path priority system with mechanism override

Speed paths now provide safe, predictable traversal through arena hazards without interference from other mechanics!
