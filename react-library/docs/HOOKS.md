# Hooks Reference

Complete documentation for all custom React hooks in @letitrip/react-library.

## Table of Contents

- [Debounce & Throttle Hooks](#debounce--throttle-hooks)
- [Filter Hooks](#filter-hooks)
- [Storage Hooks](#storage-hooks)
- [Media Query & Responsive Hooks](#media-query--responsive-hooks)
- [Utility Hooks](#utility-hooks)
- [State Management Hooks](#state-management-hooks)
- [Context-Based Hooks](#context-based-hooks)
- [Upload Hooks](#upload-hooks)
- [Table & Data Hooks](#table--data-hooks)
- [Pagination Hooks](#pagination-hooks)
- [Form Hooks](#form-hooks)
- [Data Fetching Hooks](#data-fetching-hooks)

---

## Debounce & Throttle Hooks

### `useDebounce`

Debounce a value to reduce updates.

**Parameters:**

- `value: T` - Value to debounce
- `delay: number` - Delay in milliseconds (default: 500)

**Returns:** `T` - Debounced value

**Usage:**

```tsx
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearchTerm = useDebounce(searchTerm, 300);

useEffect(() => {
  // API call with debounced value
  searchAPI(debouncedSearchTerm);
}, [debouncedSearchTerm]);
```

### `useDebouncedCallback`

Debounce a callback function.

**Parameters:**

- `callback: Function` - Function to debounce
- `delay: number` - Delay in milliseconds
- `deps: any[]` - Dependency array

**Returns:** `Function` - Debounced function

**Usage:**

```tsx
const handleSearch = useDebouncedCallback(
  (query: string) => {
    searchAPI(query);
  },
  500,
  [],
);
```

### `useThrottle`

Throttle a value to limit updates.

**Parameters:**

- `value: T` - Value to throttle
- `interval: number` - Minimum interval between updates (ms)

**Returns:** `T` - Throttled value

**Usage:**

```tsx
const [scrollY, setScrollY] = useState(0);
const throttledScrollY = useThrottle(scrollY, 100);
```

---

## Filter Hooks

### `useFilters`

Manage filter state for lists and tables.

**Parameters:**

- `options: UseFiltersOptions`
  - `initialFilters?: FilterState` - Initial filter values
  - `router?: UseFiltersRouter` - Optional router integration
  - `onFilterChange?: (filters: FilterState) => void` - Change callback

**Returns:** `UseFiltersReturn`

- `filters: FilterState` - Current filter values
- `setFilter: (key: string, value: any) => void` - Set single filter
- `setFilters: (filters: FilterState) => void` - Set multiple filters
- `clearFilter: (key: string) => void` - Clear single filter
- `clearFilters: () => void` - Clear all filters
- `hasActiveFilters: boolean` - Has any active filters

**Usage:**

```tsx
const { filters, setFilter, clearFilters } = useFilters({
  initialFilters: { status: "active" },
});

<select
  value={filters.status}
  onChange={(e) => setFilter("status", e.target.value)}
>
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
</select>;
```

### `useUrlFilters`

Sync filter state with URL query parameters.

**Parameters:**

- `options: UseUrlFiltersOptions`
  - `router: UseUrlFiltersRouter` - Router integration
  - `initialFilters?: FilterState` - Initial filter values
  - `sortOptions?: SortState` - Initial sort options

**Returns:** `UseUrlFiltersReturn`

- `filters: FilterState` - Current filter values
- `sort: SortState` - Current sort state
- `setFilter: (key: string, value: any) => void` - Set filter
- `setSort: (field: string, order: 'asc' | 'desc') => void` - Set sort
- `clearFilters: () => void` - Clear all filters
- `buildUrl: (params: object) => string` - Build URL with params

**Usage:**

```tsx
const { filters, sort, setFilter, setSort } = useUrlFilters({
  router: useRouter(),
});
```

---

## Storage Hooks

### `useLocalStorage`

Persist state in localStorage with sync across tabs.

**Parameters:**

- `key: string` - localStorage key
- `initialValue: T` - Initial value
- `options?: UseLocalStorageOptions`
  - `serialize?: (value: T) => string` - Custom serializer
  - `deserialize?: (value: string) => T` - Custom deserializer

**Returns:** `[T, (value: T) => void, () => void]`

- `value: T` - Current value
- `setValue: (value: T) => void` - Update value
- `remove: () => void` - Remove from storage

**Usage:**

```tsx
const [theme, setTheme, removeTheme] = useLocalStorage("theme", "light");

<button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
  Toggle Theme
</button>;
```

---

## Media Query & Responsive Hooks

### `useMediaQuery`

Match media queries in React.

**Parameters:**

- `query: string` - Media query string

**Returns:** `boolean` - Query match result

**Usage:**

```tsx
const isMobile = useMediaQuery("(max-width: 768px)");
const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
```

### `useBreakpoint`

Get current breakpoint.

**Returns:** `'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'` - Current breakpoint

**Usage:**

```tsx
const breakpoint = useBreakpoint();

if (breakpoint === "xs" || breakpoint === "sm") {
  // Mobile layout
}
```

### `useIsMobile`

Check if current viewport is mobile.

**Returns:** `boolean` - Is mobile viewport

**Usage:**

```tsx
const isMobile = useIsMobile();
```

### `useIsTablet`

Check if current viewport is tablet.

**Returns:** `boolean` - Is tablet viewport

### `useIsDesktop`

Check if current viewport is desktop.

**Returns:** `boolean` - Is desktop viewport

### `useIsTouchDevice`

Check if device has touch support.

**Returns:** `boolean` - Is touch device

### `useViewport`

Get viewport dimensions.

**Returns:** `{width: number, height: number}` - Viewport size

**Usage:**

```tsx
const { width, height } = useViewport();
```

### `useDeviceType`

Get device type with OS detection.

**Returns:**

```tsx
{
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}
```

---

## Utility Hooks

### `useSafeLoad`

Safely load async data with loading/error states.

**Parameters:**

- `options: UseSafeLoadOptions<T>`
  - `load: () => Promise<T>` - Async load function
  - `deps?: any[]` - Dependencies array
  - `onSuccess?: (data: T) => void` - Success callback
  - `onError?: (error: Error) => void` - Error callback

**Returns:** `UseSafeLoadReturn<T>`

- `data: T | null` - Loaded data
- `loading: boolean` - Loading state
- `error: Error | null` - Error state
- `reload: () => void` - Reload function

**Usage:**

```tsx
const { data, loading, error, reload } = useSafeLoad({
  load: () => fetchUserProfile(userId),
  deps: [userId],
});

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} retry={reload} />;
return <Profile user={data} />;
```

### `useWindowResize`

Track window resize with debouncing.

**Parameters:**

- `options?: UseWindowResizeOptions`
  - `debounce?: number` - Debounce delay (ms)
  - `onResize?: (size: WindowSize) => void` - Resize callback

**Returns:** `UseWindowResizeReturn`

- `size: WindowSize` - Current window size
- `isResizing: boolean` - Currently resizing flag

### `useToggle`

Toggle boolean state.

**Parameters:**

- `initialValue?: boolean` - Initial state (default: false)

**Returns:** `[boolean, () => void, (value: boolean) => void]`

**Usage:**

```tsx
const [isOpen, toggle, setIsOpen] = useToggle();

<button onClick={toggle}>Toggle</button>;
```

### `useCounter`

Counter with increment/decrement.

**Parameters:**

- `initialValue?: number` - Initial count (default: 0)
- `options?: {min?: number, max?: number, step?: number}`

**Returns:**

```tsx
{
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  set: (value: number) => void;
}
```

### `useInterval`

Run callback on interval.

**Parameters:**

- `callback: () => void` - Function to call
- `delay: number | null` - Interval delay (null to pause)

**Usage:**

```tsx
useInterval(() => {
  fetchUpdates();
}, 5000);
```

### `useTimeout`

Run callback after delay.

**Parameters:**

- `callback: () => void` - Function to call
- `delay: number` - Timeout delay (ms)

### `usePrevious`

Get previous value.

**Parameters:**

- `value: T` - Current value

**Returns:** `T | undefined` - Previous value

**Usage:**

```tsx
const [count, setCount] = useState(0);
const prevCount = usePrevious(count);
```

### `useClipboard`

Copy to clipboard.

**Returns:**

```tsx
{
  copied: boolean;
  copy: (text: string) => Promise<void>;
}
```

**Usage:**

```tsx
const { copied, copy } = useClipboard();

<button onClick={() => copy("Text to copy")}>
  {copied ? "Copied!" : "Copy"}
</button>;
```

---

## State Management Hooks

### `useCheckoutState`

Manage checkout flow state.

**Returns:** `UseCheckoutStateReturn`

- `currentStep: CheckoutStep` - Current step
- `address: CheckoutAddress` - Delivery address
- `paymentMethod: string` - Selected payment method
- `goToStep: (step: CheckoutStep) => void` - Navigate to step
- `setAddress: (address: CheckoutAddress) => void` - Set address
- `setPaymentMethod: (method: string) => void` - Set payment
- `canProceed: boolean` - Can proceed to next step

**Usage:**

```tsx
const { currentStep, address, setAddress, goToStep, canProceed } =
  useCheckoutState();
```

### `useConversationState`

Manage chat/messaging state.

**Parameters:**

- `options: ConversationStateOptions`
  - `conversationId: string` - Conversation ID
  - `onMessageSent?: (message: Message) => void` - Message sent callback

**Returns:** `UseConversationStateReturn`

- `messages: Message[]` - Conversation messages
- `loading: boolean` - Loading state
- `sendMessage: (text: string) => void` - Send message
- `typing: boolean` - Other user typing indicator
- `markAsRead: () => void` - Mark conversation as read

### `useNavigationGuard`

Prevent navigation with unsaved changes.

**Parameters:**

- `options: NavigationGuardOptions`
  - `when: boolean` - Enable guard condition
  - `message?: string` - Confirmation message
  - `onNavigate?: () => void` - Navigation callback

**Usage:**

```tsx
const [hasChanges, setHasChanges] = useState(false);

useNavigationGuard({
  when: hasChanges,
  message: "You have unsaved changes. Are you sure you want to leave?",
});
```

---

## Context-Based Hooks

### `useAuthState`

Access authentication state from context.

**Returns:** `AuthState`

- `user: User | null` - Current user
- `isAuthenticated: boolean` - Authentication status
- `loading: boolean` - Loading state

**Usage:**

```tsx
const { user, isAuthenticated } = useAuthState();

if (!isAuthenticated) {
  return <LoginPrompt />;
}
```

### `useAuthActions`

Access authentication actions from context.

**Returns:** `AuthActions`

- `login: (credentials: LoginCredentials) => Promise<void>` - Login
- `logout: () => Promise<void>` - Logout
- `register: (data: RegisterData) => Promise<void>` - Register
- `updateProfile: (data: Partial<User>) => Promise<void>` - Update profile

**Usage:**

```tsx
const { login, logout } = useAuthActions();

const handleLogin = async (email, password) => {
  await login({ email, password });
};
```

### `useCart`

Manage shopping cart state.

**Parameters:**

- `options?: UseCartOptions`
  - `service?: CartService` - Custom cart service

**Returns:** `UseCartReturn`

- `cart: Cart` - Cart state
- `items: CartItemHook[]` - Cart items
- `total: number` - Cart total
- `itemCount: number` - Number of items
- `addItem: (item: CartItem) => void` - Add to cart
- `removeItem: (itemId: string) => void` - Remove from cart
- `updateQuantity: (itemId: string, quantity: number) => void` - Update quantity
- `clearCart: () => void` - Clear cart

**Usage:**

```tsx
const { items, total, addItem, removeItem } = useCart();

<button onClick={() => addItem(product)}>Add to Cart</button>;
```

### `useHeaderStats`

Get header statistics (cart count, notifications, etc).

**Parameters:**

- `options?: UseHeaderStatsOptions`

**Returns:** `UseHeaderStatsReturn`

- `cartCount: number` - Cart items count
- `notificationCount: number` - Unread notifications
- `messageCount: number` - Unread messages
- `loading: boolean` - Loading state

---

## Upload Hooks

### `useMediaUpload`

Handle media file uploads.

**Parameters:**

- `options: MediaUploadOptions`
  - `onUpload: (file: File) => Promise<string>` - Upload handler
  - `maxSize?: number` - Max file size (bytes)
  - `accept?: string` - Accepted file types
  - `onProgress?: (progress: number) => void` - Progress callback

**Returns:** `MediaUploadReturn`

- `upload: (file: File) => Promise<string>` - Upload function
- `uploading: boolean` - Upload in progress
- `progress: number` - Upload progress (0-100)
- `error: Error | null` - Upload error
- `cancel: () => void` - Cancel upload

**Usage:**

```tsx
const { upload, uploading, progress, error } = useMediaUpload({
  onUpload: async (file) => {
    return await uploadToServer(file);
  },
  maxSize: 5 * 1024 * 1024,
});

const handleFileSelect = async (e) => {
  const file = e.target.files[0];
  const url = await upload(file);
};
```

---

## Table & Data Hooks

### `useBulkSelection`

Manage bulk row selection in tables.

**Parameters:**

- `options: UseBulkSelectionOptions`
  - `items: T[]` - All items
  - `getId?: (item: T) => string` - Get item ID function

**Returns:** `UseBulkSelectionReturn`

- `selectedIds: Set<string>` - Selected item IDs
- `selectedItems: T[]` - Selected items
- `isSelected: (id: string) => boolean` - Check if selected
- `toggleSelection: (id: string) => void` - Toggle single item
- `selectAll: () => void` - Select all items
- `deselectAll: () => void` - Deselect all
- `isAllSelected: boolean` - All items selected flag

**Usage:**

```tsx
const { selectedIds, isSelected, toggleSelection, selectAll } =
  useBulkSelection({ items: users });

<Checkbox
  checked={isSelected(user.id)}
  onChange={() => toggleSelection(user.id)}
/>;
```

### `useLoadingState`

Manage loading state for async operations.

**Parameters:**

- `options?: UseLoadingStateOptions`
  - `initialState?: boolean` - Initial loading state

**Returns:** `UseLoadingStateReturn`

- `loading: boolean` - Loading state
- `startLoading: () => void` - Set loading to true
- `stopLoading: () => void` - Set loading to false
- `withLoading: <T>(fn: () => Promise<T>) => Promise<T>` - Wrap async function

**Usage:**

```tsx
const { loading, withLoading } = useLoadingState();

const handleSubmit = async () => {
  await withLoading(async () => {
    await saveData();
  });
};
```

### `useMultiLoadingState`

Manage multiple loading states with keys.

**Returns:**

```tsx
{
  isLoading: (key: string) => boolean;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isAnyLoading: boolean;
}
```

### `usePaginationState`

Manage pagination state.

**Parameters:**

- `config?: PaginationConfig`
  - `initialPage?: number` - Initial page (default: 1)
  - `pageSize?: number` - Items per page (default: 10)

**Returns:** `UsePaginationStateReturn`

- `page: number` - Current page
- `pageSize: number` - Items per page
- `setPage: (page: number) => void` - Set page
- `setPageSize: (size: number) => void` - Set page size
- `nextPage: () => void` - Go to next page
- `previousPage: () => void` - Go to previous page
- `goToFirstPage: () => void` - Go to first page
- `goToLastPage: (totalPages: number) => void` - Go to last page

### `useResourceList`

Fetch and manage resource lists.

**Parameters:**

- `options: UseResourceListOptions`
  - `fetcher: (params) => Promise<T[]>` - Data fetcher
  - `filters?: FilterConfig` - Filter configuration
  - `sort?: SortField` - Sort configuration
  - `pagination?: SievePagination` - Pagination config

**Returns:** `UseResourceListReturn`

- `data: T[]` - Resource list
- `loading: boolean` - Loading state
- `error: Error | null` - Error state
- `reload: () => void` - Reload data
- `filters: FilterState` - Current filters
- `setFilter: (key: string, value: any) => void` - Set filter
- `pagination: PaginationState` - Pagination state

### `useResourceListState`

Manage resource list state (client-side).

**Parameters:**

- `config: ResourceListConfig<T>`
  - `data: T[]` - All data
  - `filterFn?: (item: T, filters: FilterState) => boolean` - Filter function
  - `sortFn?: (a: T, b: T) => number` - Sort function

**Returns:** `UseResourceListStateReturn`

- `filteredData: T[]` - Filtered/sorted data
- `paginatedData: T[]` - Paginated data
- `filters: FilterState` - Current filters
- `pagination: PaginationState` - Pagination state
- `setFilter: (key: string, value: any) => void` - Set filter
- `setPage: (page: number) => void` - Set page

### `useFetchResourceList`

Fetch resource list with caching.

**Parameters:**

- `config: FetchResourceListConfig`
  - `url: string` - API endpoint
  - `params?: object` - Query parameters
  - `cacheKey?: string` - Cache key

**Returns:** `UseFetchResourceListReturn`

- `data: T[]` - Fetched data
- `loading: boolean` - Loading state
- `error: Error | null` - Error state
- `refetch: () => void` - Refetch data

---

## Pagination Hooks

### `useUrlPagination`

Sync pagination with URL parameters.

**Parameters:**

- `options: UseUrlPaginationOptions`
  - `router: UseUrlPaginationRouter` - Router integration
  - `initialPage?: number` - Initial page
  - `pageSize?: number` - Items per page

**Returns:** `UseUrlPaginationReturn`

- `page: number` - Current page from URL
- `pageSize: number` - Items per page
- `setPage: (page: number) => void` - Update page in URL
- `setPageSize: (size: number) => void` - Update page size in URL

**Usage:**

```tsx
const { page, setPage } = useUrlPagination({
  router: useRouter(),
});
```

### `useInfiniteScroll`

Infinite scroll pagination.

**Parameters:**

- `options: UseInfiniteScrollOptions`
  - `loadMore: () => Promise<void>` - Load more function
  - `hasMore: boolean` - Has more items flag
  - `threshold?: number` - Scroll threshold (px)

**Returns:** `UseInfiniteScrollReturn`

- `ref: RefObject` - Ref for scroll container
- `loading: boolean` - Loading state
- `loadMore: () => void` - Manual load more

**Usage:**

```tsx
const { ref, loading } = useInfiniteScroll({
  loadMore: async () => {
    await fetchMoreItems();
  },
  hasMore: hasNextPage,
});

<div ref={ref}>
  {items.map((item) => (
    <Item key={item.id} />
  ))}
  {loading && <LoadingSpinner />}
</div>;
```

### `useVirtualList`

Virtual list for large datasets.

**Parameters:**

- `options: UseVirtualListOptions`
  - `items: T[]` - All items
  - `itemHeight: number` - Fixed item height
  - `containerHeight: number` - Container height
  - `overscan?: number` - Overscan count

**Returns:** `UseVirtualListReturn`

- `virtualItems: T[]` - Visible items
- `startIndex: number` - First visible index
- `endIndex: number` - Last visible index
- `scrollToIndex: (index: number) => void` - Scroll to index

### `useVirtualGrid`

Virtual grid for large datasets.

Similar to `useVirtualList` but for grid layouts.

---

## Form Hooks

### `useFormState`

Manage form state with validation.

**Parameters:**

- `options: UseFormStateOptions<T>`
  - `initialValues: T` - Initial form values
  - `validate?: (values: T) => object` - Validation function
  - `onSubmit: (values: T) => Promise<void>` - Submit handler

**Returns:** `UseFormStateReturn<T>`

- `values: T` - Current form values
- `errors: object` - Validation errors
- `touched: object` - Touched fields
- `isValid: boolean` - Form valid flag
- `isSubmitting: boolean` - Submitting flag
- `handleChange: (field: string, value: any) => void` - Change handler
- `handleBlur: (field: string) => void` - Blur handler
- `handleSubmit: () => Promise<void>` - Submit handler
- `reset: () => void` - Reset form
- `setFieldValue: (field: string, value: any) => void` - Set field value
- `setFieldError: (field: string, error: string) => void` - Set field error

**Usage:**

```tsx
const form = useFormState({
  initialValues: { name: "", email: "" },
  validate: (values) => {
    const errors = {};
    if (!values.email) errors.email = "Required";
    return errors;
  },
  onSubmit: async (values) => {
    await saveData(values);
  },
});

<input
  value={form.values.name}
  onChange={(e) => form.handleChange("name", e.target.value)}
  onBlur={() => form.handleBlur("name")}
/>;
{
  form.errors.name && <span>{form.errors.name}</span>;
}
```

### `useDialogState`

Manage dialog/modal state.

**Parameters:**

- `config?: DialogStateConfig`
  - `defaultOpen?: boolean` - Default open state

**Returns:** `UseDialogStateReturn`

- `isOpen: boolean` - Dialog open state
- `open: () => void` - Open dialog
- `close: () => void` - Close dialog
- `toggle: () => void` - Toggle dialog

### `useMultipleDialogs`

Manage multiple dialogs with keys.

**Returns:** `UseMultipleDialogsReturn`

- `isOpen: (key: string) => boolean` - Check if dialog open
- `open: (key: string) => void` - Open dialog
- `close: (key: string) => void` - Close dialog
- `closeAll: () => void` - Close all dialogs

### `usePasswordFieldState`

Manage password field visibility toggle.

**Returns:** `UsePasswordFieldStateReturn`

- `showPassword: boolean` - Password visible flag
- `toggleVisibility: () => void` - Toggle visibility
- `type: 'password' | 'text'` - Input type

**Usage:**

```tsx
const { type, toggleVisibility } = usePasswordFieldState();

<input type={type} />
<button onClick={toggleVisibility}>Show/Hide</button>
```

### `useSlugValidation`

Validate and generate URL slugs.

**Parameters:**

- `options: UseSlugValidationOptions`
  - `checkAvailability?: (slug: string) => Promise<boolean>` - Availability check
  - `debounce?: number` - Debounce delay

**Returns:** `UseSlugValidationReturn`

- `slug: string` - Current slug
- `setSlug: (slug: string) => void` - Set slug
- `generateSlug: (text: string) => string` - Generate from text
- `isValid: boolean` - Slug valid flag
- `isAvailable: boolean` - Slug available flag
- `checking: boolean` - Checking availability

### `useWizardFormState`

Manage multi-step wizard form.

**Parameters:**

- `config: UseWizardFormStateConfig`
  - `steps: string[]` - Step IDs
  - `initialStep?: number` - Initial step index
  - `onStepChange?: (step: number) => void` - Step change callback

**Returns:** `UseWizardFormStateReturn`

- `currentStep: number` - Current step index
- `currentStepId: string` - Current step ID
- `isFirstStep: boolean` - Is first step
- `isLastStep: boolean` - Is last step
- `canGoNext: boolean` - Can go to next step
- `canGoPrevious: boolean` - Can go to previous step
- `goToStep: (step: number) => void` - Go to specific step
- `nextStep: () => void` - Go to next step
- `previousStep: () => void` - Go to previous step
- `completeStep: (stepIndex: number) => void` - Mark step complete
- `isStepComplete: (stepIndex: number) => boolean` - Check if step complete

---

## Data Fetching Hooks

### `useQuery`

Fetch data with caching and loading states.

**Parameters:**

- `options: UseQueryOptions<T>`
  - `queryKey: string | string[]` - Query cache key
  - `queryFn: () => Promise<T>` - Query function
  - `enabled?: boolean` - Enable query (default: true)
  - `refetchOnMount?: boolean` - Refetch on mount
  - `refetchOnWindowFocus?: boolean` - Refetch on window focus
  - `staleTime?: number` - Data stale time (ms)
  - `cacheTime?: number` - Cache time (ms)

**Returns:** `UseQueryResult<T>`

- `data: T | undefined` - Query data
- `loading: boolean` - Loading state
- `error: Error | null` - Error state
- `refetch: () => Promise<void>` - Refetch data
- `isStale: boolean` - Data stale flag

**Usage:**

```tsx
const { data, loading, error, refetch } = useQuery({
  queryKey: ["users", userId],
  queryFn: () => fetchUser(userId),
});

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <UserProfile user={data} />;
```

### `useMutation`

Execute mutations with loading/error states.

**Parameters:**

- `options: UseMutationOptions<T, V>`
  - `mutationFn: (variables: V) => Promise<T>` - Mutation function
  - `onSuccess?: (data: T) => void` - Success callback
  - `onError?: (error: Error) => void` - Error callback
  - `invalidateQueries?: string[]` - Query keys to invalidate

**Returns:** `UseMutationResult<T, V>`

- `mutate: (variables: V) => Promise<T>` - Execute mutation
- `data: T | undefined` - Mutation result
- `loading: boolean` - Loading state
- `error: Error | null` - Error state
- `reset: () => void` - Reset state

**Usage:**

```tsx
const { mutate, loading, error } = useMutation({
  mutationFn: (data) => createUser(data),
  onSuccess: (user) => {
    toast.success("User created!");
  },
});

const handleSubmit = async (formData) => {
  await mutate(formData);
};
```

---

## Hook Composition Examples

### Form with Validation and API

```tsx
function CreateProductForm() {
  const form = useFormState({
    initialValues: { title: "", price: 0 },
    validate: (values) => {
      const errors = {};
      if (!values.title) errors.title = "Required";
      if (values.price <= 0) errors.price = "Must be positive";
      return errors;
    },
    onSubmit: async (values) => {
      await mutate(values);
    },
  });

  const { mutate, loading } = useMutation({
    mutationFn: (data) => createProduct(data),
    onSuccess: () => {
      router.push("/products");
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <FormInput
        name="title"
        label="Title"
        value={form.values.title}
        onChange={(e) => form.handleChange("title", e.target.value)}
        error={form.errors.title}
      />
      <Button type="submit" loading={loading}>
        Create
      </Button>
    </form>
  );
}
```

### Data Table with Filters and Pagination

```tsx
function UsersList() {
  const { filters, setFilter } = useFilters();
  const { page, setPage } = usePaginationState();

  const { data, loading } = useQuery({
    queryKey: ["users", filters, page],
    queryFn: () => fetchUsers({ ...filters, page }),
  });

  return (
    <>
      <FilterSidebar filters={filters} onChange={setFilter} />
      <DataTable data={data?.users} loading={loading} columns={columns} />
      <AdvancedPagination
        page={page}
        total={data?.total}
        onPageChange={setPage}
      />
    </>
  );
}
```

### Multi-Step Wizard

```tsx
function ProductWizard() {
  const wizard = useWizardFormState({
    steps: ["basic", "details", "pricing"],
    onStepChange: (step) => {
      saveProgress(step);
    },
  });

  const form = useFormState({
    initialValues: {},
    onSubmit: async (values) => {
      await createProduct(values);
    },
  });

  return (
    <>
      <WizardSteps steps={wizard.steps} currentStep={wizard.currentStep} />

      {wizard.currentStepId === "basic" && <BasicInfoStep form={form} />}

      <WizardActionBar
        currentStep={wizard.currentStep}
        totalSteps={wizard.steps.length}
        onNext={wizard.nextStep}
        onPrevious={wizard.previousStep}
        onSubmit={form.handleSubmit}
      />
    </>
  );
}
```

---

For more hook examples and advanced patterns, see the [Getting Started Guide](./getting-started.md).
