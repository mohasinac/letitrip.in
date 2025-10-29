# Game Performance Optimization Analysis

## Current Performance Issues Identified

### 1. **Double Animation Loop** (CRITICAL)

- **Problem**: Both `GameArena.tsx` and `useGameState.ts` are running separate `requestAnimationFrame` loops
  - `GameArena`: Rendering loop (line 245)
  - `useGameState`: Physics/game logic loop (lines 456, 464)
- **Impact**: Running 2 RAF loops at 60fps = 120 callbacks per second
- **Solution**: Combine into single loop or ensure proper synchronization

### 2. **Excessive State Updates**

- **Problem**: `setGameState` called every frame in game loop
- **Impact**: Triggers React re-renders on every frame (60fps)
- **Solution**: Use refs for intermediate calculations, batch state updates

### 3. **Image Rendering Every Frame**

- **Problem**: Drawing beyblades and stadium SVGs on canvas every frame
- **Impact**: SVG rendering is expensive, especially with transformations
- **Solution**: Pre-render beyblades to off-screen canvas, use cached sprites

### 4. **Collision Detection on Every Frame**

- **Problem**: Nested loop checking all beyblade pairs every frame
- **Impact**: O(n²) complexity with distance calculations
- **Solution**: Use spatial partitioning or early exit optimizations

### 5. **Uncached Calculations**

- **Problem**: Recalculating `vectorLength`, `vectorNormalize` multiple times per frame
- **Impact**: Redundant sqrt() and trigonometric operations
- **Solution**: Cache calculated values

### 6. **Animation State Tracking**

- **Problem**: Checking animation states (dodge, attack, power) every frame
- **Impact**: Additional conditional logic in render path
- **Solution**: Use animation queue or optimize state checks

## Performance Metrics

### Current State (Estimated)

- Game loop: ~60 fps
- Render loop: ~60 fps
- Total RAF calls: ~120/second
- State updates: ~60/second
- Canvas redraws: ~60/second

### Bottlenecks

1. **Highest Impact**: Double animation loops
2. **High Impact**: React re-renders every frame
3. **Medium Impact**: SVG rendering
4. **Medium Impact**: Collision detection
5. **Low Impact**: Mathematical calculations

## Optimization Strategy

### Phase 1: Critical Fixes (Immediate)

1. ✅ Consolidate animation loops
2. ✅ Reduce React re-renders
3. ✅ Add frame skipping for heavy operations

### Phase 2: Rendering Optimizations

1. ⏳ Pre-render beyblade sprites
2. ⏳ Use layered canvas approach
3. ⏳ Implement dirty rectangle rendering

### Phase 3: Physics Optimizations

1. ⏳ Spatial partitioning for collisions
2. ⏳ Delta time capping
3. ⏳ Predictive collision detection

### Phase 4: Code-level Optimizations

1. ⏳ Memoize expensive calculations
2. ⏳ Object pooling for vectors
3. ⏳ Web Workers for physics

## Recommended Immediate Fixes

### Fix 1: Single Animation Loop

Move all game logic into `useGameState`, have `GameArena` only render on state changes:

```typescript
// useGameState.ts - Single unified loop
const gameLoop = useCallback((currentTime: number) => {
  // Physics update
  const deltaTime = (currentTime - lastTimeRef.current) / 1000;
  lastTimeRef.current = currentTime;

  // Update game state
  setGameState((prevState) => {
    // ... physics updates
    return newState;
  });

  // Continue loop
  if (isPlaying) {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }
}, []);
```

### Fix 2: Reduce Re-renders

Use refs for intermediate state, only update React state when needed:

```typescript
// Use ref for high-frequency updates
const gameStateRef = useRef<GameState>(initialState);

// Only update React state every N frames or on significant changes
let frameCount = 0;
const UPDATE_INTERVAL = 3; // Update React every 3 frames

if (frameCount % UPDATE_INTERVAL === 0) {
  setGameState(gameStateRef.current);
}
frameCount++;
```

### Fix 3: Optimize Canvas Rendering

Only redraw when game state actually changes:

```typescript
// GameArena.tsx
useEffect(() => {
  // Only render when gameState changes, not on every frame
  render();
}, [gameState, render]);

// Remove separate animation loop
```

### Fix 4: Add FPS Limiter

Cap frame rate to reduce CPU usage:

```typescript
const TARGET_FPS = 60;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
let lastFrameTime = 0;

const gameLoop = (currentTime: number) => {
  const elapsed = currentTime - lastFrameTime;

  if (elapsed > FRAME_INTERVAL) {
    lastFrameTime = currentTime - (elapsed % FRAME_INTERVAL);

    // Run game logic
    updateGame(elapsed / 1000);
  }

  gameLoopRef.current = requestAnimationFrame(gameLoop);
};
```

### Fix 5: Optimize Collision Detection

Add early exit conditions:

```typescript
// Check if beyblades are too far to collide
const maxDistance = bey1.radius + bey2.radius;
const dx = bey2.position.x - bey1.position.x;
const dy = bey2.position.y - bey1.position.y;

// Early exit without sqrt
if (Math.abs(dx) > maxDistance || Math.abs(dy) > maxDistance) {
  continue; // Skip expensive distance calculation
}

// Now do actual distance check
const distance = Math.sqrt(dx * dx + dy * dy);
if (distance < maxDistance) {
  // Resolve collision
}
```

## Performance Monitoring

Add FPS counter to debug:

```typescript
let frameCount = 0;
let lastFpsUpdate = performance.now();

const updateFPS = (currentTime: number) => {
  frameCount++;
  const elapsed = currentTime - lastFpsUpdate;

  if (elapsed >= 1000) {
    const fps = Math.round((frameCount * 1000) / elapsed);
    console.log(`FPS: ${fps}`);
    frameCount = 0;
    lastFpsUpdate = currentTime;
  }
};
```

## Expected Performance After Optimization

- Target FPS: 60 fps (stable)
- RAF calls: 60/second (single loop)
- React updates: 20/second (throttled)
- Canvas redraws: 60/second (synchronized)
- CPU usage: Reduced by 40-50%

## Testing Checklist

- [ ] Measure FPS before optimization
- [ ] Apply critical fixes
- [ ] Measure FPS after optimization
- [ ] Test on low-end devices
- [ ] Test with multiple beyblades
- [ ] Monitor memory usage
- [ ] Check for animation stuttering
- [ ] Verify physics accuracy maintained

## Long-term Improvements

1. **Web Workers**: Move physics calculations off main thread
2. **WebGL**: Use GPU acceleration for rendering
3. **Sprite Sheets**: Pre-render all beyblade states
4. **LOD System**: Reduce detail for far objects
5. **Adaptive Quality**: Lower quality on slower devices
