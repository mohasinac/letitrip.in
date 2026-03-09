---
applyTo: "src/**/*.tsx"
description: "Existing components, typography primitives, semantic HTML, extend-don't-fork, DataTable/Search/Filter/Tabs. Rules 7, 8, 31, 32, 34."
---

# Components, Typography & Semantic HTML Rules

## RULE 7 & 8: Use Existing Components — Never Bypass

Before writing ANY markup, check `@/components` first. NEVER write raw `<h1>`–`<h6>`, `<p>`, `<label>`, `<span>`, `<a>`, `<button>`, `<input>`, `<section>`, `<nav>`, `<ul>`, `<li>`, etc.

### Typography Primitives (mandatory for ALL text)

| Component                | Use for                                                       |
| ------------------------ | ------------------------------------------------------------- |
| `Heading level={1–6}`    | All headings — never `<h1>`–`<h6>`                            |
| `Text`                   | Body paragraphs — never `<p>`                                 |
| `Label`                  | Form field labels — never `<label>`                           |
| `Caption`                | Helper text, timestamps, metadata                             |
| `Span variant="inherit"` | CSS wrappers (gradient, clip-path)                            |
| `TextLink href={...}`    | ALL links — internal (`ROUTES.*`) and external (auto-detects) |

### Form Primitives (mandatory for ALL controls)

| Component              | Replaces                  |
| ---------------------- | ------------------------- | --- | --------------------------- | --------- | ---------------------------- | --- | -------- | --------------------- |
| `FormField` / `Input`  | `<input>`                 |
| `Textarea`             | `<textarea>`              |
| `Select`               | `<select>`                |
| `Checkbox`             | `<input type="checkbox">` |     | `RadioGroup variant="toggle | classic"` | `<input type="radio">` group |     | `Toggle` | switch-style checkbox |
| `Slider`               | `<input type="range">`    |
| `Button variant="..."` | `<button>`                |

### Semantic HTML Wrappers

| Component              | Replaces                     | Note                  |
| ---------------------- | ---------------------------- | --------------------- |
| `Section`              | `<section>`                  |                       |
| `Article`              | `<article>`                  |                       |
| `Main`                 | `<main>`                     | one per page          |
| `Aside`                | `<aside>`                    |                       |
| `Nav aria-label="..."` | `<nav>`                      | `aria-label` REQUIRED |
| `BlockHeader`          | `<header>` inside components | NOT the app header    |
| `BlockFooter`          | `<footer>` inside components | NOT the app footer    |
| `Ul` / `Ol` / `Li`     | `<ul>` / `<ol>` / `<li>`     |                       |

### Other Key Components

`Card`, `Badge`, `StatusBadge`, `RoleBadge`, `Alert`, `Modal`, `ConfirmDeleteModal` (prop `variant?: "danger"|"warning"|"primary"`), `ImageCropModal`, `Tooltip`, `Divider`, `LoadingSpinner`, `Skeleton`, `EmptyState`, `SideDrawer`, `BackToTop`, `LocaleSwitcher`, `AvatarDisplay`, `AvatarUpload`, `ImageUpload`, `MediaUploadField`, `PasswordStrengthIndicator`, `ErrorBoundary`, `ResponsiveView`, `HorizontalScroller` (carousel/tab strips), `SectionCarousel` (section with heading + HorizontalScroller), `RichTextEditor`, `Progress`, `Tabs`, `SectionTabs`, `Accordion`, `RatingDisplay`, `AdminPageHeader`, `AdminFilterBar`, `DrawerFormFooter`, `AddressForm`, `SkipToMain`, `ReviewCard`, `ProductActions`, `ProductFeatureBadges`

## RULE 31: Extend Primitives — Never Fork

When a primitive almost covers your case → **add the variant/param/option in-place**.

```typescript
// ❌ WRONG — wrapper component
export function DangerButton(props) { return <Button variant="danger" {...props} />; }

// ✅ RIGHT — caller uses <Button variant="danger"> directly

// ❌ WRONG — local copy of utility
// src/features/products/utils/formatPrice.ts
export function formatPrice(n) { return `₹${n.toLocaleString('en-IN')}`; }

// ✅ RIGHT — extend formatCurrency(amount, 'INR', 'en-IN')
```

## RULE 32: DataTable / Search / Filter / Pagination Primitives

All filter/sort/page state MUST live in URL via `useUrlTable`. Using `useState` for list state is a violation.

### ListingLayout — mandatory shell for ALL list/grid pages

`ListingLayout` wires together search, sort, view-toggle, filter sidebar (desktop), filter overlay (mobile), and bulk-action bar in one component. Use it on every listing page — public, seller, and admin.

```typescript
import { ListingLayout, Search, SortDropdown, DataTable, FilterFacetSection } from '@/components';
<ListingLayout
  filterContent={<FilterFacetSection label="Category" options={catOpts} selected={cats} onChange={setCats} />}
  filterActiveCount={activeCount}
  onFilterClear={() => table.setMany({ category: '', status: '' })}
  searchSlot={<Search value={table.get('q')} onChange={(v) => table.set('q', v)} />}
  sortSlot={<SortDropdown value={table.get('sorts')} onChange={table.setSort} options={SORT_OPTS} />}
  selectedCount={selectedIds.length}
  onClearSelection={() => setSelectedIds([])}
  bulkActions={<Button variant="danger" size="sm" onClick={handleBulkDelete}>{t('delete')}</Button>}
>
  <DataTable columns={cols} data={items} loading={loading}
    selectable selectedIds={selectedIds} onSelectionChange={setSelectedIds}
    mobileCardRender={(i) => <ProductCard product={i} />} />
</ListingLayout>
```

### BulkActionBar — shown automatically by ListingLayout when `selectedCount > 0`

Also usable standalone: `<BulkActionBar selectedCount={n} onClearSelection={fn}><Button>...</Button></BulkActionBar>`

### DataTable — mandatory for ALL tabular + grid data

```typescript
import { DataTable } from '@/components';
<DataTable
  columns={columns} data={items} loading={loading}
  selectable selectedIds={selectedIds} onSelectionChange={setSelectedIds}
  viewMode={(table.get('view') || 'table') as 'table' | 'grid' | 'list'}
  onViewModeChange={(m) => table.set('view', m)}
  showViewToggle
  mobileCardRender={(item) => <ProductCard product={item} />}
/>
```

Pair with `TablePagination` for pagination — `DataTable` does NOT paginate internally.

### Search — mandatory for ALL search inputs

```typescript
<Search value={table.get('q')} onChange={(v) => table.set('q', v)} placeholder={UI_PLACEHOLDERS.SEARCH} />
```

### Filter Components

- `FilterDrawer` + `FilterFacetSection` — filter drawer panels
- `AdminFilterBar` — toolbar above lists (`withCard={false}` for public/seller pages)
- `ActiveFilterChips` — dismissible active filter chips
- `SortDropdown` — sort control (NEVER a raw `<select>`)
- `TablePagination` — result count + per-page + pagination

### Tabs / Accordion / HorizontalScroller

- `Tabs` / `SectionTabs` — NEVER custom tab markup
- `Accordion` — NEVER manual open/close state
- `HorizontalScroller` — NEVER raw `overflow-x-auto` div

### useUrlTable

```typescript
const table = useUrlTable({
  defaults: { pageSize: "25", sorts: "-createdAt" },
});
table.get("status"); // read
table.set("status", "active"); // write (resets page)
table.setPage(3);
table.setSort("-price");
table.setMany({ status: "active", role: "seller" });
```

## RULE 34: Semantic HTML Details

- Dates: wrap in `<time dateTime={iso}>` — NEVER bare span
- Key-value pairs: use `<dl>/<dt>/<dd>` — NEVER `<ul>/<li>` or flex divs
- Highlighted text: `<mark>`. Quotes: `<blockquote>/<q>`. Code: `<code>`. Keyboard: `<kbd>`
- Abbreviations: `<abbr title="full term">ABC</abbr>`
- One `<Heading level={1}>` per page. No skipped heading levels.
- Icon-only buttons: MUST have `aria-label`
- Decorative icons beside labelled text: `aria-hidden="true"`
- NEVER `role="button"` on `<div>` — use `<Button>`
- NEVER `focus:outline-none` without `focus-visible:ring-*` replacement
