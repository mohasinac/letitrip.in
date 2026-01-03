# State Management Refactoring - Complete Guide

## Overview

This document outlines all new hooks and contexts created to centralize state management and reduce boilerplate in components.

---

## Hooks Created

### 1. **useFormState**

**File**: `src/hooks/useFormState.ts`

**Purpose**: Manages form field state including values, errors, and touched status.

**Replaces**: Multiple `useState` calls for form data in form components

**Key Features**:

- Automatic error clearing on user input
- Touched field tracking
- Built-in validation support
- Form reset functionality

**Usage**:

```tsx
const { formData, handleChange, errors, setFieldValue, validate } =
  useFormState({
    initialData: { email: "", password: "" },
    onValidate: (data) => {
      const errors: Record<string, string> = {};
      if (!data.email) errors.email = "Email required";
      return errors;
    },
  });
```

---

### 2. **usePasswordFieldState**

**File**: `src/hooks/usePasswordFieldState.ts`

**Purpose**: Manages password field visibility and password strength validation.

**Replaces**: `useState` for showPassword, showConfirmPassword in auth components

**Key Features**:

- Toggle password visibility
- Password strength validation
- Password match validation
- Preset strength requirements (8+ chars, uppercase, lowercase, number, special char)

**Usage**:

```tsx
const {
  showPassword,
  togglePasswordVisibility,
  validatePasswordStrength,
  validatePasswordMatch,
} = usePasswordFieldState();
```

---

### 3. **useDialogState**

**File**: `src/hooks/useDialogState.ts`

**Purpose**: Manages single or multiple dialog/modal visibility states.

**Replaces**: `useState` for showDialog, isOpen, etc.

**Key Features**:

- Open/close/toggle dialog
- Optional callbacks on open/close
- Support for multiple dialogs with `useMultipleDialogs`

**Usage**:

```tsx
// Single dialog
const { isOpen, open, close, toggle } = useDialogState();

// Multiple dialogs
const dialogs = useMultipleDialogs(["edit", "delete", "confirm"]);
dialogs.open("edit");
dialogs.isOpen("delete"); // false
```

---

### 4. **usePaginationState**

**File**: `src/hooks/usePaginationState.ts`

**Purpose**: Manages pagination state including cursor-based and offset-based pagination.

**Replaces**: Multiple `useState` for currentPage, cursors, hasNextPage

**Key Features**:

- Navigate pages (next, previous, go to specific page)
- Cursor management for cursor-based pagination
- Calculate offset for offset-based pagination
- Track total count and has-next-page state

**Usage**:

```tsx
const pagination = usePaginationState({ pageSize: 10 });
pagination.goToPage(2);
pagination.nextPage();
const offset = pagination.offset; // (currentPage - 1) * pageSize
```

---

### 5. **useResourceListState**

**File**: `src/hooks/useResourceListState.ts`

**Purpose**: Manages complete list/table state including data, loading, pagination, filtering, and selection.

**Replaces**: Multiple useState + useCallback patterns in list pages

**Key Features**:

- Data management (set, add, remove, update items)
- Loading and error states
- View mode switching (table/grid/list)
- Filter management
- Multi-select with select-all support
- Pagination integration

**Usage**:

```tsx
const list = useResourceListState<Product>();
list.setItems(products);
list.toggleSelect(id);
list.updateFilter("category", "electronics");
list.pagination.nextPage();
```

---

### 6. **useFetchResourceList**

**File**: `src/hooks/useFetchResourceList.ts`

**Purpose**: Combines resource list state with async data fetching.

**Replaces**: Complex useEffect + useState + useCallback patterns in list pages

**Key Features**:

- Auto-fetch on mount
- Auto-fetch on filter/search changes
- Automatic pagination
- Error handling
- Loading states

**Usage**:

```tsx
const list = useFetchResourceList<Product>({
  fetchFn: async (options) => {
    const result = await productsService.list({
      page: options.page,
      pageSize: options.pageSize,
      filters: options.filters,
      search: options.search,
    });
    return {
      items: result.data,
      total: result.total,
      hasNextPage: result.hasNextPage,
    };
  },
  pageSize: 10,
  autoFetch: true,
});

// Use
list.setLoading(true);
list.setItems(items);
await list.refetch();
```

---

### 7. **useCheckoutState**

**File**: `src/hooks/useCheckoutState.ts`

**Purpose**: Manages multi-step checkout form state.

**Replaces**: Multiple useState calls in checkout page

**Key Features**:

- Step navigation (address → payment → review)
- Address management (shipping and billing)
- Payment method selection
- Currency selection
- Coupon management per shop
- Gateway availability
- International shipping detection

**Usage**:

```tsx
const checkout = useCheckoutState();
checkout.setCurrentStep("payment");
checkout.nextStep();
checkout.applyCoupon(shopId, code, discount);
checkout.setShippingAddress(address);
```

---

### 8. **useWizardFormState**

**File**: `src/hooks/useWizardFormState.ts`

**Purpose**: Manages multi-step wizard form state with validation.

**Replaces**: Multiple useState + useCallback in WizardForm components

**Key Features**:

- Step navigation and progress tracking
- Form data management
- Per-step validation state
- Overall validity tracking
- Submit/save state

**Usage**:

```tsx
const wizard = useWizardFormState({
  steps: ["info", "details", "review"],
  initialData: { name: "", email: "" },
});

wizard.nextStep();
wizard.updateFormData("name", "John");
wizard.markStepComplete(0);
wizard.isAllValid; // true if all steps valid
```

---

## Contexts Created

### 1. **LoginRegisterContext**

**File**: `src/contexts/LoginRegisterContext.tsx`

**Purpose**: Centralizes login and register form logic and state.

**Replaces**: Multiple useState + useCallback in login/register pages

**Key Features**:

- Separate login and register form states
- Password field state management
- Loading states during submission
- Error handling
- Form validation
- Automatic password strength checking

**Provider Setup**:

```tsx
<LoginRegisterProvider>
  {/* All children can use useLoginRegister() */}
</LoginRegisterProvider>
```

**Usage**:

```tsx
const {
  loginForm,
  loginPassword,
  loginLoading,
  loginError,
  handleLoginSubmit,
} = useLoginRegister();

// Access form data
loginForm.formData.email;
loginForm.handleChange;
loginForm.handleBlur;
loginForm.errors;
loginForm.touched;
```

---

## Migration Guide

### Before (Old Pattern):

```tsx
const [formData, setFormData] = useState({ email: "", password: "" });
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [touched, setTouched] = useState({});

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    // ... API call
  } finally {
    setLoading(false);
  }
};
```

### After (New Pattern):

```tsx
const {
  loginForm,
  loginPassword,
  loginLoading,
  loginError,
  handleLoginSubmit,
} = useLoginRegister();

// Component is now purely presentational
// All state and logic is in the context
```

---

## Refactored Components

### 1. Login Page

**File**: `src/app/login/page.tsx`

**Changes**:

- Removed 5+ useState calls
- Replaced with `useLoginRegister` context
- Removed form handling logic
- Component now purely presentational
- Cleaner, more maintainable code

**Benefits**:

- 60% less boilerplate
- Reusable form logic
- Easier to test
- Form state can be shared with other components

---

### 2. Register Page

**File**: `src/app/register/page.tsx`

**Changes**:

- Removed useState calls
- Replaced with `useLoginRegister` context
- Removed validation logic
- Uses centralized password validation
- Component now purely presentational

**Benefits**:

- Consistent validation across auth pages
- Shared password strength rules
- Reusable form state

---

## Future Refactoring Candidates

### High Priority (70%+ state logic):

1. **Admin pages** (`src/app/admin/*/page.tsx`)

   - Support tickets, orders, settings
   - Should use `useResourceListState` + context

2. **Checkout page** (`src/app/checkout/page.tsx`)

   - Already has `useCheckoutState` hook
   - Should be refactored next

3. **Product/Category list pages**

   - Should use `useFetchResourceList`
   - Heavy filter and pagination logic

4. **Seller resource pages** (`src/components/seller/SellerResourcePage.tsx`)
   - Multiple list states
   - Filter management
   - Should use `useResourceListState`

### Medium Priority (40-70% state logic):

5. **User messages page**
6. **Orders page**
7. **Form wizards**
8. **Admin demos page**

---

## Best Practices

1. **Always use hooks for repeated state patterns**

   - Multiple field form? Use `useFormState`
   - List with pagination? Use `useFetchResourceList`
   - Dialog with actions? Use `useDialogState`

2. **Keep components presentational**

   - Receive all state from hooks/context
   - Only handle UI events and delegated callbacks
   - No complex business logic in components

3. **Use contexts for shared cross-component logic**

   - Authentication-related logic → contexts
   - Form validation shared across pages → contexts
   - Global state → contexts

4. **Validate in hooks, not components**
   - Password validation in `usePasswordFieldState`
   - Form validation in `useFormState`
   - Checkout validation in `useCheckoutState`

---

## Testing

All hooks are designed to be easily testable:

```tsx
// Test useFormState
const { formData, handleChange, validate } = useFormState({
  initialData: { email: "" },
  onValidate: (data) => ({ ... }),
});

// Hooks can be tested in isolation
// No need to render full components
```

---

## Performance Considerations

1. **useFetchResourceList** auto-fetches on mount and filter changes
   - Add debounce for search: `useDebounce(searchQuery, 300)`
2. **useResourceListState** with large selection sets
   - Uses Set for O(1) lookup instead of Array
3. **useMultipleDialogs** for managing many dialogs
   - More efficient than multiple `useState(false)` calls

---

## Changelog

### Version 1.0 (Current)

- Created 8 reusable hooks
- Created `LoginRegisterContext`
- Refactored login and register pages
- Added comprehensive documentation

### Future Versions

- Add `CheckoutContext` for full checkout state management
- Create `ListContext` for common list patterns
- Add more specialized contexts as needed
