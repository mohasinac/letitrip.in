# `@lir/ui` Package

**Package:** `packages/ui/`  
**Alias:** `@lir/ui`  
**Purpose:** Design-system primitives used across the entire app. All UI tokens (colors, spacing, radius) are inlined as JavaScript constants — no Tailwind theme extension needed.

Components are re-exported from `src/components/` barrel so feature code imports via `@/components`.

---

## Design Tokens

Tokens are inlined in each component via `UI_THEME` constant — no CSS variables.

| Token Group | Examples                                                            |
| ----------- | ------------------------------------------------------------------- |
| Colors      | `primary`, `secondary`, `success`, `warning`, `danger`, `neutral-*` |
| Spacing     | `xs`, `sm`, `md`, `lg`, `xl`, `2xl`                                 |
| Radius      | `sm`, `md`, `lg`, `full`                                            |
| Shadow      | `sm`, `md`, `lg`                                                    |
| Typography  | `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`, `4xl`                 |

---

## Typography Components

### `Heading`

```tsx
<Heading as="h1" size="3xl" weight="bold">
  LetItRip
</Heading>
```

Props: `as` (h1–h6, default h2), `size` (2xl–4xl), `weight`, `color`, `className`

### `Text`

```tsx
<Text size="base" color="muted">
  Product description here.
</Text>
```

Props: `as` (p, span, div), `size` (xs–xl), `weight`, `color`, `leading`, `truncate`

### `Label`

```tsx
<Label htmlFor="email" required>
  Email address
</Label>
```

Props: `htmlFor`, `required`, `size`

### `Caption`

```tsx
<Caption>Last updated 3 hours ago</Caption>
```

For subtext, timestamps, and supplementary information. Renders as `<span>` with muted small styling.

### `Span`

Inline `<span>` with token-based typography props. Useful for inline emphasis inside paragraphs.

---

## Semantic HTML Primitives

Semantic wrappers that enforce correct HTML structure. Use instead of raw HTML tags.

| Component | Renders as  | Description                             |
| --------- | ----------- | --------------------------------------- |
| `Section` | `<section>` | Page section with optional `aria-label` |
| `Article` | `<article>` | Content article (blog posts, cards)     |
| `Nav`     | `<nav>`     | Navigation region with `aria-label`     |
| `Header`  | `<header>`  | Page/section header                     |
| `Footer`  | `<footer>`  | Page/section footer                     |
| `Main`    | `<main>`    | Main page content                       |
| `Aside`   | `<aside>`   | Sidebar / supplementary content         |
| `Ul`      | `<ul>`      | Unstyled list with `role="list"`        |
| `Li`      | `<li>`      | List item                               |

All accept standard HTML attributes + `className`.

---

## `DataTable`

Full-featured sortable, selectable, and paginated data table.

```tsx
<DataTable
  columns={columns}
  data={products}
  isLoading={isLoading}
  onSort={handleSort}
  sortKey="price"
  sortDir="desc"
  selected={selected}
  onSelect={setSelected}
  pagination={{ page, total, pageSize, onPageChange }}
  emptyMessage="No products found"
/>
```

### Types

```ts
interface DataTableColumn<T> {
  key: string;
  header: string;
  accessor: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string, dir: "asc" | "desc") => void;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  selected?: string[];
  onSelect?: (ids: string[]) => void;
  rowKey?: (row: T) => string; // default: row.id
  pagination?: PaginationConfig;
  stickyHeader?: boolean;
  compact?: boolean;
}
```

---

## `Button`

```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Add to cart
</Button>
<Button variant="outline" disabled>Sold out</Button>
<Button variant="ghost" isLoading>Saving…</Button>
```

Props: `variant` (primary | secondary | outline | ghost | danger), `size` (sm | md | lg), `isLoading`, `disabled`, `fullWidth`, `leftIcon`, `rightIcon`

---

## `Alert`

```tsx
<Alert variant="success" title="Order placed" dismissable>
  Your order #1234 has been confirmed.
</Alert>
```

Props: `variant` (info | success | warning | error), `title?`, `dismissable`, `onDismiss`, `icon?`

---

## `Badge`

```tsx
<Badge variant="primary">New</Badge>
<Badge variant="success" size="sm">In Stock</Badge>
```

Props: `variant` (primary | secondary | success | warning | danger | neutral), `size` (sm | md)

---

## `StatusBadge`

Domain-aware badge with built-in color mapping per status value.

```tsx
<StatusBadge type="order" status="processing" />
<StatusBadge type="payment" status="paid" />
<StatusBadge type="review" status="approved" />
```

Types:

```ts
type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";
type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";
type ReviewStatus = "pending" | "approved" | "rejected" | "flagged";
type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
```

---

## `Modal`

```tsx
<Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm delete">
  <Text>Are you sure?</Text>
  <ModalFooter>
    <Button variant="outline" onClick={() => setOpen(false)}>
      Cancel
    </Button>
    <Button variant="danger" onClick={handleDelete}>
      Delete
    </Button>
  </ModalFooter>
</Modal>
```

Props: `isOpen`, `onClose`, `title?`, `size` (sm | md | lg | full), `closeable`, `preventClose`

---

## `Drawer`

Slide-in panel from any edge.

```tsx
<Drawer isOpen={open} onClose={close} side="right" title="Filters">
  <FilterPanel ... />
</Drawer>
```

Props: `isOpen`, `onClose`, `side` (left | right | bottom), `title?`, `size`

---

## `Pagination`

```tsx
<Pagination
  page={currentPage}
  total={totalItems}
  pageSize={20}
  onChange={setPage}
/>
```

---

## `Skeleton`

```tsx
<Skeleton width="100%" height={24} rounded />
<Skeleton variant="circle" size={48} />
```

Props: `width`, `height`, `variant` (rect | circle | text), `rounded`, `count`

---

## `Spinner`

```tsx
<Spinner size="md" color="primary" />
```

Props: `size` (sm | md | lg), `color`

---

## `Progress` / `IndeterminateProgress`

```tsx
<Progress value={75} max={100} color="primary" />
<IndeterminateProgress color="primary" />
```

---

## `Select`

Generic typed select dropdown.

```tsx
<Select<string>
  options={[{ value: "en", label: "English" }]}
  value={locale}
  onChange={setLocale}
  placeholder="Select language"
/>
```

Type parameter `V` constrains `option.value` and `onChange` argument type.

---

## `Breadcrumb`

```tsx
<Breadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Sneakers" },
  ]}
/>
```

---

## `Divider`

```tsx
<Divider />
<Divider orientation="vertical" spacing="md" />
```

---

## `ImageLightbox`

```tsx
<ImageLightbox
  images={[{ src: "...", alt: "..." }]}
  initialIndex={0}
  onClose={close}
/>
```

---

## `StarRating`

```tsx
<StarRating value={4.2} max={5} size="sm" />
<StarRating value={rating} interactive onChange={setRating} />
```

Props: `value`, `max`, `size`, `interactive`, `onChange`, `count` (review count display)
