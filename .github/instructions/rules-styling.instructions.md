---
applyTo: "src/**/*.tsx"
description: "THEME_CONSTANTS for Tailwind, mobile-first, widescreen grids. Rules 4, 25."
---

# Styling Rules

## RULE 4: THEME_CONSTANTS — No Raw Repeated Tailwind

NEVER write raw repeated Tailwind strings. Use `THEME_CONSTANTS` from `@/constants`.

```typescript
// ❌ WRONG
<div className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-xl">

// ✅ RIGHT
import { THEME_CONSTANTS } from '@/constants';
const { spacing, themed, borderRadius } = THEME_CONSTANTS;
<div className={`${spacing.stack} ${themed.bgPrimary} ${spacing.padding.lg} ${borderRadius.xl}`}>
```

### Key THEME_CONSTANTS Lookup

| Raw Tailwind                                                      | Use instead                                  |
| ----------------------------------------------------------------- | -------------------------------------------- |
| `"space-y-4"`                                                     | `THEME_CONSTANTS.spacing.stack`              |
| `"gap-4"`                                                         | `THEME_CONSTANTS.spacing.gap.md`             |
| `"p-4"` / `"p-6"`                                                 | `THEME_CONSTANTS.spacing.padding.md` / `.lg` |
| `"text-3xl md:text-4xl font-bold"`                                | `THEME_CONSTANTS.typography.h2`              |
| `"bg-white dark:bg-gray-900"`                                     | `THEME_CONSTANTS.themed.bgPrimary`           |
| `"bg-gray-50 dark:bg-gray-800"`                                   | `THEME_CONSTANTS.themed.bgSecondary`         |
| `"text-gray-900 dark:text-white"`                                 | `THEME_CONSTANTS.themed.textPrimary`         |
| `"text-gray-600 dark:text-gray-400"`                              | `THEME_CONSTANTS.themed.textSecondary`       |
| `"border-gray-200 dark:border-gray-700"`                          | `THEME_CONSTANTS.themed.border`              |
| `"flex items-center justify-center"`                              | `THEME_CONSTANTS.flex.center`                |
| `"flex items-center justify-between"`                             | `THEME_CONSTANTS.flex.between`               |
| `"flex items-center"`                                             | `THEME_CONSTANTS.flex.rowCenter`             |
| `"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"`                | `THEME_CONSTANTS.grid.cols3`                 |
| `"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"` | `THEME_CONSTANTS.grid.cols4`                 |
| `"absolute inset-0"`                                              | `THEME_CONSTANTS.position.fill`              |
| `"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"`                        | `THEME_CONSTANTS.page.container["2xl"]`      |
| `"px-4 sm:px-6 lg:px-8"`                                          | `THEME_CONSTANTS.page.px`                    |
| `"rounded-xl"`                                                    | `THEME_CONSTANTS.borderRadius.xl`            |

**Inline styles**: FORBIDDEN for static values. ALLOWED only for dynamic calculated values (`style={{ width: \`${pct}%\` }}`).

## RULE 25: Mobile-First & Widescreen

- Write base styles for mobile (375px), layer up with `sm: md: lg: xl: 2xl:`.
- Every grid MUST include explicit `xl:` and `2xl:` column counts.
- Touch targets: minimum `44×44px` (`min-h-11 min-w-11`).
- Page containers: `max-w-screen-2xl mx-auto` or `max-w-7xl` for content-focused pages.

```typescript
// ❌ WRONG — caps at 3 cols on widescreen
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

// ✅ RIGHT — scales to widescreen
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">

// ❌ WRONG — fixed text size
<p className="text-base">

// ✅ RIGHT — fluid steps
<p className="text-sm sm:text-base lg:text-lg">
```

| Breakpoint | Width  | Device       |
| ---------- | ------ | ------------ |
| base       | 0      | Mobile 375px |
| `sm:`      | 640px  | Large mobile |
| `md:`      | 768px  | Tablet       |
| `lg:`      | 1024px | Laptop       |
| `xl:`      | 1280px | Desktop      |
| `2xl:`     | 1536px | Widescreen   |

No CSS modules. No `max-sm:hidden` hacks — design mobile first.
