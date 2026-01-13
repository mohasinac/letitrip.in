# Theme System

The library includes a comprehensive design system with CSS design tokens and Tailwind configuration.

## Contents

- **CSS Design Tokens**: 7 token files with CSS custom properties
- **Tailwind Configuration**: Pre-configured Tailwind theme
- **Dark Mode Support**: Theme switching utilities

## Usage

### 1. Import CSS Tokens

In your app's global CSS or `_app.tsx`:

```css
/* Import all tokens */
@import '@letitrip/react-library/styles/tokens';

/* Or import specific token files */
@import '@letitrip/react-library/styles/tokens/colors.css';
@import '@letitrip/react-library/styles/tokens/typography.css';
```

### 2. Use Tailwind Configuration

Extend your `tailwind.config.js` with the library's theme:

```javascript
const libraryConfig = require('@letitrip/react-library/tailwind.config.js');

module.exports = {
  ...libraryConfig,
  content: [
    ...libraryConfig.content,
    './src/**/*.{js,ts,jsx,tsx}',
  ],
};
```

Or manually add the token references:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          // ... more variants
        },
      },
    },
  },
};
```

### 3. Use CSS Variables Directly

```css
.my-component {
  color: var(--color-primary);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-md);
  border-radius: var(--radius-md);
}
```

## Design Tokens

### Colors (`colors.css`)

- **Brand Colors**: primary, secondary
- **Semantic Colors**: success, warning, error/danger, info
- **Neutral Scale**: gray-50 through gray-950
- **Background Colors**: bg-primary, bg-secondary, bg-tertiary, etc.
- **Text Colors**: text-primary, text-secondary, text-muted, etc.
- **Border Colors**: border-primary, border-secondary, border-focus
- **Status Colors**: status-pending, status-processing, etc.
- **Auction Colors**: auction-active, auction-ending, auction-ended
- **RipLimit Colors**: riplimit, riplimit-bg, riplimit-blocked

### Typography (`typography.css`)

- Font families: sans, serif, mono
- Font sizes: 2xs through 9xl
- Font weights: 100-900
- Line heights: tight, normal, relaxed, loose
- Letter spacing

### Spacing (`spacing.css`)

- Standard scale: 0-96 (0rem-24rem)
- Custom values: 13, 15, 17, 18, 22, 26, 30, etc.
- Viewport-based: vh-* and vw-* units

### Shadows (`shadows.css`)

- Elevation shadows: xs, sm, md, lg, xl, 2xl
- Inner shadow
- Focus ring
- Colored shadows

### Borders (`borders.css`)

- Border widths: 0-8
- Border radius: sm, md, lg, xl, 2xl, full
- Border styles

### Animations (`animations.css`)

- Timing functions: ease-in, ease-out, ease-in-out
- Durations: 75ms-1000ms
- Transitions: all, colors, opacity, shadow, transform

## Dark Mode

The theme supports dark mode via CSS class or data attribute:

```html
<!-- Using class -->
<html class="dark">

<!-- Using data attribute -->
<html data-theme="dark">
```

Configure in Tailwind:

```javascript
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  // ...
};
```

## Available CSS Variables

### Colors

```css
--color-primary
--color-primary-hover
--color-primary-light
--color-primary-dark
--color-primary-50 through --color-primary-900

--color-secondary
--color-success
--color-warning
--color-error
--color-info

--color-bg-primary
--color-bg-secondary
--color-text-primary
--color-text-secondary
--color-border-primary
```

### Typography

```css
--font-sans
--font-serif
--font-mono

--text-xs through --text-9xl
--font-thin through --font-black
--leading-tight through --leading-loose
```

### Spacing

```css
--spacing-0 through --spacing-96
--spacing-px
```

### Shadows

```css
--shadow-xs
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl
--shadow-2xl
--shadow-inner
--shadow-focus-ring
```

### Borders

```css
--border-width-0 through --border-width-8
--radius-sm
--radius-md
--radius-lg
--radius-xl
--radius-2xl
--radius-full
```

### Z-Index

```css
--z-index-dropdown: 1000
--z-index-sticky: 1100
--z-index-fixed: 1200
--z-index-backdrop: 1300
--z-index-modal: 1400
--z-index-popover: 1500
--z-index-tooltip: 1600
--z-index-toast: 1700
```

## Tailwind Classes

With the tokens imported, you can use semantic Tailwind classes:

```jsx
<div className="bg-primary text-white border-primary rounded-md shadow-token-md">
  <h1 className="text-content-primary">Title</h1>
  <p className="text-content-secondary">Description</p>
</div>
```

## Best Practices

1. **Use CSS Variables**: Prefer CSS variables over hardcoded values for themability
2. **Semantic Colors**: Use semantic color names (primary, success, error) not raw values
3. **Consistent Spacing**: Use the spacing scale instead of arbitrary values
4. **Shadow System**: Use predefined shadows for consistent elevation
5. **Border Radius**: Use token-based radius values for consistency

## Example Component

```tsx
import { cn } from '@letitrip/react-library/utils';

function Card({ className, children }) {
  return (
    <div
      className={cn(
        'bg-surface-primary',
        'text-content-primary',
        'border border-line-primary',
        'rounded-token-lg',
        'shadow-token-md',
        'p-4',
        className
      )}
    >
      {children}
    </div>
  );
}
```

## Migration from Old Styles

If you're migrating from hardcoded colors:

```css
/* Old */
.button {
  background: #ca8a04;
  color: white;
}

/* New */
.button {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}
```

Or with Tailwind:

```jsx
// Old
<button className="bg-yellow-600 text-white">

// New
<button className="bg-primary text-text-inverse">
```
