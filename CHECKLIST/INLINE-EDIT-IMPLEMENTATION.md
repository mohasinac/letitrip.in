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

## Phase 1: Core Reusable Components

### 1.1 InlineEditRow Component
- [ ] Create `src/components/common/InlineEditRow.tsx`
- [ ] Props: fields config, onSave, onCancel, loading state
- [ ] Support field types: text, number, select, checkbox, image
- [ ] Inline validation
- [ ] Cancel/Save actions
- [ ] Keyboard support (Enter to save, Esc to cancel)

### 1.2 QuickCreateRow Component
- [ ] Create `src/components/common/QuickCreateRow.tsx`
- [ ] Similar to InlineEditRow but for new items
- [ ] Always visible at top of table
- [ ] Reset after successful create
- [ ] Show success/error feedback

### 1.3 BulkActionBar Component
- [ ] Create `src/components/common/BulkActionBar.tsx`
- [ ] Sticky bottom bar on mobile, top bar on desktop
- [ ] Show count of selected items
- [ ] Action buttons based on context
- [ ] Confirm dialog for dangerous actions
- [ ] Progress indicator for bulk operations

### 1.4 InlineImageUpload Component
- [ ] Create `src/components/common/InlineImageUpload.tsx`
- [ ] Small square preview (64x64px)
- [ ] Click to upload
- [ ] Show loading spinner during upload
- [ ] Integrate with MediaUploader logic
- [ ] Clear button

### 1.5 MobileFilterSidebar Component
- [ ] Create `src/components/common/MobileFilterSidebar.tsx`
- [ ] Slide from right (like navbar)
- [ ] Backdrop overlay
- [ ] Collapsible filter sections
- [ ] Apply/Reset buttons
- [ ] Stock checkbox moved to sort area

---

## Phase 2: Admin Pages Implementation

### 2.1 Hero Slides
**File**: `src/app/admin/hero-slides/page.tsx`

- [ ] Add quick create row at top
- [ ] Inline edit on click/double-click
- [ ] Image upload inline (64x64 preview)
- [ ] Checkboxes for bulk actions
- [ ] Bulk actions: activate, deactivate, delete, reorder
- [ ] Expand to 10 slides max
- [ ] Carousel preview selector (mark 5 for display)
- [ ] Drag-and-drop ordering preserved

**API Changes**:
- [ ] PATCH `/api/admin/hero-slides/:id` (partial update)
- [ ] POST `/api/admin/hero-slides/bulk` (bulk operations)

### 2.2 Categories
**File**: `src/app/admin/categories/page.tsx`

- [ ] Quick create row (name, slug, parent, featured checkboxes)
- [ ] Inline edit for name, slug, parent
- [ ] Image upload inline
- [ ] Bulk actions: set parent, toggle featured, toggle active, delete
- [ ] Checkbox column

**API Changes**:
- [ ] POST `/api/admin/categories/bulk` (bulk operations)

### 2.3 Users
**File**: `src/app/admin/users/page.tsx`

- [ ] No quick create (users self-register)
- [ ] Inline edit for role, ban status
- [ ] Checkboxes for bulk selection
- [ ] Bulk actions: change role, ban, unban, export

**API Changes**:
- [ ] POST `/api/admin/users/bulk` (bulk operations)

---

## Phase 3: Seller Pages Implementation

### 3.1 Products
**File**: `src/app/seller/products/page.tsx`

- [ ] Quick create row (name, price, stock, category, image)
- [ ] Inline edit for price, stock, status
- [ ] Image upload inline
- [ ] Checkboxes for bulk actions
- [ ] Bulk actions: set price, update stock, change status (draft/published), assign category, delete

**API Changes**:
- [ ] POST `/api/seller/products` (quick create)
- [ ] PATCH `/api/seller/products/:id` (inline update)
- [ ] POST `/api/seller/products/bulk` (bulk operations)

### 3.2 Orders
**File**: `src/app/seller/orders/page.tsx`

- [ ] No quick create
- [ ] Inline status update (dropdown)
- [ ] Checkboxes for bulk actions
- [ ] Bulk actions: approve, ship, print invoice, cancel

**API Changes**:
- [ ] POST `/api/seller/orders/bulk` (bulk operations)

### 3.3 Auctions (if exists)
**File**: Check if exists

- [ ] Quick create row
- [ ] Inline edit for dates, price
- [ ] Bulk actions: activate, end, delete

---

## Phase 4: Mobile Optimizations

### 4.1 Filter Improvements
- [ ] Replace full-screen filters with sidebar
- [ ] Update all listing pages (products, auctions, categories)
- [ ] Collapsible sections for filter groups
- [ ] Move stock checkbox to top near sort
- [ ] Smooth slide animation
- [ ] Backdrop with close on click

### 4.2 Responsive Table
- [ ] Horizontal scroll on mobile for tables
- [ ] Sticky first column (checkbox + item name)
- [ ] Compact view toggle on mobile
- [ ] Touch-friendly checkboxes (44px min)

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
  key: string
  type: 'text' | 'number' | 'select' | 'checkbox' | 'image' | 'date'
  label: string
  required?: boolean
  options?: { value: string; label: string }[]
  validate?: (value: any) => string | null
  placeholder?: string
}

interface BulkAction {
  id: string
  label: string
  icon?: any
  variant?: 'default' | 'danger'
  confirm?: boolean
  confirmMessage?: string
}

interface InlineEditConfig {
  fields: InlineField[]
  bulkActions: BulkAction[]
  resourceName: string // 'hero slide', 'category', 'product'
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
