# 🎮 Frontend Quick Reference Card

**Status:** ✅ Core infrastructure complete | ⏳ Feature completion needed

---

## 🚀 Quick Start (30 seconds)

```bash
# Terminal 1: Game server
cd game-server && npm run dev

# Terminal 2: Next.js
npm run dev

# Browser: http://localhost:3000/game/tryout
```

---

## 📦 What's Ready to Use

### 1. Connect to Game Server

```typescript
import {
  useColyseusGame,
  useGameInput,
} from "@/lib/game/hooks/useColyseusGame";

function GameComponent() {
  const { isConnected, myBeyblade, beyblades, arena, sendInput, sendAction } =
    useColyseusGame({
      serverUrl: "ws://localhost:2567",
      roomType: "tryout",
    });

  useGameInput(sendInput, sendAction, isConnected);

  return <div>Connected: {isConnected ? "Yes" : "No"}</div>;
}
```

### 2. Render on Canvas

```typescript
import {
  renderArenaBackground,
  renderArenaFloor,
  renderLoops,
  renderObstacles,
} from "@/lib/game/rendering/arenaRenderer";

import { drawBeybladeComplete } from "@/lib/game/rendering/beybladeRenderer";

// In render loop
ctx.clearRect(0, 0, canvas.width, canvas.height);

renderArenaBackground(ctx, arenaConfig, stadium);
renderArenaFloor(ctx, arenaConfig, stadium);
renderLoops(ctx, arenaConfig, stadium);
renderObstacles(ctx, arenaConfig, stadium);

beyblades.forEach((bey) => {
  drawBeybladeComplete(ctx, bey, beybladeStats, {
    showShadow: true,
    showTrail: true,
    showGlow: false,
  });
});
```

### 3. Handle Input

Already handled by `useGameInput` hook:

- **WASD / Arrows** - Movement
- **Space** - Charge boost
- **Shift** - Dash
- **E** - Special move

---

## 📁 File Locations

```
src/
├── lib/game/
│   ├── client/ColyseusClient.ts       # 234 lines ✅
│   ├── hooks/useColyseusGame.ts       # 246 lines ✅
│   └── rendering/
│       ├── arenaRenderer.ts           # ~400 lines 🟡
│       └── beybladeRenderer.ts        # ~300 lines 🟡
│
├── components/game/
│   └── TryoutModeGame.tsx             # 284 lines ✅
│
└── types/
    ├── arenaConfig.ts                 # Schema
    └── beybladeStats.ts               # Schema
```

---

## ✅ What Works

- ✅ Connection to game server
- ✅ Real-time state sync (60Hz)
- ✅ Keyboard input
- ✅ Basic arena rendering
- ✅ Basic beyblade rendering
- ✅ HUD with health/stamina
- ✅ Loop paths (as lines)
- ✅ Charge points
- ✅ Walls and exits
- ✅ Obstacles

---

## ⏳ What's Missing

**High Priority:**

- ⏳ Water bodies
- ⏳ Pits (depth effect)
- ⏳ Laser guns
- ⏳ Goal objects
- ⏳ Rotation bodies
- ⏳ Portals
- ⏳ Contact point visualization
- ⏳ Beyblade/arena selection UI

**Implementation:** See `docs/game/FRONTEND_INTEGRATION_GUIDE.md`

---

## 🔧 Environment Setup

**File:** `.env.local`

```bash
NEXT_PUBLIC_GAME_SERVER_URL=ws://localhost:2567
```

---

## 🐛 Common Issues

### "Cannot connect to server"

```bash
# Check game server is running
cd game-server && npm run dev
```

### "State not updating"

```typescript
// Make sure you're using the hooks correctly
const { isConnected, gameState } = useColyseusGame({
  serverUrl: process.env.NEXT_PUBLIC_GAME_SERVER_URL,
  roomType: "tryout",
  autoConnect: true, // Enable auto-connect
});
```

### "Canvas not rendering"

```typescript
// Check canvas ref is attached
const canvasRef = useRef<HTMLCanvasElement>(null);

useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return; // Important check

  const ctx = canvas.getContext("2d");
  // ... render
}, []);

return <canvas ref={canvasRef} width={800} height={600} />;
```

---

## 📚 Documentation

1. **FRONTEND_INTEGRATION_GUIDE.md** - Complete guide (400+ lines)
2. **FRONTEND_IMPLEMENTATION_SUMMARY.md** - This implementation summary
3. **IMPLEMENTATION_STATUS.md** - Project status
4. **TryoutModeGame.tsx** - Working example (284 lines)

---

## 🎯 Next Actions

1. **Add route:** `src/app/game/tryout/page.tsx`
2. **Test:** http://localhost:3000/game/tryout
3. **Implement missing features** from guide
4. **Build selection UI** for beyblades/arenas

---

## 💡 Code Snippets

### Create a Game Route

```typescript
// src/app/game/tryout/page.tsx
"use client";

import TryoutModeGame from "@/components/game/TryoutModeGame";

export default function TryoutPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <TryoutModeGame />
    </div>
  );
}
```

### Manual Client Usage

```typescript
import { ColyseusGameClient } from "@/lib/game/client/ColyseusClient";

const client = new ColyseusGameClient("ws://localhost:2567");

await client.connectTryout({
  userId: "user123",
  username: "Player1",
  beybladeId: "dragoon-gt",
  arenaId: "standard_arena",
});

client.setCallbacks({
  onBeybladeChanged: (bey, key) => console.log("Updated:", key),
});

client.sendInput({ x: 1, y: 0 }); // Move right
client.sendAction("charge"); // Boost
```

### Add Missing Arena Features

```typescript
// See FRONTEND_INTEGRATION_GUIDE.md for full implementations

// Water bodies
function renderWaterBody(ctx, waterConfig, loops) {
  // ... implementation in guide
}

// Pits
function renderPits(ctx, pits) {
  // ... implementation in guide
}

// Laser guns
function renderLaserGuns(ctx, laserGuns) {
  // ... implementation in guide
}

// etc.
```

---

## 🎮 Controls Reference

| Key   | Action       |
| ----- | ------------ |
| W / ↑ | Move up      |
| S / ↓ | Move down    |
| A / ← | Move left    |
| D / → | Move right   |
| Space | Charge boost |
| Shift | Dash         |
| E     | Special move |

---

## 🔗 Important Links

- **Game Server Monitor:** http://localhost:2567/colyseus
- **Health Check:** http://localhost:2567/health
- **Main App:** http://localhost:3000
- **Tryout Mode:** http://localhost:3000/game/tryout

---

## 📊 Progress

| Component         | Status | Completion |
| ----------------- | ------ | ---------- |
| Client Manager    | ✅     | 100%       |
| React Hooks       | ✅     | 100%       |
| Example Component | ✅     | 100%       |
| Basic Rendering   | ✅     | 100%       |
| Advanced Arena    | 🟡     | 60%        |
| Beyblade Details  | 🟡     | 80%        |
| UI Components     | ⏳     | 0%         |

**Overall:** ~75% complete

---

## 🆘 Need Help?

1. Read the integration guide
2. Check the example component
3. Review type definitions
4. Test with game server monitor
5. Check browser console for errors

---

**Last Updated:** November 2025  
**Core Status:** ✅ Ready to build on  
**Next Milestone:** Complete advanced features + UI

---

## 🎉 You're Ready!

The foundation is solid. Now you can:

1. ✅ Connect to game server
2. ✅ Render basic game
3. ✅ Handle input
4. ⏳ Add missing features
5. ⏳ Build selection UI
6. ⏳ Polish and deploy

**Good luck! 🚀**
