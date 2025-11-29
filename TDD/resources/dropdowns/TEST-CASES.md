# Searchable Dropdowns Test Cases

## E031: Searchable Dropdowns

### Unit Tests

#### TC-DROPDOWN-001: Search Functionality

```typescript
describe("Dropdown Search", () => {
  it.todo("should filter options as user types");
  it.todo("should be case-insensitive");
  it.todo("should highlight matching text");
  it.todo('should show "No results" when nothing matches');
  it.todo("should clear search on selection (single mode)");
  it.todo("should retain search while selecting (multi mode)");
  it.todo("should debounce search for async mode");
});
```

#### TC-DROPDOWN-002: Single Select Mode

```typescript
describe("Single Select", () => {
  it.todo("should select one option");
  it.todo("should replace previous selection");
  it.todo("should close dropdown on selection");
  it.todo("should show selected value in trigger");
  it.todo("should clear selection when clearable");
});
```

#### TC-DROPDOWN-003: Multi Select Mode

```typescript
describe("Multi Select", () => {
  it.todo("should select multiple options");
  it.todo("should show chips for selected items");
  it.todo("should remove chip when × clicked");
  it.todo('should have "Clear All" button');
  it.todo("should keep dropdown open while selecting");
  it.todo("should check/uncheck items in list");
});
```

#### TC-DROPDOWN-004: Keyboard Navigation

```typescript
describe("Keyboard Navigation", () => {
  it.todo("should open with Enter/Space");
  it.todo("should navigate with Arrow keys");
  it.todo("should select with Enter");
  it.todo("should close with Escape");
  it.todo("should support type-ahead");
  it.todo("should remove last chip with Backspace (multi)");
  it.todo("should handle Tab focus management");
});
```

### Component Tests

#### TC-DROPDOWN-005: DropdownTrigger Component

```typescript
describe("DropdownTrigger Component", () => {
  it.todo("should display placeholder when empty");
  it.todo("should display selected value (single)");
  it.todo("should display chip count (multi)");
  it.todo("should show dropdown arrow");
  it.todo("should show clear button when clearable");
  it.todo("should handle disabled state");
  it.todo("should show loading spinner when loading");
});
```

#### TC-DROPDOWN-006: SelectedChips Component

```typescript
describe("SelectedChips Component", () => {
  it.todo("should render chips for each selection");
  it.todo("should have × button on each chip");
  it.todo("should emit remove event on × click");
  it.todo('should have "Clear All" button');
  it.todo("should wrap to multiple lines");
  it.todo("should be touch-friendly (44px targets)");
});
```

#### TC-DROPDOWN-007: DropdownOption Component

```typescript
describe("DropdownOption Component", () => {
  it.todo("should display option label");
  it.todo("should display description if provided");
  it.todo("should display icon if provided");
  it.todo("should show check mark when selected");
  it.todo("should highlight search match");
  it.todo("should handle disabled state");
  it.todo("should handle hover/focus state");
});
```

#### TC-DROPDOWN-008: DropdownGroup Component

```typescript
describe("DropdownGroup Component", () => {
  it.todo("should display group header");
  it.todo("should make header sticky while scrolling");
  it.todo("should show item count in header");
  it.todo("should support collapsible groups");
});
```

#### TC-DROPDOWN-009: CreateOption Component

```typescript
describe("CreateOption Component", () => {
  it.todo("should appear when no match and creatable");
  it.todo('should show "Create [value]" text');
  it.todo("should emit create event on click");
  it.todo("should validate before create");
});
```

### Integration Tests

#### TC-DROPDOWN-010: Async Search

```typescript
describe("Async Search", () => {
  it.todo("should call onSearch after debounce");
  it.todo("should show loading during fetch");
  it.todo("should display fetched options");
  it.todo("should handle fetch errors");
  it.todo("should cache recent results");
});
```

#### TC-DROPDOWN-011: Form Integration

```typescript
describe("Form Integration", () => {
  it.todo("should work with react-hook-form");
  it.todo("should trigger onChange with value");
  it.todo("should show error state");
  it.todo("should validate required");
  it.todo("should reset value");
});
```

### E2E Tests

#### TC-DROPDOWN-012: Category Filter Dropdown

```typescript
describe("Category Filter E2E", () => {
  it.todo("should open category dropdown");
  it.todo("should search for category");
  it.todo("should select multiple categories");
  it.todo("should show selected as chips");
  it.todo("should filter products on apply");
  it.todo("should clear all selections");
});
```

#### TC-DROPDOWN-013: Address Selector Dropdown

```typescript
describe("Address Selector E2E", () => {
  it.todo("should show saved addresses");
  it.todo("should search addresses");
  it.todo("should select address");
  it.todo("should use selected in checkout");
});
```

#### TC-DROPDOWN-014: Product Form Category

```typescript
describe("Product Form Category E2E", () => {
  it.todo("should open category selector");
  it.todo("should search categories");
  it.todo("should select category");
  it.todo("should show in form");
  it.todo("should save with product");
});
```

### Mobile Tests

#### TC-DROPDOWN-015: Mobile Bottom Sheet Mode

```typescript
describe("Mobile Bottom Sheet", () => {
  it.todo("should open as bottom sheet on mobile");
  it.todo("should have full-width search");
  it.todo("should have 48px option rows");
  it.todo("should support swipe to dismiss");
  it.todo("should have sticky chips at top");
  it.todo("should support virtual scrolling");
});
```

#### TC-DROPDOWN-016: Touch Interactions

```typescript
describe("Touch Interactions", () => {
  it.todo("should have 44px touch targets");
  it.todo("should have adequate chip spacing");
  it.todo("should support scroll momentum");
});
```

### Accessibility Tests

#### TC-DROPDOWN-017: Accessibility

```typescript
describe("Accessibility", () => {
  it.todo("should have proper ARIA attributes");
  it.todo("should announce option count");
  it.todo("should announce selection changes");
  it.todo("should have proper focus management");
  it.todo("should work with screen readers");
});
```

### Performance Tests

#### TC-DROPDOWN-018: Performance

```typescript
describe("Performance", () => {
  it.todo("should filter 1000 options in < 100ms");
  it.todo("should render 1000 options with virtual scroll");
  it.todo("should not lag during search");
  it.todo("should efficiently update chips");
});
```
