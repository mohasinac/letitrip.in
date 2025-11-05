# Database Initialization Fix

## Problem

The game selection page showed "No Beyblades available" and "No Arenas available" because the Firestore database was empty.

## Solution

Created database initialization system with default game data.

## Files Created

### 1. Default Data (`src/constants/beybladeStatsData.ts`)

- 8 default beyblades with proper `BeybladeStats` interface
- Includes popular beyblades: Pegasus, L-Drago, Leone, Bull, Virgo, Eagle, Libra, Sagittario
- Each with proper type distribution (360 points total)
- Balanced mix of types: Attack, Defense, Stamina, and Balanced

### 2. Init API Endpoint (`src/app/(backend)/api/beyblades/init/route.ts`)

- POST endpoint to initialize default beyblades
- Checks for existing data to avoid duplicates
- Uses batch writes for efficiency
- Public access (no auth required for setup)

### 3. Init UI Page (`src/app/game/init/page.tsx`)

- User-friendly initialization interface
- Initializes both beyblades and arenas with one click
- Shows detailed results
- Provides links to game selection and admin pages

### 4. Selection Page Enhancement (`src/app/game/tryout/select/page.tsx`)

- Added check for empty database
- Shows helpful message with link to initialization
- Better UX for first-time setup

## How to Use

### Option 1: Manual API Calls

```bash
# Initialize beyblades
curl -X POST http://localhost:3000/api/beyblades/init

# Initialize arenas
curl -X POST http://localhost:3000/api/arenas/init
```

### Option 2: UI Page (Recommended)

1. Navigate to: `http://localhost:3000/game/init`
2. Click "Initialize Game Data"
3. Wait for success message
4. Click "Go to Game Selection"

### Option 3: From Selection Page

1. Navigate to: `http://localhost:3000/game/tryout/select`
2. If no data, you'll see "Database Not Initialized" message
3. Click "Initialize Game Data"
4. Return to selection page after initialization

## Default Beyblades Included

| Beyblade         | Type     | Spin  | Attack | Defense | Stamina |
| ---------------- | -------- | ----- | ------ | ------- | ------- |
| Storm Pegasus    | Attack   | Right | 150    | 105     | 105     |
| L-Drago          | Attack   | Left  | 140    | 110     | 110     |
| Rock Leone       | Defense  | Right | 105    | 150     | 105     |
| Earth Bull       | Defense  | Right | 100    | 145     | 115     |
| Flame Virgo      | Stamina  | Right | 105    | 105     | 150     |
| Thermal Eagle    | Stamina  | Right | 110    | 100     | 150     |
| Flame Libra      | Balanced | Right | 120    | 120     | 120     |
| Flame Sagittario | Balanced | Right | 125    | 115     | 120     |

## Default Arena Included

**Classic Stadium**

- Shape: Circle
- Theme: Metro City
- Size: 50x50em
- 2 circular loops for strategic gameplay
- Wall protection enabled
- Easy difficulty
- Perfect for beginners

## Next Steps

After initialization:

1. Visit `/game/tryout/select` to choose your beyblade and arena
2. Visit `/admin/game/beyblades` to create custom beyblades
3. Visit `/admin/game/arenas` to create custom arenas (if admin panel exists)

## Database Collections

- **Beyblades**: `beybladeStats`
- **Arenas**: `arenas`

Both collections are now properly populated and ready for gameplay!
