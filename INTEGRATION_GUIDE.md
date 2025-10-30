# Integration Guide for Beyblade Stats System

## Quick Integration Steps

### Step 1: Update Game State Hook

Add stats loading to `useGameState.ts`:

```typescript
// At the top
import { getBeybladeStats } from "@/constants/beybladeStatsData";
import {
  activateSpecialMove,
  updateSpecialMoves,
  canActivateSpecialMove,
} from "../utils/specialMovesManager";
import { resolveEnhancedCollision } from "../utils/enhancedCollision";

// Create a stats map to avoid repeated lookups
const [beybladeStats, setBeybladeStats] = useState(new Map());

// Load stats when Beyblades are created
useEffect(() => {
  const statsMap = new Map();
  gameState.beyblades.forEach((bey) => {
    const stats = getBeybladeStats(bey.name);
    if (stats) statsMap.set(bey.name, stats);
  });
  setBeybladeStats(statsMap);
}, [gameState.beyblades]);
```

### Step 2: Replace Collision System

In the game loop collision check:

```typescript
// OLD CODE:
// if (checkCollision(bey1, bey2)) {
//   resolvePhysicsCollision(bey1, bey2);
// }

// NEW CODE:
if (checkCollision(bey1, bey2)) {
  const stats1 = beybladeStats.get(bey1.name);
  const stats2 = beybladeStats.get(bey2.name);

  if (stats1 && stats2) {
    const result = resolveEnhancedCollision(bey1, stats1, bey2, stats2);

    // Log for debugging
    console.log("Collision:", {
      force: result.collisionForce,
      bey1Contact: result.bey1ContactMultiplier,
      bey2Contact: result.bey2ContactMultiplier,
      bey1SpinSteal: result.bey1SpinSteal,
      bey2SpinSteal: result.bey2SpinSteal,
    });

    // Show hit quality indicator (optional)
    if (result.bey1ContactMultiplier > 1.4) {
      const quality = getContactHitQuality(result.bey1ContactMultiplier);
      // Store this to render on canvas
      showHitIndicator(bey1.position, quality);
    }
  }
}
```

### Step 3: Add Special Move Activation

Add keyboard handler for special moves (e.g., spacebar):

```typescript
// In useEffect keyboard handler
const handleKeyDown = (event: KeyboardEvent) => {
  // ...existing code...

  // Spacebar = activate special move
  if (event.code === "Space") {
    const playerBey = gameState.beyblades[0]; // Your player
    const stats = beybladeStats.get(playerBey.name);

    if (stats) {
      const check = canActivateSpecialMove(playerBey, stats, Date.now());

      if (check.canActivate) {
        activateSpecialMove(playerBey, stats, Date.now());
        // Show notification
        console.log(`${stats.specialMove.name} activated!`);
      } else {
        console.log(`Cannot activate: ${check.reason}`);
      }
    }
  }
};
```

### Step 4: Update Special Moves Each Frame

In the game loop, after updating Beyblades:

```typescript
// Update special moves (applies continuous effects)
updateSpecialMoves(newState.beyblades, beybladeStats, Date.now(), deltaTime);
```

### Step 5: Update Canvas Renderer

In your canvas component (e.g., `GameCanvas.tsx`):

```typescript
import {
  drawContactPoints,
  drawSpecialMoveAura,
  drawTypeBadge,
  drawHitQualityIndicator,
} from "../utils/visualIndicators";

// In your render function
gameState.beyblades.forEach((beyblade) => {
  const stats = beybladeStats.get(beyblade.name);

  if (stats) {
    // Draw type badge
    drawTypeBadge(ctx, beyblade, stats);

    // Draw contact points (when attacking)
    drawContactPoints(ctx, beyblade, stats, false);

    // Draw special move aura
    if (beyblade.ultimateAttackActive || beyblade.heavyAttackActive) {
      drawSpecialMoveAura(ctx, beyblade, stats, Date.now());
    }
  }

  // Draw the Beyblade itself (existing code)
  // ...
});
```

### Step 6: Add UI for Special Move

Create a component to show special move info:

```typescript
// SpecialMoveUI.tsx
import { getBeybladeStats } from "@/constants/beybladeStatsData";
import {
  getRemainingCooldown,
  hasActiveSpecialMove,
} from "../utils/specialMovesManager";

export function SpecialMoveUI({ beyblade }: { beyblade: GameBeyblade }) {
  const stats = getBeybladeStats(beyblade.name);
  if (!stats) return null;

  const isActive = hasActiveSpecialMove(beyblade.id);
  const cooldown = getRemainingCooldown(beyblade.id, Date.now());
  const canUse =
    (beyblade.power || 0) >= stats.specialMove.powerCost && cooldown === 0;

  return (
    <div className="special-move-ui">
      <div className="special-move-name">{stats.specialMove.name}</div>
      <div className="special-move-power">
        Power: {beyblade.power || 0} / {stats.specialMove.powerCost}
      </div>

      {isActive && <div className="special-move-active">ACTIVE!</div>}

      {cooldown > 0 && (
        <div className="special-move-cooldown">
          Cooldown: {cooldown.toFixed(1)}s
        </div>
      )}

      {canUse && <div className="special-move-ready">Press SPACE to use!</div>}

      <div className="special-move-description">
        {stats.specialMove.description}
      </div>
    </div>
  );
}
```

### Step 7: Mobile/Controller Support

Add button for special move activation:

```typescript
// In your mobile controls
<button
  onClick={() => {
    const playerBey = gameState.beyblades[0];
    const stats = beybladeStats.get(playerBey.name);
    if (stats) {
      activateSpecialMove(playerBey, stats, Date.now());
    }
  }}
  className="special-move-button"
>
  Special Move
</button>
```

## Complete Example Integration

Here's a complete example of the game loop with all features:

```typescript
const gameLoop = useCallback(
  (currentTime: number) => {
    const deltaTime = Math.min(
      (currentTime - lastTimeRef.current) / 1000,
      1 / 60
    );
    lastTimeRef.current = currentTime;

    setGameState((prevState) => {
      if (!prevState.isPlaying) return prevState;

      const newState = { ...prevState };

      // 1. Update Beyblades (existing code)
      newState.beyblades.forEach((bey) => {
        updateBeyblade(bey, deltaTime, newState.stadium);
      });

      // 2. Update special moves
      updateSpecialMoves(
        newState.beyblades,
        beybladeStats,
        currentTime,
        deltaTime
      );

      // 3. Check collisions with enhanced system
      for (let i = 0; i < newState.beyblades.length; i++) {
        for (let j = i + 1; j < newState.beyblades.length; j++) {
          const bey1 = newState.beyblades[i];
          const bey2 = newState.beyblades[j];

          if (!bey1.isDead && !bey2.isDead && checkCollision(bey1, bey2)) {
            const stats1 = beybladeStats.get(bey1.name);
            const stats2 = beybladeStats.get(bey2.name);

            if (stats1 && stats2) {
              const result = resolveEnhancedCollision(
                bey1,
                stats1,
                bey2,
                stats2
              );

              // Visual feedback
              if (result.bey1ContactMultiplier > 1.4) {
                // Store for rendering
                hitIndicators.push({
                  position: bey1.position,
                  quality: getContactHitQuality(result.bey1ContactMultiplier),
                  time: currentTime,
                });
              }
            }
          }
        }
      }

      // 4. Check win conditions (existing code)
      // ...

      newState.gameTime += deltaTime;
      return newState;
    });
  },
  [beybladeStats]
);
```

## Testing Checklist

✅ **Load Stats**: Verify Beyblades load with correct stats  
✅ **Collisions**: Check contact point hits show "PERFECT!"  
✅ **Special Moves**: Press spacebar to activate  
✅ **Cooldowns**: Verify cooldown prevents re-activation  
✅ **Power Cost**: Check power bar depletes correctly  
✅ **Visual Effects**: See auras during special moves  
✅ **Type Bonuses**: Verify attack types deal more damage  
✅ **Spin Steal**: Check Meteo steals spin effectively  
✅ **Mass Physics**: Heavy Beyblades should push lighter ones  
✅ **Admin Page**: Access `/admin/beyblade-stats`

## Common Issues & Solutions

### Issue: Stats not loading

**Solution**: Make sure to call `getBeybladeStats()` and check return value:

```typescript
const stats = getBeybladeStats(beyblade.name);
if (!stats) {
  console.error(`No stats found for ${beyblade.name}`);
  return;
}
```

### Issue: Special moves not activating

**Solution**: Check power and cooldown:

```typescript
const check = canActivateSpecialMove(beyblade, stats, Date.now());
console.log(check); // Shows why it can't activate
```

### Issue: Contact points not showing

**Solution**: Make sure to pass `showAlways: true` for testing:

```typescript
drawContactPoints(ctx, beyblade, stats, true); // Always show
```

### Issue: Collisions feel weak

**Solution**: Adjust base damage multiplier in `enhancedCollision.ts`:

```typescript
let bey1BaseDamage = collisionForce * (bey2.mass / massSum) * 15; // Increased from 10
```

## Performance Tips

1. **Cache stats map** - Don't call `getBeybladeStats()` every frame
2. **Limit visual indicators** - Only show recent hit indicators
3. **Batch canvas draws** - Group all Beyblade rendering
4. **Debounce special moves** - Prevent rapid activation

## Next Features to Add

1. **Combo System**: Chain special moves for bonuses
2. **Charge Meter**: Visual meter for special move power
3. **Sound Effects**: Different sounds per special move
4. **Particle Effects**: Enhanced visual effects
5. **Replay System**: Record and replay matches
6. **Stats Tracking**: Track wins/losses per Beyblade

---

Need help with integration? Check `/docs/BEYBLADE_STATS_SYSTEM.md` for more details!
