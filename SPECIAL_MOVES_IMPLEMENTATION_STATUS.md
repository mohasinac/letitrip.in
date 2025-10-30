# 🎬 Cinematic Special Moves System - Implementation Status

## ✅ Completed Components

### 1. Type System Extensions ✅

**File**: `/src/types/beybladeStats.ts`

**Changes**:

- Extended `SpecialMoveFlags` interface from 11 properties to 50+ properties
- Added 12 new cinematic special move flag types:

  - `orbitalAttack` - Multi-strike orbiting attack
  - `timeSkip` - Time manipulation and freeze
  - `rushAttack` - Rapid dash attacks with trails
  - `shieldDome` - Ultimate defense with absorption
  - `berserkMode` - High damage, low defense berserker
  - `vortexMode` - Spinning vortex that drains enemies
  - `phantomMode` - Invisibility and phasing
  - `explosion` - Area damage with knockback
  - `clone` - Create decoy clones
  - `magnetMode` - Attract or repel enemies
  - `overdrive` - Extreme boost with recoil
  - `cinematicSettings` - Banner, slow-mo, shake, flash, sound

- Updated `SpecialMove` interface:

  - `powerCost` comment changed from (0-25) to (0-100)
  - Added `category` field: 'offensive' | 'defensive' | 'utility' | 'ultimate'

- Made `name` field optional in `BeybladeStats` (deprecated in favor of `displayName`)

**Status**: ✅ Complete, 0 compilation errors

---

### 2. Example Configurations ✅

**File**: `/src/constants/specialMoveExamples.ts`

**Contents** (400+ lines):

- **8 Complete Example Special Moves**:

  1. `BARRAGE_OF_ATTACKS` (Attack Type)

     - Orbital attack at 4x radius
     - 3 attacks at 120° intervals
     - 200 damage per hit
     - Opponent loses control
     - Cinematic effects: banner, slow-mo, camera shake

  2. `TIME_SKIP` (Stamina Type)

     - Freeze opponent for 3 seconds
     - Reposition opponent toward center
     - User loops in outer ring (no charge points)
     - Drain 400 spin on completion
     - Cinematic effects: banner, slow-mo, screen flash

  3. `STORM_FURY` (Attack Type)

     - Rush attack with 5 rapid dashes
     - 150 damage per dash
     - 3x speed boost
     - Motion trail effects

  4. `FORTRESS_SHIELD` (Defense Type)

     - Shield dome with damage absorption
     - Reflect 50% damage back
     - Heal 100 spin/sec
     - Push enemies away

  5. `BERSERK_RAMPAGE` (Attack Type)

     - 2.5x damage boost
     - 1.8x speed boost
     - Take 2x damage (50% defense reduction)
     - High risk, high reward

  6. `VORTEX_DRAIN` (Stamina Type)

     - Pull enemies within 200px
     - Steal 80 spin/sec from each
     - Heal from stolen spin
     - Slow opponents to 70% speed

  7. `PHANTOM_STRIKE` (Balanced Type)

     - 30% opacity (invisible)
     - Phase through walls and enemies
     - Teleport behind opponent on hit
     - 1.7x damage

  8. `SUPERNOVA` (Ultimate Type)
     - 250px explosion radius
     - 500 spin damage
     - 3x knockback force
     - 200 self-damage (recoil)

- **Helper Function**: `createCustomSpecialMove()`
  - Allows runtime special move generation
  - Pass in flags and get complete SpecialMove object

**Status**: ✅ Complete, demonstrates all flag combinations

---

### 3. Cinematic Banner Component ✅

**File**: `/src/components/game/SpecialMoveBanner.tsx`

**Features** (350+ lines):

- **Main Component**: `<SpecialMoveBanner>`
  - Props: `moveName`, `userName`, `show`, `color`, `duration`, `onComplete`
  - Displays: User name (large), Move name (huge), "SPECIAL MOVE ACTIVATED!" (subtitle)
  - Animations:
    - `slideInFromBottom` - Banner slides up from bottom (0.8s)
    - `pulse` - Pulsing scale effect (1s infinite)
    - `glow` - Glowing border effect (1.5s infinite)
- **Visual Effects**:

  - Gradient background overlay (dark to transparent)
  - Glowing animated border
  - Corner decorations with spinning animations
  - Energy bars on left and right sides
  - 20 animated particles floating around
  - Material-UI styled components

- **Compact Variant**: `<CompactSpecialMoveBanner>`

  - Smaller banner for rapid-fire special moves
  - Less intrusive, faster animations
  - Useful for moves with < 2 second duration

- **Auto-hide**: Automatically hides after `duration` milliseconds
- **Callback**: Calls `onComplete()` when banner finishes

**Status**: ✅ Complete, ready to integrate

---

### 4. Floating Damage Numbers System ✅

**File**: `/src/app/game/utils/floatingNumbers.ts`

**Features** (300+ lines):

- **Data Structure**: `FloatingNumber` interface

  ```typescript
  {
    id: string,
    value: number,
    type: 'damage' | 'heal' | 'drain',
    position: Vector2D,
    velocity: Vector2D,
    opacity: number,
    scale: number,
    lifetime: number,
    maxLifetime: number,
    color: string
  }
  ```

- **Core Functions**:

  - `addFloatingNumber(value, type, position)` - Create single number
  - `updateFloatingNumbers(deltaTime)` - Physics simulation (float, fade, scale)
  - `drawFloatingNumbers(ctx)` - Canvas rendering with outline, fill, glow

- **Special Variants**:

  - `addCriticalHitNumber(value, position)` - Yellow, 1.5x scale
  - `addComboNumber(comboCount, position)` - Orange "X COMBO!"
  - `addMultipleFloatingNumbers(values, type, position, stagger)` - Batch numbers with timing offset
  - `addFloatingText(text, position, color)` - Custom text (e.g., "PERFECT!")

- **Physics**:

  - Floats upward with random horizontal drift
  - Velocity damping (0.98 multiplier each frame)
  - Opacity fade from 1.0 → 0.0 over 2 seconds
  - Scale increase from 1.0 → 1.2

- **Colors**:
  - Damage: Red (#ff4444)
  - Heal: Green (#44ff44)
  - Drain: Purple (#ff44ff) with "−X★" format
  - Critical: Yellow (#ffff00)
  - Combo: Orange (#ff8800)

**Status**: ✅ Complete, ready to integrate

---

### 5. Power System Update ✅

**File**: `/src/constants/beybladeStatsData.ts`

**Changes**:

- All 8 default Beyblades updated:

  - `powerCost`: 20-25 → **100** (all special moves now cost full power bar)
  - Removed duplicate `name` field (was slug like "dragoon-gt")
  - Kept `displayName` for proper names ("Dragoon GT")
  - Kept `id` for slugs ("dragoon-gt")
  - `fileName` unchanged ("dragoon GT.svg")

- **Updated Beyblades**:
  1. Dragoon GT - Dragon Storm (100 power)
  2. Dran Buster - Buster Crash (100 power)
  3. Dranzer GT - Flame Shield (100 power)
  4. Hells Hammer - Iron Fortress (100 power)
  5. Meteo L-Drago - Absorb Mode (100 power)
  6. Storm Pegasus - Pegasus Star Blast (100 power)
  7. Legend Spriggan - Counter Break (100 power)
  8. Victory Valkyrie - Victory Rush (100 power)

**Type Update**:

- `/src/types/beybladeStats.ts`:
  - Made `name` optional with `@deprecated` comment
  - Backward compatible (existing code won't break)

**Status**: ✅ Complete, 0 compilation errors

---

### 6. Documentation ✅

**File**: `/CINEMATIC_SPECIAL_MOVES_COMPLETE.md`

**Contents**:

- System overview and power system changes
- Detailed documentation for all 12 special move types
- Cinematic features guide (banners, floating numbers)
- Example custom special move creation
- Visual effects guide with color codes
- Admin panel integration instructions
- Testing checklist and debug commands
- API reference for all functions
- Tips and best practices for balancing

**Status**: ✅ Complete (5000+ words)

---

## 🔄 Next Implementation Steps

### Step 1: Update Special Moves Manager ⏳

**File**: `/src/app/game/utils/specialMovesManager.ts`

**Required Changes**:

1. Add handler for `orbitalAttack` flag:

   - Calculate orbit path around opponent
   - Track current orbit angle
   - Trigger attacks at 360/attackCount intervals
   - Apply damagePerHit on each attack
   - Show floating damage numbers

2. Add handler for `timeSkip` flag:

   - Freeze opponent (set `isFrozen: true`)
   - Reposition opponent toward center/edge
   - Force user into specified ring type (outer/middle)
   - Disable charge point triggers during loop
   - Apply spin drain when effect ends
   - Show floating drain number

3. Add handlers for other complex flags:

   - `rushAttack`: Multiple rapid dashes
   - `shieldDome`: Absorb/reflect damage
   - `berserkMode`: Damage boost with defense penalty
   - `vortexMode`: Pull and drain nearby enemies
   - `phantomMode`: Invisibility and teleportation
   - `explosion`: Area damage with knockback
   - `clone`: Create decoy clones
   - `magnetMode`: Attract/repel forces
   - `overdrive`: Max boost with recoil

4. Add cinematic triggers:
   - Check `cinematicSettings.showBanner`
   - Trigger `<SpecialMoveBanner>` component
   - Apply slow motion (`timeScale`)
   - Trigger camera shake effect
   - Trigger screen flash effect
   - Play sound effect

**Estimated Complexity**: High (500+ lines of new logic)

---

### Step 2: Game Constants Update ⏳

**Files**:

- `/src/app/game/constants/gameConstants.ts` (or similar)
- `/src/app/game/components/GameControls.tsx`

**Required Changes**:

1. Update max power constant:

   ```typescript
   // OLD
   const MAX_POWER = 25;
   const POWER_GAIN_RATE = 5; // per second
   const POWER_GAIN_RATE_IN_LOOP = 10; // per second

   // NEW
   const MAX_POWER = 100;
   const POWER_GAIN_RATE = 20; // per second (4x to keep similar timing)
   const POWER_GAIN_RATE_IN_LOOP = 40; // per second (4x)
   ```

2. Update UI power bar:

   - Change max value to 100
   - Update percentage calculations
   - Update tooltip text ("Requires 100 power")

3. Update special move activation check:

   ```typescript
   // OLD
   if (beyblade.power >= specialMove.powerCost) { ... }

   // NEW (no change, but verify cost is 100)
   if (beyblade.power >= 100) { ... }
   ```

**Estimated Complexity**: Low (10 lines)

---

### Step 3: Integrate Banner into Game UI ⏳

**File**: `/src/app/game/page.tsx` or `/src/app/game/components/EnhancedBeybladeArena.tsx`

**Required Changes**:

1. Import banner component:

   ```typescript
   import { SpecialMoveBanner } from "@/components/game/SpecialMoveBanner";
   ```

2. Add state for banner:

   ```typescript
   const [showBanner, setShowBanner] = useState(false);
   const [bannerData, setBannerData] = useState({
     moveName: "",
     userName: "",
     color: "#ff4444",
   });
   ```

3. Add banner to JSX (above canvas):

   ```tsx
   <SpecialMoveBanner
     moveName={bannerData.moveName}
     userName={bannerData.userName}
     show={showBanner}
     color={bannerData.color}
     duration={2000}
     onComplete={() => setShowBanner(false)}
   />
   ```

4. Trigger banner in special move activation:
   ```typescript
   function activateSpecialMove(beyblade, stats) {
     if (stats.specialMove.flags.cinematicSettings?.showBanner) {
       setBannerData({
         moveName: stats.specialMove.name,
         userName: beyblade.id === "player1" ? "PLAYER 1" : "PLAYER 2",
         color: getColorForCategory(stats.specialMove.category),
       });
       setShowBanner(true);
     }
     // ... apply effects
   }
   ```

**Estimated Complexity**: Low (50 lines)

---

### Step 4: Integrate Floating Numbers into Game Loop ⏳

**File**: `/src/app/game/page.tsx` or game rendering logic

**Required Changes**:

1. Import floating numbers:

   ```typescript
   import {
     addFloatingNumber,
     updateFloatingNumbers,
     drawFloatingNumbers,
     clearFloatingNumbers,
   } from "./utils/floatingNumbers";
   ```

2. Update game loop:

   ```typescript
   function gameLoop(deltaTime) {
     // ... existing game logic

     // Update floating numbers physics
     updateFloatingNumbers(deltaTime);

     // ... collision detection, etc.
   }
   ```

3. Update render function:

   ```typescript
   function render(ctx) {
     // ... draw arena, beyblades, etc.

     // Draw floating numbers (always on top)
     drawFloatingNumbers(ctx);
   }
   ```

4. Add numbers on damage events:

   ```typescript
   function onCollision(bey1, bey2, damage) {
     // ... apply damage

     // Show damage number
     addFloatingNumber(damage, "damage", bey2.position);
   }

   function onSpinSteal(stealer, victim, spinAmount) {
     // ... apply spin steal

     // Show drain on victim
     addFloatingNumber(spinAmount, "drain", victim.position);

     // Show heal on stealer
     addFloatingNumber(spinAmount, "heal", stealer.position);
   }
   ```

**Estimated Complexity**: Medium (100 lines)

---

### Step 5: Implement Orbital Attack Logic ⏳

**File**: `/src/app/game/utils/specialMovesManager.ts`

**Required Implementation**:

```typescript
interface OrbitalAttackState {
  beyblade: GameBeyblade;
  opponent: GameBeyblade;
  config: OrbitalAttackConfig;
  currentAngle: number;
  attacksRemaining: number;
  nextAttackAngle: number;
  startTime: number;
}

const activeOrbitalAttacks: Map<string, OrbitalAttackState> = new Map();

function startOrbitalAttack(
  beyblade: GameBeyblade,
  opponent: GameBeyblade,
  flags: SpecialMoveFlags
) {
  if (!flags.orbitalAttack?.enabled) return;

  const config = flags.orbitalAttack;
  const angleStep = 360 / config.attackCount;

  activeOrbitalAttacks.set(beyblade.id, {
    beyblade,
    opponent,
    config,
    currentAngle: 0,
    attacksRemaining: config.attackCount,
    nextAttackAngle: angleStep,
    startTime: Date.now(),
  });
}

function updateOrbitalAttacks(deltaTime: number) {
  activeOrbitalAttacks.forEach((state, id) => {
    // Calculate orbit position
    const orbitRadius = state.opponent.radius * state.config.orbitRadius;
    const angleRadians = (state.currentAngle * Math.PI) / 180;

    state.beyblade.position.x =
      state.opponent.position.x + Math.cos(angleRadians) * orbitRadius;
    state.beyblade.position.y =
      state.opponent.position.y + Math.sin(angleRadians) * orbitRadius;

    // Update angle
    state.currentAngle += state.config.orbitSpeed * deltaTime * 60;
    if (state.currentAngle >= 360) state.currentAngle -= 360;

    // Check if reached attack angle
    if (
      state.currentAngle >= state.nextAttackAngle &&
      state.attacksRemaining > 0
    ) {
      // ATTACK!
      const damage = state.config.damagePerHit;
      state.opponent.spin -= damage;

      // Show damage number
      addFloatingNumber(damage, "damage", state.opponent.position);

      // Camera shake
      triggerCameraShake(3, 0.3);

      // Next attack angle
      state.attacksRemaining--;
      state.nextAttackAngle += 360 / state.config.attackCount;

      if (state.attacksRemaining === 0) {
        // Orbital attack complete
        activeOrbitalAttacks.delete(id);
        state.beyblade.opponentLosesControl = false; // Restore control
      }
    }
  });
}
```

**Estimated Complexity**: High (200 lines with all edge cases)

---

### Step 6: Implement Time Skip Logic ⏳

**File**: `/src/app/game/utils/specialMovesManager.ts`

**Required Implementation**:

```typescript
interface TimeSkipState {
  beyblade: GameBeyblade;
  opponent: GameBeyblade;
  config: TimeSkipConfig;
  startTime: number;
  freezeEndTime: number;
  loopEndTime: number;
  originalOpponentPosition: Vector2D;
}

const activeTimeSkips: Map<string, TimeSkipState> = new Map();

function startTimeSkip(
  beyblade: GameBeyblade,
  opponent: GameBeyblade,
  flags: SpecialMoveFlags
) {
  if (!flags.timeSkip?.enabled) return;

  const config = flags.timeSkip;
  const now = Date.now();

  // Freeze opponent
  opponent.isFrozen = true;
  opponent.velocity = { x: 0, y: 0 };

  // Calculate new opponent position
  let targetX = opponent.position.x;
  let targetY = opponent.position.y;

  if (config.repositionOpponent?.enabled) {
    const direction = config.repositionOpponent.direction;
    const distance = opponent.radius * config.repositionOpponent.distance;

    if (direction === "center") {
      // Move toward center
      const dx = 400 - opponent.position.x; // Arena center X
      const dy = 400 - opponent.position.y; // Arena center Y
      const mag = Math.sqrt(dx * dx + dy * dy);
      targetX = opponent.position.x + (dx / mag) * distance;
      targetY = opponent.position.y + (dy / mag) * distance;
    }
  }

  // Animate repositioning (smooth lerp)
  animatePosition(opponent, { x: targetX, y: targetY }, 0.5); // 0.5 seconds

  // Force user into loop
  if (config.loopRing?.enabled) {
    beyblade.isInLoop = true;
    beyblade.loopType = config.loopRing.ringType; // 'outer' or 'middle'
    beyblade.disableChargePoints = config.loopRing.disableChargePoints;
  }

  activeTimeSkips.set(beyblade.id, {
    beyblade,
    opponent,
    config,
    startTime: now,
    freezeEndTime: now + config.freezeDuration * 1000,
    loopEndTime:
      now + (config.loopRing?.duration || config.freezeDuration) * 1000,
    originalOpponentPosition: { ...opponent.position },
  });

  // Trigger cinematic effects
  addFloatingText("TIME SKIP!", beyblade.position, "#00ffff");
  triggerScreenFlash("#00ffff", 0.5, 0.3);
  triggerSlowMotion(0.3, 1.0);
}

function updateTimeSkips(currentTime: number) {
  activeTimeSkips.forEach((state, id) => {
    // Check if freeze ended
    if (currentTime >= state.freezeEndTime && state.opponent.isFrozen) {
      // Unfreeze opponent
      state.opponent.isFrozen = false;

      // Apply spin drain
      if (state.config.spinDrainOnEnd) {
        state.opponent.spin -= state.config.spinDrainOnEnd;
        addFloatingNumber(
          state.config.spinDrainOnEnd,
          "drain",
          state.opponent.position
        );
      }
    }

    // Check if loop ended
    if (currentTime >= state.loopEndTime) {
      // Exit loop
      state.beyblade.isInLoop = false;
      state.beyblade.disableChargePoints = false;

      // Time skip complete
      activeTimeSkips.delete(id);
      addFloatingText("TIME RESUME!", state.beyblade.position, "#ffffff");
    }
  });
}
```

**Estimated Complexity**: High (300 lines with animations and edge cases)

---

### Step 7: Testing & Debugging ⏳

**Required Tests**:

1. **Power System**:

   - [ ] Power builds to 100 over ~5 seconds (20/sec rate)
   - [ ] Power builds to 100 in ~2.5 seconds in loops (40/sec rate)
   - [ ] Special moves require exactly 100 power
   - [ ] Power depletes to 0 after activation

2. **Banner System**:

   - [ ] Banner shows for all special moves
   - [ ] Move name displays correctly
   - [ ] User name shows "PLAYER 1" or "PLAYER 2"
   - [ ] Banner color matches move category
   - [ ] Banner hides after 2 seconds
   - [ ] Animations are smooth (no stuttering)

3. **Floating Numbers**:

   - [ ] Damage numbers show in red
   - [ ] Heal numbers show in green
   - [ ] Drain numbers show in purple with star
   - [ ] Numbers float upward and fade
   - [ ] Multiple numbers spread out (no overlap)
   - [ ] Numbers visible on both light/dark backgrounds

4. **Orbital Attack**:

   - [ ] User orbits opponent at correct radius
   - [ ] Attacks trigger at correct angles
   - [ ] Correct number of attacks (e.g., 3 at 120°)
   - [ ] Damage applies and shows floating number
   - [ ] Opponent loses control during orbit
   - [ ] User returns to normal after attacks complete

5. **Time Skip**:

   - [ ] Opponent freezes completely
   - [ ] Opponent repositions toward center
   - [ ] User enters loop ring correctly
   - [ ] Charge points disabled during loop
   - [ ] Spin drain applies when time resumes
   - [ ] Opponent unfreezes at correct time
   - [ ] User exits loop automatically

6. **Other Flags**:
   - [ ] Rush attack dashes work
   - [ ] Shield dome absorbs damage
   - [ ] Berserk mode applies damage boost and penalty
   - [ ] Vortex pulls and drains enemies
   - [ ] Phantom mode makes user invisible
   - [ ] Explosion deals area damage
   - [ ] All combinations work together

**Debug Tools Needed**:

- Console logs for special move activation
- Visual debug overlay showing active effects
- Frame-by-frame stepping for animation debugging
- Force-activate special moves (bypass power requirement)

**Estimated Time**: 4-6 hours of testing

---

## 📊 Progress Summary

| Component                        | Status      | Lines       | Complexity |
| -------------------------------- | ----------- | ----------- | ---------- |
| Type System                      | ✅ Complete | 200+        | Medium     |
| Examples                         | ✅ Complete | 400+        | Low        |
| Banner Component                 | ✅ Complete | 350+        | Medium     |
| Floating Numbers                 | ✅ Complete | 300+        | Medium     |
| Power System Update              | ✅ Complete | 10          | Low        |
| Documentation                    | ✅ Complete | 5000+ words | Low        |
| **Special Moves Manager**        | ⏳ Pending  | ~1000       | **High**   |
| **Game Constants**               | ⏳ Pending  | 10          | Low        |
| **Banner Integration**           | ⏳ Pending  | 50          | Low        |
| **Floating Numbers Integration** | ⏳ Pending  | 100         | Medium     |
| **Orbital Attack Logic**         | ⏳ Pending  | 200         | High       |
| **Time Skip Logic**              | ⏳ Pending  | 300         | High       |
| **Testing & Debugging**          | ⏳ Pending  | N/A         | High       |

**Total Progress**: 6/13 major components complete (46%)

---

## 🎯 Next Actions

### Immediate Priority (Today)

1. Update `specialMovesManager.ts` with new flag handlers
2. Update game constants (MAX_POWER = 100)
3. Integrate banner component into game UI

### Short Term (This Week)

4. Integrate floating numbers into game loop
5. Implement orbital attack logic
6. Implement time skip logic
7. Comprehensive testing

### Future Enhancements

- Add more special move examples
- Create special move builder UI in admin panel
- Add sound effects integration
- Add particle effects for each move type
- Performance optimization for 60 FPS with all effects

---

## 📝 Notes

### Design Decisions Made

1. **Flag-based over hardcoded**: Special moves are composed of reusable flags that can be combined infinitely
2. **100 power cost**: Makes special moves feel like ultimate abilities (requires full charge)
3. **Cinematic priority**: Banner and visual effects are essential for "Let it Rip!" feeling
4. **Canvas-based numbers**: Floating numbers use Canvas for best performance
5. **Optional `name` field**: Backward compatible while encouraging use of `displayName`

### Potential Issues to Watch

- **Performance**: Multiple special moves active simultaneously could drop FPS
  - Solution: Limit to 2 active moves max, or implement effect queue
- **Control loss conflicts**: If both players lose control, game becomes non-interactive

  - Solution: One player max can lose control, or very short durations

- **Orbital attack edge cases**: What if opponent is knocked out during orbit?

  - Solution: Immediately end orbital attack if opponent spins out

- **Time skip in multiplayer**: How does slow-motion affect both players?
  - Solution: Apply slow-motion to entire game world, not individual players

### Admin Panel TODOs

- Add special move flag configurator UI
- Visual preview of special move effects
- Import/export special move configurations
- Share special moves between Beyblades
- Special move library/marketplace

---

## 🚀 Ready for Next Phase!

The foundation is complete. All type definitions, example configurations, UI components, and systems are built and error-free. Ready to implement the game logic integration.

**Estimated Time to Complete**: 8-12 hours of focused development
**Risk Level**: Medium (complex physics and timing interactions)
**Dependencies**: None (all files created and validated)

Let's make these Beyblades feel **EPIC**! 🌪️⚡🎮
