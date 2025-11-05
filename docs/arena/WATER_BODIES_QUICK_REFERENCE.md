# Water Bodies Quick Reference

## TL;DR - Water Body Types

| Type           | Icon | Purpose           | Key Feature                           |
| -------------- | ---- | ----------------- | ------------------------------------- |
| **Moat**       | 🌊   | Surrounds arena   | Follows arena shape (star/circle/etc) |
| **Zone**       | 💧   | Positioned hazard | Custom X,Y with shape options         |
| **Wall-Based** | 🏖️   | Edge water        | At arena perimeter                    |

## Quick Add Commands

```typescript
// Add Moat
+ Add Moat → Surrounds arena in its shape

// Add Zone
+ Add Zone → Position water at specific X,Y

// Add Wall-Based
+ Add Wall-Based → Water at arena edges
```

## Key Differences at a Glance

```
MOAT vs ZONE vs WALL-BASED

┌─────────────────┬─────────────┬─────────────┬─────────────┐
│ Property        │ Moat 🌊     │ Zone 💧     │ Wall-Based  │
│                 │             │             │ 🏖️          │
├─────────────────┼─────────────┼─────────────┼─────────────┤
│ Location        │ Outside     │ Inside      │ At edges    │
│                 │ arena       │ arena       │             │
├─────────────────┼─────────────┼─────────────┼─────────────┤
│ Positioning     │ Auto        │ Manual X,Y  │ Auto        │
│                 │ (surrounds) │             │ (perimeter) │
├─────────────────┼─────────────┼─────────────┼─────────────┤
│ Shape Control   │ Follows     │ Circle,     │ Follows     │
│                 │ arena shape │ Square,     │ arena shape │
│                 │ (optional)  │ Rectangle,  │             │
│                 │             │ Oval        │             │
├─────────────────┼─────────────┼─────────────┼─────────────┤
│ Thickness       │ 1-10 em     │ 2-30 em     │ 1-5 em      │
│                 │             │ (width/h)   │             │
├─────────────────┼─────────────┼─────────────┼─────────────┤
│ Best For        │ Castle moat │ Strategic   │ Beach/shore │
│                 │ Surrounding │ hazards     │ effect      │
└─────────────────┴─────────────┴─────────────┴─────────────┘
```

## Common Slider Ranges

| Property        | Range     | Default   | Description         |
| --------------- | --------- | --------- | ------------------- |
| **Color**       | Any       | `#3b82f6` | Water color (blue)  |
| **Opacity**     | 0.1 - 1.0 | 0.6       | Transparency        |
| **Depth**       | 0 - 10    | 5         | Visual depth effect |
| **Wavy Effect** | On/Off    | Off       | Animated waves      |

### Moat-Specific

| Property                | Range     | Default | Description            |
| ----------------------- | --------- | ------- | ---------------------- |
| **Thickness**           | 1 - 10 em | 3       | Width of moat          |
| **Distance from Arena** | 0 - 5 em  | 0       | Gap before moat starts |
| **Follows Arena Shape** | Yes/No    | Yes     | Match arena shape      |

### Zone-Specific

| Property       | Range         | Default | Description         |
| -------------- | ------------- | ------- | ------------------- |
| **Position X** | -25 to +25 em | 0       | Horizontal position |
| **Position Y** | -25 to +25 em | 0       | Vertical position   |
| **Width**      | 2 - 30 em     | 10      | Zone width          |
| **Height**     | 2 - 30 em     | 10      | Zone height         |
| **Rotation**   | 0 - 360°      | 0       | Rotation angle      |

### Wall-Based-Specific

| Property             | Range    | Default | Description         |
| -------------------- | -------- | ------- | ------------------- |
| **Thickness**        | 1 - 5 em | 2       | Water strip width   |
| **Offset from Edge** | 0 - 3 em | 0       | Inward distance     |
| **Covers Exits**     | Yes/No   | Yes     | Water in exit zones |

## Examples by Use Case

### 🏰 Fortress Arena

```typescript
{
  type: "moat",
  thickness: 5,
  distanceFromArena: 2,
  followsArenaShape: true,
  color: "#1e40af", // Dark blue
  opacity: 0.8
}
```

**Effect**: Wide moat around castle-like arena

### 🏖️ Beach Arena

```typescript
{
  type: "wall-based",
  thickness: 1.5,
  offsetFromEdge: 0,
  coversExits: true,
  color: "#06b6d4", // Cyan
  opacity: 0.5
}
```

**Effect**: Water lapping at arena edges like a beach

### 🎯 Strategic Hazard

```typescript
{
  type: "zone",
  position: { x: 8, y: -5 },
  shape: "circle",
  radius: 6,
  color: "#3b82f6",
  opacity: 0.7
}
```

**Effect**: Circular water hazard at specific position

### 🌟 Star Island

```typescript
// Water 1: Moat
{
  type: "moat",
  thickness: 4,
  distanceFromArena: 0,
  followsArenaShape: true, // Star-shaped moat
  color: "#0ea5e9"
}

// Water 2: Center pond
{
  type: "zone",
  position: { x: 0, y: 0 },
  shape: "circle",
  radius: 5,
  color: "#06b6d4"
}
```

**Effect**: Star-shaped island with water moat and center pond

## Pro Tips 💡

1. **Layering**: Moat → Wall-Based → Zone (render order)
2. **Contrast**: Use different colors for multiple water bodies
3. **Opacity**: Lower for subtle effects, higher for hazards
4. **Depth**: Higher values create more pronounced 3D effect
5. **Wavy Effect**: Best with opacity 0.4-0.7 for realistic look

## Keyboard Shortcuts (Future)

```
Ctrl + M  →  Add Moat
Ctrl + Z  →  Add Zone
Ctrl + W  →  Add Wall-Based
Delete    →  Remove selected water body
```

## Troubleshooting

| Issue                | Solution                             |
| -------------------- | ------------------------------------ |
| Can't add water body | Check if 3 already exist (max limit) |
| Water not visible    | Increase opacity or adjust color     |
| Wrong shape          | Check "Follows Arena Shape" setting  |
| Positioned wrong     | Adjust X,Y sliders for Zone type     |
| Too thick/thin       | Adjust thickness slider              |

## Component Usage

```typescript
import WaterBodiesTab from "./arena-tabs/WaterBodiesTab";

<WaterBodiesTab config={arenaConfig} setConfig={setArenaConfig} />;
```

## Files Created

- ✅ `arena-tabs/WaterBodiesTab.tsx` - Main component
- ✅ `arena-tabs/BasicsTab.tsx` - Basics configuration
- ✅ `ArenaConfiguratorNew.tsx` - Updated to use tabs
- ✅ `docs/arena/WATER_BODIES_VISUAL_GUIDE.md` - Visual examples
- ✅ `docs/arena/ARENA_CONFIGURATOR_REFACTORING.md` - Refactoring details

---

**Need Help?** Check the visual guide for diagrams and examples!
