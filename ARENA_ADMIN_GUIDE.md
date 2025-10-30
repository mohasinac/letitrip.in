# Arena Admin Page - Quick Guide

## 🏟️ Arena Management System

Complete admin interface for creating and managing battle arenas with live preview.

---

## 📍 Access

**URL**: `/admin/arenas`

---

## ✨ Features

### 1. **Live Preview**

- Canvas-based rendering of arena configurations
- Real-time visualization of all features:
  - Arena shape and boundaries
  - Speed boost loops (with custom shapes)
  - Obstacles and hazards
  - Water bodies
  - Pits and traps
  - Laser guns
  - Goal objects
  - Exits (green dashed lines)

### 2. **Arena Cards**

Each arena displays:

- Live preview thumbnail
- Name and description
- Shape icon and theme
- Loop count
- Hazard count (obstacles + pits + lasers)
- Difficulty badge
- Feature tags (spikes, springs, water, exits, goals)
- Quick action buttons (Preview, Edit, Set Default, Delete)

### 3. **Arena Creator**

Full-featured configuration editor with 6 tabs:

- **Basic**: Shape, theme, game mode, walls
- **Loops & Exits**: Speed zones with custom shapes
- **Hazards**: Obstacles, pits, water, lasers
- **Goals**: Objective-based gameplay
- **Theme**: Visual styling
- **Preview**: Live preview and JSON export

### 4. **Default Arena**

- First arena marked with green "DEFAULT" badge
- Used for new games
- Can be changed by clicking ⭐ button

---

## 🚀 Getting Started

### Initialize Default Arena

**Option 1: Via API**

```bash
curl -X POST http://localhost:3000/api/arenas/init
```

**Option 2: Via Admin UI**

1. Visit `/admin/arenas`
2. Click "Create New Arena"
3. Load "Classic Stadium" preset
4. Save

---

## 🎨 Creating Arenas

### Quick Create (Preset)

1. Click "+ Create New Arena"
2. Click preset button (Classic Stadium, Hazard Zone, Water World)
3. Modify as needed
4. Save

### Custom Create

1. **Basic Tab**:

   - Enter name and description
   - Select shape (circle, rectangle, pentagon, hexagon, octagon, star, oval, loop)
   - Choose theme (10 options)
   - Select game mode
   - Configure walls (damage, recoil, spikes, springs)

2. **Loops Tab**:

   - Click "+ Add Loop"
   - Select loop shape (independent of arena shape!)
   - Set radius/size
   - Configure width/height (for rectangles)
   - Set rotation angle
   - Choose color
   - Adjust speed boost and spin boost

3. **Hazards Tab**:

   - Generate random obstacles (5-15 rocks, pillars, barriers)
   - Generate pits (edges/center/random placement)
   - Enable water body (center circle or loop path)
   - Add laser guns (coming soon)

4. **Goals Tab**:

   - Add goal objects for objective mode
   - Configure health and score values
   - Set win condition (destroy all goals)

5. **Theme Tab**:

   - Fine-tune visual appearance
   - Add background layers (coming soon)

6. **Preview Tab**:
   - See live preview
   - View configuration summary
   - Export JSON

### Save

- Validates configuration
- Shows errors if any
- Saves to database
- Redirects to arena list

---

## 🎮 Arena Properties

### Required

- **Name**: Unique identifier
- **Shape**: Arena boundary shape
- **Theme**: Visual style
- **Game Mode**: player-vs-ai, player-vs-player, single-player-test

### Optional

- **Description**: Flavor text
- **Loops**: 0-10 speed zones
- **Exits**: Boundary openings
- **Obstacles**: 0-50 objects
- **Pits**: Unlimited traps
- **Water**: Center pool or loop path
- **Laser Guns**: 0-10 turrets
- **Goal Objects**: 0-20 objectives

---

## 📊 Arena Stats Dashboard

Top of page shows:

- **Total Arenas**: Count of all arenas
- **With Hazards**: Arenas containing obstacles/pits
- **With Loops**: Arenas with speed zones
- **With Goals**: Arenas with objectives

---

## 🔧 Managing Arenas

### Preview

- Click "👁️ Preview" button
- Opens full-size canvas preview
- Shows all features in detail

### Edit

- Click "✏️ Edit" button
- Opens configurator with current settings
- Make changes and save

### Set as Default

- Click "⭐" button
- Marks arena as default
- Used for all new games
- Only one default at a time

### Delete

- Click "🗑️" button
- Confirms before deletion
- Cannot be undone
- Refreshes list

---

## 🎯 Use Cases

### 1. **Classic Mode**

```
- Circle shape
- 2 circular loops
- No hazards
- Simple walls
```

### 2. **Hazard Challenge**

```
- Octagon shape
- 3 shaped loops (octagon, hexagon, circle)
- Spiked walls with springs
- Multiple pits
- Laser guns
- 4 exits
```

### 3. **Water Arena**

```
- Circle shape
- 1 loop
- Central water body
- Reduced speed in water
- Spin drain effect
```

### 4. **Objective Mode**

```
- Any shape
- Goal objects (towers, crystals, relics)
- Win by destroying all goals
- Strategic gameplay
```

---

## 🔍 Search & Filter

Coming soon:

- Filter by shape
- Filter by theme
- Filter by difficulty
- Search by name

---

## 📱 Responsive Design

- Grid layout adapts to screen size
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns
- Preview scales automatically

---

## 🚨 Validation

Arena validator checks:

- ✅ Positive dimensions
- ✅ Max 10 loops
- ✅ Max 50 obstacles
- ✅ Max 10 laser guns
- ✅ Max 20 goal objects
- ✅ Loop spacing (minimum 2em apart)

---

## 💾 Data Storage

- **Database**: Firestore
- **Collection**: `arenas`
- **Document ID**: Generated from name (lowercase_with_underscores)
- **Fields**: Full ArenaConfig object
- **Metadata**: createdAt, updatedAt, createdBy

---

## 🎨 Theme Colors

Each theme has unique gradient:

- **Forest**: Green tones
- **Mountains**: Gray/blue
- **Grasslands**: Bright green
- **Metrocity**: Steel blue
- **Safari**: Tan/brown
- **Prehistoric**: Dark brown
- **Futuristic**: Purple
- **Desert**: Sandy orange
- **Sea**: Cyan blue
- **Riverbank**: Teal

---

## 🏗️ Technical Details

### Components

- `ArenasAdmin` - Main page component
- `ArenaConfigurator` - Configuration editor modal
- `ArenaPreview` - Canvas-based renderer

### API Endpoints

- `GET /api/arenas` - List all arenas
- `POST /api/arenas` - Create arena
- `GET /api/arenas/[id]` - Get specific arena
- `PUT /api/arenas/[id]` - Update arena
- `DELETE /api/arenas/[id]` - Delete arena
- `POST /api/arenas/[id]/set-default` - Set as default
- `POST /api/arenas/init` - Initialize default arena

### Services

- `arenaService.ts` - Firebase CRUD operations
- `arenaConfig.ts` - Type definitions and validation

---

## 🎉 Quick Tips

1. **Start with presets** - Modify existing templates
2. **Use loops strategically** - Different shapes create unique patterns
3. **Balance difficulty** - Mix hazards carefully
4. **Test before saving** - Use preview tab
5. **Name clearly** - Descriptive names help organization
6. **Set default** - Mark your favorite as default

---

## 📚 Related Docs

- [ARENA_SYSTEM_GUIDE.md](../ARENA_SYSTEM_GUIDE.md) - Complete technical guide
- [QUICK_REFERENCE_ARENA.md](../QUICK_REFERENCE_ARENA.md) - Feature reference
- [arenaConfig.ts](../src/types/arenaConfig.ts) - Type definitions

---

**Ready to create amazing battle arenas!** 🏟️⚡
