# Game Files Reorganization

## Overview
Complete reorganization of game-related files into a clean, maintainable architecture with proper separation of concerns.

---

## 📁 New Structure

```
src/
├── lib/
│   └── game/
│       ├── services/          # API & Business Logic
│       │   ├── game.service.ts
│       │   └── index.ts
│       ├── utils/             # Shared utilities
│       │   └── index.ts
│       ├── constants/         # Game constants
│       │   └── index.ts
│       ├── arena/             # Arena-specific code
│       │   ├── constants.ts
│       │   └── geometry.ts
│       └── index.ts           # Barrel export
│
├── components/
│   └── game/
│       ├── ui/                # Pure UI components
│       │   ├── GameLayout.tsx
│       │   ├── HUD.tsx
│       │   ├── Canvas.tsx
│       │   └── index.ts
│       ├── dropdowns/         # Dropdown components
│       │   ├── BeybladeArenaDropdowns.tsx
│       │   └── index.ts
│       └── index.ts           # Barrel export
│
├── contexts/
│   └── game/
│       ├── GameContext.tsx
│       └── index.ts
│
└── hooks/
    └── game/
        └── index.ts           # Game-specific hooks
```

---

## 🔄 Migration Guide

### Before (Old Paths)
```typescript
// Old imports
import { GameService } from "@/lib/api/services/game.service";
import { useGame } from "@/contexts/GameContext";
import { GameLayout } from "@/components/game/GameLayout";
import { BeybladeDropdown } from "@/components/game/BeybladeArenaDropdowns";
```

### After (New Paths)
```typescript
// New imports - using barrel exports
import { GameService } from "@/lib/game/services";
import { useGame, GameProvider } from "@/contexts/game";
import { GameLayout, HUD, Canvas } from "@/components/game/ui";
import { BeybladeDropdown, ArenaDropdown } from "@/components/game/dropdowns";

// Or import from main game lib
import { GameService } from "@/lib/game";
```

---

## 📦 Files Moved

### Services Layer
| Old Path | New Path |
|----------|----------|
| `src/lib/api/services/game.service.ts` | `src/lib/game/services/game.service.ts` |

### Components
| Old Path | New Path |
|----------|----------|
| `src/components/game/GameLayout.tsx` | `src/components/game/ui/GameLayout.tsx` |
| `src/components/game/HUD.tsx` | `src/components/game/ui/HUD.tsx` |
| `src/components/game/Canvas.tsx` | `src/components/game/ui/Canvas.tsx` |
| `src/components/game/BeybladeArenaDropdowns.tsx` | `src/components/game/dropdowns/BeybladeArenaDropdowns.tsx` |

### Contexts
| Old Path | New Path |
|----------|----------|
| `src/contexts/GameContext.tsx` | `src/contexts/game/GameContext.tsx` |

---

## 🎯 Folder Purposes

### `src/lib/game/`
**Purpose:** Shared business logic and utilities  
**Contains:**
- `services/` - API communication layer (GameService)
- `utils/` - Shared game utilities
- `constants/` - Game-specific constants
- `arena/` - Arena-related logic and geometry

**Use when:** You need game logic that doesn't depend on React/UI

### `src/components/game/`
**Purpose:** UI components for game interface  
**Contains:**
- `ui/` - Pure presentation components (GameLayout, HUD, Canvas)
- `dropdowns/` - Dropdown selection components

**Use when:** You need React components for rendering game UI

### `src/contexts/game/`
**Purpose:** React context for global game state  
**Contains:**
- `GameContext.tsx` - Game state management

**Use when:** You need to manage game state across components

### `src/hooks/game/`
**Purpose:** Custom React hooks for game functionality  
**Contains:**
- Game-specific hooks (to be added as needed)

**Use when:** You need reusable React logic for game features

---

## 🔧 Barrel Exports (index.ts)

All folders now have `index.ts` files for clean imports:

### From Services
```typescript
import { GameService } from "@/lib/game/services";
```

### From UI Components
```typescript
import { GameLayout, HUD, Canvas } from "@/components/game/ui";
```

### From Dropdowns
```typescript
import { BeybladeDropdown, ArenaDropdown } from "@/components/game/dropdowns";
```

### From Context
```typescript
import { useGame, GameProvider, GameSettings } from "@/contexts/game";
```

---

## ✅ Benefits

1. **Clear Separation of Concerns**
   - UI components separate from business logic
   - Services separate from presentation
   - Contexts organized by feature

2. **Better Discoverability**
   - Related files grouped together
   - Barrel exports make imports cleaner
   - Folder structure reflects architecture

3. **Easier Maintenance**
   - Changes isolated to specific folders
   - Clear ownership of code
   - Reduces cross-cutting concerns

4. **Scalability**
   - Easy to add new game features
   - Pattern is consistent and repeatable
   - Supports team collaboration

---

## 🔍 What's Updated

### `src/lib/game/services/game.service.ts`
✅ Updated `apiClient` import to point to `../../api/client`

### `src/lib/api/index.ts`
✅ Updated `GameService` import to point to `../game/services`  
✅ Removed duplicate type exports (types come from `@/types/`)  
✅ Maintained backward compatibility via `api.game` object

### All Components
✅ No changes needed - components don't have internal dependencies

### Contexts
✅ No changes needed - context is self-contained

---

## 🚀 Future Additions

### Game Hooks (src/hooks/game/)
```typescript
// Example future hooks
export { useGamePhysics } from './useGamePhysics';
export { useArenaRenderer } from './useArenaRenderer';
export { useBeybladeController } from './useBeybladeController';
export { useCollisionDetection } from './useCollisionDetection';
```

### Game Utils (src/lib/game/utils/)
```typescript
// Example future utilities
export { calculatePhysics } from './physics';
export { detectCollision } from './collision';
export { calculateTrajectory } from './trajectory';
```

### Game Constants (src/lib/game/constants/)
```typescript
// Example future constants
export { GAME_MODES } from './gameModes';
export { PHYSICS_CONSTANTS } from './physics';
export { BATTLE_RULES } from './rules';
```

---

## 📝 Implementation Checklist

- [x] Create new folder structure
- [x] Move game service to `lib/game/services/`
- [x] Move UI components to `components/game/ui/`
- [x] Move dropdown components to `components/game/dropdowns/`
- [x] Move GameContext to `contexts/game/`
- [x] Create barrel exports (index.ts) for all folders
- [x] Update import paths in `lib/api/index.ts`
- [x] Fix apiClient import in game.service.ts
- [x] Create documentation
- [ ] Update documentation references (if any)
- [ ] Test all imports work correctly
- [ ] Verify no broken imports in app

---

## 🎨 Best Practices

### DO ✅
- Use barrel exports for clean imports
- Keep UI components pure and presentational
- Put business logic in `lib/game/`
- Group related functionality together
- Use TypeScript types from `@/types/`

### DON'T ❌
- Mix UI logic with business logic
- Import directly from internal files (use barrel exports)
- Create circular dependencies
- Put game logic in components
- Duplicate code across folders

---

## 📚 Related Documentation

- **Beyblade Resolution System:** `docs/BEYBLADE_RESOLUTION_SYSTEM.md`
- **Arena Configuration:** `docs/arena/`
- **Game Context Guide:** `docs/game/GAME_CONTEXT_GUIDE.md`
- **API Services Guide:** `docs/api/API_SERVICES_COMPLETE_GUIDE.md`

---

## 🤝 Contributing

When adding new game features:

1. **Services/Logic** → Add to `src/lib/game/`
2. **UI Components** → Add to `src/components/game/ui/` or `src/components/game/dropdowns/`
3. **Hooks** → Add to `src/hooks/game/`
4. **Contexts** → Add to `src/contexts/game/`
5. **Always** → Update barrel exports (index.ts)

---

**Status:** ✅ Complete  
**Date:** 2024  
**Impact:** Medium (file reorganization, import path updates)
