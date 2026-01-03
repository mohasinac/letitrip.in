# State Management Refactoring - Quick Start Examples

## Example 1: Simple Form (Before & After)

### BEFORE: Login Form

```tsx
function LoginForm() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (touched[e.target.name] && error) setError(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {touched.email && error && <span>{error.message}</span>}

      <button onClick={() => setShowPassword(!showPassword)}>
        {showPassword ? "Hide" : "Show"}
      </button>
      <input
        type={showPassword ? "text" : "password"}
        name="password"
        value={formData.password}
        onChange={handleChange}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Loading..." : "Login"}
      </button>
    </form>
  );
}
```

### AFTER: Login Form Using Hooks

```tsx
function LoginForm() {
  const { loginForm, loginPassword, loginLoading, handleLoginSubmit } =
    useLoginRegister();

  return (
    <form onSubmit={handleLoginSubmit}>
      <input
        name="email"
        value={loginForm.formData.email}
        onChange={loginForm.handleChange}
        onBlur={loginForm.handleBlur}
      />
      {loginForm.touched.email && loginForm.errors.email && (
        <span>{loginForm.errors.email}</span>
      )}

      <button onClick={loginPassword.togglePasswordVisibility}>
        {loginPassword.showPassword ? "Hide" : "Show"}
      </button>
      <input
        type={loginPassword.showPassword ? "text" : "password"}
        name="password"
        value={loginForm.formData.password}
        onChange={loginForm.handleChange}
      />

      <button type="submit" disabled={loginLoading}>
        {loginLoading ? "Loading..." : "Login"}
      </button>
    </form>
  );
}
```

**Benefits**:

- ✅ 60% less boilerplate
- ✅ Form validation centralized
- ✅ Password strength rules reusable
- ✅ Easy to test
- ✅ Same logic for register page

---

## Example 2: List Page with Pagination & Filters (Before & After)

### BEFORE: Products List

```tsx
function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursors, setCursors] = useState<(string | null)[]>([null]);

  // Filters
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // View
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  useEffect(() => {
    loadProducts();
  }, [currentPage, filters, searchQuery]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await productsService.list({
        page: currentPage,
        pageSize,
        filters,
        search: searchQuery,
      });
      setProducts(result.items);
      setHasNextPage(result.hasNextPage);
      setCursors((prev) => {
        const newCursors = [...prev];
        newCursors[currentPage] = result.cursor;
        return newCursors;
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
      setSelectAll(true);
    }
  };

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Filter UI */}
      <input
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <select onChange={(e) => updateFilter("category", e.target.value)}>
        <option>All Categories</option>
        {/* options */}
      </select>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
              />
            </th>
            {/* columns */}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.has(product.id)}
                  onChange={() => toggleSelect(product.id)}
                />
              </td>
              {/* cells */}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((p) => p - 1)}
      >
        Previous
      </button>
      <button
        disabled={!hasNextPage}
        onClick={() => setCurrentPage((p) => p + 1)}
      >
        Next
      </button>
    </div>
  );
}
```

### AFTER: Products List Using Hooks

```tsx
function ProductsList() {
  const list = useFetchResourceList<Product>({
    fetchFn: async (options) => {
      const result = await productsService.list({
        page: options.page,
        pageSize: options.pageSize,
        filters: options.filters,
        search: options.search,
      });
      return {
        items: result.items,
        hasNextPage: result.hasNextPage,
        cursor: result.cursor,
      };
    },
    pageSize: 10,
  });

  return (
    <div>
      {/* Filter UI */}
      <input
        placeholder="Search"
        value={list.searchQuery}
        onChange={(e) => list.setSearchQuery(e.target.value)}
      />
      <select onChange={(e) => list.updateFilter("category", e.target.value)}>
        <option>All Categories</option>
        {/* options */}
      </select>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={list.selectAll}
                onChange={() =>
                  list.toggleSelectAll(list.items.map((p) => p.id))
                }
              />
            </th>
            {/* columns */}
          </tr>
        </thead>
        <tbody>
          {list.items.map((product) => (
            <tr key={product.id}>
              <td>
                <input
                  type="checkbox"
                  checked={list.isSelected(product.id)}
                  onChange={() => list.toggleSelect(product.id)}
                />
              </td>
              {/* cells */}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <button
        disabled={!list.pagination.hasPreviousPage}
        onClick={list.pagination.previousPage}
      >
        Previous
      </button>
      <button
        disabled={!list.pagination.hasNextPage}
        onClick={list.pagination.nextPage}
      >
        Next
      </button>
    </div>
  );
}
```

**Benefits**:

- ✅ 70% less boilerplate
- ✅ All list logic centralized
- ✅ Auto-fetch on filter/search changes
- ✅ Built-in selection management
- ✅ Consistent pagination across app
- ✅ Easy to add sorting, bulk actions

---

## Example 3: Multi-Step Checkout (Before & After)

### BEFORE: Checkout Form

```tsx
function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<"address" | "payment">(
    "address"
  );
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [currency, setCurrency] = useState("INR");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<Record<string, Coupon>>({});

  const handleNextStep = () => {
    if (currentStep === "address") {
      setCurrentStep("payment");
    }
  };

  const handleApplyCoupon = (
    shopId: string,
    code: string,
    discount: number
  ) => {
    setCoupons((prev) => ({
      ...prev,
      [shopId]: { code, discount },
    }));
  };

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      // ... API calls
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      {currentStep === "address" && (
        <div>
          {/* Address form */}
          <button onClick={handleNextStep}>Next</button>
        </div>
      )}
      {currentStep === "payment" && (
        <div>
          {/* Payment form */}
          <button onClick={() => setCurrentStep("address")}>Back</button>
          <button onClick={handleSubmit} disabled={processing}>
            {processing ? "Processing..." : "Pay"}
          </button>
        </div>
      )}
    </div>
  );
}
```

### AFTER: Checkout Form Using Hook

```tsx
function CheckoutPage() {
  const checkout = useCheckoutState();

  const handleSubmit = async () => {
    checkout.setProcessing(true);
    try {
      // ... API calls using checkout state
    } catch (err) {
      checkout.setError((err as Error).message);
    } finally {
      checkout.setProcessing(false);
    }
  };

  return (
    <div>
      {checkout.currentStep === "address" && (
        <div>
          {/* Address form - use checkout.shippingAddress, setShippingAddress */}
          <button onClick={checkout.nextStep}>Next</button>
        </div>
      )}
      {checkout.currentStep === "payment" && (
        <div>
          {/* Payment form - use checkout.paymentMethod, currency */}
          <button onClick={checkout.previousStep}>Back</button>
          <button onClick={handleSubmit} disabled={checkout.processing}>
            {checkout.processing ? "Processing..." : "Pay"}
          </button>
        </div>
      )}
    </div>
  );
}
```

**Benefits**:

- ✅ All checkout state in one place
- ✅ Built-in step navigation
- ✅ Coupon management per shop
- ✅ Easy to add/remove steps
- ✅ Reusable across checkout flows

---

## Refactoring Checklist

When refactoring a component:

1. **Identify State Patterns**

   - [ ] Multiple `useState` calls → check if there's a hook
   - [ ] Multiple `useCallback` handlers → check if there's a hook
   - [ ] Related state that changes together → consider a hook

2. **Choose the Right Hook**

   - Form with fields? → `useFormState`
   - List with filters/pagination? → `useFetchResourceList`
   - Dialog visibility? → `useDialogState`
   - Multi-step form? → `useWizardFormState` or `useCheckoutState`
   - Password field? → `usePasswordFieldState`

3. **Extract State to Hook/Context**

   - Move all `useState` to hook
   - Move all handlers to hook
   - Keep only UI in component

4. **Update Component**

   - Use hook instead of `useState`
   - Receive state as props from hook
   - Call handlers from hook

5. **Test**
   - Verify form validation works
   - Verify navigation works
   - Verify API calls work
   - Verify error handling works

---

## Common Mistakes to Avoid

❌ **DON'T**: Keep state in component + hook

```tsx
const { formData, handleChange } = useFormState(...);
const [additionalData, setAdditionalData] = useState(""); // ❌ Wrong
```

✅ **DO**: Use hook for all related state

```tsx
const { formData, setFieldValue } = useFormState(...);
// Use setFieldValue for any related data
```

---

❌ **DON'T**: Call hooks conditionally

```tsx
if (showForm) {
  const form = useFormState(...); // ❌ Wrong - breaks rules of hooks
}
```

✅ **DO**: Always call hooks at top level

```tsx
const form = useFormState(...);
// Use form.isValid to conditionally render
if (form.isValid) { ... }
```

---

❌ **DON'T**: Create new hook instances unnecessarily

```tsx
const form = useFormState(...); // Called in component render
```

✅ **DO**: Move to custom hook if complex

```tsx
// custom-hook.ts
export function useMyForm() {
  const form = useFormState(...);
  const password = usePasswordFieldState();
  return { form, password };
}
```

---

## Next Steps

1. **Refactor High-Priority Pages** (70%+ state logic)

   - Admin pages
   - Checkout page
   - Product/category list pages

2. **Create Additional Contexts**

   - `CheckoutContext` for full checkout flow
   - `ListContext` for common list patterns
   - `NotificationContext` for toast/alerts

3. **Document Patterns**

   - Create examples for common patterns
   - Update this guide as new hooks are created

4. **Team Training**
   - Share examples with team
   - Review PRs using new patterns
   - Celebrate cleaner code!
