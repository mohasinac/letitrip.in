# 🔄 Component Migration Continuation Prompt

**Use this prompt to resume the migration work at any time.**

---

## Quick Resume

```
Continue the component migration from main app to react-library.

Status Check:
1. Read refactor/IMPLEMENTATION-TRACKER-V2.md for overall plan
2. Read refactor/PHASE-1A-SUMMARY.md for Phase 1a progress
3. Check todo list for current task

Current Phase: Phase 1a - Import Updates
Last completed: Verified all pure components exist in library

Next immediate steps:
1. Find all imports of @/components/(skeletons|faq|legal) in main app
2. Update imports to use @letitrip/react-library
3. Find UI component imports (BaseTable, Checkbox, Textarea, Text, Heading, FormLayout, FormActions)
4. Update those imports to library
5. Delete duplicate files from main app
6. Run build: npm run build
7. Fix any TypeScript/import errors
8. Run tests: npm test
9. Commit with message from IMPLEMENTATION-TRACKER-V2.md

Reference documents:
- refactor/IMPLEMENTATION-TRACKER-V2.md - Master plan all phases
- refactor/MIGRATION-ANALYSIS.md - Technical analysis
- refactor/PHASE-1A-SUMMARY.md - Current phase details
```

---

## Detailed Resume (if needed more context)

```
I'm continuing the Phase 1a component migration to react-library.

Context:
- Goal: Migrate 70-75% of main app components to react-library
- Current: Phase 1a - Pure components (skeletons, faq, legal, ui)
- Progress: Components verified in library, need import updates

Completed so far:
✅ Created implementation tracker (IMPLEMENTATION-TRACKER-V2.md)
✅ Created migration analysis (MIGRATION-ANALYSIS.md)
✅ Checked mobile components - found 2 need injection pattern
✅ Checked UI components - BaseCard needs injection pattern
✅ Verified skeletons/ directory exists in library (5 components)
✅ Verified faq/ directory exists in library (2 components)
✅ Verified legal/ directory exists in library (1 component)
✅ Verified UI components in library (7 components)
✅ Created phase summary (PHASE-1A-SUMMARY.md)

Remaining Phase 1a tasks:
⏳ Update main app imports to use @letitrip/react-library
⏳ Delete duplicate files from main app
⏳ Run build and fix any errors
⏳ Run tests
⏳ Commit Phase 1a changes

Next phase after Phase 1a:
- Phase 1b: Migrate mobile components (applying injection pattern)
- Phase 2: Migrate navigation/media with injection
- Phase 3: Extract business logic (cart, product, shop)
- Phase 4: Complex refactoring (wizards, admin forms)

Please continue with updating imports in the main app.
```

---

## After Each Phase Completion

```
Phase [X] complete. Review refactor/IMPLEMENTATION-TRACKER-V2.md and proceed to next phase.

Update tracker:
1. Mark completed phase items with ✅
2. Note any deviations or issues
3. Update component counts

Continue to next phase or task as outlined in the tracker.
```

---

## Key Patterns to Remember

### Phase 1: Direct Migration

```typescript
// Before
import { Component } from "@/components/category/Component";

// After
import { Component } from "@letitrip/react-library";
```

### Phase 2: Dependency Injection

```typescript
// Library
export function TabNav({ LinkComponent, currentPath, ...props }) {}

// Main app wrapper
import { TabNav as LibTabNav } from "@letitrip/react-library";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function TabNav(props) {
  return (
    <LibTabNav {...props} LinkComponent={Link} currentPath={usePathname()} />
  );
}
```

### Phase 3: Callback Injection

```typescript
// Library
export function ProductCard({ product, onFavorite, onAddToCart }) {}

// Main app wrapper
import { ProductCard as LibCard } from "@letitrip/react-library";

export function ProductCard({ product }) {
  const { addToFavorites } = useFavorites();
  const { addToCart } = useCart();

  return (
    <LibCard
      product={product}
      onFavorite={addToFavorites}
      onAddToCart={addToCart}
    />
  );
}
```

---

## Quick Commands Reference

```bash
# Search for imports to update
grep -r "@/components/skeletons" src --include="*.tsx" --include="*.ts"
grep -r "@/components/faq" src --include="*.tsx" --include="*.ts"
grep -r "@/components/legal" src --include="*.tsx" --include="*.ts"

# Build and test
npm run build
npm test

# Git workflow
git add .
git commit -m "refactor(phase-1a): update imports to use react-library"
```

---

## File Locations

**Main App**: `d:\proj\letitrip.in\src\components\`
**Library**: `d:\proj\letitrip.in\react-library\src\components\`
**Docs**: `d:\proj\letitrip.in\refactor\`
**Tests**: `d:\proj\letitrip.in\tests\`

---

**Last Updated**: January 16, 2026
