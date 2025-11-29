# Epic E031: Searchable Dropdowns

## Overview

Implement a reusable searchable dropdown component that replaces all standard select elements throughout the application. This component provides search/filter functionality, multi-select support, selected item chips with remove capability, and a "Clear All" button. Must be integrated across the entire codebase for categories, filters, shops, addresses, and all other dropdown selections.

## Scope

- Create SearchableDropdown component with all features
- Replace all existing select/dropdown usages
- Support single and multi-select modes
- Implement keyboard navigation and accessibility
- Mobile-optimized with touch support
- Integration with forms and filters across the app

---

## Component Specifications

### SearchableDropdown Props

```typescript
interface SearchableDropdownProps<T> {
  // Data
  options: DropdownOption<T>[];
  value: T | T[] | null;
  onChange: (value: T | T[] | null) => void;

  // Configuration
  mode: "single" | "multi";
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;

  // Display
  displayKey?: keyof T | ((item: T) => string);
  valueKey?: keyof T;
  groupBy?: keyof T;

  // Features
  searchable?: boolean; // Enable search (default: true)
  clearable?: boolean; // Show clear button (default: true)
  creatable?: boolean; // Allow creating new options
  loading?: boolean; // Show loading state
  disabled?: boolean;
  error?: string;

  // Async
  onSearch?: (query: string) => Promise<DropdownOption<T>[]>;
  debounceMs?: number; // Search debounce (default: 300)

  // Styling
  className?: string;
  maxHeight?: number; // Dropdown max height
  chipVariant?: "default" | "outline" | "filled";
}

interface DropdownOption<T> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  group?: string;
}
```

---

## Features

### F031.1: Core Searchable Dropdown

**Priority**: P0 (Critical)

Create the base searchable dropdown component.

#### User Stories

**US031.1.1**: Search Within Options

```
As a user selecting from a dropdown
I want to type to filter options
So that I can quickly find what I need

Acceptance Criteria:
- Search input at top of dropdown
- Options filter as user types
- Case-insensitive search
- Highlights matching text in options
- Shows "No results" when nothing matches
- Clears search on selection (single mode)
- Retains search while selecting (multi mode)
```

**US031.1.2**: Multi-Select with Chips

```
As a user selecting multiple items
I want selected items shown as chips
So that I can see and manage my selections

Acceptance Criteria:
- Selected items appear as chips above dropdown
- Each chip has an "×" button to remove
- Chips are touch-friendly (min 32px height)
- Chips wrap to multiple lines if needed
- Selected items are checked in dropdown list
- Can click checked item to deselect
```

**US031.1.3**: Clear All Button

```
As a user with multiple selections
I want a "Clear All" button
So that I can reset my selections quickly

Acceptance Criteria:
- "Clear All" button appears when items selected
- Clears all selections on click
- Only visible in multi-select mode (or single with clearable)
- Positioned prominently (right side or end of chips)
- Has confirmation for >5 items (optional setting)
```

**US031.1.4**: Keyboard Navigation

```
As a user navigating with keyboard
I want full keyboard support
So that I can use without mouse

Acceptance Criteria:
- Tab focuses the dropdown trigger
- Enter/Space opens dropdown
- Arrow keys navigate options
- Enter selects highlighted option
- Escape closes dropdown
- Type-ahead focuses matching option
- Backspace removes last chip (multi mode)
```

---

### F031.2: Advanced Features

**Priority**: P1 (High)

#### User Stories

**US031.2.1**: Grouped Options

```
As a user viewing many options
I want options grouped by category
So that I can find items faster

Acceptance Criteria:
- Options can be grouped by a property
- Group headers are sticky while scrolling
- Group headers are not selectable
- Collapsible groups (optional)
- Shows count per group (optional)
```

**US031.2.2**: Async Search

```
As a user searching for options
I want server-side search
So that I can search large datasets

Acceptance Criteria:
- Calls onSearch when user types
- Debounces API calls (300ms default)
- Shows loading spinner during fetch
- Handles errors gracefully
- Caches recent results
- Supports minimum characters before search
```

**US031.2.3**: Create New Option

```
As a user who can't find their option
I want to create a new one
So that I can add custom values

Acceptance Criteria:
- "Create [value]" option at bottom when no match
- Triggers onCreate callback
- Can be enabled/disabled per instance
- Validation before creation
- Works with async creation
```

---

### F031.3: Integration Points

**Priority**: P0 (Critical)

Replace all existing dropdowns with SearchableDropdown.

#### Integration Locations

| Location          | Component             | Mode   | Options                      |
| ----------------- | --------------------- | ------ | ---------------------------- |
| Category Filter   | Product/Auction pages | multi  | Categories tree              |
| Shop Filter       | Search results        | multi  | Shops list                   |
| Address Selector  | Checkout, Forms       | single | User addresses               |
| Country Selector  | Address forms         | single | Countries list               |
| State Selector    | Address forms         | single | States (filtered by country) |
| City Selector     | Address forms         | single | Cities (filtered by state)   |
| Category Selector | Product form          | single | Categories tree              |
| Tag Input         | Product/Blog forms    | multi  | Tags (creatable)             |
| Assignee Selector | Admin tickets         | single | Admin users                  |
| Status Filter     | Admin tables          | multi  | Status options               |
| Role Filter       | Admin users           | multi  | User roles                   |
| Payment Method    | Checkout              | single | Payment methods              |
| Shipping Option   | Checkout              | single | Shipping options             |
| Coupon Selector   | Checkout              | single | Available coupons            |
| Return Reason     | Return form           | single | Reason options               |
| Report Period     | Analytics             | single | Date ranges                  |
| Sort By           | All lists             | single | Sort options                 |

---

### F031.4: Mobile Optimization

**Priority**: P1 (High)

Ensure dropdown works well on mobile devices.

#### User Stories

**US031.4.1**: Mobile Bottom Sheet Mode

```
As a mobile user
I want dropdown as a bottom sheet
So that it's easier to use on small screens

Acceptance Criteria:
- Opens as MobileBottomSheet on mobile
- Full-width search input
- Touch-friendly option rows (48px height)
- Swipe down to dismiss
- Sticky selected chips at top
- Virtual scrolling for long lists
```

**US031.4.2**: Touch-Friendly Chips

```
As a mobile user removing selections
I want large touch targets
So that I can accurately tap remove buttons

Acceptance Criteria:
- Chips are minimum 44px touch target
- Remove button is at least 44×44px
- Adequate spacing between chips
- Clear All button is prominent
```

---

## Component Hierarchy

```
components/ui/
├── SearchableDropdown/
│   ├── index.ts
│   ├── SearchableDropdown.tsx        # Main component
│   ├── DropdownTrigger.tsx           # Trigger button
│   ├── DropdownMenu.tsx              # Options container
│   ├── DropdownOption.tsx            # Single option
│   ├── DropdownGroup.tsx             # Group header
│   ├── SelectedChips.tsx             # Multi-select chips
│   ├── SearchInput.tsx               # Search input
│   ├── CreateOption.tsx              # Create new option
│   ├── useSearchableDropdown.ts      # Hook for state
│   └── SearchableDropdown.test.tsx   # Tests
```

---

## Implementation Checklist

### Phase 1: Core Component (Week 1)

- [ ] Create SearchableDropdown component
- [ ] Implement single-select mode
- [ ] Implement multi-select mode
- [ ] Add search/filter functionality
- [ ] Add selected chips display
- [ ] Add clear/remove functionality
- [ ] Keyboard navigation
- [ ] Basic styling

### Phase 2: Advanced Features (Week 1-2)

- [ ] Grouped options support
- [ ] Async search/load
- [ ] Create new option
- [ ] Loading states
- [ ] Error states
- [ ] Virtual scrolling for large lists

### Phase 3: Mobile Optimization (Week 2)

- [ ] Mobile bottom sheet mode
- [ ] Touch-friendly sizing
- [ ] Mobile keyboard handling
- [ ] Performance optimization

### Phase 4: Integration (Week 2-3)

- [ ] Replace category filter dropdowns
- [ ] Replace shop filter dropdowns
- [ ] Replace address selectors
- [ ] Replace product form selectors
- [ ] Replace admin table filters
- [ ] Replace checkout selectors
- [ ] Replace all remaining dropdowns

### Phase 5: Testing (Week 3)

- [ ] Unit tests for component
- [ ] Integration tests
- [ ] Accessibility tests
- [ ] Mobile tests
- [ ] Performance tests

---

## Acceptance Criteria

- [ ] All select elements replaced with SearchableDropdown
- [ ] Search functionality works in all instances
- [ ] Multi-select shows chips with remove buttons
- [ ] Clear All button works in multi-select mode
- [ ] Keyboard navigation fully functional
- [ ] Mobile bottom sheet mode works
- [ ] No accessibility regressions
- [ ] Performance acceptable (< 100ms filter time)
- [ ] Consistent styling across all usages

---

## Dependencies

- E024: Mobile PWA Experience (MobileBottomSheet)
- E027: Design System (styling tokens)

## Related Epics

- E015: Search & Discovery
- E029: Smart Address System
- E025: Mobile Component Integration

---

## Test Documentation

**Test Cases**: `TDD/resources/dropdowns/TEST-CASES.md`
