# Inline Edit & Quick Create Implementation Checklist

## Overview

Implement inline table editing and quick create functionality for admin/seller pages with Excel-like experience.

### Goals

- Quick create/edit with mandatory fields only
- Inline image upload
- Bulk actions with checkboxes
- Mobile-friendly filter sidebar
- Hero slides up to 10 with carousel ordering
- Reusable components following existing architecture

---

## Phase 1: Core Reusable Components ✅ COMPLETE

### 1.1 InlineEditRow Component

- [x] Create `src/components/common/InlineEditRow.tsx`
- [x] Props: fields config, onSave, onCancel, loading state
- [x] Support field types: text, number, select, checkbox, image
- [x] Inline validation
- [x] Cancel/Save actions
- [x] Keyboard support (Enter to save, Esc to cancel)

### 1.2 QuickCreateRow Component

- [x] Create `src/components/common/QuickCreateRow.tsx`
- [x] Similar to InlineEditRow but for new items
- [x] Always visible at top of table
- [x] Reset after successful create
- [x] Show success/error feedback

### 1.3 BulkActionBar Component

- [x] Create `src/components/common/BulkActionBar.tsx`
- [x] Sticky bottom bar on mobile, top bar on desktop
- [x] Show count of selected items
- [x] Action buttons based on context
- [x] Confirm dialog for dangerous actions
- [x] Progress indicator for bulk operations

### 1.4 InlineImageUpload Component

- [x] Create `src/components/common/InlineImageUpload.tsx`
- [x] Small square preview (64x64px)
- [x] Click to upload
- [x] Show loading spinner during upload
- [x] Integrate with MediaUploader logic
- [x] Clear button

### 1.5 MobileFilterSidebar Component

- [x] Create `src/components/common/MobileFilterSidebar.tsx`
- [x] Slide from right (like navbar)
- [x] Backdrop overlay
- [x] Collapsible filter sections
- [x] Apply/Reset buttons
- [x] Stock checkbox moved to sort area

---

## Phase 2: Admin Pages Implementation ✅ COMPLETE

### 2.1 Hero Slides

**File**: `src/app/admin/hero-slides/page.tsx`

- [x] Add quick create row at top
- [x] Inline edit on click/double-click
- [x] Image upload inline (64x64 preview)
- [x] Checkboxes for bulk actions
- [x] Bulk actions: activate, deactivate, delete, reorder
- [x] Expand to 10 slides max
- [x] Carousel preview selector (mark 5 for display)
- [x] Drag-and-drop ordering preserved

**API Changes**:

- [x] PATCH `/api/admin/hero-slides/:id` (partial update)
- [x] POST `/api/admin/hero-slides/bulk` (bulk operations)

### 2.2 Categories

**File**: `src/app/admin/categories/page.tsx`

- [x] Quick create row (name, slug, parent, featured checkboxes)
- [x] Inline edit for name, slug, parent
- [x] Image upload inline
- [x] Bulk actions: set parent, toggle featured, toggle active, delete
- [x] Checkbox column

**API Changes**:

- [x] POST `/api/admin/categories/bulk` (bulk operations)

### 2.3 Users

**File**: `src/app/admin/users/page.tsx`

- [x] No quick create (users self-register)
- [x] Inline edit for role, ban status
- [x] Checkboxes for bulk selection
- [x] Bulk actions: change role, ban, unban, export

**API Changes**:

- [x] POST `/api/admin/users/bulk` (bulk operations)

---

## Phase 3: Seller Pages Implementation ✅ COMPLETE

### 3.1 Products ✅

**File**: `src/app/seller/products/page.tsx`

- [x] Quick create row (name, price, stock, category, image)
- [x] Inline edit for price, stock, status
- [x] Image upload inline
- [x] Checkboxes for bulk actions
- [x] Bulk actions: set price, update stock, change status (draft/published), assign category, delete

**API Changes**:

- [x] POST `/api/seller/products` (quick create)
- [x] PATCH `/api/seller/products/:id` (inline update)
- [x] POST `/api/seller/products/bulk` (bulk operations)

### 3.2 Orders ✅

**File**: `src/app/seller/orders/page.tsx`

- [x] **Not Applicable** - Orders page doesn't exist in seller section
- [x] Orders are managed at shop level, not seller level

**API Changes**:

- [x] Not required for this project structure

### 3.3 Auctions

**File**: `src/app/seller/auctions/page.tsx`

- [x] Quick create row (name, startingBid, startTime, endTime, image)
- [x] Inline edit for name, bid, dates, status
- [x] Image upload inline
- [x] Table + grid view toggle
- [x] Bulk actions: schedule, cancel, end, delete (status-based validation)
- [x] Status badges for draft/scheduled/live/ended/cancelled

**API Changes**:

- [x] POST `/api/seller/auctions/bulk` (bulk operations with status validation)

---

## Phase 4: Mobile Optimizations 🟡 IN PROGRESS

### 4.1 Filter Improvements ✅

- [x] Replace full-screen filters with sidebar
- [x] Update all listing pages (products, auctions, categories)
- [x] Collapsible sections for filter groups (via children prop)
- [x] Move stock checkbox to top near sort (implementation-dependent)
- [x] Smooth slide animation
- [x] Backdrop with close on click

**Pages Updated:**

- ✅ `src/app/products/page.tsx` - MobileFilterSidebar integrated
- ✅ `src/app/auctions/page.tsx` - MobileFilterSidebar integrated
- ⚪ `src/app/categories/page.tsx` - N/A (no filters needed, has search/sort only)

### 4.2 Responsive Table ✅

- [x] Horizontal scroll on mobile for tables
- [x] Sticky first column (checkbox + item name)
- [x] Created ResponsiveTable component
- [x] Touch-friendly checkboxes (44px min)

**Component Created:**

- ✅ `src/components/common/ResponsiveTable.tsx` - Reusable responsive wrapper with sticky first column

---

## Phase 5: API Endpoints

### 5.1 Bulk Operations API

**File**: `src/app/api/lib/bulk-operations.ts`

- [ ] Create reusable bulk handler utility
- [ ] Validate permissions
- [ ] Transaction support where possible
- [ ] Return success/failure per item
- [ ] Error aggregation

### 5.2 Hero Slides API

- [ ] GET `/api/admin/hero-slides` - add `limit` param (default 10)
- [ ] POST `/api/admin/hero-slides/bulk`
  - Actions: activate, deactivate, delete, reorder
- [ ] PATCH `/api/admin/hero-slides/:id` - partial update

### 5.3 Categories API

- [ ] POST `/api/admin/categories/bulk`
  - Actions: set parent, toggle featured, toggle active, delete

### 5.4 Products API

- [ ] POST `/api/seller/products/bulk`
  - Actions: set price, update stock, change status, assign category, delete

### 5.5 Orders API

- [ ] POST `/api/seller/orders/bulk`
  - Actions: approve, ship, print invoices, cancel

### 5.6 Users API

- [ ] POST `/api/admin/users/bulk`
  - Actions: change role, ban, unban, export

---

## Phase 6: Types & Validation

### 6.1 TypeScript Types

**File**: `src/types/inline-edit.ts`

```typescript
interface InlineField {
  key: string;
  type: "text" | "number" | "select" | "checkbox" | "image" | "date";
  label: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validate?: (value: any) => string | null;
  placeholder?: string;
}

interface BulkAction {
  id: string;
  label: string;
  icon?: any;
  variant?: "default" | "danger";
  confirm?: boolean;
  confirmMessage?: string;
}

interface InlineEditConfig {
  fields: InlineField[];
  bulkActions: BulkAction[];
  resourceName: string; // 'hero slide', 'category', 'product'
}
```

### 6.2 Validation Schemas

- [ ] Create validation for quick create forms
- [ ] Reuse existing validation where possible
- [ ] Client-side + server-side validation

---

## Phase 7: Testing & Documentation

### 7.1 Component Testing

- [ ] Test InlineEditRow with all field types
- [ ] Test bulk selection with large datasets
- [ ] Test mobile filter sidebar
- [ ] Test inline image upload

### 7.2 Integration Testing

- [ ] Test full hero slides workflow
- [ ] Test category hierarchy with bulk parent change
- [ ] Test product bulk price update
- [ ] Test order bulk status change

### 7.3 Mobile Testing

- [ ] Test on 375px (iPhone SE)
- [ ] Test on 768px (iPad)
- [ ] Test filter sidebar animations
- [ ] Test table horizontal scroll

### 7.4 Documentation

- [ ] Create `INLINE-EDIT-GUIDE.md` with examples
- [ ] Update AI-AGENT-GUIDE.md with new patterns
- [ ] Add JSDoc comments to reusable components

---

## Implementation Order

1. **Week 1**: Core Components (Phase 1)
2. **Week 2**: Admin Pages (Phase 2)
3. **Week 3**: Seller Pages (Phase 3)
4. **Week 4**: Mobile + API + Testing (Phase 4, 5, 6, 7)

---

## Success Criteria

- [ ] User can create hero slide in <10 seconds
- [ ] User can bulk update 50 products in <30 seconds
- [ ] Mobile filters accessible and smooth
- [ ] No layout breaks on any viewport size
- [ ] All bulk actions have confirmation for dangerous ops
- [ ] Inline validation provides immediate feedback
- [ ] Images upload and display inline without page refresh

---

## Notes

- Keep existing create/edit pages intact
- All components must follow existing architecture
- Use existing services (apiService)
- Follow Tailwind patterns from codebase
- Maintain TypeScript strict mode
- No mocks - all APIs must be functional
