# Game Server - Quick Start Guide

## ✅ What's Done

### New Player Controls (4 Inputs)

- **Move Left** (A/Left Arrow): Dodge left
- **Move Right** (D/Right Arrow): Dodge right
- **Attack** (Space): Quick forward burst (0.5s cooldown)
- **Special Move** (Shift): Type-specific ability (3s cooldown)

### Special Moves by Type

- **Attack**: 2x spin boost
- **Defense**: 1.5s invulnerability
- **Stamina**: +30% stamina recovery
- **Balanced**: 1.5x spin + 15% stamina

### Full Backend Integration

- ✅ Loads `BeybladeStats` from Firestore (all properties)
- ✅ Loads `ArenaConfig` from Firestore (all features)
- ✅ Calculates max stamina from type distribution
- ✅ Type-specific mechanics

## 🚀 How to Run

```powershell
# 1. Navigate to game server
cd game-server

# 2. Install dependencies (first time only)
npm install

# 3. Set up environment variables
# Create .env file with Firebase credentials

# 4. Start server
npm run dev
```

Server runs on: `ws://localhost:2567`

## 🧪 How to Test

### Option 1: HTML Test Client

1. Start the server
2. Open `game-server/test-client.html` in browser
3. Click "Connect"
4. Use keyboard controls (A/D/Space/Shift)

### Option 2: From Your Frontend

```typescript
import { Client } from "colyseus.js";

const client = new Client("ws://localhost:2567");

const room = await client.joinOrCreate("tryout", {
  userId: "user123",
  username: "Player1",
  beybladeId: "beyblade_abc", // From your database
  arenaId: "arena_xyz", // From your database
});

// Send new controls
room.send("input", {
  moveLeft: true,
  moveRight: false,
  attack: false,
  specialMove: false,
});

// Listen to state
room.state.beyblades.onAdd((beyblade) => {
  beyblade.onChange(() => {
    console.log("Position:", beyblade.x, beyblade.y);
    console.log("Stamina:", beyblade.stamina, "/", beyblade.maxStamina);
    console.log("Type:", beyblade.type);
  });
});
```

## 📡 Client Input Schema

```typescript
interface PlayerInput {
  moveLeft?: boolean; // Strafe left
  moveRight?: boolean; // Strafe right
  attack?: boolean; // Forward burst
  specialMove?: boolean; // Type ability
}

// Send to server
room.send("input", input);
```

## 📊 Game State Schema

```typescript
// Beyblade properties (synced from server)
{
  // Identity
  id: string;
  username: string;
  beybladeId: string;
  type: string; // "attack" | "defense" | "stamina" | "balanced"
  spinDirection: string; // "left" | "right"

  // Transform
  x: number;
  y: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  angularVelocity: number;

  // Stats
  health: number; // 0-100
  stamina: number; // Current stamina
  maxStamina: number; // Calculated from type distribution
  mass: number;
  radius: number;

  // States
  isActive: boolean;
  isRingOut: boolean;
  isInvulnerable: boolean;
  invulnerabilityTimer: number;

  // Cooldowns
  attackCooldown: number;
  specialCooldown: number;
}
```

## 🎮 Next Steps to Build Full Game

1. **Add Collision Detection**

   - Implement in `PhysicsEngine.ts`
   - Use Point of Contact multipliers
   - Calculate damage from type distribution

2. **Implement Arena Features**

   - Loops (speed boost zones)
   - Water bodies (slow + drain)
   - Obstacles (collision damage)
   - Pits (traps)

3. **Create Battle Room (PvP/PvE)**

   - Copy `TryoutRoom.ts` → `BattleRoom.ts`
   - Add opponent (AI or player 2)
   - Implement win conditions
   - Save match results

4. **Build Game UI**
   - Canvas/WebGL for rendering
   - HUD for stats
   - Connect to Colyseus client
   - Map controls to buttons/gamepad

## 📁 File Structure

```
game-server/
├── src/
│   ├── index.ts                   # Server entry
│   ├── types/
│   │   └── shared.ts              # Full backend types
│   ├── rooms/
│   │   ├── TryoutRoom.ts          # ✅ Complete
│   │   ├── BattleRoom.ts          # ❌ TODO
│   │   └── schema/
│   │       └── GameState.ts       # ✅ Complete
│   ├── physics/
│   │   └── PhysicsEngine.ts       # ⚠️ Needs collision detection
│   └── utils/
│       └── firebase.ts            # ✅ Complete
├── test-client.html               # ✅ Complete
├── IMPLEMENTATION_SUMMARY.md      # Full status
├── GAME_SERVER_COMPLETE.md        # Detailed docs
└── README.md                      # Setup guide
```

## 🔧 Environment Variables

Create `.env` in `game-server/`:

```env
PORT=2567
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 🐛 Troubleshooting

### Server won't start

- Check Node.js version (16+)
- Run `npm install`
- Check port 2567 is free

### Can't connect from client

- Verify server is running
- Check firewall settings
- Use `ws://localhost:2567` (not wss://)

### Beyblade not loading

- Check beyblade ID exists in Firestore `beyblade_stats` collection
- Server will use defaults if not found
- Check Firebase credentials in `.env`

### No physics movement

- Check `PhysicsEngine` initialization
- Verify arena shape/size is valid
- Check console for errors

## 📚 Resources

- [Colyseus Docs](https://docs.colyseus.io/)
- [Matter.js Docs](https://brm.io/matter-js/)
- [Your Backend Types](../src/types/)

---

**Ready to Test!** 🎉

Start server → Open test client → Connect → Use A/D/Space/Shift controls!
