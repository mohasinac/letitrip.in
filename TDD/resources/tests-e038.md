# Test Documentation - Priority Checklist (E038)

> **Epic**: E038 - Priority Checklist Completion  
> **Created**: December 5, 2025  
> **Total Test Suites**: 5  
> **Total Tests**: 35+

---

## Overview

This document catalogs all test suites created during Epic E038, covering critical components, hooks, and features.

---

## Test Suites

### 1. Theming Tests

**File**: `src/__tests__/theming.test.tsx`  
**Purpose**: Test dark mode functionality  
**Tests**: 6

#### Test Cases

**TC-001: Theme Toggle**

```typescript
it("should toggle dark mode on and off", () => {
  // Given light mode
  // When toggle clicked
  // Then dark mode enabled
  // And 'dark' class added to document
});
```

**TC-002: Theme Persistence**

```typescript
it("should persist theme preference to localStorage", () => {
  // Given dark mode enabled
  // When page reloads
  // Then dark mode still enabled
  // And localStorage contains 'dark'
});
```

**TC-003: System Preference**

```typescript
it("should respect system dark mode preference", () => {
  // Given system dark mode enabled
  // When app loads
  // Then dark mode auto-enabled
});
```

**TC-004: Dark Mode Classes**

```typescript
it("should apply dark mode classes to elements", () => {
  // Given dark mode enabled
  // When component renders
  // Then elements have dark:bg-gray-800, dark:text-white
});
```

**TC-005: Theme Toggle Animation**

```typescript
it("should animate theme transition smoothly", () => {
  // Given theme toggle
  // When clicked
  // Then transition smooth (no flash)
});
```

**TC-006: Theme Provider Context**

```typescript
it("should provide theme context to all children", () => {
  // Given ThemeProvider wraps app
  // When component accesses useTheme()
  // Then theme state available
});
```

---

### 2. AdminResourcePage Tests

**File**: `src/__tests__/components/AdminResourcePage.test.tsx`  
**Purpose**: Test admin list page wrapper  
**Tests**: 8

#### Test Cases

**TC-007: Initial Load**

```typescript
it("should load resources from API on mount", async () => {
  render(<AdminResourcePage collection="users" />);
  await waitFor(() => {
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});
```

**TC-008: Search Functionality**

```typescript
it("should filter results based on search query", async () => {
  render(<AdminResourcePage collection="users" searchFields={["name"]} />);
  const searchInput = screen.getByPlaceholderText("Search...");
  fireEvent.change(searchInput, { target: { value: "John" } });

  await waitFor(() => {
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
  });
});
```

**TC-009: Pagination**

```typescript
it("should navigate pages correctly", async () => {
  render(<AdminResourcePage collection="users" />);

  const nextButton = screen.getByLabelText("Next page");
  fireEvent.click(nextButton);

  await waitFor(() => {
    expect(window.location.search).toContain("page=2");
  });
});
```

**TC-010: Bulk Actions**

```typescript
it("should perform bulk actions on selected items", async () => {
  render(<AdminResourcePage collection="users" bulkActions={bulkActions} />);

  // Select items
  const checkboxes = screen.getAllByRole("checkbox");
  fireEvent.click(checkboxes[0]);
  fireEvent.click(checkboxes[1]);

  // Perform action
  const activateButton = screen.getByText("Activate");
  fireEvent.click(activateButton);

  await waitFor(() => {
    expect(mockBulkAction).toHaveBeenCalledWith(["user1", "user2"]);
  });
});
```

**TC-011: View Toggle**

```typescript
it("should toggle between table and grid view", () => {
  render(<AdminResourcePage collection="users" />);

  const gridViewButton = screen.getByLabelText("Grid view");
  fireEvent.click(gridViewButton);

  expect(screen.getByTestId("grid-view")).toBeInTheDocument();
  expect(localStorage.getItem("adminResourceView")).toBe("grid");
});
```

**TC-012: Filters**

```typescript
it("should apply filters correctly", async () => {
  render(<AdminResourcePage collection="users" filters={userFilters} />);

  const roleFilter = screen.getByLabelText("Role");
  fireEvent.change(roleFilter, { target: { value: "seller" } });

  await waitFor(() => {
    expect(mockApi).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: { role: "seller" },
      })
    );
  });
});
```

**TC-013: Export**

```typescript
it("should export data to CSV", async () => {
  render(<AdminResourcePage collection="users" exportEnabled />);

  const exportButton = screen.getByText("Export");
  fireEvent.click(exportButton);

  await waitFor(() => {
    expect(mockExport).toHaveBeenCalled();
  });
});
```

**TC-014: Error Handling**

```typescript
it("should display error message on API failure", async () => {
  mockApi.mockRejectedValue(new Error("Network error"));

  render(<AdminResourcePage collection="users" />);

  await waitFor(() => {
    expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
  });
});
```

---

### 3. SellerResourcePage Tests

**File**: `src/__tests__/components/SellerResourcePage.test.tsx`  
**Purpose**: Test seller list page wrapper  
**Tests**: 8

#### Test Cases

**TC-015: Seller Filter**

```typescript
it("should only show seller's own resources", async () => {
  const sellerId = "seller123";
  render(<SellerResourcePage collection="products" sellerId={sellerId} />);

  await waitFor(() => {
    expect(mockApi).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: { sellerId },
      })
    );
  });
});
```

**TC-016-022**: Same as AdminResourcePage tests (search, pagination, bulk actions, view toggle, filters, export, error handling)

---

### 4. SearchableDropdown Tests

**File**: `src/__tests__/components/SearchableDropdown.test.tsx`  
**Purpose**: Test searchable dropdown component  
**Tests**: 7

#### Test Cases

**TC-023: Search Input**

```typescript
it("should filter options based on search query", () => {
  render(<SearchableDropdown options={options} onSelect={onSelect} />);

  const searchInput = screen.getByPlaceholderText("Search...");
  fireEvent.change(searchInput, { target: { value: "Option 1" } });

  expect(screen.getByText("Option 1")).toBeInTheDocument();
  expect(screen.queryByText("Option 2")).not.toBeInTheDocument();
});
```

**TC-024: Select Option**

```typescript
it("should call onSelect when option clicked", () => {
  render(<SearchableDropdown options={options} onSelect={onSelect} />);

  const option = screen.getByText("Option 1");
  fireEvent.click(option);

  expect(onSelect).toHaveBeenCalledWith(options[0]);
});
```

**TC-025: Keyboard Navigation**

```typescript
it("should navigate options with arrow keys", () => {
  render(<SearchableDropdown options={options} onSelect={onSelect} />);

  const dropdown = screen.getByRole("combobox");
  fireEvent.keyDown(dropdown, { key: "ArrowDown" });

  expect(screen.getByText("Option 1")).toHaveClass("highlighted");
});
```

**TC-026: Multi-Select**

```typescript
it("should allow selecting multiple options", () => {
  render(<SearchableDropdown options={options} multi onSelect={onSelect} />);

  fireEvent.click(screen.getByText("Option 1"));
  fireEvent.click(screen.getByText("Option 2"));

  expect(onSelect).toHaveBeenCalledWith([options[0], options[1]]);
});
```

**TC-027: Create New Option**

```typescript
it('should show "Create New" option when enabled', () => {
  render(
    <SearchableDropdown options={options} createNew onSelect={onSelect} />
  );

  expect(screen.getByText("Create New")).toBeInTheDocument();
});
```

**TC-028: Loading State**

```typescript
it("should show loading spinner when loading", () => {
  render(<SearchableDropdown options={[]} loading onSelect={onSelect} />);

  expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
});
```

**TC-029: Empty State**

```typescript
it("should show empty message when no options", () => {
  render(<SearchableDropdown options={[]} onSelect={onSelect} />);

  expect(screen.getByText("No options available")).toBeInTheDocument();
});
```

---

### 5. UnifiedFilterSidebar Tests

**File**: `src/__tests__/components/UnifiedFilterSidebar.test.tsx`  
**Purpose**: Test unified filter sidebar  
**Tests**: 6

#### Test Cases

**TC-030: Filter Sections**

```typescript
it("should render all filter sections", () => {
  render(<UnifiedFilterSidebar filters={filters} onFilterChange={onChange} />);

  expect(screen.getByText("Price Range")).toBeInTheDocument();
  expect(screen.getByText("Category")).toBeInTheDocument();
  expect(screen.getByText("Status")).toBeInTheDocument();
});
```

**TC-031: Price Range Filter**

```typescript
it("should update price range on slider change", () => {
  render(<UnifiedFilterSidebar filters={filters} onFilterChange={onChange} />);

  const minSlider = screen.getByLabelText("Min price");
  fireEvent.change(minSlider, { target: { value: 100 } });

  expect(onChange).toHaveBeenCalledWith(
    expect.objectContaining({
      priceRange: { min: 100, max: expect.any(Number) },
    })
  );
});
```

**TC-032: Category Filter**

```typescript
it("should select category from tree", () => {
  render(<UnifiedFilterSidebar filters={filters} onFilterChange={onChange} />);

  const categoryCheckbox = screen.getByLabelText("Electronics");
  fireEvent.click(categoryCheckbox);

  expect(onChange).toHaveBeenCalledWith(
    expect.objectContaining({
      categories: ["electronics"],
    })
  );
});
```

**TC-033: Clear Filters**

```typescript
it("should clear all filters", () => {
  render(<UnifiedFilterSidebar filters={filters} onFilterChange={onChange} />);

  const clearButton = screen.getByText("Clear All");
  fireEvent.click(clearButton);

  expect(onChange).toHaveBeenCalledWith({});
});
```

**TC-034: Mobile Overlay**

```typescript
it("should show as overlay on mobile", () => {
  window.innerWidth = 375; // Mobile width
  render(<UnifiedFilterSidebar filters={filters} onFilterChange={onChange} />);

  expect(screen.getByTestId("filter-overlay")).toHaveClass("fixed");
});
```

**TC-035: Dark Mode**

```typescript
it("should apply dark mode classes", () => {
  document.documentElement.classList.add("dark");
  render(<UnifiedFilterSidebar filters={filters} onFilterChange={onChange} />);

  const sidebar = screen.getByTestId("filter-sidebar");
  expect(sidebar).toHaveClass("dark:bg-gray-800");
});
```

---

## Integration Tests

### User Verification Flow

**Test Suite**: `src/__tests__/integration/user-verification.test.tsx`  
**Status**: TODO

#### Test Cases

**TC-036: Email Verification Flow**

```typescript
it("should complete email verification flow", async () => {
  // 1. User triggers verification
  // 2. OTP sent to email
  // 3. User enters OTP
  // 4. OTP verified
  // 5. emailVerified set to true
});
```

**TC-037: Phone Verification Flow**

```typescript
it("should complete phone verification flow", async () => {
  // Similar to email verification
});
```

**TC-038: Verification Gate - Checkout**

```typescript
it("should block unverified user from checkout", async () => {
  // 1. Unverified user clicks "Checkout"
  // 2. VerificationGate blocks
  // 3. Verification modal shown
  // 4. User verifies email/phone
  // 5. Checkout proceeds
});
```

---

### Events System Flow

**Test Suite**: `src/__tests__/integration/events-system.test.tsx`  
**Status**: TODO

#### Test Cases

**TC-039: Create Event**

```typescript
it("should create event as admin", async () => {
  // 1. Admin navigates to /admin/events
  // 2. Clicks "Create Event"
  // 3. Fills EventForm
  // 4. Submits
  // 5. Event created in database
  // 6. Appears in public events list
});
```

**TC-040: Register for Event**

```typescript
it("should register user for event", async () => {
  // 1. User navigates to /events/[slug]
  // 2. Clicks "Register"
  // 3. Registration API called
  // 4. User added to event registrations
  // 5. Confirmation shown
});
```

**TC-041: Event Capacity**

```typescript
it("should prevent registration when event full", async () => {
  // 1. Event has max capacity 10
  // 2. 10 users registered
  // 3. 11th user tries to register
  // 4. Error "Event full"
});
```

---

### URL Filtering Flow

**Test Suite**: `src/__tests__/integration/url-filtering.test.tsx`  
**Status**: TODO

#### Test Cases

**TC-042: URL Params Persist**

```typescript
it("should persist filters in URL on page reload", async () => {
  // 1. Navigate to /products
  // 2. Apply category filter (Electronics)
  // 3. URL updates to /products?category=electronics
  // 4. Reload page
  // 5. Filter still applied
});
```

**TC-043: Shareable URL**

```typescript
it("should apply filters from shared URL", async () => {
  // 1. Navigate to /products?category=electronics&minPrice=1000
  // 2. Filters applied from URL
  // 3. Products filtered correctly
});
```

---

## E2E Tests

### Complete User Journey

**Test Suite**: `src/__tests__/e2e/complete-user-journey.test.tsx`  
**Status**: TODO

#### Test Cases

**TC-044: Complete Purchase Flow**

```typescript
it("should complete purchase from browse to checkout", async () => {
  // 1. Browse products
  // 2. Filter by category
  // 3. Add to cart
  // 4. Verify email/phone (if not verified)
  // 5. Checkout
  // 6. Select address
  // 7. Apply coupon
  // 8. Select payment method
  // 9. Complete payment
  // 10. Order confirmation
});
```

**TC-045: Complete Auction Flow**

```typescript
it("should complete auction from browse to bid", async () => {
  // 1. Browse auctions
  // 2. Filter by category
  // 3. View auction detail
  // 4. Verify email/phone (if not verified)
  // 5. Place bid
  // 6. Bid confirmation
});
```

---

## Performance Tests

### Page Load Performance

**Test Suite**: `src/__tests__/performance/page-load.test.tsx`  
**Status**: TODO

#### Test Cases

**TC-046: Admin Users Page Load**

```typescript
it("should load admin users page in < 3s", async () => {
  const startTime = performance.now();

  render(<AdminUsersPage />);

  await waitFor(() => {
    expect(screen.getByText("Users")).toBeInTheDocument();
  });

  const loadTime = performance.now() - startTime;
  expect(loadTime).toBeLessThan(3000);
});
```

---

## Test Coverage Summary

| Component/Feature     | Test Suite                 | Tests  | Status    |
| --------------------- | -------------------------- | ------ | --------- |
| Theming               | theming.test.tsx           | 6      | ✅        |
| AdminResourcePage     | AdminResourcePage.test     | 8      | ✅        |
| SellerResourcePage    | SellerResourcePage.test    | 8      | ✅        |
| SearchableDropdown    | SearchableDropdown.test    | 7      | ✅        |
| UnifiedFilterSidebar  | UnifiedFilterSidebar.test  | 6      | ✅        |
| User Verification     | user-verification.test     | 3      | TODO      |
| Events System         | events-system.test         | 3      | TODO      |
| URL Filtering         | url-filtering.test         | 2      | TODO      |
| Complete User Journey | complete-user-journey.test | 2      | TODO      |
| Performance           | page-load.test             | 1      | TODO      |
| **TOTAL**             |                            | **46** | **35 ✅** |

---

## Running Tests

### All Tests

```bash
npm test
```

### Specific Test Suite

```bash
npm test theming.test.tsx
npm test AdminResourcePage.test.tsx
```

### Watch Mode

```bash
npm test -- --watch
```

### Coverage Report

```bash
npm test -- --coverage
```

---

## Test Configuration

**Framework**: Jest + React Testing Library  
**Config File**: `jest.config.js`  
**Setup File**: `jest.setup.js`

**Key Settings**:

- TypeScript support via ts-jest
- React Testing Library auto-cleanup
- Mock service workers for API mocking
- Coverage threshold: 80%

---

**Document Status**: ✅ Complete (35 tests) + TODO (11 tests)  
**Last Updated**: December 5, 2025  
**Next Review**: After integration/E2E tests added
