# Water Body Types - Side by Side Comparison

## Quick Visual Reference

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    THE THREE WATER BODY TYPES                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Type 1: 🌊 MOAT WATER BODY

### Definition

Surrounds the entire arena with water, creating a moat effect. Can follow the arena's shape OR be circular.

### Visual Example: Star Arena

#### WITH `followsArenaShape: true` (Star Moat)

```
                    ⭐
                   /~~\
          ~~~~~~~~/    \~~~~~~~~
         ~~                     ~~
        ~         ⬛⬛⬛         ~
       ~        ⬛ STAR ⬛        ~
      ~         ⬛ARENA⬛         ~
       ~        ⬛⬛⬛⬛        ~
        ~                     ~
         ~~                 ~~
          ~~~~~~~~\    /~~~~~~~~
                   \~~/
                    ⭐

Legend:
⬛ = Star Arena (black)
~ = Water Moat (blue) - FOLLOWS STAR SHAPE
```

#### WITH `followsArenaShape: false` (Circular Moat)

```
            ~~~~~~~~~~~~
        ~~~              ~~~
      ~~      ⭐ STAR      ~~
     ~        ARENA         ~
     ~     (star shape)     ~
      ~~                  ~~
        ~~~              ~~~
            ~~~~~~~~~~~~

Legend:
⭐ STAR ARENA = Arena (star shape, black)
~ = Water Moat (blue) - CIRCULAR, IGNORES STAR
```

### Configuration

```typescript
{
  type: "moat",
  thickness: 3,              // Width of moat (1-10 em)
  distanceFromArena: 0,      // Gap (0-5 em)
  followsArenaShape: true,   // Toggle: star vs circle
  color: "#3b82f6",         // Blue
  opacity: 0.6
}
```

---

## Type 2: 💧 ZONE WATER BODY

### Definition

Positioned water hazard at specific X, Y coordinates. Can be circle, square, rectangle, or oval.

### Visual Example: Square Zone Inside Circle Arena

```
        ⭕⭕⭕⭕⭕⭕⭕⭕⭕
      ⭕               ⭕
     ⭕                 ⭕
    ⭕     ┌─────┐      ⭕
    ⭕     │█████│      ⭕  ← Square water zone
    ⭕     │█████│      ⭕     at position (5, -3)
    ⭕     └─────┘      ⭕
     ⭕                 ⭕
      ⭕               ⭕
        ⭕⭕⭕⭕⭕⭕⭕⭕⭕

Legend:
⭕ = Arena boundary (circle, black)
┌─────┐ = Square water zone boundary
█ = Water (blue)
Position: X=5, Y=-3 (off-center)
```

### Visual Example: Multiple Zones

```
    ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
    ⬜   ●                ⬜  ← Zone 1: Circle at (-8, 5)
    ⬜                    ⬜
    ⬜                    ⬜
    ⬜           ▭        ⬜  ← Zone 2: Oval at (8, 0)
    ⬜                    ⬜
    ⬜     ◆              ⬜  ← Zone 3: Square rotated 45°
    ⬜                    ⬜
    ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜

Legend:
⬜ = Arena (square, black)
● = Circle water zone
▭ = Oval water zone
◆ = Rotated square water zone
```

### Configuration

```typescript
{
  type: "zone",
  position: { x: 0, y: 0 },  // X, Y coordinates
  shape: "square",           // circle | square | rectangle | oval
  width: 10,                 // For square/rectangle/oval
  height: 10,                // For rectangle/oval
  radius: 5,                 // For circle
  rotation: 45,              // 0-360 degrees
  color: "#06b6d4",          // Cyan
  opacity: 0.7
}
```

---

## Type 3: 🏖️ WALL-BASED WATER BODY

### Definition

Water at the edges of the arena, in front of walls and exits. Follows arena perimeter.

### Visual Example: Circle Arena

```
        ⭕█⭕█⭕█⭕
      ⭕█           █⭕
     ⭕█             █⭕
    ⭕█               █⭕
    ⭕█               █⭕
    ⭕█               █⭕
     ⭕█             █⭕
      ⭕█           █⭕
        ⭕█⭕█⭕█⭕

Legend:
⭕ = Arena boundary (circle, black)
█ = Water at edges (blue)
[Space] = Dry arena center
```

### Visual Example: Star Arena (Follows Star Shape)

```
                ⭐
               /██\
      ⭐██████⭐    ⭐██████⭐
       ██                ██
        █                █
         ⭐██████████████⭐

Legend:
⭐ = Arena walls/edges (star shape, black)
█ = Water at edges (blue) - FOLLOWS STAR PERIMETER
```

### Visual Example: With `coversExits: true`

```
    ⬜█████████⬜
    ⬜█       █⬜  ← Wall
    ⬜█       █⬜
    ██         ██  ← EXIT + Water (covers exit)
    ⬜█       █⬜
    ⬜█       █⬜  ← Wall
    ⬜█████████⬜

Legend:
⬜ = Arena walls (black)
█ = Water (blue) - covers walls AND exits
```

### Visual Example: With `coversExits: false`

```
    ⬜█████████⬜
    ⬜█       █⬜  ← Wall + Water
    ⬜█       █⬜
              ← EXIT (no water)
    ⬜█       █⬜
    ⬜█       █⬜  ← Wall + Water
    ⬜█████████⬜

Legend:
⬜ = Arena walls (black)
█ = Water (blue) - only at walls, NOT at exits
```

### Configuration

```typescript
{
  type: "wall-based",
  thickness: 2,              // Width of water strip (1-5 em)
  offsetFromEdge: 0,         // Distance inward (0-3 em)
  coversExits: true,         // Water in exit zones?
  color: "#14b8a6",          // Teal
  opacity: 0.5
}
```

---

## 🎯 Complete Example: All 3 Types Together

```
        ~~~MOAT(CIRCULAR)~~~        ← Type 1: Moat
      ~~                  ~~
     ~  ⭕█⭕█⭕█⭕█⭕  ~         ← Type 3: Wall-based
    ~  ⭕█            █⭕  ~
    ~ ⭕█   ┌────┐    █⭕ ~      ← Type 2: Zone (center)
    ~ ⭕█   │████│    █⭕ ~
    ~ ⭕█   └────┘    █⭕ ~
    ~  ⭕█            █⭕  ~
     ~  ⭕█⭕█⭕█⭕█⭕  ~
      ~~                  ~~
        ~~~MOAT(CIRCULAR)~~~

Legend:
~ = Moat water (outer ring, blue)
⭕ = Arena boundary (circle, black)
█ = Wall-based water (at arena edges, teal)
┌────┐ = Zone water (square at center, green)
████ = Water inside zone

Configuration:
waterBodies: [
  { type: "moat", followsArenaShape: false },     // Circular moat
  { type: "zone", position: {x:0,y:0} },         // Center square
  { type: "wall-based", coversExits: true }      // Edge water
]
```

---

## 📊 Comparison Table

| Feature             | Moat 🌊                 | Zone 💧               | Wall-Based 🏖️         |
| ------------------- | ----------------------- | --------------------- | --------------------- |
| **Location**        | Outside arena           | Inside arena (X,Y)    | At arena edges        |
| **Shape Control**   | Follows arena OR circle | 4 shapes + rotation   | Follows arena         |
| **Positioning**     | Automatic (surrounds)   | Manual (X, Y sliders) | Automatic (perimeter) |
| **Use Case**        | Castle moat             | Strategic hazard      | Beach/shore effect    |
| **Thickness Range** | 1-10 em                 | 2-30 em (width)       | 1-5 em                |
| **Special Toggle**  | `followsArenaShape`     | -                     | `coversExits`         |

---

## 🎨 Real-World Examples

### Example 1: Medieval Fortress

```
Arena: Star (5-point)
Water Body: Moat
  - followsArenaShape: ✅ true
  - thickness: 5 em
  - color: Dark blue

Result: Star-shaped moat around star fortress
```

### Example 2: Island Battle

```
Arena: Circle
Water Body 1: Moat (outer)
  - followsArenaShape: true
  - thickness: 3 em
Water Body 2: Zone (center pond)
  - position: (0, 0)
  - shape: circle
  - radius: 4 em

Result: Island with surrounding ocean + center pond
```

### Example 3: Beach Stadium

```
Arena: Octagon
Water Body: Wall-Based
  - thickness: 1.5 em
  - offsetFromEdge: 0
  - coversExits: true
  - color: Cyan

Result: Water lapping at octagon edges like a beach
```

### Example 4: Obstacle Course

```
Arena: Hexagon
Water Body 1: Zone (left)
  - position: (-12, 0)
  - shape: circle
  - radius: 5 em
Water Body 2: Zone (right)
  - position: (12, 0)
  - shape: square
  - width/height: 7 em
  - rotation: 45°
Water Body 3: Zone (center)
  - position: (0, 0)
  - shape: oval
  - width: 10, height: 6

Result: 3 distinct water hazards to navigate around
```

---

## ✨ Summary

**Choose the right type for your needs:**

- 🌊 **Moat**: Want water surrounding your entire arena? Use Moat.
- 💧 **Zone**: Need water at a specific location? Use Zone.
- 🏖️ **Wall-Based**: Want water at arena edges/walls? Use Wall-Based.

**All types support**:

- Slider-based adjustments
- Color picker
- Opacity control (0.1 - 1.0)
- Depth effect (0 - 10)
- Wavy animation toggle

**Maximum**: 3 water bodies per arena (any combination of types)

---

## 🚀 Quick Start

1. Open Arena Configurator
2. Go to **Water Tab**
3. Click **+ Add Moat** / **+ Add Zone** / **+ Add Wall-Based**
4. Adjust sliders to customize
5. Check live preview
6. Save arena!

All three types are fully functional with smooth slider controls! 🌊💧🏖️
