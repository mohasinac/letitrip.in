# Styles Folder

This folder contains global CSS styles and design tokens.

## Files

### tokens/

**Purpose:** Design system tokens (colors, spacing, typography)

Contains CSS custom properties (variables) for:

- Colors (primary, secondary, success, error, etc.)
- Spacing scale (4px, 8px, 16px, etc.)
- Typography (font families, sizes, weights)
- Border radius values
- Shadow definitions
- Animation timings

---

### accessibility.css

**Purpose:** Accessibility-focused styles

**Includes:**

- Focus visible styles
- Skip to content links
- Screen reader only text
- Reduced motion media queries
- High contrast mode styles
- Keyboard navigation indicators

---

### mobile-optimizations.css

**Purpose:** Mobile-specific optimizations

**Includes:**

- Touch target sizes (min 48px)
- Mobile-friendly inputs
- Scroll behavior
- Safe area insets
- Pull-to-refresh prevention
- Mobile viewport fixes

---

## Design Tokens Structure

### Colors

```css
:root {
  --color-primary: #facc15; /* Yellow */
  --color-primary-dark: #ca8a04;
  --color-secondary: #6b7280; /* Gray */
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  --color-info: #3b82f6;

  /* Dark mode */
  --color-bg: #ffffff;
  --color-text: #111827;
}

[data-theme="dark"] {
  --color-bg: #111827;
  --color-text: #f9fafb;
}
```

### Spacing

```css
:root {
  --spacing-1: 0.25rem; /* 4px */
  --spacing-2: 0.5rem; /* 8px */
  --spacing-3: 0.75rem; /* 12px */
  --spacing-4: 1rem; /* 16px */
  --spacing-6: 1.5rem; /* 24px */
  --spacing-8: 2rem; /* 32px */
}
```

### Typography

```css
:root {
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
}
```

---

## Mobile Optimizations

### Touch Targets

```css
/* Minimum 48x48px touch targets */
.btn,
.link,
input,
button {
  min-height: 48px;
  min-width: 48px;
}
```

### Safe Area Insets

```css
/* iPhone notch/home indicator */
.container {
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### Scroll Behavior

```css
/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Pull-to-refresh prevention */
body {
  overscroll-behavior-y: contain;
}
```

---

## Accessibility Features

### Focus Indicators

```css
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Skip Links

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: black;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### Screen Reader Only

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Global Styles

### Box Sizing

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

### Typography

```css
body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-bg);
}
```

### Dark Mode

```css
/* Handled by ThemeContext + Tailwind dark mode */
[data-theme="dark"] {
  /* Dark mode CSS variables */
}
```

---

## Best Practices

### Design Tokens

- Use CSS custom properties for theming
- Define tokens in `:root`
- Override in `[data-theme="dark"]` for dark mode
- Use semantic naming (--color-primary, not --yellow-500)

### Mobile First

- Start with mobile styles
- Add desktop styles with min-width media queries
- Use relative units (rem, em, %)
- Test on real devices

### Accessibility

- Always include focus styles
- Use semantic HTML
- Provide skip links
- Support keyboard navigation
- Test with screen readers
- Support reduced motion preference

### Performance

- Minimize CSS bundle size
- Use Tailwind for utility classes
- Avoid deep nesting
- Use CSS containment where appropriate
