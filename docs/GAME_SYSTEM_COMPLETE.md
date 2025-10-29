# Beyblade Battle Game - Complete System Documentation

**Last Updated:** October 30, 2025  
**Status:** ✅ Production Ready

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Game Mechanics](#game-mechanics)
3. [Power System](#power-system)
4. [Physics & Collision](#physics--collision)
5. [Multiplayer Architecture](#multiplayer-architecture)
6. [Controls & Input](#controls--input)
7. [Performance](#performance)
8. [Technical Stack](#technical-stack)

---

## System Overview

### Core Features

- **Real-time Physics**: Newton's laws-based collision system
- **Power Management**: 0-25 power system for special moves
- **Multiplayer**: Real-time 2-player online battles via Socket.IO
- **Mobile Support**: Touch controls with virtual joystick
- **AI Opponent**: Intelligent enemy with power-based special moves

### Game Modes

- **Single Player (1P)**: Battle against AI
- **Multiplayer (2P)**: Real-time online battles with matchmaking

---

## Game Mechanics

### Victory Conditions

1. **Spin-Out**: Opponent's spin reaches 0
2. **Ring-Out**: Opponent crosses exit zone boundaries
3. **Time-Out**: Highest spin when timer expires

### Stadium Zones

#### 🔵 Blue Circles (Loops)

- **Normal Loop** (200 radius): +10 power/sec, movement locked
- **Charge Dash** (300 radius): +10 power/sec, movement locked
- **Duration**: Automatic full rotation
- **Cooldown**: 5 seconds after completion

#### 🟡 Wall Zones (Yellow)

- **Angles**: 0-60°, 120-180°, 240-300°
- **Effect**: Bounce back, lose spin
- **Safe**: Prevents ring-out

#### 🔴 Exit Zones (Red)

- **Angles**: 60-120°, 180-240°, 300-360°
- **Effect**: Instant elimination (ring-out)

### Spin System

- **Starting Spin**: Player: 3500, AI: 2800
- **Decay Rate**: Gradual over time + collision damage
- **Minimum**: 0 (triggers spin-out loss)

---

## Power System

### Power Mechanics

- **Range**: 0-25 (full bar)
- **Gain Rate**:
  - Normal: +5/sec
  - During loops/charge dash: +10/sec (2x)
- **Display**: "Power: X/25" in HUD

### Special Moves

#### 1. Dodge (Left/Right)

- **Cost**: 10 power
- **Hotkeys**: Q (left), E (right), or mouse clicks
- **Effect**: Quick 50-unit dash
- **Cooldown**: 2 seconds
- **Use Case**: Escape dangerous situations during loops

#### 2. Heavy Attack

- **Cost**: 15 power
- **Hotkey**: R or middle mouse
- **Effect**: 100-unit attack dash
- **Cooldown**: 5 seconds
- **Direction**: Follows joystick/mouse direction

#### 3. Ultimate Attack

- **Cost**: 25 power (full bar)
- **Hotkey**: F or double-click
- **Effect**: 150-unit devastating dash
- **Cooldown**: 5 seconds
- **Direction**: Follows joystick/mouse direction

### Movement Control

- **Normal**: Full directional control
- **During Loops**: Movement locked (strategic risk)
- **Special Moves**: Always available (escape mechanism)

---

## Physics & Collision

### Collision Damage Calculation

Physics-based using Newton's laws:

```typescript
// Linear momentum: p = mv
// Angular momentum: L = Iω where I = 0.5mr²
// Damage factors:
- Base damage: momentum difference × 0.08
- Energy transfer: kinetic energy × 0.0005
- Max damage cap: 120 per collision
```

### Damage Multipliers

- **Same spin direction**: Momentum-based
- **Opposite spin**: 1.5× multiplier
- **Special attacks**: Momentum × attack speed

### Server Authority (Multiplayer)

- Server calculates all collision damage
- Clients apply server-authoritative results
- Prevents cheating and ensures fairness

---

## Multiplayer Architecture

### Connection Flow

```
Client → Socket.IO Server (port 3001)
  ↓
Matchmaking (find/create room)
  ↓
Beyblade Selection (both players)
  ↓
Game Start (synchronized countdown)
  ↓
Real-time State Sync (60 FPS)
```

### State Synchronization

**Transmitted Every Frame:**

- Position, velocity, rotation
- Spin, power, acceleration
- Special move states
- Loop/dash states

**Server Authority:**

- Collision damage calculations
- Game state validation
- Winner determination

### Room Management

- **Max Rooms**: 10 concurrent games
- **Max Players**: 20 (10 rooms × 2 players)
- **Auto-cleanup**: Rooms deleted when empty
- **Reconnection**: Not supported (restart required)

---

## Controls & Input

### Mouse/Touch Controls

- **Movement**: Move mouse/touch to control beyblade direction
- **Dodge Left**: Left click / Q
- **Dodge Right**: Right click / E
- **Heavy Attack**: Middle click / R
- **Ultimate**: Double-click / F

### Virtual Joystick (Mobile)

- **Drag-based**: Touch and drag to control direction
- **Fixed position**: Stays where you first touch
- **Visual feedback**: Shows direction and power

### Gamepad Support

- **Left Stick**: Movement direction
- **Buttons**: Mapped to special moves
- **Auto-detection**: Switches to gamepad mode when used

---

## Performance

### Optimizations Implemented

1. **PixiJS Rendering**: WebGL-accelerated graphics
2. **State Batching**: Reduced render calls
3. **Network Throttling**: 60 FPS state sync maximum
4. **Collision Caching**: Spatial partitioning for checks
5. **Asset Preloading**: SVG beyblades loaded at startup

### Target Performance

- **FPS**: 60 on desktop, 30+ on mobile
- **Network Latency**: <100ms recommended
- **Memory**: <200MB total

### Browser Compatibility

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (iOS/macOS)
- ⚠️ IE11: Not supported

---

## Technical Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **UI**: Material-UI (MUI) v6
- **Rendering**: PixiJS v8 (WebGL)
- **State**: React Hooks + useCallback
- **TypeScript**: Strict mode enabled

### Backend

- **Server**: Node.js + Express
- **WebSocket**: Socket.IO v4
- **Deployment**:
  - Frontend: Vercel
  - Backend: Render.com

### File Structure

```
src/app/game/
├── page.tsx                    # Game hub landing
├── beyblade-battle/
│   └── page.tsx               # Battle arena page
├── components/
│   ├── EnhancedBeybladeArena.tsx   # Main arena wrapper
│   ├── GameArenaPixi.tsx           # PixiJS renderer
│   ├── GameArena.tsx               # Canvas fallback
│   ├── DraggableVirtualDPad.tsx    # Touch controls
│   ├── GameModeSelector.tsx        # Mode selection
│   ├── MultiplayerLobby.tsx        # Matchmaking
│   └── MatchResultScreen.tsx       # End game screen
├── hooks/
│   ├── useGameState.ts             # Core game logic
│   └── useMultiplayer.ts           # Socket.IO integration
├── types/
│   ├── game.ts                     # Game type definitions
│   └── multiplayer.ts              # Multiplayer types
└── utils/
    ├── gamePhysics.ts              # Physics calculations
    ├── physicsCollision.ts         # Collision damage
    └── collisionUtils.ts           # Collision detection
```

---

## Key Algorithms

### Power Gain (useGameState.ts)

```typescript
function updateBeybladeLogic(beyblade, deltaTime, gameState) {
  if (!beyblade.isDead && !beyblade.isOutOfBounds) {
    const isInLoop =
      beyblade.isInNormalLoop ||
      beyblade.isInBlueLoop ||
      beyblade.isChargeDashing;
    const powerGainRate = isInLoop ? 10 : 5;
    beyblade.power = Math.min(25, beyblade.power + powerGainRate * deltaTime);
  }
}
```

### Collision Detection

```typescript
function checkCollision(bey1, bey2) {
  const dx = bey1.position.x - bey2.position.x;
  const dy = bey1.position.y - bey2.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = bey1.radius + bey2.radius;
  return distance < minDistance;
}
```

### Server Collision Damage

```typescript
function calculateServerCollisionDamage(bey1Data, bey2Data) {
  // Calculate momenta
  const L1 = calculateAngularMomentum(bey1Data);
  const L2 = calculateAngularMomentum(bey2Data);
  const p1 = calculateLinearMomentum(bey1Data);
  const p2 = calculateLinearMomentum(bey2Data);

  // Calculate damage (reduced for longer battles)
  let damage1 = (|L1 - L2| + p2) × 0.08;
  let damage2 = (|L1 - L2| + p1) × 0.08;

  // Opposite spins: 1.5× damage
  if (isOppositeSpins) {
    damage1 *= 1.5;
    damage2 *= 1.5;
  }

  // Cap max damage
  return {
    damage1: Math.min(120, damage1),
    damage2: Math.min(120, damage2)
  };
}
```

---

## Configuration

### Environment Variables

```bash
# Server
PORT=3001
NODE_ENV=production

# Client (Vercel)
NEXT_PUBLIC_SOCKET_URL=https://your-server.render.com
```

### Deployment

1. **Frontend**: Auto-deploy via Vercel (Git push)
2. **Backend**: Manual deploy to Render.com
3. **Domain**: Custom domain via Vercel

---

## Future Enhancements

### Planned Features

- [ ] Power-up pickups in arena
- [ ] Multiple beyblade types with unique stats
- [ ] Tournament mode (4+ players)
- [ ] Replay system
- [ ] Spectator mode
- [ ] Mobile app (React Native)

### Performance Improvements

- [ ] WebAssembly physics engine
- [ ] Predictive client-side physics
- [ ] CDN for assets
- [ ] Lazy loading for components

---

## Troubleshooting

### Common Issues

**1. Multiplayer not connecting**

- Check `NEXT_PUBLIC_SOCKET_URL` is set correctly
- Verify server is running on Render
- Check browser console for CORS errors

**2. Low FPS**

- Disable browser extensions
- Close other tabs
- Use PixiJS renderer (not Canvas)
- Reduce browser zoom level

**3. Controls not responsive**

- Check if gamepad is detected (may override)
- Disable browser touch gestures
- Try refreshing the page

**4. Opponent desynced**

- Network latency >200ms (check ping)
- Server overload (wait or restart)
- Refresh both clients

---

## Credits & License

**Developed by**: [Your Team Name]  
**License**: MIT  
**Assets**: Custom SVG beyblades  
**Inspiration**: Beyblade anime/toys

---

## Quick Reference

### Power Costs

| Move     | Cost | Effect      |
| -------- | ---- | ----------- |
| Dodge    | 10   | Quick dash  |
| Heavy    | 15   | Attack dash |
| Ultimate | 25   | Max damage  |

### Power Gain

| State   | Rate    | Time to Full |
| ------- | ------- | ------------ |
| Normal  | +5/sec  | 5 seconds    |
| In Loop | +10/sec | 2.5 seconds  |

### Damage Values

| Factor        | Multiplier | Max |
| ------------- | ---------- | --- |
| Base          | 0.08       | 120 |
| Energy        | 0.0005     | -   |
| Opposite Spin | 1.5×       | -   |

---

**End of Documentation**
