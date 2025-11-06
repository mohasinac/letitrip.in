# Game Files Organization Plan

## Overview

Reorganize game-related files into proper structure and remove deprecated files.

## Current Structure Issues

1. Duplicate Arena Configurators (old and new)
2. Deprecated backup files (`.old`, `.mui-backup`, `.deprecated`)
3. Mixed organization between `src/app/game` and component folders
4. Re-exports causing circular dependencies

## Target Structure

```
src/
├── app/
│   └── (frontend)/
│       └── admin/
│           └── game/           # Game admin pages only
├── lib/
│   └── game/
│       ├── services/          # Game business logic
│       ├── arena/             # Arena-specific utilities
│       └── physics/           # Physics calculations
├── hooks/
│   └── game/                  # Custom game hooks
├── contexts/
│   └── game/                  # Game state management
├── components/
│   └── game/                  # Game UI components
│       ├── arena/             # Arena components
│       ├── beyblade/          # Beyblade components
│       ├── admin/             # Game admin components
│       └── ui/                # Shared game UI
└── types/
    └── game/                  # Game TypeScript types
```

## Files to DELETE

### Deprecated Backups

- src/lib/hooks/data/useFirebase.ts.deprecated
- src/app/(frontend)/admin/settings/featured-categories/page.tsx.mui-backup
- src/app/(frontend)/seller/sales/new/page.tsx.mui-backup
- src/app/(frontend)/(public)/privacy/page.tsx.old
- src/app/(frontend)/(public)/privacy/page.tsx.mui-backup
- src/components/home/InteractiveHeroBanner.tsx.mui-backup
- src/components/home/InteractiveHeroBanner.tsx.old
- src/components/shared/preview/IconPreview.tsx.mui-backup
- src/components/categories/CategoryPageClient.tsx.old
- src/components/categories/CategoryPageClient.tsx.mui-backup

### Old Arena Configurator (Not used)

- src/components/admin/ArenaConfigurator.tsx
- src/components/admin/ArenaPreview.tsx (if using old types)

### Deprecated Type Files

- src/types/arenaConfig.ts (Replace with arenaConfigNew.ts)

## Files to RENAME

### Remove "New" suffix

- src/components/admin/ArenaConfiguratorNew.tsx → ArenaConfigurator.tsx (after deleting old)
- src/types/arenaConfigNew.ts → arenaConfig.ts (after deleting old)

## Files to MOVE

### Game Components

Move from `src/components/admin/` to `src/components/game/admin/`:

- ArenaPreviewBasic.tsx
- ArenaPreviewModal.tsx
- BeybladeManagement.tsx
- BeybladePreview.tsx
- arena-tabs/ (entire folder)

### Game Types

Consolidate in `src/types/game/`:

- beybladeStats.ts → game/beyblade.types.ts
- arenaConfigNew.ts → game/arena.types.ts

### Game Utilities

Move to `src/lib/game/`:

- pathGeneration.ts → game/arena/pathGeneration.ts

## Import Updates Required

After moving files, update imports in:

1. All admin pages using ArenaConfigurator
2. All components importing arena/beyblade types
3. All files using pathGeneration utilities

## Migration Steps

1. **Phase 1: Delete deprecated files**
   - Remove all `.old`, `.mui-backup`, `.deprecated` files
2. **Phase 2: Remove old Arena Configurator**
   - Delete ArenaConfigurator.tsx (old version)
   - Verify ArenaPreview.tsx usage
3. **Phase 3: Rename "New" files**
   - Rename ArenaConfiguratorNew.tsx
   - Rename arenaConfigNew.ts
4. **Phase 4: Organize directory structure**
   - Create proper game folder structure
   - Move files to new locations
5. **Phase 5: Update imports**
   - Fix all import statements
   - Remove barrel exports causing issues
   - Use direct imports

## Success Criteria

- ✅ No deprecated files remain
- ✅ Clear folder structure by responsibility
- ✅ Direct imports instead of re-exports
- ✅ No build errors
- ✅ All admin pages work correctly
