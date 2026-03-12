# LetItRip.in — Implementation Plan

> **Source document:** `docs/MAKEOVER.md` — read that first for full specs on each item.  
> **This file:** The ordered, sprint-driven execution roadmap. Pick up each sprint, implement every task, run the build gate, then proceed.

---

## Ground Rules

1. **Every sprint ends with `npx tsc --noEmit` then `npm run build` — no exceptions.**
2. **One sprint at a time.** Do not start Sprint N+1 if Sprint N has a failing build.
3. **Props over hardcoding.** Every new behavior is prop-controlled with sensible defaults.
4. **No new hardcoded strings.** All user-visible text via `useTranslations()` or typed props.
5. **Mobile-first.** All sizing/spacing starts at `base`, expands at `md`/`lg`.
6. **Barrel imports only.** Import from `@/components`, `@/features/<name>`, `@mohasinac/*` — never deep paths.
7. **Delete dead code.** When replacing `AdminTabs`, `SellerTabs`, `UserTabs` — delete the old file.

---

## Sprint Map (Overview)

| Sprint    | Theme                             | Est. Hours | Items                              |
| --------- | --------------------------------- | ---------- | ---------------------------------- |
| **S0** ✅ | Foundations & P0 bugs             | 5h         | PP-1, FN-1, Phase 0 + LX-15, PL-0  |
| **S1** ✅ | Package library                   | 7h         | PL-1, PL-2                         |
| **S2** ✅ | Cards + product page micro-UX     | 9h         | Phase 1, PP-2, PP-6, PP-7, NV-4    |
| **S3**    | Hero sequences + carousel         | 9h         | Phase 2, Phase 3, SR-1, NV-3       |
| **S4**    | Content sections + shop UX        | 9h         | Phase 4, PP-3–5, SH-1, SH-3, FN-2  |
| **S5**    | Layout shell + nav + search       | 9h         | Phase 5, Phase 6, NV-1, NV-2, SR-2 |
| **S6**    | Portal UX — admin + seller + user | 11h        | AU-9, AU-1, AU-2, AU-4, AU-6       |
| **S7**    | Portal completion + global polish | 10h        | AU-3, AU-5, AU-7, AU-8, Phase 7    |
| **S8**    | Before/After section _(optional)_ | 3h         | Phase 8, LX-1                      |

**Total: ~72h** (visual makeover ~34h · package library ~11h · portal UX ~27h)

---

## Sprint 0 — Foundations & P0 Bugs

**Goal:** Fix brand-breaking bugs, migrate font loading, lay the CSS/token foundation that all later phases build on, and extract `@mohasinac/utils`.

---

### Task S0-1 — Fix Add-to-Cart CTA color `(PP-1 · P0)`

**File:** `src/features/products/components/ProductActions.tsx`

- Find `bg-orange-500` (desktop sticky CTA) → replace with `bg-primary hover:bg-primary/90`
- Find the mobile fixed-bottom bar Add-to-Cart button → same replacement
- Verify the button still uses `text-white` (primary is dark enough)
- **2 occurrences in 1 file**

---

### Task S0-2 — Migrate fonts to `next/font/google` `(FN-1 · P1)`

**Files:** `src/app/layout.tsx`, `src/app/globals.css`, `tailwind.config.js`

1. In `src/app/layout.tsx`:

   ```ts
   import { Bangers, Inter } from "next/font/google";
   const bangers = Bangers({
     weight: "400",
     subsets: ["latin"],
     variable: "--font-display",
     display: "swap",
   });
   const inter = Inter({
     subsets: ["latin"],
     variable: "--font-body",
     display: "swap",
   });
   ```

   Apply as `className={`${bangers.variable} ${inter.variable}`}` on `<html>`.

2. In `src/app/globals.css`: Remove the `@import url('https://fonts.googleapis.com/...')` lines for Bangers and Inter.

3. In `tailwind.config.js` `fontFamily`:
   ```js
   display: ["var(--font-display)", "Impact", "sans-serif"],
   sans:    ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
   ```

---

### Task S0-3 — Design Token Refresh + CSS Micro-patterns `(Phase 0 + LX-15)`

**Files:** `src/app/globals.css`, `tailwind.config.js`, `src/constants/theme.ts`

**A. `src/app/globals.css` — add these blocks:**

```css
/* Global heading refinement (LX-15 item 1-2) */
h1,
h2,
h3,
h4,
h5,
h6 {
  letter-spacing: -0.02em;
  line-height: 1.15;
}
p {
  line-height: 1.7;
}
body {
  letter-spacing: -0.011em;
}

/* Selection color */
::selection {
  background-color: rgb(from theme(colors.primary.500) r g b / 30%);
  color: theme(colors.zinc.900);
}

/* Keyframes */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
@keyframes pulse-slow {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.7;
  }
}
@keyframes progress-fill {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px);
    opacity: 0.7;
  }
}

/* Stagger utilities */
.stagger-1 {
  animation: fadeInUp 0.6s ease forwards;
}
.stagger-2 {
  animation: fadeInUp 0.7s ease forwards;
  animation-delay: 100ms;
}
.stagger-3 {
  animation: fadeInUp 0.6s ease forwards;
  animation-delay: 250ms;
}
.stagger-4 {
  animation: fadeInUp 0.6s ease forwards;
  animation-delay: 350ms;
}
.stagger-5 {
  animation: fadeInUp 0.6s ease forwards;
  animation-delay: 550ms;
}

/* Accent divider (LX-15 item 5) */
.accent-divider {
  border: none;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    theme(colors.primary.500),
    transparent
  );
  opacity: 0.35;
}

/* Card lift utility (LX-15 item 6) */
.card-lift {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.card-lift:hover {
  transform: translateY(-4px);
  box-shadow:
    0 12px 28px -6px rgb(from theme(colors.primary.500) r g b / 10%),
    0 4px 10px -3px rgb(from theme(colors.primary.500) r g b / 6%);
}
```

**B. `tailwind.config.js` — add to `theme.extend`:**

```js
keyframes: {
  marquee:       { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
  "pulse-slow":  { "0%, 100%": { opacity: "0.3" }, "50%": { opacity: "0.7" } },
  "progress-fill": { from: { width: "0%" }, to: { width: "100%" } },
},
animation: {
  marquee:       "marquee 30s linear infinite",
  "pulse-slow":  "pulse-slow 4s ease-in-out infinite",
  "progress-fill": "progress-fill linear forwards",
},
```

**C. `src/constants/theme.ts` — add token groups:**

```ts
sectionHeader: {
  pill: "inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-1.5 text-xs font-medium tracking-[0.2em] uppercase text-primary backdrop-blur-sm",
  ornament: "flex items-center gap-2 mt-1",
},
carousel: {
  arrow: "w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-zinc-200 dark:border-slate-700 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all duration-200",
  dotActive: "w-8 h-2 rounded-full bg-white transition-all duration-500",
  dotInactive: "w-2 h-2 rounded-full bg-white/40 transition-all duration-500",
},
trustStrip: {
  iconBox: "from-primary/10 to-cobalt/10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br",
},
```

---

### Task S0-4 — Create `@mohasinac/utils` Package `(PL-0)`

**New directory:** `packages/utils/`

1. Create `packages/utils/package.json`:

   ```json
   {
     "name": "@mohasinac/utils",
     "version": "0.1.0",
     "private": true,
     "main": "src/index.ts",
     "peerDependencies": { "uuid": ">=9" },
     "devDependencies": { "typescript": "*" }
   }
   ```

2. Create `packages/utils/tsconfig.json` (copy structure from `packages/core/tsconfig.json`).

3. Create `packages/utils/src/index.ts` — barrel exporting all groups.

4. Move these 18 files into `packages/utils/src/` under matching subdirs:
   - `formatters/`: `date.formatter.ts`, `number.formatter.ts`, `string.formatter.ts`
   - `validators/`: `email.validator.ts`, `input.validator.ts`, `password.validator.ts`, `phone.validator.ts`, `url.validator.ts`
   - `converters/`: `type.converter.ts`, `cookie.converter.ts`
   - `data/`: `array.helper.ts`, `object.helper.ts`, `pagination.helper.ts`, `sorting.helper.ts`
   - `ui/`: `animation.helper.ts`, `color.helper.ts`
   - `auth/`: `token.helper.ts`
   - `events/`: `event-manager.ts`

5. Replace each original `src/utils/` and `src/helpers/` file with a 1-line shim:

   ```ts
   export * from "@mohasinac/utils/formatters"; // (or whichever sub-path)
   ```

6. Add to root `tsconfig.json` `paths`:

   ```json
   "@mohasinac/utils": ["packages/utils/src/index.ts"],
   "@mohasinac/utils/*": ["packages/utils/src/*"]
   ```

7. Add `"@mohasinac/utils"` to `transpilePackages` in `next.config.js`.

**Build gate — Sprint 0:**

```powershell
npx tsc --noEmit
npm run build
```

---

## Sprint 1 — Package Library ✅ COMPLETE

**Goal:** Elevate `@mohasinac/ui` with 8 interactive primitives from Licorice and promote `DataTable`.

> **Status:** Complete. Build gate passed: `npx tsc --noEmit` ✅ · `npm run build` ✅ (29.6 s)

---

### Task S1-1 — Add 8 Primitives to `@mohasinac/ui` `(PL-1)`

**Directory:** `packages/ui/src/`

Add the following components (see MAKEOVER.md PL-1 for full specs):

| File                | Component                                                            | Radix dep                |
| ------------------- | -------------------------------------------------------------------- | ------------------------ |
| `Modal.tsx`         | Centered modal, `max-h-[90vh]` scroll, animate-in/out, title/X close | `@radix-ui/react-dialog` |
| `Drawer.tsx`        | Slide from left/right/bottom; `rounded-t-2xl` bottom variant         | `@radix-ui/react-dialog` |
| `Select.tsx`        | Label/error/disabled; `SelectOption[]`; ChevronDown + Check          | `@radix-ui/react-select` |
| `StarRating.tsx`    | 0–5; interactive mode with hover preview + onChange; 3 sizes         | —                        |
| `Pagination.tsx`    | Smart ellipsis; prev/next chevron                                    | —                        |
| `Breadcrumb.tsx`    | `BreadcrumbItem[]`; ChevronRight separators; last = `font-medium`    | —                        |
| `StatusBadge.tsx`   | Semantic color map for order/payment/review/ticket status strings    | —                        |
| `ImageLightbox.tsx` | Full-screen overlay; keyboard ←/→/Esc; counter; Next.js `Image`      | —                        |

2. Add new Radix peer deps to `packages/ui/package.json`:

   ```json
   "@radix-ui/react-dialog": "^1",
   "@radix-ui/react-select": "^2"
   ```

3. Export all 8 from `packages/ui/src/index.ts`.

4. Ensure `src/components/index.ts` re-exports them (shim pattern).

---

### Task S1-2 — Promote `DataTable` to `@mohasinac/ui` `(PL-2)`

1. Copy `src/components/DataTable.tsx` → `packages/ui/src/DataTable.tsx`.
2. Verify no app-specific imports remain in the file (only `react`, lucide-react, and generic types).
3. Add `rounded-2xl border border-zinc-200 dark:border-slate-700` container wrapper.
4. Add `pageSize?: number` prop (default 20) if not already configurable.
5. Export from `packages/ui/src/index.ts`.
6. Replace `src/components/DataTable.tsx` with a shim: `export { DataTable } from "@mohasinac/ui"`.
7. Verify all existing callers still resolve (they import from `@/components` barrel — unchanged).

**Build gate — Sprint 1:**

```powershell
npx tsc --noEmit
npm run build
```

---

## Sprint 2 — Cards + Product Page Micro-UX ✅ COMPLETE

> **Status:** Complete. Build gate passed: `npx tsc --noEmit` ✅ · `npm run build` ✅ (99/99 pages)

**Goal:** The highest-ROI visual changes: every card becomes premium; key product page quick-wins land.

---

### Task S2-1 — `ProductCard` redesign `(Phase 1 / C4)`

**File:** `src/components/products/ProductCard.tsx`

- Outer wrapper: `rounded-2xl` (was `rounded-lg`), `shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300`
- Border on hover: `hover:border-primary/30 dark:hover:border-primary/20`
- Image area: `aspect-[4/5]` (was `aspect-square`)
- Wishlist heart: `opacity-0 group-hover:opacity-100 transition-opacity duration-200`
- Discount badge: `bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-xs rounded-full px-2 py-0.5`
- Current price: `text-primary font-bold`
- Add-to-cart button: `bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl px-3 py-1.5 transition-all hover:shadow-glow active:scale-95`
- Seller name subtitle: `text-zinc-400 dark:text-zinc-500 text-xs` below title

---

### Task S2-2 — `CategoryCard` redesign `(Phase 1 / C5)`

**File:** `src/components/CategoryCard.tsx` (or feature equivalent — verify path)

Add `variant` prop (`"tile" | "pill"`, default `"tile"`):

**tile variant:**

- `rounded-2xl overflow-hidden aspect-[3/4] relative group cursor-pointer`
- Large emoji/icon: `text-6xl absolute top-4 left-4 group-hover:scale-110 transition-transform duration-300`
- Gradient fill overlay (LX-5): `absolute inset-0 from-primary/5 to-cobalt/5 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300`
- Bottom name overlay: `bg-gradient-to-t from-black/70 to-transparent` with `font-display text-xl text-white`
- Product count chip: `bg-white/20 backdrop-blur text-white text-xs rounded-full px-2`
- Animated underline (LX-4): `bg-primary h-0.5 w-0 rounded-full transition-all duration-300 group-hover:w-8`

**pill variant:**

- `rounded-full bg-zinc-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-all`

---

### Task S2-3 — `StoreCard` redesign `(Phase 1 / C6)`

**File:** `src/components/StoreCard.tsx`

- Add `group` class for hover orchestration
- "Visit Store →" CTA overlay: `absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 flex items-end p-3`
- Verified badge: `CheckBadgeIcon` on avatar corner (cobalt, white bg behind)
- Stats row: product count + rating as `text-sm text-zinc-500` inline beside store name

---

### Task S2-4 — `EventCard` + `BlogCard` redesign `(Phase 1 / C7)`

**Files:** `src/components/EventCard.tsx`, `src/components/BlogCard.tsx`

Add `variant` prop (`"standard" | "overlay"`, default `"standard"`):

**overlay variant:**

- Image: `group-hover:scale-105 transition-transform duration-500`
- Category tag: `absolute top-3 left-3 bg-black/40 backdrop-blur text-white text-xs rounded-full px-2 py-1`
- Date badge: `absolute top-3 right-3 bg-white dark:bg-slate-900 text-xs rounded-lg px-2 py-1 shadow-sm`
- Title: `absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-16 text-white font-display`

For `BlogCard`: use `aspect-video` (16:9) on thumbnail. `group-hover:text-primary` on title.

---

### Task S2-5 — `ReviewCard` redesign `(Phase 1 / C8)`

**Extract to:** `src/features/homepage/components/ReviewCard.tsx`

- Card: `rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-md relative overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300`
- Quote icon (from LX-8): `<Quote className="text-primary/10 mb-4 h-8 w-8" />` — at top (not oversized watermark)
- Star rating: amber `flex gap-0.5` row — moved to top, before body text
- Body: `text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-4`
- Divider (LX-8): `<div className="bg-primary/30 my-5 h-px w-full" />`
- Reviewer row: avatar circle + name `font-semibold text-sm` + "Verified" chip `text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 text-xs rounded-full px-2`

---

### Task S2-6 — Buy Now button on product page `(PP-2 · P1)`

**File:** `src/features/products/components/ProductActions.tsx`

In the desktop sticky column, below the Add-to-Cart button, add:

```tsx
{
  product.inStock && (
    <Button
      variant="outline"
      size="lg"
      className="w-full"
      onClick={handleBuyNow}
    >
      <Zap className="h-5 w-5" />
      {t("buyNow")}
    </Button>
  );
}
```

`handleBuyNow`: add item to cart store then `router.push("/checkout")`.

---

### Task S2-7 — Image zoom cursor + center ZoomIn hint `(PP-6 · P2)`

**File:** `src/features/products/components/ProductImageGallery.tsx`

- Main image wrapper: add `cursor-zoom-in`
- Add `<ZoomIn className="h-6 w-6 text-white" />` centered with `absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`
- Active thumbnail: add `border-2 border-primary rounded-xl` for selected state, remove any existing highlight class

---

### Task S2-8 — Stock urgency label `(PP-7 · P2)`

**File:** `src/features/products/components/ProductActions.tsx`

Below the quantity/CTA block, add:

```tsx
{
  product.inStock && selectedVariant.stock <= 5 && (
    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
      {t("onlyLeft", { count: selectedVariant.stock })}
    </p>
  );
}
```

Add `"onlyLeft"` translation key to all locale files.

---

### Task S2-9 — Unify BottomNavbar active icon colors `(NV-4 · P1)`

**File:** `src/components/layout/BottomNavbar.tsx`

- Remove per-icon hardcoded colors (blue-500, emerald-500, violet-500, orange-500, rose-500)
- Active state: `text-primary` for all items
- Inactive state: `text-zinc-500 dark:text-slate-400` for all items

**Build gate — Sprint 2:**

```powershell
npx tsc --noEmit
npm run build
```

---

## Sprint 3 — Hero Sequences + Carousels

---

### Task S3-1 — `WelcomeSection` redesign `(Phase 2 / C1)`

**File:** `src/features/homepage/components/WelcomeSection.tsx`

- H1: `font-display text-5xl md:text-7xl lg:text-8xl bg-gradient-to-r from-primary via-cobalt to-secondary bg-clip-text text-transparent`
- Pill badge above H1 (LX-2): `inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-1.5 text-xs font-medium tracking-[0.2em] uppercase text-primary backdrop-blur-sm` with flanking dots
- Subtitle: `text-xl text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed`
- Dual CTA: primary filled + ghost outline side by side
- Trust badge chips below CTA: `bg-zinc-100 dark:bg-slate-800 rounded-full px-3 py-1 text-xs` with emoji
- Stagger classes (S0-3): `.stagger-1` through `.stagger-5` on each text element
- Desktop 2-col: left text + right `<MediaImage>` or gradient placeholder `rounded-3xl`
- Section padding: `py-16 md:py-24`
- Decorative background rings (LX-2): slow-spinning dashed rings in absolute-positioned divs (Beyblade flavour)

---

### Task S3-2 — `StatsCounterSection` redesign `(Phase 2 / C9)`

**File:** `src/features/homepage/components/StatsCounterSection.tsx`

- Background: `bg-gradient-to-br from-cobalt-900 via-slate-900 to-cobalt-950`
- Number: `font-display text-5xl bg-gradient-to-b from-primary to-cobalt/80 bg-clip-text text-transparent`
- Label: `text-zinc-400 text-sm uppercase tracking-widest`
- Icon wrapper: `w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center`
- Desktop dividers: `border-r border-white/10` between stat items (not cards)

---

### Task S3-3 — `TrustFeaturesSection` dual variant `(Phase 2 / C10)`

**File:** `src/features/homepage/components/TrustFeaturesSection.tsx`

Add `variant` prop (`"strip" | "cards"`, default `"cards"`):

**strip:** `flex gap-6 overflow-x-auto` with `.animate-marquee` — icon + text, no card chrome.

**cards (enhanced with LX-9):**

- Icon box: `from-primary/10 to-cobalt/10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br`
- Icon `strokeWidth={1.5}`
- Title: `text-sm font-semibold tracking-wide uppercase`
- Description: `text-xs leading-relaxed text-zinc-500`
- Grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`

---

### Task S3-4 — `HowItWorksSection` redesign `(Phase 2 / C11)`

**File:** `src/features/homepage/components/HowItWorksSection.tsx`

- Step watermark: `font-display text-7xl bg-clip-text text-transparent bg-gradient-to-br from-primary to-cobalt opacity-20` behind each card (absolute)
- Visible index: `w-10 h-10 rounded-full bg-primary text-white font-bold text-sm flex-center` on top
- Cards: `rounded-3xl p-8 bg-white dark:bg-slate-900 shadow-soft group hover:-translate-y-2 hover:shadow-xl transition-all duration-300`
- Stagger animation on scroll enter: add `.stagger-1/2/3` on the three cards (triggered by `IntersectionObserver` adding an `is-visible` class that starts animations)

---

### Task S3-5 — `SectionCarousel` header + arrows `(Phase 3 / C3)`

**File:** `src/features/homepage/components/SectionCarousel.tsx`

- Add `headingVariant` prop (`"default" | "gradient" | "editorial"`)
- **editorial:** pill badge + `font-display text-4xl` H2 + section ornament (LX-3: `── ✦ ──`) below heading
- **gradient:** H2 with `bg-gradient-to-r from-primary to-cobalt bg-clip-text text-transparent`
- Arrow buttons: replace current minimal circles with `carousel.arrow` token (from S0-3)
- Peek effect: `showPeek` prop (default `false`) — adds `-mr-6 md:-mr-8` to scroller wrapper when enabled
- Dot indicators: active dot = `w-8 h-2 rounded-full bg-white transition-all` / inactive = `w-2 h-2`

---

### Task S3-6 — `HeroCarousel` redesign `(Phase 3 / C2)`

**File:** `src/features/homepage/components/HeroCarousel.tsx`

- Height: `min-h-[420px] md:min-h-[560px] lg:min-h-[680px]` (replace fixed aspect-ratio)
- Auto-advance: 4000ms
- Progress bar: CSS animation `progress-fill 4s linear` inside each active dot indicator
- Active dot: `w-8` pill morph, inactive `w-2` — `transition-all duration-500`
- Arrows: same `carousel.arrow` token as S3-5
- Overlay H1: `font-display text-6xl lg:text-8xl text-white drop-shadow-2xl`
- Bottom gradient bleed: `absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-slate-950 to-transparent pointer-events-none`
- Stagger entrance (LX-2): apply `.stagger-1` through `.stagger-4` on slide overlay text elements

---

### Task S3-7 — Cmd+K search shortcut `(SR-1 · P2)`

**File:** `src/components/utility/Search.tsx` (overlay trigger) or wherever `SearchOverlay` opens

- Add `useEffect` for `keydown` — listen for `(e.metaKey || e.ctrlKey) && e.key === "k"` → open overlay
- Add `<kbd className="hidden xl:inline-flex border border-zinc-300/50 text-zinc-400 rounded px-1.5 py-0.5 text-[10px]">⌘K</kbd>` next to search icon in `TitleBarLayout`

---

### Task S3-8 — Inline search in mobile Sidebar `(NV-3 · P2)`

**File:** `src/components/layout/Sidebar.tsx`

Below the header strip, add an inline `<Search>` component in inline mode (`deferred=false`). On submit, navigate to `/search?q=...` and call `onClose()`.

**Build gate — Sprint 3:**

```powershell
npx tsc --noEmit
npm run build
```

---

## Sprint 4 — Content Sections + Shop UX

---

### Task S4-1 — Homepage content sections `(Phase 4)`

Apply new card variants and `editorial`/`gradient` `headingVariant` to each section. Section-specific theme guidance:

| Section file                   | `headingVariant`                       | Background special treatment                         | LX ref                      |
| ------------------------------ | -------------------------------------- | ---------------------------------------------------- | --------------------------- |
| `TopCategoriesSection.tsx`     | `editorial` · pill: "SHOP BY CATEGORY" | `py-20`                                              | LX-4 CategoryCard glow ring |
| `TopBrandsSection.tsx`         | `editorial` · pill: "EXPLORE BRANDS"   | warm gradient `from-amber-50 dark:from-amber-950/20` | —                           |
| `FeaturedProductsSection.tsx`  | `gradient`                             | —                                                    | C4 ProductCard              |
| `FeaturedAuctionsSection.tsx`  | `editorial` · pill: "⚡ LIVE AUCTIONS" | `from-amber-500/5` strip                             | C4                          |
| `FeaturedPreOrdersSection.tsx` | `editorial` · pill: "COMING SOON"      | cobalt very light bg strip                           | C4                          |
| `FeaturedStoresSection.tsx`    | `editorial` · pill: "TOP STORES"       | dark editorial `bg-slate-950`                        | C6 StoreCard                |
| `FeaturedEventsSection.tsx`    | `editorial`                            | —                                                    | C7 EventCard overlay        |
| `BlogArticlesSection.tsx`      | `editorial` · pill: "FROM THE BLOG"    | —                                                    | C7 BlogCard + LX-12         |

LX-5 ornamental divider (`── ✦ ──`) below every H2 in these sections.

---

### Task S4-2 — BuyMoreSaveMore upsell `(PP-3 · P2)`

**New file:** `src/features/products/components/BuyMoreSaveMore.tsx`

- Props: `product: ProductDocument`
- Reads `product.bulkDiscounts: { quantity: number; discountPercent: number }[]`
- Renders a horizontal tier row: `Buy 2, save 10%` / `Buy 3, save 15%` etc.
- Tile: `rounded-xl border-2 p-3 text-center` — active tier = `border-primary bg-primary/5`
- Place in `ProductDetailView.tsx` below the main grid, above `<ProductReviews>`
- If `!product.bulkDiscounts?.length` → renders nothing

---

### Task S4-3 — PromoBannerStrip on product pages `(PP-4 · P2)`

**New file:** `src/features/products/components/PromoBannerStrip.tsx`

- 3 icon chips: Free Shipping above ₹`siteSettings.shippingThreshold` · Easy Returns · 100% Authentic
- Layout: `flex flex-wrap gap-4 justify-center py-4 border-y border-zinc-100 dark:border-slate-800`
- Each chip: `flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400`
- Icon: `w-4 h-4 text-primary strokeWidth={1.5}`
- Place in `ProductDetailView.tsx` above `<BuyMoreSaveMore>`

---

### Task S4-4 — ProductTabs `(PP-5 · P2)`

**New file:** `src/features/products/components/ProductTabs.tsx`

- Tabs: Description · Ingredients · How to Use · Reviews (anchor scroll to `#reviews`)
- Tab nav: pill group `rounded-full bg-zinc-100 dark:bg-slate-800 p-1 flex gap-1` — active = `bg-white dark:bg-slate-700 shadow-sm rounded-full px-4 py-1.5 text-sm font-medium`
- Description panel: `prose dark:prose-invert max-w-none text-sm` — renders `product.description`
- Ingredients panel: bullet list from `product.ingredients[]`
- How to Use panel: numbered list from `product.howToUse[]`
- Reviews tab: `<a href="#reviews">` anchor scroll, not a panel
- Place in `ProductDetailView.tsx` after `<PromoBannerStrip>`

---

### Task S4-5 — ProductGrid skeleton improvement `(SH-1 · P2)`

**File:** `src/components/products/ProductGrid.tsx` (skeleton card)

Change `ProductCardSkeleton`:

```tsx
<div className="border-border overflow-hidden rounded-2xl border">
  <Skeleton className="aspect-[4/5] w-full" />
  <div className="space-y-2 p-4">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <Skeleton className="h-5 w-1/3" />
  </div>
</div>
```

---

### Task S4-6 — Collapsible filter sections `(SH-3 · P2)`

**File:** `src/components/filters/FilterFacetSection.tsx` (or wherever `FilterFacetSection` is defined)

Add `defaultOpen?: boolean` prop (default `true`). Wrap content in:

```tsx
const [open, setOpen] = useState(defaultOpen ?? true);
// ...
<button
  onClick={() => setOpen((v) => !v)}
  className="flex w-full items-center justify-between text-sm font-semibold mb-2"
>
  {title}
  <ChevronDown
    className={cn(
      "h-4 w-4 transition-transform duration-200",
      !open && "-rotate-180",
    )}
  />
</button>;
{
  open && <div className="flex flex-col gap-2">{children}</div>;
}
```

---

### Task S4-7 — Add Cormorant Garamond as editorial font `(FN-2 · P2)`

**File:** `src/app/layout.tsx`

```ts
import { Bangers, Inter, Cormorant_Garamond } from "next/font/google";
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});
```

Apply `cormorant.variable` to `<html>`.

Add to `tailwind.config.js`:

```js
editorial: ["var(--font-editorial)", "Georgia", "serif"],
```

Use `font-editorial` for: testimonial quotes, blog article headings, `"Our Story"` sections, `WelcomeSection` subtitle.

**Build gate — Sprint 4:**

```powershell
npx tsc --noEmit
npm run build
```

---

## Sprint 5 — Layout Shell + Nav + Search

---

### Task S5-1 — `AdvertisementBanner` upgrade `(Phase 5 / C12)`

**File:** `src/features/homepage/components/AdvertisementBanner.tsx`

- Animated mesh blobs (LX-6): `absolute rounded-full blur-3xl animate-pulse-slow` in brand gradient behind content
- Decorative rings (LX-6): `absolute -top-32 -left-32 h-64 w-64 rounded-full border border-white/[0.06]`
- CTA button: add `hover:shadow-glow` (from `shadow-glow` utility or inline box-shadow lime glow)
- Add `compact` boolean prop — when true: `h-32` pill (logo + text + CTA on one line)

---

### Task S5-2 — `WhatsAppCommunitySection` upgrade `(Phase 5)`

**File:** `src/features/homepage/components/WhatsAppCommunitySection.tsx`

- Facepile avatars: 4-5 overlapping avatar circles `w-8 h-8 rounded-full border-2 border-white` (use product/user initials as fallback)
- Member counter badge: `text-emerald-600 font-bold` next to facepile
- Testimonial snippet: short `italic text-zinc-600 dark:text-zinc-400` quote
- Join CTA: add `animate-pulse` ring around the WhatsApp button (lime/green glow)

---

### Task S5-3 — `FAQSection` pill tabs + animated accordion `(Phase 5 / C13)`

**File:** `src/features/homepage/components/FAQSection.tsx`

- Tab nav: replace current line-`Tabs` with `rounded-full bg-zinc-100 dark:bg-slate-800 p-1 flex gap-1` pill group; active = `bg-white dark:bg-slate-700 shadow-sm rounded-full px-4 py-1.5 text-sm font-medium`
- Accordion: `max-h` animated expand with `transition-all duration-300 ease-out`; chevron `rotate-180` on open; active row: `bg-primary/5 dark:bg-primary/10 border-l-4 border-primary`
- Section header: `headingVariant="gradient"`

---

### Task S5-4 — `TitleBarLayout` promo strip + wordmark `(Phase 6 / C15)`

**File:** `src/components/layout/TitleBarLayout.tsx`

- Promo micro-strip (LX-7 `AnnouncementBar`): above `<header>` — `from-primary to-cobalt bg-gradient-to-r text-white text-xs py-1 text-center` with dismiss `×` button; shown only when `siteSettings.promoStripText` is set
- Logo wordmark: add `font-display text-xl tracking-tight text-cobalt-700 dark:text-cobalt-300` "LetItRip" text beside the icon for `hidden sm:block`
- Search expand: on search icon click, show full-width sticky overlay (`absolute top-12 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg p-4 shadow-xl`) instead of inline expand

---

### Task S5-5 — `FooterLayout` trust bar + newsletter `(Phase 6 / C14)`

**File:** `src/components/layout/FooterLayout.tsx`

- Trust bar above main content: 5 tiny icon+label chips (free shipping, easy returns, secure payment, 24/7 support, authentic sellers) — `flex flex-wrap gap-6 justify-center py-6 border-t`
- Newsletter strip (LX-11): inline email + Subscribe in brand column. Background `from-primary/90 to-cobalt/80 text-white` strip with decorative rings
- Social icons (LX-13): `h-9 w-9 rounded-full border border-white/10 hover:border-primary/40 hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all`
- Footer gradient: `bg-gradient-to-b from-slate-950 to-cobalt-950/50 border-t border-white/5`
- Bottom line: include "Built with ❤️ in India" in `text-zinc-400 text-xs`

---

### Task S5-6 — `BottomNavbar` frosted glass + gradient indicator `(Phase 6 / C15-adjacent)`

**File:** `src/components/layout/BottomNavbar.tsx`

- Background: ensure `bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t`
- Active tab: add `bg-gradient-to-b from-primary/10 to-transparent absolute inset-0 rounded-t-xl` indicator (gradient glow above active icon)
- Height: verify `h-14` stays (safe for iPhone home area)

---

### Task S5-7 — Nav pill items for high-priority links `(NV-2 · P2)`

**File:** `src/components/layout/NavbarLayout.tsx` (or `NavItem`)

Add optional `highlighted?: boolean` to nav item config type. When `highlighted: true`:

```tsx
className =
  "border-primary/30 bg-primary/5 text-primary rounded-full border px-3 py-1";
```

Apply `highlighted: true` to: "Sell on LetItRip" + "Today's Deals" in `MAIN_NAV_ITEMS` config.

---

### Task S5-8 — Slim double navbar `(NV-1 · P2)`

**Files:** `src/components/layout/TitleBarLayout.tsx`, `src/components/layout/MainNavbar.tsx`

Move the horizontal nav links from `MainNavbar` into `TitleBarLayout`'s inner container (desktop only, `hidden md:flex`), between logo and action icons. Remove `MainNavbar` as a separate sticky element or flatten it to `position: static` inside `TitleBarLayout`. Result: single sticky row on desktop, matching Licorice's cleaner pattern. Verify mobile is not affected (`hidden md:flex` already).

---

### Task S5-9 — SITE_LINKS quick access in SearchOverlay `(SR-2 · P2)`

**File:** `src/components/utility/Search.tsx` (overlay mode) or `SearchOverlay` component

- Define a `SITE_LINKS` array using `ROUTES` constants with icons and keyword arrays
- Show top 6 before/during typing (filtered by `label.includes(q) || keywords.some(k => k.includes(q))`)
- Display as a `ResultGroup` labelled "Quick Links" with each link as a row item
- Rendered with Lucide icon and label; click navigates and closes overlay

**Build gate — Sprint 5:**

```powershell
npx tsc --noEmit
npm run build
```

---

## Sprint 6 — Portal UX: Admin + Seller + User

---

### Task S6-1 — Extract `DashboardStatsCard` `(AU-9)`

**New file:** `src/components/DashboardStatsCard.tsx` (or `@mohasinac/ui` if ready)

```tsx
interface DashboardStatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; suffix?: string };
  href?: string;
  variant?: "default" | "dark";
}
```

- `dark` variant: `bg-slate-900 rounded-2xl border border-white/5 text-white`
- `default` variant: `bg-white dark:bg-slate-900 rounded-2xl border border-zinc-200 dark:border-slate-700`
- Icon: gradient blob background (`iconBg` → `w-10 h-10 rounded-xl flex items-center justify-center`)
- Value: `font-display text-3xl` (dark = `text-white`, default = `text-zinc-900 dark:text-white`)
- Trend: `▲ +12%` in `text-primary` (positive) / `▼ -3%` in `text-rose-400` (negative)
- Export from `@/components` barrel

---

### Task S6-2 — Admin Sidebar Navigation `(AU-1)`

**New files:**

- `src/features/admin/components/AdminSidebar.tsx`
- `src/features/admin/components/AdminTopBar.tsx`

**Update:** `src/app/[locale]/(admin)/admin/layout.tsx`

Admin layout shell:

```tsx
<ProtectedRoute requireRole="admin">
  <div className="flex h-screen overflow-hidden">
    <AdminSidebar />
    <div className="flex flex-1 flex-col overflow-hidden">
      <AdminTopBar />
      <main className="flex-1 overflow-y-auto p-6 bg-slate-950/30">
        {children}
      </main>
    </div>
  </div>
</ProtectedRoute>
```

`AdminSidebar` spec:

- `w-64 bg-slate-950 flex-shrink-0 flex flex-col h-full overflow-y-auto`
- Logo: `font-display text-xl text-white` + "Admin" pill `bg-primary/20 text-primary text-xs rounded-full px-2`
- Groups (see MAKEOVER.md AU-1 for full group/item list): Overview, Marketplace, Content, Community, Platform
- Group label: `text-zinc-500 text-xs tracking-widest px-3 mb-1 mt-4 uppercase`
- Nav item: `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors`
- Active item: `bg-primary/15 text-primary`
- Mobile: drawer using `@mohasinac/ui Drawer` (left side)

`AdminTopBar` spec:

- `h-14 border-b border-white/5 bg-slate-950/80 backdrop-blur flex items-center px-6 justify-between`
- Left: `AutoBreadcrumbs` (existing)
- Right: `NotificationBell` + `AvatarDisplay` + role badge

**Delete:** `src/features/admin/components/AdminTabs.tsx` after verifying all 20 admin pages link via sidebar.

---

### Task S6-3 — Admin Dashboard: Priority Alerts + Stats `(AU-2)`

**File:** `src/features/admin/components/AdminDashboard.tsx` (or the dashboard view)

Add `AdminPriorityAlerts` section at top:

- 3 conditional alert cards: pending payouts · disputed orders · unverified sellers
- Each: `border-l-4 rounded-xl p-4 flex items-center justify-between` with amber/rose/orange left border
- Only rendered when the respective count > 0

Stats cards: migrate to `DashboardStatsCard` with `variant="dark"`.

---

### Task S6-4 — Seller Sidebar Navigation `(AU-4)`

**New files:**

- `src/features/seller/components/SellerSidebar.tsx`
- Update `src/app/[locale]/(seller)/seller/layout.tsx`

Same pattern as `AdminSidebar` but:

- `w-56 bg-white dark:bg-slate-950 border-r border-zinc-200 dark:border-slate-800`
- Active item: `bg-cobalt/10 text-cobalt dark:text-cobalt-400`
- Groups: Overview, Products, Sales, Store (see MAKEOVER.md AU-4 for items)
- Add `SellerPriorityAlerts` in seller dashboard (pending shipments, incomplete store, available payout)

**Delete:** `src/features/seller/components/SellerTabs.tsx` after migration.

---

### Task S6-5 — User Account Hub Landing Page `(AU-6)`

**New file:** `src/features/user/components/UserAccountHub.tsx`  
**Update:** `src/app/[locale]/(user)/user/page.tsx` — render `<UserAccountHub>`

Hub layout (see MAKEOVER.md AU-6 for full spec):

1. Profile header: avatar + display name/email + member-since + role badge + RipCoins + quick stats row
2. Quick nav grid `grid-cols-2 sm:grid-cols-3 gap-4`: My Orders, Messages, Notifications, Addresses, RipCoins, Settings — each a `rounded-2xl p-5` card with gradient icon blob + label + optional count badge
3. Recent orders (last 3): `OrderSummaryRow` per order + "View all →" link

Profile header: Update `ProfileHeader` (existing) to add RipCoins balance inline. Add "Become a Seller" CTA if `user.role === "user"`.

**Build gate — Sprint 6:**

```powershell
npx tsc --noEmit
npm run build
```

---

## Sprint 7 — Portal Completion + Global Polish

---

### Task S7-1 — Admin Data Tables standardization `(AU-3)`

Migrate these admin views to `DataTable` (from `@mohasinac/ui`), replacing raw `<table>` elements:

- `AdminBlogView` → `DataTable<BlogDocument>`
- `AdminCouponsView` → `DataTable<CouponDocument>`
- `AdminFaqsView` → `DataTable<FaqDocument>`

For each: define `Column<T>[]` array, move row actions to a consistent `ActionMenu` (`…` button → Radix `DropdownMenu` → View / Edit / Delete).

---

### Task S7-2 — Seller Product View Toggle `(AU-5)`

**File:** `src/features/seller/components/SellerProductsView.tsx`

- Add `?view=table|grid` URL param (via `useSearchParams`)
- Grid view: `SellerProductCard` with stock bar, status pill, revenue subtitle
- Table view: `DataTable<ProductDocument>` with inline row actions
- Toggle button: icon grid/list switch in the view header

---

### Task S7-3 — User Portal Sidebar `(AU-7)`

**New file:** `src/features/user/components/UserSidebar.tsx`  
**Update:** `src/app/[locale]/(user)/user/layout.tsx`

Desktop:

- `w-56 border-r border-zinc-200 dark:border-slate-800 hidden md:flex flex-col`
- Avatar header + nav items (see MAKEOVER.md AU-7 for full list)
- Unread/count badges: `bg-secondary text-white` small pills
- "Become a Seller" highlighted with cobalt pill (if `role === "user"`)

Mobile:

- Bottom-sheet `Drawer` (from `@mohasinac/ui`) triggered from profile icon in sticky mobile header

**Delete:** `src/features/user/components/UserTabs.tsx` after migration.

---

### Task S7-4 — Order Detail Status Stepper + Timeline `(AU-8)`

**File:** `src/features/orders/components/OrderDetailView.tsx` (or user-facing order detail)

- Status stepper at top: `Placed → Confirmed → Shipped → Delivered` horizontal row; each step: dot `w-3 h-3 rounded-full` + label; current = `bg-primary text-primary`, completed = `bg-zinc-300`, pending = `bg-zinc-200 dark:bg-slate-700`
- Timeline: vertical list from `order.timeline[]`; each row: `w-2 h-2 rounded-full bg-zinc-400` connector dot + timestamp + event description + icon
- Quick actions for user: Cancel (if status = placed/confirmed), Download Invoice, Reorder all
- Shipping tracking strip: if `order.trackingId` set, show Shiprocket status badge

---

### Task S7-5 — Global Polish + Motion audit `(Phase 7)`

Audit `src/components/` + `src/features/` for:

1. **Card transitions:** All cards should have `transition-all duration-300 ease-out`. Add `card-lift` utility class (from S0-3 CSS) where missing. Priority: ProductCard, StoreCard, CategoryCard, EventCard, BlogCard, ReviewCard.

2. **Skeleton radii:** All skeleton loader containers → `rounded-2xl` to match new card radius.

3. **Breadcrumbs:** Replace text separators `/` with `<ChevronRight className="h-3 w-3 text-zinc-400">` icon; muted inactive links `text-zinc-400 hover:text-zinc-600`.

4. **Icon strokeWidth:** Apply `strokeWidth={1.5}` to all icons in trust/feature/stats sections (not interactive icons like close/menu which stay at default 2).

5. **Dark mode spot-check:** All new gradient/glass elements from Sprints 2–6; ensure `dark:` variants are present. Chrome DevTools → dark mode emulation.

6. **Image blur-up:** Add `placeholder="blur"` on `<MediaImage>` calls where `blurDataURL` is available in the product/store data.

7. **Locale files:** Ensure all new translation keys added in S2-S6 (e.g., `buyNow`, `onlyLeft`, `quickLinks`) are present in `messages/en.json`, `in.json`, `mh.json`, `tn.json`, `ts.json`.

**Final build gate — Sprint 7:**

```powershell
npx tsc --noEmit
npm run build
npm test
```

---

## Sprint 8 — Before/After Section _(Optional)_

---

### Task S8-1 — `BeforeAfterCard` + `FeaturedResultsSection` `(Phase 8 / LX-1)`

**New files:**

- `src/features/homepage/components/BeforeAfterCard.tsx`
- `src/features/homepage/components/FeaturedResultsSection.tsx`

`BeforeAfterCard` spec (port from Licorice, adapt to LetItRip tokens):

- Container: `relative overflow-hidden aspect-[4/3] rounded-2xl border border-zinc-200 dark:border-slate-700 select-none`
- "After" image: full-frame `<MediaImage>`
- "Before" clip: `absolute inset-0 overflow-hidden` with `width: ${position}%` — contains another `<MediaImage>`
- Handle: `absolute top-0 bottom-0` at `left: ${position}%` — drag knob `w-8 h-8 rounded-full bg-white dark:bg-slate-900 shadow-lg border-2 border-primary flex items-center justify-center`
- Handle icon: `<ArrowLeftRight className="h-4 w-4 text-primary" />`
- Labels: `BEFORE` + `AFTER` pills — `absolute top-3 left/right-3 bg-black/50 backdrop-blur text-white text-xs rounded-full px-3 py-1`
- Mouse/touch drag: `pointerdown` → `pointermove` → clamp `position` to 5–95
- Keyboard: `ArrowLeft`/`ArrowRight` nudge ±5; `role="slider"` + `aria-valuenow`
- Caption: `<p className="p-4 text-sm font-medium text-center">`

`FeaturedResultsSection`:

- RSC: fetch `siteSettings.featuredResults` SSR
- Section header: `editorial` variant, pill "REAL RESULTS", H2 "Proven by real people"
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
- Add `featuredResults` field (type `{ beforeImage, afterImage, caption }[]`) to `siteSettings` schema and repository

**Build gate — Sprint 8:**

```powershell
npx tsc --noEmit
npm run build
```

---

## Dependency Graph

```
S0 (Foundations)
 └─ S1 (Package library)
     └─ S2 (Cards + product micro-UX)
         └─ S3 (Hero + Carousel)             [can start S2/S3 in parallel]
         └─ S4 (Content sections + shop)     [depends on S2 cards + S3 carousel]
             └─ S5 (Layout shell + nav)      [depends on S1 Drawer primitive]
                 └─ S6 (Portal UX)           [depends on S1 DataTable + DashboardStatsCard]
                     └─ S7 (Portal complete + polish)
                         └─ S8 (Before/After — optional)
```

**S2 and S3 can be worked simultaneously if two developers available** (no shared files). All other sprints are sequential.

---

## File Change Index

Quick reference — which files each sprint modifies:

| Sprint | Files modified / created                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S0     | `src/app/layout.tsx`, `src/app/globals.css`, `tailwind.config.js`, `src/constants/theme.ts`, `next.config.js`, `packages/utils/**`, `tsconfig.json`                                                                                                                                                                                                                                                                                            |
| S1     | `packages/ui/src/*.tsx` (8 new), `packages/ui/package.json`, `src/components/index.ts`                                                                                                                                                                                                                                                                                                                                                         |
| S2     | `src/components/products/ProductCard.tsx`, `src/components/CategoryCard.tsx`, `src/components/StoreCard.tsx`, `src/components/EventCard.tsx`, `src/components/BlogCard.tsx`, `src/features/homepage/components/ReviewCard.tsx` _(new)_, `src/features/products/components/ProductActions.tsx`, `src/features/products/components/ProductImageGallery.tsx`, `src/components/layout/BottomNavbar.tsx`, `src/components/products/ProductGrid.tsx` |
| S3     | `src/features/homepage/components/WelcomeSection.tsx`, `StatsCounterSection.tsx`, `TrustFeaturesSection.tsx`, `HowItWorksSection.tsx`, `SectionCarousel.tsx`, `HeroCarousel.tsx`, `src/components/utility/Search.tsx`, `src/components/layout/Sidebar.tsx`                                                                                                                                                                                     |
| S4     | `src/features/homepage/components/TopCategoriesSection.tsx` + 7 other section files, `src/features/products/components/BuyMoreSaveMore.tsx` _(new)_, `PromoBannerStrip.tsx` _(new)_, `ProductTabs.tsx` _(new)_, `ProductDetailView.tsx`, `src/components/filters/FilterFacetSection.tsx`                                                                                                                                                       |
| S5     | `src/features/homepage/components/AdvertisementBanner.tsx`, `WhatsAppCommunitySection.tsx`, `FAQSection.tsx`, `src/components/layout/TitleBarLayout.tsx`, `FooterLayout.tsx`, `BottomNavbar.tsx`, `NavbarLayout.tsx` (or `NavItem`), `src/components/utility/Search.tsx`                                                                                                                                                                       |
| S6     | `src/features/admin/components/AdminSidebar.tsx` _(new)_, `AdminTopBar.tsx` _(new)_, `src/app/[locale]/(admin)/admin/layout.tsx`, `src/features/seller/components/SellerSidebar.tsx` _(new)_, `src/app/[locale]/(seller)/seller/layout.tsx`, `src/features/user/components/UserAccountHub.tsx` _(new)_, `src/app/[locale]/(user)/user/page.tsx`, `src/components/DashboardStatsCard.tsx` _(new)_                                               |
| S7     | `src/app/[locale]/(admin)/admin/*/AdminBlogView.tsx` + 2 others, `src/features/seller/components/SellerProductsView.tsx`, `src/features/user/components/UserSidebar.tsx` _(new)_, `src/app/[locale]/(user)/user/layout.tsx`, `src/features/orders/components/OrderDetailView.tsx`, global audit across `src/components/`                                                                                                                       |
| S8     | `src/features/homepage/components/BeforeAfterCard.tsx` _(new)_, `FeaturedResultsSection.tsx` _(new)_, `src/db/schema/siteSettings.schema.ts`, relevant repository                                                                                                                                                                                                                                                                              |

---

## Before You Start

Run these to understand the current state:

```powershell
# Verify current build passes before touching anything
npx tsc --noEmit
npm run build

# Find all orange CTA occurrences (S0-1)
Select-String -Path "src\**\*.tsx" -Pattern "bg-orange-500" -Recurse

# Confirm @lir alias resolution is working
npx tsc --noEmit --traceResolution 2>&1 | Select-String "@lir"
```
