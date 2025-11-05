# 🧹 Game Server Migration - Frontend Cleanup

## Overview

With the new Colyseus game server implementing server-authoritative physics with Matter.js, we need to remove old client-side game physics files from the frontend to avoid confusion and reduce bundle size.

## ✅ What Stays (Frontend)

These files are **KEPT** because they're needed for UI, rendering, and client-side display:

### Game UI & Rendering

- `src/lib/game/hooks/*` - React hooks for game state management
- `src/lib/game/rendering/*` - Canvas rendering for beyblades and arenas
- `src/lib/game/ui/*` - Visual indicators and floating numbers
- `src/lib/game/moves/cinematicSpecialMoves.ts` - Visual effects for special moves
- `src/app/game/components/*` - React components for game UI
- `src/app/game/hooks/*` - Game state hooks
- `src/app/game/types/*` - TypeScript types for game entities

### Configuration & Data

- `src/constants/beybladeStatsData.ts` - Beyblade statistics
- `src/constants/beyblades.ts` - Beyblade configurations
- `src/constants/arenas.ts` - Arena configurations
- `src/types/beybladeStats.ts` - Type definitions
- `src/types/arenaConfig.ts` - Type definitions

### Services

- `src/lib/api/services/game.service.ts` - API service for loading data
- `src/lib/database/beybladeStatsService.ts` - Firestore service

## ❌ What Gets Removed (Frontend)

These files contain **CLIENT-SIDE PHYSICS** that are now handled by the game server:

### Physics Engine Files

- ~~`src/lib/game/physics/gamePhysics.ts`~~ - Old client-side physics (use game-server instead)
- ~~`src/lib/game/physics/collision.ts`~~ - Collision detection (now in Matter.js on server)
- ~~`src/lib/game/physics/enhancedCollision.ts`~~ - Enhanced collision logic (server-side now)
- ~~`src/lib/game/physics/vectorUtils.ts`~~ - Keep ONLY if used by rendering
- ~~`src/lib/game/physics/index.ts`~~ - Physics exports

### Utility Files with Physics

- ~~`src/lib/game/utils/collisionUtils.ts`~~ - Client-side collision (server-authoritative now)
- ~~`src/lib/game/utils/beybladeUtils.ts`~~ - Beyblade physics (server handles this)
- ~~`src/lib/game/utils/gamePhysics.ts`~~ - Legacy physics wrapper

### Duplicate Files in app/game

- ~~`src/app/game/utils/physicsCollision.ts`~~ - Duplicate of physics logic
- ~~`src/app/game/utils/collisionUtils.ts`~~ - Duplicate collision detection
- ~~`src/app/game/utils/gamePhysics.ts`~~ - Duplicate physics wrapper
- ~~`src/app/game/utils/beybladeUtils.ts`~~ - Duplicate beyblade physics
- ~~`src/app/(frontend)/game/utils/*`~~ - Duplicate physics utilities

### Special Moves Physics

- ~~`src/lib/game/moves/specialMovesManager.ts`~~ - Client-side special move physics (server will handle)

### Old Multiplayer

- ~~`src/lib/game/hooks/useMultiplayer.ts`~~ - Old Socket.IO multiplayer (replaced by Colyseus)
- ~~`server.js`~~ - Old standalone Socket.IO server (replaced by Colyseus game-server)

## 🔄 Migration Strategy

1. **Phase 1: Keep Vector Utils** (if used by rendering)

   - Check if `vectorUtils.ts` is used by rendering code
   - If yes, move to `src/lib/game/rendering/vectorUtils.ts`
   - If no, delete it

2. **Phase 2: Remove Physics Files**

   - Delete all physics calculation files
   - Remove collision detection files
   - Remove client-side beyblade physics

3. **Phase 3: Update Imports**

   - Update any remaining files that import deleted physics
   - Point to server for physics calculations

4. **Phase 4: Remove Old Server**
   - Delete `server.js` (old Socket.IO server)
   - Remove Socket.IO dependencies if not used elsewhere
   - Update deployment scripts

## 🎯 New Architecture

### Server (game-server/)

- **Physics**: Matter.js for server-authoritative simulation
- **Networking**: Colyseus WebSocket rooms
- **State**: Colyseus Schema for automatic synchronization
- **Tick Rate**: 60 FPS physics loop

### Client (src/)

- **Rendering**: Canvas 2D for visual display
- **Input**: Send player inputs to server
- **State**: Receive and display server state
- **Interpolation**: Smooth movement between server updates

## 📝 Files to Update After Cleanup

1. **Game Components** - Update to use Colyseus client
2. **Hooks** - Remove local physics, use server state
3. **Rendering** - Keep visual rendering, remove physics calculations

## ✅ Verification Checklist

After cleanup:

- [ ] No physics calculations in frontend
- [ ] No collision detection in frontend
- [ ] Client only renders server state
- [ ] Client only sends inputs to server
- [ ] Game still renders correctly
- [ ] Special move visuals still work
- [ ] No broken imports
- [ ] Bundle size reduced

---

**Next Steps**: Execute cleanup and update game client to connect to Colyseus server.
