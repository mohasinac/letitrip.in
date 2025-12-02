# Epic E027: Design System & Theming

## ⚠️ MANDATORY: Follow Project Standards

Before implementing, read **[AI Agent Development Guide](/docs/ai/AI-AGENT-GUIDE.md)**

**Key Requirements:**

- Services call APIs via `apiService`, NEVER access database directly
- Use `COLLECTIONS` constant from `src/constants/database.ts`
- FE/BE type separation with transforms

---

## Overview

Implement a comprehensive design system with CSS custom properties (variables) for all colors, spacing, and styling. This enables easy theming (light/dark mode) and future brand customization without modifying component code. All hardcoded colors in the codebase must be replaced with design tokens.

**Status**: ✅ Complete (Session 12, 16)  
**Implementation**: Dark mode fully supported across all components  
**Related Docs**: docs/01-dark-mode-issues.md

### Implementation Summary

- ✅ CSS custom properties created in `src/styles/tokens/`
- ✅ Dark mode support added to 50+ components
- ✅ Malformed CSS fixed in 5 components
- ✅ ThemeContext created with useTheme hook
- ✅ ThemeToggle component for switching themes
- ✅ All cards, forms, tables support dark mode

## Scope

- Create CSS custom properties for all design tokens
- Implement light and dark theme support
- Replace all hardcoded colors with CSS variables
- Create Tailwind CSS plugin for design tokens
- Add theme toggle functionality
- Document design system for future development

## Design Tokens

### Color Tokens

```css
:root {
  /* Brand Colors */
  --color-primary: #ca8a04; /* yellow-600 */
  --color-primary-hover: #a16207; /* yellow-700 */
  --color-primary-light: #fef08a; /* yellow-200 */
  --color-primary-dark: #854d0e; /* yellow-800 */

  /* Secondary */
  --color-secondary: #4f46e5; /* indigo-600 */
  --color-secondary-hover: #4338ca;

  /* Semantic Colors */
  --color-success: #16a34a; /* green-600 */
  --color-success-light: #bbf7d0;
  --color-warning: #d97706; /* amber-600 */
  --color-warning-light: #fde68a;
  --color-error: #dc2626; /* red-600 */
  --color-error-light: #fecaca;
  --color-info: #2563eb; /* blue-600 */
  --color-info-light: #bfdbfe;

  /* Neutral/Gray Scale */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;

  /* Background */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #f3f4f6;
  --color-bg-inverse: #111827;

  /* Text */
  --color-text-primary: #111827;
  --color-text-secondary: #4b5563;
  --color-text-tertiary: #6b7280;
  --color-text-inverse: #ffffff;
  --color-text-muted: #9ca3af;

  /* Border */
  --color-border-primary: #e5e7eb;
  --color-border-secondary: #d1d5db;
  --color-border-focus: #ca8a04;

  /* Status Colors */
  --color-status-pending: #f59e0b;
  --color-status-processing: #3b82f6;
  --color-status-shipped: #8b5cf6;
  --color-status-delivered: #10b981;
  --color-status-cancelled: #ef4444;
  --color-status-refunded: #6b7280;

  /* Auction Colors */
  --color-auction-active: #16a34a;
  --color-auction-ending: #dc2626;
  --color-auction-ended: #6b7280;
  --color-bid-winning: #16a34a;
  --color-bid-outbid: #dc2626;
}

/* Dark Theme */
[data-theme="dark"] {
  --color-bg-primary: #111827;
  --color-bg-secondary: #1f2937;
  --color-bg-tertiary: #374151;
  --color-bg-inverse: #ffffff;

  --color-text-primary: #f9fafb;
  --color-text-secondary: #d1d5db;
  --color-text-tertiary: #9ca3af;
  --color-text-inverse: #111827;

  --color-border-primary: #374151;
  --color-border-secondary: #4b5563;
}
```

### Spacing Tokens

```css
:root {
  --spacing-0: 0;
  --spacing-1: 0.25rem; /* 4px */
  --spacing-2: 0.5rem; /* 8px */
  --spacing-3: 0.75rem; /* 12px */
  --spacing-4: 1rem; /* 16px */
  --spacing-5: 1.25rem; /* 20px */
  --spacing-6: 1.5rem; /* 24px */
  --spacing-8: 2rem; /* 32px */
  --spacing-10: 2.5rem; /* 40px */
  --spacing-12: 3rem; /* 48px */
  --spacing-16: 4rem; /* 64px */
  --spacing-20: 5rem; /* 80px */
  --spacing-24: 6rem; /* 96px */
}
```

### Typography Tokens

```css
:root {
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

### Shadow Tokens

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

[data-theme="dark"] {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.4);
}
```

### Border Radius Tokens

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
}
```

---

## Features

### F027.1: CSS Custom Properties Setup

**Priority**: P0 (Critical)

Create the foundational CSS custom properties file.

#### Files to Create

| File                           | Description              |
| ------------------------------ | ------------------------ |
| `styles/tokens/colors.css`     | Color tokens             |
| `styles/tokens/spacing.css`    | Spacing tokens           |
| `styles/tokens/typography.css` | Typography tokens        |
| `styles/tokens/shadows.css`    | Shadow tokens            |
| `styles/tokens/borders.css`    | Border and radius tokens |
| `styles/tokens/index.css`      | Imports all tokens       |
| `styles/themes/light.css`      | Light theme overrides    |
| `styles/themes/dark.css`       | Dark theme overrides     |

---

### F027.2: Tailwind Integration

**Priority**: P0 (Critical)

Extend Tailwind config to use CSS custom properties.

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          light: "var(--color-primary-light)",
          dark: "var(--color-primary-dark)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover: "var(--color-secondary-hover)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          light: "var(--color-success-light)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          light: "var(--color-warning-light)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          light: "var(--color-error-light)",
        },
        // ... etc
      },
      backgroundColor: {
        "bg-primary": "var(--color-bg-primary)",
        "bg-secondary": "var(--color-bg-secondary)",
        "bg-tertiary": "var(--color-bg-tertiary)",
      },
      textColor: {
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
      },
      borderColor: {
        "border-primary": "var(--color-border-primary)",
        "border-secondary": "var(--color-border-secondary)",
      },
    },
  },
};
```

---

### F027.3: Theme Provider & Toggle

**Priority**: P1 (High)

Create React context for theme management.

```typescript
// contexts/ThemeContext.tsx
interface ThemeContextType {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  resolvedTheme: "light" | "dark";
}

// components/common/ThemeToggle.tsx
// - Toggle button for light/dark mode
// - Respects system preference when set to 'system'
// - Persists preference to localStorage
```

#### User Stories

**US027.3.1**: Theme Toggle

```
As a user
I want to toggle between light and dark mode
So that I can use the app in my preferred mode

Acceptance Criteria:
- Toggle button in header/settings
- Three options: Light, Dark, System
- System respects OS preference
- Preference persists across sessions
- No flash of wrong theme on load
```

---

### F027.4: Hardcoded Color Audit & Replacement

**Priority**: P0 (Critical)

Find and replace all hardcoded colors with design tokens.

#### Common Patterns to Replace

| Hardcoded             | Replace With             |
| --------------------- | ------------------------ |
| `text-gray-900`       | `text-text-primary`      |
| `text-gray-600`       | `text-text-secondary`    |
| `text-gray-500`       | `text-text-muted`        |
| `bg-white`            | `bg-bg-primary`          |
| `bg-gray-50`          | `bg-bg-secondary`        |
| `bg-gray-100`         | `bg-bg-tertiary`         |
| `border-gray-200`     | `border-border-primary`  |
| `bg-yellow-600`       | `bg-primary`             |
| `text-yellow-600`     | `text-primary`           |
| `hover:bg-yellow-700` | `hover:bg-primary-hover` |
| `bg-green-600`        | `bg-success`             |
| `bg-red-600`          | `bg-error`               |
| `text-red-600`        | `text-error`             |
| `#ca8a04` (inline)    | `var(--color-primary)`   |

---

### F027.5: Component Token Classes

**Priority**: P1 (High)

Create semantic CSS classes for common component patterns.

```css
/* styles/components/buttons.css */
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}
.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-secondary {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}

.btn-danger {
  background-color: var(--color-error);
  color: var(--color-text-inverse);
}

/* styles/components/cards.css */
.card {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

/* styles/components/inputs.css */
.input {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  color: var(--color-text-primary);
}
.input:focus {
  border-color: var(--color-border-focus);
  outline: none;
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

/* styles/components/badges.css */
.badge-success {
  background-color: var(--color-success-light);
  color: var(--color-success);
}
.badge-warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
}
.badge-error {
  background-color: var(--color-error-light);
  color: var(--color-error);
}

/* Status badges */
.badge-status-pending {
  /* ... */
}
.badge-status-processing {
  /* ... */
}
.badge-status-shipped {
  /* ... */
}
.badge-status-delivered {
  /* ... */
}
.badge-status-cancelled {
  /* ... */
}
```

---

## Implementation Checklist

### Phase 1: Foundation (Week 1)

- [ ] Create `styles/tokens/` directory structure
- [ ] Create color tokens CSS file
- [ ] Create spacing tokens CSS file
- [ ] Create typography tokens CSS file
- [ ] Create shadow and border tokens CSS file
- [ ] Create light theme file
- [ ] Create dark theme file
- [ ] Update Tailwind config to use CSS variables
- [ ] Create ThemeProvider context
- [ ] Create ThemeToggle component
- [ ] Test theme switching

### Phase 2: Audit & Document (Week 1-2)

- [ ] Run SonarQube/grep to find all hardcoded colors
- [ ] Document all color usages in a spreadsheet
- [ ] Create mapping from hardcoded to tokens
- [ ] Identify edge cases and special colors

### Phase 3: Component Replacement (Week 2-3)

- [ ] Replace colors in layout components
- [ ] Replace colors in common/ui components
- [ ] Replace colors in card components
- [ ] Replace colors in form components
- [ ] Replace colors in button variants
- [ ] Replace colors in badge/status components
- [ ] Replace colors in navigation components
- [ ] Replace colors in admin components
- [ ] Replace colors in seller components

### Phase 4: Page Replacement (Week 3-4)

- [ ] Replace colors in product pages
- [ ] Replace colors in auction pages
- [ ] Replace colors in checkout pages
- [ ] Replace colors in user dashboard pages
- [ ] Replace colors in seller dashboard pages
- [ ] Replace colors in admin dashboard pages
- [ ] Replace colors in static pages

### Phase 5: Verification (Week 4)

- [ ] Visual regression testing
- [ ] Test dark mode on all pages
- [ ] Test theme persistence
- [ ] Performance testing (CSS size)
- [ ] Accessibility testing (color contrast)
- [ ] Document design system

---

## Acceptance Criteria

- [ ] All hardcoded colors replaced with design tokens
- [ ] Light and dark themes work correctly
- [ ] Theme preference persists across sessions
- [ ] No flash of incorrect theme on page load
- [ ] All semantic colors use tokens (success, error, warning)
- [ ] All status colors use tokens
- [ ] Color contrast meets WCAG AA standards
- [ ] Design system is documented

---

## Dependencies

- E019: Common Code Architecture

## Related Epics

- E025: Mobile Component Integration
- E030: Code Quality & SonarQube

---

## Test Documentation

**Test Cases**: `TDD/resources/theming/TEST-CASES.md`
