# 🎨 Game Architecture - Visual Diagrams

**Visual representation of game modes architecture**  
**Last Updated:** November 5, 2025

---

## 📊 System Architecture Overview

### Current Architecture (Client-Heavy)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    Browser (Next.js Client)                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Game State (useGameState.ts)           │    │
│  │  • Physics calculations (Matter.js/Custom)          │    │
│  │  • Collision detection                              │    │
│  │  • AI logic                                         │    │
│  │  • Rendering (Canvas/DOM)                           │    │
│  │  • Input handling                                   │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                     │
│                       │ Send: Player state                  │
│                       │ Receive: Opponent state             │
│                       ▼                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Socket.io Client (Optional)               │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└────────────────────────┬─────────────────────────────────────┘
                         │ WebSocket (state exchange)
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                Socket.io Server (server.js)                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Room Management                        │    │
│  │  • Create/Join rooms                                │    │
│  │  • Broadcast player states                          │    │
│  │  • NO physics (trusts client)                       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘

❌ PROBLEMS:
• Client-side physics = different results per client
• Easy to cheat (modify local physics)
• State desync between players
• No authoritative source of truth
```

---

### Recommended Architecture (Server-Authoritative)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    Browser (Next.js Client)                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Game Client (Renderer Only)               │    │
│  │  • Rendering (Canvas/DOM)                           │    │
│  │  • Input handling (WASD, actions)                   │    │
│  │  • UI/HUD display                                   │    │
│  │  • State interpolation (smooth movement)            │    │
│  │  • NO PHYSICS, NO AI                                │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                     │
│                       │ Send: Inputs only                   │
│                       │ Receive: Authoritative state        │
│                       ▼                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Colyseus Client / Socket.io                 │    │
│  │  • Connect to room                                  │    │
│  │  • Send player inputs (60Hz)                        │    │
│  │  • Receive game state (60Hz)                        │    │
│  │  • Automatic state sync                             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└────────────────────────┬─────────────────────────────────────┘
                         │ WebSocket (inputs ↑, state ↓)
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│            Game Server (Colyseus / Node.js)                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Room Manager (Colyseus)                │    │
│  │  • Create/Join rooms by mode                        │    │
│  │  • Matchmaking (find opponent)                      │    │
│  │  • Room lifecycle                                   │    │
│  │  • Player session management                        │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                     │
│                       ▼                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Physics Engine (Matter.js/Planck.js)        │    │
│  │  • Beyblade physics simulation                      │    │
│  │  • Collision detection & resolution                 │    │
│  │  • Arena boundaries                                 │    │
│  │  • Special moves                                    │    │
│  │  • Spin mechanics                                   │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                     │
│                       ▼                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Game State Manager                     │    │
│  │  • Process player inputs                            │    │
│  │  • Update game state (60 FPS)                       │    │
│  │  • Run AI logic                                     │    │
│  │  • Check win conditions                             │    │
│  │  • Broadcast state to clients                       │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                     │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        │ HTTP REST API
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                  Next.js API Routes                          │
│                                                              │
│  /api/beyblades  - Get beyblade data                        │
│  /api/arenas     - Get arena data                           │
│  /api/matches    - Match history                            │
│  /api/stats      - Player statistics                        │
│                                                              │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                  Firebase Firestore                          │
│                                                              │
│  Collections:                                               │
│  • beybladeStats - Beyblade configurations                  │
│  • arenas        - Arena configurations                     │
│  • matches       - Match records                            │
│  • player_stats  - Player statistics                        │
│  • tournaments   - Tournament data (future)                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘

✅ BENEFITS:
• Server controls physics = same result for all players
• Cannot cheat (server validates everything)
• No state desync
• Server is source of truth
```

---

## 🎮 Game Modes Flow

### 1. Tryout Mode (Solo Practice)

```
┌─────────────┐
│   Player    │
└──────┬──────┘
       │
       │ 1. Select Tryout Mode
       ▼
┌──────────────────────┐
│  Mode Selection UI   │
└──────┬───────────────┘
       │
       │ 2. Choose Beyblade
       ▼
┌──────────────────────────────┐
│  Beyblade Selection          │
│  (Fetch from /api/beyblades) │
└──────┬───────────────────────┘
       │
       │ 3. Choose Arena
       ▼
┌──────────────────────────────┐
│  Arena Selection             │
│  (Fetch from /api/arenas)    │
└──────┬───────────────────────┘
       │
       │ 4. Join Room
       ▼
┌──────────────────────────────┐
│    Create Tryout Room        │
│  • Server loads beyblade     │
│  • Server loads arena        │
│  • Initialize physics        │
└──────┬───────────────────────┘
       │
       │ 5. Start Game Loop
       ▼
┌──────────────────────────────┐
│      Game Running            │
│  Player ← → Server           │
│  Inputs → Server             │
│  State  ← Server             │
└──────┬───────────────────────┘
       │
       │ 6. Exit
       ▼
┌──────────────────────────────┐
│   Save Stats (Optional)      │
│  • Time played               │
│  • Actions used              │
└──────────────────────────────┘
```

### 2. Single Battle Mode (Player vs AI)

```
┌─────────────┐
│   Player    │
└──────┬──────┘
       │
       │ 1. Select Single Battle
       ▼
┌──────────────────────────────┐
│     Mode Selection UI        │
└──────┬───────────────────────┘
       │
       │ 2. Choose AI Difficulty
       ▼
┌──────────────────────────────┐
│   Difficulty Selection       │
│  • Easy                      │
│  • Medium                    │
│  • Hard                      │
│  • Expert                    │
└──────┬───────────────────────┘
       │
       │ 3. Choose Beyblade
       ▼
┌──────────────────────────────┐
│   Beyblade Selection         │
│  (Fetch from /api/beyblades) │
└──────┬───────────────────────┘
       │
       │ 4. Choose Arena
       ▼
┌──────────────────────────────┐
│   Arena Selection            │
│  (Fetch from /api/arenas)    │
└──────┬───────────────────────┘
       │
       │ 5. Join Battle Room
       ▼
┌──────────────────────────────┐
│     Create Battle Room       │
│  • Load player beyblade      │
│  • Load AI beyblade          │
│  • Load arena                │
│  • Initialize physics        │
│  • Start AI controller       │
└──────┬───────────────────────┘
       │
       │ 6. Battle Loop
       ▼
┌──────────────────────────────┐
│      Battle Running          │
│  Player ← → Server           │
│  Inputs → Server             │
│  State  ← Server             │
│  AI runs on server           │
│  • Collision detection       │
│  • Health updates            │
│  • Timer countdown           │
└──────┬───────────────────────┘
       │
       │ 7. Win Condition Met
       ▼
┌──────────────────────────────┐
│    Game Over Screen          │
│  • Winner announced          │
│  • Stats display             │
│  • Rematch option            │
└──────┬───────────────────────┘
       │
       │ 8. Save Match
       ▼
┌──────────────────────────────┐
│   Save to Database           │
│  • Match record              │
│  • Player stats update       │
│  • Leaderboard update        │
└──────────────────────────────┘
```

### 3. Tournament Mode (Future)

```
┌─────────────┐
│   Player    │
└──────┬──────┘
       │
       │ 1. Select Tournament
       ▼
┌──────────────────────────────┐
│   Tournament List            │
│  • Ongoing tournaments       │
│  • Upcoming tournaments      │
│  • Create new tournament     │
└──────┬───────────────────────┘
       │
       │ 2. Join/Create Tournament
       ▼
┌──────────────────────────────┐
│   Tournament Lobby           │
│  • Wait for players          │
│  • View bracket              │
│  • Choose beyblade           │
└──────┬───────────────────────┘
       │
       │ 3. Tournament Starts
       ▼
┌──────────────────────────────┐
│      Tournament Bracket      │
│  • Round 1: 16 → 8           │
│  • Round 2: 8 → 4            │
│  • Semi-Finals: 4 → 2        │
│  • Finals: 2 → 1             │
└──────┬───────────────────────┘
       │
       │ 4. Each Match
       ▼
┌──────────────────────────────┐
│     Battle (same as above)   │
│  • Best of 1/3/5             │
│  • Winner advances           │
└──────┬───────────────────────┘
       │
       │ 5. Tournament Complete
       ▼
┌──────────────────────────────┐
│    Tournament Results        │
│  • Winner                    │
│  • Top 3 players             │
│  • Rewards distribution      │
└──────────────────────────────┘
```

---

## 🔄 Data Flow

### Client → Server → Client Loop

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│                                                              │
│  User presses 'W' key                                        │
│         │                                                    │
│         ▼                                                    │
│  Input Handler captures: { key: 'W', timestamp: 123 }       │
│         │                                                    │
│         ▼                                                    │
│  Send via WebSocket: room.send("input", { direction: {     │
│    x: 0, y: -1 }, action: null })                           │
│                                                              │
└────────────────────────┬─────────────────────────────────────┘
                         │ WebSocket (10-20ms latency)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       Server (Node.js)                       │
│                                                              │
│  onMessage(client, "input", data)                           │
│         │                                                    │
│         ▼                                                    │
│  Validate input (prevent cheating)                          │
│         │                                                    │
│         ▼                                                    │
│  Apply force to beyblade physics body                       │
│  Matter.Body.applyForce(body, force)                        │
│         │                                                    │
│         ▼                                                    │
│  Physics engine updates (60 FPS)                            │
│  • New position calculated                                  │
│  • Collisions checked                                       │
│  • State updated                                            │
│         │                                                    │
│         ▼                                                    │
│  Broadcast new state (60 Hz)                                │
│  this.broadcast("gameState", state)                         │
│                                                              │
└────────────────────────┬─────────────────────────────────────┘
                         │ WebSocket (state updates)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│                                                              │
│  Receive state update                                        │
│         │                                                    │
│         ▼                                                    │
│  Update React state                                          │
│  setBeybladePosition({ x: newX, y: newY })                  │
│         │                                                    │
│         ▼                                                    │
│  Interpolate for smooth movement                            │
│  displayX = lerp(oldX, newX, 0.3)                           │
│         │                                                    │
│         ▼                                                    │
│  Render to screen (Canvas/DOM)                              │
│  <div style={{ left: displayX, top: displayY }}>           │
│    <Beyblade />                                             │
│  </div>                                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Repeat every 16.67ms (60 FPS)
```

---

## 🎯 State Synchronization

### Without Colyseus (Manual)

```
Server State:
{
  player1: { x: 100, y: 200, spin: 1500 },
  player2: { x: 300, y: 400, spin: 1800 }
}

Server needs to:
1. Serialize state to JSON (manual)
2. Calculate delta (what changed) (manual)
3. Send only delta to reduce bandwidth (manual)
4. Handle edge cases (manual)

❌ Complex, error-prone, 100+ lines of code
```

### With Colyseus (Automatic)

```typescript
// Define schema once
class GameState extends Schema {
  @type({ map: Beyblade }) beyblades = new MapSchema<Beyblade>();
}

// Update state
this.state.beyblades.get("player1").x = 100;

// ✅ Colyseus automatically:
// - Serializes state
// - Calculates delta
// - Sends only changes
// - Handles edge cases
// - Type-safe

Just 3 lines of code!
```

---

## 🏃 Performance Optimization

### Client-Side Prediction (Optional Advanced Feature)

```
Without prediction:
User Input → Server (20ms) → Physics → Response (20ms) → Render
Total: 40ms lag (feels sluggish)

With prediction:
User Input → Predict locally → Render (0ms, instant feedback)
           └→ Server (20ms) → Verify → Reconcile if needed
Total: 0ms apparent lag (feels responsive)

Implementation:
1. Client predicts movement locally
2. Server calculates authoritative position
3. If positions differ > threshold:
   - Smoothly interpolate to correct position
   - Don't "snap" (causes jittery movement)
```

### State Interpolation

```javascript
// Current state from server
const currentX = 100;
const currentY = 200;

// Last known state
let displayX = 90;
let displayY = 190;

// Smooth interpolation (every frame)
function render() {
  // Move 30% closer to target each frame
  displayX = displayX + (currentX - displayX) * 0.3;
  displayY = displayY + (currentY - displayY) * 0.3;

  // Render at interpolated position
  renderBeyblade(displayX, displayY);

  requestAnimationFrame(render);
}

Result: Smooth 60 FPS movement even with 20 FPS network updates
```

---

## 🔐 Security & Anti-Cheat

### Attack Vectors

```
Client-Side Physics (Current):
Attacker modifies local code:
• Infinite health
• Super speed
• No collision detection
• Auto-win

Server-Authoritative (Recommended):
Attacker modifies local code:
• Visual only (doesn't affect game)
• Server rejects invalid moves
• Server validates all actions
✅ Cannot cheat game logic
```

### Server-Side Validation

```javascript
// Client sends input
socket.send("move", { direction: { x: 100, y: 0 } });

// Server validates
onMessage(client, "move", data) {
  // Validate: direction must be normalized (-1 to 1)
  if (Math.abs(data.direction.x) > 1 || Math.abs(data.direction.y) > 1) {
    console.warn("Invalid input from", client.id);
    return; // Ignore cheating attempt
  }

  // Validate: player must be alive
  if (this.state.players.get(client.id).health <= 0) {
    return; // Dead players can't move
  }

  // Valid input - apply force
  this.applyForce(client.id, data.direction);
}
```

---

## 📡 Network Protocol

### Message Types (Client → Server)

```typescript
// 1. Join room
room.join("battle_room", {
  beybladeId: "dragoon_gt",
  arenaId: "default_arena",
});

// 2. Player input
room.send("input", {
  direction: { x: 0, y: -1 }, // Normalized vector
  timestamp: Date.now(),
});

// 3. Action
room.send("action", {
  type: "special-attack",
  targetId: "opponent_id",
});

// 4. Ready signal
room.send("ready");

// 5. Leave room
room.leave();
```

### Message Types (Server → Client)

```typescript
// 1. State update (60 Hz)
room.onStateChange((state) => {
  // Entire game state
  console.log(state.beyblades);
});

// 2. Event notification
room.onMessage("collision", (data) => {
  // { beybladeIds: ["p1", "p2"], force: 150 }
  playCollisionSound();
});

// 3. Game over
room.onMessage("game-over", (data) => {
  // { winner: "player1", stats: {...} }
  showVictoryScreen(data);
});

// 4. Error
room.onError((code, message) => {
  console.error("Room error:", message);
});
```

---

## 🎨 UI Flow

### Main Menu

```
┌────────────────────────────────────────┐
│         BEYBLADE BATTLE GAME           │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │         🏃 Tryout Mode           │ │
│  │     Practice & Learn Controls    │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │        ⚔️  Single Battle         │ │
│  │      1v1 Against AI or Player    │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │       🏆 Tournament Mode         │ │
│  │    Compete in Brackets (Soon)    │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │         📊 My Stats              │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

### Game UI (During Battle)

```
┌────────────────────────────────────────────────────────────┐
│ Player HP: ████████████░░░░░░░░ 60%    Timer: 01:23      │
│ Spin: 1500 | Power: 15/25                                  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│                     ⚪ Arena View                         │
│                                                            │
│        🔵 Player Beyblade                                 │
│                                                            │
│                           🔴 Opponent                     │
│                                                            │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ Opponent HP: ████████████████░░ 80%                       │
│ Special Moves: [Q] Dash [E] Shield [R] Special            │
└────────────────────────────────────────────────────────────┘
```

---

## 📚 File Structure

```
project-root/
│
├── game-server/                 # ⭐ NEW: Colyseus game server
│   ├── src/
│   │   ├── rooms/
│   │   │   ├── TryoutRoom.ts    # Tryout mode room
│   │   │   ├── BattleRoom.ts    # Battle mode room
│   │   │   ├── TournamentRoom.ts # Tournament room (future)
│   │   │   └── schema/
│   │   │       ├── GameState.ts  # State schema
│   │   │       ├── Beyblade.ts   # Beyblade schema
│   │   │       └── Arena.ts      # Arena schema
│   │   │
│   │   ├── physics/
│   │   │   ├── PhysicsEngine.ts  # Matter.js wrapper
│   │   │   ├── BeybladePhysics.ts
│   │   │   └── ArenaSetup.ts
│   │   │
│   │   ├── ai/
│   │   │   ├── AIController.ts   # Main AI logic
│   │   │   ├── behaviors/
│   │   │   │   ├── AttackBehavior.ts
│   │   │   │   ├── DefenseBehavior.ts
│   │   │   │   └── StaminaBehavior.ts
│   │   │   └── difficulty.ts     # Difficulty levels
│   │   │
│   │   ├── utils/
│   │   │   ├── firebase.ts       # Firestore client
│   │   │   ├── validation.ts     # Input validation
│   │   │   └── logger.ts         # Logging
│   │   │
│   │   └── index.ts              # Server entry point
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── src/
│   ├── app/
│   │   ├── game/
│   │   │   ├── tryout/
│   │   │   │   └── page.tsx      # Tryout mode UI
│   │   │   ├── battle/
│   │   │   │   └── page.tsx      # Battle mode UI
│   │   │   ├── tournament/
│   │   │   │   └── page.tsx      # Tournament UI (future)
│   │   │   └── components/
│   │   │       ├── BeybladeRenderer.tsx
│   │   │       ├── ArenaRenderer.tsx
│   │   │       ├── GameHUD.tsx
│   │   │       └── ModeSelector.tsx
│   │   │
│   │   └── (backend)/
│   │       └── api/
│   │           ├── beyblades/    # Existing
│   │           ├── arenas/       # Existing
│   │           ├── matches/      # NEW: Match history
│   │           └── stats/        # NEW: Player stats
│   │
│   └── lib/
│       └── game/
│           ├── client.ts         # Colyseus client wrapper
│           └── types.ts          # Shared types
│
└── docs/
    └── game/
        ├── README.md                           # This file!
        ├── GAME_MODES_IMPLEMENTATION_PLAN.md   # Detailed plan
        ├── QUICK_START_GUIDE.md                # Quick start
        ├── TECHNOLOGY_COMPARISON.md            # Tech comparison
        └── ARCHITECTURE_DIAGRAMS.md            # This diagram file
```

---

## 🔄 Development Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                  Local Development                           │
│                                                              │
│  Terminal 1:               Terminal 2:                      │
│  ┌──────────────┐          ┌──────────────┐                │
│  │ Game Server  │          │  Next.js     │                │
│  │              │          │  Client      │                │
│  │ cd game-     │          │              │                │
│  │   server     │          │ npm run dev  │                │
│  │ npm run dev  │          │              │                │
│  │              │          │ Port 3000    │                │
│  │ Port 2567    │          └──────────────┘                │
│  └──────────────┘                                           │
│         │                          │                        │
│         └──────────┬───────────────┘                        │
│                    │                                        │
│                    ▼                                        │
│           Code → Hot Reload                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Edit files → Auto-reload → Test immediately
```

---

**Last Updated:** November 5, 2025  
**Version:** 1.0  
**Status:** Documentation Complete

For implementation details, see:

- [Implementation Plan](./GAME_MODES_IMPLEMENTATION_PLAN.md)
- [Quick Start Guide](./QUICK_START_GUIDE.md)
- [Technology Comparison](./TECHNOLOGY_COMPARISON.md)
