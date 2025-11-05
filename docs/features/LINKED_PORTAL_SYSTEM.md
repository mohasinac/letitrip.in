# Linked Portal System

## Overview

The arena now supports a **Linked Portal System** where up to **4 portals** can be placed in the arena. All portals are interconnected, meaning entering any portal can teleport the player to any of the other portals based on **directional input** or **randomly** if no input is provided.

## Key Features

### 1. **Up to 4 Portals**

- Previously: Maximum 2 portals (IN/OUT pairs)
- Now: Maximum 4 linked portals
- Each portal is a single point (no separate IN/OUT)
- All portals are interconnected

### 2. **Directional Teleportation**

When a player enters a portal, the destination is determined by:

- **Directional Input (↑/↓/←/→)**: Player chooses destination based on direction
- **No Input**: Random teleportation to one of the other portals

### 3. **Auto-Placement**

Portals can be auto-placed at equal angles from the center:

- **2 Portals**: 0° and 180° (opposite sides)
- **3 Portals**: 0°, 120°, and 240° (equilateral triangle)
- **4 Portals**: 0°, 90°, 180°, and 270° (square formation)

### 4. **Visual Distinction**

Each portal has a unique color:

- **Portal 1**: Purple (#8b5cf6)
- **Portal 2**: Pink (#ec4899)
- **Portal 3**: Green (#10b981)
- **Portal 4**: Amber (#f59e0b)

## Configuration

### PortalConfig Interface

```typescript
export interface PortalConfig {
  id: string; // 'portal1', 'portal2', 'portal3', or 'portal4'
  portalNumber?: number; // Portal number for display (1-4)
  position: { x: number; y: number }; // Portal position (em units, relative to center)
  radius: number; // Visual size (em units)
  cooldown?: number; // Seconds before can be used again (default: 0)
  color?: string; // Visual color
  autoPlace?: boolean; // Auto-place at equal angles from center
  distanceFromCenter?: number; // Distance from center (em units) for auto-placement
  angle?: number; // Angle from center (degrees) for auto-placement
}
```

### Changes from Previous System

#### Old System (Portal Pairs)

```typescript
interface PortalConfig {
  inPoint: { x: number; y: number }; // Entry point
  outPoint: { x: number; y: number }; // Exit point
  bidirectional?: boolean;
  // Max 2 portals
}
```

#### New System (Linked Portals)

```typescript
interface PortalConfig {
  position: { x: number; y: number }; // Single position
  // No inPoint/outPoint - all portals are linked
  // Max 4 portals
}
```

## Usage in Arena Configurator

### Auto-Place Portal

1. Click "Auto-Place Portal" button
2. Portal is positioned at next available angle (0°, 90°, 180°, 270°)
3. Distance from center can be adjusted
4. All portals maintain equal distance from center

### Manual Portal

1. Click "+ Manual Portal" button
2. Manually set X and Y position
3. Portal can be placed anywhere within arena bounds

### Configuration Options

- **Position X/Y**: Manual coordinates relative to center
- **Distance from Center**: For auto-placed portals
- **Radius**: Visual size of portal (1-10 em)
- **Color**: Custom color for the portal
- **Cooldown**: Time before portal can be used again

## Game Mechanics

### Teleportation Logic

```typescript
function getTeleportDestination(
  enteredPortal: number,
  direction: "up" | "down" | "left" | "right" | null,
  portals: PortalConfig[]
): number {
  // Remove the entered portal from available destinations
  const availablePortals = portals.filter(
    (p) => p.portalNumber !== enteredPortal
  );

  if (!direction) {
    // Random teleportation
    return availablePortals[Math.floor(Math.random() * availablePortals.length)]
      .portalNumber;
  }

  // Directional teleportation
  // Map direction to portal based on their angles relative to entered portal
  // Implementation in game server
}
```

### Example Scenarios

#### 2 Portals

- Enter Portal 1 → Teleport to Portal 2
- Enter Portal 2 → Teleport to Portal 1
- Direction doesn't matter (only one destination)

#### 3 Portals

- Enter Portal 1 with no input → Random between Portal 2 and 3
- Enter Portal 1 with ↑ → Portal closest to up direction
- Enter Portal 1 with → → Portal closest to right direction

#### 4 Portals (Square Formation)

- Enter Portal 1 (0°) with ↑ → Portal 2 (90°)
- Enter Portal 1 (0°) with ← → Portal 3 (180°)
- Enter Portal 1 (0°) with ↓ → Portal 4 (270°)
- Enter Portal 1 (0°) with no input → Random between 2, 3, 4

## Visual Rendering

### Portal Appearance

- **Whirlpool effect** with spiraling particles
- **Numbered display** (1, 2, 3, or 4) in center
- **Colored outer ring** for quick identification
- **Animated particles** flowing inward
- **Label** showing "Portal X" above

### Connection Indicators

- In preview, portals are shown with their positions
- No connection lines (since all are linked)
- Portal numbers make it easy to identify each portal

## Migration from Old System

Old arenas with 2-portal system will need to be updated:

- `inPoint` → `position` (use inPoint position)
- Remove `outPoint` (not needed)
- Remove `bidirectional` (all portals are now linked)
- Set `angle` based on position for auto-placed portals

## Benefits of Linked Portal System

1. **More Strategic Gameplay**: Players can choose destinations
2. **Increased Complexity**: 4 portals create more tactical options
3. **Balanced Auto-Placement**: Equal angles create symmetry
4. **Simplified Logic**: No need to track IN/OUT pairs
5. **Better UX**: Directional input feels more intuitive

## Future Enhancements

Potential improvements:

- **Portal Cooldowns**: Individual cooldown timers per portal
- **One-Way Portals**: Optional directional restrictions
- **Portal Chains**: Sequential teleportation through multiple portals
- **Custom Mapping**: Manual destination assignment per portal
- **Portal Effects**: Visual effects on teleportation (flash, sound, etc.)
