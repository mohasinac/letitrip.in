# 🎮 Game & Server Documentation

**Project:** HobbiesSpot.com - Beyblade Battle Game  
**Last Updated:** November 1, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Server Architecture](#server-architecture)
3. [Game Client Architecture](#game-client-architecture)
4. [Physics Engine](#physics-engine)
5. [Multiplayer Protocol](#multiplayer-protocol)
6. [Deployment](#deployment)

---

## Overview

### Game Description

The Beyblade Battle Game is a physics-based multiplayer game where players control spinning tops (Beyblades) in arena battles. Players can:

- Launch Beyblades with customizable strength and angle
- Battle in single-player or multiplayer mode (up to 2 players per room)
- Use special abilities (Rush, Shield, Power Up)
- Compete in real-time with server-authoritative physics

### Technology Stack

**Client:**

- Next.js 15+ (App Router)
- TypeScript
- React (Game components)
- Socket.io Client

**Server:**

- Node.js standalone server
- Socket.io Server
- Physics engine (custom implementation)
- Deployed on Render.com

---

## Server Architecture

### Server File: `server.js`

**Location:** `d:\proj\justforview.in\server.js`  
**Runtime:** Node.js (no Next.js dependency)  
**Port:** 3001 (configurable via PORT env var)

### Core Features

#### 1. Room Management

```javascript
// Maximum limits
const MAX_ROOMS = 10;
const MAX_PLAYERS_PER_ROOM = 2;
const MAX_TOTAL_PLAYERS = 20;

// Room structure
{
  roomId: string,
  players: [{
    id: string,
    username: string,
    beybladeId: string,
    position: { x, y },
    velocity: { x, y },
    rotation: number,
    angularVelocity: number,
    health: number,
    stamina: number,
    isActive: boolean
  }],
  beyblades: Map<playerId, beybladeData>,
  startTime: number,
  lastUpdate: number
}
```

#### 2. Connection Handling

```javascript
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("createRoom", handleCreateRoom);
  socket.on("joinRoom", handleJoinRoom);
  socket.on("launch", handleLaunch);
  socket.on("move", handleMove);
  socket.on("activateSpecial", handleSpecial);
  socket.on("leaveRoom", handleLeaveRoom);
  socket.on("disconnect", handleDisconnect);
});
```

#### 3. Physics Loop

**Update Frequency:** 60 Hz (16.67ms per tick)

```javascript
function startGameLoop(roomId) {
  const interval = setInterval(() => {
    updatePhysics(roomId);
    checkCollisions(roomId);
    broadcastState(roomId);

    if (isGameOver(roomId)) {
      endGame(roomId);
      clearInterval(interval);
    }
  }, 1000 / 60);
}
```

#### 4. Health Check Endpoint

```javascript
// GET http://server-url/health
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    rooms: rooms.size,
    players: Array.from(rooms.values()).reduce(
      (sum, room) => sum + room.players.length,
      0
    ),
  });
});
```

---

## Game Client Architecture

### Client Files

**Main Game Page:**

- `src/app/game/page.tsx` - Single player
- `src/app/game/multiplayer/page.tsx` - Multiplayer lobby

**Game Components:**

- `src/app/game/components/BattleArena.tsx` - Main arena
- `src/app/game/components/BeybladeDisplay.tsx` - Beyblade rendering
- `src/app/game/components/GameControls.tsx` - Desktop controls
- `src/app/game/components/VirtualDPad.tsx` - Mobile controls
- `src/app/game/components/GameHUD.tsx` - UI overlay
- `src/app/game/components/MultiplayerLobby.tsx` - Room management
- `src/app/game/components/MultiplayerBeybladeSelect.tsx` - Selection

**Game Context:**

- `src/contexts/GameContext.tsx` - Game state management

### Game State Structure

```typescript
interface GameState {
  isActive: boolean;
  player: {
    beyblade: BeybladeData;
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    rotation: number;
    angularVelocity: number;
    health: number;
    stamina: number;
    specialAbilityCharge: number;
  };
  opponent?: PlayerState;
  arena: {
    width: number;
    height: number;
    friction: number;
  };
}
```

### Socket.io Client Integration

```typescript
// src/app/game/multiplayer/page.tsx
import { io, Socket } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

// Event handlers
socket.on("roomCreated", handleRoomCreated);
socket.on("playerJoined", handlePlayerJoined);
socket.on("gameStart", handleGameStart);
socket.on("gameState", handleGameState);
socket.on("collision", handleCollision);
socket.on("gameOver", handleGameOver);
```

---

## Physics Engine

### Server-Authoritative Physics

**Why Server-Authoritative?**

- Prevents cheating
- Ensures consistent game state
- Handles collision detection centrally

### Physics Calculations

#### 1. Basic Movement

```javascript
// Update position based on velocity
player.position.x += player.velocity.x * deltaTime;
player.position.y += player.velocity.y * deltaTime;

// Update rotation based on angular velocity
player.rotation += player.angularVelocity * deltaTime;

// Apply friction
const frictionFactor = 1 - ARENA_FRICTION * deltaTime;
player.velocity.x *= frictionFactor;
player.velocity.y *= frictionFactor;
player.angularVelocity *= frictionFactor;
```

#### 2. Collision Detection

```javascript
function checkCollision(player1, player2) {
  const dx = player2.position.x - player1.position.x;
  const dy = player2.position.y - player1.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const minDistance = BEYBLADE_RADIUS * 2;

  if (distance < minDistance) {
    return {
      collided: true,
      normal: { x: dx / distance, y: dy / distance },
      penetration: minDistance - distance,
    };
  }

  return { collided: false };
}
```

#### 3. Collision Response

**Using Moment of Inertia & Angular Momentum:**

```javascript
function resolveCollision(player1, player2, collision) {
  // 1. Calculate moment of inertia
  const I1 = 0.5 * player1.mass * Math.pow(BEYBLADE_RADIUS, 2);
  const I2 = 0.5 * player2.mass * Math.pow(BEYBLADE_RADIUS, 2);

  // 2. Calculate angular momentum
  const L1 = I1 * player1.angularVelocity;
  const L2 = I2 * player2.angularVelocity;

  // 3. Calculate kinetic energies
  const KE1 = 0.5 * I1 * Math.pow(player1.angularVelocity, 2);
  const KE2 = 0.5 * I2 * Math.pow(player2.angularVelocity, 2);

  // 4. Transfer energy based on attack/defense types
  const damageToPlayer2 = calculateDamage(KE1, player1.attack, player2.defense);
  const damageToPlayer1 = calculateDamage(KE2, player2.attack, player1.defense);

  // 5. Apply damage
  player1.health -= damageToPlayer1;
  player2.health -= damageToPlayer2;

  // 6. Spin stealing (optional)
  if (player1.angularVelocity > player2.angularVelocity) {
    const spinSteal = (L1 - L2) * 0.1; // 10% transfer
    player1.angularVelocity -= spinSteal / I1;
    player2.angularVelocity += spinSteal / I2;
  }

  // 7. Separate beyblades
  const separationVector = {
    x: collision.normal.x * collision.penetration,
    y: collision.normal.y * collision.penetration,
  };
  player1.position.x -= separationVector.x / 2;
  player1.position.y -= separationVector.y / 2;
  player2.position.x += separationVector.x / 2;
  player2.position.y += separationVector.y / 2;
}
```

#### 4. Damage Calculation

```javascript
function calculateDamage(kineticEnergy, attackPower, defensePower) {
  const baseDamage = kineticEnergy * 0.01; // Scale factor
  const attackMultiplier = 1 + attackPower / 100;
  const defenseMultiplier = 1 - defensePower / 100;

  return baseDamage * attackMultiplier * defenseMultiplier;
}
```

#### 5. Arena Boundaries

```javascript
function applyBoundaries(player) {
  const minX = BEYBLADE_RADIUS;
  const maxX = ARENA_WIDTH - BEYBLADE_RADIUS;
  const minY = BEYBLADE_RADIUS;
  const maxY = ARENA_HEIGHT - BEYBLADE_RADIUS;

  // Bounce off walls
  if (player.position.x < minX || player.position.x > maxX) {
    player.velocity.x *= -0.8; // Energy loss
    player.position.x = Math.max(minX, Math.min(maxX, player.position.x));
  }

  if (player.position.y < minY || player.position.y > maxY) {
    player.velocity.y *= -0.8;
    player.position.y = Math.max(minY, Math.min(maxY, player.position.y));
  }
}
```

---

## Multiplayer Protocol

### Client → Server Events

#### 1. Create Room

```typescript
socket.emit("createRoom", {
  username: string,
  beybladeId: string,
});

// Response:
socket.on("roomCreated", (data: { roomId: string; playerId: string }) => {
  /* ... */
});
```

#### 2. Join Room

```typescript
socket.emit("joinRoom", {
  roomId: string,
  username: string,
  beybladeId: string,
});

// Response:
socket.on(
  "playerJoined",
  (data: { playerId: string; players: PlayerData[] }) => {
    /* ... */
  }
);

socket.on("gameStart", () => {
  /* ... */
});
```

#### 3. Launch Beyblade

```typescript
socket.emit("launch", {
  roomId: string,
  strength: number, // 0.5 - 1.0
  angle: number, // 0 - 360 degrees
});

// No direct response, state updated in gameState event
```

#### 4. Move Beyblade

```typescript
socket.emit("move", {
  roomId: string,
  direction: { x: number, y: number }, // Normalized vector
});

// No direct response, state updated in gameState event
```

#### 5. Activate Special Ability

```typescript
socket.emit("activateSpecial", {
  roomId: string,
  abilityType: "rush" | "shield" | "powerup",
});

// Response:
socket.on(
  "specialActivated",
  (data: { playerId: string; abilityType: string; duration: number }) => {
    /* ... */
  }
);
```

#### 6. Leave Room

```typescript
socket.emit("leaveRoom", {
  roomId: string,
});

// Response:
socket.on("playerLeft", (data: { playerId: string }) => {
  /* ... */
});
```

### Server → Client Events

#### 1. Game State Update (60 Hz)

```typescript
socket.on(
  "gameState",
  (state: {
    players: {
      [playerId: string]: {
        position: { x: number; y: number };
        velocity: { x: number; y: number };
        rotation: number;
        angularVelocity: number;
        health: number;
        stamina: number;
        isActive: boolean;
      };
    };
    timestamp: number;
  }) => {
    /* Update client rendering */
  }
);
```

#### 2. Collision Event

```typescript
socket.on(
  "collision",
  (data: {
    player1Id: string;
    player2Id: string;
    damageToPlayer1: number;
    damageToPlayer2: number;
    position: { x: number; y: number };
  }) => {
    /* Show collision effect */
  }
);
```

#### 3. Game Over

```typescript
socket.on(
  "gameOver",
  (data: { winnerId: string; loserId: string; duration: number }) => {
    /* Show results screen */
  }
);
```

#### 4. Error Events

```typescript
socket.on("error", (error: { message: string; code: string }) => {
  /* Handle error */
});

socket.on("roomFull", () => {
  /* Show error */
});
socket.on("roomNotFound", () => {
  /* Show error */
});
```

---

## Deployment

### Server Deployment (Render.com)

**File:** `server.js`  
**Environment:** Node.js  
**Port:** 3001

**Environment Variables:**

```bash
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://justforview.in,https://www.justforview.in
```

**Start Command:**

```bash
node server.js
```

**Health Check:**

```
GET /health
```

**Scaling:**

- Currently: Single instance
- Future: Redis for multi-instance state sync

### Client Deployment (Vercel)

**Environment Variables:**

```bash
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.onrender.com
```

**Build Command:**

```bash
npm run build
```

**Notes:**

- Socket.io client bundled with Next.js
- WebSocket connections from browser to Render.com server
- No server-side Socket.io in Next.js (client-only)

### CORS Configuration

**Server (`server.js`):**

```javascript
const io = require("socket.io")(server, {
  cors: {
    origin: [
      "https://justforview.in",
      "https://www.justforview.in",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
```

---

## Game Constants & Configuration

### Physics Constants

```javascript
// server.js
const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 600;
const BEYBLADE_RADIUS = 20;
const ARENA_FRICTION = 0.02; // 2% per second
const COLLISION_ELASTICITY = 0.8; // 80% energy retained
const MIN_SPIN_SPEED = 0.1; // Below this = stopped
```

### Game Constants

```javascript
const INITIAL_HEALTH = 100;
const INITIAL_STAMINA = 100;
const STAMINA_DRAIN_RATE = 1; // per second
const SPECIAL_ABILITY_COST = 30; // stamina points
const SPECIAL_ABILITY_COOLDOWN = 5000; // ms
```

### Launch Parameters

```javascript
const MIN_LAUNCH_STRENGTH = 0.5;
const MAX_LAUNCH_STRENGTH = 1.0;
const LAUNCH_VELOCITY_MULTIPLIER = 500; // pixels per second
const INITIAL_ANGULAR_VELOCITY = 10; // radians per second
```

---

## Special Abilities

### 1. Rush Attack

**Effect:** Boost speed and attack for 3 seconds

```typescript
{
  type: 'rush',
  duration: 3000,
  effects: {
    speedMultiplier: 1.5,
    attackMultiplier: 1.3
  }
}
```

### 2. Shield

**Effect:** Reduce incoming damage for 5 seconds

```typescript
{
  type: 'shield',
  duration: 5000,
  effects: {
    defenseMultiplier: 2.0,
    damageReduction: 0.5
  }
}
```

### 3. Power Up

**Effect:** Increase spin speed and stamina regeneration

```typescript
{
  type: 'powerup',
  duration: 4000,
  effects: {
    spinBoost: 5.0,
    staminaRegenRate: 10 // per second
  }
}
```

---

## Performance Optimization

### Server Optimization

1. **Object Pooling:** Reuse collision objects
2. **Spatial Hashing:** Only check nearby beyblades (future)
3. **Delta Compression:** Send only changed state (future)
4. **Rate Limiting:** Max 60 inputs/sec per client

### Client Optimization

1. **Interpolation:** Smooth movement between server updates
2. **Prediction:** Client-side prediction for local player
3. **Canvas Rendering:** Hardware-accelerated 2D canvas
4. **Asset Preloading:** Load beyblade sprites on init

---

## Debugging & Monitoring

### Server Logs

```javascript
console.log("[ROOM]", roomId, "created by", playerId);
console.log("[COLLISION]", player1.id, "vs", player2.id, "damage:", damage);
console.log("[GAME_OVER]", roomId, "winner:", winnerId);
```

### Client Debug Mode

```typescript
// Enable in development
if (process.env.NODE_ENV === "development") {
  window.gameDebug = {
    showCollisionBoxes: true,
    showVelocityVectors: true,
    logStateUpdates: true,
  };
}
```

### Health Check

```bash
curl https://your-socket-server.onrender.com/health
```

**Response:**

```json
{
  "status": "ok",
  "rooms": 3,
  "players": 5
}
```

---

## Future Enhancements

### Planned Features

1. **Tournament Mode** - Bracket-style competitions
2. **Ranked Matchmaking** - ELO-based ranking
3. **Custom Beyblades** - User-created designs
4. **Replay System** - Save and watch battles
5. **Spectator Mode** - Watch live battles
6. **Mobile App** - Native iOS/Android
7. **AI Opponents** - Single-player with difficulty levels

### Technical Improvements

1. **Redis Integration** - Multi-instance state sync
2. **WebRTC** - Peer-to-peer for reduced latency
3. **Spatial Audio** - Directional collision sounds
4. **Advanced Physics** - Gyroscopic precession
5. **Anti-Cheat** - Server-side validation
6. **Analytics** - Game telemetry and stats

---

## Troubleshooting

### Common Issues

#### Server Not Responding

**Symptoms:** Client can't connect  
**Solutions:**

1. Check server health endpoint
2. Verify CORS configuration
3. Check Render.com logs
4. Ensure WebSocket port is open

#### Desync Issues

**Symptoms:** Client state doesn't match server  
**Solutions:**

1. Increase update rate if bandwidth allows
2. Implement client-side interpolation
3. Add timestamp validation
4. Force full state sync periodically

#### High Latency

**Symptoms:** Laggy gameplay  
**Solutions:**

1. Use WebSocket transport (not polling)
2. Enable compression
3. Reduce update frequency
4. Implement lag compensation

---

## Quick Reference

### Start Game Server (Development)

```bash
node server.js
```

### Start Game Server (Production)

```bash
PORT=3001 NODE_ENV=production node server.js
```

### Connect Client

```typescript
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
```

### File Locations

- **Server:** `server.js`
- **Client Pages:** `src/app/game/`
- **Components:** `src/app/game/components/`
- **Context:** `src/contexts/GameContext.tsx`

---

_Last Updated: November 1, 2025_  
_For API routes, see [API_ROUTES_REFERENCE.md](./API_ROUTES_REFERENCE.md)_  
_For deployment, see deployment scripts in project root_
