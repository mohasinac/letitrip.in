# 🎮 Game Server - Quick Reference

## Quick Start Commands

```bash
# Start game server
cd game-server
npm run dev

# Test in browser
http://localhost:2567/

# View monitor
http://localhost:2567/colyseus
```

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────┐
│                   GAME ARCHITECTURE                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  🎮 CLIENT (src/)                                   │
│  ├── Rendering (Canvas 2D)                          │
│  ├── UI (Health, Stamina, HUD)                      │
│  ├── Visual Effects (Special Moves)                 │
│  └── Send Inputs ───────────┐                       │
│                               │                      │
│                               ▼                      │
│  🌐 WEBSOCKET (Colyseus)                            │
│  ├── Port 2567                                       │
│  ├── State Sync (60Hz)                              │
│  └── Input Messages                                  │
│                               │                      │
│                               ▼                      │
│  🎲 SERVER (game-server/)                           │
│  ├── Physics (Matter.js)                            │
│  ├── Collision Detection                            │
│  ├── Damage Calculation                             │
│  ├── Special Move Logic                             │
│  └── State Authority                                │
│                               │                      │
│                               ▼                      │
│  🔥 FIREBASE (Firestore)                            │
│  ├── Beyblade Stats                                 │
│  ├── Arena Configs                                  │
│  ├── Match Results                                  │
│  └── Player Stats                                   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## File Structure

```
justforview.in/
├── game-server/              🎲 Game Server (NEW)
│   ├── src/
│   │   ├── rooms/
│   │   │   ├── TryoutRoom.ts        # Solo practice
│   │   │   └── schema/
│   │   │       └── GameState.ts     # Colyseus schema
│   │   ├── physics/
│   │   │   └── PhysicsEngine.ts     # Matter.js wrapper
│   │   ├── utils/
│   │   │   └── firebase.ts          # Load data
│   │   └── index.ts                 # Server entry
│   ├── test-client.html             # Test interface
│   └── package.json
│
└── src/                      🎮 Frontend (CLEANED)
    ├── lib/game/
    │   ├── hooks/             ✅ React hooks
    │   ├── rendering/         ✅ Canvas rendering
    │   ├── ui/                ✅ Visual indicators
    │   ├── moves/
    │   │   └── cinematicSpecialMoves.ts  ✅ Visual FX
    │   └── types/             ✅ TypeScript types
    │
    └── app/game/
        └── components/        ✅ React components
```

## What Was Removed ❌

- ❌ `src/lib/game/physics/` - Client physics (use server)
- ❌ `src/lib/game/utils/collision*` - Collision (use server)
- ❌ `src/lib/game/utils/beyblade*` - Physics (use server)
- ❌ `src/lib/game/moves/specialMovesManager.ts` - Logic (use server)
- ❌ `server.js` - Old Socket.IO server
- ❌ `src/app/game/utils/*.ts` - Duplicate physics files

## What Was Kept ✅

- ✅ Hooks (`useBeyblades`, `useArenas`, `useGameState`)
- ✅ Rendering (`arenaRenderer`, `beybladeRenderer`)
- ✅ UI (`floatingNumbers`, `visualIndicators`)
- ✅ Visual FX (`cinematicSpecialMoves`)
- ✅ Types (TypeScript definitions)

## Key Endpoints

| Endpoint                         | Purpose               |
| -------------------------------- | --------------------- |
| `ws://localhost:2567`            | Game server WebSocket |
| `http://localhost:2567/`         | Test client           |
| `http://localhost:2567/colyseus` | Monitor panel         |
| `http://localhost:2567/health`   | Health check          |

## Colyseus Room Flow

```typescript
// 1. Client connects
const client = new Colyseus.Client("ws://localhost:2567");

// 2. Join room
const room = await client.joinOrCreate("tryout_room", {
  userId: "user123",
  username: "Player1",
  beybladeId: "dragoon-gt",
  arenaId: "standard",
});

// 3. Listen to state
room.state.beyblades.onAdd = (beyblade, key) => {
  console.log("Beyblade added:", beyblade);
};

room.state.beyblades.onChange = (beyblade, key) => {
  // Update rendering
  renderBeyblade(beyblade);
};

// 4. Send input
room.send("input", {
  direction: { x: 1, y: 0 }, // Move right
});

// 5. Actions
room.send("action", {
  type: "charge", // Boost spin
});
```

## Test Client Controls

| Key                   | Action                |
| --------------------- | --------------------- |
| **WASD** / Arrow Keys | Move beyblade         |
| **Space**             | Charge (boost spin)   |
| **Shift**             | Dash (quick movement) |
| **E**                 | Special move          |

## Common Issues & Solutions

### Server won't start

```bash
cd game-server
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Connection failed

1. Check server is running: `http://localhost:2567/health`
2. Check no firewall blocking port 2567
3. Try refreshing test client

### Beyblade not loading

- Server uses **fallback defaults** if Firestore data missing
- Check console for "⚠️ Beyblade not found" message
- Connection will still work with default stats

## Phase 1 Status: ✅ COMPLETE

- [x] Colyseus server setup
- [x] Matter.js physics integration
- [x] TryoutRoom implementation
- [x] Firebase integration
- [x] Test client working
- [x] Frontend cleanup complete

## Next: Phase 2

- [ ] Connect Next.js app to Colyseus
- [ ] Update game components
- [ ] Game mode selection UI
- [ ] Visual interpolation

## Useful Commands

```bash
# Game server
cd game-server
npm run dev          # Development
npm run build        # Production build
npm start            # Production run

# Frontend
npm run dev          # Next.js dev server
npm run build        # Production build

# Test both
# Terminal 1: npm run dev (frontend)
# Terminal 2: cd game-server && npm run dev
```

## Documentation

- 📖 `game-server/README.md` - Server guide
- 📊 `docs/game/IMPLEMENTATION_STATUS.md` - Progress
- 🎉 `docs/game/MIGRATION_SUMMARY.md` - Complete summary
- 🧹 `docs/migrations/GAME_CLEANUP_COMPLETE.md` - Cleanup details

---

**Status**: ✅ Ready for Phase 2  
**Server**: Running on port 2567  
**Test Client**: Working  
**Frontend**: Cleaned up

🎮 **Happy Gaming!**
