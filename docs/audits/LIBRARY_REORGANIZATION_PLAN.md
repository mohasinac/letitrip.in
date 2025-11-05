# Library Reorganization Plan

## Date: November 4, 2025

## 🎯 Goals

1. **Organize contexts** - Move from `src/contexts` to `src/lib/contexts`
2. **Organize hooks** - Move from `src/hooks` to `src/lib/hooks`
3. **Consolidate utils** - Merge `src/utils` into `src/lib/utils`
4. **Extract game logic** - Move game-related logic to `src/lib/game`

## 📁 New Structure

```
src/lib/
├── api/                    # API client & services (existing)
├── contexts/               # React contexts (NEW)
│   ├── index.ts           # Export all contexts
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   ├── WishlistContext.tsx
│   ├── CurrencyContext.tsx
│   ├── ThemeContext.tsx
│   └── BreadcrumbContext.tsx
├── hooks/                  # React hooks (NEW)
│   ├── index.ts           # Export all hooks
│   ├── auth/              # Auth hooks
│   │   ├── index.ts
│   │   ├── useAuthRedirect.ts
│   │   └── useEnhancedAuth.ts
│   ├── data/              # Data fetching hooks
│   │   ├── index.ts
│   │   ├── useApiProducts.ts
│   │   ├── useApiCart.ts
│   │   ├── useApiCategories.ts
│   │   └── useRealTimeData.ts
│   └── common/            # Common utility hooks
│       ├── index.ts
│       ├── useAddresses.ts
│       ├── useBreadcrumbTracker.ts
│       ├── useCookie.ts
│       ├── useIsAdminRoute.ts
│       ├── useOrders.ts
│       ├── useProducts.ts
│       └── useReviews.ts
├── game/                   # Game logic (NEW)
│   ├── index.ts           # Export all game modules
│   ├── hooks/             # Game-specific hooks
│   │   ├── index.ts
│   │   ├── useGameState.ts
│   │   ├── useMultiplayer.ts
│   │   ├── useArenas.ts
│   │   └── useBeyblades.ts
│   ├── physics/           # Physics & collision
│   │   ├── index.ts
│   │   ├── gamePhysics.ts
│   │   ├── collision.ts
│   │   ├── enhancedCollision.ts
│   │   └── vectorUtils.ts
│   ├── rendering/         # Canvas rendering
│   │   ├── index.ts
│   │   ├── arenaRenderer.ts
│   │   └── beybladeRenderer.ts
│   ├── moves/             # Special moves & abilities
│   │   ├── index.ts
│   │   ├── specialMovesManager.ts
│   │   └── cinematicSpecialMoves.ts
│   ├── ui/                # Game UI utilities
│   │   ├── index.ts
│   │   ├── floatingNumbers.ts
│   │   └── visualIndicators.ts
│   ├── multiplayer/       # Multiplayer logic
│   │   ├── index.ts
│   │   └── gameServer.ts
│   ├── types/             # Game-specific types
│   │   ├── index.ts
│   │   ├── game.ts
│   │   ├── multiplayer.ts
│   │   ├── arenaConfig.ts
│   │   └── beybladeStats.ts
│   └── utils/             # Game utilities
│       ├── index.ts
│       ├── beybladeUtils.ts
│       └── collisionUtils.ts
├── storage/                # Storage utilities (existing)
├── utils/                  # General utilities (CONSOLIDATED)
│   ├── index.ts           # Export all utilities
│   ├── date.ts
│   ├── format.ts
│   ├── guestCart.ts
│   ├── mobile.ts
│   ├── navigation.ts
│   ├── pathGeneration.ts
│   ├── performance.ts
│   ├── product.ts
│   ├── responsive.ts
│   └── validation.ts
├── validations/            # Zod schemas (existing)
├── seo/                    # SEO utilities (existing)
└── utils.ts                # Common utils (existing)
```

## 📦 Migration Steps

### Step 1: Create New Directory Structure

- [x] Create `src/lib/contexts/`
- [x] Create `src/lib/hooks/auth/`
- [x] Create `src/lib/hooks/data/`
- [x] Create `src/lib/hooks/common/`
- [x] Create `src/lib/game/` with subdirectories

### Step 2: Move Contexts

- [ ] Move all files from `src/contexts/` to `src/lib/contexts/`
- [ ] Create `src/lib/contexts/index.ts` with exports
- [ ] Update all imports throughout the codebase

### Step 3: Move Hooks

- [ ] Move `src/hooks/auth/` to `src/lib/hooks/auth/`
- [ ] Move `src/hooks/data/` to `src/lib/hooks/data/`
- [ ] Move other hooks to `src/lib/hooks/common/`
- [ ] Create index files with exports
- [ ] Update all imports throughout the codebase

### Step 4: Move Game Logic

- [ ] Move `src/hooks/useArenas.ts` to `src/lib/game/hooks/`
- [ ] Move `src/hooks/useBeyblades.ts` to `src/lib/game/hooks/`
- [ ] Move `src/app/(frontend)/game/hooks/` to `src/lib/game/hooks/`
- [ ] Move `src/app/(frontend)/game/utils/` to `src/lib/game/`
- [ ] Move `src/app/(frontend)/game/lib/` to `src/lib/game/multiplayer/`
- [ ] Move game types to `src/lib/game/types/`
- [ ] Create proper index files
- [ ] Update all imports

### Step 5: Consolidate Utils

- [ ] Move remaining files from `src/utils/` to `src/lib/utils/`
- [ ] Update `src/lib/utils/index.ts` with all exports
- [ ] Remove `src/utils/` directory
- [ ] Update all imports throughout the codebase

### Step 6: Cleanup Old Directories

- [ ] Remove `src/contexts/`
- [ ] Remove `src/hooks/`
- [ ] Remove `src/utils/`
- [ ] Update tsconfig paths if needed

## 🔄 Import Updates Required

### Before:

```typescript
// Contexts
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

// Hooks
import { useApiProducts } from "@/hooks/data";
import { useEnhancedAuth } from "@/hooks/auth/useEnhancedAuth";
import { useArenas } from "@/hooks/useArenas";

// Utils
import { formatPrice } from "@/utils/format";
import { validateEmail } from "@/utils/validation";

// Game
import { useGameState } from "@/app/(frontend)/game/hooks/useGameState";
import { arenaRenderer } from "@/app/(frontend)/game/utils/arenaRenderer";
```

### After:

```typescript
// Contexts
import { useAuth } from "@/lib/contexts/AuthContext";
import { useCart } from "@/lib/contexts/CartContext";
// Or: import { useAuth, useCart } from '@/lib/contexts';

// Hooks
import { useApiProducts } from "@/lib/hooks/data";
import { useEnhancedAuth } from "@/lib/hooks/auth";
import { useArenas } from "@/lib/game/hooks";

// Utils (unchanged, already in @/lib/utils)
import { formatPrice } from "@/lib/utils";
import { validateEmail } from "@/lib/utils";

// Game
import { useGameState } from "@/lib/game/hooks";
import { arenaRenderer } from "@/lib/game/rendering";
```

## 🎯 Benefits

1. **Better Organization**: All library code in one place
2. **Clearer Structure**: Game logic separated from general hooks
3. **Easier Imports**: Consistent import paths
4. **Better Discoverability**: Logical grouping of related code
5. **Maintainability**: Easier to find and update code
6. **Scalability**: Easy to add new modules

## ⚠️ Breaking Changes

All import paths will need to be updated. This is a major refactor that should be:

1. Done in a single commit
2. Tested thoroughly
3. Documented in migration guide
4. Communicated to all developers

## 📝 Notes

- Keep `src/config/` separate (configuration files)
- Keep `src/constants/` separate (constant values)
- Keep `src/types/` for shared types (game types go in game folder)
- Game components stay in `src/app/(frontend)/game/components/`
- Only move logic/utilities, not UI components

---

**Status**: Plan Created - Ready for Execution
**Estimated Files to Update**: ~200+ imports
**Estimated Time**: 2-3 hours
