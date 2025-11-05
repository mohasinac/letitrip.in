# 🎮 Frontend Game Client - Complete Guide

## Overview

The frontend now connects to the Colyseus game server for **server-authoritative physics**. This guide covers integration with dynamic arena features and beyblade stats.

---

## 🏗️ Architecture

```
Frontend (React/Next.js)
├── Colyseus Client         → Connects to game server
├── Game Hooks              → React state management
├── Rendering Engine        → Canvas visualization
└── Input Handler           → Keyboard/gamepad input

Game Server (Colyseus)
├── Physics (Matter.js)     → Server-authoritative
├── Rooms (TryoutRoom, etc) → Game modes
├── State Schema            → Synchronized state
└── Firebase Integration    → Load data
```

---

## 📦 Installation

The Colyseus client is already installed. To verify:

```bash
npm list colyseus.js
```

---

## 🎯 Quick Start

### 1. Basic Usage with Hook

```typescript
import {
  useColyseusGame,
  useGameInput,
} from "@/lib/game/hooks/useColyseusGame";

function GameComponent() {
  const {
    isConnected,
    myBeyblade,
    beyblades,
    arena,
    connect,
    sendInput,
    sendAction,
  } = useColyseusGame({
    serverUrl: "ws://localhost:2567",
    roomType: "tryout",
  });

  // Auto-connect
  useEffect(() => {
    connect({
      userId: "user123",
      username: "Player1",
      beybladeId: "dragoon-gt",
      arenaId: "standard_arena",
    });
  }, []);

  // Handle keyboard input
  useGameInput(sendInput, sendAction, isConnected);

  return (
    <div>
      {isConnected ? "Connected!" : "Connecting..."}
      {myBeyblade && (
        <div>
          Health: {myBeyblade.health}
          Position: ({myBeyblade.x}, {myBeyblade.y})
        </div>
      )}
    </div>
  );
}
```

### 2. Manual Client Usage

```typescript
import { ColyseusGameClient } from "@/lib/game/client/ColyseusClient";

const client = new ColyseusGameClient("ws://localhost:2567");

// Connect to tryout room
await client.connectTryout({
  userId: "user123",
  username: "Player1",
  beybladeId: "dragoon-gt",
  arenaId: "standard_arena",
});

// Listen to events
client.setCallbacks({
  onBeybladeChanged: (beyblade, key) => {
    console.log("Beyblade updated:", beyblade);
  },
  onRingOut: (data) => {
    console.log("Ring out!", data);
  },
});

// Send input
client.sendInput({ x: 1, y: 0 }); // Move right

// Send actions
client.sendAction("charge"); // Boost spin
client.sendAction("dash"); // Quick dash
client.sendAction("special"); // Special move
```

---

## 🎨 Rendering Dynamic Arena Features

### Understanding the Schema

The server sends simplified arena data. You need to load full arena config from Firestore for rendering:

```typescript
import { ArenaConfig, LoopConfig } from "@/types/arenaConfig";
import { BeybladeStats } from "@/types/beybladeStats";

// Load from Firestore
const arenaConfig = await GameService.getArena(arenaId);
const beybladeStats = await GameService.getBeyblade(beybladeId);
```

### Rendering Loops (Circular Paths)

Loops are **paths/lines**, not zones. They provide speed boosts when beyblades are ON the path:

```typescript
function renderLoops(
  ctx: CanvasRenderingContext2D,
  loops: LoopConfig[],
  scale: number
) {
  loops.forEach((loop) => {
    ctx.strokeStyle = loop.color || "#ffeb3b";
    ctx.lineWidth = 3 / scale;

    if (loop.shape === "circle") {
      // Circular loop path
      ctx.beginPath();
      ctx.arc(0, 0, loop.radius * 16, 0, Math.PI * 2); // 1em ≈ 16px
      ctx.stroke();

      // Render charge points along the loop
      if (loop.chargePoints) {
        loop.chargePoints.forEach((cp) => {
          const angle = (cp.angle * Math.PI) / 180;
          const x = Math.cos(angle) * loop.radius * 16;
          const y = Math.sin(angle) * loop.radius * 16;

          // Charge point indicator
          ctx.fillStyle = cp.color || "#ffd700";
          ctx.beginPath();
          ctx.arc(x, y, (cp.radius || 1) * 16, 0, Math.PI * 2);
          ctx.fill();

          // Button hint
          ctx.fillStyle = "#000";
          ctx.font = `${12 / scale}px Arial`;
          ctx.textAlign = "center";
          ctx.fillText(`${cp.buttonId || ""}`, x, y + 4);
        });
      }
    } else if (loop.shape === "rectangle") {
      // Rectangular loop path
      const w = (loop.width || 20) * 16;
      const h = (loop.height || 20) * 16;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
    } else if (loop.shape === "ring") {
      // Ring (donut) loop
      const outer = loop.radius * 16;
      const inner = outer - (loop.ringThickness || 2) * 16;

      ctx.beginPath();
      ctx.arc(0, 0, outer, 0, Math.PI * 2);
      ctx.arc(0, 0, inner, 0, Math.PI * 2, true);
      ctx.stroke();
    }
    // Add more shapes: pentagon, hexagon, octagon, star, oval
  });
}
```

### Rendering Water Bodies

Water can follow loop paths (moat) or be a central shape:

```typescript
function renderWaterBody(
  ctx: CanvasRenderingContext2D,
  water: WaterBodyConfig,
  loops: LoopConfig[]
) {
  // Determine color by liquid type
  const colors = {
    water: "#4fc3f7",
    blood: "#b71c1c",
    lava: "#ff5722",
    acid: "#cddc39",
    oil: "#424242",
    ice: "#b3e5fc",
  };

  ctx.fillStyle = water.color || colors[water.liquidType];
  ctx.globalAlpha = 0.6;

  if (water.type === "center") {
    // Central water shape
    if (water.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, (water.radius || 10) * 16, 0, Math.PI * 2);
      ctx.fill();
    } else if (water.shape === "rectangle") {
      const w = (water.width || 20) * 16;
      const h = (water.height || 20) * 16;
      ctx.fillRect(-w / 2, -h / 2, w, h);
    }
  } else if (water.type === "loop") {
    // Water follows a loop path (moat)
    const loop = loops[water.loopIndex || 0];
    if (loop) {
      const inner = (water.innerRadius || loop.radius - 2) * 16;
      const outer = (water.outerRadius || loop.radius + 2) * 16;

      ctx.beginPath();
      ctx.arc(0, 0, outer, 0, Math.PI * 2);
      ctx.arc(0, 0, inner, 0, Math.PI * 2, true);
      ctx.fill();
    }
  } else if (water.type === "ring") {
    // Ring at arena edges
    const arenaRadius = 400; // Example
    const outer = arenaRadius;
    const inner = arenaRadius - (water.ringThickness || 5) * 16;

    ctx.beginPath();
    ctx.arc(0, 0, outer, 0, Math.PI * 2);
    ctx.arc(0, 0, inner, 0, Math.PI * 2, true);
    ctx.fill();
  }

  ctx.globalAlpha = 1.0;

  // Wave animation (optional)
  if (water.waveAnimation) {
    // Add animated wave effect using time-based sine waves
  }
}
```

### Rendering Obstacles

Obstacles are static objects with theme-based visuals:

```typescript
function renderObstacles(
  ctx: CanvasRenderingContext2D,
  obstacles: ObstacleConfig[],
  theme: ArenaTheme
) {
  obstacles.forEach((obstacle) => {
    const x = obstacle.x * 16;
    const y = obstacle.y * 16;
    const r = obstacle.radius * 16;

    ctx.save();
    ctx.translate(x, y);

    if (obstacle.rotation) {
      ctx.rotate((obstacle.rotation * Math.PI) / 180);
    }

    // Theme-based rendering
    if (theme === "forest" && obstacle.type === "rock") {
      // Draw tree
      ctx.fillStyle = "#795548";
      ctx.fillRect(-r / 4, -r, r / 2, r * 2);
      ctx.fillStyle = "#4caf50";
      ctx.beginPath();
      ctx.arc(0, -r, r, 0, Math.PI * 2);
      ctx.fill();
    } else if (theme === "futuristic" && obstacle.type === "pillar") {
      // Draw energy pillar
      ctx.fillStyle = "#00ffff";
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#00ffff";
      ctx.fillRect(-r / 2, -r, r, r * 2);
      ctx.shadowBlur = 0;
    } else {
      // Default: simple circle
      ctx.fillStyle = "#757575";
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}
```

### Rendering Pits

Pits are traps with depth visual effect:

```typescript
function renderPits(ctx: CanvasRenderingContext2D, pits: PitConfig[]) {
  pits.forEach((pit) => {
    const x = pit.x * 16;
    const y = pit.y * 16;
    const r = pit.radius * 16;

    // Create depth gradient
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, "#000000");
    gradient.addColorStop(0.5, "#1a1a1a");
    gradient.addColorStop(1, "#2d2d2d");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Swirl animation
    if (pit.swirl) {
      ctx.strokeStyle = "#444444";
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const swirlR = r * (0.8 - i * 0.2);
        const offset = (Date.now() / 1000 + (i * Math.PI) / 3) % (Math.PI * 2);
        ctx.beginPath();
        ctx.arc(x, y, swirlR, offset, offset + Math.PI);
        ctx.stroke();
      }
    }
  });
}
```

### Rendering Laser Guns

Automated turrets that aim and fire:

```typescript
function renderLaserGuns(
  ctx: CanvasRenderingContext2D,
  laserGuns: LaserGunConfig[]
) {
  laserGuns.forEach((gun) => {
    const x = gun.x * 16;
    const y = gun.y * 16;

    ctx.save();
    ctx.translate(x, y);

    // Gun base
    ctx.fillStyle = "#616161";
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // Gun barrel (rotates to aim)
    ctx.rotate((gun.angle * Math.PI) / 180);
    ctx.fillStyle = gun.laserColor || "#ff0000";
    ctx.fillRect(0, -4, 24, 8);

    // Targeting indicator
    const targetX = Math.cos((gun.angle * Math.PI) / 180) * gun.range * 16;
    const targetY = Math.sin((gun.angle * Math.PI) / 180) * gun.range * 16;
    ctx.strokeStyle = gun.laserColor || "#ff0000";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  });
}
```

### Rendering Goal Objects

Collectible objectives:

```typescript
function renderGoalObjects(
  ctx: CanvasRenderingContext2D,
  goals: GoalObjectConfig[]
) {
  goals.forEach((goal) => {
    const x = goal.x * 16;
    const y = goal.y * 16;
    const r = goal.radius * 16;

    ctx.save();
    ctx.translate(x, y);

    // Shield (if present)
    if (goal.shieldHealth && goal.shieldHealth > 0) {
      ctx.strokeStyle = "#00bcd4";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Goal object based on type
    if (goal.type === "star") {
      // 5-pointed star
      ctx.fillStyle = goal.color || "#ffd700";
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    } else if (goal.type === "crystal") {
      // Diamond shape
      ctx.fillStyle = goal.color || "#9c27b0";
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.7, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.7, 0);
      ctx.closePath();
      ctx.fill();
    } else if (goal.type === "coin") {
      // Circle with shine
      ctx.fillStyle = goal.color || "#ffeb3b";
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fff176";
      ctx.beginPath();
      ctx.arc(-r / 3, -r / 3, r / 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Add more types: gem, relic, trophy

    ctx.restore();
  });
}
```

---

## 🎯 Rendering Beyblade Contact Points

Beyblades have **dynamic contact points** that affect collision damage:

```typescript
import { BeybladeStats, PointOfContact } from "@/types/beybladeStats";

function renderBeybladeWithContactPoints(
  ctx: CanvasRenderingContext2D,
  beyblade: ServerBeyblade,
  stats: BeybladeStats,
  scale: number
) {
  const x = beyblade.x;
  const y = beyblade.y;
  const radius = beyblade.radius * 16;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(beyblade.rotation);

  // Base beyblade
  ctx.fillStyle = "#2196f3";
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Render contact points
  if (stats.pointsOfContact) {
    stats.pointsOfContact.forEach((point: PointOfContact) => {
      const angle = (point.angle * Math.PI) / 180;
      const distance = radius * 0.9;
      const px = Math.cos(angle) * distance;
      const py = Math.sin(angle) * distance;

      // Contact point width
      const halfWidth = ((point.width / 2) * Math.PI) / 180;

      // Color based on damage multiplier
      const intensity = Math.min(point.damageMultiplier / 2, 1);
      ctx.fillStyle = `rgba(255, ${255 * (1 - intensity)}, 0, 0.8)`;

      // Draw contact zone
      ctx.beginPath();
      ctx.arc(0, 0, radius, angle - halfWidth, angle + halfWidth);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      // Contact spike
      ctx.fillStyle = `rgba(255, 0, 0, ${intensity})`;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(
        px + Math.cos(angle) * radius * 0.3,
        py + Math.sin(angle) * radius * 0.3
      );
      ctx.lineTo(
        px + Math.cos(angle + 0.2) * radius * 0.2,
        py + Math.sin(angle + 0.2) * radius * 0.2
      );
      ctx.closePath();
      ctx.fill();
    });
  }

  // Center
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
```

---

## 📊 Complete Rendering Example

```typescript
function renderGame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  beyblades: ServerBeyblade[],
  arena: ServerArena,
  arenaConfig: ArenaConfig,
  beybladeStats: Map<string, BeybladeStats>
) {
  // Clear
  ctx.fillStyle = arenaConfig.backgroundColor || "#1a1a2e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Center and scale
  const scale = canvas.width / (arena.width * 16);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(scale, scale);

  // 1. Background layers (parallax)
  renderBackgroundLayers(ctx, arenaConfig.backgroundLayers);

  // 2. Water bodies (below everything)
  if (arenaConfig.waterBody) {
    renderWaterBody(ctx, arenaConfig.waterBody, arenaConfig.loops);
  }

  // 3. Pits (traps)
  renderPits(ctx, arenaConfig.pits);

  // 4. Loops (speed boost paths)
  renderLoops(ctx, arenaConfig.loops, scale);

  // 5. Rotation bodies (force fields)
  if (arenaConfig.rotationBodies) {
    renderRotationBodies(ctx, arenaConfig.rotationBodies);
  }

  // 6. Obstacles
  renderObstacles(ctx, arenaConfig.obstacles, arenaConfig.theme);

  // 7. Goal objects
  renderGoalObjects(ctx, arenaConfig.goalObjects);

  // 8. Laser guns
  renderLaserGuns(ctx, arenaConfig.laserGuns);

  // 9. Portals
  if (arenaConfig.portals) {
    renderPortals(ctx, arenaConfig.portals);
  }

  // 10. Beyblades (with contact points)
  beyblades.forEach((beyblade) => {
    const stats = beybladeStats.get(beyblade.beybladeId);
    if (stats) {
      renderBeybladeWithContactPoints(ctx, beyblade, stats, scale);
    }
  });

  // 11. Arena walls/boundaries
  renderArenaWalls(ctx, arena, arenaConfig.wall);

  // 12. Exits (if any)
  renderExits(ctx, arenaConfig.exits, arena);

  ctx.restore();

  // HUD (not scaled)
  renderHUD(ctx, canvas, beyblades);
}
```

---

## 🎮 Input Handling

The `useGameInput` hook handles keyboard input automatically. For custom input:

```typescript
// Keyboard
window.addEventListener("keydown", (e) => {
  const direction = { x: 0, y: 0 };

  if (e.key === "w") direction.y = -1;
  if (e.key === "s") direction.y = 1;
  if (e.key === "a") direction.x = -1;
  if (e.key === "d") direction.x = 1;

  sendInput(direction);

  if (e.key === " ") sendAction("charge");
});

// Gamepad
const gamepad = navigator.getGamepads()[0];
if (gamepad) {
  const x = gamepad.axes[0]; // Left stick X
  const y = gamepad.axes[1]; // Left stick Y

  sendInput({ x, y });

  if (gamepad.buttons[0].pressed) sendAction("dash");
  if (gamepad.buttons[1].pressed) sendAction("charge");
  if (gamepad.buttons[2].pressed) sendAction("special");
}

// Touch/Mobile
canvas.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const x = (touch.clientX - rect.left - centerX) / centerX;
  const y = (touch.clientY - rect.top - centerY) / centerY;

  sendInput({ x, y });
});
```

---

## 📝 Next Steps

1. ✅ **Created**: Colyseus client (`ColyseusClient.ts`)
2. ✅ **Created**: React hook (`useColyseusGame.ts`)
3. ✅ **Created**: Example component (`TryoutModeGame.tsx`)
4. ⏳ **Next**: Integrate with existing game UI
5. ⏳ **Next**: Add interpolation for smooth movement
6. ⏳ **Next**: Implement visual effects for special moves

---

## 🚀 Testing

```bash
# Terminal 1: Start game server
cd game-server
npm run dev

# Terminal 2: Start Next.js
npm run dev

# Open browser
http://localhost:3000/game/tryout
```

---

**The frontend is ready to connect!** 🎉
