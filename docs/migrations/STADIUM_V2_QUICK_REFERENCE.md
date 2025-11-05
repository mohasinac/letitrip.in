# Stadium Management V2 - Quick Reference

## 🎯 What You Need to Know

### Routes (Updated)

| Action            | Route                            | Method |
| ----------------- | -------------------------------- | ------ |
| List all stadiums | `/admin/game/stadiums`           | GET    |
| Create stadium    | `/admin/game/stadiums/create`    | GET    |
| Edit stadium      | `/admin/game/stadiums/edit/[id]` | GET    |

**Old v2 routes removed** - `/admin/game/stadiums-v2/*` no longer exist

### API Endpoints

| Endpoint           | Method | Description                      |
| ------------------ | ------ | -------------------------------- |
| `/api/arenas`      | GET    | Get all arenas (auto-migrated)   |
| `/api/arenas`      | POST   | Create new arena (v2 schema)     |
| `/api/arenas/[id]` | GET    | Get single arena (auto-migrated) |
| `/api/arenas/[id]` | PUT    | Update arena (v2 schema)         |
| `/api/arenas/[id]` | DELETE | Delete arena                     |

### Schema Quick Comparison

#### V2 Schema (Current)

```typescript
{
  name: string;
  width: number;          // Usually 1080
  height: number;         // Usually 1080
  shape: ArenaShape;      // circle, square, hexagon, etc.
  theme: ArenaTheme;      // metrocity, desert, snow, etc.

  // Rotation
  autoRotate: boolean;
  rotationSpeed: number;
  rotationDirection: 'clockwise' | 'counterclockwise';

  // Edge-based walls
  wall: {
    enabled: boolean;
    edges: EdgeWallConfig[];  // One per edge
  };

  // Features
  speedPaths: SpeedPathConfig[];
  portals: PortalConfig[];
  waterBodies: WaterBodyConfig[];
  pits: PitConfig[];

  difficulty: 'easy' | 'medium' | 'hard';
}
```

### Wall Structure

**Edge counts by shape:**

- Circle: 1
- Triangle: 3
- Square: 4
- Pentagon: 5
- Hexagon: 6
- Octagon: 8
- Star5: 10

**Each edge can have 1-3 walls:**

```typescript
{
  walls: [
    {
      width: 100, // % of edge (0-100)
      thickness: 1, // em units
      position: 0, // position along edge (0-100)
    },
  ];
}
```

### Feature Sizes (Resolution-Aware)

For 1080x1080 arena:

| Feature    | Default Size      | Min  | Max  |
| ---------- | ----------------- | ---- | ---- |
| Portal     | 43.2 units (4%)   | 10.8 | 108  |
| Crater Pit | 32.4 units (3%)   | 5.4  | 86.4 |
| Edge Pit   | 16.2 units (1.5%) | 5.4  | 86.4 |
| Water Body | 27 units (2.5%)   | 10.8 | 540  |

**All sizes scale with arena resolution!**

### Coordinate System

**Center-relative:**

- `(0, 0)` = Center of arena
- `(100, 0)` = 100 units right of center
- `(-100, 100)` = 100 units left, 100 units down

**NOT absolute coordinates** (top-left origin)

### Migration Status

✅ **Automatic** - Old arenas auto-migrate on load

- Wall structure initialized if missing
- Edge-based system created from shape
- No manual intervention needed

### Common Tasks

#### Create New Stadium

1. Navigate to `/admin/game/stadiums`
2. Click "Create New Stadium"
3. Configure in tabs: Basics, Speed Paths, Portals, Water Bodies, Pits
4. Preview updates in real-time
5. Click "Save Arena"

#### Edit Existing Stadium

1. Navigate to `/admin/game/stadiums`
2. Click "Edit" on any stadium
3. Modify in tabs
4. Click "Save Arena"

#### Delete Stadium

1. Navigate to `/admin/game/stadiums`
2. Click "Delete" on any stadium
3. Confirm deletion

### Troubleshooting

#### "wall.edges is undefined"

**Fixed!** Preview components now handle missing edges gracefully.

#### Portal/Pit too small

**Fixed!** Sizes now resolution-aware (4% and 3% of arena).

#### Old stadium won't load

**Migration runs automatically** - check browser console for errors.

#### Changes not saving

Check API response - should see v2 schema with `wall.edges` array.

### Browser Testing

1. **Hard refresh:** Ctrl+Shift+R (clear cache)
2. **Check console:** F12 → Console tab
3. **Check network:** F12 → Network tab
4. **Test preview:** Features should be clearly visible

---

**Quick Start:**

1. Go to `/admin/game/stadiums`
2. Click "Create New Stadium"
3. Configure and save!

**Everything else is handled automatically!** ✨
