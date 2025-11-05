# 🎮 Beyblade Game Modes - Implementation Plan & Architecture

**Project:** JustForView.in - Beyblade Battle Game  
**Document Version:** 1.0  
**Created:** November 5, 2025  
**Status:** Planning Phase

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Game Modes Overview](#game-modes-overview)
3. [Technical Architecture](#technical-architecture)
4. [Technology Stack Recommendation](#technology-stack-recommendation)
5. [Implementation Phases](#implementation-phases)
6. [Detailed Requirements](#detailed-requirements)
7. [Database Schema](#database-schema)
8. [API Design](#api-design)
9. [Checklist & Timeline](#checklist--timeline)
10. [References & Inspiration](#references--inspiration)

---

## 🎯 Executive Summary

### Vision

Build a scalable, real-time Beyblade battle game with multiple game modes, supporting both single-player and multiplayer experiences with server-authoritative physics.

### Current State

- ✅ Basic game mechanics implemented (client-side)
- ✅ Single-player vs AI working
- ✅ Beyblade and Arena management system
- ✅ Basic multiplayer infrastructure (Socket.io)
- ❌ Server-authoritative physics (needs implementation)
- ❌ Multiple game modes (needs architecture)
- ❌ Tournament system (future)

### Goals (Phase 1 & 2)

1. **Tryout Mode** - Solo practice with no opponent
2. **Single Battle** - 1v1 battles (Player vs AI)
3. Server-authoritative physics engine
4. Real-time state synchronization
5. Beyblade & Arena selection from backend

### Future Goals (Phase 3+)

- Tournament Mode (multi-tiered battles)
- Multiplayer (1v1, 1vMany, ManyvAI)

---

## 🎮 Game Modes Overview

### Mode 1: Tryout Mode

**Description:** Solo practice mode for learning game mechanics

**Features:**

- No opponent (only player's Beyblade)
- Practice controls and special moves
- Test different Beyblades and Arenas
- No win/loss conditions
- Stats tracking (optional)

**Use Cases:**

- New player tutorial
- Testing Beyblade configurations
- Learning arena mechanics
- Practicing special moves

---

### Mode 2: Single Battle

**Description:** 1v1 battles between player and opponent

**Sub-modes:**

- **Player vs AI** - Battle against AI-controlled Beyblade
  - AI Difficulty levels: Easy, Medium, Hard, Expert
  - AI behavior patterns based on Beyblade type
- **Player vs Player (1v1)** - Future implementation
  - Real-time matchmaking
  - Ranked/Unranked modes
  - Custom rooms with codes

**Features:**

- Win/loss conditions (HP reaches 0 or ring-out)
- Battle timer (90-180 seconds)
- Stats tracking and leaderboards
- Replay saving (future)

---

### Mode 3: Tournament Mode (Future - Phase 3+)

**Description:** Multi-round bracket-style competition

**Features:**

- Single elimination / Double elimination brackets
- Best of 3/5 matches
- Progressive difficulty
- Tournament rewards
- Spectator mode

**Sub-modes:**

- Solo Tournament (vs AI)
- Multiplayer Tournament (vs Players)
- Mixed Tournament (Players + AI)

---

## 🏗️ Technical Architecture

### Current Architecture (Client-Heavy)

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js Client                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │          Game State (useGameState.ts)            │   │
│  │  • Physics Calculations                          │   │
│  │  • Collision Detection                           │   │
│  │  • AI Logic                                      │   │
│  │  • Rendering                                     │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
│                          ▼                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Socket.io Client (Multiplayer)          │   │
│  │  • Send inputs only                              │   │
│  │  • Receive opponent state                        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                           │ WebSocket
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Socket.io Server (server.js)               │
│  • Room Management                                      │
│  • Basic State Broadcasting                             │
│  • No Physics (relies on client)                        │
└─────────────────────────────────────────────────────────┘
```

**Problems:**

- ❌ Client-side physics = easy to cheat
- ❌ State desync between clients
- ❌ No authoritative source of truth
- ❌ Different physics results on different devices

---

### Recommended Architecture (Server-Authoritative)

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Client                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Game Client (Renderer)                 │    │
│  │  • Rendering only                                   │    │
│  │  • Input handling                                   │    │
│  │  • Client-side prediction (optional)                │    │
│  │  • State interpolation                              │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                 │
│                           │ Send Inputs                     │
│                           ▼                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │          Colyseus Client / Socket.io                │    │
│  │  • Send: Player inputs (WASD, actions)             │    │
│  │  • Receive: Authoritative game state               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ WebSocket (60Hz)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│          Game Server (Colyseus / Node.js)                   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Room Manager (Colyseus)                │    │
│  │  • Create/Join rooms by game mode                   │    │
│  │  • Player matchmaking                               │    │
│  │  • Room lifecycle management                        │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                 │
│                           ▼                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Physics Engine (Matter.js/Planck.js)      │    │
│  │  • Beyblade physics simulation                      │    │
│  │  • Collision detection & resolution                 │    │
│  │  • Arena boundary checks                            │    │
│  │  • Spin mechanics                                   │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                 │
│                           ▼                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Game State Manager                     │    │
│  │  • Authoritative game state                         │    │
│  │  • Process player inputs                            │    │
│  │  • Run AI logic                                     │    │
│  │  • Broadcast state updates (60Hz)                   │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js API Routes                         │
│  • Beyblade data (GET /api/beyblades)                      │
│  • Arena data (GET /api/arenas)                            │
│  • Player stats (GET /api/stats)                           │
│  • Match history (GET /api/matches)                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Firestore                       │
│  • Beyblades collection                                     │
│  • Arenas collection                                        │
│  • Players collection                                       │
│  • Matches collection                                       │
│  • Tournaments collection (future)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack Recommendation

### Option 1: Colyseus (Recommended) ⭐

**Pros:**

- ✅ Built specifically for multiplayer games
- ✅ Automatic state synchronization
- ✅ Room-based architecture perfect for game modes
- ✅ Built-in matchmaking
- ✅ Client prediction & server reconciliation
- ✅ Scales horizontally with Redis
- ✅ TypeScript support
- ✅ Active community and good documentation
- ✅ Free and open-source (MIT license)

**Cons:**

- ⚠️ Learning curve for new framework
- ⚠️ Need to set up separate game server

**Best For:** Production-grade multiplayer game with scalability

**Deployment:**

- Colyseus Cloud (managed hosting, starts at $15/mo)
- Self-hosted on Render/Railway/AWS

---

### Option 2: Socket.io + Custom Server

**Pros:**

- ✅ Already partially implemented
- ✅ Familiar technology
- ✅ Full control over implementation
- ✅ Lightweight

**Cons:**

- ❌ Need to implement everything manually
- ❌ No built-in state sync
- ❌ Manual scaling implementation
- ❌ More prone to bugs

**Best For:** Quick MVP or learning project

---

### Option 3: Phaser + Colyseus

**Pros:**

- ✅ Phaser excellent for game rendering
- ✅ Built-in physics engine
- ✅ Colyseus handles networking
- ✅ Many examples and tutorials

**Cons:**

- ⚠️ Complete rewrite of current game
- ⚠️ Heavier client bundle
- ⚠️ Canvas-based (current is DOM-based)

**Best For:** Full game engine approach

---

### Recommended: Colyseus + Matter.js

**Why:**

1. **Colyseus** for multiplayer networking and room management
2. **Matter.js** for 2D physics on server
3. **React** (current) for UI and rendering
4. Keep existing beyblade/arena management

**Architecture:**

```typescript
// Server-side (Colyseus Room)
import { Room } from "colyseus";
import Matter from "matter-js";

export class BattleRoom extends Room {
  engine: Matter.Engine;

  onCreate() {
    // Initialize physics engine
    this.engine = Matter.Engine.create();

    // Start game loop (60 FPS)
    this.setSimulationInterval((deltaTime) => {
      Matter.Engine.update(this.engine, deltaTime);
      this.checkCollisions();
      this.updateGameState();
    }, 1000 / 60);
  }

  onJoin(client, options) {
    // Create player's beyblade
    this.createBeyblade(client.sessionId, options.beybladeId);
  }

  onMessage(client, type, message) {
    // Handle player inputs
    switch (type) {
      case "move":
        this.applyForceToBeyblade(client.sessionId, message.direction);
        break;
      case "special":
        this.activateSpecialMove(client.sessionId, message.moveId);
        break;
    }
  }
}
```

---

## 📅 Implementation Phases

### Phase 1: Foundation (Weeks 1-2) 🟢 PRIORITY

**Goal:** Set up server-authoritative architecture

#### Week 1: Setup & Planning

- [ ] Choose technology stack (Colyseus recommended)
- [ ] Set up Colyseus server project
- [ ] Configure development environment
- [ ] Set up Matter.js physics engine
- [ ] Create basic room structure

#### Week 2: Core Game Loop

- [ ] Implement game state schema
- [ ] Physics simulation on server
- [ ] Basic collision detection
- [ ] Input handling (server-side)
- [ ] State broadcasting (60Hz)

**Deliverable:** Server that can simulate 2 Beyblades with physics

---

### Phase 2: Tryout Mode (Weeks 3-4) 🟢 PRIORITY

**Goal:** Implement solo practice mode

#### Week 3: Tryout Mode Backend

- [ ] Create TryoutRoom class
- [ ] Single beyblade physics
- [ ] Arena loading from Firestore
- [ ] Beyblade data from Firestore
- [ ] Stadium boundary handling

#### Week 4: Tryout Mode Frontend

- [ ] Update client to connect to Colyseus
- [ ] Render beyblade from server state
- [ ] Input sending (WASD, actions)
- [ ] UI for mode selection
- [ ] Arena/Beyblade selection screen

**Deliverable:** Working Tryout Mode (solo practice)

---

### Phase 3: Single Battle - AI Mode (Weeks 5-7) 🟢 PRIORITY

**Goal:** Implement Player vs AI battles

#### Week 5: AI System

- [ ] AI behavior tree/state machine
- [ ] AI difficulty levels (Easy, Medium, Hard)
- [ ] AI movement logic
- [ ] AI attack patterns
- [ ] Type-based AI strategies (Attack/Defense/Stamina)

#### Week 6: Battle System

- [ ] Health/stamina system
- [ ] Win/loss conditions
- [ ] Battle timer
- [ ] Special moves system
- [ ] Ring-out detection

#### Week 7: Polish & UI

- [ ] Battle UI (health bars, timer)
- [ ] Victory/defeat screen
- [ ] Match statistics
- [ ] Save match history to Firestore
- [ ] Leaderboard system

**Deliverable:** Working Single Battle (Player vs AI)

---

### Phase 4: Testing & Optimization (Week 8)

- [ ] Performance testing
- [ ] Latency optimization
- [ ] Bug fixes
- [ ] Balance tuning (damage, speeds, etc.)
- [ ] Load testing (multiple rooms)

**Deliverable:** Stable, optimized game with 2 modes

---

### Phase 5: Future - Multiplayer (Weeks 9-12)

**Week 9-10: PvP Foundation**

- [ ] Matchmaking system
- [ ] Ranked/Unranked queues
- [ ] Room codes for custom games
- [ ] Latency compensation
- [ ] Client-side prediction

**Week 11-12: PvP Features**

- [ ] ELO rating system
- [ ] Global leaderboards
- [ ] Spectator mode
- [ ] Replay system
- [ ] Chat system

**Deliverable:** Working Player vs Player mode

---

### Phase 6: Future - Tournament Mode (Weeks 13-16)

- [ ] Tournament bracket system
- [ ] Tournament creation/management
- [ ] Progressive difficulty
- [ ] Tournament rewards
- [ ] Tournament history

**Deliverable:** Working Tournament System

---

## 📊 Detailed Requirements

### Functional Requirements

#### FR-1: Beyblade Selection

- **Description:** Players must select a Beyblade from the backend database
- **Priority:** High
- **Details:**
  - Fetch Beyblades from `/api/beyblades`
  - Display stats (mass, radius, type, attack, defense, stamina)
  - Visual preview
  - Filter by type
  - Search by name

#### FR-2: Arena Selection

- **Description:** Players must select an Arena from the backend database
- **Priority:** High
- **Details:**
  - Fetch Arenas from `/api/arenas`
  - Display arena properties (size, obstacles, difficulty)
  - Visual preview
  - Filter by difficulty/theme
  - Default arena if none selected

#### FR-3: Server-Authoritative Physics

- **Description:** All physics calculations happen on server
- **Priority:** Critical
- **Details:**
  - Client sends inputs only (direction, actions)
  - Server calculates positions, velocities, collisions
  - Server broadcasts authoritative state
  - Client renders state (interpolation)
  - No physics calculations on client

#### FR-4: Real-Time Synchronization

- **Description:** Game state syncs at 60Hz with minimal latency
- **Priority:** Critical
- **Details:**
  - Server tick rate: 60 FPS (16.67ms)
  - State broadcast rate: 60Hz
  - Target latency: <100ms
  - Client-side interpolation
  - Lag compensation techniques

#### FR-5: AI Opponents

- **Description:** Intelligent AI with difficulty levels
- **Priority:** High
- **Details:**
  - Difficulty: Easy, Medium, Hard, Expert
  - Type-based behavior (Attack, Defense, Stamina)
  - Strategic positioning
  - Special move usage
  - Adaptive difficulty (optional)

#### FR-6: Game Modes

- **Description:** Support multiple game modes
- **Priority:** High
- **Phase 1-2 Modes:**
  - Tryout (solo practice)
  - Single Battle (vs AI)
- **Future Modes:**
  - Single Battle (vs Player)
  - Tournament

---

### Non-Functional Requirements

#### NFR-1: Performance

- Server handles 50+ concurrent rooms
- Each room: 2-4 players + AI
- Physics simulation: 60 FPS stable
- Client rendering: 60 FPS
- Memory usage: <500MB per room

#### NFR-2: Scalability

- Horizontal scaling with Redis adapter
- Load balancing across multiple server instances
- Database connection pooling
- CDN for static assets

#### NFR-3: Reliability

- Server auto-restart on crash
- Graceful disconnection handling
- Auto-reconnection (client-side)
- State persistence for reconnection
- Error logging and monitoring

#### NFR-4: Security

- Input validation
- Rate limiting (prevent spam)
- Anti-cheat measures
- Secure WebSocket (wss://)
- Session authentication

#### NFR-5: Maintainability

- TypeScript for type safety
- Comprehensive documentation
- Unit tests for game logic
- Integration tests for multiplayer
- Code comments and architecture docs

---

## 🗄️ Database Schema

### Existing Collections

#### `beybladeStats` Collection

```typescript
interface BeybladeStats {
  id: string; // "dragoon_gt"
  displayName: string; // "Dragoon GT"
  fileName: string; // "dragoon_gt.svg"
  type: "attack" | "defense" | "stamina" | "balanced";
  spinDirection: "left" | "right";
  mass: number; // grams (40-60)
  radius: number; // cm (3-5)
  actualSize: number; // pixels for rendering

  // Stats (total = 360 points)
  typeDistribution: {
    attack: number; // 0-180
    defense: number; // 0-180
    stamina: number; // 0-180
    total: 360;
  };

  // Contact points for collision
  pointsOfContact: Array<{
    angle: number; // 0-360 degrees
    damageMultiplier: number; // 0.5-2.0
    width: number; // degrees
  }>;

  // Visual
  imageUrl?: string;
  imagePosition?: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
}
```

#### `arenas` Collection

```typescript
interface Arena {
  id: string;
  name: string;
  description: string;

  // Dimensions
  width: number; // pixels
  height: number; // pixels
  shape: "circle" | "square" | "hexagon" | "octagon";

  // Theme
  theme: string; // "metrocity", "desert", "ice", etc.

  // Game Mode
  gameMode: "player-vs-ai" | "player-vs-player" | "tournament";
  aiDifficulty?: "easy" | "medium" | "hard" | "expert";

  // Arena Features
  loops: Array<{
    radius: number;
    boostMultiplier: number; // Speed boost
    type: "normal" | "charge";
  }>;

  exits: Array<{
    radius: number;
    penalty: number; // Damage on exit
  }>;

  wall: {
    enabled: boolean;
    baseDamage: number;
    recoilDistance: number;
    hasSpikes: boolean;
    spikeDamageMultiplier: number;
    hasSprings: boolean;
    springRecoilMultiplier: number;
    thickness: number;
  };

  obstacles: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    type: "wall" | "pit" | "boost";
  }>;

  pits: Array<{
    x: number;
    y: number;
    radius: number;
    damagePerSecond: number;
  }>;

  laserGuns: Array<{
    x: number;
    y: number;
    angle: number;
    fireRate: number; // seconds
    damage: number;
  }>;

  goalObjects: Array<{
    x: number;
    y: number;
    health: number;
    points: number;
  }>;

  requireAllGoalsDestroyed: boolean;

  // Visual
  backgroundLayers: Array<{
    imageUrl: string;
    parallax: number;
  }>;

  // Physics
  gravity: number;
  airResistance: number;
  surfaceFriction: number;

  // Meta
  difficulty: "easy" | "medium" | "hard" | "expert";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### New Collections (To Implement)

#### `matches` Collection

```typescript
interface Match {
  id: string;
  mode: "tryout" | "single-battle" | "tournament";

  // Players
  player1: {
    userId: string;
    username: string;
    beybladeId: string;
    isAI: false;
  };

  player2?: {
    userId?: string; // null for AI
    username: string;
    beybladeId: string;
    isAI: boolean;
    aiDifficulty?: "easy" | "medium" | "hard" | "expert";
  };

  // Arena
  arenaId: string;

  // Results
  winner: "player1" | "player2" | "draw" | null; // null if ongoing
  status: "waiting" | "in-progress" | "finished" | "abandoned";

  // Stats
  duration: number; // seconds
  maxDuration: number; // seconds (timeout)

  player1Stats: {
    damageDealt: number;
    damageReceived: number;
    collisions: number;
    specialMovesUsed: number;
    timeInLoop: number;
    ringOuts: number;
  };

  player2Stats?: {
    /* same as player1Stats */
  };

  // Timeline (optional for replay)
  events?: Array<{
    timestamp: number;
    type: "collision" | "special-move" | "ring-out" | "damage";
    data: any;
  }>;

  // Meta
  createdAt: Timestamp;
  updatedAt: Timestamp;
  finishedAt?: Timestamp;
}
```

#### `player_stats` Collection

```typescript
interface PlayerStats {
  userId: string;
  username: string;

  // Overall stats
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number; // calculated

  // By mode
  modeStats: {
    tryout: {
      sessions: number;
      totalTime: number; // seconds
    };
    singleBattle: {
      matches: number;
      wins: number;
      losses: number;
    };
    tournament?: {
      participated: number;
      wins: number;
      bestPlacement: number;
    };
  };

  // Combat stats
  totalDamageDealt: number;
  totalDamageReceived: number;
  totalCollisions: number;
  totalSpecialMoves: number;
  totalRingOuts: number;
  perfectWins: number; // wins with 100% HP

  // Favorite loadout
  favoriteBeybladeId: string;
  favoriteArenaId: string;
  mostUsedBeyblades: Array<{
    beybladeId: string;
    timesUsed: number;
  }>;

  // Ranking (future)
  eloRating?: number;
  rank?: string; // "Bronze", "Silver", "Gold", etc.
  leaderboardPosition?: number;

  // Meta
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `tournaments` Collection (Future)

```typescript
interface Tournament {
  id: string;
  name: string;
  description: string;

  // Structure
  type: "single-elimination" | "double-elimination";
  maxPlayers: number; // 8, 16, 32, 64
  currentPlayers: number;

  // Settings
  format: "best-of-1" | "best-of-3" | "best-of-5";
  arenaId: string; // Fixed arena for tournament
  allowedBeybladeTypes?: Array<"attack" | "defense" | "stamina" | "balanced">;

  // Status
  status: "registration" | "in-progress" | "finished";

  // Bracket
  bracket: Array<{
    round: number;
    matchNumber: number;
    player1Id: string;
    player2Id: string;
    winnerId?: string;
    matchId?: string; // Reference to matches collection
  }>;

  // Prizes (optional)
  rewards: {
    first: { coins: number; items?: string[] };
    second: { coins: number; items?: string[] };
    third: { coins: number; items?: string[] };
  };

  // Meta
  registrationStartsAt: Timestamp;
  registrationEndsAt: Timestamp;
  startsAt: Timestamp;
  finishedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 🔌 API Design

### Existing REST APIs

#### Beyblades

```typescript
GET /api/beyblades
  ?type=attack|defense|stamina|balanced
  &search=dragoon

Response: {
  success: true,
  data: BeybladeStats[]
}
```

```typescript
GET /api/beyblades/:id

Response: {
  success: true,
  data: BeybladeStats
}
```

#### Arenas

```typescript
GET /api/arenas

Response: {
  success: true,
  data: Arena[]
}
```

```typescript
GET /api/arenas/:id

Response: {
  success: true,
  data: Arena
}
```

---

### New REST APIs (To Implement)

#### Matches

```typescript
// Get player's match history
GET /api/matches
  ?userId=xxx
  &mode=tryout|single-battle|tournament
  &limit=20
  &offset=0

Response: {
  success: true,
  data: Match[],
  pagination: {
    total: number;
    limit: number;
    offset: number;
  }
}
```

```typescript
// Get specific match details
GET /api/matches/:matchId

Response: {
  success: true,
  data: Match
}
```

```typescript
// Create match record (called by game server)
POST /api/matches
Body: {
  mode: string;
  player1: {...};
  player2: {...};
  arenaId: string;
  // ... other match data
}

Response: {
  success: true,
  data: Match
}
```

#### Player Stats

```typescript
// Get player statistics
GET /api/stats/:userId

Response: {
  success: true,
  data: PlayerStats
}
```

```typescript
// Get leaderboard
GET /api/leaderboard
  ?mode=single-battle|tournament
  &metric=wins|winRate|eloRating
  &limit=100

Response: {
  success: true,
  data: Array<{
    rank: number;
    userId: string;
    username: string;
    value: number;
    change: number;  // +5, -2, etc.
  }>
}
```

---

### WebSocket Events (Colyseus)

#### Client → Server

```typescript
// Join a room
client.joinOrCreate("tryout_room", {
  beybladeId: string;
  arenaId: string;
  userId: string;
  username: string;
});

client.joinOrCreate("battle_room", {
  beybladeId: string;
  arenaId: string;
  userId: string;
  username: string;
  mode: "vs-ai" | "vs-player";
  aiDifficulty?: "easy" | "medium" | "hard" | "expert";
});
```

```typescript
// Send player input
room.send("input", {
  direction: { x: number, y: number };  // Normalized vector
  action?: "special-1" | "special-2" | "dodge";
  timestamp: number;
});
```

```typescript
// Send action
room.send("action", {
  type: "charge" | "dash" | "special";
  data: any;
});
```

```typescript
// Leave room
room.leave();
```

#### Server → Client

```typescript
// State updates (60Hz)
room.onStateChange((state: GameState) => {
  // state contains:
  // - All beyblade positions, velocities, HP
  // - Arena state
  // - Timer
  // - Events (collisions, special moves)
});
```

```typescript
// Game events
room.onMessage("collision", (data) => {
  // Play collision effect
});

room.onMessage("special-move", (data) => {
  // Show special move animation
});

room.onMessage("game-over", (data) => {
  // Show victory/defeat screen
  // data: { winner, loser, stats }
});
```

---

## ✅ Checklist & Timeline

### Phase 1: Foundation (Weeks 1-2)

#### Week 1: Setup

- [ ] **Day 1-2: Technology Decision**

  - [ ] Review Colyseus documentation
  - [ ] Set up proof-of-concept
  - [ ] Performance testing
  - [ ] Final decision on stack

- [ ] **Day 3-4: Project Setup**

  - [ ] Create new `game-server` directory
  - [ ] Initialize Colyseus project
  - [ ] Set up TypeScript configuration
  - [ ] Install dependencies (Matter.js, etc.)
  - [ ] Set up development environment

- [ ] **Day 5-7: Basic Structure**
  - [ ] Create base Room class
  - [ ] Set up Matter.js engine
  - [ ] Create game state schema
  - [ ] Test local server

#### Week 2: Core Loop

- [ ] **Day 8-10: Physics Implementation**

  - [ ] Beyblade physics bodies
  - [ ] Collision detection
  - [ ] Stadium boundaries
  - [ ] Spin mechanics

- [ ] **Day 11-12: Input & State**

  - [ ] Input handling system
  - [ ] State synchronization
  - [ ] Tick rate optimization

- [ ] **Day 13-14: Testing**
  - [ ] Unit tests for physics
  - [ ] Integration tests
  - [ ] Performance benchmarks

**Milestone 1:** ✅ Server can simulate 2 Beyblades with physics

---

### Phase 2: Tryout Mode (Weeks 3-4)

#### Week 3: Backend

- [ ] **Day 15-16: Tryout Room**

  - [ ] Create TryoutRoom class
  - [ ] Load beyblade data from API
  - [ ] Load arena data from API
  - [ ] Initialize single beyblade

- [ ] **Day 17-18: Arena Features**

  - [ ] Implement loops (speed boost)
  - [ ] Implement exits (damage zones)
  - [ ] Implement walls (collision & damage)
  - [ ] Implement obstacles

- [ ] **Day 19-21: Polish**
  - [ ] Special moves system
  - [ ] Stats tracking (time played, actions used)
  - [ ] Error handling
  - [ ] Logging

#### Week 4: Frontend

- [ ] **Day 22-24: Client Integration**

  - [ ] Install Colyseus client
  - [ ] Connect to tryout room
  - [ ] Render beyblade from server state
  - [ ] Smooth interpolation
  - [ ] Input handling (WASD)

- [ ] **Day 25-26: UI Development**

  - [ ] Mode selection screen
  - [ ] Beyblade selection screen (fetch from API)
  - [ ] Arena selection screen (fetch from API)
  - [ ] In-game HUD (speed, spin, actions)

- [ ] **Day 27-28: Testing & Polish**
  - [ ] Test on different devices
  - [ ] Fix rendering issues
  - [ ] Optimize performance
  - [ ] User feedback iteration

**Milestone 2:** ✅ Working Tryout Mode

---

### Phase 3: Single Battle (Weeks 5-7)

#### Week 5: AI System

- [ ] **Day 29-31: AI Foundation**

  - [ ] AI state machine (idle, pursue, attack, evade)
  - [ ] Pathfinding (simple A\* or vector-based)
  - [ ] Target tracking
  - [ ] Decision making

- [ ] **Day 32-34: AI Behaviors**

  - [ ] Attack-type AI (aggressive)
  - [ ] Defense-type AI (defensive)
  - [ ] Stamina-type AI (evasive)
  - [ ] Balanced-type AI (mixed)

- [ ] **Day 35: Difficulty Levels**
  - [ ] Easy: Slow reactions, poor decisions
  - [ ] Medium: Balanced behavior
  - [ ] Hard: Fast reactions, good strategies
  - [ ] Expert: Optimal play, advanced tactics

#### Week 6: Battle System

- [ ] **Day 36-37: Combat Mechanics**

  - [ ] Health/HP system
  - [ ] Damage calculation (based on collision force)
  - [ ] Stamina system (depletes with actions)
  - [ ] Spin loss mechanics

- [ ] **Day 38-39: Win Conditions**

  - [ ] HP reaches 0
  - [ ] Ring-out detection
  - [ ] Timer expiration (judge by HP)
  - [ ] Surrender option

- [ ] **Day 40-42: Special Moves**
  - [ ] Rush Attack (damage boost)
  - [ ] Shield (damage reduction)
  - [ ] Spin Boost (recover spin)
  - [ ] Dash (speed boost)
  - [ ] Ultimate moves (per beyblade type)

#### Week 7: Polish & Stats

- [ ] **Day 43-44: Battle UI**

  - [ ] Health bars (both players)
  - [ ] Stamina bars
  - [ ] Timer display
  - [ ] Special move cooldowns
  - [ ] Action indicators

- [ ] **Day 45-46: Post-Battle**

  - [ ] Victory/defeat animation
  - [ ] Stats summary screen
  - [ ] Save match to Firestore
  - [ ] Update player stats
  - [ ] Rematch/exit options

- [ ] **Day 47-49: Testing & Balance**
  - [ ] Playtest with different Beyblades
  - [ ] AI difficulty balancing
  - [ ] Damage/HP balancing
  - [ ] Bug fixes

**Milestone 3:** ✅ Working Single Battle (Player vs AI)

---

### Phase 4: Testing & Optimization (Week 8)

- [ ] **Day 50-51: Performance Testing**

  - [ ] Load testing (50+ concurrent rooms)
  - [ ] Memory profiling
  - [ ] CPU optimization
  - [ ] Network bandwidth optimization

- [ ] **Day 52-53: Latency Optimization**

  - [ ] Measure round-trip time
  - [ ] Client-side prediction (optional)
  - [ ] Lag compensation techniques
  - [ ] State delta compression

- [ ] **Day 54-55: Bug Fixes**

  - [ ] Fix critical bugs
  - [ ] Fix edge cases
  - [ ] Improve error handling
  - [ ] Add logging

- [ ] **Day 56: Final Testing**
  - [ ] User acceptance testing
  - [ ] Cross-browser testing
  - [ ] Mobile testing
  - [ ] Documentation update

**Milestone 4:** ✅ Stable, optimized game ready for production

---

## 🎨 References & Inspiration

### Successful Real-Time Multiplayer Games

1. **Agar.io** - Simple physics, server-authoritative
2. **Slither.io** - Smooth movement, minimal latency
3. **Krunker.io** - Fast-paced, optimized netcode
4. **Kirka.io** - Built with Colyseus
5. **Make it Meme** - Social multiplayer with Colyseus

### Technical Resources

#### Colyseus Documentation

- Getting Started: https://docs.colyseus.io/getting-started/
- State Handling: https://docs.colyseus.io/state/
- Room Lifecycle: https://docs.colyseus.io/server/room/

#### Game Networking

- Valve's Networking Guide: https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking
- Gaffer on Games: https://gafferongames.com/
- Fast-Paced Multiplayer: http://www.gabrielgambetta.com/client-server-game-architecture.html

#### Physics Engines

- Matter.js Docs: https://brm.io/matter-js/
- Planck.js (Box2D port): https://piqnt.com/planck.js/

### Similar Games for Reference

1. **Beyblade Burst (Mobile)** - Official game, battle mechanics
2. **Beyblade Evolution (3DS)** - 3D battles, physics
3. **Top Spin (Flash)** - Simple 2D top physics

---

## 📈 Success Metrics

### Technical Metrics

- **Latency:** <100ms average round-trip time
- **FPS:** 60 FPS on server, 60 FPS on client
- **Capacity:** 50+ concurrent rooms per server instance
- **Uptime:** 99.9%
- **Crash Rate:** <0.1%

### User Engagement Metrics

- **DAU (Daily Active Users):** Track daily logins
- **Average Session Time:** >10 minutes
- **Matches per Session:** >3
- **Retention Rate:** >40% day-7 retention
- **Conversion Rate:** >20% trying multiplayer after single-player

### Business Metrics (Future)

- **Revenue per User:** Track in-app purchases
- **Churn Rate:** <5% monthly
- **Viral Coefficient:** >1.0 (each user brings 1+ new user)

---

## 🚀 Deployment Strategy

### Development Environment

```bash
# Local development
cd game-server
npm run dev

# Client
cd ..
npm run dev
```

### Staging Environment

- **Server:** Render.com / Railway (free tier)
- **Database:** Firebase Firestore (free tier)
- **Domain:** staging-game.justforview.in

### Production Environment

#### Option 1: Self-Hosted (Recommended for MVP)

- **Server:** Render.com ($7/mo per instance)
  - Deploy `game-server` directory
  - Auto-scaling enabled
  - Health checks configured
- **Load Balancer:** Render built-in
- **Redis:** Redis Cloud (free tier 30MB)
  - For Colyseus presence (multi-instance)

#### Option 2: Colyseus Cloud (Recommended for Scale)

- **Hosting:** Colyseus Cloud ($15/mo starting)
  - Managed infrastructure
  - Auto-scaling
  - Built-in monitoring
  - No ops required

#### Hybrid Approach

- **Phase 1-2:** Self-hosted on Render ($7/mo)
- **Phase 3+:** Migrate to Colyseus Cloud when scaling needed

### CI/CD Pipeline

```yaml
# .github/workflows/deploy-game-server.yml
name: Deploy Game Server

on:
  push:
    branches: [main]
    paths:
      - "game-server/**"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        run: |
          # Deploy script
```

---

## 🔒 Security Considerations

### Input Validation

- [ ] Validate all client inputs (direction, actions)
- [ ] Rate limiting (max 60 inputs/sec)
- [ ] Sanitize data before processing

### Anti-Cheat

- [ ] Server-authoritative physics (already implemented)
- [ ] Validate physics constraints (max speed, etc.)
- [ ] Detect impossible movements
- [ ] Ban suspicious activity

### Authentication

- [ ] Verify user session tokens
- [ ] Link WebSocket to authenticated user
- [ ] Prevent spoofing user IDs

### DDoS Protection

- [ ] Rate limiting per IP
- [ ] Cloudflare or similar CDN
- [ ] Connection limits per user

---

## 📝 Next Steps

### Immediate Actions (This Week)

1. **Decision:** Choose Colyseus vs Custom Socket.io
2. **Proof of Concept:** Build minimal working example
3. **Architecture Review:** Get team approval
4. **Timeline Confirmation:** Adjust based on team capacity

### Questions to Answer

- [ ] What's the budget for server hosting?
- [ ] What's the target launch date?
- [ ] How many concurrent players do we expect?
- [ ] Do we need mobile app or web-only?
- [ ] Will there be monetization (in-app purchases)?

### Resources Needed

- [ ] 1-2 Backend Developers (Node.js, Colyseus)
- [ ] 1 Frontend Developer (React, WebSocket)
- [ ] 1 Game Designer (balance, AI behavior)
- [ ] 1 QA Tester (playtesting, bug reporting)
- [ ] Server infrastructure ($7-15/mo)

---

## 📞 Support & Contact

**Documentation Maintainer:** Development Team  
**Last Updated:** November 5, 2025  
**Version:** 1.0

For questions or suggestions, please refer to the project's issue tracker or contact the development team.

---

**END OF DOCUMENT**
