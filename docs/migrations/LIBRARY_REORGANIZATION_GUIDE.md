# Library Reorganization Migration Guide

## Overview

All library code has been reorganized into `src/lib/` with proper subdirectories for better organization and maintainability.

## What Changed

### Directory Structure

**Before:**

```
src/
├── contexts/           → Now: src/lib/contexts/
├── hooks/             → Now: src/lib/hooks/
│   ├── auth/          → Now: src/lib/hooks/auth/
│   ├── data/          → Now: src/lib/hooks/data/
│   ├── useArenas.ts   → Now: src/lib/game/hooks/
│   └── useBeyblades.ts → Now: src/lib/game/hooks/
├── utils/             → Now: src/lib/utils/
└── app/(frontend)/game/
    ├── hooks/         → Now: src/lib/game/hooks/
    ├── utils/         → Now: src/lib/game/ (organized by category)
    ├── lib/           → Now: src/lib/game/multiplayer/
    └── types/         → Now: src/lib/game/types/
```

**After:**

```
src/lib/
├── api/              # API services (existing)
├── contexts/         # React contexts (NEW)
│   └── index.ts     # Export all contexts
├── hooks/           # React hooks (NEW)
│   ├── auth/        # Auth hooks
│   ├── data/        # Data hooks
│   ├── common/      # Common utility hooks
│   └── index.ts    # Export all hooks
├── game/            # Game logic (NEW)
│   ├── hooks/       # Game hooks
│   ├── physics/     # Physics & collision
│   ├── rendering/   # Canvas rendering
│   ├── moves/       # Special moves
│   ├── ui/          # UI utilities
│   ├── multiplayer/ # Multiplayer logic
│   ├── types/       # Game types
│   ├── utils/       # Game utilities
│   └── index.ts    # Export all game modules
├── storage/         # Storage utilities (existing)
├── utils/           # General utilities (CONSOLIDATED)
│   └── index.ts    # Export all utilities
├── validations/     # Zod schemas (existing)
└── seo/             # SEO utilities (existing)
```

## Import Migration Guide

### Contexts

**Before:**

```typescript
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useModernTheme } from "@/contexts/ModernThemeContext";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
```

**After (Individual imports):**

```typescript
import { useAuth } from "@/lib/contexts/AuthContext";
import { useCart } from "@/lib/contexts/CartContext";
import { useWishlist } from "@/lib/contexts/WishlistContext";
import { useCurrency } from "@/lib/contexts/CurrencyContext";
import { useModernTheme } from "@/lib/contexts/ModernThemeContext";
import { useBreadcrumb } from "@/lib/contexts/BreadcrumbContext";
```

**After (Grouped imports - RECOMMENDED):**

```typescript
import {
  useAuth,
  useCart,
  useWishlist,
  useCurrency,
  useModernTheme,
  useBreadcrumb,
} from "@/lib/contexts";
```

### Hooks - Auth

**Before:**

```typescript
import { useAuthRedirect } from "@/hooks/auth/useAuthRedirect";
import { useEnhancedAuth } from "@/hooks/auth/useEnhancedAuth";
```

**After:**

```typescript
import { useAuthRedirect, useEnhancedAuth } from "@/lib/hooks/auth";
// Or: import { useAuthRedirect, useEnhancedAuth } from '@/lib/hooks';
```

### Hooks - Data

**Before:**

```typescript
import { useApiProducts } from "@/hooks/data/useApiProducts";
import { useApiCart } from "@/hooks/data/useApiCart";
import { useApiCategories } from "@/hooks/data/useApiCategories";
```

**After:**

```typescript
import { useApiProducts, useApiCart, useApiCategories } from "@/lib/hooks/data";
// Or: import { useApiProducts, useApiCart, useApiCategories } from '@/lib/hooks';
```

### Hooks - Common

**Before:**

```typescript
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useReviews } from "@/hooks/useReviews";
import { useCookie } from "@/hooks/useCookie";
import { useIsAdminRoute } from "@/hooks/useIsAdminRoute";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
```

**After:**

```typescript
import {
  useOrders,
  useProducts,
  useReviews,
  useCookie,
  useIsAdminRoute,
  useBreadcrumbTracker,
} from "@/lib/hooks/common";
// Or: import { ... } from '@/lib/hooks';
```

### Game Hooks

**Before:**

```typescript
import { useArenas } from "@/hooks/useArenas";
import { useBeyblades } from "@/hooks/useBeyblades";
import { useGameState } from "@/app/(frontend)/game/hooks/useGameState";
import { useMultiplayer } from "@/app/(frontend)/game/hooks/useMultiplayer";
```

**After:**

```typescript
import {
  useArenas,
  useBeyblades,
  useGameState,
  useMultiplayer,
} from "@/lib/game/hooks";
// Or: import { useArenas, useBeyblades, useGameState, useMultiplayer } from '@/lib/game';
```

### Game Physics

**Before:**

```typescript
import { GamePhysicsEngine } from "@/app/(frontend)/game/utils/gamePhysics";
import { checkCollision } from "@/app/(frontend)/game/utils/physicsCollision";
import { Vector2D } from "@/app/(frontend)/game/utils/vectorUtils";
```

**After:**

```typescript
import {
  GamePhysicsEngine,
  checkCollision,
  Vector2D,
} from "@/lib/game/physics";
```

### Game Rendering

**Before:**

```typescript
import { ArenaRenderer } from "@/app/(frontend)/game/utils/arenaRenderer";
import { BeybladeRenderer } from "@/app/(frontend)/game/utils/beybladeRenderer";
```

**After:**

```typescript
import { ArenaRenderer, BeybladeRenderer } from "@/lib/game/rendering";
```

### Game Special Moves

**Before:**

```typescript
import { SpecialMovesManager } from "@/app/(frontend)/game/utils/specialMovesManager";
import { CinematicManager } from "@/app/(frontend)/game/utils/cinematicSpecialMoves";
```

**After:**

```typescript
import { SpecialMovesManager, CinematicManager } from "@/lib/game/moves";
```

### Game UI

**Before:**

```typescript
import { FloatingNumberManager } from "@/app/(frontend)/game/utils/floatingNumbers";
import { VisualIndicatorsManager } from "@/app/(frontend)/game/utils/visualIndicators";
```

**After:**

```typescript
import { FloatingNumberManager, VisualIndicatorsManager } from "@/lib/game/ui";
```

### Game Types

**Before:**

```typescript
import { GameState, PlayerData } from "@/app/(frontend)/game/types/game";
import { MultiplayerState } from "@/app/(frontend)/game/types/multiplayer";
```

**After:**

```typescript
import { GameState, PlayerData, MultiplayerState } from "@/lib/game/types";
```

### Game Utils

**Before:**

```typescript
import { calculateDamage } from "@/app/(frontend)/game/utils/beybladeUtils";
import { detectBoundaryCollision } from "@/app/(frontend)/game/utils/collisionUtils";
```

**After:**

```typescript
import { calculateDamage, detectBoundaryCollision } from "@/lib/game/utils";
```

### Game Multiplayer

**Before:**

```typescript
import { GameServer } from "@/app/(frontend)/game/lib/gameServer";
```

**After:**

```typescript
import { GameServer } from "@/lib/game/multiplayer";
```

### Utils (General)

**Before:**

```typescript
import { formatDate } from "@/utils/date";
import { formatPrice } from "@/utils/format";
import { validateEmail } from "@/utils/validation";
import { isMobile } from "@/utils/mobile";
```

**After (No change - already in lib/utils):**

```typescript
import { formatDate, formatPrice, validateEmail, isMobile } from "@/lib/utils";
```

## Quick Find & Replace

Use these regex patterns in VS Code for quick migration:

### Contexts

- Find: `from ['"]@/contexts/([^'"]+)['"]`
- Replace: `from '@/lib/contexts/$1'`

### Hooks (General)

- Find: `from ['"]@/hooks/([^'"]+)['"]`
- Replace: `from '@/lib/hooks/$1'`

### Game Hooks (from old location)

- Find: `from ['"]@/app/\(frontend\)/game/hooks/([^'"]+)['"]`
- Replace: `from '@/lib/game/hooks'`

### Game Utils (from old location)

- Find: `from ['"]@/app/\(frontend\)/game/utils/([^'"]+)['"]`
- Replace: Depends on the file - check the guide above

### Game Lib (server)

- Find: `from ['"]@/app/\(frontend\)/game/lib/gameServer['"]`
- Replace: `from '@/lib/game/multiplayer'`

### Game Types

- Find: `from ['"]@/app/\(frontend\)/game/types/([^'"]+)['"]`
- Replace: `from '@/lib/game/types'`

### Utils (from old location)

- Find: `from ['"]@/utils/([^'"]+)['"]`
- Replace: `from '@/lib/utils'`

## Migration Script

Run this PowerShell script to automatically update most imports:

```powershell
# See: scripts/migrate-imports.ps1
.\scripts\migrate-imports.ps1
```

## Testing After Migration

1. **Type Check:**

   ```bash
   npm run type-check
   ```

2. **Build Check:**

   ```bash
   npm run build
   ```

3. **Run Tests:**

   ```bash
   npm run test
   ```

4. **Check for Import Errors:**
   Search for any remaining old import patterns:
   - `@/contexts/`
   - `@/hooks/use` (except @/lib/hooks)
   - `@/utils/` (except @/lib/utils)
   - `@/app/(frontend)/game/utils/`
   - `@/app/(frontend)/game/hooks/`
   - `@/app/(frontend)/game/lib/`
   - `@/app/(frontend)/game/types/`

## Benefits of New Structure

✅ **Better Organization**: All library code in one place
✅ **Logical Grouping**: Related code grouped together
✅ **Game Logic Separated**: Game-specific code clearly isolated
✅ **Cleaner Imports**: Consistent import patterns
✅ **Easier Navigation**: Find code more easily
✅ **Better Scalability**: Easy to add new modules

## Notes

- Old directories (`src/contexts`, `src/hooks`, `src/utils`) can be removed after migration
- Game components stay in `src/app/(frontend)/game/components/`
- Only logic/utilities moved, not UI components
- All imports can use the new central index files

---

**Migration Status**: Directory structure created, files copied
**Next Step**: Update all imports throughout the codebase
**Estimated Import Updates**: ~200+ files
