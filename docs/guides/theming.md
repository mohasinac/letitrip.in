# Theme System

Complete guide to the theming system in LetItRip.

## Overview

The theme system provides:
- 🎨 **Centralized Design Tokens** - All colors, spacing, and styles in one place
- 🌓 **Dark Mode Support** - Automatic light/dark mode with persistence
- 🔧 **Type-Safe** - Full TypeScript support
- 📱 **Mobile-First** - Responsive by default
- ♿ **Accessible** - WCAG compliant color contrasts

## Theme Constants

All theme values are defined in `src/constants/theme.ts`:

```typescript
import { THEME_CONSTANTS } from '@/constants/theme';

const {
  colors,      // Color palette
  themed,      // Dark mode classes
  card,        // Card variants
  button,      // Button variants
  input,       // Input states
  badge,       // Badge variants
  // ... more
} = THEME_CONSTANTS;
```

## Color System

### Base Colors

```typescript
colors: {
  // Primary brand color
  primary: '#3B82F6',
  
  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Grayscale
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    // ... through 900
  }
}
```

### Usage in Components

```tsx
import { THEME_CONSTANTS } from '@/constants/theme';

function MyComponent() {
  const { colors } = THEME_CONSTANTS;
  
  return (
    <div style={{ color: colors.primary }}>
      Primary colored text
    </div>
  );
}
```

## Dark Mode

### ThemeProvider

Wrap your app with `ThemeProvider`:

```tsx
import { ThemeProvider } from '@/contexts';

function App({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
```

### useTheme Hook

Access and control theme:

```tsx
import { useTheme } from '@/contexts';

function ThemeToggle() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
```

### Theme Detection

Automatic system preference detection:

```tsx
// On mount, checks:
// 1. localStorage ('light' | 'dark')
// 2. System preference (prefers-color-scheme)
// 3. Defaults to 'light'
```

### Dark Mode Classes

Use themed utilities for dynamic classes:

```tsx
const { themed } = THEME_CONSTANTS;

// Background colors
themed.bgPrimary    // bg-white dark:bg-gray-900
themed.bgSecondary  // bg-gray-50 dark:bg-gray-800
themed.bgTertiary   // bg-gray-100 dark:bg-gray-700

// Text colors
themed.textPrimary  // text-gray-900 dark:text-gray-100
themed.textSecondary // text-gray-700 dark:text-gray-300
themed.textMuted    // text-gray-500 dark:text-gray-400

// Border colors
themed.border       // border-gray-200 dark:border-gray-700
themed.borderLight  // border-gray-100 dark:border-gray-800

// Interactive states
themed.hover        // hover:bg-gray-50 dark:hover:bg-gray-800
themed.hoverCard    // hover:bg-gray-100 dark:hover:bg-gray-700
```

**Example:**
```tsx
<div className={`
  ${themed.bgPrimary}
  ${themed.textPrimary}
  ${themed.border}
  ${themed.hover}
`}>
  Dark mode ready!
</div>
```

## Component Variants

### Button Variants

```typescript
button: {
  primary: {
    base: 'bg-primary-600 text-white',
    hover: 'hover:bg-primary-700',
    active: 'active:bg-primary-800',
    disabled: 'disabled:bg-gray-300',
  },
  secondary: {
    base: 'bg-gray-600 text-white',
    hover: 'hover:bg-gray-700',
    // ...
  },
  // ... more variants
}
```

**Usage:**
```tsx
const { button } = THEME_CONSTANTS;

<button className={`
  ${button.primary.base}
  ${button.primary.hover}
  ${button.primary.active}
`}>
  Primary Button
</button>
```

### Card Variants

```typescript
card: {
  elevated: {
    container: 'bg-white dark:bg-gray-800 shadow-lg',
    border: '',
  },
  outlined: {
    container: 'bg-transparent',
    border: 'border border-gray-200 dark:border-gray-700',
  },
  filled: {
    container: 'bg-gray-50 dark:bg-gray-900',
    border: '',
  },
}
```

### Badge Variants

```typescript
badge: {
  default: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-800 dark:text-gray-200',
    border: 'border-gray-200 dark:border-gray-600',
  },
  primary: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-700',
  },
  // ... more variants
}
```

## Input States

```typescript
input: {
  base: {
    border: 'border-gray-300 dark:border-gray-600',
    bg: 'bg-white dark:bg-gray-800',
    text: 'text-gray-900 dark:text-gray-100',
    placeholder: 'placeholder-gray-400 dark:placeholder-gray-500',
  },
  focus: {
    border: 'focus:border-primary-500 dark:focus:border-primary-400',
    ring: 'focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800',
  },
  error: {
    border: 'border-red-500 dark:border-red-400',
    ring: 'ring-2 ring-red-200 dark:ring-red-800',
  },
  disabled: {
    bg: 'bg-gray-100 dark:bg-gray-900',
    text: 'text-gray-400 dark:text-gray-600',
    cursor: 'cursor-not-allowed',
  },
}
```

## Alert Variants

```typescript
colors.alert: {
  info: {
    container: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-900 dark:text-blue-100',
    text: 'text-blue-700 dark:text-blue-300',
  },
  success: { /* ... */ },
  warning: { /* ... */ },
  error: { /* ... */ },
}
```

## Customization

### Method 1: Extend Theme Constants

```typescript
// src/constants/theme.ts
export const THEME_CONSTANTS = {
  // ... existing
  
  // Add custom values
  custom: {
    myColor: '#FF5733',
    mySpacing: '1.5rem',
  },
};
```

### Method 2: Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          // ... through 900
        },
      },
    },
  },
};
```

### Method 3: CSS Variables

```css
/* globals.css */
:root {
  --custom-spacing: 1.5rem;
  --custom-radius: 0.5rem;
}

.dark {
  --custom-spacing: 2rem;
}
```

## Responsive Design

### Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large */
2xl: 1536px /* 2X Extra large */
```

**Usage:**
```tsx
<div className="
  px-4         /* Mobile */
  md:px-8      /* Tablet */
  lg:px-16     /* Desktop */
">
  Responsive padding
</div>
```

### Mobile-First Approach

Components are designed mobile-first:

```tsx
// Mobile default
<Button size="sm" fullWidth>
  Mobile Button
</Button>

// Desktop override
<Button 
  size="sm" 
  fullWidth 
  className="md:w-auto md:size-md"
>
  Responsive Button
</Button>
```

## Typography Scale

```typescript
typography: {
  h1: 'text-4xl md:text-5xl font-bold',
  h2: 'text-3xl md:text-4xl font-bold',
  h3: 'text-2xl md:text-3xl font-semibold',
  h4: 'text-xl md:text-2xl font-semibold',
  h5: 'text-lg md:text-xl font-medium',
  h6: 'text-base md:text-lg font-medium',
  body: 'text-base',
  small: 'text-sm',
  caption: 'text-xs',
}
```

## Shadows

```typescript
shadows: {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  inner: 'shadow-inner',
}
```

## Transitions

```typescript
transitions: {
  fast: 'transition-all duration-150',
  normal: 'transition-all duration-200',
  slow: 'transition-all duration-300',
}
```

## Best Practices

### 1. Always Use Theme Constants

```tsx
// ✅ Good
import { THEME_CONSTANTS } from '@/constants/theme';
const { themed } = THEME_CONSTANTS;

<div className={themed.bgPrimary}>Content</div>

// ❌ Avoid
<div className="bg-white dark:bg-gray-900">Content</div>
```

### 2. Prefer Semantic Naming

```tsx
// ✅ Good
const { colors } = THEME_CONSTANTS;
backgroundColor: colors.primary

// ❌ Avoid
backgroundColor: '#3B82F6'
```

### 3. Test Both Themes

Always test components in light and dark mode:

```tsx
// In your tests
test('renders in dark mode', () => {
  document.documentElement.classList.add('dark');
  render(<MyComponent />);
  // assertions
});
```

### 4. Maintain Contrast Ratios

Ensure WCAG AA compliance:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### 5. Document Custom Themes

If you extend the theme, document it:

```tsx
/**
 * Custom brand color for marketing pages
 * @see src/constants/theme.ts
 */
const BRAND_COLOR = '#FF5733';
```

## Theme Utilities

### Check Current Theme

```tsx
const { theme } = useTheme();

if (theme === 'dark') {
  // Dark mode specific logic
}
```

### Force Theme

```tsx
const { setTheme } = useTheme();

// Force dark mode
setTheme('dark');

// Force light mode
setTheme('light');
```

### Persist Theme

Theme is automatically persisted to `localStorage`:

```typescript
// Key: 'theme'
// Value: 'light' | 'dark'
```

## Troubleshooting

### Dark Mode Not Working

1. Check ThemeProvider is at root
2. Verify HTML has `dark` class
3. Check localStorage value
4. Clear cache and restart

### Colors Not Updating

1. Ensure importing from `@/constants/theme`
2. Check Tailwind JIT is running
3. Verify no conflicting styles
4. Restart dev server

### TypeScript Errors

```bash
# Regenerate types
npm run build
```

## Examples

### Complete Themed Component

```tsx
import { THEME_CONSTANTS } from '@/constants/theme';

function ThemedCard({ children }) {
  const { card, themed } = THEME_CONSTANTS;
  
  return (
    <div className={`
      ${card.elevated.container}
      ${themed.border}
      ${themed.hover}
      rounded-xl p-6
    `}>
      {children}
    </div>
  );
}
```

### Dynamic Theme Variant

```tsx
function DynamicButton({ variant = 'primary' }) {
  const { button } = THEME_CONSTANTS;
  const styles = button[variant];
  
  return (
    <button className={`
      ${styles.base}
      ${styles.hover}
      ${styles.active}
      px-4 py-2 rounded-lg
    `}>
      Click me
    </button>
  );
}
```

## Next Steps

- Explore [Component Documentation](../components/README.md)
- Review [Accessibility Guide](./accessibility.md)
- Check [Development Guide](../development.md)
