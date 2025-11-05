# Water Bodies Visual Guide

## Water Body Types Comparison

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        WATER BODY TYPES                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐
│   1. MOAT WATER BODY     │  │   2. ZONE WATER BODY     │  │ 3. WALL-BASED WATER BODY │
│          🌊              │  │          💧              │  │          🏖️             │
└──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘

Surrounds entire arena      Positioned water hazard      Water at arena edges
Follows arena shape         Custom shape & position      Follows arena perimeter
```

## 1. Moat Water Body 🌊

### Star Arena with Star Moat (followsArenaShape: true)

```
                    ⭐
                   / \
          ~~~~~~~~~   ~~~~~~~~~
         ~                     ~
        ~         ⬛⬛⬛         ~
       ~        ⬛ STAR ⬛        ~
        ~       ⬛ARENA⬛       ~
         ~        ⬛⬛⬛        ~
          ~~~~~~~~~   ~~~~~~~~~
                   \ /
                    ⭐

Legend:
⬛ = Arena (star shape)
~ = Water Moat (follows star shape)
```

### Star Arena with Circle Moat (followsArenaShape: false)

```
            ~~~~~~~~~~~~
        ~~~              ~~~
      ~~     ⭐ STAR ⭐     ~~
     ~       ARENA          ~
     ~     (star shape)     ~
      ~~                  ~~
        ~~~              ~~~
            ~~~~~~~~~~~~

Legend:
⭐ STAR ARENA = Arena (star shape)
~ = Water Moat (circular, ignores arena shape)
```

### Circle Arena with Circle Moat

```
            ~~~~~~~~~~~~
        ~~~              ~~~
      ~~                   ~~
     ~       ⭕ ARENA       ~
     ~       (circle)       ~
      ~~                  ~~
        ~~~              ~~~
            ~~~~~~~~~~~~

Legend:
⭕ = Arena (circle shape)
~ = Water Moat (circular)
```

### Configuration Example:

```typescript
{
  id: "water1",
  type: "moat",
  thickness: 3,              // Width of moat
  distanceFromArena: 0,      // Gap between arena and moat
  followsArenaShape: true,   // Matches arena shape
  color: "#3b82f6",
  opacity: 0.6
}
```

## 2. Zone Water Body 💧

### Circle Arena with Square Zone at Center

```
        ⭕⭕⭕⭕⭕⭕⭕⭕⭕
      ⭕               ⭕
     ⭕     ┌─────┐     ⭕
    ⭕      │~~~~~│      ⭕
    ⭕      │~~~~~│      ⭕
    ⭕      │~~~~~│      ⭕
     ⭕     └─────┘     ⭕
      ⭕               ⭕
        ⭕⭕⭕⭕⭕⭕⭕⭕⭕

Legend:
⭕ = Arena boundary (circle)
┌─────┐ = Square water zone
~ = Water inside square zone
Position: (0, 0) - center
```

### Square Arena with Oval Zone (Off-Center)

```
    ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
    ⬜                ⬜
    ⬜                ⬜
    ⬜                ⬜
    ⬜      ╭───╮     ⬜
    ⬜      │~~~│     ⬜
    ⬜      ╰───╯     ⬜
    ⬜                ⬜
    ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜

Legend:
⬜ = Arena boundary (square)
╭───╮ = Oval water zone
~ = Water inside oval
Position: (5, -3) - off-center
```

### Configuration Example:

```typescript
{
  id: "water2",
  type: "zone",
  position: { x: 0, y: 0 },  // Center of arena
  shape: "square",
  width: 10,
  height: 10,
  rotation: 0,
  color: "#06b6d4",
  opacity: 0.7
}
```

## 3. Wall-Based Water Body 🏖️

### Circle Arena with Wall-Based Water

```
        ⭕~~⭕~~⭕~~⭕
      ⭕~             ~⭕
     ⭕~               ~⭕
    ⭕~                 ~⭕
    ⭕~                 ~⭕
    ⭕~                 ~⭕
     ⭕~               ~⭕
      ⭕~             ~⭕
        ⭕~~⭕~~⭕~~⭕

Legend:
⭕ = Arena boundary (circle)
~ = Water at edges (follows circle shape)
[Space] = Dry arena center
```

### Star Arena with Wall-Based Water

```
                ⭐
               /~~\
      ⭐~~~~~~⭐    ⭐~~~~~~⭐
       ~~              ~~
        ~~            ~~
         ⭐~~~~~~~~~~⭐

Legend:
⭐ = Arena walls/edges (star shape)
~ = Water at edges (follows star shape)
```

### Square Arena with Wall-Based Water (coversExits: true)

```
    ⬜~~~~~~~~~~⬜
    ⬜~        ~⬜
    ⬜~        ~⬜
    ~~         ~~  ← Water covers exits too
    ⬜~        ~⬜
    ⬜~        ~⬜
    ⬜~~~~~~~~~~⬜

Legend:
⬜ = Arena walls (square)
~ = Water at edges + exits
[Space] = Dry arena center
```

### Configuration Example:

```typescript
{
  id: "water3",
  type: "wall-based",
  thickness: 2,           // Width of water strip
  offsetFromEdge: 0,      // Distance from edge inward
  coversExits: true,      // Water also in exit zones
  color: "#14b8a6",
  opacity: 0.5
}
```

## Combined Water Bodies Example

### Arena with All 3 Types

```
        ~~~MOAT~~~           ← Moat (surrounds everything)
      ~~          ~~
     ~  ⭕W⭕W⭕W⭕  ~         ← Wall-based (W = water at edges)
    ~  ⭕          ⭕  ~
    ~ W    ┌──┐    W ~      ← Zone (square water at center)
    ~ ⭕    │~~│    ⭕ ~
    ~  ⭕W  └──┘  W⭕  ~
     ~   ⭕⭕⭕⭕⭕   ~
      ~~          ~~
        ~~~MOAT~~~

Legend:
~ = Moat water (outer ring)
⭕ = Arena boundary
W = Wall-based water (at arena edges)
┌──┐ = Zone water (positioned)
~~ = Water in zone

This arena has:
1. Moat: Surrounds entire arena
2. Wall-based: Water at arena edges
3. Zone: Square water at center
```

## Slider Controls Overview

```
┌─────────────────────────────────────────────────────┐
│ MOAT WATER BODY CONTROLS                            │
├─────────────────────────────────────────────────────┤
│ Thickness:       [====|----]  3 em    (1-10)       │
│ Distance:        [|---------]  0 em    (0-5)       │
│ Follows Shape:   [✓] Yes  [ ] No                    │
│ Color:           [🎨 #3b82f6]                       │
│ Opacity:         [======|--]  0.60    (0.1-1.0)    │
│ Depth:           [=====|---]  5       (0-10)       │
│ Wavy Effect:     [✓] Enabled                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ZONE WATER BODY CONTROLS                            │
├─────────────────────────────────────────────────────┤
│ Position X:      [-------|--]  0.0 em               │
│ Position Y:      [-------|--]  0.0 em               │
│ Shape:           [Square ▼]                         │
│ Width:           [===|------]  10 em   (2-30)      │
│ Height:          [===|------]  10 em   (2-30)      │
│ Rotation:        [|--------]   0°      (0-360)     │
│ Color:           [🎨 #06b6d4]                       │
│ Opacity:         [=======|-]  0.70    (0.1-1.0)    │
│ Depth:           [======|--]  6       (0-10)       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ WALL-BASED WATER BODY CONTROLS                      │
├─────────────────────────────────────────────────────┤
│ Thickness:       [==|-------]  2 em    (1-5)       │
│ Offset:          [|--------]   0 em    (0-3)       │
│ Covers Exits:    [✓] Yes  [ ] No                    │
│ Color:           [🎨 #14b8a6]                       │
│ Opacity:         [=====|---]  0.50    (0.1-1.0)    │
│ Depth:           [====|----]  4       (0-10)       │
└─────────────────────────────────────────────────────┘
```

## Real-World Use Cases

### 1. Fortress Arena

```
Moat (circular, thick) + Zone (rectangle at center)
= Castle with moat and inner courtyard water
```

### 2. Beach Arena

```
Wall-based (thin, covers exits)
= Water lapping at the arena edges
```

### 3. Island Arena

```
Moat (follows shape, star) + Wall-based (thin, no exits)
= Island arena surrounded by ocean with shore water
```

### 4. Hazard Course

```
Zone (multiple squares/circles at different positions)
= Strategic water hazards to avoid
```

## Implementation Notes

- Maximum 3 water bodies per arena
- Water bodies are rendered in order (water1, water2, water3)
- Each type has different visual effects
- Moat always renders outside arena boundary
- Zone can overlap with other elements
- Wall-based always at arena perimeter
- All use sliders for precise control
- Real-time preview updates
