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

## 🌐 Advanced Multiplayer Modes (Future - Phase 4+)

### Overview of Multiplayer Modes

```
┌─────────────────────────────────────────────────────────────┐
│                  MULTIPLAYER MODE MATRIX                     │
│                                                              │
│  Mode              │ Players │ AI  │ Room Size │ Phase      │
│  ─────────────────────────────────────────────────────────  │
│  1v1 PvP           │    2    │  0  │     2     │ Phase 3    │
│  1vMany PvP        │   2-4   │  0  │    2-4    │ Phase 4    │
│  Co-op (Raid)      │   2-4   │ 1-N │    2-5    │ Phase 5    │
│  FFA (Free-for-All)│   3-8   │  0  │    3-8    │ Phase 5    │
│  Team Battle       │    4    │  0  │     4     │ Phase 5    │
│  Tournament PvP    │  8-64   │  0  │  Dynamic  │ Phase 6    │
└─────────────────────────────────────────────────────────────┘
```

---

### Mode 1: 1v1 PvP (Player vs Player)

**Description:** Two players battle head-to-head in real-time

```
┌─────────────┐                         ┌─────────────┐
│  Player 1   │                         │  Player 2   │
└──────┬──────┘                         └──────┬──────┘
       │                                       │
       │ 1. Queue for ranked/unranked         │
       └───────────────┬───────────────────────┘
                       │
                       ▼
       ┌───────────────────────────────────────┐
       │      Matchmaking Service              │
       │  • Find opponent (similar ELO)        │
       │  • Create private room                │
       │  • Notify both players                │
       └───────────────┬───────────────────────┘
                       │
                       ▼
       ┌───────────────────────────────────────┐
       │        Match Setup Phase              │
       │  Both players:                        │
       │  • Select Beyblade                    │
       │  • Select Arena (or vote)             │
       │  • Ready up                           │
       └───────────────┬───────────────────────┘
                       │
                       ▼
       ┌───────────────────────────────────────┐
       │         Battle Phase                  │
       │  • Real-time combat                   │
       │  • Server-authoritative physics       │
       │  • 60Hz state sync                    │
       │  • Collision detection                │
       │  • Win condition check                │
       └───────────────┬───────────────────────┘
                       │
                       ▼
       ┌───────────────────────────────────────┐
       │         Results Phase                 │
       │  • Winner announced                   │
       │  • ELO update (ranked)                │
       │  • Stats saved                        │
       │  • Rematch option                     │
       └───────────────────────────────────────┘
```

**Technical Architecture:**

```typescript
// Server: PvPBattleRoom.ts
export class PvPBattleRoom extends Room<GameState> {
  maxClients = 2;

  onCreate(options: { mode: 'ranked' | 'unranked' }) {
    this.setState(new GameState());
    this.matchmakingMode = options.mode;

    // Wait for both players to join
    this.waitingForPlayers = true;
  }

  onJoin(client: Client, options: any) {
    const playerNumber = this.clients.length;

    // Create player slot
    const player = new Player();
    player.id = client.sessionId;
    player.username = options.username;
    player.playerNumber = playerNumber;

    this.state.players.set(client.sessionId, player);

    // Start when both players joined
    if (this.clients.length === 2) {
      this.startMatchSetup();
    }
  }

  startMatchSetup() {
    this.state.phase = "setup";
    this.broadcast("matchReady", {
      opponent: /* opponent info */
    });
  }

  onMessage(client: Client, type: string, message: any) {
    switch(type) {
      case "selectBeyblade":
        this.handleBeybladeSelect(client, message);
        break;
      case "ready":
        this.handlePlayerReady(client);
        break;
      case "input":
        this.handlePlayerInput(client, message);
        break;
    }
  }

  handlePlayerReady(client: Client) {
    const player = this.state.players.get(client.sessionId);
    player.isReady = true;

    // Start battle when both ready
    if (this.allPlayersReady()) {
      this.startBattle();
    }
  }

  startBattle() {
    this.state.phase = "battle";

    // Initialize physics for both beyblades
    this.initializePhysics();

    // Start game loop
    this.setSimulationInterval((deltaTime) => {
      this.updatePhysics(deltaTime);
      this.checkWinCondition();
    }, 1000 / 60);
  }

  checkWinCondition() {
    const players = Array.from(this.state.players.values());
    const alivePlayers = players.filter(p => p.health > 0);

    if (alivePlayers.length === 1) {
      this.endBattle(alivePlayers[0]);
    }
  }

  endBattle(winner: Player) {
    this.state.phase = "results";
    this.state.winner = winner.id;

    // Update ELO (if ranked)
    if (this.matchmakingMode === 'ranked') {
      this.updatePlayerELO(winner, /* loser */);
    }

    // Save match to database
    this.saveMatchResults();

    this.broadcast("gameOver", {
      winner: winner.id,
      stats: /* ... */
    });
  }
}
```

**Matchmaking Logic:**

```typescript
// Server: MatchmakingService.ts
export class MatchmakingService {
  private queue: Map<string, QueueEntry> = new Map();

  addToQueue(
    userId: string,
    options: {
      mode: "ranked" | "unranked";
      eloRating?: number;
      region?: string;
    }
  ) {
    const entry: QueueEntry = {
      userId,
      ...options,
      joinedAt: Date.now(),
    };

    this.queue.set(userId, entry);

    // Try to find match
    this.findMatch(entry);
  }

  findMatch(player1: QueueEntry) {
    // Find suitable opponent
    for (const [id, player2] of this.queue) {
      if (id === player1.userId) continue;

      // Check if ELO difference acceptable (ranked only)
      if (player1.mode === "ranked") {
        const eloDiff = Math.abs(player1.eloRating - player2.eloRating);

        // Allow up to 200 ELO difference
        if (eloDiff > 200) continue;
      }

      // Match found!
      this.createMatch(player1, player2);
      return;
    }
  }

  async createMatch(player1: QueueEntry, player2: QueueEntry) {
    // Remove from queue
    this.queue.delete(player1.userId);
    this.queue.delete(player2.userId);

    // Create battle room
    const room = await colyseus.createRoom("pvp_battle", {
      mode: player1.mode,
      player1Id: player1.userId,
      player2Id: player2.userId,
    });

    // Notify players
    this.notifyPlayers(player1, player2, room.id);
  }
}
```

---

### Mode 2: 1vMany PvP (1 vs 2-3 Players)

**Description:** One player vs multiple opponents simultaneously

```
┌─────────────┐
│  Player 1   │  (The "One")
└──────┬──────┘
       │
       │ Host creates room
       ▼
┌──────────────────────────────┐
│     Create 1vMany Room       │
│  • Room code generated       │
│  • Set max opponents (2-3)   │
│  • Select beyblade           │
└──────┬───────────────────────┘
       │
       │ Share room code
       ▼
┌──────────────────────────────┐
│   Other players join         │
│  Player 2 ───┐               │
│  Player 3 ───┼─→ Join code   │
│  Player 4 ───┘               │
└──────┬───────────────────────┘
       │
       │ All ready
       ▼
┌──────────────────────────────┐
│      Battle Royale           │
│  1 vs Many                   │
│  • Shared HP pool (Many)     │
│  • Or individual HP          │
│  • Last standing wins        │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│    Results                   │
│  • The One won, or           │
│  • The Many won              │
└──────────────────────────────┘
```

**Server Architecture:**

```typescript
// Server: OneVsManyRoom.ts
export class OneVsManyRoom extends Room<GameState> {
  maxClients = 4; // 1 host + 3 opponents

  onCreate(options: { hostId: string; maxOpponents: number }) {
    this.setState(new GameState());

    this.state.mode = "1vMany";
    this.state.hostId = options.hostId;
    this.state.maxOpponents = options.maxOpponents;

    // Generate room code
    this.roomCode = this.generateRoomCode();

    this.metadata = {
      roomCode: this.roomCode,
      hostId: options.hostId,
      openSlots: options.maxOpponents,
    };
  }

  onJoin(client: Client, options: any) {
    const isHost = client.sessionId === this.state.hostId;

    const player = new Player();
    player.id = client.sessionId;
    player.username = options.username;
    player.role = isHost ? "host" : "opponent";

    this.state.players.set(client.sessionId, player);

    // Update open slots
    if (!isHost) {
      this.metadata.openSlots--;
    }

    this.broadcast("playerJoined", {
      playerId: client.sessionId,
      username: options.username,
      role: player.role,
    });
  }

  startBattle() {
    // Initialize physics
    const hostPlayer = this.state.players.get(this.state.hostId);
    const opponents = Array.from(this.state.players.values()).filter(
      (p) => p.role === "opponent"
    );

    // Host gets centered position
    this.createBeyblade(hostPlayer, { x: 400, y: 400 });

    // Opponents spawn around the edge
    opponents.forEach((opp, index) => {
      const angle = ((Math.PI * 2) / opponents.length) * index;
      const radius = 250;
      const pos = {
        x: 400 + Math.cos(angle) * radius,
        y: 400 + Math.sin(angle) * radius,
      };

      this.createBeyblade(opp, pos);
    });

    // Game loop
    this.setSimulationInterval((deltaTime) => {
      this.updatePhysics(deltaTime);
      this.checkWinCondition();
    }, 1000 / 60);
  }

  checkWinCondition() {
    const host = this.state.players.get(this.state.hostId);
    const opponents = Array.from(this.state.players.values()).filter(
      (p) => p.role === "opponent"
    );

    const aliveOpponents = opponents.filter((p) => p.health > 0);

    if (host.health <= 0) {
      // Opponents win
      this.endBattle("opponents");
    } else if (aliveOpponents.length === 0) {
      // Host wins
      this.endBattle("host");
    }
  }
}
```

**Client Flow:**

```typescript
// Client: Create 1vMany room
async function createOneVsManyRoom() {
  const room = await client.create("one_vs_many", {
    hostId: currentUserId,
    maxOpponents: 3,
  });

  // Show room code to share
  const roomCode = room.metadata.roomCode;
  showRoomCode(roomCode); // "ABC123"

  return room;
}

// Client: Join 1vMany room
async function joinOneVsManyRoom(roomCode: string) {
  const rooms = await client.getAvailableRooms("one_vs_many");
  const targetRoom = rooms.find((r) => r.metadata.roomCode === roomCode);

  if (!targetRoom) {
    throw new Error("Room not found");
  }

  const room = await client.joinById(targetRoom.roomId, {
    username: currentUsername,
  });

  return room;
}
```

---

### Mode 3: Co-op Raid Mode (2-4 Players + Friends vs AI Boss)

**Description:** Team of players vs powerful AI boss(es)

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Player 1   │  │  Player 2   │  │  Player 3   │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       │  Create/Join Raid Room          │
       └────────────────┼────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │        Raid Lobby                     │
        │  • Select raid difficulty             │
        │    - Easy (1 AI)                      │
        │    - Medium (1 strong AI)             │
        │    - Hard (2 AIs)                     │
        │    - Nightmare (3 AIs)                │
        │  • Choose beyblades                   │
        │  • Team coordination                  │
        └───────────────┬───────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │         Raid Battle                   │
        │                                       │
        │  👥👥👥  (Players)                    │
        │           vs                          │
        │  🤖🤖   (Boss AIs)                    │
        │                                       │
        │  • Shared objectives                  │
        │  • Boss has massive HP                │
        │  • Special boss moves                 │
        │  • Team respawn pool (3 lives total) │
        └───────────────┬───────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │         Raid Results                  │
        │  • Victory (shared rewards)           │
        │  • Defeat (try again)                 │
        │  • MVP player                         │
        │  • Contribution stats                 │
        └───────────────────────────────────────┘
```

**Server Implementation:**

```typescript
// Server: RaidRoom.ts
export class RaidRoom extends Room<GameState> {
  maxClients = 4; // Up to 4 players
  bossAIs: AIController[] = [];

  onCreate(options: { difficulty: "easy" | "medium" | "hard" | "nightmare" }) {
    this.setState(new GameState());

    this.state.mode = "raid";
    this.state.difficulty = options.difficulty;

    // Configure boss based on difficulty
    this.configureBoss(options.difficulty);
  }

  configureBoss(difficulty: string) {
    const bossConfigs = {
      easy: {
        aiCount: 1,
        aiHP: 300,
        aiDifficulty: "medium",
        teamLives: 5,
      },
      medium: {
        aiCount: 1,
        aiHP: 500,
        aiDifficulty: "hard",
        teamLives: 4,
      },
      hard: {
        aiCount: 2,
        aiHP: 400,
        aiDifficulty: "hard",
        teamLives: 3,
      },
      nightmare: {
        aiCount: 3,
        aiHP: 350,
        aiDifficulty: "expert",
        teamLives: 2,
      },
    };

    this.bossConfig = bossConfigs[difficulty];
  }

  startRaid() {
    // Create player beyblades (team)
    const players = Array.from(this.state.players.values());
    players.forEach((player, index) => {
      const angle = ((Math.PI * 2) / players.length) * index;
      const radius = 200;
      const pos = {
        x: 400 + Math.cos(angle) * radius,
        y: 400 + Math.sin(angle) * radius,
      };

      this.createBeyblade(player, pos);
    });

    // Create boss AI beyblades
    for (let i = 0; i < this.bossConfig.aiCount; i++) {
      const bossAI = new AIController({
        difficulty: this.bossConfig.aiDifficulty,
        type: "boss",
      });

      const boss = new Beyblade();
      boss.id = `boss_${i}`;
      boss.health = this.bossConfig.aiHP;
      boss.position = { x: 400, y: 400 }; // Center
      boss.isBoss = true;

      this.state.beyblades.set(boss.id, boss);
      this.bossAIs.push(bossAI);
    }

    // Initialize team lives
    this.state.teamLives = this.bossConfig.teamLives;

    // Start game loop
    this.setSimulationInterval((deltaTime) => {
      // Update boss AI
      this.bossAIs.forEach((ai) => {
        const action = ai.calculateAction(this.state);
        this.applyAIAction(ai, action);
      });

      this.updatePhysics(deltaTime);
      this.checkRaidConditions();
    }, 1000 / 60);
  }

  onPlayerDefeat(playerId: string) {
    this.state.teamLives--;

    if (this.state.teamLives > 0) {
      // Respawn player after 5 seconds
      setTimeout(() => {
        this.respawnPlayer(playerId);
      }, 5000);

      this.broadcast("playerDefeat", {
        playerId,
        remainingLives: this.state.teamLives,
        respawnIn: 5,
      });
    } else {
      // No more team lives - raid failed
      this.endRaid(false);
    }
  }

  checkRaidConditions() {
    const bosses = Array.from(this.state.beyblades.values()).filter(
      (b) => b.isBoss
    );
    const aliveBosses = bosses.filter((b) => b.health > 0);

    if (aliveBosses.length === 0) {
      // All bosses defeated - raid success
      this.endRaid(true);
    }

    // Check if all players defeated
    const players = Array.from(this.state.players.values());
    const alivePlayers = players.filter((p) => p.health > 0);

    if (alivePlayers.length === 0 && this.state.teamLives <= 0) {
      // Team wiped - raid failed
      this.endRaid(false);
    }
  }

  endRaid(success: boolean) {
    this.state.phase = "results";

    if (success) {
      // Calculate rewards
      const rewards = this.calculateRaidRewards();

      // Determine MVP
      const mvp = this.calculateMVP();

      this.broadcast("raidComplete", {
        success: true,
        rewards,
        mvp,
        stats: this.calculateTeamStats(),
      });
    } else {
      this.broadcast("raidFailed", {
        success: false,
        stats: this.calculateTeamStats(),
      });
    }
  }

  calculateMVP(): string {
    // MVP = player with most damage dealt
    const players = Array.from(this.state.players.values());

    let mvp = players[0];
    let maxDamage = 0;

    players.forEach((player) => {
      if (player.stats.damageDealt > maxDamage) {
        maxDamage = player.stats.damageDealt;
        mvp = player;
      }
    });

    return mvp.id;
  }

  calculateRaidRewards() {
    const baseReward = {
      coins: 100,
      experience: 50,
    };

    // Multiply by difficulty
    const multipliers = {
      easy: 1,
      medium: 1.5,
      hard: 2,
      nightmare: 3,
    };

    const mult = multipliers[this.state.difficulty];

    return {
      coins: baseReward.coins * mult,
      experience: baseReward.experience * mult,
    };
  }
}
```

**Boss AI Behavior:**

```typescript
// Server: BossAI.ts
export class BossAI extends AIController {
  specialMoveTimer = 0;
  rageMode = false;

  calculateAction(gameState: GameState): AIAction {
    const boss = this.beyblade;
    const players = this.getAlivePlayers(gameState);

    // Enter rage mode when HP < 30%
    if (boss.health < boss.maxHealth * 0.3) {
      this.rageMode = true;
    }

    // Special move every 10 seconds
    if (this.specialMoveTimer >= 10) {
      this.specialMoveTimer = 0;
      return this.useBossSpecialMove();
    }

    // Rage mode: more aggressive, faster attacks
    if (this.rageMode) {
      return this.rageModeBehavior(players);
    }

    // Normal mode: target weakest player
    const weakestPlayer = this.findWeakestPlayer(players);
    return this.pursueAndAttack(weakestPlayer);
  }

  useBossSpecialMove(): AIAction {
    const specialMoves = [
      "aoe_spin_attack", // Damages all players in radius
      "meteor_strike", // High damage to one player
      "shield_regenerate", // Regain HP
      "speed_boost", // Temporary speed increase
    ];

    const move = specialMoves[Math.floor(Math.random() * specialMoves.length)];

    return { type: "special", move };
  }
}
```

---

### Mode 4: Free-For-All (3-8 Players)

**Description:** Battle royale style - last Beyblade standing wins

```
┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│ P1 │ │ P2 │ │ P3 │ │ P4 │ │ P5 │ │ P6 │
└─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘
  │      │      │      │      │      │
  └──────┴──────┴──────┴──────┴──────┘
                 │
                 ▼
     ┌───────────────────────────┐
     │   FFA Battle Arena        │
     │                           │
     │   🔵 🔴 🟢 🟡 🟣 🟠     │
     │                           │
     │  • Everyone vs Everyone   │
     │  • No teams               │
     │  • Alliances allowed      │
     │  • Last standing wins     │
     └───────────────────────────┘
```

---

### Mode 5: Tournament Mode (8-64 Players) - PvP Edition

**Description:** Organized bracket-style tournament with real players

```
┌──────────────────────────────────────────────────────────────┐
│              TOURNAMENT BRACKET (16 Players)                  │
│                                                              │
│  Registration Phase:                                         │
│  Player 1-16 register                                        │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────────────┐        │
│  │           Bracket Generation                     │        │
│  │  • Single/Double elimination                     │        │
│  │  • Seeding (by ELO if ranked)                    │        │
│  │  • Random if casual                              │        │
│  └────────────────┬────────────────────────────────┘        │
│                   │                                          │
│                   ▼                                          │
│  ┌─────────────────────────────────────────────────┐        │
│  │              Round 1 (16→8)                      │        │
│  │                                                  │        │
│  │  Match 1: P1  vs P16  →  Winner A               │        │
│  │  Match 2: P8  vs P9   →  Winner B               │        │
│  │  Match 3: P5  vs P12  →  Winner C               │        │
│  │  Match 4: P4  vs P13  →  Winner D               │        │
│  │  Match 5: P3  vs P14  →  Winner E               │        │
│  │  Match 6: P6  vs P11  →  Winner F               │        │
│  │  Match 7: P7  vs P10  →  Winner G               │        │
│  │  Match 8: P2  vs P15  →  Winner H               │        │
│  └────────────────┬────────────────────────────────┘        │
│                   │                                          │
│                   ▼                                          │
│  ┌─────────────────────────────────────────────────┐        │
│  │          Quarter Finals (8→4)                    │        │
│  │                                                  │        │
│  │  QF1: Winner A vs Winner B  →  Semi 1           │        │
│  │  QF2: Winner C vs Winner D  →  Semi 2           │        │
│  │  QF3: Winner E vs Winner F  →  Semi 3           │        │
│  │  QF4: Winner G vs Winner H  →  Semi 4           │        │
│  └────────────────┬────────────────────────────────┘        │
│                   │                                          │
│                   ▼                                          │
│  ┌─────────────────────────────────────────────────┐        │
│  │           Semi Finals (4→2)                      │        │
│  │                                                  │        │
│  │  SF1: Semi 1 vs Semi 2  →  Finalist 1           │        │
│  │  SF2: Semi 3 vs Semi 4  →  Finalist 2           │        │
│  └────────────────┬────────────────────────────────┘        │
│                   │                                          │
│                   ▼                                          │
│  ┌─────────────────────────────────────────────────┐        │
│  │                Finals (2→1)                      │        │
│  │                                                  │        │
│  │     Finalist 1  vs  Finalist 2                  │        │
│  │              ↓                                   │        │
│  │          🏆 CHAMPION 🏆                          │        │
│  └─────────────────────────────────────────────────┘        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Tournament Server Architecture:**

```typescript
// Server: TournamentRoom.ts
export class TournamentRoom extends Room<TournamentState> {
  onCreate(options: {
    type: 'single-elimination' | 'double-elimination';
    maxPlayers: 8 | 16 | 32 | 64;
    format: 'best-of-1' | 'best-of-3' | 'best-of-5';
    mode: 'casual' | 'ranked';
  }) {
    this.setState(new TournamentState());

    this.state.config = options;
    this.state.phase = "registration";
    this.state.registeredPlayers = new MapSchema();
    this.state.bracket = [];
  }

  onJoin(client: Client, options: any) {
    // Registration phase
    if (this.state.phase !== "registration") {
      client.leave(1000, "Tournament already started");
      return;
    }

    const player = new TournamentPlayer();
    player.id = client.sessionId;
    player.username = options.username;
    player.beybladeId = options.beybladeId;
    player.eloRating = options.eloRating;

    this.state.registeredPlayers.set(client.sessionId, player);

    // Check if tournament is full
    if (this.state.registeredPlayers.size >= this.state.config.maxPlayers) {
      this.startTournament();
    }
  }

  startTournament() {
    this.state.phase = "bracket-generation";

    // Generate bracket with seeding
    const players = Array.from(this.state.registeredPlayers.values());

    if (this.state.config.mode === 'ranked') {
      // Seed by ELO rating
      players.sort((a, b) => b.eloRating - a.eloRating);
    } else {
      // Random seeding
      this.shuffleArray(players);
    }

    // Create bracket structure
    this.createBracket(players);

    // Start round 1
    this.startRound(1);
  }

  createBracket(players: TournamentPlayer[]) {
    const rounds = Math.log2(players.length);

    // Round 1: pair all players
    for (let i = 0; i < players.length; i += 2) {
      const match: BracketMatch = {
        id: `r1_m${i/2}`,
        round: 1,
        player1Id: players[i].id,
        player2Id: players[i + 1].id,
        winnerId: null,
        roomId: null,
        status: "pending",
      };

      this.state.bracket.push(match);
    }

    // Create placeholder matches for future rounds
    for (let round = 2; round <= rounds; round++) {
      const matchesInRound = Math.pow(2, rounds - round);

      for (let m = 0; m < matchesInRound; m++) {
        const match: BracketMatch = {
          id: `r${round}_m${m}`,
          round,
          player1Id: null, // TBD from previous round
          player2Id: null,
          winnerId: null,
          roomId: null,
          status: "pending",
        };

        this.state.bracket.push(match);
      }
    }
  }

  async startRound(roundNumber: number) {
    this.state.currentRound = roundNumber;

    // Get all matches in this round
    const matches = this.state.bracket.filter(m =>
      m.round === roundNumber && m.status === "pending"
    );

    // Create battle rooms for each match
    for (const match of matches) {
      if (!match.player1Id || !match.player2Id) continue;

      // Create PvP battle room
      const battleRoom = await colyseus.createRoom("pvp_battle", {
        mode: 'tournament',
        tournamentId: this.roomId,
        matchId: match.id,
        player1Id: match.player1Id,
        player2Id: match.player2Id,
        format: this.state.config.format,
      });

      match.roomId = battleRoom.roomId;
      match.status = "in-progress";

      // Notify players
      this.send(match.player1Id, "matchReady", {
        matchId: match.id,
        roomId: battleRoom.roomId,
        opponent: this.state.registeredPlayers.get(match.player2Id),
      });

      this.send(match.player2Id, "matchReady", {
        matchId: match.id,
        roomId: battleRoom.roomId,
        opponent: this.state.registeredPlayers.get(match.player1Id),
      });
    }
  }

  onMatchComplete(matchId: string, winnerId: string) {
    const match = this.state.bracket.find(m => m.id === matchId);
    if (!match) return;

    match.winnerId = winnerId;
    match.status = "completed";

    // Update next round match
    this.advanceWinner(match);

    // Check if round is complete
    const roundMatches = this.state.bracket.filter(m =>
      m.round === match.round
    );
    const completedMatches = roundMatches.filter(m =>
      m.status === "completed"
    );

    if (completedMatches.length === roundMatches.length) {
      // Round complete
      if (this.isFinalRound(match.round)) {
        this.endTournament(winnerId);
      } else {
        this.startRound(match.round + 1);
      }
    }
  }

  advanceWinner(completedMatch: BracketMatch) {
    const nextRound = completedMatch.round + 1;
    const matchNumber = Math.floor(
      parseInt(completedMatch.id.split('_m')[1]) / 2
    );

    const nextMatchId = `r${nextRound}_m${matchNumber}`;
    const nextMatch = this.state.bracket.find(m => m.id === nextMatchId);

    if (nextMatch) {
      // Determine which slot (player1 or player2)
      const isEvenMatch = parseInt(completedMatch.id.split('_m')[1]) % 2 === 0;

      if (isEvenMatch) {
        nextMatch.player1Id = completedMatch.winnerId;
      } else {
        nextMatch.player2Id = completedMatch.winnerId;
      }
    }
  }

  isFinalRound(round: number): boolean {
    const totalRounds = Math.log2(this.state.config.maxPlayers);
    return round === totalRounds;
  }

  endTournament(championId: string) {
    this.state.phase = "completed";
    this.state.championId = championId;

    // Calculate final standings
    const standings = this.calculateStandings();

    // Distribute rewards
    const rewards = this.calculateRewards(standings);

    this.broadcast("tournamentComplete", {
      champion: this.state.registeredPlayers.get(championId),
      standings,
      rewards,
    });

    // Save tournament results
    this.saveTournamentResults();
  }

  calculateStandings(): TournamentStanding[] {
    const standings: TournamentStanding[] = [];

    // Champion (1st place)
    standings.push({
      rank: 1,
      playerId: this.state.championId,
      rounds Won: Math.log2(this.state.config.maxPlayers),
    });

    // Runner-up (2nd place)
    const finalMatch = this.state.bracket.find(m =>
      this.isFinalRound(m.round)
    );
    const runnerId = finalMatch.player1Id === this.state.championId
      ? finalMatch.player2Id
      : finalMatch.player1Id;

    standings.push({
      rank: 2,
      playerId: runnerId,
      roundsWon: Math.log2(this.state.config.maxPlayers) - 1,
    });

    // Calculate rest of standings based on elimination round
    // ... (implementation continues)

    return standings;
  }
}
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
