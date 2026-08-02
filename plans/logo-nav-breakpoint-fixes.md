# Plan: Fix Logo Visibility, Dark-Mode Nav Colors, Breakpoint Overlap, Mobile Dashboard Nav

## Context

Four distinct UI bugs found across the public header and dashboard navigation:

1. **Logo invisible in dark mode** — The `SiteLogo` SVG gradient uses `--appkit-color-primary-700` as its first stop. In dark mode (hot-pink theme), that resolves to `#b00d66` (dark maroon) on a `bg-slate-950/95` background. Near-identical values → text is invisible. Light mode works (dark blue on white = visible).

2. **Active nav item color mismatch in dark mode** — `NavbarLayout` active state uses `dark:bg-secondary-900/30` (≈ `rgba(119,18,73,0.30)`, barely visible tint) + `dark:text-secondary-200`. Background highlight is too faint; active and inactive items look nearly identical at a glance.

3. **Breakpoint overlap: md–lg range** — `AdminSidebar`, `SellerSidebar`, `UserSidebar` all use `hidden md:flex` for their desktop rail (shows at ≥768px). `BottomNavbar` and `TB2` account row both use `lg:hidden` (hides at ≥1024px). Between 768–1023px the desktop sidebar tab peeks out from the left **and** the mobile bottom nav + account row are simultaneously visible — classic mobile-and-desktop-at-the-same-time issue.

4. **Mobile dashboard hamburger opens the wrong drawer** — `TitleBarLayout` receives `hasDashboardNav` and `onToggleDashboardNav` props but renames them with underscore prefixes (`_hasDashboardNav`, `_onToggleDashboardNav`) — they are unused. The hamburger always calls `onToggleSidebar` (the public right-side drawer). On mobile inside any dashboard page, the hamburger should open the dashboard sidebar instead.

---

## Fix 1 — Logo gradient dark-mode visibility

**Root cause**: `SiteLogo.tsx` hardcodes raw palette variables as gradient stops — it does NOT use the `--appkit-gradient-logo` CSS token that was partially fixed in commit `e0f2e987`:

```tsx
// SiteLogo.tsx lines 105–117 — current (still uses raw palette vars)
stopColor: "var(--appkit-color-primary-700)"   // dark maroon (#b00d66) in dark mode — INVISIBLE on dark bg
stopColor: "var(--appkit-color-primary-500)"   // bright pink (#e91e8c) — OK
stopColor: "var(--appkit-color-secondary-400)" // pink (#f063b9) in dark mode — OK but not the new `info` fix
```

`--appkit-gradient-logo` (dark mode, after e0f2e987) ends with `info` (sky-blue, visible) but its START still uses `primary-700` (`#b00d66` = dark maroon on `#020617` = effectively invisible). And `SiteLogo.tsx` isn't wired to this token anyway.

`cobalt-night` theme has `bg = #111e58` (primary-950) — `primary-700` there is `#1343de` (dark blue on near-black navy = also low contrast).

**Fix A — `appkit/src/tokens/tokens.css`**

1. Append three per-stop logo variables immediately after `--appkit-gradient-logo` in `:root` (~line 305):
```css
--appkit-logo-stop-from: var(--appkit-color-primary-700);   /* dark blue — light bg */
--appkit-logo-stop-mid:  var(--appkit-color-primary-500);   /* medium blue */
--appkit-logo-stop-to:   var(--appkit-color-secondary-400); /* lime green */
```

2. Override them in `[data-theme="dark"]` block (after existing `--appkit-gradient-logo` override, ~line 383). Also fix the START stop of `--appkit-gradient-logo` itself to be lighter:
```css
--appkit-gradient-logo:            linear-gradient(to right, var(--appkit-color-primary-300) 0%, var(--appkit-color-primary-400) 55%, var(--appkit-color-info) 100%);
--appkit-logo-stop-from: var(--appkit-color-primary-300);   /* #f79dd2 light pink — visible on dark bg */
--appkit-logo-stop-mid:  var(--appkit-color-primary-400);   /* #f063b9 medium-light pink */
--appkit-logo-stop-to:   var(--appkit-color-info);          /* #38bdf8 sky-400 */
```

3. Add overrides in `[data-theme="cobalt-night"]` block (after line 420) — primary-700 on bg `#111e58` is also near-invisible:
```css
--appkit-logo-stop-from: var(--appkit-color-primary-300);   /* light cobalt blue */
--appkit-logo-stop-mid:  var(--appkit-color-primary-400);   /* medium-light cobalt */
--appkit-logo-stop-to:   var(--appkit-color-secondary);     /* lime-green accent */
```

`sunset` theme has a light background — no override needed; it inherits `:root` values fine.

**Fix B — `appkit/src/ui/components/SiteLogo.tsx`** (lines 104–117)

Replace the hardcoded palette stop references with the new CSS variables so the token fully controls each theme:
```tsx
<stop offset="0%"   style={{ stopColor: "var(--appkit-logo-stop-from)" }} />
<stop offset="55%"  style={{ stopColor: "var(--appkit-logo-stop-mid)"  }} />
<stop offset="100%" style={{ stopColor: "var(--appkit-logo-stop-to)"   }} />
```

Also fix the gradient ID uniqueness: import `useId` from React and replace the hardcoded `GRADIENT_ID` constant with a per-instance unique ID to prevent cross-SVG ID collisions when multiple `<SiteLogo>` instances are on the same page:
```tsx
import { useId } from "react";
// ...inside SiteLogo:
const uid = useId();
const gradientId = `appkit-logo-gradient-${uid.replace(/:/g, "")}`;
// use gradientId everywhere instead of GRADIENT_ID constant
```
`useId` works in server and client components — no `"use client"` needed.

---

## Fix 2 — Dark-mode active nav item colors

**File**: `appkit/src/features/layout/NavbarLayout.tsx`, `DefaultNavItem` function (lines 40–44).

Current active-state dark classes:
```
dark:bg-secondary-900/30    ← barely visible pink tint
dark:text-secondary-200     ← light pink text
dark:border-secondary-400   ← pink underline
```

Replace with:
```
dark:bg-slate-800           ← solid, clearly visible dark surface
dark:text-white             ← crisp white text (matches inactive zinc-100 standard)
dark:border-secondary-400   ← keep pink underline accent (matches the theme)
```

The full active string becomes:
```
"bg-primary-50 dark:bg-slate-800 text-primary-800 dark:text-white font-semibold px-3 border-b-2 border-primary-500 dark:border-secondary-400 rounded-none pb-[6px] transition-colors duration-150"
```

The `highlighted` item (prize draws / promotions) already uses `dark:border-secondary-400/30 dark:bg-secondary-900/30` which is intentional (subtle, not active) — leave that unchanged.

---

## Fix 3 — Breakpoint consistency: md → lg for dashboard sidebars

Align the desktop/mobile split to `lg` (1024px) everywhere so only one set of navigation elements shows at a time.

### 3a — `appkit/src/_internal/shared/features/layout/config.ts` (lines 69–70)
```ts
export const DASHBOARD_DESKTOP_BREAKPOINT_PX = 1024;   // was 768
export const DASHBOARD_DESKTOP_MEDIA_QUERY = `(min-width: ${DASHBOARD_DESKTOP_BREAKPOINT_PX}px)`;
```

### 3b — `appkit/src/features/admin/components/AdminSidebar.tsx`
Desktop panel class: `hidden md:flex` → `hidden lg:flex`  
Mobile BottomSheet wrapper: `md:hidden` → `lg:hidden`  
(Two places: portal branch and non-portal branch.)

### 3c — `appkit/src/features/seller/components/SellerSidebar.tsx`
Same two-place change: `hidden md:flex` → `hidden lg:flex`, `md:hidden` → `lg:hidden`

### 3d — `appkit/src/features/account/components/UserSidebar.tsx`
Same two-place change: `hidden md:flex` → `hidden lg:flex`, `md:hidden` → `lg:hidden`

### 3e — `appkit/src/_internal/client/features/layout/DashboardLayoutClient.tsx` (line 125)
```ts
const DEFAULT_CONTENT_PADDING = "px-5 py-8 lg:pl-14 lg:pr-6 xl:pl-16 xl:pr-10";
// was:                          "px-5 py-8 md:pl-14 md:pr-6 lg:pl-16 lg:pr-10"
```
This ensures the content area does not indent for the sidebar rail below `lg`.

---

## Fix 4 — Mobile dashboard hamburger opens the correct drawer

**File**: `appkit/src/features/layout/TitleBarLayout.tsx`

### 4a — Remove the underscore prefixes (lines 107–108)
```tsx
// Change:
hasDashboardNav: _hasDashboardNav,
onToggleDashboardNav: _onToggleDashboardNav,
// To:
hasDashboardNav,
onToggleDashboardNav,
```

### 4b — Wire the hamburger to use the correct toggle (around line 155–168)
```tsx
const hamburgerBtn = !hideSidebarToggle ? (
  <Button
    ...
    onClick={hasDashboardNav && onToggleDashboardNav ? onToggleDashboardNav : onToggleSidebar}
    aria-label={sidebarOpen ? "Close menu" : (hasDashboardNav ? "Open dashboard navigation" : "Open menu")}
    ...
  >
```
The `aria-controls` can stay as `"secondary-sidebar"` since there is no stable ID for the dashboard bottom sheet.

---

## Additional places with the same dark-mode issue

The same low-contrast dark-mode active state pattern may appear in:
- `BottomNavbar.tsx` — active item `activeClassName` defaults to `"text-primary-600 dark:text-primary-400"`. In dark mode `primary-400 = #f063b9` (hot pink, bright) — **already OK**, no change needed.
- `AdminSidebar`, `SellerSidebar`, `UserSidebar` — active uses `dark:bg-slate-800 dark:text-zinc-100` — **already OK**.
- Dashboard cards/stats — not nav-related, no change needed.

---

## Files to change

| File | Change |
|------|--------|
| `appkit/src/tokens/tokens.css` | Add `--appkit-logo-stop-*` in `:root` + `[data-theme="dark"]` (+ any other theme blocks) |
| `appkit/src/ui/components/SiteLogo.tsx` | Use `--appkit-logo-stop-*` vars; `useId()` for unique gradient ID |
| `appkit/src/features/layout/NavbarLayout.tsx` | Fix dark active state: `dark:bg-slate-800 dark:text-white` |
| `appkit/src/_internal/shared/features/layout/config.ts` | `DASHBOARD_DESKTOP_BREAKPOINT_PX` 768 → 1024 |
| `appkit/src/features/admin/components/AdminSidebar.tsx` | `md:flex`→`lg:flex`, `md:hidden`→`lg:hidden` (×2) |
| `appkit/src/features/seller/components/SellerSidebar.tsx` | Same as AdminSidebar (×2) |
| `appkit/src/features/account/components/UserSidebar.tsx` | Same as AdminSidebar (×2) |
| `appkit/src/_internal/client/features/layout/DashboardLayoutClient.tsx` | Content padding `md:pl-14` → `lg:pl-14` |
| `appkit/src/features/layout/TitleBarLayout.tsx` | Wire hamburger to `onToggleDashboardNav` when `hasDashboardNav` |

---

## Verification

1. `npm run check` — full quality gate (tsc + audits + lint)
2. Rebuild appkit: `npm --prefix appkit run build`
3. Start dev server: `npm run dev`
4. Check at multiple viewport widths:
   - **< 768px (mobile)**: SiteLogo visible in dark mode; BottomNav + TB2 show; no sidebar rail; hamburger opens dashboard BottomSheet on dashboard pages
   - **768–1023px (tablet)**: No sidebar rail visible; BottomNav + TB2 still show; no split between desktop and mobile nav
   - **≥ 1024px (desktop)**: Standalone category navbar shows; sidebar rail shows on dashboard pages; BottomNav + TB2 hidden
5. Toggle dark/light mode and confirm logo is clearly visible in both (gradient from light pink → sky blue in dark, dark blue → lime in light)
6. Navigate to any page with the public navbar; confirm the active item has clearly visible background and text in both modes

---

## Publish & Deploy (after all checks pass)

### Publish appkit to npm
```powershell
# 1. Commit all appkit source changes
# 2. Bump patch version in appkit/package.json (e.g. 3.1.3 → 3.1.4)
cd appkit; npm run build; npm publish
# 3. Update consumer: src package.json "@mohasinac/appkit": "^3.1.4"
# 4. Remove appkit/src/** lines from tsconfig.json
# 5. Delete package-lock.json and reinstall
rm package-lock.json; npm install
# 6. Verify types resolve from dist
npm run check:types
```

### Deploy to Vercel production
```powershell
node scripts/deploy.mjs   # runs pre-flight checks then vercel --prod
```
