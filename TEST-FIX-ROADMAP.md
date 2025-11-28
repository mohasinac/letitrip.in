# Test Fix Roadmap - Complete Action Plan

**Current Status**: 5,571/5,657 passing (98.5%)  
**Remaining**: 86 tests (77 failing + 9 skipped)

---

## 📊 Test Suite Breakdown

| Suite                            | Status                              | Priority | Complexity | Session   |
| -------------------------------- | ----------------------------------- | -------- | ---------- | --------- |
| **useDebounce.test.ts**          | 17/20 passing, 1 failing, 2 skipped | HIGH     | LOW        | Session 1 |
| **admin/shops/page.test.tsx**    | 54/59 passing, 5 failing            | HIGH     | MEDIUM     | Session 2 |
| **admin/products/page.test.tsx** | 0/2 passing, 2 failing              | MEDIUM   | HIGH       | Session 3 |
| **admin/users/page.test.tsx**    | 0/2 passing, 2 failing              | MEDIUM   | HIGH       | Session 3 |
| **search/page.test.tsx**         | 6/14 passing, 8 failing             | MEDIUM   | HIGH       | Session 4 |
| **AuctionForm.test.tsx**         | 30/39 passing, 9 failing            | MEDIUM   | MEDIUM     | Session 5 |
| **auctions/page.test.tsx**       | 31/46 passing, 15 failing           | LOW      | HIGH       | Session 6 |
| **error.test.tsx**               | 4 skipped                           | LOW      | LOW        | Session 7 |
| **not-found.test.tsx**           | 2 skipped                           | LOW      | LOW        | Session 7 |
| **useMediaUpload.test.ts**       | 3 skipped                           | LOW      | MEDIUM     | Session 7 |

---

## 🎯 Session 1: useDebounce Hook (3 tests)

**Target**: Fix 1 failing + 2 skipped = 3 tests  
**Time Estimate**: 30 minutes  
**Difficulty**: ⭐ LOW

### Issues

- 1 test: Async timeout waiting for `loading` state
- 2 tests: Dependency changes and abort request logic

### Action Plan

1. ✅ Identify timeout issue in "should handle dependency changes"
2. ✅ Add longer timeout or fix mock timing
3. ✅ Unskip and fix "should abort previous request on new call"
4. ✅ Verify all 20/20 passing

### Success Criteria

- 20/20 tests passing
- No skipped tests in useDebounce

---

## 🎯 Session 2: admin/shops Checkbox (5 tests)

**Target**: Fix 5 failing tests  
**Time Estimate**: 1 hour  
**Difficulty**: ⭐⭐ MEDIUM

### Issues

- Select-all checkbox `onChange` not triggering with `userEvent.click()` or `fireEvent.click()`
- Individual checkboxes work fine
- Component state not updating

### Root Cause Analysis

```typescript
// Current issue in page.test.tsx line 379-500:
const selectAllCheckbox = within(thead).getByRole("checkbox");
fireEvent.click(selectAllCheckbox); // Doesn't trigger onChange
```

### Action Plan

1. ✅ Debug TableCheckbox component to understand event handling
2. ✅ Check if synthetic events are properly bubbling
3. ✅ Test with `act()` wrapper and state flush
4. ✅ If component bug: Fix TableCheckbox onChange binding
5. ✅ If test bug: Update test interaction pattern
6. ✅ Verify all 59/59 passing

### Failing Tests

1. "should select all shops on select-all click"
2. "should deselect all when clicking select-all again"
3. "should show bulk action bar when shops are selected"
4. "should perform verify action on selected shops"
5. "should perform delete action on selected shops"

---

## 🎯 Session 3: Admin Pages Mocking (4 tests)

**Target**: Fix admin/products (2) + admin/users (2) = 4 tests  
**Time Estimate**: 2 hours  
**Difficulty**: ⭐⭐⭐ HIGH

### Issues

- Requires 30+ component mocks
- Service pagination structure mismatch
- `authLoading` not in useAuth mock
- Icon imports need comprehensive mocking
- Form component dependencies

### Action Plan

#### admin/products/page.test.tsx

```typescript
// Current mocks needed:
- lucide-react (12+ icons)
- @/hooks/useDebounce
- @/hooks/useMobile
- @/components/seller/ViewToggle
- @/components/common/StatusBadge
- @/components/common/ConfirmDialog
- @/components/common/inline-edit (5 components)
- next/link (proper format)

// Service mock structure:
{
  data: [],
  pagination: {
    hasNextPage: false,
    total: 0
  }
}
```

1. ✅ Create comprehensive mock template
2. ✅ Apply to both admin/products and admin/users
3. ✅ Fix useAuth mock to include `authLoading: false`
4. ✅ Test loading → loaded state transition
5. ✅ Verify 2/2 products, 2/2 users passing

---

## 🎯 Session 4: Search Page (8 tests)

**Target**: Fix 8 failing tests  
**Time Estimate**: 2 hours  
**Difficulty**: ⭐⭐⭐ HIGH

### Issues

- Skeleton/Suspense fallback mocking
- Duplicate text elements ("Products (1)" appears in tab + heading)
- `getByRole("img")` expects images but Skeleton renders divs
- Multiple elements with same text causing ambiguous queries

### Failing Tests Pattern

```typescript
// Common error:
expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
// But Skeleton renders: <div className="h-64 bg-gray-200 rounded-lg" />
```

### Action Plan

1. ✅ Mock Skeleton component to render with role="img"
2. ✅ Use `getAllByText` instead of `getByText` for duplicate content
3. ✅ Add test IDs to disambiguate tab vs heading
4. ✅ Fix Suspense boundary mocking
5. ✅ Update queries to be more specific
6. ✅ Verify 14/14 passing

---

## 🎯 Session 5: AuctionForm Component (9 tests)

**Target**: Fix 9 failing tests  
**Time Estimate**: 1.5 hours  
**Difficulty**: ⭐⭐ MEDIUM

### Issues

- FormActions doesn't render submit button without `onSubmit` prop
- Form uses native `onSubmit={handleSubmit}` but FormActions needs callback
- Tests expect `required` attribute but component uses `aria-required`
- act() warnings from async slug validation

### Root Cause

```typescript
// AuctionForm.tsx line 305:
<FormActions
  onCancel={() => window.history.back()}
  submitLabel={mode === "create" ? "Create Auction" : "Save Changes"}
  // ❌ Missing: onSubmit={handleSubmit}
  isSubmitting={isSubmitting}
/>

// FormActions.tsx line 65:
{onSubmit && (  // ❌ Button only renders if onSubmit exists
  <Button type="submit">...
```

### Action Plan

1. ✅ Add `onSubmit={handleSubmit}` to FormActions call
2. ✅ Change form `onSubmit={(e) => e.preventDefault()}` to prevent double submit
3. ✅ Fix Input component to add `required` attribute (not just aria-required)
4. ✅ Wrap async operations in `act()` or add proper `waitFor`
5. ✅ Verify 39/39 passing

---

## 🎯 Session 6: Auctions Page (15 tests)

**Target**: Fix 15 failing tests  
**Time Estimate**: 3 hours  
**Difficulty**: ⭐⭐⭐ HIGH

### Issues

- Service mock returning "API Error"
- Mock structure doesn't match expected format
- Suspense fallback handling
- Complex filter state management

### Action Plan

1. ✅ Fix auctionsService.list mock structure
2. ✅ Add proper error handling mocks
3. ✅ Mock Suspense boundaries correctly
4. ✅ Fix filter state initialization
5. ✅ Test pagination with mocked data
6. ✅ Verify 46/46 passing

---

## 🎯 Session 7: Skipped Tests (11 tests)

**Target**: Fix all 11 skipped tests  
**Time Estimate**: 2 hours  
**Difficulty**: ⭐⭐ MEDIUM

### error.test.tsx (4 skipped)

**Issue**: Tests depend on `NODE_ENV === "development"`

```typescript
// error.tsx line 47:
{
  process.env.NODE_ENV === "development" && <div>Error details...</div>;
}
```

**Fix**: Mock `process.env.NODE_ENV` in tests

```typescript
beforeEach(() => {
  process.env.NODE_ENV = "development";
});
afterEach(() => {
  process.env.NODE_ENV = "test";
});
```

### not-found.test.tsx (2 skipped)

**Issue**: Same NODE_ENV dependency

**Fix**: Apply same process.env mock

### useMediaUpload.test.ts (3 skipped)

**Issue**: Complex async upload logic with file handling

**Fix Options**:

1. Mock FileReader API properly
2. Add proper async/await handling
3. Fix cleanup in upload cancellation

---

## 📈 Success Metrics

### Session Completion Tracking

- [x] Session 1: useDebounce (3 tests) → 5,571/5,657 ✅ COMPLETE
- [ ] Session 2: admin/shops (5 tests) → 5,576/5,657
- [ ] Session 3: admin pages (4 tests) → 5,580/5,657
- [ ] Session 4: search (8 tests) → 5,588/5,657
- [ ] Session 5: AuctionForm (9 tests) → 5,597/5,657
- [ ] Session 6: auctions/page (15 tests) → 5,612/5,657
- [ ] Session 7: skipped tests (11 tests) → 5,623/5,657

### Final Target

**5,657/5,657 (100%)** ✅

---

## 🔧 Technical Patterns & Solutions

### Pattern 1: Mock Structure for Services

```typescript
jest.mock("@/services/xxx.service", () => ({
  xxxService: {
    list: jest.fn().mockResolvedValue({
      data: [],
      pagination: {
        hasNextPage: false,
        total: 0,
      },
    }),
  },
}));
```

### Pattern 2: Comprehensive Icon Mocking

```typescript
jest.mock("lucide-react", () => ({
  Icon1: ({ className }: any) => (
    <div data-testid="icon1" className={className} />
  ),
  Icon2: ({ className }: any) => (
    <div data-testid="icon2" className={className} />
  ),
  // ... all icons used in component
}));
```

### Pattern 3: useAuth Complete Mock

```typescript
(useAuth as jest.Mock).mockReturnValue({
  user: { uid: "test-user" },
  isAdmin: true,
  authLoading: false, // ⚠️ Critical: Often missing
});
```

### Pattern 4: Next.js Link Proper Mock

```typescript
jest.mock("next/link", () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});
// NOT: jest.mock("next/link", () => ({ default: ... }))
```

### Pattern 5: Handling Duplicate Text Elements

```typescript
// ❌ Fails with duplicate text:
screen.getByText("Products (1)")

// ✅ Use getAllByText and select by index:
const elements = screen.getAllByText("Products (1)");
expect(elements[0]).toBeInTheDocument(); // tab
expect(elements[1]).toBeInTheDocument(); // heading

// ✅ Or add test IDs:
<button data-testid="products-tab">Products (1)</button>
<h2 data-testid="products-heading">Products (1)</h2>
```

---

## 🚧 Known Blockers & Workarounds

### Blocker 1: TableCheckbox Select-All

**Status**: BLOCKED  
**Workaround**: Mock TableCheckbox component in tests if component fix fails

```typescript
jest.mock("@/components/common/inline-edit", () => ({
  TableCheckbox: ({ checked, onChange }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => {
        // Force synchronous state update
        onChange?.(e.target.checked);
      }}
    />
  ),
}));
```

### Blocker 2: Async State Updates

**Solution**: Always use `waitFor` for async assertions

```typescript
await waitFor(
  () => {
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  },
  { timeout: 3000 }
);
```

### Blocker 3: FormActions Architecture

**Solution**: Ensure onSubmit callback is passed even when form has native onSubmit

```typescript
<FormActions
  onCancel={handleCancel}
  onSubmit={handleSubmit} // ⚠️ Required for button to render
  submitLabel="Submit"
/>
```

---

## 📝 Execution Notes

### Before Each Session

1. ✅ Run full test suite to get baseline
2. ✅ Verify current passing count
3. ✅ Read failing test file completely
4. ✅ Identify common patterns in failures

### During Session

1. ✅ Fix one test at a time
2. ✅ Run test after each fix to verify
3. ✅ Check for regressions in other tests
4. ✅ Document any new patterns discovered

### After Session

1. ✅ Run full test suite
2. ✅ Update this roadmap with actual results
3. ✅ Document any blockers for next session
4. ✅ Commit progress

---

## 🎓 Lessons Learned

### Mock Order Matters

```typescript
// ✅ Correct order:
jest.clearAllMocks(); // First
(useAuth as jest.Mock).mockReturnValue({ ... }); // Then re-apply
```

### Event Handling

```typescript
// ✅ For synthetic events:
fireEvent.click(element);

// ✅ For user interactions:
await userEvent.click(element);

// ✅ When state doesn't update, wrap in act():
await act(async () => {
  fireEvent.click(element);
});
```

### Component Mocking

```typescript
// ❌ Incomplete mock breaks component:
jest.mock("@/components/ui");

// ✅ Mock specific exports:
jest.mock("@/components/ui", () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}));
```

---

## 📊 Progress Dashboard

**Last Updated**: Session 1 Complete  
**Next Session**: Session 2 - admin/shops  
**Estimated Completion**: 6 sessions remaining

## Session 1 Completion Report

**Date**: November 28, 2025  
**Target**: Fix useDebounce hook tests (1 failing + 2 skipped = 3 tests)  
**Result**: ✅ **SUCCESS** - All 3 tests now passing (20/20 in suite)

### Issues Fixed

1. **"should debounce API calls"** - Fixed by using real timers for useApi tests and fixing `mountedRef` bug
2. **"should handle dependency changes"** - Unskipped and fixed with proper `waitFor` usage
3. **"should abort previous request on new call"** - Unskipped and fixed with manual promise resolution

### Root Cause

The main issue was in `useDebounce.ts` line 155-167. The `useEffect` cleanup function was setting `mountedRef.current = false` when dependencies changed, but the new effect didn't reset it to `true`. This caused API responses to be ignored because the mounted check failed.

**Fix**: Added `mountedRef.current = true` at the start of the useEffect to reset the flag when the effect runs.

### Test Changes

- Added `beforeEach(() => jest.useRealTimers())` to useApi describe block
- Removed fake timer usage from async tests
- Used `waitFor` for all async assertions instead of manual promise flushing

### Impact

- **Before**: 5,568/5,657 passing (98.4%)
- **After**: 5,571/5,657 passing (98.5%)
- **Tests Fixed**: 3
- **New Passing Rate**: 98.5%

| Metric              | Current | Target  | Progress |
| ------------------- | ------- | ------- | -------- |
| Total Passing       | 5,571   | 5,657   | 98.5%    |
| Failing Tests       | 77      | 0       | -        |
| Skipped Tests       | 9       | 0       | -        |
| Test Suites Passing | 214/222 | 222/222 | 96.4%    |

---

## 🔄 Quick Reference Commands

```powershell
# Run all tests
npm test

# Run specific suite
npm test -- src/path/to/test.tsx --no-coverage

# Get test summary
npm test 2>&1 | Select-String "Tests:" | Select-Object -Last 1

# Check specific failures
npm test -- src/path/to/test.tsx --no-coverage 2>&1 | Select-Object -Last 50
```

---

**End of Roadmap**
