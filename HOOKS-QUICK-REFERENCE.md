# Quick Reference - State Management Hooks

## Hook Selection Guide

### "I have a form with fields..."

→ Use **`useFormState`**

```tsx
const form = useFormState({
  initialData: { name: "", email: "" },
  onValidate: (data) => ({
    /* errors */
  }),
});
```

### "I have password fields to show/hide..."

→ Use **`usePasswordFieldState`**

```tsx
const pwd = usePasswordFieldState();
<input type={pwd.showPassword ? "text" : "password"} />
<button onClick={pwd.togglePasswordVisibility}>
  {pwd.showPassword ? "Hide" : "Show"}
</button>
```

### "I have a login/register form..."

→ Use **`LoginRegisterContext`**

```tsx
const { loginForm, loginPassword, handleLoginSubmit } = useLoginRegister();
```

### "I have a dialog that opens/closes..."

→ Use **`useDialogState`** or **`useMultipleDialogs`**

```tsx
// Single dialog
const { isOpen, open, close } = useDialogState();

// Multiple dialogs
const dialogs = useMultipleDialogs(["edit", "delete"]);
dialogs.open("edit");
```

### "I have pagination..."

→ Use **`usePaginationState`**

```tsx
const pagination = usePaginationState({ pageSize: 10 });
pagination.nextPage();
pagination.goToPage(3);
```

### "I have a list with items..."

→ Use **`useResourceListState`**

```tsx
const list = useResourceListState<Item>();
list.setItems(items);
list.toggleSelect(id);
list.updateFilter("status", "active");
```

### "I have a list that fetches from API..."

→ Use **`useFetchResourceList`**

```tsx
const list = useFetchResourceList<Item>({
  fetchFn: async (options) => {
    const result = await apiService.list(options);
    return { items: result.items, hasNextPage: result.hasNextPage };
  },
});
```

### "I have a multi-step checkout..."

→ Use **`useCheckoutState`**

```tsx
const checkout = useCheckoutState();
checkout.setCurrentStep("payment");
checkout.applyCoupon(shopId, code, discount);
```

### "I have a multi-step wizard/form..."

→ Use **`useWizardFormState`**

```tsx
const wizard = useWizardFormState({
  steps: ["step1", "step2", "step3"],
  initialData: {
    /* data */
  },
});
wizard.nextStep();
wizard.updateFormData("fieldName", value);
```

---

## Common Patterns

### Pattern 1: Form with Validation

```tsx
const form = useFormState({
  initialData: { email: "", name: "" },
  onValidate: (data) => {
    const errors: Record<string, string> = {};
    if (!data.email) errors.email = "Email required";
    if (!data.email.includes("@")) errors.email = "Invalid email";
    if (!data.name) errors.name = "Name required";
    return errors;
  },
});

// In JSX
<input {...form.formData} onChange={form.handleChange} />;
{
  form.errors.email && <span className="error">{form.errors.email}</span>;
}
<button disabled={!form.isValid}>Submit</button>;
```

### Pattern 2: List with Search & Filters

```tsx
const list = useFetchResourceList({
  fetchFn: async (options) => {
    return await productsService.list({
      page: options.page,
      search: options.search,
      filters: options.filters
    });
  }
});

// Search
<input
  value={list.searchQuery}
  onChange={(e) => list.setSearchQuery(e.target.value)}
  placeholder="Search..."
/>

// Filters
<select onChange={(e) => list.updateFilter('category', e.target.value)}>
  <option>All</option>
  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
</select>

// List
{list.items.map(item => <ItemCard key={item.id} item={item} />)}

// Pagination
<button onClick={list.pagination.previousPage}>Previous</button>
<button onClick={list.pagination.nextPage}>Next</button>
```

### Pattern 3: Dialog with Form

```tsx
const dialog = useDialogState();
const form = useFormState({
  initialData: {
    /* ... */
  },
});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!form.validate()) return;

  await apiService.save(form.formData);
  dialog.close();
  form.reset();
};

// In JSX
<button onClick={dialog.open}>Open Dialog</button>;

{
  dialog.isOpen && (
    <Dialog onClose={dialog.close}>
      <form onSubmit={handleSubmit}>
        <input {...form.formData} onChange={form.handleChange} />
        <button type="submit">Save</button>
      </form>
    </Dialog>
  );
}
```

### Pattern 4: Multi-Step Form

```tsx
const wizard = useWizardFormState({
  steps: ['info', 'details', 'review'],
  initialData: { name: "", email: "" }
});

const handleStepSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate current step
  const errors = validateStep(wizard.currentStep, wizard.formData);
  if (Object.keys(errors).length > 0) {
    wizard.markStepInvalid(wizard.currentStep, Object.keys(errors).length);
    return;
  }

  wizard.markStepComplete(wizard.currentStep);

  if (!wizard.isLastStep) {
    wizard.nextStep();
  } else {
    // Submit all data
    await apiService.submit(wizard.formData);
  }
};

// In JSX - Progress bar
<div className="progress">
  {wizard.stepProgress}% Complete
</div>

// Step content
{wizard.currentStep === 0 && <StepInfo wizard={wizard} />}
{wizard.currentStep === 1 && <StepDetails wizard={wizard} />}
{wizard.currentStep === 2 && <StepReview wizard={wizard} />}

// Navigation
<button
  onClick={wizard.previousStep}
  disabled={wizard.isFirstStep}
>
  Back
</button>
<button
  onClick={handleStepSubmit}
  disabled={!wizard.isAllValid && wizard.isLastStep}
>
  {wizard.isLastStep ? "Submit" : "Next"}
</button>
```

---

## API Reference

### useFormState

```tsx
const form = useFormState({
  initialData: T,
  onValidate?: (data: T) => Record<string, string>,
  onDataChange?: (data: T) => void
});

// Return
{
  formData: T,
  errors: Record<string, string>,
  touched: Record<string, boolean>,
  setFieldValue: (field, value) => void,
  setFieldError: (field, error) => void,
  handleChange: (e) => void,
  handleBlur: (e) => void,
  setFormData: (data | setter) => void,
  reset: (newData?) => void,
  validate: () => boolean,
  isValid: boolean
}
```

### usePasswordFieldState

```tsx
const pwd = usePasswordFieldState();

// Return
{
  showPassword: boolean,
  showConfirmPassword: boolean,
  togglePasswordVisibility: () => void,
  toggleConfirmPasswordVisibility: () => void,
  validatePasswordMatch: (pwd, confirm) => string | null,
  validatePasswordStrength: (pwd) => { valid, errors[] },
  reset: () => void
}
```

### useDialogState

```tsx
const dialog = useDialogState({
  initialOpen?: boolean,
  onOpen?: () => void,
  onClose?: () => void
});

// Return
{
  isOpen: boolean,
  open: () => void,
  close: () => void,
  toggle: () => void,
  setOpen: (open: boolean) => void
}
```

### usePaginationState

```tsx
const pagination = usePaginationState({
  pageSize?: number,
  initialPage?: number,
  useCursor?: boolean
});

// Return
{
  currentPage: number,
  pageSize: number,
  cursors: (string | null)[],
  hasNextPage: boolean,
  hasPreviousPage: boolean,
  totalCount?: number,
  goToPage: (page) => void,
  nextPage: () => void,
  previousPage: () => void,
  reset: () => void,
  offset: number
}
```

### useResourceListState

```tsx
const list = useResourceListState<T>({
  pageSize?: number,
  initialPage?: number
});

// Return
{
  // Data
  items: T[],
  loading: boolean,
  error: string | null,

  // View
  viewMode: "table" | "grid" | "list",
  setViewMode: (mode) => void,

  // Filters
  filterValues: Record<string, any>,
  searchQuery: string,
  updateFilter: (key, value) => void,
  setSearchQuery: (query) => void,
  clearFilters: () => void,

  // Selection
  selectedIds: Set<string>,
  selectAll: boolean,
  toggleSelect: (id) => void,
  toggleSelectAll: (ids) => void,
  clearSelection: () => void,
  isSelected: (id) => boolean,

  // Pagination
  pagination: UsePaginationStateReturn,

  // Data operations
  setItems: (items) => void,
  addItems: (items) => void,
  removeItem: (id) => void,
  updateItem: (id, updates) => void
}
```

### useFetchResourceList

```tsx
const list = useFetchResourceList<T>({
  fetchFn: async (options) => {
    // options: { page, pageSize, filters, search }
    return {
      items: T[],
      total?: number,
      hasNextPage?: boolean,
      cursor?: string | null
    }
  },
  pageSize?: number,
  autoFetch?: boolean,
  onError?: (error) => void
});

// Returns: useResourceListState + { refetch, isFetching, isFetchingMore }
```

### useCheckoutState

```tsx
const checkout = useCheckoutState();

// Return
{
  // Steps
  currentStep: CheckoutStep,
  setCurrentStep: (step) => void,
  nextStep: () => void,
  previousStep: () => void,
  stepProgress: number,
  isFirstStep: boolean,
  isLastStep: boolean,

  // Addresses
  shippingAddressId: string,
  setShippingAddressId: (id) => void,
  shippingAddress: Address | null,
  setShippingAddress: (address) => void,

  // Payment
  paymentMethod: "razorpay" | "paypal" | "cod",
  setPaymentMethod: (method) => void,
  currency: "INR" | "USD" | "EUR" | "GBP",
  setCurrency: (currency) => void,

  // Coupons
  shopCoupons: Record<string, Coupon>,
  applyCoupon: (shopId, code, discount) => void,
  removeCoupon: (shopId) => void,

  // Processing
  processing: boolean,
  setProcessing: (processing) => void,
  error: string | null,
  setError: (error) => void,

  reset: () => void
}
```

### useWizardFormState

```tsx
const wizard = useWizardFormState<T>({
  steps: string[],
  initialData?: Partial<T>,
  onStepChange?: (step) => void
});

// Return
{
  currentStep: number,
  currentStepName: string,
  totalSteps: number,
  stepProgress: number,
  isFirstStep: boolean,
  isLastStep: boolean,

  setCurrentStep: (step) => void,
  nextStep: () => void,
  previousStep: () => void,
  goToStep: (step) => void,

  formData: Partial<T>,
  setFormData: (data | setter) => void,
  updateFormData: (field, value) => void,

  stepStates: StepState[],
  updateStepState: (step, state) => void,
  markStepComplete: (step) => void,
  markStepInvalid: (step, errorCount) => void,

  isAllValid: boolean,
  isSubmitting: boolean,
  isSaving: boolean,

  reset: () => void,
  resetStep: (step) => void
}
```

---

## Troubleshooting

### Hook not updating

- ✅ Make sure you're not calling hooks conditionally
- ✅ Make sure you're calling hooks at top level
- ✅ Check if handler is actually being called

### Form not validating

- ✅ Make sure onValidate returns error objects
- ✅ Make sure validate() is called before submit
- ✅ Check that field names match form data keys

### List not fetching

- ✅ Make sure fetchFn returns correct structure
- ✅ Check error handling with onError callback
- ✅ Verify API response format

### TypeScript errors

- ✅ Make sure generic types are specified: `useResourceListState<Product>()`
- ✅ Check that types match hook interfaces
- ✅ Use `as const` for string literals when needed

---

## Best Practices

1. **Always call hooks at top level**

   ```tsx
   // ✅ Good
   function MyComponent() {
     const form = useFormState(...);
     return ...;
   }

   // ❌ Bad
   function MyComponent() {
     if (condition) {
       const form = useFormState(...);
     }
   }
   ```

2. **Keep components pure/presentational**

   ```tsx
   // ✅ Good: All state from hook
   const form = useFormState(...);
   return <input {...form.formData} onChange={form.handleChange} />;

   // ❌ Bad: Component manages its own state
   const [data, setData] = useState(...);
   const form = useFormState(...);
   ```

3. **Combine hooks for complex logic**

   ```tsx
   // ✅ Good: Multiple specialized hooks
   const list = useFetchResourceList(...);
   const dialogs = useMultipleDialogs(['edit', 'delete']);

   // ❌ Bad: Try to do everything in one hook
   ```

4. **Document why you create new hooks**
   ```tsx
   /**
    * Custom hook for product search with debouncing
    *
    * Combines: useResourceListState + useDebounce
    * Purpose: Optimize search API calls
    */
   export function useProductSearch() { ... }
   ```

---

**Last Updated**: January 3, 2026  
**Hooks Version**: 1.0  
**Status**: Production Ready ✅
