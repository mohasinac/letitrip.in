# Constants & Configuration

Complete reference for application constants and configuration values.

## Overview

Centralized constants for consistent theming, styling, and configuration across the application.

## THEME_CONSTANTS

Core theme configuration and design system tokens.

### Import

```tsx
import { THEME_CONSTANTS } from '@/constants/theme';
```

### Complete Reference

```typescript
export const THEME_CONSTANTS = {
  // Color Palette
  colors: {
    // Primary brand colors
    primary: {
      light: '#3B82F6',    // Blue-500
      DEFAULT: '#2563EB',  // Blue-600
      dark: '#1D4ED8',     // Blue-700
    },
    
    // Secondary colors
    secondary: {
      light: '#8B5CF6',    // Purple-500
      DEFAULT: '#7C3AED',  // Purple-600
      dark: '#6D28D9',     // Purple-700
    },
    
    // Semantic colors
    success: {
      light: '#10B981',    // Green-500
      DEFAULT: '#059669',  // Green-600
      dark: '#047857',     // Green-700
    },
    
    error: {
      light: '#EF4444',    // Red-500
      DEFAULT: '#DC2626',  // Red-600
      dark: '#B91C1C',     // Red-700
    },
    
    warning: {
      light: '#F59E0B',    // Amber-500
      DEFAULT: '#D97706',  // Amber-600
      dark: '#B45309',     // Amber-700
    },
    
    info: {
      light: '#06B6D4',    // Cyan-500
      DEFAULT: '#0891B2',  // Cyan-600
      dark: '#0E7490',     // Cyan-700
    },
    
    // Neutral grays
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },

  // Dark Mode Colors
  darkMode: {
    background: {
      primary: '#0F172A',    // Slate-900
      secondary: '#1E293B',  // Slate-800
      tertiary: '#334155',   // Slate-700
    },
    
    text: {
      primary: '#F8FAFC',    // Slate-50
      secondary: '#CBD5E1',  // Slate-300
      tertiary: '#94A3B8',   // Slate-400
    },
    
    border: {
      light: '#334155',      // Slate-700
      DEFAULT: '#475569',    // Slate-600
      dark: '#64748B',       // Slate-500
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
    },
    
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },

  // Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Z-Index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;
```

---

## Navigation Items

Navigation configuration for the application.

### Import

```tsx
import { NAV_ITEMS } from '@/constants/theme';
```

### Type Definition

```typescript
export interface NavigationItem {
  name: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavigationItem[];
}
```

### Example Configuration

```typescript
export const NAV_ITEMS: NavigationItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: 'home',
  },
  {
    name: 'Components',
    href: '/components',
    icon: 'grid',
    children: [
      { name: 'Buttons', href: '/components/buttons' },
      { name: 'Forms', href: '/components/forms' },
      { name: 'Modals', href: '/components/modals' },
    ],
  },
  {
    name: 'Documentation',
    href: '/docs',
    icon: 'book',
    badge: 'New',
  },
];
```

---

## Usage Examples

### Using Colors

```tsx
import { THEME_CONSTANTS } from '@/constants/theme';

function PrimaryButton() {
  return (
    <button
      style={{
        backgroundColor: THEME_CONSTANTS.colors.primary.DEFAULT,
        color: 'white',
      }}
    >
      Click me
    </button>
  );
}
```

### Using Typography

```tsx
function Heading() {
  return (
    <h1
      style={{
        fontSize: THEME_CONSTANTS.typography.fontSize['3xl'],
        fontWeight: THEME_CONSTANTS.typography.fontWeight.bold,
        lineHeight: THEME_CONSTANTS.typography.lineHeight.tight,
      }}
    >
      Title
    </h1>
  );
}
```

### Using Spacing

```tsx
function Card() {
  return (
    <div
      style={{
        padding: THEME_CONSTANTS.spacing.lg,
        margin: THEME_CONSTANTS.spacing.md,
      }}
    >
      Content
    </div>
  );
}
```

### Using Dark Mode Colors

```tsx
function DarkCard() {
  const { theme } = useTheme();
  
  return (
    <div
      style={{
        backgroundColor: theme === 'dark'
          ? THEME_CONSTANTS.darkMode.background.primary
          : THEME_CONSTANTS.colors.gray[50],
        color: theme === 'dark'
          ? THEME_CONSTANTS.darkMode.text.primary
          : THEME_CONSTANTS.colors.gray[900],
      }}
    >
      Content
    </div>
  );
}
```

### Using Shadows

```tsx
function ElevatedCard() {
  return (
    <div
      style={{
        boxShadow: THEME_CONSTANTS.shadows.lg,
        borderRadius: THEME_CONSTANTS.borderRadius.lg,
      }}
    >
      Elevated content
    </div>
  );
}
```

### Using Z-Index

```tsx
function Modal() {
  return (
    <>
      <div
        style={{ zIndex: THEME_CONSTANTS.zIndex.modalBackdrop }}
        className="backdrop"
      />
      <div
        style={{ zIndex: THEME_CONSTANTS.zIndex.modal }}
        className="modal"
      >
        Modal content
      </div>
    </>
  );
}
```

### Responsive with Breakpoints

```tsx
function ResponsiveGrid() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        [`@media (min-width: ${THEME_CONSTANTS.breakpoints.md})`]: {
          gridTemplateColumns: '1fr 1fr',
        },
      }}
    >
      Content
    </div>
  );
}
```

---

## TypeScript Support

All constants are fully typed and use `as const` for literal types:

```typescript
// Type-safe access
const primaryColor: '#2563EB' = THEME_CONSTANTS.colors.primary.DEFAULT;

// Autocomplete support
const spacing = THEME_CONSTANTS.spacing.md; // IDE suggests all spacing values

// Type inference
type ColorKey = keyof typeof THEME_CONSTANTS.colors; // 'primary' | 'secondary' | ...
```

---

## Extending Constants

### Custom Colors

```tsx
// Create a custom theme
const CUSTOM_THEME = {
  ...THEME_CONSTANTS,
  colors: {
    ...THEME_CONSTANTS.colors,
    brand: {
      light: '#FF6B6B',
      DEFAULT: '#EE5A5A',
      dark: '#DD4949',
    },
  },
};
```

### Custom Breakpoints

```tsx
const CUSTOM_BREAKPOINTS = {
  ...THEME_CONSTANTS.breakpoints,
  '3xl': '1920px',
  '4xl': '2560px',
};
```

---

## CSS Variable Integration

Constants are synchronized with CSS variables:

```css
:root {
  --color-primary: #2563EB;
  --spacing-md: 1rem;
  --border-radius-lg: 0.5rem;
  /* ... */
}
```

Access in components:

```tsx
<div style={{ color: 'var(--color-primary)' }}>
  Content
</div>
```

---

## Best Practices

### 1. Use Constants Over Magic Values

```tsx
// ✅ Good
<div style={{ padding: THEME_CONSTANTS.spacing.md }}>

// ❌ Bad
<div style={{ padding: '16px' }}>
```

### 2. Destructure for Cleaner Code

```tsx
const { colors, spacing } = THEME_CONSTANTS;

<button
  style={{
    backgroundColor: colors.primary.DEFAULT,
    padding: spacing.md,
  }}
>
```

### 3. Use Semantic Colors

```tsx
// ✅ Good - semantic
backgroundColor: colors.error.DEFAULT

// ❌ Bad - specific color
backgroundColor: '#DC2626'
```

### 4. Leverage TypeScript

```tsx
type ColorVariant = keyof typeof THEME_CONSTANTS.colors;

function getColor(variant: ColorVariant) {
  return THEME_CONSTANTS.colors[variant].DEFAULT;
}
```

---

## Testing

Mock constants in tests:

```tsx
jest.mock('@/constants/theme', () => ({
  THEME_CONSTANTS: {
    colors: {
      primary: { DEFAULT: '#000000' },
    },
  },
}));
```

---

## Next Steps

- Review [Theming Guide](../guides/theming.md)
- Explore [Component Variants](../components/README.md)
- Check [Project Structure](../project-structure.md)
