# State Management Library - Complete Reference

Complete inventory and reference for all custom hooks and contexts created for the state management refactoring.

## 📊 State Management Inventory

### Total Created

- **10 Custom Hooks**
- **3 Contexts**
- **6 Pages Refactored** (320+ lines removed)
- **3 Team Documentation Files**

---

## 🎣 Hooks Library

### Core Hooks (Foundation)

#### 1. **useLoadingState**

**Status**: Pre-existing (enhanced)  
**Purpose**: Generic async operation wrapper  
**Size**: ~90 lines  
**Used By**: Most pages with async operations

**API**:

```tsx
const { isLoading, error, data, setData, execute } = useLoadingState<T>(
  initialData: T,
  onLoadError?: (error: Error) => void
);
```

**Example**:

```tsx
const { data, isLoading, error, execute } = useLoadingState<User>(null);
useEffect(() => {
  execute(async () => api.getUser());
}, []);
```

---

### Form Hooks

#### 2. **useFormState**

**Status**: ✅ Created (Phase 1)  
**Purpose**: Form field management with validation  
**Size**: ~120 lines  
**Exports**: `UseFormStateReturn<T>`

**API**:

```tsx
const {
  formData,           // Form object
  setField,           // (key: K, value: T[K]) => void
  errors,             // Validation errors object
  touched,            // Touched fields object
  setErrors,          // (errors: Record<K, string>) => void
  setTouched,         // (field: K, value: boolean) => void
  reset,              // () => void
  setFormData,        // (data: T) => void
} = useFormState<T>(initialData: T);
```

**Refactored Pages**: admin/settings/general

**Metrics**:

- Consolidates: Form fields + errors + touched state
- Lines reduced: ~25-30% per form page

---

#### 3. **usePasswordFieldState**

**Status**: ✅ Created (Phase 1)  
**Purpose**: Password field with strength & confirmation  
**Size**: ~90 lines  
**Exports**: `UsePasswordFieldStateReturn`

**API**:

```tsx
const {
  password, // Password value
  setPassword, // (value: string) => void
  passwordConfirm, // Confirmation value
  setPasswordConfirm, // (value: string) => void
  showPassword, // Visibility toggle
  toggleShowPassword, // () => void
  strength, // 0-4 strength level
  isMatching, // Passwords match?
  strengthMessage, // "Weak" | "Fair" | "Good" | "Strong"
  requirements, // { label, met }[]
  validatePasswordMatch, // () => boolean
  validatePasswordStrength, // () => boolean
} = usePasswordFieldState();
```

**Refactored Contexts**: LoginRegisterContext  
**Metrics**: Consolidates password + validation state

---

### Dialog/Modal Hooks

#### 4. **useDialogState**

**Status**: ✅ Created (Phase 1)  
**Purpose**: Single modal visibility management  
**Size**: ~130 lines  
**Exports**: `UseDialogStateReturn`

**API**:

```tsx
const {
  isOpen, // boolean
  open, // () => void
  close, // () => void
  toggle, // () => void
  setOpen, // (open: boolean) => void
} = useDialogState();
```

**Usage**: Confirmation dialogs, delete modals, etc.

---

#### 5. **useMultipleDialogs**

**Status**: ✅ Created (Phase 1)  
**Purpose**: Multiple independent dialogs on same page  
**Size**: ~150 lines  
**Exports**: `UseMultipleDialogsReturn`

**API**:

```tsx
const {
  isOpen, // (id: string) => boolean
  open, // (id: string) => void
  close, // (id: string) => void
  toggle, // (id: string) => void
  setOpen, // (id: string, open: boolean) => void
} = useMultipleDialogs(["dialog1", "dialog2", "dialog3"]);
```

**Usage**: Settings pages, complex UIs with multiple actions

---

### List & Data Hooks

#### 6. **usePaginationState**

**Status**: ✅ Created (Phase 1)  
**Purpose**: Pagination logic (cursor or offset-based)  
**Size**: ~140 lines  
**Exports**: `UsePaginationStateReturn`

**API**:

```tsx
const {
  currentPage, // Current page number
  totalPages, // Total pages
  totalCount, // Total items
  hasNextPage, // Has next page?
  hasPreviousPage, // Has previous page?
  goToPage, // (page: number) => void
  nextPage, // () => void
  previousPage, // () => void
} = usePaginationState({
  totalCount: 100,
  pageSize: 20,
});
```

**Usage**: Any pagination scenario

---

#### 7. **useResourceListState**

**Status**: ✅ Created (Phase 1)  
**Purpose**: Client-side list management (already loaded data)  
**Size**: ~200 lines  
**Exports**: `UseResourceListStateReturn<T>`

**API**:

```tsx
const {
  // Data
  items, // T[]

  // Pagination
  currentPage, // number
  hasNextPage, // boolean
  setCurrentPage, // (page: number) => void

  // Search & Filter
  searchTerm, // string
  setSearchTerm, // (term: string) => void
  setFilter, // (key: string, value: any) => void
  resetFilters, // () => void

  // Selection
  selectedItems, // Set<string | number>
  toggleItemSelection, // (id: string | number) => void
  clearSelection, // () => void

  // Operations
  refresh, // () => void

  // States
  isLoading, // boolean
  error, // string | null
} = useResourceListState<T>({
  initialItems: data,
  pageSize: 20,
});
```

**Refactored Pages**:

- user/orders/page.tsx
- admin/support-tickets/page.tsx
- user/favorites/page.tsx

**Metrics**:

- Average reduction: ~23% per page
- Consolidates: items + pagination + filters + search

---

#### 8. **useFetchResourceList**

**Status**: ✅ Created (Phase 1)  
**Purpose**: Server-side list (auto-fetch with API)  
**Size**: ~150 lines  
**Exports**: `UseFetchResourceListReturn<T>`

**API**:

```tsx
const {
  // Data
  items,              // T[]

  // Pagination
  currentPage,        // number
  hasNextPage,        // boolean
  setCurrentPage,     // (page: number) => void

  // Search & Filter
  searchTerm,         // string
  setSearchTerm,      // (term: string) => void
  setFilter,          // (key: string, value: any) => void
  resetFilters,       // () => void

  // States
  isLoading,          // boolean
  error,              // string | null

  // Operations
  refresh,            // () => void
} = useFetchResourceList<T>({
  fetchFn: async (page, filters) => ({
    items: [...],
    hasNextPage: true,
  }),
  pageSize: 20,
  autoFetch: true,
});
```

**Status**: Created but not yet integrated (ready for Phase 3)

---

### Multi-Step Hooks

#### 9. **useCheckoutState**

**Status**: ✅ Created (Phase 1)  
**Purpose**: Multi-step checkout flow state  
**Size**: ~260 lines  
**Exports**: `UseCheckoutStateReturn`

**API**:

```tsx
const {
  // Step navigation
  currentStep, // 1-3
  setCurrentStep, // (step: number) => void

  // Addresses
  shippingAddressId, // string
  setShippingAddressId, // (id: string) => void
  billingAddressId, // string
  setBillingAddressId, // (id: string) => void
  useSameAddress, // boolean
  setUseSameAddress, // (same: boolean) => void

  // Payment
  paymentMethod, // string
  setPaymentMethod, // (method: string) => void
  currency, // "INR" | "USD"
  setCurrency, // (currency: string) => void

  // Coupons
  shopCoupons, // Map<shopId, coupon>
  addShopCoupon, // (shopId, coupon) => void
  removeShopCoupon, // (shopId) => void

  // Gateway
  availableGateways, // Gateway[]
  isInternational, // boolean

  // Submission
  processing, // boolean
  error, // string | null
  validationErrors, // Record<string, string>
} = useCheckoutState();
```

**Refactored Pages**: checkout/page.tsx  
**Metrics**:

- Before: 13 useState calls
- After: 1 hook
- Reduction: 42%

---

#### 10. **useWizardFormState**

**Status**: ✅ Created (Phase 1)  
**Purpose**: Multi-step form with per-step validation  
**Size**: ~230 lines  
**Exports**: `UseWizardFormStateReturn<T>`

**API**:

```tsx
const {
  // Form data
  formData,           // T (nested form data)
  setStepField,       // <K extends keyof T>(step: K, field: keyof T[K], value) => void

  // Navigation
  currentStep,        // number
  goToStep,           // (step: number) => void
  nextStep,           // () => void
  previousStep,       // () => void
  canGoBack,          // boolean
  canGoForward,       // boolean

  // Validation
  stepErrors,         // Record<step, Record<field, error>>[]
  setStepErrors,      // (step: number, errors: Record<string, string>) => void
  isStepValid,        // (step: number) => boolean
} = useWizardFormState<T>(initialData: T);
```

**Status**: Created but not yet integrated (ready for Phase 3)

---

#### 11. **useConversationState**

**Status**: ✅ Created (Phase 2)  
**Purpose**: Conversation & messaging state  
**Size**: ~200 lines  
**Exports**: `UseConversationStateReturn`

**API**:

```tsx
const {
  // Conversations
  conversations,                 // ConversationFE[]
  selectedConversation,          // ConversationFE | null
  selectConversation,            // (conv: ConversationFE | null) => void

  // Messages
  messages,                      // Message[]
  newMessage,                    // string
  setNewMessage,                 // (msg: string) => void
  addMessage,                    // (msg: Message) => void
  updateConversationLastMessage, // (convId: string, msg: Message) => void
  clearMessages,                 // () => void

  // Search
  searchQuery,                   // string
  setSearchQuery,                // (query: string) => void
  showArchived,                  // boolean
  setShowArchived,               // (show: boolean) => void

  // Loading
  messagesLoading,               // boolean
  sendingMessage,                // boolean
} = useConversationState({
  fetchConversationsFn: async () => [...],
  fetchMessagesFn: async (id) => [...],
});
```

**Refactored Pages**: user/messages/page.tsx  
**Metrics**:

- Before: 7 useState + useLoadingState
- After: 1 hook
- Reduction: 35%

---

## 🌐 Contexts Library

### 1. **LoginRegisterContext**

**Status**: ✅ Created (Phase 1)  
**Purpose**: Centralize login & register form state  
**Size**: ~200 lines  
**Provider**: `LoginRegisterProvider`

**Exports**:

```tsx
interface LoginRegisterContextType {
  // Login form
  loginForm: LoginFormData;
  updateLoginField: <K extends keyof LoginFormData>(
    key: K,
    value: LoginFormData[K]
  ) => void;
  loginPassword: PasswordFieldState;
  resetLoginForm: () => void;
  submitLogin: (onSuccess: () => void) => Promise<void>;

  // Register form
  registerForm: RegisterFormData;
  updateRegisterField: <K extends keyof RegisterFormData>(
    key: K,
    value: RegisterFormData[K]
  ) => void;
  registerPassword: PasswordFieldState;
  resetRegisterForm: () => void;
  submitRegister: (onSuccess: () => void) => Promise<void>;

  // States
  isLoading: boolean;
  error: string | null;
}
```

**Usage**:

```tsx
import { useLoginRegisterContext } from "@/contexts/LoginRegisterContext";

export function LoginForm() {
  const {
    loginForm,
    updateLoginField,
    loginPassword,
    submitLogin,
    isLoading,
    error,
  } = useLoginRegisterContext();

  return (
    <form onSubmit={submitLogin}>
      <input
        value={loginForm.email}
        onChange={(e) => updateLoginField("email", e.target.value)}
      />
      {error && <span className="error">{error}</span>}
    </form>
  );
}
```

---

### 2. **GlobalSearchContext**

**Status**: ✅ Created (Phase 1)  
**Purpose**: Site-wide search functionality  
**Size**: ~200 lines  
**Provider**: `GlobalSearchProvider`

**Exports**:

```tsx
interface GlobalSearchContextType {
  // Search state
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  isLoading: boolean;
  error: string | null;

  // Methods
  handleSearch: (query: string, contentType?: ContentType) => Promise<void>;
  clearSearch: () => void;
  setSearchQuery: (query: string) => void;
}
```

**Usage**:

```tsx
import { useGlobalSearch } from "@/contexts/GlobalSearchContext";

export function SearchBar() {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    handleSearch,
  } = useGlobalSearch();

  return (
    <>
      <input
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          handleSearch(e.target.value);
        }}
      />
      {isLoading && <Spinner />}
      {searchResults.map((result) => (
        <SearchResultItem key={result.id} result={result} />
      ))}
    </>
  );
}
```

**Integration**: Integrated in layout.tsx with GlobalSearchProvider

---

### 3. **AuthContext**

**Status**: Pre-existing (enhanced)  
**Purpose**: User authentication & role management  
**Size**: ~150 lines

**Enhancements Made**:

- Added `isAdmin` computed property
- Added `isSeller` computed property
- Added `isAdminOrSeller` computed property

**Exports**:

```tsx
interface AuthContextType {
  user: User | null;
  isLoading: boolean;

  // Role helpers
  isAdmin: boolean;
  isSeller: boolean;
  isAdminOrSeller: boolean;

  // Methods
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
}
```

---

## 📈 Refactoring Impact Summary

### Pages Refactored (Phase 2)

| Page                            | Old Pattern | New Hook(s)          | State Vars | Reduction | Lines Saved |
| ------------------------------- | ----------- | -------------------- | ---------- | --------- | ----------- |
| checkout/page.tsx               | 13 useState | useCheckoutState     | 13→1       | 42%       | ~110        |
| user/orders/page.tsx            | 4 useState  | useResourceListState | 4→1        | 28%       | ~35         |
| admin/support-tickets/page.tsx  | 5 useState  | useResourceListState | 5→1        | 24%       | ~40         |
| user/favorites/page.tsx         | 2 useState  | useResourceListState | 2→1        | 17%       | ~25         |
| user/messages/page.tsx          | 7 useState  | useConversationState | 7→1        | 35%       | ~70         |
| admin/settings/general/page.tsx | 4 useState  | useFormState         | 4→1        | 22%       | ~40         |

**Total Impact**:

- **6 pages refactored**
- **~320 lines removed**
- **State logic consolidated**
- **Zero compilation errors**

---

## 🔄 Hook Dependencies & Relationships

```
useLoadingState (foundation)
  ↓
  ├─ Used by most pages for async operations
  └─ Wrapped by other hooks

useFormState
  ├─ Used directly: admin/settings/general
  ├─ Composed in: LoginRegisterContext
  └─ Composed in: useWizardFormState

usePasswordFieldState
  ├─ Used directly: (optional) password-only forms
  └─ Composed in: LoginRegisterContext

useDialogState
  ├─ Used directly: single modal pages
  └─ Variant: useMultipleDialogs for 2+ modals

usePaginationState
  ├─ Foundation for: useResourceListState
  ├─ Foundation for: useFetchResourceList
  └─ Used directly: (rarely, prefer resource list hooks)

useResourceListState
  ├─ Used by: user/orders, admin/support-tickets, user/favorites
  └─ Similar to: useFetchResourceList (server-side variant)

useFetchResourceList
  ├─ Alternative to: useResourceListState (with auto-fetch)
  └─ Ready for: Phase 3 integration

useCheckoutState
  ├─ Specialized multi-step hook
  └─ Used by: checkout/page.tsx

useWizardFormState
  ├─ Specialized multi-step hook
  ├─ Alternative to: useCheckoutState (more generic)
  └─ Ready for: Phase 3 integration (seller registration, etc.)

useConversationState
  ├─ Specialized messaging hook
  └─ Used by: user/messages/page.tsx
```

---

## 📋 Implementation Checklist

### For Team Members Adding State Management

**Before refactoring:**

- [ ] Review ADOPTION-GUIDE.md (this file)
- [ ] Identify all useState calls in target page
- [ ] Map to appropriate hook using decision tree
- [ ] Check if hook exists (see Hooks Library above)

**During refactoring:**

- [ ] Import chosen hook(s)
- [ ] Replace useState calls with hook
- [ ] Update all state setters to use hook methods
- [ ] Remove any manual state initialization/cleanup
- [ ] Run TypeScript compiler

**After refactoring:**

- [ ] Verify page compiles (0 errors)
- [ ] Test all features work as before
- [ ] Count lines removed
- [ ] Update PR description with metrics

---

## 🚀 Next Phase (Phase 3)

Ready to refactor with existing hooks:

| Page                    | Recommended Hook                  | Reason                    |
| ----------------------- | --------------------------------- | ------------------------- |
| admin/settings/payment  | useFormState                      | Form-heavy settings page  |
| admin/settings/shipping | useFormState                      | Form-heavy settings page  |
| admin/settings/email    | useFormState                      | Configuration form        |
| seller/products/create  | useWizardFormState + useFormState | Multi-step product wizard |
| seller/products/list    | useFetchResourceList              | Products list with API    |
| user/notifications      | useResourceListState              | Notifications list        |
| admin/users/list        | useFetchResourceList              | Users management list     |

---

## 📚 Documentation Files

1. **ADOPTION-GUIDE.md** (this file)

   - Complete guide for team adoption
   - Decision tree for hook selection
   - Before/after code examples
   - Refactoring checklist

2. **Individual Hook Docs** (in /NDocs/hooks/)

   - useFormState.md
   - useCheckoutState.md
   - useFetchResourceList.md
   - useConversationState.md
   - ... and others

3. **Architecture Overview** (in /NDocs/state-management/)
   - System design rationale
   - Hook composition patterns
   - Testing strategies

---

## ✅ Quality Assurance

All created hooks and contexts:

- ✅ Full TypeScript support (zero implicit any)
- ✅ JSDoc comments on all public APIs
- ✅ Error handling built-in
- ✅ Performance optimized (useCallback, useMemo)
- ✅ Zero breaking changes to existing code
- ✅ Backward compatible initialization

All refactored pages:

- ✅ Zero TypeScript errors
- ✅ Same functionality as before
- ✅ Reduced complexity
- ✅ Easier to test
- ✅ Easier to maintain

---

## 🤝 Contributing

When creating new state management hooks:

1. Follow existing pattern (see any hook source)
2. Export TypeScript interfaces for all return types
3. Add JSDoc comments to all public methods
4. Include error handling
5. Write tests in /tests/
6. Add documentation file
7. Update this inventory

---

## 📞 Support

Questions about hooks? See:

1. Individual hook JSDoc comments (in code)
2. Individual hook documentation files
3. Working examples in refactored pages
4. ADOPTION-GUIDE.md usage examples
