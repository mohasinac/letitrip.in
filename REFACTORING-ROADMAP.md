# Next Pages to Refactor

## Priority 1: High Impact (70%+ state logic)

### 1. Checkout Page

**File**: `src/app/checkout/page.tsx`
**Current State**: Heavy (50+ useState calls)
**Refactoring Tool**: `useCheckoutState` hook (already created)

**Steps**:

1. Replace all setState calls with `checkout.*` from `useCheckoutState`
2. Keep only presentational JSX
3. Extract payment step component
4. Extract address step component

**Before**: 907 lines
**Expected After**: ~200 lines (UI only)

---

### 2. Admin Settings Page

**File**: `src/app/admin/settings/general/page.tsx`
**Current State**: Heavy (multiple tabs, form fields)
**Refactoring Tool**: `useFormState` + `useResourceListState`

**Key State to Extract**:

- Form data (basic, contact, social, maintenance tabs)
- Loading/saving states
- Tab selection
- Error handling

---

### 3. Admin Orders Page

**File**: `src/app/admin/orders/[id]/page.tsx`
**Current State**: Heavy (order details, status, shipment)
**Refactoring Tool**: `useResourceListState` + create `useOrderDetailState`

**Key State to Extract**:

- Order data loading
- Status update dialog state
- Shipment dialog state
- Form fields for each dialog

---

### 4. Admin Support Tickets

**File**: `src/app/admin/support-tickets/[id]/page.tsx`
**Current State**: Heavy (messages, replies, assignment)
**Refactoring Tool**: `useDialogState` + `useFormState`

**Key State to Extract**:

- Ticket data loading
- Reply message state
- Attachment state
- Assignment dialog
- Internal notes state

---

## Priority 2: Medium Impact (40-70% state logic)

### 5. Products Page

**File**: `src/app/products/page.tsx`
**Current State**: Medium (filters, pagination, view modes)
**Refactoring Tool**: `useFetchResourceList`

**Key State to Extract**:

- Products list
- Pagination state
- Filter state
- View mode (grid/list)
- Favorites state per product

---

### 6. User Orders Page

**File**: `src/app/user/orders/page.tsx`
**Current State**: Medium (list, filters, pagination)
**Refactoring Tool**: `useFetchResourceList`

**Key State to Extract**:

- Orders list
- Pagination
- Filter state (status, sort)
- Loading states

---

### 7. User Messages Page

**File**: `src/app/user/messages/page.tsx`
**Current State**: Medium (conversations, messages, search)
**Refactoring Tool**: `useResourceListState` + `useFormState`

**Key State to Extract**:

- Conversations list
- Selected conversation
- Messages for conversation
- New message form
- Search query

---

### 8. Seller Reviews Page

**File**: `src/app/seller/reviews/page.tsx`
**Current State**: Medium (reviews list, response dialog)
**Refactoring Tool**: `useFetchResourceList` + `useDialogState`

**Key State to Extract**:

- Reviews list
- Pagination
- Filters (product, rating, status)
- Response dialog state
- Response text field

---

### 9. Seller Orders Page

**File**: `src/app/seller/orders/[id]/page.tsx`
**Current State**: Medium (order details, actions)
**Refactoring Tool**: `useLoadingState` + `useDialogState`

**Key State to Extract**:

- Order loading state
- Fulfillment dialogs
- Tracking information
- Cancellation requests

---

## Priority 3: Low Impact (30-40% state logic)

### 10. Categories Page

**File**: `src/app/categories/page.tsx`
**Current State**: Light-Medium
**Refactoring Tool**: `useFetchResourceList`

---

### 11. Blog Page

**File**: `src/app/blog/page.tsx`
**Current State**: Light-Medium
**Refactoring Tool**: `useFetchResourceList`

---

### 12. Events Page

**File**: `src/app/events/[id]/page.tsx`
**Current State**: Light
**Refactoring Tool**: `useLoadingState` (already using)

---

## Refactoring Strategy

### Phase 1: Foundation (Complete ✅)

- ✅ Create core hooks (`useFormState`, `usePasswordFieldState`, etc.)
- ✅ Create `LoginRegisterContext`
- ✅ Refactor login/register pages
- ✅ Document patterns

### Phase 2: High Priority (Next)

1. Checkout page (biggest impact)
2. Admin settings
3. Admin orders
4. Admin support tickets

### Phase 3: Medium Priority

5-9: User and seller pages

### Phase 4: Low Priority

10-12: Content pages and special cases

---

## Refactoring Template

Use this template when refactoring a page:

```tsx
/**
 * PageName Component
 *
 * State Management:
 * - Form data: useFormState
 * - List data: useResourceListState or useFetchResourceList
 * - Dialog state: useDialogState
 * - Loading: useLoadingState
 *
 * Removes ~XX% boilerplate
 */

// 1. Get all state from hooks/context
const form = useFormState(...);
const list = useFetchResourceList(...);
const dialogs = useMultipleDialogs(['edit', 'delete']);

// 2. Only handle events + API calls
const handleSubmit = async (e) => { ... };
const handleApprove = async (id) => { ... };

// 3. Return UI only (pure presentational)
return (
  <div>
    {/* Use state from hooks */}
    <input value={form.formData.name} onChange={form.handleChange} />
    <table>
      {list.items.map(item => (...))}
    </table>
  </div>
);
```

---

## Metrics to Track

For each refactored page, record:

1. **Lines of Code**

   - Before: X lines
   - After: Y lines
   - Reduction: (X-Y)/X %

2. **Complexity**

   - useState calls: Before vs After
   - useCallback calls: Before vs After
   - useEffect calls: Before vs After

3. **Reusability**
   - Can this hook be reused elsewhere?
   - Are we following patterns?

---

## Example: Checkout Page Refactoring Plan

### Current Issues

- 907 total lines
- 30+ useState calls across component
- Complex address/payment logic mixed with UI
- Duplicate validation logic
- Hard to test

### Solution

1. Extract checkout state to `useCheckoutState` (already done ✅)
2. Create `<CheckoutAddressStep />` - uses checkout state
3. Create `<CheckoutPaymentStep />` - uses checkout state
4. Create `<CheckoutReviewStep />` - uses checkout state
5. Main page only orchestrates steps

### Expected Improvements

- From 907 → ~150 lines in main page
- 83% reduction in component code
- ~85% of logic testable in hook
- Easy to add/remove steps
- Easy to share with mobile app

---

## Questions Before Refactoring?

1. **Should I create a new context or use existing hook?**

   - Use context if: multiple pages need it, cross-cutting concern
   - Use hook if: single page logic, encapsulated behavior

2. **What if the page has custom logic?**

   - Create a custom hook that uses base hooks
   - Example: `useProductSearchFilters` uses `useFilters` + `useDebounce`

3. **How do I handle complex API calls?**

   - Use `useLoadingState` for async operations
   - Keep service calls separate from UI state

4. **Can I combine multiple hooks?**
   - Yes! Create a custom hook that combines them
   - Example: `useResourceListWithSearch` uses `useFetchResourceList` + `useDebounce`

---

## Success Criteria

A refactoring is complete when:

- ✅ Component is <200 lines
- ✅ No complex logic in JSX
- ✅ All state comes from hooks/context
- ✅ Form validation works
- ✅ API calls still work
- ✅ Error handling works
- ✅ Tests pass (if existing)
- ✅ Documented with comments
- ✅ Team reviewed code

---

## Resources

- `STATE-MANAGEMENT-REFACTORING.md` - Complete hook documentation
- `REFACTORING-EXAMPLES.md` - Before/after code examples
- `src/hooks/useFormState.ts` - Example of a well-documented hook
- `src/contexts/LoginRegisterContext.tsx` - Example of a well-documented context
