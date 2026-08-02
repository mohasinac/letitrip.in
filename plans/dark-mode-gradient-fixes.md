# Plan: Fix Dark Mode Gradients — All Places

## Context

In light mode the hot-pink/dark theme has a visually beautiful dual-colour gradient on the sidebar collapse toggle (cobalt-blue → lime-green), logo, brand text, section banners, and card accents. In dark mode (hot-pink theme), **both `--appkit-color-primary` and `--appkit-color-secondary` are set to the same hot-pink hue** (`#e91e8c`), so every gradient that spans primary → secondary resolves to two nearly-identical pinks — looking flat/solid instead of gradient.

Additionally, 7 gradient variables (`section-warm`, `promotion`, `whatsapp-card`, `glass`, `card-amber`, `card-rose`, `logo`) are present in `default-dark.ts` but are **missing** from the `[data-theme="dark"]` CSS block in `tokens.css`, causing cold-start/SSR fallback to use the light-mode formulae.

## Root Cause

| Token | Light | Dark |
|---|---|---|
| `--appkit-color-primary` | `#3570fc` (cobalt blue) | `#e91e8c` (hot pink) |
| `--appkit-color-secondary` | `#65c408` (lime green) | `#e91e8c` (same hot pink) |
| Result for `primary → secondary` gradient | Blue → Green ✓ | Pink → Pink (flat) ✗ |

The only visually distinct gradient in dark mode today is `accent` / `accent-banner` which deliberately uses `--appkit-color-info` (`#38bdf8`, sky-blue) as one stop.

## Fix: Pair Pink with Sky Blue Everywhere

Dark mode fix = swap `secondary` stop with `info` (sky-400 `#38bdf8`) in every gradient that was previously using `secondary` as a contrast colour.

---

## Files to Change

### 1. `appkit/src/tokens/themes/types.ts`
Add `"sidebar"` to the `GradientKey` union (line 57, after `"logo"`).

### 2. `appkit/src/tokens/tokens.css`

**In `:root` block** (after `--appkit-gradient-logo`):
```css
  --appkit-gradient-sidebar: linear-gradient(to bottom, var(--appkit-color-primary-700), var(--appkit-color-secondary-500));
```
(matches current SidebarCollapseToggle formula in light mode)

**In `[data-theme="dark"]` block** (append after `--appkit-gradient-card-teal`, before `}`):
```css
  /* Sidebar rail handle — pink → sky blue for visible contrast */
  --appkit-gradient-sidebar:        linear-gradient(to bottom, var(--appkit-color-primary), var(--appkit-color-info));
  /* Brand — hot pink → sky blue (mirrors accent-banner, replaces flat pink→lighter-pink) */
  --appkit-gradient-brand:          linear-gradient(to right, var(--appkit-color-primary), var(--appkit-color-info));
  /* Logo — pink ramp that ends at sky blue instead of pink-secondary */
  --appkit-gradient-logo:           linear-gradient(to right, var(--appkit-color-primary-700) 0%, var(--appkit-color-primary-500) 55%, var(--appkit-color-info) 100%);
  /* Previously missing dark overrides (sync with default-dark.ts values) */
  --appkit-gradient-section-warm:   linear-gradient(to bottom right, var(--appkit-color-warning-surface), transparent);
  --appkit-gradient-promotion:      linear-gradient(to bottom right, var(--appkit-color-error), var(--appkit-color-primary), var(--appkit-color-warning));
  --appkit-gradient-whatsapp-card:  linear-gradient(to bottom right, var(--appkit-color-success), var(--appkit-color-success));
  --appkit-gradient-glass:          linear-gradient(to bottom right, color-mix(in srgb, var(--appkit-color-surface) 85%, transparent), color-mix(in srgb, var(--appkit-color-surface) 65%, transparent));
  --appkit-gradient-card-amber:     linear-gradient(to bottom right, var(--appkit-color-warning-surface), var(--appkit-color-surface), var(--appkit-color-surface));
  --appkit-gradient-card-rose:      linear-gradient(to bottom right, var(--appkit-color-error-surface), var(--appkit-color-surface), var(--appkit-color-surface));
```

Note: the existing `--appkit-gradient-brand` dark override on line 365 is **replaced** (updated value).

### 3. `appkit/src/tokens/themes/default-light.ts`
Add to `gradients` object (after `logo`):
```ts
sidebar:
  "linear-gradient(to bottom, var(--appkit-color-primary-700), var(--appkit-color-secondary-500))",
```

### 4. `appkit/src/tokens/themes/default-dark.ts`
- **Update** `brand`: `"linear-gradient(to right, var(--appkit-color-primary), var(--appkit-color-info))"`
- **Update** `logo`: `"linear-gradient(to right, var(--appkit-color-primary-700) 0%, var(--appkit-color-primary-500) 55%, var(--appkit-color-info) 100%)"`
- **Add** `sidebar`: `"linear-gradient(to bottom, var(--appkit-color-primary), var(--appkit-color-info))"`

### 5. `appkit/src/_internal/client/features/layout/SidebarCollapseToggle.tsx`
Replace the computed `HANDLE_STYLE.background` with the new token:
```ts
const HANDLE_STYLE: React.CSSProperties = {
  background: "var(--appkit-gradient-sidebar)", // audit-inline-style-ok: theme gradient CSS var
};
```
Update the JSDoc comment to reference `--appkit-gradient-sidebar` instead of the individual colour tokens.

---

## What Changes Visually

| Gradient | Light (unchanged) | Dark before | Dark after |
|---|---|---|---|
| Sidebar toggle handle | Blue → Green | Pink → Pink (flat) | **Pink → Sky Blue** |
| Logo wordmark | Cobalt → Lime | Pink → Pink (flat) | **Pink → Sky Blue** |
| `brand` (text, section) | Blue → Green | Pink → Lighter Pink | **Pink → Sky Blue** |
| `accent-banner` | Blue → Green | Pink → Sky Blue | Pink → Sky Blue (already correct) |
| `section-warm` | amber to surface | falls back to light | **dark amber tint → transparent** |
| `card-amber`, `card-rose` | tinted card BG | falls back to light | **dark tinted → surface** |
| `promotion` | red/blue/amber | falls back to light | **red/pink/amber (dark tokens)** |

---

## Verification
1. `npm run check` — must exit 0 (type-checks `GradientKey` extension, drift audit, lint)
2. View admin dashboard in dark mode → sidebar handle shows pink-to-sky-blue gradient
3. View site logo in dark mode → wordmark shows pink-to-blue gradient
4. View any `<Text gradient="brand">` or hero section in dark mode → two-colour gradient visible
5. Light mode must be unchanged — spot-check sidebar, logo, brand text
