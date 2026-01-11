# React Library Extraction - Project Overview

**Created:** January 12, 2026
**Status:** ✅ Planning Complete - Ready for Implementation

---

## Quick Summary

We're extracting reusable utilities, components, and styles from the main Letitrip application into a new workspace package called `@letitrip/react-library`.

### Goals

- **Extract**: 65+ files (utilities, components, hooks, styles)
- **Package**: As workspace package (no npm publishing)
- **Document**: Complete Storybook documentation
- **Import**: Use `import { X } from '@letitrip/react-library'`

### Timeline

- **Total Time**: ~32 hours (1,920 minutes)
- **Duration**: 3 weeks (Weeks 14-16)
- **Tasks**: 18 tasks across 3 phases

---

## Documentation Created

### 1. IMPLEMENTATION-TRACKER.md (Updated)

**Location:** `refactor/IMPLEMENTATION-TRACKER.md`

Added **Phase 4: React Library Extraction**

- Week 14: Library Setup & Utilities (6 tasks)
- Week 15: Component Migration (6 tasks)
- Week 16: Styles & Finalization (6 tasks)

### 2. LIBRARY-SETUP-GUIDE.md

**Location:** `refactor/LIBRARY-SETUP-GUIDE.md`

Complete technical guide covering:

- Workspace configuration (NPM workspaces)
- Library structure and directory layout
- Build configuration (Vite + TypeScript)
- Storybook setup and configuration
- Migration strategy (phase-by-phase)
- Import path updates
- Testing strategy

### 3. LIBRARY-FILE-INVENTORY.md

**Location:** `refactor/LIBRARY-FILE-INVENTORY.md`

Detailed inventory of all 65 files:

- 12 utility files (formatters, validators, date utils, etc.)
- 33 components (forms, UI, values, pickers)
- 10 hooks (useDebounce, useMediaQuery, etc.)
- 5 style files
- 5 type files
- Dependency analysis
- Migration priorities
- Exclusion list (app-specific files)

---

## Library Structure

```
react-library/
├── package.json              # @letitrip/react-library
├── tsconfig.json
├── vite.config.ts
├── .storybook/
│   ├── main.ts
│   └── preview.ts
├── src/
│   ├── index.ts             # Main exports
│   ├── utils/               # Formatters, validators, date utils
│   ├── components/          # Forms, UI, values, pickers
│   ├── hooks/               # React hooks
│   ├── styles/              # Theme, Tailwind config
│   └── types/               # TypeScript types
└── stories/                 # Storybook stories
```

---

## Key Extractions

### High Priority Utilities

- **formatters.ts**: 20+ functions (date, price, phone, number)
- **validators.ts**: 15+ validation functions
- **date-utils.ts**: Date manipulation
- **utils.ts**: cn() function (used everywhere!)
- **accessibility.ts**: ARIA helpers

### High Priority Components

- **FormInput**: ⭐ Already refined
- **FormPhoneInput**: ⭐ Supports 8 countries
- **FormCurrencyInput**: ⭐ Supports 4 currencies
- **FormDatePicker**: Date selection
- **DateDisplay**: ⭐ Date formatting components
- **Button, Card, Modal**: UI primitives

### High Priority Hooks

- **useMediaQuery**: Responsive design
- **useDebounce**: Delayed updates
- **useLocalStorage**: Local storage sync
- **useClipboard**: Clipboard operations

---

## Migration Strategy

### Phase 1: Setup (Task 14.1) - 90 min

1. Create react-library directory
2. Initialize package.json with dependencies
3. Setup Vite build configuration
4. Configure TypeScript
5. Update root workspace configuration

### Phase 2: Utilities (Tasks 14.2-14.6) - 450 min

1. Migrate core utilities (cn, formatters, validators)
2. Migrate value display components
3. Setup Storybook
4. Migrate accessibility utilities
5. Test library build
6. Update imports incrementally

### Phase 3: Components (Week 15) - 720 min

1. Migrate form components (20 components)
2. Migrate UI components (Button, Card, Modal)
3. Migrate layout components
4. Migrate React hooks
5. Migrate picker components
6. Add Storybook stories for all

### Phase 4: Finalization (Week 16) - 660 min

1. Migrate theme system
2. Create comprehensive documentation
3. Export TypeScript types
4. Optimize build configuration
5. Integration testing
6. Deploy Storybook to GitHub Pages

---

## Dependencies

### External (to install in library)

**Peer Dependencies:**

- react: ^18.0.0
- react-dom: ^18.0.0

**Dependencies:**

- clsx: ^2.1.0 (for cn)
- tailwind-merge: ^2.2.0 (for cn)
- date-fns: ^3.0.0 (for dates)
- libphonenumber-js: ^1.10.0 (for phone)

**Dev Dependencies:**

- vite, typescript, @storybook/react, vitest
- tailwindcss, postcss, autoprefixer

### Internal (migration order)

1. **First**: utils.ts (cn function) - used everywhere
2. **Second**: FormField, FormLabel - used by all forms
3. **Third**: date-utils, formatters, validators
4. **Then**: All components and hooks

---

## Import Path Changes

### Before

```typescript
import { formatPrice } from "@/lib/formatters";
import { FormInput } from "@/components/forms/FormInput";
import { useDebounce } from "@/hooks/useDebounce";
```

### After

```typescript
import { formatPrice, FormInput, useDebounce } from "@letitrip/react-library";
```

### Or (specific imports for tree-shaking)

```typescript
import { formatPrice } from "@letitrip/react-library/utils";
import { FormInput } from "@letitrip/react-library/components";
import { useDebounce } from "@letitrip/react-library/hooks";
```

---

## Testing Plan

### Unit Tests

- Vitest for all utilities
- React Testing Library for components
- Jest for hooks

### Integration Tests

- Test library in main app context
- Verify all imports work
- Check component rendering

### Visual Tests

- Storybook for visual regression
- Accessibility testing (A11y addon)
- Cross-browser testing

---

## Storybook Structure

```
stories/
├── Introduction.stories.mdx
├── utils/
│   ├── Formatters.stories.tsx
│   ├── Validators.stories.tsx
│   └── DateUtils.stories.tsx
├── components/
│   ├── forms/
│   │   ├── FormInput.stories.tsx
│   │   ├── FormPhoneInput.stories.tsx
│   │   ├── FormCurrencyInput.stories.tsx
│   │   └── ... (all form components)
│   ├── ui/
│   │   ├── Button.stories.tsx
│   │   ├── Card.stories.tsx
│   │   └── Modal.stories.tsx
│   └── values/
│       ├── DateDisplay.stories.tsx
│       └── Price.stories.tsx
└── hooks/
    ├── useDebounce.stories.tsx
    ├── useMediaQuery.stories.tsx
    └── ... (all hooks)
```

---

## Exclusions (Not Migrating)

### Business Logic

- link-utils.ts (Next.js routing)
- category-hierarchy.ts
- payment-gateway-selector.ts
- permissions.ts, rbac-permissions.ts
- rate-limiter.ts
- firebase/\* (app config)

### Domain-Specific Components

- admin/_, auction/_, product/\*
- shop/_, user/_, checkout/\*

### App-Specific Hooks

- useAuth, useCart, useProducts, useAuction

**Reason**: These are too application-specific and contain business logic.

---

## Success Criteria

✅ Library builds successfully with Vite
✅ All 65 files migrated and working
✅ Storybook deployed with full documentation
✅ Main app imports from library (no errors)
✅ All tests passing in both library and main app
✅ Bundle size optimized with tree-shaking
✅ TypeScript types exported correctly
✅ Accessibility maintained (A11y tests pass)

---

## Next Steps

### Immediate Actions

1. **Start Task 14.1**: Create library structure

   ```powershell
   mkdir react-library
   cd react-library
   npm init -y
   ```

2. **Install dependencies**:

   ```powershell
   npm install --save-dev vite @vitejs/plugin-react typescript
   npm install clsx tailwind-merge date-fns libphonenumber-js
   ```

3. **Create config files**:

   - vite.config.ts
   - tsconfig.json
   - package.json (update)

4. **Update root workspace**:
   - Add workspaces to root package.json
   - Update root tsconfig.json paths

### Today's Goal (Week 14, Day 1)

Complete Task 14.1: Library structure setup

- Create directory
- Setup package.json
- Configure build tools
- Update workspace config

**Estimated Time**: 90 minutes

---

## Package Manager

**Detected**: NPM (package-lock.json exists)
**Configuration**: NPM workspaces

---

## Resources

### Documentation

- [IMPLEMENTATION-TRACKER.md](refactor/IMPLEMENTATION-TRACKER.md) - Task tracking
- [LIBRARY-SETUP-GUIDE.md](refactor/LIBRARY-SETUP-GUIDE.md) - Technical guide
- [LIBRARY-FILE-INVENTORY.md](refactor/LIBRARY-FILE-INVENTORY.md) - File details

### References

- Vite Library Mode: https://vitejs.dev/guide/build.html#library-mode
- NPM Workspaces: https://docs.npmjs.com/cli/v7/using-npm/workspaces
- Storybook for React: https://storybook.js.org/docs/react/get-started/install

---

## Questions & Decisions

### ✅ Resolved

1. **Package Manager**: NPM (detected from package-lock.json)
2. **Library Name**: @letitrip/react-library
3. **Build Tool**: Vite (modern, fast)
4. **Storybook Version**: 7.x (latest stable)
5. **Migration Strategy**: Incremental (phase-by-phase)
6. **Testing**: Vitest + React Testing Library
7. **Publishing**: Workspace only (no npm publish)

### 🤔 To Decide During Implementation

1. Should we consolidate formatPrice functions? (formatters.ts vs price.utils.ts)
2. Which rich text editor for FormRichText? (if any external library)
3. Color picker library for FormColorPicker? (or build custom)
4. Deploy Storybook to GitHub Pages or Vercel?

---

## Git Workflow

### Branching Strategy

```bash
# Create feature branch for library extraction
git checkout -b feature/react-library-extraction

# Work on tasks
git add .
git commit -m "refactor(library): Task 14.1 - Create library structure"

# Continue with tasks...
```

### Commit Format

```
refactor(library): Task X.X - Description

- Details of changes
- Files migrated
- Tests status

Related: refactor/IMPLEMENTATION-TRACKER.md
```

---

## Communication

### Status Updates

**After each task:**

- Mark task complete in IMPLEMENTATION-TRACKER.md
- Update TODO list
- Commit changes
- Brief status message

**After each week:**

- Week summary
- Progress report
- Issues encountered
- Next week preview

---

## Current Status

**Phase 4 Progress: 0/18 tasks (0%)**

### Week 14: 0/6 tasks (0%)

- [ ] 14.1: Create React Library Submodule
- [ ] 14.2: Migrate Core Utilities
- [ ] 14.3: Migrate Value Display Components
- [ ] 14.4: Create Storybook Documentation
- [ ] 14.5: Migrate Accessibility Utilities
- [ ] 14.6: Week 14 Integration & Testing

### Week 15: 0/6 tasks (0%)

- [ ] 15.1-15.6: Component migration tasks

### Week 16: 0/6 tasks (0%)

- [ ] 16.1-16.6: Finalization tasks

---

**Ready to Start!** 🚀

All planning complete. Documentation ready. Let's begin with Task 14.1: Create React Library Submodule.

---

**Last Updated:** January 12, 2026
**Created By:** GitHub Copilot
**Status:** ✅ Planning Complete
