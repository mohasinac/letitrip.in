# LetItRip.in — Visual Makeover Plan

> **Goal**: Transform the platform from a functional-but-sterile layout into a vibrant, premium marketplace. Keep all existing color tokens (`primary` lime-green, `secondary` hot-pink, `cobalt` blue, Bangers display font). Lift the craft everywhere: spacing, motion, typographic hierarchy, cards, sections, and interactive states.
>
> **Reference inspiration**: licoricehealth.store — clean editorial hero, polished trust strips, rich product cards with micro-interactions, editorial section headers with tag pills, gradient-text headings, staggered grid animations, momentum scroll carousels.
>
> **Rules**:
>
> - Every component stays configurable. No hardcoded pixels. Use `THEME_CONSTANTS`, Tailwind tokens, and props to drive all variation.
> - **No raw HTML tags in JSX.** Use the primitives from `@/components` instead:
>   - Structure: `Section`, `Article`, `Main`, `Nav`, `Aside`, `Ul`, `Ol`, `Li`, `BlockHeader`, `BlockFooter`
>   - Typography: `Heading`, `Text`, `Label`, `Caption`, `Span`, `TextLink`
>   - Interactive: `Button`, `Badge`, `Alert`, `Divider`
>   - Media: `MediaImage`, `MediaVideo`, `MediaAvatar`
>   - Raw `<div>` and `<span>` are only acceptable as layout/animation wrapper shells with no semantic meaning and no text content.

---

## Design Audit — What Feels "Made by a Robot"

| Area                    | Current Problem                                                                                          | Fix Direction                                                                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hero**                | Flat text on full-width image/video. No depth, no layering. CTA looks tucked away.                       | Layered glass panels, oversized display type, trust badges baked in, gradient text headline                                                                                  |
| **Welcome section**     | Left-aligned text block + one button. Zero visual weight.                                                | Split layout: editorial left (H1 with gradient, badge pill, social proof badges, dual CTA) + visual right (floating card art)                                                |
| **Stats counters**      | 4 boring number cards on light gray strip. Font is body-weight.                                          | Each stat gets icon gradient blob behind it, big `font-display` number with animated count-up, hair-line dividers on desktop                                                 |
| **Trust strip**         | 4 icon+text cards, flat white bg, flat border.                                                           | Scrolling ticker-tape strip with icons, or an elevated 4-up glass card row with subtle hover lift and gradient icon circles                                                  |
| **How It Works**        | 3 flat cards with text connector arrows. Looks like a diagram.                                           | Step cards with large gradient circle index numbers, connectors animated on scroll, micro-motion on icon                                                                     |
| **Section titles**      | Just `<h2>Title</h2>` + paragraph.                                                                       | Pill-label badge above (e.g. "FEATURED"), accent-underline on h2, optional gradient text, description line in muted text                                                     |
| **SectionCarousel**     | Overflow-hidden scroll container. Arrow buttons are minimal icon-only circles.                           | Arrows become large ghost buttons with label or directional chevrons; peek of next card visible (partial); dot pagination with active indicator morph                        |
| **ProductCard**         | `rounded-lg` box shadow on hover. Hover image slideshow loses smoothness. Badge text is barely readable. | Rounded-2xl, lift on hover (translate-y), smooth crossfade images, gradient overlay badge, wishlist always visible (opacity-0 → 1 on card hover), price diff percentage pill |
| **CategoryCard**        | Text-over-image or icon + text label. No real visual identity.                                           | Tall vertical card with gradient background, large emoji/svg icon, bold label, category count chip at bottom — all configurable                                              |
| **StoreCard**           | Classic avatar-overlap card. Section feels like a list dump.                                             | Editorial banner card with full-bleed brand banner, avatar ring, verified badge, product count + star rating inline, "Visit Store" CTA on hover overlay                      |
| **EventCard**           | Aspect-ratio image + text block below. Standard card.                                                    | Magazine-style: large image with gradient overlay, category tag top-left, date badge top-right, title bottom-left over overlay                                               |
| **BlogCard**            | Same pattern as EventCard.                                                                               | Three variants ready: horizontal thumb+text (feed), vertical editorial (featured), compact text-only (sidebar)                                                               |
| **ReviewCard**          | White text blocks, avatar circle, star row below.                                                        | Glassmorphic card with quote-mark watermark (oversized `"` in brand color/low opacity), rating before reviewer name                                                          |
| **AdvertisementBanner** | Split-editorial OR gradient CTA — both feel generic.                                                     | Full-bleed editorial with background blur mesh, floating product mockup image, oversized tag pill, animated beam/glow element behind CTA                                     |
| **WhatsApp section**    | Green gradient block. Very generic.                                                                      | Community section with user avatar stack (facepile), counter badge, testimonial snippet, animated pulse on join button                                                       |
| **FAQ**                 | Tab bar + accordion. Functional only.                                                                    | Clean accordion with animated chevron, tab nav as pill group (not default Tabs), smooth animated reveal                                                                      |
| **Footer**              | 5-column link grid + copyright line. Zero brand personality.                                             | Brand column with logo + tagline + social icons with hover color fills; newsletter inline; trust badges row above copyright                                                  |
| **TitleBar**            | `bg-white/90 backdrop-blur`. Logo is text initial in cobalt box.                                         | Keep glass effect, refine brand wordmark, add free-shipping micro-strip above on mobile, search transforms to overlay on expand                                              |
| **BottomNavbar**        | Standard icon+label row. Fine but invisible as a design element.                                         | Frosted glass elevated above page, active tab gets gradient indicator, ripple on tap                                                                                         |
| **Scrollbars**          | Custom scrollbar is fine.                                                                                | Keep `.scrollbar-thin`.                                                                                                                                                      |
| **Micro-interactions**  | `transition-all duration-200` used inconsistently. Most hover states are just shadow/border-color.       | Standardize: `transition-all duration-300 ease-out` everywhere; `hover:-translate-y-1` on cards; `hover:scale-[1.02]` on CTAs; skeleton-to-content crossfade                 |

---

## Color Palette (Locked — Do Not Change)

```
primary    → Lime Green   #65c408  (CTA, active states, light mode accents)
secondary  → Hot Pink     #e91e8c  (dark mode accents, highlight chips)
cobalt     → Cobalt Blue  #3570fc  (links, logo, selected states)
accent     → Steel Gray   (neutral metallic)
Bangers    → Display font (all h1/h2/display, marketing copy)
Inter      → Body font    (all body, labels, UI copy)
```

**Gradient pairings to introduce (all use existing tokens):**

```
Energize  → from-primary-400 to-cobalt-500       (CTA buttons, section headings)
Charged   → from-secondary-500 to-cobalt-600     (dark-mode hero, featured badge)
Warm      → from-amber-400 to-primary-500         (events, auctions highlight)
Deep      → from-slate-900 via-cobalt-950 to-slate-900 (dark hero overlays)
```

---

## Component Redesign Specs

### C1 — `WelcomeSection`

**File:** `src/features/homepage/components/WelcomeSection.tsx`

Layout change:

```
Mobile:  single column — badge pill → H1 → subtitle → dual CTA → trust badges row
Desktop: 2-col (left: text stack | right: decorative element — optional bg image or brand art)
```

Changes:

- H1: `font-display text-5xl md:text-7xl lg:text-8xl` — use `.text-gradient-brand` utility (already in `globals.css`) or inline `bg-gradient-to-r from-primary-400 via-cobalt-500 to-secondary-500 bg-clip-text text-transparent`
- Pill badge above H1: `bg-primary-500/15 text-primary-600 border border-primary-500/30 rounded-full px-4 py-1 text-xs tracking-widest uppercase` — use `THEME_CONSTANTS.sectionHeader.pill` base as reference — configurable via prop
- Subtitle: `text-xl text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed`
- Dual CTA: Use `<Button>` from `@/components` — `variant="primary"` (lime filled) + `variant="outline"` — side-by-side
- Trust badges inline below CTA: 3–4 mini chips (`bg-zinc-100 dark:bg-slate-800`) with emoji + text — configurable array prop
- Right panel: `relative overflow-hidden rounded-3xl` — renders `<MediaImage>` from `@/components` if `ctaImage` CMS field set; else neutral gradient placeholder with floating product tile art
- Section padding: `py-16 md:py-24`

> **Existing infrastructure:** `Heading`, `Text`, `Label` from `@/components` (re-exported from `@lir/ui`). `Button` from `@/components`. `MediaImage` from `@/components`. `.text-gradient-brand` utility already in `globals.css`.

### C2 — `HeroCarousel`

**File:** `src/features/homepage/components/HeroCarousel.tsx`

Structural changes:

- Change aspect from `aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9]` to `min-h-[420px] md:min-h-[560px] lg:min-h-[680px] w-full` — allows text to breathe without cropping
- Auto-advance: reduce to `4000ms`, add progress bar that fills inside each dot indicator — use `animate-progress-fill` (already in `tailwind.config.js`) with CSS `animation-duration` set per-slide
- Arrows: change from small circle to `w-12 h-12 rounded-2xl bg-white/20 dark:bg-slate-900/20 backdrop-blur-md border border-white/30 hover:bg-white/40 shadow-lg` — use `THEME_CONSTANTS.carousel.arrow` tokens; directional arrow SVG
- Dot indicators: replace with pill-shaped track. Active dot morphs to `w-8` pill via `transition-all duration-500`; `THEME_CONSTANTS.carousel.dotInactive` → `THEME_CONSTANTS.carousel.dotActive`
- Overlay slide text: H1 gets `font-display text-6xl lg:text-8xl text-white text-shadow-lg` (`.text-shadow-lg` already in `globals.css`), add `animate-slide-in-left` on slide change (reset via `key` prop)
- Video badge: small `LIVE` badge (`<Badge>` from `@/components`) on video slides top-right — use `<MediaVideo>` from `@/components` for video slides
- Render slide images with `<MediaImage>` from `@/components`
- Fade gradient at bottom to bleed into next section: `absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-slate-950 to-transparent`

> **Existing infrastructure:** `MediaImage`, `MediaVideo` from `@/components`. `Badge` from `@/components`. `THEME_CONSTANTS.carousel.*` already has `arrow`, `dotActive`, `dotInactive` tokens. `animate-progress-fill`, `animate-slide-in-left` already in `tailwind.config.js`. `.text-shadow-lg` already in `globals.css`. Use `useSwipe` from `@lir/react` for touch swipe gesture support.

### C3 — `SectionCarousel`

**File:** `src/features/homepage/components/SectionCarousel.tsx`

Changes:

- Section header redesign: Add `headingVariant` prop (`default | gradient | editorial`)
  - `editorial`: Use `THEME_CONSTANTS.sectionHeader.pill` for pill badge (already defined). `Heading` from `@/components` for H2 styled `font-display text-4xl`, `Text` for description below
  - `gradient`: `Heading` with `.text-gradient-primary` utility (already in `globals.css`) applied via `className`
  - `default`: current behavior
- Arrow buttons: apply `THEME_CONSTANTS.carousel.arrow` token (already defined). Replaces plain icon circles with `w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-zinc-200 dark:border-slate-700 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all duration-200`
- Underlying scroller: `HorizontalScroller` lives at `src/components/ui/HorizontalScroller.tsx` — use it via `@/components`. It already supports `perView`, `gap`, and drag scroll via `useHorizontalScrollDrag`.
- Peek next card: Use `HorizontalScroller`'s existing props for overflow behavior; expose last card by `-mr-6 md:-mr-8` on scroller wrapper (configurable `showPeek` prop)
- Loading skeleton: Use `<Skeleton>` from `@/components` (re-exported from `@lir/ui`). Cards get `rounded-2xl` (was `rounded-xl`)

> **Existing infrastructure:** `HorizontalScroller` at `src/components/ui/HorizontalScroller.tsx` (exported from `@/components`). `useHorizontalAutoScroll` and `useHorizontalScrollDrag` hooks co-located at `src/components/ui/`. `THEME_CONSTANTS.sectionHeader.*` and `THEME_CONSTANTS.carousel.*` already defined. `Heading`, `Text`, `Skeleton` from `@/components`.

### C4 — `ProductCard`

**File:** `src/components/products/ProductCard.tsx`

Changes:

- Outer: `rounded-2xl` (was `rounded-lg`), shadow `shadow-sm hover:shadow-2xl`, `hover:-translate-y-1.5` transition — or use `.card-lift` utility from `globals.css`. Add `hover:border-primary-300 dark:hover:border-primary-700`
- Image area: `aspect-[4/5]` (was `aspect-square`) — taller is more premium; use `<MediaImage>` from `@/components` for image rendering. Change slideshow to crossfade via CSS `opacity` transition
- Wishlist heart: `opacity-0 group-hover:opacity-100 transition-opacity duration-200` (always hidden, reveal on card hover) — currently always visible
- Discount badge: `bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold text-xs rounded-full px-2 py-0.5 shadow-glow` — use `<Badge>` from `@/components` as base; replaces flat bg
- Seller name: add `<Caption>` from `@/components` below product title in `text-zinc-400`
- Price row: Use `<PriceDisplay>` from `@/components/ui/PriceDisplay` — already handles MRP strikethrough + current price formatting. Extend `className` prop for `text-primary-600 dark:text-primary-400 font-bold` override
- Rating row: Use `<RatingDisplay>` from `@/components/ui/RatingDisplay` instead of inline star rendering
- CTA row: Use `<Button>` from `@/components` — `variant="primary"` with `hover:shadow-glow active:scale-95` — full-width on mobile
- Quick-view trigger: small `👁` icon button top-right on hover (opens modal — phase 2 implementation)

> **Existing infrastructure:** `MediaImage` from `@/components`. `Badge`, `Button`, `Caption` from `@/components`. `PriceDisplay` at `src/components/ui/PriceDisplay.tsx`. `RatingDisplay` at `src/components/ui/RatingDisplay.tsx`. `.card-lift` utility in `globals.css`. `shadow-glow` in `tailwind.config.js`.

### C5 — `CategoryCard`

**File:** `src/components/categories/CategoryCard.tsx`

Changes (two variants, prop `variant="tile" | "pill"`):

- **tile** (default for section carousel): `rounded-2xl overflow-hidden aspect-[3/4] relative group cursor-pointer`
  - Background: gradient from category `color` prop (defaults to indigo/violet if not set)
  - Large emoji or icon: `text-6xl absolute top-4 left-4 transition-transform duration-300 group-hover:scale-110`
  - Category name: absolute bottom overlay with `bg-gradient-to-t from-black/70 to-transparent`, white `font-display text-xl` — render with `<Heading>` from `@/components`
  - Product count chip: use `<Badge>` from `@/components` — `bg-white/20 backdrop-blur text-white text-xs rounded-full`
- **pill** (for filter rows): `rounded-full bg-zinc-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-700 transition-all`

> **Existing infrastructure:** `Heading`, `Text`, `Badge` from `@/components`. `MediaImage` from `@/components` for category cover images.

### C6 — `StoreCard`

**File:** `src/components/StoreCard.tsx`

Changes:

- Banner: use `<MediaImage>` from `@/components` if seller `bannerUrl` set; fallback to gradient stays but gets more variation
- Store avatar: use `<MediaAvatar>` from `@/components` for the avatar with ring styling
- Card gets `group` class for hover orchestration
- On hover: a semi-transparent "Visit Store →" overlay CTA slides up from bottom (`translate-y-full → translate-y-0` on group-hover) over the banner area — CTA uses `<Button>` from `@/components`
- Stats row: use `<RatingDisplay>` from `@/components/ui/RatingDisplay` for star rating. Product count in `<Caption>` from `@/components`
- Verified badge: moved to overlay — shown as `CheckBadgeIcon` on avatar corner (cobalt, white background) — or use `<Badge variant="info">` from `@/components`

> **Existing infrastructure:** `MediaImage`, `MediaAvatar` from `@/components`. `RatingDisplay` at `src/components/ui/RatingDisplay.tsx`. `Button`, `Badge`, `Caption` from `@/components`.

### C7 — `EventCard` & `BlogCard`

**Files:** `src/components/EventCard.tsx` · `src/components/BlogCard.tsx`

Changes:

- Both get magazine-style treatment: `<MediaImage>` from `@/components` with `group-hover:scale-105 transition-transform duration-500` inside `overflow-hidden` wrapper
- Category tag: `absolute top-3 left-3` — use `<Badge>` from `@/components` with `bg-black/40 backdrop-blur text-white text-xs`
- Date badge: `absolute top-3 right-3` — small calendar chip `bg-white dark:bg-slate-900 text-zinc-700 dark:text-zinc-300 text-xs rounded-lg px-2 py-1 shadow-sm`
- Title: migrates from below image to `absolute bottom-0 left-0 right-0` with `bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-16` in overlay mode. Use `<Heading>` from `@/components` with `text-white font-display` — controlled by `variant="overlay" | "standard"` prop (default `standard` for backward compat)
- `CountdownDisplay` from `@/components/ui/CountdownDisplay` for event countdown badges

> **Existing infrastructure:** `MediaImage` from `@/components`. `Badge`, `Heading`, `Text`, `Caption` from `@/components`. `CountdownDisplay` at `src/components/ui/CountdownDisplay.tsx`.

### C8 — `ReviewCard`

**File:** `src/components/ReviewCard.tsx` _(already extracted — update in place)_

Changes:

- Card: `rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-md relative overflow-hidden` — or compose with `<Card>` from `@/components/ui/Card`
- Oversized quote mark watermark: `absolute -top-2 -left-2 text-9xl font-display text-primary-500/10 leading-none select-none pointer-events-none`
- Star rating: use `<RatingDisplay>` from `@/components/ui/RatingDisplay` — moved to top of card (before body)
- Body: `<Text>` from `@/components` with `.truncate-4` utility (already in `globals.css`) — `text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed`
- Reviewer avatar: use `<MediaAvatar>` from `@/components` with fallback initials
- Reviewer name: `<Label>` from `@/components` with `font-semibold text-sm`
- "Verified" chip: `<Badge>` from `@/components` with `text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 text-xs rounded-full`
- Card hover: `hover:shadow-xl hover:-translate-y-1 transition-all duration-300` — or use `.card-lift` from `globals.css`

> **Existing infrastructure:** `ReviewCard` already exists at `src/components/ReviewCard.tsx` — update it in place; no extraction needed. `RatingDisplay`, `Card` from `@/components`. `MediaAvatar` from `@/components`. `Badge`, `Text`, `Label`, `Caption` from `@/components`. `.truncate-4`, `.card-lift` utilities in `globals.css`.

### C9 — `StatsCounterSection`

**File:** `src/features/homepage/components/StatsCounterSection.tsx`

Changes:

- Background: switch from flat `bgSecondary` to `bg-gradient-to-br from-cobalt-900 via-slate-900 to-cobalt-950` (dark editorial strip)
- Layout: Consider using `<StatsGrid>` from `@/components/ui/StatsGrid` as the grid structure — it already handles responsive `StatItem` rows. Extend the `StatItem` type with an `icon` field instead of building from scratch.
- Each stat number: `<Heading>` from `@/components` with `.text-gradient-primary` utility (`globals.css`) — large `font-display` in gradient text
- Each stat label: `<Caption>` from `@/components` — `text-zinc-400 text-sm uppercase tracking-widest`
- Icon: Replace plain circle with `w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex-center` using `THEME_CONSTANTS.trustStrip.iconBox` as reference — icon `text-2xl text-white`
- Layout: on desktop, a vertical `<Divider>` from `@/components` with `orientation="vertical"` and `border-white/10` between stats
- Section padding: `py-12 md:py-16`

> **Existing infrastructure:** `StatsGrid` + `StatItem` type at `src/components/ui/StatsGrid.tsx`. `Heading`, `Caption`, `Divider` from `@/components`. `.text-gradient-primary` in `globals.css`. `THEME_CONSTANTS.trustStrip.iconBox` already defined.

### C10 — `TrustFeaturesSection`

**File:** `src/features/homepage/components/TrustFeaturesSection.tsx`

Two sub-variants:

1. **Strip** (existing): horizontally scrolling icon+text ticker — use `animate-marquee` (`tailwind.config.js` ✅ already added). Wrap strip items in a `<Section>` from `@/components`. Respects `prefers-reduced-motion` via CSS.
2. **Cards** (hero use): 4-up grid of glass cards — each icon gets `THEME_CONSTANTS.trustStrip.iconBox` gradient background (✅ already defined). Card hover uses `.card-lift` from `globals.css`. Use `<Text>` and `<Label>` from `@/components` for title + description.

Switch via `variant="strip" | "cards"` prop. Homepage uses `"strip"` just below hero, `"cards"` before footer.

> **Existing infrastructure:** `animate-marquee` ✅ in `tailwind.config.js`. `THEME_CONSTANTS.trustStrip.iconBox` ✅ in `theme.ts`. `.card-lift` ✅ in `globals.css`. `Section`, `Text`, `Label` from `@/components`.

### C11 — `HowItWorksSection`

**File:** `src/features/homepage/components/HowItWorksSection.tsx`

Changes:

- Step index: `<Heading>` from `@/components` with `font-display text-7xl` + `.text-gradient-primary` as watermark behind card. Front badge uses `<Badge>` from `@/components` — `w-10 h-10 rounded-full bg-primary-500 text-white font-bold text-sm`
- Cards: `rounded-3xl p-8 bg-white dark:bg-slate-900 shadow-soft group hover:-translate-y-2 hover:shadow-xl transition-all duration-300` — compose with `<Article>` from `@/components` for semantic wrapping
- On scroll: staggered entrance via `IntersectionObserver` + `animate-slide-in-left` / `animate-slide-in-right` (already in `tailwind.config.js`). Use `.stagger-1`, `.stagger-2`, `.stagger-3` utility classes (already in `globals.css`) for `animation-delay`
- Connector: animated dashed line using SVG with `stroke-dasharray` + `stroke-dashoffset` that shrinks on scroll enter
- Use `useBreakpoint` from `@lir/react` (via `@/hooks`) to conditionally render connector between steps on desktop only

> **Existing infrastructure:** `animate-slide-in-left`, `animate-slide-in-right` ✅ in `tailwind.config.js`. `.stagger-1`–`.stagger-5` ✅ in `globals.css`. `.text-gradient-primary` ✅ in `globals.css`. `Heading`, `Article`, `Badge`, `Text` from `@/components`. `useBreakpoint` from `@lir/react` (re-exported via `@/hooks`).

### C12 — `AdvertisementBanner`

**File:** `src/features/homepage/components/AdvertisementBanner.tsx`

Gradient fallback redesign:

- Add animated floating mesh blobs: `absolute rounded-full blur-3xl animate-float` (✅ `float` keyframe + `animate-float` already in `tailwind.config.js`) plus `animate-pulse-slow` (✅ already added) in brand gradient behind content
- CTA button: use `<Button>` from `@/components` with `className="shadow-glow hover:shadow-glow"` — `shadow-glow` ✅ in `tailwind.config.js`
- Tag pill: use `<Badge>` from `@/components` with `secondary` pink variant on gradient backgrounds for contrast
- Banner image/media: use `<MediaImage>` from `@/components` for product mockup image
- Split layout: dark panel gets a decorative grid pattern SVG overlay instead of CSS dots (sharper, scales better)
- New `compact` variant (`h-32`) for between-section promotions — use `<Section>` from `@/components` for semantic wrapper

> **Existing infrastructure:** `animate-float` ✅ in `tailwind.config.js`. `animate-pulse-slow` ✅ in `tailwind.config.js`. `shadow-glow` ✅ in `tailwind.config.js`. `Button`, `Badge`, `Section` from `@/components`. `MediaImage` from `@/components`.

### C13 — `FAQSection`

**File:** `src/features/homepage/components/FAQSection.tsx`

Changes:

- Tab nav: use existing `<Tabs>`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>` from `@/components/ui/Tabs.tsx`. Apply `pill-group` styling to `<TabsList>` via `className` — `rounded-full bg-zinc-100 dark:bg-slate-800 p-1 flex gap-1`. Active `<TabsTrigger>`: `bg-white dark:bg-slate-700 shadow-sm rounded-full px-4 py-1.5 text-sm font-medium` — no new component needed
- Accordion: use existing `<Accordion>`, `<AccordionItem>` from `@/components/ui/Accordion.tsx`. Extend with animated `max-h` expansion and active left-border `border-l-4 border-primary-500`. Chevron rotation on open state — add `data-[state=open]:-rotate-180 transition-transform duration-300` to chevron icon
- Section header: uses `gradient` headingVariant (see C3) — `<Heading>` from `@/components` with `.text-gradient-primary`

> **Existing infrastructure:** `Accordion`, `AccordionItem` at `src/components/ui/Accordion.tsx` (exported from `@/components`). `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` at `src/components/ui/Tabs.tsx` (exported from `@/components`). No new accordion/tabs primitives needed.

### C14 — `FooterLayout`

**File:** `src/components/layout/FooterLayout.tsx`

Changes:

- Add trust bar above main footer content: horizontal row of 5 badges using `<Badge>` with `<Label>` from `@/components`. Use `<Divider>` from `@/components` to separate from main footer.
- Newsletter strip: `<Input>` from `@/components/forms` + `<Button>` from `@/components` inline. Controlled by `showNewsletter` prop. Use `<form>` via `<Form>` from `@/components/forms`
- Social icon links: `<TextLink>` from `@/components` with `hover:text-primary-500` transitions
- Brand tagline: `<Text>` from `@/components` with appropriate muted style
- Footer nav links: `<TextLink>` from `@/components` — already handles internal/external links
- Copyright line: `<Caption>` from `@/components` — `Built with ❤️ in India` in `text-zinc-400`

> **Existing infrastructure:** `Divider`, `Badge`, `Button`, `Label`, `Text`, `Caption`, `TextLink` from `@/components`. `Input`, `Form` from `@/components/forms`. All layout wrappers: `Section`, `BlockFooter`, `Nav` from `@/components`.

### C15 — `TitleBarLayout`

**File:** `src/components/layout/TitleBarLayout.tsx`

Changes:

- Add promo micro-strip above the bar on mobile: `bg-gradient-to-r from-primary-500 to-cobalt-600 text-white text-xs text-center py-1 px-4` — dismissible `×` button uses `<Button>` from `@/components`. Strip is `<Section>` from `@/components`. Controlled by `showPromoStrip` siteSettings field
- Logo wordmark: `<Heading>` from `@/components` with `font-display text-xl tracking-tight text-cobalt-700 dark:text-cobalt-300` — "LetItRip" — next to cobalt-gradient square
- Search overlay: on click, expand to full `absolute top-12 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg p-4 shadow-xl` overlay. Reuse `<Search>` component from `src/components/utility/Search.tsx` (already exported from `@/components`). Use `useClickOutside` from `@lir/react` (via `@/hooks`) to dismiss overlay on outside click

> **Existing infrastructure:** `Search` at `src/components/utility/Search.tsx` (exported from `@/components`). `Section`, `Heading`, `Button` from `@/components`. `useClickOutside` from `@lir/react` (re-exported via `@/hooks`). `THEME_CONSTANTS.layout.titleBarHeight` and `zIndex.titleBar` already defined in `theme.ts`.

---

## Phase Plan

### Phase 0 — Design Token Refresh ✅ COMPLETE (S0-3)

**Goal**: Introduce new shared token values, animation CSS, and shared utility classes to power all later phases.

**Completed in commit S0-3:**

- `src/app/globals.css` — ✅ keyframes: `marquee`, `fadeInUp`, `pulse-slow`, `progress-fill`, `float`; utilities: `.animate-marquee`, `.text-gradient-primary`, `.text-gradient-brand`, `.card-lift`, `.glass`, `.stagger-1`–`.stagger-5`, `.truncate-2`–`.truncate-4`
- `src/constants/theme.ts` — ✅ token groups: `sectionHeader.*` (pill, ornament), `carousel.*` (arrow, dotActive, dotInactive), `trustStrip.*` (iconBox)
- `tailwind.config.js` — ✅ `animate-marquee`, `animate-pulse-slow`, `animate-progress-fill`, `animate-float`, `shadow-glow`, `shadow-glow-pink`
- `next.config.js` + fonts — ✅ Bangers + Inter migrated to `next/font/google`
- `src/components/products/ProductCard.tsx` — ✅ S0-1: add-to-cart CTA color fixed to `primary`

**Nothing to do in Phase 0** — all tokens and utilities are live. Reference them directly in Phases 1–7.

**Effort:** ✅ Done | **Risk:** None

---

### Phase 1 — Cards Makeover

**Goal**: Every card component becomes visually polished. This has the highest visible impact because cards appear in every carousel, grid, and listing page.

**Components:**

1. `ProductCard` → C4 changes — uses `MediaImage`, `Badge`, `Button`, `PriceDisplay`, `RatingDisplay`, `Caption` from `@/components`
2. `CategoryCard` → C5 tile + pill variants — uses `Heading`, `Badge`, `MediaImage` from `@/components`
3. `StoreCard` → C6 changes — uses `MediaImage`, `MediaAvatar`, `RatingDisplay`, `Button`, `Badge` from `@/components`
4. `EventCard` → C7 overlay variant — uses `MediaImage`, `Badge`, `Heading`, `CountdownDisplay` from `@/components`
5. `BlogCard` → C7 overlay + compact variants — uses `MediaImage`, `Badge`, `Heading`, `Text` from `@/components`
6. `ReviewCard` → C8 changes — update existing `src/components/ReviewCard.tsx` in-place (already extracted)

**Files changed:**

- `src/components/products/ProductCard.tsx`
- `src/components/StoreCard.tsx`
- `src/components/EventCard.tsx`
- `src/components/categories/CategoryCard.tsx` _(correct path — already exists)_
- `src/components/BlogCard.tsx` _(already exists)_
- `src/components/ReviewCard.tsx` _(already exists — update in-place; no extraction needed)_

**Effort:** ~6 hours | **Risk:** Medium (cards are used site-wide; run `npx tsc --noEmit` after each card)

---

### Phase 2 — Welcome + Stats + Trust + How It Works

**Goal**: The first four sections below the hero become a cohesive premium experience.

**Components:**

1. `WelcomeSection` → C1 split layout + gradient H1 + badge pill + trust badges row
2. `StatsCounterSection` → C9 dark editorial strip + gradient numbers
3. `TrustFeaturesSection` → C10 strip + cards dual variant
4. `HowItWorksSection` → C11 large index numbers + staggered animation

**Files changed:**

- `src/features/homepage/components/WelcomeSection.tsx`
- `src/features/homepage/components/StatsCounterSection.tsx`
- `src/features/homepage/components/TrustFeaturesSection.tsx`
- `src/features/homepage/components/HowItWorksSection.tsx`

**Effort:** ~5 hours | **Risk:** Low (homepage sections only)

---

### Phase 3 — Carousel & Scroller Infrastructure

**Goal**: The carousels become premium scroll experiences with better arrows, active indicators, peek effects, and section headers.

**Components:**

1. `SectionCarousel` → C3 section header variants + arrow redesign + peek effect
2. `HeroCarousel` → C2 progress-bar dots + taller aspect + better arrows + bottom gradient bleed

**Files changed:**

- `src/features/homepage/components/SectionCarousel.tsx`
- `src/features/homepage/components/HeroCarousel.tsx`
- `src/components/ui/HorizontalScroller.tsx` _(correct path — update peek/overflow props here if needed)_

**Effort:** ~4 hours | **Risk:** Medium (carousel used in all section carousels — test every section)

---

### Phase 4 — Homepage Content Sections

**Goal**: Apply new section header variants and card variants across all content carousels. HomePage sections get their own visual identity (not all the same shade of gray).

**Sections to update:**

- `TopCategoriesSection` — use new CategoryCard tile variant; `editorial` header with "SHOP BY CATEGORY" pill
- `TopBrandsSection` — warm gradient bg; pill "EXPLORE BRANDS"
- `FeaturedProductsSection` — `gradient` header; new ProductCard
- `FeaturedAuctionsSection` — amber/warm bg strip; `editorial` header "⚡ LIVE AUCTIONS"
- `FeaturedPreOrdersSection` — cobalt bg strip; "COMING SOON" pill header
- `FeaturedStoresSection` — dark editorial bg; new StoreCard
- `FeaturedEventsSection` — new EventCard overlay variant
- `BlogArticlesSection` — new BlogCard; `editorial` header "FROM THE BLOG"

**Files changed:**

- `src/features/homepage/components/TopCategoriesSection.tsx`
- `src/features/homepage/components/TopBrandsSection.tsx`
- `src/features/homepage/components/FeaturedProductsSection.tsx`
- `src/features/homepage/components/FeaturedAuctionsSection.tsx`
- `src/features/homepage/components/FeaturedPreOrdersSection.tsx`
- `src/features/homepage/components/FeaturedStoresSection.tsx`
- `src/features/homepage/components/FeaturedEventsSection.tsx`
- `src/features/homepage/components/BlogArticlesSection.tsx`

**Effort:** ~4 hours | **Risk:** Low (each section is independent)

---

### Phase 5 — Banner, WhatsApp, FAQ

**Goal**: The "between content" sections stop feeling like filler.

**Components:**

1. `AdvertisementBanner` → C12 animated mesh blobs + compact variant
2. `WhatsAppCommunitySection` → facepile + counter badge + animated pulse CTA
3. `FAQSection` → C13 pill-group tabs + animated accordion

**Files changed:**

- `src/features/homepage/components/AdvertisementBanner.tsx`
- `src/features/homepage/components/WhatsAppCommunitySection.tsx`
- `src/features/homepage/components/FAQSection.tsx`

**Effort:** ~3 hours | **Risk:** Low

---

### Phase 6 — Layout Shell

**Goal**: The chrome (navbar, footer, bottom nav) matches the quality of the content.

**Components:**

1. `TitleBarLayout` → C15 promo strip + wordmark + overlay search
2. `FooterLayout` → C14 trust bar + newsletter + social hover colors
3. `BottomNavbar` → frosted glass + gradient active indicator

**Files changed:**

- `src/components/layout/TitleBarLayout.tsx`
- `src/components/layout/FooterLayout.tsx`
- `src/components/layout/BottomNavbar.tsx`

**Effort:** ~4 hours | **Risk:** Medium (layout changes affect every page)

---

### Phase 7 — Global Polish & Motion

**Goal**: The fine details. Bring everything together into a cohesive experience.

**Tasks:**

- Standardize all card `transition` + `hover:-translate-y` across all cards (audit all `src/components/` + `src/features/`) — replace ad-hoc `transition-all duration-200` with `.card-lift` where applicable
- Breadcrumb: `<Breadcrumbs>` / `<AutoBreadcrumbs>` already exist at `src/components/layout/Breadcrumbs.tsx` — update to `<TextLink>` from `@/components` for items and `ChevronRight` separators
- Skeleton loaders: `<Skeleton>` from `@/components` (re-exported from `@lir/ui`) — update `className` to `rounded-2xl` everywhere to match new card radius
- ProductCard: quick-view `<Modal>` from `@/components/feedback/Modal.tsx` hook-up (feature-flagged)
- Image loading states: all images already go through `<MediaImage>` from `@/components` — `placeholder="blur"` can be passed via `blurDataURL` prop
- Dark mode: spot-check all new gradient/glass elements — use `.glass` and `.glass-strong` utilities from `globals.css`
- Use `useMediaQuery` / `useBreakpoint` from `@lir/react` (via `@/hooks`) for any JS-driven responsive logic
- Run `npx tsc --noEmit` → `npm run build` — fix any type errors introduced

**Effort:** ~3 hours | **Risk:** High per-file but low per-change

---

## Summary Table

| Phase                | Component Count      | Status      | Estimated Effort | Visual Impact      |
| -------------------- | -------------------- | ----------- | ---------------- | ------------------ |
| 0 — Tokens           | 3 files              | ✅ Complete | Done             | None (foundation)  |
| 1 — Cards            | 6 components         | 🔲 Next     | ~6h              | ★★★★★ Highest      |
| 2 — Hero Sections    | 4 components         | 🔲 Planned  | ~5h              | ★★★★☆ Very high    |
| 3 — Carousels        | 2–3 components       | 🔲 Planned  | ~4h              | ★★★★☆ Very high    |
| 4 — Content Sections | 8 sections           | 🔲 Planned  | ~4h              | ★★★☆☆ Medium-high  |
| 5 — Banner/FAQ/WA    | 3 components         | 🔲 Planned  | ~3h              | ★★★☆☆ Medium       |
| 6 — Layout Shell     | 3 components         | 🔲 Planned  | ~4h              | ★★★★☆ High (frame) |
| 7 — Polish & Motion  | Audit whole codebase | 🔲 Planned  | ~3h              | ★★★☆☆ Progressive  |

**Remaining: ~29 hours across Phases 1–7**

> **Available infrastructure (no re-implementation needed):** All typography + semantic primitives via `@lir/ui` (`Heading`, `Text`, `Label`, `Caption`, `Span`, `Section`, `Nav`, `Ul`, `Li`, etc.). All interactive primitives from `@/components`: `Button`, `Badge`, `Alert`, `Divider`, `Spinner`, `Skeleton`, `Progress`, `Accordion`, `AccordionItem`, `Tabs`, `Modal`, `Card`. All media rendering via `MediaImage`, `MediaVideo`, `MediaAvatar` from `@/components`. Specialized display components: `PriceDisplay`, `RatingDisplay`, `CountdownDisplay`, `StatsGrid`, `HorizontalScroller`. UI hooks: `useSwipe`, `useClickOutside`, `useBreakpoint`, `useMediaQuery`, `useCountdown` from `@lir/react` (via `@/hooks`). All CSS tokens: `.text-gradient-primary`, `.text-gradient-brand`, `.card-lift`, `.glass`, `.stagger-*`, `animate-marquee`, `animate-float`, `animate-pulse-slow`, `animate-progress-fill`, `shadow-glow` — all live.

---

---

## Package Library (`@lir/*`) Extraction Plan

> **Goal:** Move all zero-app-dependency logic from `src/utils/` and `src/helpers/` into a new `packages/utils` package (`@lir/utils`), and extend `@lir/ui` with the missing interactive primitives identified by comparing Licorice's `components/ui/`. App code then imports from `@lir/*` barrel, and the shims in `src/utils/` and `src/helpers/` become single-line re-exports — identical to how `src/classes/index.ts` and `src/hooks/index.ts` already work.

---

### PL-0 — New Package: `@lir/utils`

**Create:** `packages/utils/` following the same structure as `packages/core`.

**Files to move in (all pass the "zero app-specific imports" test):**

| Source file                                  | Exports                                                                                     | Group                |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------- |
| `src/utils/formatters/date.formatter.ts`     | `resolveDate`, `formatDate`, `formatRelativeTime`, `formatDateRange`                        | Formatters           |
| `src/utils/formatters/number.formatter.ts`   | `formatCurrency`, `formatNumber`, `formatPercentage`, `formatFileSize`, `formatCompact`     | Formatters           |
| `src/utils/formatters/string.formatter.ts`   | `capitalize`, `titleCase`, `slugify`, `truncate`, `pluralize`, `maskEmail`, `sanitizeHtml`  | Formatters           |
| `src/utils/validators/email.validator.ts`    | `isValidEmail`, `normalizeEmail`, `isDisposableEmail`                                       | Validators           |
| `src/utils/validators/input.validator.ts`    | `isRequired`, `isMinLength`, `isMaxLength`, `isNumeric`                                     | Validators           |
| `src/utils/validators/password.validator.ts` | `PasswordStrength`, `checkPasswordStrength`, `validatePassword`                             | Validators           |
| `src/utils/validators/phone.validator.ts`    | `isValidPhone`, `isValidIndianMobile`, `formatPhone`                                        | Validators           |
| `src/utils/validators/url.validator.ts`      | `isValidUrl`, `isSafeUrl`, `isHttpsUrl`, `normalizeUrl`                                     | Validators           |
| `src/utils/converters/type.converter.ts`     | `stringToBoolean`, `stringToNumber`, `toArray`, `toNullable`                                | Converters           |
| `src/utils/converters/cookie.converter.ts`   | `parseCookies`, `getCookie`, `setCookie`, `deleteCookie`                                    | Converters (browser) |
| `src/helpers/data/array.helper.ts`           | `groupBy`, `uniqueBy`, `chunk`, `flatten`, `intersection`                                   | Data                 |
| `src/helpers/data/object.helper.ts`          | `deepMerge`, `pick`, `omit`, `flatten`, `setPath`                                           | Data                 |
| `src/helpers/data/pagination.helper.ts`      | `PaginationOptions`, `PaginationResult`, `calculatePagination`, `getPageItems`              | Data                 |
| `src/helpers/data/sorting.helper.ts`         | `sort`, `multiSort`                                                                         | Data                 |
| `src/helpers/ui/animation.helper.ts`         | `easings`                                                                                   | UI                   |
| `src/helpers/ui/color.helper.ts`             | `hexToRgb`, `rgbToHex`, `adjustBrightness`, `getContrastRatio`                              | UI                   |
| `src/helpers/auth/token.helper.ts`           | `generateVerificationToken`, `generateShortCode`, `isTokenExpired`, `getTokenTimeRemaining` | Auth (peer: `uuid`)  |
| `src/utils/events/event-manager.ts`          | `GlobalEventManager`                                                                        | Events (DOM-only)    |

**NOT extracted (app-specific):**

- `id-generators.ts` — domain-specific ID schemes
- `guest-cart.ts` — LetItRip cart storage model
- `sieve.helper.ts` — Node.js + `@mohasinac/sievejs` dependency
- `auth.helper.ts` — imports `ROLE_HIERARCHY` from `@/constants`
- `address.helper.ts` — imports `@/constants` validation messages
- `error-logger.ts` / `server-error-logger.ts` — bound to `@/classes` + Next.js
- `style.helper.ts` — covered by `tailwind-merge` already in `@lir/ui`

**After extraction:** Each source file becomes a 1-line re-export shim:

```ts
// src/utils/formatters/date.formatter.ts (after)
export * from "@lir/utils/formatters";
```

**`packages/utils/package.json`:**

```json
{
  "name": "@lir/utils",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "peerDependencies": { "uuid": ">=9" },
  "devDependencies": { "typescript": "*", "tsup": "*" }
}
```

**`packages/utils/src/index.ts`** — barrel re-exports all groups.

**`tsconfig.json` path alias** (already have the pattern):

```json
"@lir/utils": ["packages/utils/src/index.ts"],
"@lir/utils/*": ["packages/utils/src/*"]
```

**Effort:** ~4h | **Risk:** Low — pure file moves, no logic changes. Existing `@/utils` imports keep working via shim.

---

### PL-1 — Extend `@lir/ui` with Interactive Primitives

Licorice has polished UI primitives in `components/ui/` that LetItRip either builds inline ad-hoc or lacks entirely. Extract or build these into `packages/ui/src/`:

| Component       | Source                       | What it adds                                                                                                             |
| --------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Modal`         | Licorice `Modal.tsx`         | Radix `@radix-ui/react-dialog` centered modal; `max-h-[90vh]` scroll; animate-in/out; `title/description/X` close        |
| `Drawer`        | Licorice `Drawer.tsx`        | Same Radix dialog but slides from `left/right/bottom`; bottom variant `rounded-t-2xl max-h-[85vh]`                       |
| `Select`        | Licorice `Select.tsx`        | Radix `@radix-ui/react-select`; label/error/disabled; `SelectOption[]` prop; `ChevronDown + Check` icons                 |
| `StarRating`    | Licorice `StarRating.tsx`    | 0–5 stars; `interactive` mode with hover preview + `onChange`; 3 sizes                                                   |
| `Pagination`    | Licorice `Pagination.tsx`    | Smart ellipsis for large page counts; prev/next chevron; used by `DataTable`                                             |
| `Breadcrumb`    | Licorice `Breadcrumb.tsx`    | `BreadcrumbItem[]` with optional hrefs; `ChevronRight` separators; last item = `font-medium text-foreground`             |
| `StatusBadge`   | Licorice `StatusBadge.tsx`   | Semantic color mapping for order/payment/review/ticket status strings; wraps `Badge`; covers all LetItRip status domains |
| `ImageLightbox` | Licorice `ImageLightbox.tsx` | Full-screen image overlay; keyboard nav (←/→/Esc); counter overlay; Next.js `Image`                                      |

**Current workaround in LetItRip:** these are all built inline inside feature components, duplicated, and inconsistent. Moving them to `@lir/ui` means one consistent implementation used by admin, seller, user, and public pages.

**New peer deps for `packages/ui`:**

```json
"@radix-ui/react-dialog": "^1",
"@radix-ui/react-select": "^2"
```

**Effort:** ~5h | **Risk:** Medium — requires Radix peer deps; existing callers see zero breaking changes (new exports only).

---

### PL-2 — `@lir/ui` DataTable Promotion

The `DataTable` component currently lives in `src/components/` and is used by ~20 admin/seller views. It has no app-specific imports. Move it to `packages/ui/src/DataTable.tsx` and re-export from `@/components` shim.

**DataTable features to preserve:**

- Generic `Column<T>` type with `render: (row: T) => ReactNode`
- Client-side sort (toggle asc/desc)
- Client-side pagination (configurable `pageSize`, default 20)
- Loading skeleton rows
- Empty state slot
- Optional `onRowClick` with hover cursor

**Add from Licorice observation:**

- `overflow-x-auto` outer wrapper (already there, but ensure explicit)
- `rounded-2xl border border-zinc-200 dark:border-slate-700` container styling
- `pageSize` prop (add if not already configurable)

**Effort:** ~2h | **Risk:** Low

---

### PL-3 — Migration Steps Order

```
1. Create packages/utils/  (PL-0) → convert src/utils + src/helpers shims
2. Add @lir/utils alias in tsconfig.json + transpilePackages
3. Extend packages/ui/ with Modal, Drawer, Select, StarRating (PL-1)
4. Add Pagination, Breadcrumb, StatusBadge, ImageLightbox (PL-1 cont.)
5. Move DataTable to packages/ui (PL-2)
6. Run npx tsc --noEmit → npm run build
```

---

## Portal UX Plan — Admin, Seller & User

> **Comparison baseline:** Licorice's admin portal uses a classic fixed-sidebar + scroll-main layout (`h-screen overflow-hidden`) with 5 collapsible nav groups. LetItRip currently uses `AdminTabs` (horizontal tab bar) for admin and `SellerTabs`/`UserTabs` for the portals. As the number of pages grows (20 admin pages, 12 seller pages, 13 user pages), horizontal tabs become unscalable and lose context. The sidebar pattern wins on discoverability and spatial permanence.

---

### AU-1 — Admin Portal: Sidebar Navigation

**Current:** `AdminTabs` horizontal pill-tab navigation — works for ~6 tabs, breaks at 20.  
**Target:** Fixed sidebar `w-64`, collapsible groups, persistent active state — identical to Licorice's pattern adapted to LetItRip's palette.

**Sidebar groups (LetItRip adapted):**

| Group           | Nav items                                          |
| --------------- | -------------------------------------------------- |
| **Overview**    | Dashboard, Analytics                               |
| **Marketplace** | Orders, Products, Stores, Bids / Auctions, Payouts |
| **Content**     | Blog, Carousel / Slides, Sections, FAQs, Media     |
| **Community**   | Users, Reviews, Events, Feature Flags              |
| **Platform**    | Site Settings, Categories, Coupons, Sessions       |

**Layout shell change:**

```tsx
// src/app/[locale]/admin/layout.tsx  (new)
<ProtectedRoute requireRole="admin">
  <div className="flex h-screen overflow-hidden">
    <AdminSidebar /> {/* w-64 fixed */}
    <div className="flex flex-1 flex-col overflow-hidden">
      <AdminTopBar /> {/* h-14 sticky, breadcrumb + user badge */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  </div>
</ProtectedRoute>
```

**`AdminSidebar` design spec:**

- Width: `w-64`, `bg-slate-950 dark:bg-slate-950` (always dark — admin aesthetic)
- Logo row: LetItRip `font-display text-xl text-white` + small "Admin" pill `bg-primary-500/20 text-primary-400 text-xs rounded-full px-2`
- Groups: each group has uppercase section label `text-zinc-500 text-xs tracking-widest px-3 mb-1 mt-4` + indented nav items
- Collapsible groups: optional (start open by default, remember state in localStorage)
- Nav item: `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors`
- Active item: `bg-primary-500/15 text-primary-400 hover:bg-primary-500/20`
- Icon: each nav item gets a `LucideIcon` (16px, `strokeWidth={1.5}`)
- Mobile: sidebar becomes a Drawer (slide from left) — trigger from `AdminTopBar` hamburger icon

**`AdminTopBar` design spec:**

- Height: `h-14 border-b border-white/5 bg-slate-950/80 backdrop-blur`
- Left: `AutoBreadcrumbs` (already exists in codebase) — shows path context
- Right: `NotificationBell` + `AvatarDisplay` + role badge

**Kill:** `AdminTabs` component (`src/features/admin/components/AdminTabs.tsx`) — delete after migration.  
**Preserve:** All `AdminXxxView` feature components — no changes needed.

**Effort:** ~5h | **Risk:** Medium (layout shell change affects 20 admin pages; all content components unchanged)

---

### AU-2 — Admin Dashboard: Priority Alert Banner + Stats Cards

**Inspired by:** Licorice's dashboard `WhatsApp alert banner` — a contextual amber banner that appears when there are pending payment confirmations.

**LetItRip equivalent — `AdminPriorityAlerts`:**
A conditional banner section showing up to 3 priority alerts:

```
🟡 Pending payouts: N seller payout requests awaiting approval      [Review →]
🔴 Disputed/cancelled orders: N orders need attention               [View →]
🟠 Unverified sellers: N new seller applications pending            [Review →]
```

- Only shows if any count > 0
- Each alert: amber/rose/orange gradient left-border `border-l-4` card
- Data fed from the `adminDashboard` API SSR prefix

**Stats cards improvement:**

- Move from current flat cards → `bg-slate-900 rounded-2xl border border-white/5` dark cards (visible against dark sidebar + admin bg)
- Trend indicator: `▲ +12% from last week` in `text-primary-400` (up) / `text-rose-400` (down)
- Icon: gradient blob `bg-gradient-to-br from-primary-500/20 to-cobalt-500/20 rounded-xl w-10 h-10`
- Values: `font-display text-3xl text-white`

**Quick action row:**

- `QuickActionsGrid` already exists — improve card styling to match dark admin theme
- Add "Add Product", "Create Coupon", "View Reports" shortcuts

**Effort:** ~3h | **Risk:** Low (dashboard section only)

---

### AU-3 — Admin Data Tables: Consistent Pattern

**Problem:** LetItRip admin uses `DataTable` for products/orders but raw `<table>` for blog, coupons, FAQs, reviews (inconsistent). After PL-2 promotes `DataTable` to `@lir/ui`, standardize all admin list views to use it.

**Views to migrate to `DataTable`:**

- `AdminBlogView` — currently raw `<table>` → `DataTable<BlogDocument>`
- `AdminCouponsView` — currently raw `<table>` → `DataTable<CouponDocument>`
- `AdminFaqsView` — list view → `DataTable<FaqDocument>`
- `AdminReviewsView` — grid of `ReviewModerationCard` stays (visual UI) but add `DataTable` toggle for bulk view

**Consistent row actions pattern:**
Every `DataTable` row gets a consistent `ActionMenu` (a `…` button opening a Radix `DropdownMenu`) with items: View, Edit, Delete (destructive). This replaces ad-hoc edit/delete icon buttons.

**Effort:** ~4h | **Risk:** Low per view; run type-check after each

---

### AU-4 — Seller Portal: Sidebar Navigation

**Current:** `SellerTabs` horizontal tabs — 5 tabs, barely enough, but seller portal is growing (12 pages).  
**Target:** Collapsible sidebar (narrower than admin: `w-56`), LetItRip brand, seller-specific color strip.

**Sidebar groups:**

| Group        | Nav items                              |
| ------------ | -------------------------------------- |
| **Overview** | Dashboard, Analytics                   |
| **Products** | My Products, Create Product, Auctions  |
| **Sales**    | My Orders, Payouts, Payout Settings    |
| **Store**    | My Store, Addresses, Shipping Settings |

**Color scheme:** `bg-white dark:bg-slate-950` with cobalt accent — different from admin's always-dark to match the marketplace feel. Active item: `bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-400`.

**Seller dashboard improvements (from Licorice-inspired patterns):**

- `SellerStatCard` already exists — apply dark-card treatment
- Add `SellerPriorityAlerts`:
  - 🟡 "N pending orders awaiting shipment" — `border-l-4 border-amber-500`
  - 🔵 "Your store setup is incomplete" (if `storeSlug` not set) — `border-cobalt-500`
  - 🟢 "Payout available: ₹X" (if payout balance > ₹500) — `border-primary-500`
- `SellerRevenueChart` already exists — ensure it uses the new dark card treatment
- `SellerQuickActions` already exists — keep, style improvement only

**Kill:** `SellerTabs` — delete after migration, after verifying all 12 pages link correctly from sidebar.

**Effort:** ~4h | **Risk:** Medium (same as admin layout change)

---

### AU-5 — Seller Product Management: Card vs Table Toggle

**Current:** `SellerProductsView` — unknown UI pattern (table or cards).  
**Target:** Toggle between `DataTable` (efficient bulk management) and `SellerProductCard` grid (visual). URL param `?view=table|grid` persists choice.

**`SellerProductCard` improvements (from C4 ProductCard makeover):**

- Show stock level bar: `w-full h-1.5 rounded-full bg-zinc-200` filled to `(stock/maxStock * 100)%`; red < 10%, amber < 30%, green ≥ 30%
- Status pill: `Active / Draft / Out of Stock` — `bg-primary-500/10 text-primary-600`
- Revenue line: `₹X earned` from orders (if analytics available) — as a small subtitle

**Effort:** ~2h | **Risk:** Low

---

### AU-6 — User Portal: Account Hub Landing Page

**Inspired by:** Licorice's `account/page.tsx` — a hub page showing a 5-link navigation grid + recent 3 orders to replace the current direct tab jump.

**Current:** `/user` → redirects directly to `/user/profile` (no hub).  
**Target:** `/user` → `UserAccountHub` page — a landing that gives spatial orientation.

**`UserAccountHub` layout:**

```
┌─ Profile header ─────────────────────────────────────────────────────┐
│  Avatar  │  Display name + email  │  Member since  │  Role badge      │
│  [RipCoins: ⚡ 240]  [Orders: 12]  [Wishlist: 5]  [Addresses: 2]   │
└──────────────────────────────────────────────────────────────────────┘

┌─ Quick nav grid (2×3) ──────────────────────────────────────────────┐
│  📦 My Orders     💬 Messages    🔔 Notifications                    │
│  📍 Addresses     ⚡ RipCoins    ⚙️ Settings                          │
└──────────────────────────────────────────────────────────────────────┘

┌─ Recent orders (last 3) ────────────────────────────────────────────┐
│  Order #LIR-12345  ·  ₹499  ·  Delivered  ·  12 Mar 2026           │
│  [View all orders →]                                                  │
└──────────────────────────────────────────────────────────────────────┘
```

Each quick nav card: `rounded-2xl p-5 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 hover:-translate-y-1 hover:shadow-md transition-all` with icon in gradient blob + label + optional count badge.

**Profile header improvement:**

- `ProfileHeader` already exists — add RipCoins balance inline (from `useRipCoins` hook)
- Add `Become a Seller` CTA prominently if `user.role === "user"` — currently buried in tabs

**Effort:** ~3h | **Risk:** Low (new page, no existing views changed)

---

### AU-7 — User Portal: Sidebar Navigation (Mobile + Desktop)

**Current:** `UserTabs` horizontal tabs — 8 tabs that overflow on mobile, require scroll, lose context.  
**Target:** On desktop `md+`: left sidebar `w-56` with avatar header + nav items. On mobile: bottom sheet drawer triggered from profile icon.

**Sidebar items:**

```
[Avatar + Name]
───────────────
My Profile
My Orders          (badge: pending count)
My Wishlist        (badge: item count)
My Addresses
⚡ RipCoins        (badge: balance)
💬 Messages        (badge: unread count)
🔔 Notifications   (badge: unread count)
───────────────
Become a Seller    (only if role=user)  ← highlighted with cobalt pill
Settings
```

Unread/count badges: small `bg-secondary-500 text-white` pills — critical for engagement.

**Kill:** `UserTabs` — delete after migration.

**Effort:** ~4h | **Risk:** Medium (impacts mobile layout)

---

### AU-8 — Order Detail: Timeline + Status (User-facing)

**Inspired by:** Licorice's admin order detail `grid lg:grid-cols-3` with timeline.

**Current `OrderDetailView`:** Unknown exact layout.  
**Target improvements:**

- Status stepper: horizontal `Placed → Confirmed → Shipped → Delivered` step indicator at top — each step gets a dot + label; current step highlighted in `primary-500`, completed steps in `zinc-400 line-through style`, pending in `zinc-300`
- Timeline of events: vertical list with timestamp + event description + icon — pulled from `order.timeline` sub-collection
- Quick actions for user: Cancel (if `placed/confirmed`), Download Invoice, Reorder (all items to cart)
- Shipping tracking integration: branded tracking strip with `Shiprocket` status if `trackingId` available

**Effort:** ~3h | **Risk:** Low (single view improvement)

---

### AU-9 — Shared DashboardStatsCard Component

All three portals (admin, seller, user) have stat cards with slightly different styling. Extract `DashboardStatsCard` to `src/components/` (or `@lir/ui` if generic enough):

```tsx
interface DashboardStatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string; // e.g. "text-primary-600 dark:text-primary-400"
  iconBg?: string; // e.g. "bg-primary-500/10 dark:bg-primary-500/20"
  trend?: { value: number; suffix?: string }; // +12% renders with arrow
  href?: string; // makes card a link
  variant?: "default" | "dark"; // dark = used in admin sidebar
}
```

Replaces:

- `AdminStatsCards` custom cards in admin feature
- `SellerStatCard` in seller feature
- Profile stats grid in user feature
- `StatsCounterSection` on homepage (same visual language)

**Effort:** ~3h | **Risk:** Low (additive; existing callers migrate one by one)

---

### Portal UX Phase Plan

| Phase    | Scope                                                                                            | Effort | Dependency        |
| -------- | ------------------------------------------------------------------------------------------------ | ------ | ----------------- |
| **PL-0** | Create `@lir/utils` package + shim src/                                                          | 4h     | None              |
| **PL-1** | Extend `@lir/ui` with Modal, Drawer, Select, Star, Pagination, Breadcrumb, StatusBadge, Lightbox | 5h     | None              |
| **PL-2** | Promote `DataTable` to `@lir/ui`                                                                 | 2h     | PL-1              |
| **AU-9** | Extract `DashboardStatsCard` shared component                                                    | 3h     | None              |
| **AU-1** | Admin sidebar navigation (replaces `AdminTabs`)                                                  | 5h     | AU-9              |
| **AU-2** | Admin dashboard: alerts + stats cards redesign                                                   | 3h     | AU-1, AU-9        |
| **AU-3** | Admin data tables: standardize to `DataTable`                                                    | 4h     | PL-2, AU-1        |
| **AU-4** | Seller sidebar navigation (replaces `SellerTabs`)                                                | 4h     | AU-9              |
| **AU-5** | Seller product view toggle (grid/table)                                                          | 2h     | AU-4, PL-2        |
| **AU-6** | User account hub landing page                                                                    | 3h     | None              |
| **AU-7** | User portal sidebar (replaces `UserTabs`)                                                        | 4h     | AU-6, PL-1 Drawer |
| **AU-8** | Order detail: status stepper + timeline                                                          | 3h     | None              |

**Total portal UX effort: ~42h across 12 phases**

---

## Licorice Herbals Extractions

> The `d:\proj\licorice` codebase was audited in full. Below is every pattern, component, and technique that can be directly adapted for LetItRip.in — translated to our color palette and component conventions.

---

### LX-1 — `BeforeAfterCard` — Drag-Slider Comparison ⭐ NEW COMPONENT

**Source:** `licorice/components/home/BeforeAfterCard.tsx`  
**Introduce as:** `src/features/homepage/components/BeforeAfterCard.tsx`  
**Use in:** A new `FeaturedResultsSection` on the homepage (or inside product detail pages)

**What it is:** An interactive drag-slider that reveals a Before / After image pair. Drag the handle left/right; keyboard-accessible (ArrowLeft/Right to nudge); proper `role="slider"` + `aria-valuenow`.

**How it works:**

- Container: `position: relative; overflow: hidden; aspect-ratio: 4/3`
- "After" image: full-frame behind
- "Before" image: `position: absolute; inset: 0; width: ${position}%; overflow: hidden` — clips the before image to the left of the handle
- Handle: `position: absolute; left: ${position}%; top: 0; bottom: 0; width: 2px` — centered `w-8 h-8 rounded-full` drag knob with a left/right arrow SVG icon
- Labels: `position: absolute` `BEFORE` pill top-left, `AFTER` pill top-right — `bg-black/50 backdrop-blur text-white text-xs rounded-full`
- Caption below card: `p-4 text-sm font-medium`

**LetItRip adaptation:**

- Replace Licorice's `color-mix` color references with LetItRip's Tailwind tokens
- `rounded-2xl border border-zinc-200 dark:border-slate-700` card wrapper
- Handle knob: `bg-white dark:bg-slate-900 shadow-lg` with cobalt-tinted arrow icon
- Section header: pill label `"REAL RESULTS"` + h2 with gradient text
- Populate from a `featuredResults` CMS field (array of `{ beforeImage, afterImage, caption }`) — fetched server-side via repository

---

### LX-2 — Hero Section Pattern — Staggered Entrance Animations

**Source:** `licorice/components/home/HeroBanner.tsx`

**Specific patterns to extract (translate framer-motion → CSS animation classes):**

```
Pill badge:   opacity-0 → opacity-1, scale 0.9 → 1 (delay 0ms)
H1 headline:  opacity-0 → opacity-1, translateY 30px → 0 (delay 100ms)
Subtitle:     opacity-0 → opacity-1, translateY 20px → 0 (delay 250ms)
CTA row:      opacity-0 → opacity-1, translateY 20px → 0 (delay 350ms)
Trust badges: opacity-0 → opacity-1, translateY 10px → 0 (delay 550ms)
```

**CSS approach (Phase 0 addition — no framer-motion dependency):**

```css
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
.stagger-1 {
  animation: fadeInUp 0.6s ease forwards;
  animation-delay: 0ms;
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
```

Apply to `WelcomeSection` and `HeroCarousel` overlay content.

**Decorative background elements (translate to LetItRip brand):**

- **Slow-spinning mandala ring:** `position: absolute; inset: centered; w-[700px] h-[700px]; rounded-full; border border-white/[0.04]; animate-[spin_120s_linear_infinite]` — replace with LetItRip Beyblade-style ring (fits the brand perfectly!)
- **Inner reverse ring:** `w-[500px] h-[500px]; border-dashed; animate-[spin_90s_linear_infinite_reverse]`
- **Floating dots:** 6 small `absolute rounded-full bg-primary/20` dots at varying positions, animate `y: [0, -20, 0] opacity: [0.3, 0.7, 0.3]` — use CSS `@keyframes float` instead of framer-motion
- **Corner flourish SVGs:** Two-path corner arc SVGs in `text-white/[0.06]` — top-left and bottom-right (rotated 180°)
- **Bottom gradient bleed:** `absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent` — already in C2 plan

**Pill badge pattern (standardized across all section headers):**

```tsx
<span
  className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 
  px-5 py-1.5 text-xs font-medium tracking-[0.2em] uppercase text-primary-600 dark:text-primary-400 backdrop-blur-sm"
>
  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-500" />
  {label}
  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-500" />
</span>
```

This double-dot flanked pill is more premium than a plain pill. Use in `WelcomeSection`, `SectionCarousel` editorial headers.

---

### LX-3 — `SectionHeading` with SVG Ornament

**Source:** `licorice/components/ui/SectionHeading.tsx`

**What:** An Ayurvedic ornament `── ◦ ──` rendered as an inline SVG sits below every section heading. For LetItRip we adapt this to a LetItRip/sports flavour.

**Adapted version (add to `src/components` as a prop on `Heading` or a standalone `SectionOrnamet`):**

```tsx
// Spark ornament: ── ⚡ ──   (Beyblade/sports flavour)
<svg
  viewBox="0 0 120 12"
  fill="none"
  className="h-3 w-24 text-primary-500"
  aria-hidden="true"
>
  <path
    d="M0 6h44 M76 6h44"
    stroke="currentColor"
    strokeWidth="0.75"
    strokeLinecap="round"
  />
  {/* Central lightning bolt ⚡ approximation */}
  <path
    d="M56 1l-6 5h4l-4 6 10-7h-4z"
    stroke="currentColor"
    strokeWidth="0.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
  />
</svg>
```

Or for a simpler version matching existing `THEME_CONSTANTS`:

```tsx
// Simple accent line
<div className="flex items-center gap-2 mt-1">
  <span className="h-0.5 w-8 rounded-full bg-primary-500" />
  <span className="text-primary-500 text-xs">✦</span>
  <span className="h-0.5 w-8 rounded-full bg-primary-500" />
</div>
```

Apply below every `<h2>` in homepage sections. Add `showOrnament` boolean prop to `SectionCarousel`'s header.

---

### LX-4 — `CategoryGrid` — Icon Glow Ring + Animated Underline

**Source:** `licorice/components/home/CategoryGrid.tsx`

The Licorice category pill is a much cleaner pattern than a static card. Key micro-interactions to extract:

```tsx
// Icon circle with glow ring on hover
<span className="bg-primary-500/8 group-hover:bg-primary-500/15 flex h-16 w-16 items-center justify-center
  rounded-full text-3xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg
  group-hover:shadow-primary-500/10">
  {icon}
</span>

// Animated underline grow
<span className="bg-primary-500 h-0.5 w-0 rounded-full transition-all duration-300 group-hover:w-8" />
```

**Apply to:** `CategoryCard` (C5 plan). Replace the static underline with this animated width-grow.  
**Also apply to:** `TopCategoriesSection` (Phase 4) — use `py-20` section cadence.

**Mobile scroll + desktop grid:**

```
mobile:  -mx-4 flex gap-4 overflow-x-auto px-4 scrollbar-hide (horizontal scroll)
sm+:     grid grid-cols-3 gap-5
lg+:     grid-cols-6
```

---

### LX-5 — `ConcernGrid` Pattern — Hover Gradient Fill + Slide-in Arrow

**Source:** `licorice/components/home/ConcernGrid.tsx`

This is one of the most polished card patterns from Licorice — the card background is transparent until hover, when an absolute gradient fades in:

```tsx
{
  /* Hover gradient fill — extracted for reuse */
}
<div
  className="from-primary-500/5 to-cobalt-500/5 pointer-events-none absolute inset-0 
  bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100"
/>;

{
  /* Slide-in arrow CTA — extracted for reuse */
}
<span
  className="text-primary-600 flex items-center gap-1 text-xs font-medium opacity-0 
  transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
>
  View products →
</span>;
```

**Apply to:**

- `CategoryCard` (C5 — tile variant): add gradient fill overlay + slide-in arrow
- `EventCard` (C7): already planned; use this exact pattern
- Any "concern" or "solution" grid that may be added to LetItRip in future

**Section header pattern from Licorice `ConcernGrid`:**

```tsx
<div className="mb-14 flex flex-col items-center gap-3 text-center">
  {/* Pill badge */}
  <span className="...">TARGETED SOLUTIONS</span>
  {/* h2 */}
  <h2 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl">
    Say Goodbye to...
  </h2>
  {/* Ornamental divider */}
  <div className="flex items-center gap-2">
    <span className="bg-primary-500 h-0.5 w-8 rounded-full" />
    <span className="text-primary-500 text-xs">✦</span>
    <span className="bg-primary-500 h-0.5 w-8 rounded-full" />
  </div>
</div>
```

This triple-element divider (line + sparkle + line) is the **definitive section header separator** — use in all Phase 4 content sections.

---

### LX-6 — `BrandStory` Pattern — Decorative Circle Borders

**Source:** `licorice/components/home/BrandStory.tsx`

Decorative background rings at corners:

```tsx
{
  /* Top-left decorative ring */
}
<div
  className="border-primary-500/[0.06] pointer-events-none absolute -top-32 -left-32 
  h-64 w-64 rounded-full border"
/>;
{
  /* Bottom-right dashed ring */
}
<div
  className="border-cobalt-500/[0.1] pointer-events-none absolute -right-24 -bottom-24 
  h-48 w-48 rounded-full border border-dashed"
/>;
```

**Apply to:** `AdvertisementBanner` gradient fallback (C12), `NewsletterSection` (C14 footer), `WhatsAppCommunitySection` (Phase 5). These decorative rings add depth without images.

---

### LX-7 — `AnnouncementBar` — Dismissible Promo Strip

**Source:** `licorice/components/layout/AnnouncementBar.tsx`  
**Map to:** C15 TitleBarLayout promo strip

Exact pattern to use (already matches MAKEOVER.md C15 intent, Licorice has working code):

```tsx
"use client";
import { useState } from "react";
import { X } from "lucide-react";

// Sits above <header> in LayoutClient or TitleBarLayout
export function AnnouncementBar({
  text,
  link,
}: {
  text: string;
  link?: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div
      className="from-primary-500 to-cobalt-600 relative flex items-center justify-center 
      bg-gradient-to-r px-8 py-2 text-sm text-white/90"
    >
      {link ? (
        <a href={link} className="hover:underline">
          {text}
        </a>
      ) : (
        <p>{text}</p>
      )}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-1/2 right-3 -translate-y-1/2 opacity-70 transition-opacity hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
```

**Pop this directly into Phase 6** — it's near-copy-paste ready, just swap Licorice's color vars for LetItRip's Tailwind tokens.

---

### LX-8 — `TestimonialsCarousel` — Quote Icon + Divider + Verified Badge

**Source:** `licorice/components/home/TestimonialsCarousel.tsx`

Specific patterns better than LetItRip current:

```tsx
{
  /* Quote icon — top of card, not an oversized watermark */
}
<Quote className="text-primary-500/10 mb-4 h-8 w-8" />;

{
  /* Divider between body and reviewer */
}
<div className="bg-primary-500/30 my-5 h-px w-full" />;

{
  /* Verified purchase indicator */
}
<p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
  Verified Purchase
</p>;
```

The `Quote` Lucide icon (not an oversized CSS character) + the `h-px` divider feels cleaner than our current C8 plan. **Merge into C8.**

Uses **embla-carousel-react** with `Autoplay` plugin — see LX-10.

---

### LX-9 — `TrustBadgesStrip` — Gradient Icon Boxes + Thin Stroke Icons

**Source:** `licorice/components/home/TrustBadgesStrip.tsx`

Key improvements over current LetItRip trust section:

```tsx
{
  /* Gradient icon box — not a flat circle */
}
<div
  className="from-primary-500/10 to-cobalt-500/10 flex h-14 w-14 items-center 
  justify-center rounded-2xl bg-gradient-to-br"
>
  <Icon className="text-primary-600 h-6 w-6" strokeWidth={1.5} />
</div>;

{
  /* Title: uppercase tracking-wide */
}
<h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
  {title}
</h3>;

{
  /* Description: xs, leading-relaxed */
}
<p className="text-zinc-500 text-xs leading-relaxed">{description}</p>;
```

Icon data-driven via `ICON_MAP: Record<string, LucideIcon>` — trust items remain CMS-configurable.

`strokeWidth={1.5}` on all icons in trust/feature sections — makes them look lighter and more refined. This is a global icon style rule to add to Phase 7 polish.

**Grid responsive layout:**

```
grid-cols-2 sm:grid-cols-3 lg:grid-cols-6
```

---

### LX-10 — embla-carousel-react as SectionCarousel Engine

**Source:** `licorice/components/home/ProductCarousel.tsx`

Licorice uses `embla-carousel-react` instead of a custom `HorizontalScroller`. Key benefits:

- Momentum/inertia scrolling (native feel on mobile)
- `loop`, `align`, `slidesToScroll` config
- Autoplay plugin: `embla-carousel-autoplay`
- `emblaApi.scrollPrev()` / `emblaApi.scrollNext()` for arrow buttons
- `flex-[0_0_calc(50%-10px)]` slide sizing (responsive without JS)

**Recommendation for Phase 3:** Consider wrapping `SectionCarousel`'s scroller in an embla instance. This removes the custom `HorizontalScroller` scroll logic and gives better mobile feel. Use as a peer-dependency (already zero breaking changes to consumers since `SectionCarousel` is the only public API).

**Install:** `npm install embla-carousel-react embla-carousel-autoplay` — lightweight (~12kb).

**Slide sizing pattern:**

```tsx
className =
  "min-w-0 flex-[0_0_calc(50%-10px)] sm:flex-[0_0_calc(33.333%-14px)] lg:flex-[0_0_calc(25%-15px)]";
```

This single CSS class handles all responsive column widths without any JS breakpoint logic.

---

### LX-11 — `NewsletterBanner` — Gradient + Decorative Rings + Pill Label

**Source:** `licorice/components/home/NewsletterBanner.tsx`

The newsletter section is far better than a plain form row. Key elements:

```tsx
{/* Decorative rings */}
<div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full
  border border-white/[0.06]" />
<div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full
  border border-dashed border-white/[0.08]" />

{/* Pill label above heading */}
<span className="border-primary-500/30 text-primary-400 mb-4 inline-flex rounded-full border
  px-3 py-1 text-xs tracking-widest uppercase">Stay Connected</span>

{/* Input + button side by side */}
<form className="mt-8 flex gap-3">
  <Input className="flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/40" />
  <Button variant="secondary">Subscribe</Button>
</form>
<p className="mt-4 text-xs text-white/40">No spam, ever. Unsubscribe anytime.</p>
```

**Apply to:** `FooterLayout` (C14 Phase 6) — embed this newsletter strip in the footer's brand column. Background gradient `from-primary-600 to-cobalt-700` (translated from Licorice's `from-primary via-primary/95 to-secondary`).

---

### LX-12 — `BlogCard` — `aspect-video` + `group-hover:scale-105` Image

**Source:** `licorice/components/blog/BlogCard.tsx`

Key differences from current LetItRip BlogCard:

- Thumbnail uses `aspect-video` (16:9) instead of `aspect-[4/3]` — wider feels more editorial
- Image: `transition-transform duration-500 group-hover:scale-105` — slower, smoother scale
- Category: `<Badge variant="info">` below image, before title
- Title: `font-heading` (translated to `font-display` for LetItRip) + `group-hover:text-primary-600`
- Date: Calendar icon + `<time>` element — already semantic
- Card: `ayur-card` (`hover:-translate-y-2px + tinted shadow`) → LetItRip: `hover:-translate-y-1.5 hover:shadow-xl`

---

### LX-13 — `Footer` — Dark Gradient Brand Column + Hover Social Icons

**Source:** `licorice/components/layout/Footer.tsx`

Licorice's footer is `bg-gradient-to-b from-primary via-primary/95 to-primary/95 text-white/70` — the full footer is a deep dark gradient, not a neutral gray. For LetItRip (dark: `slate-950`, already our bg-dark) — adapt:

```tsx
// LetItRip footer gradient (dark mode dominant):
className =
  "bg-gradient-to-b from-slate-950 via-slate-950 to-cobalt-950/50 border-t border-white/5 text-white/60";
```

Key social icon pattern:

```tsx
<a
  className="hover:border-primary-500/40 hover:bg-primary-500/10 hover:text-primary-400 
  flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition-all"
>
  <Instagram className="h-4 w-4" />
</a>
```

The icon is in a `border border-white/10 rounded-full` ring that glows in brand color on hover. **Replace** LetItRip footer's current flat icon row with this.

---

### LX-14 — `Navbar` — `consultation`-style Pill Link on Desktop

**Source:** `licorice/components/layout/Navbar.tsx`

One-link gets a special pill treatment in the nav:

```tsx
// "Special" nav item rendered as a pill:
key === "consultation"
  ? "border-primary/20 bg-primary/5 text-primary rounded-full border px-3 py-1"
  : "";
```

For LetItRip's `MainNavbar`, consider the same treatment for a high-priority link like "Sell on LetItRip" or "Auctions Live". Configurable via a `highlighted` boolean on the nav item config.

---

### LX-15 — CSS Micro-Patterns from `globals.css`

These CSS patterns from Licorice are pure-CSS, zero-dependency, and should be added to LetItRip's `globals.css` in Phase 0:

```css
/* 1. Global heading letter-spacing (currently missing from LetItRip) */
h1,
h2,
h3,
h4,
h5,
h6 {
  letter-spacing: -0.02em;
  line-height: 1.15;
}

/* 2. Paragraph line-height standardization */
p {
  line-height: 1.7;
}

/* 3. Body letter-spacing tightening */
body {
  letter-spacing: -0.011em;
}

/* 4. Selection color using brand accent */
::selection {
  background-color: color-mix(
    in srgb,
    theme(colors.primary.500) 30%,
    transparent
  );
  color: theme(colors.zinc.900);
}

/* 5. Accent line divider (reusable class) */
.accent-divider {
  border: none;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    theme(colors.primary.500),
    transparent
  );
  margin: 0 auto;
  opacity: 0.35;
}

/* 6. Card hover utility (lifted from .ayur-card, LetItRip flavour) */
.card-lift {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.card-lift:hover {
  transform: translateY(-4px);
  box-shadow:
    0 12px 28px -6px
      color-mix(in srgb, theme(colors.primary.500) 10%, transparent),
    0 4px 10px -3px
      color-mix(in srgb, theme(colors.primary.500) 6%, transparent);
}
```

Item 1–3 alone will visibly tighten every heading and paragraph on the site.

---

### LX-16 — Phase 8 (NEW) — `BeforeAfterCard` + Results Section

Based on Licorice's `BeforeAfterCard`, add a new **Phase 8** to the LetItRip makeover:

**Goal**: Add the most visually distinctive section missing from LetItRip — the drag-comparison "proof" section. This fits perfectly on a marketplace: sellers can upload before/after proof images for their products; a curated set is shown on the homepage.

**Scope:**

- New component `src/features/homepage/components/BeforeAfterCard.tsx` (port + adapt from Licorice)
- New component `src/features/homepage/components/FeaturedResultsSection.tsx` (wrapper section)
- `siteSettings` CMS field: `featuredResults: { beforeImage, afterImage, caption }[]`
- Homepage RSC: fetch `featuredResults` SSR, pass as `initialData`

**Not a blocker for Phases 1–7** — add after Phase 7.

---

## Updated Summary Table

| Phase                    | Component Count      | Estimated Effort | Visual Impact      | Licorice Extractions                                                    |
| ------------------------ | -------------------- | ---------------- | ------------------ | ----------------------------------------------------------------------- |
| 0 — Tokens               | 3 files              | 2h               | None (foundation)  | LX-2 (stagger CSS), LX-15 (micro-patterns)                              |
| 1 — Cards                | 6 components         | 6h               | ★★★★★ Highest      | LX-4 (glow ring), LX-5 (gradient fill), LX-8 (Quote icon), LX-12 (blog) |
| 2 — Hero Sections        | 4 components         | 5h               | ★★★★☆ Very high    | LX-2 (stagger), LX-2 (mandala rings), LX-3 (ornament)                   |
| 3 — Carousels            | 2–3 components       | 4h               | ★★★★☆ Very high    | LX-10 (embla-carousel)                                                  |
| 4 — Content Sections     | 8 sections           | 4h               | ★★★☆☆ Medium-high  | LX-3 (SectionHeading), LX-5 (divider pattern)                           |
| 5 — Banner/FAQ/WA        | 3 components         | 3h               | ★★★☆☆ Medium       | LX-6 (decorative rings), LX-11 (newsletter)                             |
| 6 — Layout Shell         | 3 components         | 4h               | ★★★★☆ High (frame) | LX-7 (AnnouncementBar), LX-13 (footer), LX-14 (nav pill)                |
| 7 — Polish & Motion      | Audit whole codebase | 3h               | ★★★☆☆ Progressive  | LX-9 (strokeWidth=1.5), LX-15 (letter-spacing)                          |
| 8 — Before/After _(new)_ | 2 components         | 3h               | ★★★★☆ Distinctive  | LX-1 (BeforeAfterCard full port)                                        |

**Total estimated: ~34 hours across 8 phases**

---

## Product & Shop UX Comparison (LetItRip vs Licorice)

> Items labeled **PP-** (product page), **SH-** (shop/listing), **FN-** (fonts), **NV-** (navbar), **SR-** (search).  
> Each item has a **LetItRip current state**, **Licorice pattern**, and the **action** to take.

---

### PP — Product Detail Page

#### PP-1: Add-to-Cart CTA color is wrong

|                  | Detail                                                                                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LetItRip now** | `bg-orange-500` — hard-coded orange, not part of brand palette                                                                                                                    |
| **Licorice**     | `Button size="lg"` uses primary (`bg-primary`) → brand color                                                                                                                      |
| **Action**       | In `ProductActions.tsx`, change `bg-orange-500` → `bg-primary hover:bg-primary/90`. The mobile fixed-bottom bar `Add to Cart` button must also change. **1 file, 2 occurrences.** |
| **Priority**     | P0 — brand consistency bug                                                                                                                                                        |

---

#### PP-2: No "Buy Now" button on desktop

|                  | Detail                                                                                                                                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LetItRip now** | Desktop sticky col has no Buy Now. Mobile fixed bar has a single Add-to-Cart. The RSC page has no Zap button.                                                                                               |
| **Licorice**     | Distinct `Button variant="outline" size="lg" w-full` with `<Zap />` icon below quantity row, links to `/checkout` and adds item inline                                                                      |
| **Action**       | In `ProductActions.tsx` desktop section add a `variant="outline"` button below Add-to-Cart. Label: `t("buyNow")`. Action: add item to cart then navigate to `/checkout`. Reuse or adapt Licorice's pattern. |
| **Priority**     | P1                                                                                                                                                                                                          |

---

#### PP-3: No upsell block — BuyMoreSaveMore pattern

|                  | Detail                                                                                                                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LetItRip now** | Nothing between action area and reviews                                                                                                                                                                                       |
| **Licorice**     | `<BuyMoreSaveMore product={product} />` — tiered quantity discount block `(Buy 2 save 10%, Buy 3 save 15%)` placed directly below the 2-col grid                                                                              |
| **Action**       | Extract the BuyMoreSaveMore component (see LX-11 in Licorice Extractions above). Add just below the `ProductDetailView` main grid, above `ProductReviews`. Use `product.bulkDiscounts` array (add field to schema if absent). |
| **Priority**     | P2                                                                                                                                                                                                                            |

---

#### PP-4: No promo-strip below product grid

|                  | Detail                                                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **LetItRip now** | No trust/shipping guarantee strip on product pages                                                                                           |
| **Licorice**     | `<PromoBannerStrip />` — icon-chip strip: Free Shipping above ₹X · Easy Returns · Authentic — placed between product grid and ProductReviews |
| **Action**       | Extract PromoBannerStrip pattern (see LX-3). Wire to `siteSettings.shippingThreshold`. 3 chips, icon + label.                                |
| **Priority**     | P2                                                                                                                                           |

---

#### PP-5: No product content tabs

|                  | Detail                                                                                                                                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LetItRip now** | Description, ingredients, how-to-use, and reviews are either absent from the product page or rendered as a flat stack                                                                                                                           |
| **Licorice**     | `<ProductTabs>` — tabbed section with: Description (prose), Ingredients list, How to Use steps, Reviews tab (scrolls to `#reviews`)                                                                                                             |
| **Action**       | Add `ProductTabs` component inside `ProductDetailView`, below the PromoBannerStrip. Tabs: Description · Ingredients · How to Use · Reviews (anchor). Content sourced from `product.description`, `product.ingredients[]`, `product.howToUse[]`. |
| **Priority**     | P2                                                                                                                                                                                                                                              |

---

#### PP-6: Product image lacks zoom cursor + icon hint

|                  | Detail                                                                                                                                                                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LetItRip now** | Hovering the main gallery image shows arrows + counter overlay; no cursor or icon signals zoom intent; expand button is `opacity-0 group-hover:opacity-100` only                                                                                                |
| **Licorice**     | Main image container has `cursor-zoom-in`; a `<ZoomIn className="h-5 w-5" />` icon appears center-of-image on hover (`opacity-0 group-hover:opacity-100 absolute`); thumbnail active state = `border-2 border-primary rounded-xl`                               |
| **Action**       | In `ProductImageGallery.tsx`, add `cursor-zoom-in` to the main image wrapper div. Move the expand icon to the center of the image (absolute center, scale-in on hover). Add `border-2 border-primary` ring on active thumbnail replacing the current highlight. |
| **Priority**     | P2                                                                                                                                                                                                                                                              |

---

#### PP-7: Stock urgency label missing

|                  | Detail                                                                                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LetItRip now** | No stock-level warning visible on product page                                                                                                                                     |
| **Licorice**     | `{product.inStock && selectedVariant.stock <= 5 && (<p className="text-sm font-medium text-amber-600 dark:text-amber-400">{t("onlyLeft", { count: selectedVariant.stock })}</p>)}` |
| **Action**       | In `ProductActions.tsx`, add amber "Only N left!" label when `variant.stock <= 5` and product is `inStock`.                                                                        |
| **Priority**     | P2                                                                                                                                                                                 |

---

### SH — Shop / Listing Page

#### SH-1: Product grid is wider but Licorice skeleton is better styled

|                  | Detail                                                                                                                                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LetItRip now** | `ProductGrid` (in DataTable grid mode): `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5`. Skeleton: basic animate-pulse rectangles.                                                                           |
| **Licorice**     | `grid-cols-2 md:grid-cols-3 xl:grid-cols-4`. Skeleton card: `border-border overflow-hidden rounded-2xl border` with `aspect-square` image skeleton + `space-y-2 p-4` text lines.                                                       |
| **Action**       | Update `ProductCard` skeleton in `ProductGrid` to use `rounded-2xl border border-zinc-200 dark:border-slate-800` card wrapper with `aspect-square` image skeleton. This applies the same card chrome to the skeleton as the real card. |
| **Priority**     | P2                                                                                                                                                                                                                                     |

---

#### SH-2: Licorice has NO mobile filter drawer — LetItRip is ahead here

|                  | Detail                                                                                                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LetItRip now** | `FilterDrawer` (left slide-in) is available and wired in `ListingLayout`; `FilterPanel` is config-driven with facets, ranges, switches                                                                                      |
| **Licorice**     | Shop sidebar is literally `<aside className="hidden ... lg:block">` — **no mobile filter access at all**                                                                                                                    |
| **Action**       | LetItRip is already better here. Ensure `FilterDrawer` trigger is visible and prominent on mobile (≤md screens): verify `ListingLayout` exposes a `<FilterDrawer>` trigger in the mobile header row. No regression allowed. |
| **Priority**     | P0 — maintain existing advantage                                                                                                                                                                                            |

---

#### SH-3: Filter sections should be collapsible

|                  | Detail                                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LetItRip now** | `FilterFacetSection` renders all options expanded, no collapse toggle                                                                                                                                   |
| **Licorice**     | Each `<FilterSection>` has a collapse toggle (▲/▼ chevron button, `useState(true)` default open)                                                                                                        |
| **Action**       | Add collapse-toggle to `FilterFacetSection` in `src/components/filters/`. Add a `defaultOpen?: boolean` prop (default `true`). When closed, hide the options list with `hidden` / `max-h-0` transition. |
| **Priority**     | P2                                                                                                                                                                                                      |

---

### FN — Fonts & Typography

#### FN-1: Fonts loaded via CSS @import — no optimization

|                  | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LetItRip now** | `globals.css` has `@import url('https://fonts.googleapis.com/css2?family=Bangers...')` and Inter is implicit from system stack. No `next/font` = no automatic preloading, no font subsetting, potential FOIT on slow connections.                                                                                                                                                                                                                                                                                                               |
| **Licorice**     | `next/font/google` with `display: "swap"` and CSS variable injection (`--font-heading-loaded`, `--font-body-loaded`). Optimized subsets loaded at build time.                                                                                                                                                                                                                                                                                                                                                                                   |
| **Action**       | In `src/app/layout.tsx`, migrate font loading: <br/>`import { Bangers, Inter } from "next/font/google"` <br/>`const bangers = Bangers({ weight: "400", subsets: ["latin"], variable: "--font-display", display: "swap" })` <br/>`const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" })` <br/>Apply as `className={`${bangers.variable} ${inter.variable}`}` on `<html>`. Remove the `@import` from `globals.css`. Update `tailwind.config.js` `fontFamily` to use `var(--font-display)` and `var(--font-body)`. |
| **Priority**     | P1 — performance                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

---

#### FN-2: Consider Cormorant Garamond for editorial headings

|                  | Detail                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LetItRip now** | Bangers for all display `font-display` usage — great for Beyblade energy; but editorial sections (blog, testimonials, "Our Story" fragments) need a more sophisticated serif                                                                                                                                                                                                                              |
| **Licorice**     | `Cormorant_Garamond` weights 300–700 + italic — used as `font-heading` for all headings, giving an elegant high-fashion editorial feel                                                                                                                                                                                                                                                                    |
| **Action**       | Add Cormorant Garamond as `--font-editorial` variable alongside Bangers. Create a `font-editorial` Tailwind utility. Use `font-editorial` for: testimonial quotes, `"Our Story"` section headings, blog article headings, marketing landing sections. Keep `font-display` (Bangers) for: hero CTAs, product names on cards, energy/game sections. This gives LetItRip two distinct typographic registers. |
| **Priority**     | P2                                                                                                                                                                                                                                                                                                                                                                                                        |

---

### NV — Navbar & Navigation

#### NV-1: Two-layer sticky navbar consumes too much vertical space on mobile

|                  | Detail                                                                                                                                                                                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LetItRip now** | Two sticky rows: `TitleBarLayout` (~48px) + `MainNavbar` (`h-10 md:h-12`, `hidden md:block`). Desktop sees ~100px of nav chrome. BottomNavbar (56px) reserved on mobile.                                                                                                                                                                                |
| **Licorice**     | Single `<header>` sticky row, `h-16 (64px)`. Nav links are inline. No second nav band. BottomNavbar: not used (Licorice has no BottomNavbar).                                                                                                                                                                                                           |
| **Action**       | Option A (minimal): Reduce `layout.navbarHeight` from `h-10 md:h-12` to `h-8 md:h-10` to trim the second bar. Option B (recommended): collapse nav items into the TitleBarLayout for desktop (show horizontally between logo and action icons) and remove MainNavbar as a separate sticky row. Only the `hidden md:block` nav row needs to move inline. |
| **Priority**     | P2                                                                                                                                                                                                                                                                                                                                                      |

---

#### NV-2: Special pill styling for key nav items

|                  | Detail                                                                                                                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **LetItRip now** | All `NavItem` links have identical styling — no visual differentiation for high-priority destinations (Sell, Promotions)                                                                                                                                                       |
| **Licorice**     | "Consultation" nav item gets `border-primary/20 bg-primary/5 text-primary rounded-full border px-3 py-1` — stands out vs plain text links                                                                                                                                      |
| **Action**       | In `MAIN_NAV_ITEMS` config (or `NavItem`), add an optional `pill?: boolean` flag. When true, render the item with `rounded-full border border-primary/30 bg-primary/5 text-primary px-3 py-1`. Apply this to: "Sell on LetItRip" and "Today's Deals" / "Promotions" nav items. |
| **Priority**     | P2                                                                                                                                                                                                                                                                             |

---

#### NV-3: Mobile MobileMenu / Sidebar missing inline search

|                  | Detail                                                                                                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LetItRip now** | `Sidebar.tsx` has profile header, nav groups, theme toggle, locale switcher — but no search input. User must close the sidebar to access SearchOverlay.                                                                      |
| **Licorice**     | `MobileMenu` has an inline search form immediately below the header bar — `flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-primary/20`. On submit it navigates to `/search?q=...` and closes the menu. |
| **Action**       | Add an inline search form below the header section in `Sidebar.tsx`. Reuse `Search` component in inline mode (`deferred=false`). On submit navigate to the search page and close the sidebar.                                |
| **Priority**     | P2                                                                                                                                                                                                                           |

---

#### NV-4: BottomNavbar active icon color is inconsistent

|                  | Detail                                                                                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LetItRip now** | Bottom nav icons use theme-specific colors: Home=blue-500, Products=emerald-500, Search=violet-500, Cart=orange-500, Profile=rose-500 — no single brand identity                                      |
| **Licorice**     | Active links use `text-primary` uniformly (brand primary color)                                                                                                                                       |
| **Action**       | Update `BottomNavbar.tsx` active item colors to all use `text-primary` (lime) for active state and `text-zinc-500 dark:text-slate-400` for inactive. Remove the per-icon hardcoded color assignments. |
| **Priority**     | P1                                                                                                                                                                                                    |

---

### SR — Search

#### SR-1: SearchOverlay missing keyboard shortcut (Cmd+K)

|                  | Detail                                                                                                                                                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LetItRip now** | `SearchOverlay` opens via an icon button click. No keyboard shortcut. No hint in the trigger button.                                                                                                                                                      |
| **Licorice**     | `SearchDialog`: `useEffect` listens for `(e.metaKey \|\| e.ctrlKey) && e.key === "k"` → `setOpen(true)`. Trigger button shows `<kbd className="border text-[10px] px-1.5 py-0.5 rounded">⌘K</kbd>` next to the Search icon (visible at `xl:` breakpoint). |
| **Action**       | In `SearchOverlay.tsx` (or its trigger wrapper), add a `keydown` listener for `Ctrl+K` / `Cmd+K`. Add a `<kbd>⌘K</kbd>` hint label beside the search icon in `TitleBarLayout` (visible `xl:inline-flex`, hidden below).                                   |
| **Priority**     | P2                                                                                                                                                                                                                                                        |

---

#### SR-2: Search suggestions lack contextual site-links

|                  | Detail                                                                                                                                                                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LetItRip now** | Search overlay shows product/category/blog suggestions from the API. Shows nav records (page/category/blog/event) with type-colored badges.                                                                                                                                                 |
| **Licorice**     | Before typing (or when query < 2 chars), shows first 6 `SITE_LINKS` — quick shortcuts to Shop, Concerns, Ingredients, Consultation, Blog, About. Typing filters them by `label.includes(q) \|\| keywords.some(k => k.includes(q))`. Product/category results layer on top when API returns. |
| **Action**       | Add `SITE_LINKS` quick-access shortcuts (with icons from lucide-react) to `SearchOverlay`. Show top 6 before typing. On typing, filter + merge with live results. Use `ROUTES` constants for the href values instead of hardcoding.                                                         |
| **Priority**     | P2                                                                                                                                                                                                                                                                                          |

---

### Comparison Summary Table

| Area                           | LetItRip (now)                | Licorice (pattern)              | Gap / Action    |
| ------------------------------ | ----------------------------- | ------------------------------- | --------------- |
| Product CTA color              | `bg-orange-500`               | `bg-primary`                    | PP-1 (P0)       |
| Buy Now button                 | Mobile only                   | Desktop + mobile                | PP-2 (P1)       |
| BuyMoreSaveMore upsell         | ✗                             | ✓                               | PP-3 (P2)       |
| Promo strip (shipping/returns) | ✗                             | ✓                               | PP-4 (P2)       |
| Product content tabs           | Flat stack                    | Tabs (Desc/Ingr/HowTo/Reviews)  | PP-5 (P2)       |
| Image zoom cursor + icon       | ✗                             | cursor-zoom-in + ZoomIn overlay | PP-6 (P2)       |
| Stock urgency label            | ✗                             | "Only N left!" amber text       | PP-7 (P2)       |
| Mobile filter access           | FilterDrawer ✓                | No mobile filter at all         | SH-2 (maintain) |
| Collapsible filter sections    | Always open                   | ▲/▼ collapse                    | SH-3 (P2)       |
| Font loading                   | CSS @import (no optimization) | next/font/google (optimized)    | FN-1 (P1)       |
| Editorial serif font           | Bangers only                  | Cormorant Garamond for headings | FN-2 (P2)       |
| Dual sticky nav rows           | TitleBar+MainNavbar           | Single h-16 header              | NV-1 (P2)       |
| Pill styling for key nav       | ✗                             | Consultation pill               | NV-2 (P2)       |
| Inline search in mobile menu   | ✗                             | Inline form at top of drawer    | NV-3 (P2)       |
| BottomNavbar icon colors       | Per-icon hardcoded            | text-primary unified            | NV-4 (P1)       |
| Cmd+K search shortcut          | ✗                             | ✓ + ⌘K kbd hint                 | SR-1 (P2)       |
| Search site-link shortcuts     | Type-colored badge nav recs   | SITE_LINKS quick access         | SR-2 (P2)       |

**Priority key:** P0 = fix immediately (bugs/brand) · P1 = this sprint · P2 = next sprint

---

## Execution Rules

1. **One phase at a time** — Run `npx tsc --noEmit` and `npm run build` at the end of each phase before starting the next.
2. **Props first** — All new behaviors are controlled by props with sensible defaults. Existing call sites must still work unchanged.
3. **No breaking changes in barrel exports** — All component exports from `@/components` and feature `index.ts` files must remain valid.
4. **No hardcoded strings** — Any new user-visible text goes through `useTranslations()` or is supplied via a typed prop.
5. **No new layout primitives** — Use existing `Section`, `Heading`, `Text`, `Label` from `@/components` (which re-export `@lir/ui`).
6. **Mobile-first** — All spacing/typography changes start at `base` breakpoint; expand at `md`/`lg`.
7. **Accessibility** — All interactive elements keep `aria-label`, `role`, and keyboard focus rings.
8. **embla-carousel install** — Install `embla-carousel-react embla-carousel-autoplay` before starting Phase 3.
