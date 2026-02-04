# Project Structure

Understanding the project organization and file structure.

## Directory Overview

```
letitrip.in/
├── src/                      # Source code
│   ├── app/                  # Next.js App Router
│   ├── components/           # React components
│   ├── hooks/                # Custom hooks
│   ├── contexts/             # React contexts
│   ├── constants/            # Configuration
│   ├── utils/                # Utilities
│   └── index.ts              # Main export
├── docs/                     # Documentation
├── public/                   # Static files
├── __tests__/                # Test files
└── config files              # Configuration
```

## Source Directory (`src/`)

### App Directory (`src/app/`)

Next.js 16 App Router structure:

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Home page (/)
└── globals.css             # Global styles
```

**Key Files:**
- `layout.tsx` - Wraps all pages with ThemeProvider and ToastProvider
- `page.tsx` - Landing page with component showcase
- `globals.css` - Tailwind imports and custom CSS

### Components Directory (`src/components/`)

Organized by category with barrel exports:

```
components/
├── ui/                     # Basic UI components
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Dropdown.tsx
│   ├── Menu.tsx
│   ├── Pagination.tsx
│   ├── Progress.tsx
│   ├── Skeleton.tsx
│   ├── Spinner.tsx
│   ├── Tabs.tsx
│   ├── Tooltip.tsx
│   ├── Accordion.tsx
│   ├── Divider.tsx
│   ├── ImageGallery.tsx
│   └── index.ts            # Barrel export
├── forms/                  # Form components
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Checkbox.tsx
│   ├── Radio.tsx
│   ├── Textarea.tsx
│   ├── Toggle.tsx
│   ├── Slider.tsx
│   ├── Form.tsx
│   └── index.ts
├── feedback/               # User feedback
│   ├── Alert.tsx
│   ├── Modal.tsx
│   ├── Toast.tsx
│   └── index.ts
├── layout/                 # Navigation & structure
│   ├── MainNavbar.tsx
│   ├── BottomNavbar.tsx
│   ├── Sidebar.tsx
│   ├── TitleBar.tsx
│   ├── Footer.tsx
│   ├── Breadcrumbs.tsx
│   ├── NavItem.tsx
│   └── index.ts
├── typography/             # Text components
│   ├── Typography.tsx      # Heading, Text, Label, Caption
│   └── index.ts
├── utility/                # Helper components
│   ├── Search.tsx
│   ├── BackToTop.tsx
│   └── index.ts
├── LayoutClient.tsx        # Client-side layout wrapper
└── index.ts                # Main barrel export
```

**Component Structure:**
Each component typically includes:
- TypeScript interfaces for props
- JSDoc documentation
- Theme constant integration
- Accessibility attributes
- Mobile-friendly interactions

### Hooks Directory (`src/hooks/`)

Custom React hooks for gestures and utilities:

```
hooks/
├── useSwipe.ts             # Swipe gesture detection
├── useGesture.ts           # Multi-touch gestures
├── useLongPress.ts         # Long press detection
├── useClickOutside.ts      # Outside click handler
├── useKeyPress.ts          # Keyboard shortcuts
└── index.ts                # Barrel export
```

**Hook Features:**
- TypeScript generics for type safety
- 'use client' directives for Next.js
- Configurable options
- Performance optimized
- Null-safe ref handling

### Contexts Directory (`src/contexts/`)

React Context providers:

```
contexts/
├── ThemeContext.tsx        # Theme management (light/dark)
└── index.ts                # Barrel export
```

**ThemeContext Features:**
- Persists to localStorage
- System preference detection
- Automatic HTML class toggling
- Type-safe hooks

### Constants Directory (`src/constants/`)

Centralized configuration:

```
constants/
├── theme.ts                # THEME_CONSTANTS
├── navigation.tsx          # Navigation items
├── site.ts                 # Site configuration
└── index.ts                # Barrel export
```

**theme.ts Structure:**
```typescript
export const THEME_CONSTANTS = {
  colors: { /* color palette */ },
  themed: { /* dark mode classes */ },
  card: { /* card variants */ },
  button: { /* button variants */ },
  input: { /* input states */ },
  // ... more
}
```

### Utils Directory (`src/utils/`)

Utility functions and helpers:

```
utils/
├── eventHandlers.ts        # Global event management
└── index.ts                # Barrel export
```

**eventHandlers.ts Features:**
- GlobalEventManager class
- Throttle/debounce utilities
- Mobile device detection
- Scroll management
- Touch helpers

### Root Barrel Export (`src/index.ts`)

Main entry point for imports:

```typescript
// Exports from all directories
export * from './components';
export * from './constants';
export * from './contexts';
export * from './hooks';
export * from './utils';
```

**Usage:**
```tsx
import { 
  Button, 
  Input, 
  useSwipe, 
  THEME_CONSTANTS,
  useTheme 
} from '@/index';
```

## Test Structure

```
src/
└── components/
    └── ui/
        ├── Button.tsx
        └── __tests__/
            └── Button.test.tsx
```

**Test Organization:**
- Co-located with components
- `__tests__` directory pattern
- One test file per component
- Descriptive test names

## Configuration Files

### Next.js

```
next.config.js              # Next.js configuration
next-env.d.ts              # TypeScript definitions
```

### TypeScript

```
tsconfig.json              # TypeScript config
tsconfig.tsbuildinfo       # Build cache
```

### Tailwind CSS

```
tailwind.config.js         # Tailwind configuration
postcss.config.js          # PostCSS plugins
```

### Testing

```
jest.config.ts             # Jest configuration
jest.setup.ts              # Test setup
```

### Environment

```
.env.example               # Example environment
.env.local                 # Local environment (gitignored)
.env.development.local     # Dev environment
.env.production            # Production environment
```

## Import Patterns

### Barrel Exports (Recommended)

```tsx
// From root
import { Button, Card, Input } from '@/index';

// From category
import { Button, Card } from '@/components/ui';
import { Input, Select } from '@/components/forms';
```

### Direct Imports

```tsx
// When barrel export causes issues
import Button from '@/components/ui/Button';
import { useSwipe } from '@/hooks/useSwipe';
```

### Path Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## File Naming Conventions

- **Components:** PascalCase (`Button.tsx`, `MainNavbar.tsx`)
- **Hooks:** camelCase with `use` prefix (`useSwipe.ts`)
- **Utilities:** camelCase (`eventHandlers.ts`)
- **Constants:** camelCase (`theme.ts`, `navigation.tsx`)
- **Tests:** `*.test.tsx` or `*.spec.tsx`
- **Types:** PascalCase interfaces/types

## Code Organization Principles

1. **Single Responsibility:** Each file has one primary purpose
2. **Barrel Exports:** Use `index.ts` for clean imports
3. **Co-location:** Tests live near components
4. **Type Safety:** Full TypeScript coverage
5. **Documentation:** JSDoc comments on all exports
6. **Consistency:** Follow established patterns

## Adding New Components

1. Create component file in appropriate directory
2. Add to barrel export (`index.ts`)
3. Create test file in `__tests__/`
4. Update documentation

Example:

```tsx
// src/components/ui/NewComponent.tsx
'use client';

import React from 'react';
import { THEME_CONSTANTS } from '@/constants/theme';

interface NewComponentProps {
  // props
}

export default function NewComponent(props: NewComponentProps) {
  // implementation
}
```

```tsx
// src/components/ui/index.ts
export { default as NewComponent } from './NewComponent';
```

## Next Steps

- Review [Component Documentation](./components/README.md)
- Learn [Development Workflow](./development.md)
- Understand [Testing Guidelines](./guides/testing.md)
