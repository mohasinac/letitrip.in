# Stadium Features - Visual Guide

## Feature Overview Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    STADIUM CONFIGURATION                     │
│                       (ArenaConfig)                          │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│   BOUNDARY   │      │    LOOPS     │     │   HAZARDS    │
│    SYSTEM    │      │   & ZONES    │     │  & OBJECTS   │
└──────────────┘      └──────────────┘     └──────────────┘
        │                     │                     │
        │                     │                     │
        ▼                     ▼                     ▼
```

---

## 1. Boundary System

### Exit Configuration Options

```
WALLS ENABLED = true
┌─────────────────────────────────────┐
│  ╔════╗    exit    ╔════╗          │
│  ║ 1  ║ <------> ║ 2  ║          │
│  ╚════╝           ╚════╝          │
│                                    │
│  ╔════╗           ╔════╗          │
│  ║ 3  ║           ║ 4  ║          │
│  ╚════╝           ╚════╝          │
└─────────────────────────────────────┘
exitsBetweenWalls = true
→ Gaps between wall segments


WALLS ENABLED = false, allExits = true
┌─────────────────────────────────────┐
│ ◀════════ EXIT ZONE ══════════▶    │
│                                    │
│         (entire boundary)          │
│                                    │
│ ◀════════ EXIT ZONE ══════════▶    │
└─────────────────────────────────────┘
→ Entire boundary is exit


WALLS ENABLED = false, allExits = false
╔═════════════════════════════════════╗
║                                     ║
║      (closed boundary)              ║
║      no exits                       ║
║                                     ║
╚═════════════════════════════════════╝
→ Sealed arena
```

---

## 2. Portal System (Max 2) - Whirlpools

### Portal Configuration (Whirlpool Rendering)

```
┌─────────────────────────────────────┐
│                                     │
│    � Portal 1 (IN)                │
│    ┌─────────────────────┐         │
│    │  Entry Whirlpool    │         │
│    │  ╔═══════════╗      │         │
│    │ ╔╝ ╔═╗ ╔═╗   ╚╗     │         │
│    │ ║ ╔╝ ● ╚╗    ║     │         │  (Clockwise spiral)
│    │ ╚╗ ╚═══╝  ╔═╝      │         │  X: -15, Y: 0
│    │  ╚════════╝         │         │
│    └─────────────────────┘         │
│            │                        │
│        ┈┈┈┈┈┈┈ Flow                │
│            ▼                        │
│    ┌─────────────────────┐         │
│    │  ╔════════╗          │         │
│    │ ╔╝  ╔═╗ ╔═ ╚╗       │  �     │
│    │ ║  ╔╝ ● ╚╗  ║       │  Portal 1 (OUT)
│    │ ╚╗ ╚═╗╔═╝ ╔═╝       │         │  (Counter-clockwise)
│    │  ╚═══╗╔════╝         │         │  X: 15, Y: 0
│    │  Exit Whirlpool      │         │
│    └─────────────────────┘         │
│                                     │
│           � Portal 2 (IN)         │
│    Bidirectional: ✅               │
│    Cooldown: 2s                    │
│                                     │
└─────────────────────────────────────┘
```

### Whirlpool Visual Features

- **Multi-Layer Spirals**: 3-5 rotating spiral layers
- **Vortex Center**: Dark center representing portal core
- **Particle Effects**: Swirling particles around edges
- **Flow Animation**: Dashed line connecting IN → OUT portals
- **Rotation**: Entry (clockwise) vs Exit (counter-clockwise)
- **Radial Gradient**: Dark center fading to colored edges

### Portal Properties

- **Entry/Exit Points**: Custom X,Y coordinates
- **Whirlpool Style**: Animated spiral vortex effect
- **Bidirectional**: Travel both ways
- **Cooldown**: Prevent spam (0-10s)
- **Visual**: Custom color theme & whirlpool radius

---

## 3. Loop Charge Points

### Even Distribution

```
        ⚡ CP 1 (0°)
         │
         │
         ▼
    ╔═══════════╗
    ║           ║
⚡──▶║  LOOP 1   ║◀──⚡ CP 2 (90°)
CP 4║  Speed:   ║
(270°)  1.2x    ║
    ║           ║
    ╚═══════════╝
         ▲
         │
         │
        ⚡ CP 3 (180°)

4 Charge Points → 360° / 4 = 90° apart
Each point: rechargeRate = 5%/sec
```

### Configuration

```typescript
chargePointCount: 4
→ Auto-generates 4 points at:
  [0°, 90°, 180°, 270°]

rechargeRate: 5
→ All points restore 5% spin/sec
```

---

## 4. Water Body Types

### Type: Center

```
┌─────────────────────────────────────┐
│                                     │
│          ┌─────────┐               │
│          │  💧💧  │               │
│          │ CENTER  │               │
│          │  WATER  │               │
│          └─────────┘               │
│                                     │
└─────────────────────────────────────┘
Simple center placement
radius: 10em
```

### Type: Loop (Moat) ⭐ NEW

```
┌─────────────────────────────────────┐
│                                     │
│   ╔═══════════════════════╗        │
│   ║ 💧💧💧💧💧💧💧 ║        │
│   ║ 💧  LOOP PATH  💧 ║        │
│   ║ 💧💧💧💧💧💧💧 ║        │
│   ╚═══════════════════════╝        │
│                                     │
└─────────────────────────────────────┘
innerRadius: 15em (inner edge)
outerRadius: 21em (outer edge)
Moat width: 6em
```

### Type: Ring

```
┌─────────────────────────────────────┐
│ 💧💧💧💧💧💧💧💧💧💧💧 │
│ 💧                         💧 │
│ 💧                         💧 │
│ 💧    (stadium center)     💧 │
│ 💧                         💧 │
│ 💧                         💧 │
│ 💧💧💧💧💧💧💧💧💧💧💧 │
└─────────────────────────────────────┘
ringThickness: 3em
At stadium edges
```

---

## 5. Obstacle Placement Rules

### Placement Matrix

```
┌─────────────────────────────────────────────┐
│                                             │
│       Circle Loop (radius 20em)            │
│                                             │
│  ╔═══════════════════════════╗             │
│  ║                           ║             │
│  ║    ✅ 🪨                  ║             │
│  ║  (Inside area OK)         ║             │
│  ║          ● CENTER         ║             │
│  ║                           ║             │
│  ║             ✅ 🪨         ║             │
│  ║         (Inside OK)       ║             │
│  ║                           ║             │
│ ❌══ Loop Path Line (20em radius) ═══❌   │
│  (Cannot place on this line)              │
│                                             │
│         ✅ 🪨  ← Can place outside         │
│                                             │
│  💧💧 ✅ 🪨  ← Can place on water          │
│                                             │
└─────────────────────────────────────────────┘

Rules:
• canBeOnLoopPath = false (default)
  → Cannot be ON the loop path line where beyblades travel
  → Path line = the circular/shape line at loop radius

• canBeInsideLoop = true (default)
  → CAN be inside the enclosed loop area
  → Inside = within boundary but NOT on path line
  → Example: Obstacles at center (0,0) are OK

• No restrictions on other bodies (water, pits, etc.)

Key Distinction:
┌─────────────────────────────────────┐
│  ❌ ON path line = BLOCKED          │
│     (Distance ≈ loop radius)        │
│                                     │
│  ✅ INSIDE area = ALLOWED           │
│     (Distance < loop radius)        │
│                                     │
│  ✅ OUTSIDE area = ALLOWED          │
│     (Distance > loop radius)        │
└─────────────────────────────────────┘
```

---

## 6. Goal Objects

### Collectible Types

```
┌─────────────────────────────────────┐
│                                     │
│     ⭐ Star (isCollectible: true)  │
│     → Collect on touch              │
│     → Instant score                 │
│                                     │
│     💎 Crystal (isCollectible: false)
│     → Must destroy                  │
│     → Health points                 │
│                                     │
│     🪙 Coin (theme: desert)        │
│     → Gold coin appearance          │
│                                     │
└─────────────────────────────────────┘
```

### Theme Variants

| Theme      | Star    | Crystal     | Coin      |
| ---------- | ------- | ----------- | --------- |
| Forest     | 🌟 Leaf | 🟢 Emerald  | 🍂 Acorn  |
| Futuristic | ⭐ Neon | 🔷 Data     | 💿 Credit |
| Desert     | ✨ Sand | 🟡 Amber    | 🪙 Gold   |
| Sea        | 🌊 Wave | 🔵 Sapphire | 🐚 Pearl  |

---

## 7. Complete Arena Example

### "Moat Arena with Portals"

```
┌───────────────────────────────────────────┐
│  Exit ◀────────────────────────▶ Exit   │
│                                           │
│  🌀 Portal 1 (IN)                        │
│  ╔═══════════════════════════════╗       │
│  ║ 💧💧💧💧💧💧💧💧💧 ║       │
│  ║ 💧 ⚡      Loop      ⚡ 💧 ║       │
│  ║ 💧💧💧💧💧💧💧💧💧 ║       │
│  ╚═══════════════════════════════╝       │
│                        🌀 Portal 1 (OUT) │
│                                           │
│  ⭐ Star  🪨 Rock  💎 Crystal            │
│                                           │
│  Exit ◀────────────────────────▶ Exit   │
└───────────────────────────────────────────┘

Features:
• Exits between wall segments (4 exits)
• 2 portals (bidirectional)
• Loop with 2 charge points (⚡)
• Water moat around loop (💧)
• Mixed goal objects (⭐💎)
• Theme-based obstacles (🪨)
```

---

## 8. UI Control Layout

### Admin Panel Structure

```
┌─────────────────────────────────────────┐
│  TABS: Basic | Loops | Hazards | Goals  │
├─────────────────────────────────────────┤
│                                          │
│  BASIC TAB                               │
│  ┌────────────────────────────────┐    │
│  │ Wall Settings                  │    │
│  │ ☑ Enable Walls                 │    │
│  │ ☑ Exits Between Walls          │    │
│  │ Wall Count: [8]                │    │
│  └────────────────────────────────┘    │
│                                          │
│  LOOPS TAB                               │
│  ┌────────────────────────────────┐    │
│  │ Loop 1                         │    │
│  │ ⚡ Charge Points                │    │
│  │   Count: [4]  Rate: [5%/sec]   │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │ 🌀 Portals (Max 2)             │    │
│  │ Portal 1                       │    │
│  │   In: X[-15] Y[0]              │    │
│  │   Out: X[15] Y[0]              │    │
│  │   ☑ Bidirectional              │    │
│  └────────────────────────────────┘    │
│                                          │
│  HAZARDS TAB                             │
│  ┌────────────────────────────────┐    │
│  │ 💧 Water Body                  │    │
│  │ Type: [Loop ▼]                 │    │
│  │ Loop Index: [Loop 1 ▼]         │    │
│  │ Inner Radius: [15]             │    │
│  │ Outer Radius: [21]             │    │
│  └────────────────────────────────┘    │
│                                          │
└─────────────────────────────────────────┘
```

---

## 9. Data Flow

### Configuration to Rendering

```
ArenaConfig (JSON)
        │
        ├─► Portals Array (0-2)
        │   └─► Render: Entry/Exit circles + Line
        │
        ├─► Loops Array
        │   ├─► Loop path (speed zone)
        │   └─► Charge Points Array
        │       └─► Render: Glowing dots at angles
        │
        ├─► Water Body
        │   ├─► Type: center → Circle/Shape
        │   ├─► Type: loop → Moat (inner/outer)
        │   └─► Type: ring → Edge band
        │
        ├─► Obstacles Array
        │   ├─► Check: canBeOnLoopPath
        │   ├─► Check: canBeInsideLoop
        │   └─► Render: Theme icon
        │
        └─► Goal Objects Array
            ├─► Type: star/crystal/coin/etc.
            ├─► Theme variant
            └─► isCollectible flag
```

---

## 10. Testing Scenarios Visual

### Scenario A: Portal Jump

```
Before:
┌──────────────────────┐
│  🎯 Beyblade         │
│  🌀 Portal IN        │
│                      │
│          🌀 Portal OUT
└──────────────────────┘

After (instant):
┌──────────────────────┐
│                      │
│  🌀 Portal IN        │
│                      │
│          🌀 Portal OUT
│              🎯 Beyblade
└──────────────────────┘
```

### Scenario B: Charge Point

```
Before:
┌──────────────────────┐
│  ╔════════╗          │
│  ║   ⚡   ║          │
│  ║  🎯    ║          │
│  ╚════════╝          │
│  Spin: 50%           │
└──────────────────────┘

On Charge Point (1 sec):
┌──────────────────────┐
│  ╔════════╗          │
│  ║  ⚡🎯  ║          │
│  ║  ✨💫  ║          │
│  ╚════════╝          │
│  Spin: 55% (+5%)     │
└──────────────────────┘
```

### Scenario C: Water Moat

```
┌──────────────────────┐
│  ╔════════════╗      │
│  ║ 💧💧💧 ║      │
│  ║ 💧    💧 ║      │  Speed: 100%
│  ║ 💧🎯→💧 ║      │
│  ║ 💧💧💧 ║      │  Speed in water: 60%
│  ╚════════════╝      │  Spin drain: 2%/sec
└──────────────────────┘
```

---

## 11. Property Reference

### Quick Lookup Table

| Feature             | Property                   | Type    | Default | Range/Options         |
| ------------------- | -------------------------- | ------- | ------- | --------------------- |
| **Exit - No Walls** | `wall.allExits`            | boolean | false   | true/false            |
| **Exit - Between**  | `wall.exitsBetweenWalls`   | boolean | false   | true/false            |
| **Portal Count**    | `portals.length`           | number  | 0       | 0-2                   |
| **Portal In**       | `portal.inPoint`           | {x, y}  | -       | any                   |
| **Portal Out**      | `portal.outPoint`          | {x, y}  | -       | any                   |
| **Portal Cooldown** | `portal.cooldown`          | number  | 0       | 0-10 sec              |
| **Charge Points**   | `loop.chargePointCount`    | number  | 0       | 0-12                  |
| **Charge Rate**     | `chargePoint.rechargeRate` | number  | 5       | 1-20 %/sec            |
| **Water Type**      | `waterBody.type`           | string  | center  | center/loop/ring      |
| **Moat Inner**      | `waterBody.innerRadius`    | number  | 15      | 5-30 em               |
| **Moat Outer**      | `waterBody.outerRadius`    | number  | 21      | 5-35 em               |
| **Ring Thickness**  | `waterBody.ringThickness`  | number  | 3       | 1-10 em               |
| **Obstacle Loop**   | `obstacle.canBeOnLoopPath` | boolean | false   | true/false            |
| **Obstacle Inside** | `obstacle.canBeInsideLoop` | boolean | true    | true/false            |
| **Goal Type**       | `goal.type`                | string  | star    | star/crystal/coin/etc |
| **Goal Collect**    | `goal.isCollectible`       | boolean | false   | true/false            |

---

## 12. Implementation Checklist Visual

```
✅ Type Definitions (src/types/arenaConfig.ts)
   ├─✅ ChargePointConfig
   ├─✅ PortalConfig
   ├─✅ LoopConfig updates
   ├─✅ WallConfig updates
   ├─✅ WaterBodyConfig updates
   ├─✅ ObstacleConfig updates
   └─✅ GoalObjectConfig updates

✅ UI Controls (src/components/admin/ArenaConfigurator.tsx)
   ├─✅ Wall exit options
   ├─✅ Portal configuration (max 2)
   ├─✅ Charge points per loop
   ├─✅ Water moat controls
   └─✅ All inputs validated

⏳ Rendering (Next Phase)
   ├─⏳ ArenaPreview component
   ├─⏳ Portal visuals
   ├─⏳ Charge point glow
   ├─⏳ Moat rendering
   └─⏳ Theme icons

⏳ Game Engine (Next Phase)
   ├─⏳ Portal teleportation
   ├─⏳ Charge point collision
   ├─⏳ Water moat physics
   └─⏳ Exit detection
```

---

**Legend:**

- ✅ Completed
- ⏳ Pending
- ❌ Not Started
- 🎯 Beyblade
- ⚡ Charge Point
- 🌀 Portal
- 💧 Water
- 🪨 Obstacle
- ⭐ Star/Goal
- 💎 Crystal

---

This visual guide provides a clear understanding of all implemented stadium features and how they interact with each other.
