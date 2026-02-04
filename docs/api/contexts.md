# Context Providers API

Complete API reference for React Context providers.

## Overview

LetItRip provides a centralized Theme Context for managing application-wide theme state.

## ThemeProvider

Provides theme and dark mode management across the application.

### Import

```tsx
import { ThemeProvider } from '@/contexts';
```

### Signature

```typescript
function ThemeProvider({ children }: { children: React.ReactNode }): JSX.Element
```

### Usage

Wrap your app in `ThemeProvider` (typically in `layout.tsx`):

```tsx
// app/layout.tsx
import { ThemeProvider } from '@/contexts';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Provided Context

```typescript
interface ThemeContextType {
  // Current theme mode
  theme: 'light' | 'dark';
  
  // Toggle between light/dark
  toggleTheme: () => void;
  
  // Set specific theme
  setTheme: (theme: 'light' | 'dark') => void;
}
```

---

## useTheme Hook

Access theme context in any component.

### Import

```tsx
import { useTheme } from '@/contexts';
```

### Signature

```typescript
function useTheme(): ThemeContextType
```

### Example

```tsx
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
```

### Complete Example

```tsx
import { useTheme } from '@/contexts';
import { Button } from '@/components';

function Settings() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div>
      <h2>Theme Settings</h2>
      <div>
        <Button
          variant={theme === 'light' ? 'primary' : 'outline'}
          onClick={() => setTheme('light')}
        >
          Light Mode
        </Button>
        <Button
          variant={theme === 'dark' ? 'primary' : 'outline'}
          onClick={() => setTheme('dark')}
        >
          Dark Mode
        </Button>
      </div>
    </div>
  );
}
```

---

## Theme Persistence

Theme preference is automatically saved to `localStorage`:

```typescript
// Automatic persistence
const { theme } = useTheme(); // Reads from localStorage on mount

// Manual access
const savedTheme = localStorage.getItem('theme');
```

---

## Theme Detection

The `ThemeProvider` automatically detects system preference on first load:

```typescript
// Detects system preference if no saved preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

---

## CSS Variables

Theme modes apply CSS variables dynamically:

```css
/* Light mode (default) */
:root {
  --color-background: #ffffff;
  --color-text: #1a1a1a;
  /* ... */
}

/* Dark mode */
[data-theme="dark"] {
  --color-background: #1a1a1a;
  --color-text: #ffffff;
  /* ... */
}
```

### Usage in Components

```tsx
function CustomComponent() {
  return (
    <div style={{
      backgroundColor: 'var(--color-background)',
      color: 'var(--color-text)',
    }}>
      Content
    </div>
  );
}
```

---

## ThemeMode Type

Type definition for theme modes:

```typescript
export type ThemeMode = 'light' | 'dark';
```

### Example

```tsx
import type { ThemeMode } from '@/constants/theme';

function setCustomTheme(mode: ThemeMode) {
  // Type-safe theme setting
}
```

---

## Testing with ThemeContext

### Test Setup

```tsx
import { render } from '@testing-library/react';
import { ThemeProvider } from '@/contexts';

function renderWithTheme(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
}
```

### Testing Theme Changes

```tsx
import { screen, fireEvent } from '@testing-library/react';

test('toggles theme', () => {
  renderWithTheme(<ThemeToggle />);
  
  const button = screen.getByRole('button');
  fireEvent.click(button);
  
  // Verify theme changed
});
```

### Mock Theme Context

```tsx
import { ThemeContext } from '@/contexts/ThemeContext';

const mockThemeContext = {
  theme: 'dark' as const,
  toggleTheme: jest.fn(),
  setTheme: jest.fn(),
};

render(
  <ThemeContext.Provider value={mockThemeContext}>
    <YourComponent />
  </ThemeContext.Provider>
);
```

---

## Advanced Usage

### Custom Theme Hook

Create custom hooks that depend on theme:

```tsx
import { useTheme } from '@/contexts';
import { useMemo } from 'react';

function useThemedStyles() {
  const { theme } = useTheme();
  
  return useMemo(() => ({
    container: {
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
    },
  }), [theme]);
}
```

### Conditional Rendering by Theme

```tsx
function Logo() {
  const { theme } = useTheme();
  
  return (
    <img
      src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
      alt="Logo"
    />
  );
}
```

### Theme Transition

```tsx
function App() {
  const { theme } = useTheme();
  
  return (
    <div
      style={{
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
      data-theme={theme}
    >
      Content
    </div>
  );
}
```

---

## Best Practices

### 1. Use ThemeProvider at Root

Always wrap your app at the highest level:

```tsx
// ✅ Good
<ThemeProvider>
  <App />
</ThemeProvider>

// ❌ Bad - nested providers
<App>
  <ThemeProvider>
    <Page />
  </ThemeProvider>
</App>
```

### 2. Prefer CSS Variables

Use CSS variables over inline styles:

```tsx
// ✅ Good
<div className="themed-component">
  Content
</div>

// CSS
.themed-component {
  background-color: var(--color-background);
}

// ❌ Bad
<div style={{
  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
}}>
  Content
</div>
```

### 3. Memoize Theme-Dependent Values

```tsx
const styles = useMemo(() => ({
  // Styles based on theme
}), [theme]);
```

### 4. Handle SSR

Prevent flash of wrong theme:

```tsx
// In your HTML
<script>
  const theme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
</script>
```

---

## Error Handling

### useTheme Outside Provider

```tsx
function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  
  return context;
}
```

**Error Example:**
```tsx
// ❌ This will throw
function Component() {
  const { theme } = useTheme(); // No ThemeProvider ancestor
}
```

---

## Browser Support

### localStorage

Gracefully handles environments without localStorage:

```typescript
try {
  localStorage.setItem('theme', theme);
} catch (error) {
  console.warn('localStorage not available');
}
```

### matchMedia

Falls back to light mode if not supported:

```typescript
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
```

---

## Next Steps

- Review [Theming Guide](../guides/theming.md)
- Explore [Component Variants](../components/README.md)
- Check [Testing Guide](../guides/testing.md)
