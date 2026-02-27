# Frontend Implementation Plan

> **Source:** Derived from `FRONTEND_REFACTOR_PLAN.md` audit (Feb 20, 2026)
> **Principle:** Each phase is independently shippable. Later phases depend on earlier ones. Tests ship in the same PR as the code they cover.

---

## Status

**All 67 phases complete** (Phases 1–67, 2026-02-21 → 2026-02-28). See `docs/CHANGELOG.md` for per-phase notes.

---

## Viewport Targets

Every component and page **must work correctly at all three viewport classes.**

| Class          | Breakpoint       | Tailwind prefix | Typical device           | Key layout rules                                                                                                       |
| -------------- | ---------------- | --------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **Mobile**     | < 640 px         | _(default)_     | Phone portrait/landscape | Single column; drawers full-screen (`w-full`); bottom nav or hamburger; no visible sidebars                            |
| **Desktop**    | 640 px - 1535 px | `sm:` - `xl:`   | Tablet to standard 1080p | Two-column layouts at `lg`; drawers partial-width (`md:w-3/5`); sidebars visible at `lg+`                              |
| **Widescreen** | >= 1536 px       | `2xl:`          | 1440p / 4K / ultrawide   | Max-width capped at `max-w-screen-2xl`; admin sidebar + main + detail panel can coexist; DataTable gains extra columns |

### Per-feature breakpoint rules

| Feature          | Mobile                                                     | Desktop (lg)                                   | Widescreen (2xl)                                  |
| ---------------- | ---------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------- |
| **Filter UI**    | `<FilterDrawer>` triggered by "Filters (n)" button         | `<ProductFilters>` always-visible left sidebar | Same as desktop                                   |
| **CRUD drawers** | `SideDrawer` full-screen (`w-full`)                        | `md:w-3/5`                                     | `lg:max-w-2xl` (complex forms like `ProductForm`) |
| **Admin pages**  | Horizontal scroll on DataTable; filters collapse to drawer | Inline `AdminFilterBar`; full DataTable        | Extra columns visible; wider filter bar           |
| **Footer**       | Single column stack                                        | 5-column grid (`lg:grid-cols-5`)               | Constrained to `max-w-screen-2xl mx-auto`         |
| **Navigation**   | Hamburger menu / bottom tabs                               | Full horizontal nav or sidebar                 | Same; extra spacing                               |
| **FAQ sidebar**  | `<FilterDrawer side="left">` triggered by button           | Always-visible left sidebar                    | Same as desktop                                   |
| **Pagination**   | Compact (prev/next + current page)                         | Full page-number strip                         | Same as desktop                                   |

> **Widescreen rule:** Never stretch content edge-to-edge at >= 1536 px. All page wrappers use `max-w-screen-2xl mx-auto px-4 lg:px-8 2xl:px-12`.
