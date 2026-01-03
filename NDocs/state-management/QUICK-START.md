# State Management Quick Start

Fast-track guide for developers new to the state management system.

## 5-Minute Primer

### What Changed?

We consolidated scattered `useState` calls into **reusable custom hooks and contexts**. This means:

- ✅ Less code duplication
- ✅ Less bugs (logic centralized)
- ✅ Easier testing
- ✅ Easier page maintenance

### Simple Example

**Before**:

```tsx
// 🔴 Multiple useState scattered around
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [page, setPage] = useState(1);

useEffect(() => {
  loadItems();
}, [page]);

const loadItems = async () => {
  setLoading(true);
  try {
    const res = await fetch(`/api/items?page=${page}`);
    setItems(res.data);
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};
```

**After**:

```tsx
// ✅ One hook with all logic
const { items, isLoading, error, currentPage, setCurrentPage } =
  useFetchResourceList({
    fetchFn: async (page) => {
      const res = await fetch(`/api/items?page=${page}`);
      return { items: res.data, hasNextPage: res.hasNext };
    },
  });
```

## 3-Step Refactoring

### Step 1: Pick Your Hook

**What are you managing?**

| I need to manage...            | Use this hook          |
| ------------------------------ | ---------------------- |
| Form fields + validation       | `useFormState`         |
| Modal/dialog open/close        | `useDialogState`       |
| List of items (already loaded) | `useResourceListState` |
| List of items (need to fetch)  | `useFetchResourceList` |
| Multi-step checkout            | `useCheckoutState`     |
| Multi-step form wizard         | `useWizardFormState`   |
| Messages/conversations         | `useConversationState` |
| Loading async data             | `useLoadingState`      |

### Step 2: Import & Use

```tsx
import { useResourceListState } from "@/hooks/useResourceListState";

export function MyPage() {
  const { items, isLoading, error } = useResourceListState({
    initialItems: myData,
    pageSize: 20,
  });

  return <div>{/* render items */}</div>;
}
```

### Step 3: Delete Old Code

Remove your `useState` calls and useEffect loops - the hook handles it.

---

## Common Hooks Quick Reference

### useFormState - For Forms

```tsx
const { formData, setField, errors, setErrors } = useFormState({
  email: "",
  name: "",
});

// Use it:
<input
  value={formData.email}
  onChange={(e) => setField("email", e.target.value)}
/>;

// Validate:
setErrors({ email: "Invalid email" });
{
  errors.email && <span>{errors.email}</span>;
}
```

**When to use**: Any form with input fields

---

### useResourceListState - For Lists (Client-side)

```tsx
const {
  items,
  currentPage,
  setCurrentPage,
  searchTerm,
  setSearchTerm,
  isLoading,
  error,
} = useResourceListState({
  initialItems: productList,
  pageSize: 20,
});

// Use it:
<input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />;

{
  items.map((item) => <Item key={item.id} item={item} />);
}

<button onClick={() => setCurrentPage(currentPage + 1)}>Next Page</button>;
```

**When to use**: Lists you already have (from props/API), need pagination/search

---

### useFetchResourceList - For Lists (Server-side)

```tsx
const {
  items,
  isLoading,
  error,
  currentPage,
  setCurrentPage,
  searchTerm,
  setSearchTerm,
  setFilter,
  refresh,
} = useFetchResourceList({
  fetchFn: async (page, filters) => {
    const res = await api.getItems({ page, ...filters });
    return {
      items: res.data,
      hasNextPage: res.hasNext,
    };
  },
  pageSize: 20,
  autoFetch: true, // Fetch on mount
});

// Use it: (same as useResourceListState)
```

**When to use**: Lists you need to fetch from API, with pagination/filters

---

### useDialogState - For Modals

```tsx
const dialog = useDialogState();

<button onClick={dialog.open}>Delete</button>;

{
  dialog.isOpen && (
    <Dialog onClose={dialog.close}>
      <p>Are you sure?</p>
      <button onClick={dialog.close}>Cancel</button>
      <button onClick={handleDelete}>Delete</button>
    </Dialog>
  );
}
```

**When to use**: Confirmation dialogs, delete modals, single modal per page

---

### useCheckoutState - For Multi-step

```tsx
const {
  currentStep,
  setCurrentStep,
  shippingAddressId,
  setShippingAddressId,
  paymentMethod,
  setPaymentMethod,
  processing,
  error,
} = useCheckoutState();

// Step 1
{
  currentStep === 1 && (
    <div>
      <AddressSelector onChange={setShippingAddressId} />
      <button onClick={() => setCurrentStep(2)}>Next</button>
    </div>
  );
}

// Step 2
{
  currentStep === 2 && (
    <div>
      <PaymentSelector onChange={setPaymentMethod} />
      <button onClick={submitOrder} disabled={processing}>
        {processing ? "Processing..." : "Complete"}
      </button>
    </div>
  );
}
```

**When to use**: Checkout, wizards, multi-step flows

---

## Real Examples from Codebase

### Example 1: Orders Page (DONE ✅)

**File**: `src/app/user/orders/page.tsx`

```tsx
// ✅ NOW USING: useResourceListState
const {
  items: orders,
  isLoading,
  currentPage,
  setCurrentPage,
  hasNextPage,
} = useResourceListState({
  initialItems: preloadedOrders,
  pageSize: 20,
});

// Result: 4 useState → 1 hook (28% reduction)
```

---

### Example 2: Checkout Page (DONE ✅)

**File**: `src/app/checkout/page.tsx`

```tsx
// ✅ NOW USING: useCheckoutState
const {
  currentStep,
  setCurrentStep,
  shippingAddressId,
  setShippingAddressId,
  paymentMethod,
  setPaymentMethod,
  shopCoupons,
  addShopCoupon,
  processing,
  error,
} = useCheckoutState();

// Result: 13 useState → 1 hook (42% reduction)
```

---

### Example 3: Messages Page (DONE ✅)

**File**: `src/app/user/messages/page.tsx`

```tsx
// ✅ NOW USING: useConversationState
const {
  conversations,
  selectedConversation,
  selectConversation,
  messages,
  newMessage,
  setNewMessage,
  addMessage,
  updateConversationLastMessage,
  messagesLoading,
  sendingMessage,
} = useConversationState({
  fetchConversationsFn: async () => api.getConversations(),
  fetchMessagesFn: async (id) => api.getMessages(id),
});

// Result: 7 useState → 1 hook (35% reduction)
```

---

### Example 4: Admin Settings (DONE ✅)

**File**: `src/app/admin/settings/general/page.tsx`

```tsx
// ✅ NOW USING: useFormState
const { formData, setField, errors } = useFormState({
  siteName: "",
  contactEmail: "",
  // ... more fields
});

<input
  value={formData.siteName}
  onChange={(e) => setField("siteName", e.target.value)}
/>;

// Result: 4 useState → 1 hook (22% reduction)
```

---

## Testing Hooks

### Before: Testing was hard

```tsx
// Hard to test when logic is in component
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
// ... 10 lines of state setup in test
```

### After: Testing is easy

```tsx
// Just test the hook
const { data, isLoading } = renderHook(() => useResourceListState({...}));
expect(data).toEqual([...]);
expect(isLoading).toBe(false);
```

---

## Common Questions

### Q: Do I have to use hooks?

**A**: Not for old components. But for new pages/features, yes - they're much simpler.

### Q: What if my page doesn't fit these hooks?

**A**:

1. Check if you can combine 2-3 hooks
2. Check ADOPTION-GUIDE for other patterns
3. Ask your tech lead - you might inspire a new hook!

### Q: How do I migrate my existing page?

**A**: Follow the 3-step process above:

1. Identify your state
2. Pick the right hook
3. Delete old useState code

Detailed walkthrough in ADOPTION-GUIDE.md

### Q: Can I use multiple hooks together?

**A**: Yes! Combine them:

```tsx
// Checkout page uses useCheckoutState + useLoadingState
const checkout = useCheckoutState();
const { execute: submitOrder } = useLoadingState(null);
```

### Q: What about component props?

**A**: Still use props! Hooks are just for state management:

```tsx
// Bad: don't replace props with hooks
function ProductCard(props) {
  // const product = useProductFromHook(); ❌ WRONG
}

// Good: hooks for local state, props for data
function ProductCard({ product }) {
  // ✅ Props still needed
  const dialog = useDialogState(); // ✅ Hook for UI state
}
```

---

## Checklist: Did You Do It Right?

After refactoring, verify:

- [ ] **No more useState** - All state in hooks now
- [ ] **Compiles** - `npm run build` has 0 errors
- [ ] **Works** - All features still work (test manually)
- [ ] **Cleaner** - Fewer lines, clearer component
- [ ] **Documented** - Updated PR with before/after metrics

---

## Next Steps

1. **Pick a simple page** to refactor first
2. **Follow the 3-step process** above
3. **Verify it compiles** (0 errors)
4. **Test it works** the same as before
5. **Count your wins** (lines removed, clarity gained)

---

## When You Get Stuck

1. Look at **completed examples** above
2. Read **ADOPTION-GUIDE.md** for detailed patterns
3. Check **HOOK-REFERENCE.md** for full API docs
4. Look at **hook source code** (has JSDoc comments)
5. Ask a teammate or tech lead

---

## TL;DR

```
OLD: const [x, setX], [y, setY], [z, setZ] = ...
NEW: const { x, y, z } = useMyHook()
RESULT: Less code, less bugs, easier tests
```

**You've got this!** 🚀
