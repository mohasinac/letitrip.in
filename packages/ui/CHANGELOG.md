# @lir/ui — Changelog

## [0.1.0] — 2026-01-01 — Initial extraction

### Added

**Semantic HTML primitives** (`Semantic.tsx`):

- `Section`, `Article`, `Aside`, `Nav`, `Header`, `Footer`, `Main`, `Ul`, `Ol`, `Li`, `Figure`, `Figcaption`, `Blockquote`, `Pre`, `Code`, `Hr` — typed wrappers around native HTML elements with full prop forwarding.

**Typography primitives** (`Typography.tsx`):

- `Heading` — `h1–h6` with `size` prop, maps to Tailwind text classes via inlined `UI_THEME`.
- `Text` — `<p>` equivalent.
- `Label` — `<label>` with `htmlFor`.
- `Caption` — `<figcaption>` or styled small text.
- `Span` — `<span>` with className merging.
- `TextLink` — `<a>` with accessible styling.

**UI components**:

- `Spinner` — Loading spinner with `sm|md|lg|xl` sizes and `primary|white|current` variants.
- `Skeleton` — Loading placeholder with `pulse|wave|none` animation variants. Inline `<style>` for wave animation.
- `Button` — `primary|secondary|outline|ghost|danger|warning` variants; `sm|md|lg` sizes; `isLoading`, `leftIcon`, `rightIcon` props. Uses `tailwind-merge`.
- `Badge` — 17 status/role variants with inlined `BADGE_CLASSES`.
- `Alert` — `info|success|warning|error` variants; optional `title` (uses `Heading`); optional dismiss button.
- `Divider` — `horizontal|vertical` with optional text label.
- `Progress` — Determinate progress bar with `value`, `max`, optional label.
- `IndeterminateProgress` — Animated wave progress bar (inline `<style>`).
