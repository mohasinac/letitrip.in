# Game Server - Complete Implementation

## Overview

The game server is built with **Colyseus** for real-time multiplayer and **Matter.js** for physics simulation. It fully integrates with your backend's `BeybladeStats` and `ArenaConfig` interfaces.

## Architecture

```
game-server/
├── src/
│   ├── index.ts              # Server entry point
│   ├── types/
│   │   └── shared.ts         # Shared types (mirrors backend)
│   ├── rooms/
│   │   ├── TryoutRoom.ts     # Solo practice mode
│   │   ├── BattleRoom.ts     # PvP/PvE battles (TODO)
│   │   └── schema/
│   │       └── GameState.ts  # Colyseus state schema
│   ├── physics/
│   │   └── PhysicsEngine.ts  # Matter.js wrapper
│   └── utils/
│       └── firebase.ts       # Firebase Admin SDK
```

## New Player Controls

### Input Schema

Players now have **4 control inputs**:

```typescript
interface PlayerInput {
  moveLeft?: boolean; // Dodge/strafe left
  moveRight?: boolean; // Dodge/strafe right
  attack?: boolean; // Quick forward burst attack
  specialMove?: boolean; // Type-specific special ability
}
```

### Control Behaviors

1. **Move Left** - Strafe left perpendicular to current direction (1.5x force)
2. **Move Right** - Strafe right perpendicular to current direction (1.5x force)
3. **Attack** - Quick forward burst (3x force, 0.5s cooldown)
4. **Special Move** - Type-specific ability (3s cooldown)

### Special Moves by Type

| Type         | Special Move             | Effect                          |
| ------------ | ------------------------ | ------------------------------- |
| **Attack**   | Spin Boost + Damage Aura | 2x spin speed, increased damage |
| **Defense**  | Shield                   | 1.5s invulnerability            |
| **Stamina**  | Recovery                 | Restore 30% max stamina         |
| **Balanced** | All-Stats Boost          | 1.5x spin + 15% stamina         |

## Beyblade Stats Integration

### Full BeybladeStats Support

The server now loads and uses all beyblade properties:

```typescript
interface BeybladeStats {
  // Basic
  id: string;
  displayName: string;
  type: "attack" | "defense" | "stamina" | "balanced";
  spinDirection: "left" | "right";

  // Physical
  mass: number; // grams (10-2000g)
  radius: number; // cm (3-50cm)

  // Type Distribution (360 points total, max 150 each)
  typeDistribution: {
    attack: number; // 0-150
    defense: number; // 0-150
    stamina: number; // 0-150
    total: 360;
  };

  // Points of Contact (collision damage zones)
  pointsOfContact: Array<{
    angle: number;
    damageMultiplier: number;
    width: number;
  }>;
}
```

### Calculated Stats

The server calculates combat stats from type distribution:

**Attack Stats** (0-150 points):

- Damage: 100-250 (base × (1 + points × 0.01))
- Speed: 10-25 units/sec
- Rotation: 10-25 spins/sec

**Defense Stats** (0-150 points):

- Damage Taken: 100%-50% (1.0 - points × 0.00333)
- Knockback: 10-7.5 units
- Invulnerability: 10%-20% chance

**Stamina Stats** (0-150 points):

- Max Stamina: 1000-3000 HP (1000 × (1 + points × 0.01333))
- Spin Steal: 10%-50%
- Decay Rate: 10-7.5 per sec

## Arena Configuration Integration

### Full ArenaConfig Support

```typescript
interface ArenaConfig {
  // Geometry
  width: number; // em units (50em default)
  height: number;
  shape: ArenaShape; // circle, rectangle, pentagon, hexagon, octagon, etc.
  theme: ArenaTheme; // forest, futuristic, sea, etc.

  // Loops (speed boost paths/lines)
  loops: LoopConfig[];

  // Walls & Exits
  wall: WallConfig;
  exits: ExitConfig[];

  // Hazards
  obstacles: ObstacleConfig[];
  waterBody?: WaterBodyConfig;
  pits: PitConfig[];
  laserGuns: LaserGunConfig[];
  rotationBodies?: RotationBodyConfig[];

  // Goals
  goalObjects: GoalObjectConfig[];
  requireAllGoalsDestroyed: boolean;

  // Physics
  gravity?: number;
  airResistance?: number;
  surfaceFriction?: number;
}
```

### Arena Features

| Feature             | Description                          | Status          |
| ------------------- | ------------------------------------ | --------------- |
| **Loops**           | Speed boost paths with charge points | ✅ Schema Ready |
| **Walls**           | Damage + recoil, spikes, springs     | ✅ Schema Ready |
| **Exits**           | Ring-out zones                       | ✅ Implemented  |
| **Obstacles**       | Rocks, pillars, barriers             | ✅ Schema Ready |
| **Water Bodies**    | Slow movement, drain spin            | ✅ Schema Ready |
| **Pits**            | Trap zones with escape chance        | ✅ Schema Ready |
| **Laser Guns**      | Automated turrets                    | ✅ Schema Ready |
| **Rotation Bodies** | Force fields                         | ✅ Schema Ready |
| **Portals**         | Teleportation (max 2)                | ✅ Schema Ready |
| **Goal Objects**    | Collectibles/objectives              | ✅ Schema Ready |

## Game State Schema

### Beyblade Entity

```typescript
class Beyblade extends Schema {
  // Identity
  id: string;
  userId: string;
  username: string;
  beybladeId: string;
  isAI: boolean;

  // Transform
  x: number;
  y: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  angularVelocity: number;

  // Stats
  type: string; // attack, defense, stamina, balanced
  spinDirection: string; // left, right
  mass: number;
  radius: number;
  health: number;
  stamina: number;
  maxStamina: number;

  // Combat
  damageDealt: number;
  damageReceived: number;
  collisions: number;

  // States
  isActive: boolean;
  isRingOut: boolean;
  isInvulnerable: boolean;
  invulnerabilityTimer: number;
  inLoop: boolean;
  loopIndex: number;
  loopEntryTime: number;
  inWater: boolean;
  inPit: boolean;
  currentPitId: string;

  // Cooldowns
  specialCooldown: number;
  attackCooldown: number;
}
```

## Client Connection

### Join a Tryout Room

```typescript
const client = new Colyseus.Client("ws://localhost:2567");

const room = await client.joinOrCreate("tryout", {
  userId: "user123",
  username: "Player1",
  beybladeId: "beyblade_abc123",
  arenaId: "arena_xyz789",
});

// Listen to state changes
room.onStateChange((state) => {
  console.log("Game state:", state);
});

// Send player input
room.send("input", {
  moveLeft: true,
  attack: false,
  specialMove: false,
});

// Handle events
room.onMessage("ring-out", (data) => {
  console.log("Ring out:", data.playerId);
});

room.onMessage("special-move", (data) => {
  console.log("Special move:", data.type);
});
```

## Next Steps

### TODO: Features to Implement

- [ ] **Collision Detection**

  - Beyblade vs Beyblade
  - Point of Contact damage multipliers
  - Spin steal mechanics
  - Type distribution damage calculations

- [ ] **Arena Features**

  - Loop mechanics (speed boost, charge points)
  - Water body effects (slow + drain)
  - Obstacle collisions
  - Pit traps
  - Laser gun targeting
  - Rotation body forces
  - Wall damage + recoil

- [ ] **Game Modes**

  - Battle Room (PvP)
  - AI Opponent Room
  - Tournament Mode

- [ ] **Match System**

  - Win conditions
  - Match results
  - Leaderboards
  - Save match data to Firestore

- [ ] **Advanced Physics**
  - Spin direction collision effects
  - Mass-based collision forces
  - Arena surface friction
  - Air resistance

## Testing

### Start Server

```bash
cd game-server
npm install
npm run dev
```

### Test Client

Open `game-server/test-client.html` in a browser to connect and test controls.

### Environment Variables

Create `.env` in `game-server/`:

```env
PORT=2567
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Performance

- **Tick Rate**: 60 FPS (16.67ms per frame)
- **Max Clients per Room**: 1 (Tryout), 2-4 (Battle)
- **State Sync**: Automatic via Colyseus

## Documentation

- [Colyseus Docs](https://docs.colyseus.io/)
- [Matter.js Docs](https://brm.io/matter-js/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
