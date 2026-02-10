# Styling Guide

> **Complete reference for uniform styling across the LetItRip application**
>
> Last Updated: February 10, 2026

## Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Global Styling System](#global-styling-system)
4. [Using THEME_CONSTANTS](#using-theme_constants)
5. [CSS Utility Classes](#css-utility-classes)
6. [Component Patterns](#component-patterns)
7. [Dark Mode](#dark-mode)
8. [Common Patterns](#common-patterns)
9. [Best Practices](#best-practices)
10. [Migration Guide](#migration-guide)

---

## Overview

The LetItRip styling system is built on **three core layers**:

1. **globals.css** - CSS custom properties, base styles, utility classes, animations
2. **THEME_CONSTANTS** - JavaScript constants for Tailwind classes
3. **Tailwind Config** - Theme extensions, colors, animations

This layered approach ensures:

- ✅ Uniform styling across all pages and components
- ✅ Zero inline styles (except for dynamic values)
- ✅ Full dark mode support
- ✅ Accessibility-first design
- ✅ Easy maintenance and updates

---

## Core Principles

### 1. **NO Inline Styles** (except dynamic values)

```tsx
// ❌ WRONG - Static inline styles
<div style={{ backgroundColor: "#ffffff", padding: "24px" }}>

// ✅ RIGHT - Use utility classes or THEME_CONSTANTS
<div className="bg-white dark:bg-gray-900 p-6">

// ✅ ALLOWED - Dynamic calculated values
<div style={{ width: `${percentage}%`, height: `${height}px` }}>
```

### 2. **Use THEME_CONSTANTS for All Repeated Patterns**

```tsx
// ❌ WRONG - Raw Tailwind everywhere
<div className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">

// ✅ RIGHT - Import and use constants
import { THEME_CONSTANTS } from '@/constants';
const { themed } = THEME_CONSTANTS;
<div className={`${themed.bgSecondary} ${themed.border}`}>
```

### 3. **Use Utility Classes from globals.css**

```tsx
// ❌ WRONG - Repeating long class strings
<button className="inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white">

// ✅ RIGHT - Use predefined utility class
<button className="btn btn-primary">
```

---

## Global Styling System

### CSS Custom Properties (CSS Variables)

Located in `src/app/globals.css`, these automatically switch with dark mode:

```css
:root {
  --bg-primary: 249 250 251; /* gray-50 */
  --bg-secondary: 255 255 255; /* white */
  --text-primary: 17 24 39; /* gray-900 */
  --border-primary: 229 231 235; /* gray-200 */
  /* ... more variables */
}

.dark {
  --bg-primary: 3 7 18; /* gray-950 */
  --bg-secondary: 17 24 39; /* gray-900 */
  --text-primary: 243 244 246; /* gray-100 */
  --border-primary: 31 41 55; /* gray-800 */
  /* ... dark mode overrides */
}
```

### Component Layer Utilities

Pre-built component classes in `@layer components`:

| Class            | Description               | Usage                                  |
| ---------------- | ------------------------- | -------------------------------------- |
| `.btn`           | Base button style         | `<button className="btn btn-primary">` |
| `.btn-primary`   | Primary gradient button   | Applied with `.btn`                    |
| `.btn-secondary` | Secondary gradient button | Applied with `.btn`                    |
| `.btn-outline`   | Outlined button           | Applied with `.btn`                    |
| `.input-base`    | Base input styling        | `<input className="input-base">`       |
| `.card`          | Card container            | `<div className="card">`               |
| `.card-hover`    | Card with hover effect    | `<div className="card card-hover">`    |
| `.card-bordered` | Card with border          | `<div className="card card-bordered">` |

**Typography Classes:**

| Class        | Usage                        |
| ------------ | ---------------------------- |
| `.heading-1` | `<h1 className="heading-1">` |
| `.heading-2` | `<h2 className="heading-2">` |
| `.heading-3` | `<h3 className="heading-3">` |
| `.body-text` | `<p className="body-text">`  |

**Container Classes:**

| Class              | Description                      |
| ------------------ | -------------------------------- |
| `.container-max`   | Max-width container with padding |
| `.section-spacing` | Vertical spacing for sections    |
| `.stack-spacing`   | Vertical spacing for stacks      |

**Gradient Classes:**

| Class                 | Usage                         |
| --------------------- | ----------------------------- |
| `.gradient-primary`   | Primary gradient background   |
| `.gradient-secondary` | Secondary gradient background |
| `.gradient-accent`    | Accent gradient background    |
| `.gradient-text`      | Gradient text effect          |

---

## Using THEME_CONSTANTS

Import from `@/constants` (barrel import):

```tsx
import { THEME_CONSTANTS } from "@/constants";
```

### Destructuring Pattern

```tsx
const { themed, spacing, typography, card, button, input, layout } =
  THEME_CONSTANTS;

return (
  <div className={`${themed.bgPrimary} ${spacing.section}`}>
    <h1 className={typography.h1}>Title</h1>
    <div className={`${card.base} ${themed.bgSecondary} ${card.shadow}`}>
      Content
    </div>
  </div>
);
```

### Complete THEME_CONSTANTS Reference

#### `themed` - Theme-aware colors

| Constant               | Classes                                        | When to Use             |
| ---------------------- | ---------------------------------------------- | ----------------------- |
| `themed.bgPrimary`     | `bg-gray-50 dark:bg-gray-950`                  | Main page background    |
| `themed.bgSecondary`   | `bg-white dark:bg-gray-900`                    | Card/modal background   |
| `themed.bgTertiary`    | `bg-gray-100 dark:bg-gray-800`                 | Subtle background areas |
| `themed.bgInput`       | `bg-white dark:bg-gray-900`                    | Input fields            |
| `themed.textPrimary`   | `text-gray-900 dark:text-gray-100`             | Primary text            |
| `themed.textSecondary` | `text-gray-600 dark:text-gray-400`             | Secondary/muted text    |
| `themed.border`        | `border-gray-200 dark:border-gray-800`         | Border colors           |
| `themed.hover`         | `hover:bg-gray-100 dark:hover:bg-gray-800`     | Hover states            |
| `themed.focusRing`     | `focus:ring-blue-500 dark:focus:ring-blue-500` | Focus rings             |

#### `spacing` - Consistent spacing

| Constant             | Classes                                  | When to Use               |
| -------------------- | ---------------------------------------- | ------------------------- |
| `spacing.section`    | `space-y-8 lg:space-y-12 2xl:space-y-16` | Between major sections    |
| `spacing.stack`      | `space-y-4 lg:space-y-6`                 | Stacking elements         |
| `spacing.stackSmall` | `space-y-2 lg:space-y-3`                 | Tight stacking            |
| `spacing.inline`     | `gap-3 lg:gap-4`                         | Inline flexbox/grid gaps  |
| `spacing.gap.md`     | `gap-4`                                  | Fixed gap spacing         |
| `spacing.padding.md` | `p-4 lg:p-6`                             | Padding inside containers |

#### `typography` - Text sizes

| Constant           | Classes                                                       | When to Use         |
| ------------------ | ------------------------------------------------------------- | ------------------- |
| `typography.h1`    | `text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl font-bold`     | Main page titles    |
| `typography.h2`    | `text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl font-bold`     | Section headings    |
| `typography.h3`    | `text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl font-semibold` | Subsection headings |
| `typography.body`  | `text-base lg:text-lg`                                        | Body text           |
| `typography.small` | `text-sm lg:text-base`                                        | Small text          |

#### `card` - Card styling

| Constant      | Classes                                                                   |
| ------------- | ------------------------------------------------------------------------- |
| `card.base`   | `rounded-xl overflow-hidden transition-all`                               |
| `card.shadow` | `shadow-md`                                                               |
| `card.hover`  | `hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-2xl cursor-pointer` |

#### `button` - Button styling

| Constant          | Classes                                                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `button.base`     | `inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed` |
| `button.active`   | `active:scale-95`                                                                                                                                                                                |
| `button.minWidth` | `min-w-[200px] w-full`                                                                                                                                                                           |

#### `colors` - Component colors

```tsx
// Button colors
colors.button.primary;
colors.button.secondary;
colors.button.outline;

// Badge colors
colors.badge.primary;
colors.badge.success;
colors.badge.warning;
colors.badge.danger;

// Alert colors
colors.alert.info.container;
colors.alert.success.icon;
colors.alert.error.text;
```

#### `patterns` - Common Component Patterns (NEW!)

```tsx
// Admin form inputs
<input className={THEME_CONSTANTS.patterns.adminInput} />

// Page container
<div className={THEME_CONSTANTS.patterns.pageContainer}>

// Section container
<section className={THEME_CONSTANTS.patterns.sectionContainer}>

// Form container
<div className={THEME_CONSTANTS.patterns.formContainer}>

// List item
<li className={THEME_CONSTANTS.patterns.listItem}>

// Icon button
<button className={THEME_CONSTANTS.patterns.iconButton}>

// Modal overlay + content
<div className={THEME_CONSTANTS.patterns.modalOverlay}>
  <div className={THEME_CONSTANTS.patterns.modalContent}>
    {/* ... */}
  </div>
</div>

// Empty state
<div className={THEME_CONSTANTS.patterns.emptyState}>
  <p>No items found</p>
</div>

// Loading state
<div className={THEME_CONSTANTS.patterns.loadingState}>
  <LoadingSpinner />
</div>

// Error/Success states
<div className={THEME_CONSTANTS.patterns.errorState}>
<div className={THEME_CONSTANTS.patterns.successState}>
```

#### `states` - Component states

```tsx
<input disabled className={THEME_CONSTANTS.states.disabled} />
<button className={THEME_CONSTANTS.states.loading}>
<input className={THEME_CONSTANTS.states.error}>
```

#### `transitions` - Smooth animations

```tsx
<div className={THEME_CONSTANTS.transitions.default}>
<button className={THEME_CONSTANTS.transitions.fast}>
```

---

## CSS Utility Classes

### Scrollbar Utilities

```tsx
// Hide scrollbar
<div className="scrollbar-hide">

// Thin styled scrollbar
<div className="scrollbar-thin">
```

### Safe Area Utilities (for mobile)

```tsx
<div className="safe-bottom">  {/* Respects iPhone notch */}
<div className="safe-top">
```

### Text Truncation

```tsx
<p className="truncate">Single line truncate</p>
<p className="truncate-2">Two lines...</p>
<p className="truncate-3">Three lines...</p>
<p className="truncate-4">Four lines...</p>
```

### Glassmorphism

```tsx
<div className="glass">Subtle glass effect</div>
<div className="glass-strong">Strong glass effect</div>
```

### Flexbox Shortcuts

```tsx
<div className="flex-center">  {/* flex items-center justify-center */}
<div className="flex-between"> {/* flex items-center justify-between */}
<div className="flex-start">   {/* flex items-center justify-start */}
<div className="flex-end">     {/* flex items-center justify-end */}
```

### Grid Utilities

```tsx
<div className="grid grid-auto-fill gap-4">
  {/* Auto-fills columns at min 250px */}
</div>

<div className="grid grid-auto-fit gap-4">
  {/* Auto-fits columns at min 250px */}
</div>
```

### Text Effects

```tsx
<h1 className="text-shadow-sm">Subtle shadow</h1>
<h1 className="text-shadow-md">Medium shadow</h1>
<h1 className="text-shadow-lg">Strong shadow</h1>
```

### User Select

```tsx
<div className="no-select">Can't be selected</div>
```

---

## Component Patterns

### Standard Page Layout

```tsx
import { THEME_CONSTANTS } from "@/constants";

export default function Page() {
  const { patterns } = THEME_CONSTANTS;

  return (
    <div className={patterns.pageContainer}>
      <section className={patterns.sectionContainer}>
        <h1 className="heading-1">Page Title</h1>
        <div className={patterns.formContainer}>{/* Content */}</div>
      </section>
    </div>
  );
}
```

### Card Pattern

```tsx
import { THEME_CONSTANTS } from '@/constants';

const { card, themed } = THEME_CONSTANTS;

<div className={`${card.base} ${themed.bgSecondary} ${card.shadow} ${card.hover}`}>
  <h3>Card Title</h3>
  <p>Card content</p>
</div>

// OR use utility class
<div className="card card-hover">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>
```

### Button Pattern

```tsx
import { Button } from '@/components';
import { UI_LABELS } from '@/constants';

// Use the Button component (recommended)
<Button variant="primary">
  {UI_LABELS.ACTIONS.SAVE}
</Button>

// OR use utility class
<button className="btn btn-primary">
  {UI_LABELS.ACTIONS.SAVE}
</button>
```

### Form Input Pattern

```tsx
import { FormField } from '@/components';
import { UI_PLACEHOLDERS } from '@/constants';

// Use FormField component (recommended)
<FormField
  type="email"
  placeholder={UI_PLACEHOLDERS.EMAIL}
  className="input-base"
/>

// OR for custom inputs
<input
  type="text"
  className="input-base"
  placeholder={UI_PLACEHOLDERS.EMAIL}
/>

// Admin-style input
<input className={THEME_CONSTANTS.patterns.adminInput} />
```

### Modal Pattern

```tsx
import { THEME_CONSTANTS } from "@/constants";

const { patterns } = THEME_CONSTANTS;

<div className={patterns.modalOverlay}>
  <div className={patterns.modalContent}>
    <h2 className="heading-3">Modal Title</h2>
    <p className="body-text">Modal content...</p>
    <div className="flex-end gap-3">
      <button className="btn btn-outline">Cancel</button>
      <button className="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>;
```

---

## Dark Mode

### How It Works

1. **ThemeContext** (`useTheme()`) manages light/dark state
2. Dark mode adds `.dark` class to `<html>`
3. Tailwind's `dark:` variants activate automatically
4. CSS variables update automatically

### Using Dark Mode

```tsx
import { useTheme } from "@/contexts";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>{theme === "light" ? "🌙" : "☀️"}</button>
  );
}
```

### Styling for Dark Mode

```tsx
// ✅ RIGHT - Use THEME_CONSTANTS (auto dark mode)
<div className={THEME_CONSTANTS.themed.bgPrimary}>

// ✅ RIGHT - Use Tailwind dark: variants
<div className="bg-white dark:bg-gray-900">

// ❌ WRONG - Conditional classes (use THEME_CONSTANTS instead)
<div className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
```

---

## Common Patterns

### Admin Pages

```tsx
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";

const { patterns } = THEME_CONSTANTS;

export default function AdminPage() {
  return (
    <div className={patterns.pageContainer}>
      <section className={patterns.sectionContainer}>
        <h1 className="heading-1">{UI_LABELS.ADMIN.DASHBOARD}</h1>

        <div className={patterns.formContainer}>
          <label className="block mb-2">Field Label</label>
          <input type="text" className={patterns.adminInput} />
        </div>
      </section>
    </div>
  );
}
```

### Lists with Items

```tsx
const { patterns } = THEME_CONSTANTS;

<ul className="space-y-3">
  {items.map((item) => (
    <li key={item.id} className={patterns.listItem}>
      {item.name}
    </li>
  ))}
</ul>;
```

### Empty States

```tsx
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";

{
  items.length === 0 && (
    <div className={THEME_CONSTANTS.patterns.emptyState}>
      <p>{UI_LABELS.EMPTY.NO_DATA}</p>
    </div>
  );
}
```

### Loading States

```tsx
import { LoadingSpinner } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

{
  isLoading && (
    <div className={THEME_CONSTANTS.patterns.loadingState}>
      <LoadingSpinner />
    </div>
  );
}
```

---

## Best Practices

### ✅ DO

1. **Use THEME_CONSTANTS** for all repeated patterns
2. **Use utility classes** from globals.css (`.btn`, `.card`, etc.)
3. **Use existing components** from `@/components`
4. **Use UI_LABELS** and **UI_PLACEHOLDERS** for all text
5. **Allow inline styles** only for dynamic calculated values
6. **Use barrel imports**: `@/constants`, `@/components`
7. **Destructure constants** at component top for cleaner JSX

```tsx
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { Button, Card } from "@/components";

const { themed, spacing, typography } = THEME_CONSTANTS;
```

### ❌ DON'T

1. ❌ Write raw repeated Tailwind classes: `bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`
2. ❌ Use inline styles for static values: `style={{ padding: "24px" }}`
3. ❌ Hardcode strings: `<button>Save</button>`
4. ❌ Create custom inputs when FormField exists
5. ❌ Mix direct file imports with barrel imports
6. ❌ Use magic numbers without explanation
7. ❌ Ignore accessibility (always include focus states)

---

## Migration Guide

### Converting Old Code to New System

#### Before:

```tsx
<div className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 p-6 rounded-xl space-y-4">
  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
    Title
  </h1>
  <input
    type="text"
    placeholder="Enter email"
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
  />
  <button className="inline-flex items-center justify-center font-medium rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3">
    Save
  </button>
</div>
```

#### After:

```tsx
import { THEME_CONSTANTS, UI_LABELS, UI_PLACEHOLDERS } from "@/constants";
import { Button } from "@/components";

const { themed, spacing, borderRadius, typography, patterns } = THEME_CONSTANTS;

<div
  className={`${themed.bgSecondary} ${themed.border} border ${spacing.padding.lg} ${borderRadius.xl} ${spacing.stack}`}
>
  <h1 className={`${typography.h1} ${themed.textPrimary}`}>Title</h1>
  <input
    type="text"
    placeholder={UI_PLACEHOLDERS.EMAIL}
    className={patterns.adminInput}
  />
  <Button variant="primary">{UI_LABELS.ACTIONS.SAVE}</Button>
</div>;
```

### Quick Replacements

| Replace This                           | With This                              |
| -------------------------------------- | -------------------------------------- |
| `bg-white dark:bg-gray-900`            | `THEME_CONSTANTS.themed.bgSecondary`   |
| `bg-gray-50 dark:bg-gray-950`          | `THEME_CONSTANTS.themed.bgPrimary`     |
| `text-gray-900 dark:text-gray-100`     | `THEME_CONSTANTS.themed.textPrimary`   |
| `text-gray-600 dark:text-gray-400`     | `THEME_CONSTANTS.themed.textSecondary` |
| `border-gray-200 dark:border-gray-800` | `THEME_CONSTANTS.themed.border`        |
| `space-y-4`                            | `THEME_CONSTANTS.spacing.stack`        |
| `space-y-8 lg:space-y-12`              | `THEME_CONSTANTS.spacing.section`      |
| `text-4xl md:text-5xl font-bold`       | `THEME_CONSTANTS.typography.h1`        |
| `rounded-xl`                           | `THEME_CONSTANTS.borderRadius.xl`      |
| Long admin input classes               | `THEME_CONSTANTS.patterns.adminInput`  |

---

## Animation Reference

### Available Animations

```tsx
// Fade animations
<div className="animate-fade-in">
<div className="animate-fade-out">

// Slide animations
<div className="animate-slide-down">
<div className="animate-slide-up">
<div className="animate-slide-in-left">
<div className="animate-slide-in-right">

// Scale animations
<div className="animate-scale-in">
<div className="animate-scale-out">

// Utility animations
<div className="animate-spin">    {/* Loading spinners */}
<div className="animate-pulse">   {/* Breathing effect */}
<div className="animate-bounce">  {/* Bounce effect */}
<div className="animate-shimmer"> {/* Shimmer/skeleton effect */}
```

---

## Accessibility

All styling patterns include accessibility features:

- ✅ Focus-visible rings (keyboard navigation)
- ✅ Reduced motion support
- ✅ High contrast for text/backgrounds
- ✅ ARIA-compliant colors
- ✅ Print styles

### Focus States

```tsx
// Automatically applied with utility classes
<button className="btn btn-primary">  {/* Has focus ring */}
<input className="input-base">        {/* Has focus ring */}

// Custom focus ring
<div className={THEME_CONSTANTS.themed.focusRing}>
```

---

## Summary

### The Three Layers

1. **globals.css**: Base styles, CSS variables, utility classes, animations
2. **THEME_CONSTANTS**: JavaScript constants for Tailwind classes
3. **Tailwind Config**: Extended theme, colors, utilities

### Key Takeaways

- ✅ Use `THEME_CONSTANTS` for repeated patterns
- ✅ Use utility classes (`.btn`, `.card`, `.input-base`)
- ✅ Zero inline styles except dynamic values
- ✅ Dark mode works automatically
- ✅ Always use barrel imports: `@/constants`, `@/components`

---

**Need Help?** Check `docs/GUIDE.md` for component/hook reference or `.github/copilot-instructions.md` for full coding rules.
