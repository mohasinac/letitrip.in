# React Library Index

**Package**: @letitrip/react-library
**Version**: 1.0.0
**Status**: In Development
**Last Updated**: January 12, 2026

## Overview

Reusable React components and utilities extracted from the main Letitrip application. This library provides a comprehensive set of tools for building consistent and accessible user interfaces.

## Structure

```
react-library/
├── src/
│   ├── index.ts           # Main entry point
│   ├── utils/             # Utility functions (Task 14.2)
│   ├── components/        # React components (Task 15.1-15.3)
│   ├── hooks/             # React hooks (Task 15.4)
│   ├── styles/            # Styles and theme (Task 16.1)
│   └── types/             # TypeScript types (Task 16.3)
├── stories/               # Storybook stories (Task 14.4)
├── .storybook/            # Storybook configuration
├── dist/                  # Build output (generated)
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Build configuration
```

## Build System

- **Bundler**: Vite 5.x
- **TypeScript**: 5.3+
- **Output Formats**: ESM and CommonJS
- **Type Definitions**: Generated via vite-plugin-dts

## Exports

The library provides multiple entry points for tree-shaking:

```typescript
// Main entry point
import { X } from '@letitrip/react-library';

// Specific imports (better tree-shaking)
import { X } from '@letitrip/react-library/utils';
import { Y } from '@letitrip/react-library/components';
import { Z } from '@letitrip/react-library/hooks';
```

## Package Exports

```json
{
  ".": "./dist/index.js",
  "./utils": "./dist/utils/index.js",
  "./components": "./dist/components/index.js",
  "./hooks": "./dist/hooks/index.js",
  "./styles": "./dist/styles/index.js"
}
```

## Development

### Scripts

- `npm run dev` - Watch mode for development
- `npm run build` - Build library
- `npm run build:full` - Build with TypeScript compilation
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run storybook` - Start Storybook dev server
- `npm run build-storybook` - Build Storybook static site

### Building

```bash
cd react-library
npm run build
```

Output:
- `dist/index.js` - ESM bundle
- `dist/index.cjs` - CommonJS bundle
- `dist/index.d.ts` - Type definitions
- `dist/utils/`, `dist/components/`, etc. - Split chunks

## Dependencies

### Peer Dependencies

- react: ^18.0.0 || ^19.0.0
- react-dom: ^18.0.0 || ^19.0.0

### Direct Dependencies

- clsx: ^2.1.0 - Conditional class names
- tailwind-merge: ^2.2.0 - Tailwind class merging
- date-fns: ^3.0.0 - Date manipulation
- libphonenumber-js: ^1.10.0 - Phone validation

### Dev Dependencies

- vite: ^5.0.0 - Build tool
- typescript: ^5.3.0 - Type checking
- @storybook/react: ^7.6.0 - Component documentation
- vitest: ^1.0.0 - Testing framework

## Workspace Integration

The library is integrated into the main monorepo as a workspace:

**Root package.json:**
```json
{
  "workspaces": [
    "react-library"
  ]
}
```

**Root tsconfig.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@letitrip/react-library": ["./react-library/src"],
      "@letitrip/react-library/*": ["./react-library/src/*"]
    }
  }
}
```

## Migration Status

### Completed (Task 14.1)
- ✅ Library structure created
- ✅ Package configuration
- ✅ TypeScript setup
- ✅ Vite build configuration
- ✅ Storybook setup
- ✅ Workspace integration
- ✅ Build verification

### Pending

**Week 14 (Remaining)**
- ⏳ Task 14.2: Migrate core utilities
- ⏳ Task 14.3: Migrate value display components
- ⏳ Task 14.4: Create Storybook documentation
- ⏳ Task 14.5: Migrate accessibility utilities
- ⏳ Task 14.6: Week 14 integration & testing

**Week 15**
- ⏳ Task 15.1-15.6: Component migration

**Week 16**
- ⏳ Task 16.1-16.6: Styles & finalization

## Contents (To Be Populated)

### Utilities (Task 14.2)
- Formatters (date, price, phone, number)
- Validators (email, phone, pincode, URL)
- Date utilities
- String utilities (cn, slugify)
- Accessibility helpers
- Sanitization

### Components (Tasks 15.1-15.3)
- Form components (21 components)
- UI components (Button, Card, Modal, etc.)
- Value displays (DateDisplay, Price, Status)
- Pickers (DateTimePicker, State, Pincode)

### Hooks (Task 15.4)
- useMediaQuery
- useDebounce
- useLocalStorage
- useClipboard
- usePrevious
- useToggle
- And more...

### Styles (Task 16.1)
- Tailwind configuration
- Theme tokens
- CSS variables
- Design system

### Types (Task 16.3)
- Common types
- Component prop types
- Utility function types
- Hook types

## Documentation

### Storybook

Access component documentation at: http://localhost:6006

```bash
cd react-library
npm run storybook
```

### README

Main documentation: [react-library/README.md](../react-library/README.md)

### API Documentation

Will be generated in Task 16.2.

## Testing

### Unit Tests

```bash
cd react-library
npm test
```

### Integration Tests

Tests will be added in Tasks 14.6, 15.6, and 16.5.

## Build Verification

✅ Initial build successful (Task 14.1)

```
dist/
├── index.js (ESM)
├── index.cjs (CommonJS)
├── index.d.ts (Types)
├── utils/index.js
├── components/index.js
├── hooks/index.js
└── styles/index.js
```

## Next Steps

1. **Task 14.2**: Migrate core utilities
   - formatters.ts
   - validators.ts
   - date-utils.ts
   - utils.ts (cn function)
   - sanitize.ts

2. **Task 14.3**: Migrate value display components
   - DateDisplay
   - Price
   - Status badges

3. **Task 14.4**: Create Storybook stories
   - Setup story infrastructure
   - Add utility examples

## Related Files

- [IMPLEMENTATION-TRACKER.md](../../refactor/IMPLEMENTATION-TRACKER.md) - Task tracking
- [LIBRARY-SETUP-GUIDE.md](../../refactor/LIBRARY-SETUP-GUIDE.md) - Setup guide
- [LIBRARY-FILE-INVENTORY.md](../../refactor/LIBRARY-FILE-INVENTORY.md) - File inventory

---

**Created**: January 12, 2026
**Task**: 14.1 - Create React Library Submodule
**Status**: ✅ Complete
