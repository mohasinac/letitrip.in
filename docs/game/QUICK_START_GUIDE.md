# 🚀 Game Modes - Quick Start Guide

**For Developers**  
**Last Updated:** November 5, 2025

---

## TL;DR - What You Need to Know

### Current State

- ✅ Basic game works (client-side physics)
- ✅ Beyblades & Arenas in database
- ❌ Server-authoritative physics needed
- ❌ Multiple game modes needed

### Goal

Build 3 game modes with server-authoritative architecture:

1. **Tryout** - Solo practice (Phase 1)
2. **Single Battle** - 1v1 vs AI (Phase 2)
3. **Tournament** - Bracket battles (Phase 3 - Future)

### Recommended Stack

- **Colyseus** - Multiplayer framework
- **Matter.js** - Physics engine (server-side)
- **React** - Keep current frontend
- **Firestore** - Keep current database

---

## 📦 Installation (Option 1: Colyseus)

### Step 1: Install Colyseus

```bash
# In project root
npm create colyseus-app@latest ./game-server

# Follow prompts:
# - TypeScript: Yes
# - Template: Empty
```

### Step 2: Install Dependencies

```bash
cd game-server
npm install matter-js @types/matter-js
npm install @colyseus/monitor  # Optional admin panel
```

### Step 3: Project Structure

```
game-server/
├── src/
│   ├── rooms/
│   │   ├── TryoutRoom.ts      # Tryout mode
│   │   ├── BattleRoom.ts      # Single battle mode
│   │   └── schema/
│   │       └── GameState.ts   # State schema
│   ├── physics/
│   │   ├── PhysicsEngine.ts   # Matter.js wrapper
│   │   ├── Beyblade.ts        # Beyblade physics
│   │   └── Arena.ts           # Arena setup
│   ├── ai/
│   │   ├── AIController.ts    # AI logic
│   │   └── behaviors/         # AI behaviors
│   ├── utils/
│   │   └── firebase.ts        # Firestore client
│   └── index.ts               # Server entry
├── package.json
└── tsconfig.json
```

---

## 🎮 Quick Implementation Guide

### 1. Create Tryout Room (Weeks 3-4)

**File:** `game-server/src/rooms/TryoutRoom.ts`

```typescript
import { Room, Client } from "colyseus";
import { GameState } from "./schema/GameState";
import { PhysicsEngine } from "../physics/PhysicsEngine";
import { loadBeyblade, loadArena } from "../utils/firebase";

export class TryoutRoom extends Room<GameState> {
  private physics!: PhysicsEngine;

  async onCreate(options: any) {
    this.setState(new GameState());

    // Load beyblade & arena from Firestore
    const beyblade = await loadBeyblade(options.beybladeId);
    const arena = await loadArena(options.arenaId);

    // Initialize physics
    this.physics = new PhysicsEngine(arena);
    this.physics.createBeyblade(beyblade, { x: 400, y: 400 });

    // Game loop (60 FPS)
    this.setSimulationInterval((deltaTime) => {
      this.physics.update(deltaTime);
      this.syncState();
    }, 1000 / 60);
  }

  onMessage(client: Client, type: string, message: any) {
    if (type === "input") {
      this.physics.applyInput(client.sessionId, message);
    }
  }

  private syncState() {
    // Update game state from physics
    const beybladeState = this.physics.getBeybladeState();
    this.state.beyblade.position.x = beybladeState.position.x;
    this.state.beyblade.position.y = beybladeState.position.y;
    // ... sync other properties
  }
}
```

### 2. Create State Schema

**File:** `game-server/src/rooms/schema/GameState.ts`

```typescript
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Vector2D extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
}

export class Beyblade extends Schema {
  @type("string") id: string = "";
  @type("string") name: string = "";
  @type(Vector2D) position = new Vector2D();
  @type(Vector2D) velocity = new Vector2D();
  @type("number") rotation: number = 0;
  @type("number") spin: number = 0;
  @type("number") health: number = 100;
}

export class GameState extends Schema {
  @type({ map: Beyblade }) beyblades = new MapSchema<Beyblade>();
  @type("number") timer: number = 0;
  @type("string") status: string = "waiting"; // waiting, playing, finished
}
```

### 3. Physics Engine Wrapper

**File:** `game-server/src/physics/PhysicsEngine.ts`

```typescript
import Matter from "matter-js";

export class PhysicsEngine {
  private engine: Matter.Engine;
  private bodies: Map<string, Matter.Body> = new Map();

  constructor(arena: any) {
    this.engine = Matter.Engine.create();
    this.setupArena(arena);
  }

  createBeyblade(beyblade: any, position: { x: number; y: number }) {
    const body = Matter.Bodies.circle(position.x, position.y, beyblade.radius, {
      mass: beyblade.mass,
      friction: 0.02,
      restitution: 0.8,
    });

    Matter.World.add(this.engine.world, body);
    this.bodies.set(beyblade.id, body);

    return body;
  }

  applyInput(playerId: string, input: any) {
    const body = this.bodies.get(playerId);
    if (!body) return;

    // Apply force based on input direction
    const force = {
      x: input.direction.x * 0.001,
      y: input.direction.y * 0.001,
    };

    Matter.Body.applyForce(body, body.position, force);
  }

  update(deltaTime: number) {
    Matter.Engine.update(this.engine, deltaTime);
  }

  getBeybladeState(beybladeId: string) {
    const body = this.bodies.get(beybladeId);
    if (!body) return null;

    return {
      position: body.position,
      velocity: body.velocity,
      rotation: body.angle,
    };
  }

  private setupArena(arena: any) {
    // Create stadium boundaries
    const walls = [
      // Top wall
      Matter.Bodies.rectangle(arena.width / 2, 0, arena.width, 20, {
        isStatic: true,
      }),
      // Bottom wall
      Matter.Bodies.rectangle(arena.width / 2, arena.height, arena.width, 20, {
        isStatic: true,
      }),
      // Left wall
      Matter.Bodies.rectangle(0, arena.height / 2, 20, arena.height, {
        isStatic: true,
      }),
      // Right wall
      Matter.Bodies.rectangle(arena.width, arena.height / 2, 20, arena.height, {
        isStatic: true,
      }),
    ];

    Matter.World.add(this.engine.world, walls);
  }
}
```

### 4. Client Connection

**File:** `src/app/game/tryout/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import * as Colyseus from "colyseus.js";

export default function TryoutPage() {
  const [room, setRoom] = useState<Colyseus.Room | null>(null);
  const [gameState, setGameState] = useState<any>(null);

  useEffect(() => {
    const client = new Colyseus.Client("ws://localhost:2567");

    async function joinRoom() {
      const room = await client.joinOrCreate("tryout_room", {
        beybladeId: "dragoon_gt",
        arenaId: "default_arena",
        userId: "player123",
      });

      setRoom(room);

      // Listen to state changes
      room.onStateChange((state) => {
        setGameState(state);
      });
    }

    joinRoom();

    return () => {
      room?.leave();
    };
  }, []);

  // Send input
  const handleInput = (direction: { x: number; y: number }) => {
    room?.send("input", { direction });
  };

  return (
    <div>
      {gameState && (
        <div>
          <p>
            Beyblade Position: {gameState.beyblade.position.x},{" "}
            {gameState.beyblade.position.y}
          </p>
          {/* Render game canvas here */}
        </div>
      )}
    </div>
  );
}
```

---

## 🔧 Configuration

### Environment Variables

Create `game-server/.env`:

```bash
PORT=2567
NODE_ENV=development

# Firebase (for loading Beyblades/Arenas)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### Next.js Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_GAME_SERVER_URL=ws://localhost:2567
# Production: wss://game-server.yourapp.com
```

---

## 🚀 Running the Game

### Terminal 1: Game Server

```bash
cd game-server
npm run dev

# Server starts on http://localhost:2567
# Monitor: http://localhost:2567/colyseus (if installed @colyseus/monitor)
```

### Terminal 2: Next.js Client

```bash
npm run dev

# Client starts on http://localhost:3000
```

### Test Flow

1. Open http://localhost:3000/game/tryout
2. Select Beyblade
3. Select Arena
4. Click "Start Practice"
5. Use WASD to move
6. Watch beyblade move (physics from server)

---

## 📊 Development Workflow

### Day-to-Day Development

```bash
# Start both servers
npm run dev              # Terminal 1 (Next.js)
cd game-server && npm run dev  # Terminal 2 (Colyseus)

# Make changes to game server
# - Edit files in game-server/src/
# - Server auto-reloads

# Make changes to client
# - Edit files in src/app/game/
# - Client auto-reloads
```

### Testing Physics

```typescript
// game-server/src/physics/__tests__/PhysicsEngine.test.ts
import { PhysicsEngine } from "../PhysicsEngine";

describe("PhysicsEngine", () => {
  it("should create beyblade with correct mass", () => {
    const physics = new PhysicsEngine({ width: 800, height: 600 });
    const beyblade = { id: "test", radius: 40, mass: 50 };

    physics.createBeyblade(beyblade, { x: 400, y: 300 });
    const state = physics.getBeybladeState("test");

    expect(state?.position.x).toBe(400);
    expect(state?.position.y).toBe(300);
  });
});
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to game server"

**Solution:**

```bash
# Check if game server is running
cd game-server
npm run dev

# Check port (should be 2567)
# Update NEXT_PUBLIC_GAME_SERVER_URL if different
```

### Issue 2: "State not syncing"

**Solution:**

```typescript
// Check if state schema is correct
// Make sure all properties have @type decorators

export class Beyblade extends Schema {
  @type("number") x: number = 0; // ✅ Correct
  y: number = 0; // ❌ Wrong - missing @type
}
```

### Issue 3: "Physics feels laggy"

**Solution:**

```typescript
// Increase tick rate if server can handle it
this.setSimulationInterval((dt) => {
  // ...
}, 1000 / 120); // 120 FPS instead of 60

// Add client-side interpolation
const lerp = (start, end, t) => start + (end - start) * t;

// In render loop
beyblade.displayX = lerp(beyblade.displayX, state.x, 0.3);
beyblade.displayY = lerp(beyblade.displayY, state.y, 0.3);
```

### Issue 4: "Firebase not loading"

**Solution:**

```typescript
// Make sure Firebase Admin is initialized
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore(app);
```

---

## 📚 Learning Resources

### Colyseus

- **Official Docs:** https://docs.colyseus.io/
- **Examples:** https://github.com/colyseus/colyseus-examples
- **Discord:** https://discord.gg/RY8rRS7

### Matter.js

- **Official Docs:** https://brm.io/matter-js/
- **Demos:** https://brm.io/matter-js/demo/
- **GitHub:** https://github.com/liabru/matter-js

### Game Networking

- **Gaffer on Games:** https://gafferongames.com/
- **Fast-Paced Multiplayer:** http://www.gabrielgambetta.com/client-server-game-architecture.html
- **Valve Networking:** https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking

---

## ✅ Pre-Launch Checklist

Before deploying to production:

- [ ] All 3 game modes working (Tryout, Single Battle, Tournament)
- [ ] Server handles 50+ concurrent rooms
- [ ] Latency < 100ms
- [ ] No memory leaks (run for 24h+)
- [ ] Error handling and logging
- [ ] Rate limiting implemented
- [ ] Anti-cheat measures in place
- [ ] Mobile-responsive UI
- [ ] Cross-browser testing
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Deployment scripts ready
- [ ] Monitoring and alerts configured

---

## 🎯 Next Actions

1. **This Week:**

   - [ ] Review this document with team
   - [ ] Set up Colyseus proof-of-concept
   - [ ] Test physics with 2 Beyblades
   - [ ] Confirm architecture decisions

2. **Next Week:**

   - [ ] Start Phase 1 implementation
   - [ ] Set up CI/CD pipeline
   - [ ] Create development workflow

3. **Month 1:**

   - [ ] Complete Tryout Mode
   - [ ] Complete Single Battle Mode
   - [ ] Internal playtesting

4. **Month 2:**
   - [ ] Beta testing
   - [ ] Performance optimization
   - [ ] Production deployment

---

**Questions?** Check the full implementation plan: [GAME_MODES_IMPLEMENTATION_PLAN.md](./GAME_MODES_IMPLEMENTATION_PLAN.md)

---

**Last Updated:** November 5, 2025  
**Version:** 1.0
