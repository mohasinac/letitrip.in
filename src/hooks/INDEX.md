# Custom Hooks Documentation

Comprehensive documentation for all reusable React hooks in the application.

## Table of Contents

- [Authentication](#authentication)
- [Data Fetching (React Query)](#data-fetching-react-query)
- [Form Management](#form-management)
- [UI State Management](#ui-state-management)
- [List & Pagination](#list--pagination)
- [Virtual Scrolling](#virtual-scrolling)
- [URL Synchronization](#url-synchronization)
- [E-commerce](#e-commerce)
- [Media & Upload](#media--upload)
- [Utilities](#utilities)

## Authentication

### useAuthState.ts

**Export:** `useAuthState(): AuthState`

Hook to access authentication state without actions. Provides read-only access to authentication state.

**Benefits:**

- Components only re-render when state changes (not when actions are called)
- Optimized performance for components that display user info
- Type-safe access to auth state

**Returns:**

- `user: UserFE | null` - Current authenticated user or null
- `loading: boolean` - Whether auth state is being initialized
- `isAuthenticated: boolean` - Whether a user is logged in
- `isAdmin: boolean` - Whether current user is an admin
- `isSeller: boolean` - Whether current user is a seller
- `isAdminOrSeller: boolean` - Whether current user is admin or seller

**Throws:** Error if used outside of AuthProvider

**Example:**

```tsx
function UserProfile() {
  const { user, loading } = useAuthState();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return <div>{user.displayName}</div>;
}
```

---

### useAuthActions.ts

**Export:** `useAuthActions(): AuthActions`

Hook to access authentication actions without state. Provides access to authentication methods.

**Benefits:**

- Components only re-render when new action functions are provided (rare)
- Optimized performance for forms and action buttons
- Type-safe access to auth methods

**Returns:**

- `login(email, password, rememberMe?): Promise<AuthResponse>` - Login with credentials
- `loginWithGoogle(idToken, userData?): Promise<GoogleAuthResponse>` - Login with Google
- `register(data): Promise<AuthResponse>` - Create new user account
- `logout(): Promise<void>` - Logout current user
- `refreshUser(): Promise<void>` - Refresh user data from server

**Throws:** Error if used outside of AuthProvider

**Example:**

```tsx
function LoginForm() {
  const { login } = useAuthActions();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Data Fetching (React Query)

### queries/useProduct.ts ✅

**Exports:** Product data fetching and mutation hooks using React Query

**Query Hooks:**

- `useProduct(id, options?)` - Fetch single product by ID
- `useProductBySlug(slug, options?)` - Fetch single product by slug
- `useProducts(filters?, options?)` - Fetch paginated list of products
- `useProductReviews(productId, options?)` - Fetch product reviews
- `useProductVariants(productId, options?)` - Fetch product variants
- `useSimilarProducts(productId, options?)` - Fetch similar products
- `useFeaturedProducts(options?)` - Fetch featured products

**Mutation Hooks:**

- `useCreateProduct(options?)` - Create new product
- `useUpdateProduct(options?)` - Update product by ID
- `useUpdateProductBySlug(options?)` - Update product by slug
- `useDeleteProduct(options?)` - Delete product
- `useUpdateProductStock(options?)` - Update product stock
- `useUpdateProductStatus(options?)` - Update product status (draft/published/archived)
- `useBulkDeleteProducts(options?)` - Delete multiple products

**Features:**

- ✅ **Automatic caching** with 5-minute stale time
- ✅ **Background refetching** on reconnect
- ✅ **Optimistic updates** via cache invalidation
- ✅ **Type-safe** queries and mutations
- ✅ **Automatic error handling** via React Query
- ✅ **Loading states** built-in
- ✅ **Retry logic** with exponential backoff

**Query Hook Example:**

```tsx
function ProductPage({ id }: { id: string }) {
  const { data: product, isLoading, error } = useProduct(id);

  if (isLoading) return <Skeleton />;
  if (error) return <Error message={error.message} />;
  if (!product) return <NotFound />;

  return <ProductDetails product={product} />;
}
```

**Mutation Hook Example:**

```tsx
function CreateProductForm() {
  const createProduct = useCreateProduct({
    onSuccess: (product) => {
      toast.success("Product created!");
      router.push(`/products/${product.slug}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (data: ProductFormFE) => {
    createProduct.mutate(data);
  };

  return <Form onSubmit={handleSubmit} loading={createProduct.isPending} />;
}
```

**Cache Invalidation:**

Mutations automatically invalidate relevant queries:

- Create/Update/Delete → Invalidates product lists
- Update specific product → Invalidates that product detail
- Bulk operations → Invalidates all product queries

### queries/useCart.ts ✅

**Exports:** Cart data fetching and mutation hooks

**Query Hooks:**

- `useCart(options?)` - Fetch current user's cart

**Mutation Hooks:**

- `useAddToCart(options?)` - Add item to cart
- `useUpdateCartItem(options?)` - Update cart item quantity
- `useRemoveFromCart(options?)` - Remove item from cart
- `useClearCart(options?)` - Clear entire cart
- `useApplyCoupon(options?)` - Apply coupon code
- `useRemoveCoupon(options?)` - Remove applied coupon

**Example:**

```tsx
function CartPage() {
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem({
    onSuccess: () => toast.success("Cart updated"),
  });

  return (
    <div>
      {cart?.items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onUpdateQuantity={(quantity) =>
            updateItem.mutate({ itemId: item.id, quantity })
          }
        />
      ))}
    </div>
  );
}
```

### queries/useUser.ts ✅

**Exports:** User profile data fetching and mutation hooks

**Query Hooks:**

- `useCurrentUser(options?)` - Fetch current user profile
- `useUser(id, options?)` - Fetch user by ID
- `useUsers(filters?, options?)` - Fetch paginated list of users

**Mutation Hooks:**

- `useUpdateProfile(options?)` - Update user profile
- `useUploadAvatar(options?)` - Upload new avatar
- `useDeleteAvatar(options?)` - Delete current avatar
- `useChangePassword(options?)` - Change password
- `useSendEmailVerification(options?)` - Send verification email
- `useVerifyEmail(options?)` - Verify email with OTP code

**Example:**

```tsx
function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile({
    onSuccess: () => toast.success("Profile updated!"),
  });

  return (
    <Form
      onSubmit={(data) => updateProfile.mutate(data)}
      loading={updateProfile.isPending}
    />
  );
}
```

### queries/useShop.ts ✅

**Exports:** Shop data fetching and mutation hooks

**Query Hooks:**

- `useShop(id, options?)` - Fetch shop by ID
- `useShopBySlug(slug, options?)` - Fetch shop by slug
- `useShops(filters?, options?)` - Fetch paginated list of shops
- `useShopStats(shopId, options?)` - Fetch shop statistics
- `useFollowingShops(options?)` - Fetch user's followed shops
- `useFeaturedShops(options?)` - Fetch featured shops

**Mutation Hooks:**

- `useCreateShop(options?)` - Create new shop
- `useUpdateShop(options?)` - Update shop details
- `useFollowShop(options?)` - Follow a shop
- `useUnfollowShop(options?)` - Unfollow a shop

**Example:**

```tsx
function ShopPage({ slug }: { slug: string }) {
  const { data: shop, isLoading } = useShopBySlug(slug);
  const followShop = useFollowShop({
    onSuccess: () => toast.success("Now following shop!"),
  });

  return (
    <div>
      <ShopHeader shop={shop} />
      <Button onClick={() => followShop.mutate(shop.id)}>Follow</Button>
    </div>
  );
}
```

### queries/useOrder.ts ✅

**Exports:** Order data fetching and mutation hooks

**Query Hooks:**

- `useOrder(id, options?)` - Fetch order by ID
- `useOrders(filters?, options?)` - Fetch paginated list of orders

**Mutation Hooks:**

- `useCreateOrder(options?)` - Create new order
- `useCancelOrder(options?)` - Cancel existing order

**Example:**

```tsx
function OrdersPage() {
  const { data, isLoading } = useOrders({ status: "pending" });

  return (
    <div>
      {data?.data.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

### queries/useCategory.ts ✅

**Exports:** Category data fetching hooks (read-only)

**Query Hooks:**

- `useCategories(filters?, options?)` - Fetch all categories
- `useCategoryTree(parentId?, options?)` - Fetch hierarchical category tree
- `useCategory(id, options?)` - Fetch category by ID

**Features:**

- Extended stale time (15 minutes) for rarely-changing data
- Hierarchical tree structure support
- Efficient caching

**Example:**

```tsx
function CategoryNav() {
  const { data: tree, isLoading } = useCategoryTree();

  return (
    <nav>
      {tree?.map((category) => (
        <CategoryTreeNode key={category.id} node={category} />
      ))}
    </nav>
  );
}
```

---

## Form Management

### useFormState.ts

**Export:** `useFormState<T>(options): UseFormStateReturn<T>`

Generic form state management with validation and error handling. Supports Zod schema validation and async validation for type-safe form validation.

**Parameters:**

- `initialData: T` - Initial form values
- `onDataChange?: (data: T) => void` - Callback on data change
- `onValidate?: (data: T) => Record<string, string>` - Custom validation function
- `schema?: z.ZodSchema<T>` - Zod schema for type-safe validation
- `asyncValidators?: Partial<Record<keyof T, AsyncValidator>>` - Async validators for fields (NEW)
- `debounceMs?: number` - Debounce delay for async validation (default: 300ms) (NEW)
- `validateOnChange?: boolean` - Validate on change (default: false)
- `validateOnBlur?: boolean` - Validate on blur (default: true)

**Returns:**

- `formData: T` - Current form data
- `errors: Record<string, string>` - Validation errors by field
- `touched: Record<string, boolean>` - Touched fields
- `validatingFields: Record<string, boolean>` - Fields being validated asynchronously (NEW)
- `setFieldValue(field, value): void` - Update single field
- `setFieldError(field, error): void` - Set field error
- `handleChange(e): void` - Input change handler
- `handleBlur(e): void` - Input blur handler
- `setFormData(data): void` - Update all form data
- `reset(newData?): void` - Reset form
- `validate(): Promise<boolean>` - Validate all fields (now async) (UPDATED)
- `validateField(field): Promise<boolean>` - Validate a specific field (now async) (UPDATED)
- `isValid: boolean` - Form validity status
- `isValidating: boolean` - Whether form is currently being validated

**Example with Async Validation:**

```typescript
const { formData, handleChange, errors, validatingFields } = useFormState({
  initialData: { email: "", username: "" },
  schema: z.object({
    email: z.string().email("Invalid email"),
    username: z.string().min(3, "Username too short")
  }),
  asyncValidators: {
    email: async (value) => {
      const exists = await checkEmailExists(value);
      return exists ? "Email already taken" : null;
    },
    username: async (value) => {
      const exists = await checkUsernameExists(value);
      return exists ? "Username already taken" : null;
    }
  },
  debounceMs: 500,
  validateOnChange: true
});
```

**Features:**

- ✅ Zod schema validation support
- ✅ Async validation with debouncing
- ✅ Automatic cancellation of previous async validations
- ✅ Per-field loading indicators
- ✅ Field-level validation
- ✅ Configurable validation timing (onChange, onBlur, manual)
- ✅ Full TypeScript type inference from schema
- ✅ Compatible with custom validation functions

---

### usePasswordFieldState.ts

**Export:** `usePasswordFieldState(password): PasswordFieldState`

Manages password visibility and strength validation.

**Returns:**

- `showPassword: boolean`
- `togglePasswordVisibility(): void`
- `passwordStrength: { score: number, feedback: string }`

---

### useWizardFormState.ts

**Export:** `useWizardFormState<T>(config): WizardFormState<T>`

Multi-step wizard form with validation and navigation.

**Returns:**

- `currentStep: number`
- `formData: T`
- `goToNextStep(): void`
- `goToPreviousStep(): void`
- `goToStep(step): void`
- `canProceed: boolean`
- `isFirstStep: boolean`
- `isLastStep: boolean`
- `handleSubmit(): Promise<void>`

---

### useCheckoutState.ts

**Export:** `useCheckoutState(): CheckoutState`

Specialized multi-step checkout flow state.

**Returns:**

- All wizard form state
- `shippingAddress: Address | null`
- `paymentMethod: PaymentMethod | null`
- `setShippingAddress(address): void`
- `setPaymentMethod(method): void`

---

## UI State Management

### useDialogState.ts

**Exports:** `useDialogState()`, `useMultipleDialogs()`

**useDialogState Returns:**

- `isOpen: boolean`
- `open(): void`
- `close(): void`
- `toggle(): void`
- `data: any` - Optional dialog data

**useMultipleDialogs Returns:**

- `dialogs: Record<string, boolean>` - All dialog states
- `openDialog(key): void`
- `closeDialog(key): void`
- `closeAll(): void`
- `isOpen(key): boolean`

---

### useLoadingState.ts

**Exports:** `useLoadingState<T>()`, `useMultiLoadingState()`

**useLoadingState Returns:**

- `loading: boolean`
- `error: string | null`
- `data: T | null`
- `success: boolean`
- `setLoading(loading): void`
- `setError(error): void`
- `setData(data): void`
- `reset(): void`

**useMultiLoadingState Returns:**

- `loadingStates: Record<string, LoadingState>`
- `startLoading(key): void`
- `setError(key, error): void`
- `setSuccess(key, data): void`
- `reset(key): void`

---

### useBulkSelection.ts

**Export:** `useBulkSelection<T>(items, idField?): BulkSelectionState<T>`

Manages checkbox-based bulk selection.

**Returns:**

- `selectedItems: Set<string>`
- `isSelected(id): boolean`
- `toggleSelection(id): void`
- `selectAll(): void`
- `clearSelection(): void`
- `selectedCount: number`
- `allSelected: boolean`
- `someSelected: boolean`
- `getSelectedItems(): T[]`

---

### useNavigationGuard.ts

**Export:** `useNavigationGuard(hasChanges, message?): void`

Prevents navigation with unsaved changes.

**Parameters:**

- `hasChanges: boolean` - Whether form has unsaved changes
- `message?: string` - Confirmation message (default provided)

---

## List & Pagination

### usePaginationState.ts

**Export:** `usePaginationState(config): PaginationState`

**Parameters:**

- `initialPage?: number` (default: 1)
- `pageSize?: number` (default: 20)
- `totalItems?: number`

**Returns:**

- `currentPage: number`
- `pageSize: number`
- `totalPages: number`
- `totalItems: number`
- `goToPage(page): void`
- `goToNextPage(): void`
- `goToPreviousPage(): void`
- `setPageSize(size): void`
- `hasNextPage: boolean`
- `hasPreviousPage: boolean`
- `reset(): void`

---

### useResourceListState.ts

**Export:** `useResourceListState<T>(config): ResourceListState<T>`

Complete resource list management with filters, pagination, and selection.

**Returns:**

- `items: T[]`
- `setItems(items): void`
- `filters: Record<string, any>`
- `setFilter(key, value): void`
- `clearFilters(): void`
- `pagination: PaginationState`
- `selection: BulkSelectionState<T>`
- `loading: boolean`
- `error: string | null`
- `searchQuery: string`
- `setSearchQuery(query): void`
- `sort: { field: string, direction: 'asc' | 'desc' }`
- `setSort(field, direction): void`

---

### useFetchResourceList.ts

**Export:** `useFetchResourceList<T>(config): FetchResourceListState<T>`

Resource list with automatic API fetching.

**Parameters:**

- `fetchFn: () => Promise<T[]>` - Fetch function
- `dependencies?: any[]` - Refetch dependencies
- `autoFetch?: boolean` (default: true)

**Returns:**

- All from `useResourceListState`
- `refetch(): Promise<void>`
- `refreshing: boolean`

---

## Virtual Scrolling

### useVirtualList.ts ✅

**Export:** `useVirtualList(options): UseVirtualListReturn`

Hook for implementing virtual scrolling with large lists. Only renders items visible in the viewport, dramatically improving performance for lists with hundreds or thousands of items.

**Parameters:**

- `count: number` - Total number of items in the list (required)
- `estimateSize?: number` - Estimated size of each item in pixels (default: 50)
- `overscan?: number` - Number of items to render outside visible area (default: 5)
- `horizontal?: boolean` - Enable horizontal scrolling (default: false)
- `scrollMargin?: number` - Scroll margin in pixels (default: 0)
- `gap?: number` - Gap between items in pixels (default: 0)
- `dynamic?: boolean` - Enable dynamic item sizing for variable heights (default: false)

**Returns:**

- `virtualItems: Array` - Virtual items to render (index, key, size, start, end)
- `totalSize: number` - Total size of scrollable area
- `parentRef: React.RefObject<HTMLDivElement>` - Ref for scrollable container
- `measureElement: (element) => void` - Measure item size (for dynamic sizing)
- `scrollToIndex: (index, options?) => void` - Scroll to specific item
- `scrollToOffset: (offset, options?) => void` - Scroll to specific offset
- `virtualizer` - Virtualizer instance for advanced use

**Example - Basic List:**

```tsx
function ProductList({ products }: { products: Product[] }) {
  const { virtualItems, totalSize, parentRef } = useVirtualList({
    count: products.length,
    estimateSize: 200, // Estimated height of each product card
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div style={{ height: `${totalSize}px`, position: "relative" }}>
        {virtualItems.map((virtualItem) => {
          const product = products[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <ProductCard product={product} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Example - Dynamic Sizing:**

```tsx
function DynamicList({ items }: { items: Item[] }) {
  const { virtualItems, totalSize, parentRef, measureElement } = useVirtualList(
    {
      count: items.length,
      estimateSize: 100,
      dynamic: true, // Enable dynamic sizing
    }
  );

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div style={{ height: `${totalSize}px`, position: "relative" }}>
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={measureElement}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ItemCard item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### useVirtualGrid.ts ✅

**Export:** `useVirtualGrid(options): UseVirtualGridReturn`

Hook for grid-based virtual scrolling. Virtualizes rows while displaying multiple columns per row.

**Parameters:**

- All parameters from `useVirtualList`
- `columns: number` - Number of columns in the grid (required)

**Returns:**

- All returns from `useVirtualList`
- `columns: number` - Number of columns
- `rowCount: number` - Calculated number of rows

**Example - Product Grid:**

```tsx
function ProductGrid({ products }: { products: Product[] }) {
  const columns = 4;
  const rowCount = Math.ceil(products.length / columns);

  const { virtualItems, totalSize, parentRef } = useVirtualList({
    count: rowCount,
    estimateSize: 300, // Height of each row
    overscan: 2,
  });

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div style={{ height: `${totalSize}px`, position: "relative" }}>
        {virtualItems.map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowProducts = products.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="grid grid-cols-4 gap-4">
                {rowProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Benefits:**

- **Performance**: Render only visible items (10-50 items instead of 1000+)
- **Memory**: Reduced DOM nodes and memory usage
- **Smooth Scrolling**: Maintains 60 FPS even with thousands of items
- **Dynamic Sizing**: Supports items with variable heights/widths
- **Horizontal**: Supports both vertical and horizontal scrolling
- **Grid Support**: Easy grid implementation with row virtualization

**Use Cases:**

- Product lists with 100+ items
- Search results with thousands of entries
- Order history lists
- Message/chat lists
- Admin tables with many rows
- Image galleries
- Any large dataset that needs scrolling

---

## URL Synchronization

### useUrlFilters.ts

**Export:** `useUrlFilters(schema): UrlFiltersState`

Syncs filter state with URL query params.

**Parameters:**

- `schema: Record<string, 'string' | 'number' | 'boolean'>` - Filter types

**Returns:**

- `filters: Record<string, any>`
- `setFilter(key, value): void`
- `clearFilter(key): void`
- `clearFilters(): void`

---

### useUrlPagination.ts

**Export:** `useUrlPagination(config): UrlPaginationState`

Syncs pagination with URL query params.

**Parameters:**

- `defaultPage?: number`
- `defaultPageSize?: number`

**Returns:**

- `page: number`
- `pageSize: number`
- `setPage(page): void`
- `setPageSize(size): void`

---

## E-commerce

### useCart.ts

**Export:** `useCart(): CartState`

Shopping cart management with guest/user support.

**Returns:**

- `cart: CartFE | null`
- `loading: boolean`
- `error: string | null`
- `isMerging: boolean` - Merging guest cart to user cart
- `mergeSuccess: boolean`
- `addItem(item): Promise<void>`
- `removeItem(itemId): Promise<void>`
- `updateQuantity(itemId, quantity): Promise<void>`
- `clearCart(): Promise<void>`
- `refetchCart(): Promise<void>`
- `itemCount: number`
- `subtotal: number`
- `total: number`

---

## Media & Upload

### useMediaUpload.ts

**Export:** `useMediaUpload(config): MediaUploadState`

File upload with progress tracking.

**Parameters:**

- `maxSize?: number` - Max file size in bytes
- `allowedTypes?: string[]` - Allowed MIME types
- `multiple?: boolean` - Allow multiple files

**Returns:**

- `upload(files): Promise<string[]>` - Upload files, returns URLs
- `uploading: boolean`
- `progress: number` - Upload progress 0-100
- `error: string | null`
- `uploadedUrls: string[]`
- `cancelUpload(): void`

---

### useMediaUploadWithCleanup.ts

**Export:** `useMediaUploadWithCleanup(config): MediaUploadWithCleanupState`

Media upload with automatic cleanup on unmount.

**Returns:**

- All from `useMediaUpload`
- Auto-cleanup on unmount
- Cleanup on error

---

## Utilities

### useDebounce.ts

**Exports:** `useDebounce<T>(value, delay)`, `useDebouncedCallback(fn, delay)`, `useThrottle<T>(value, delay)`

**useDebounce:**

- Debounces a value
- Returns debounced value

**useDebouncedCallback:**

- Debounces a function
- Returns debounced function

**useThrottle:**

- Throttles a value
- Returns throttled value

---

### useMobile.ts

**Exports:** `useIsMobile(breakpoint?)`, `useIsTouchDevice()`, `useWindowResize()`, `useViewport()`

**useIsMobile:**

- Returns: `boolean` - Is mobile
- Default breakpoint: 768px

**useIsTouchDevice:**

- Returns: `boolean` - Is touch device

**useViewport:**

- Returns: `{ width: number, height: number }`

**useWindowResize:**

- Returns: `{ width: number, height: number }`
- Debounced resize listener

---

### useFilters.ts

**Export:** `useFilters(initial?): FiltersState`

Generic filter state management.

**Returns:**

- `filters: Record<string, any>`
- `setFilter(key, value): void`
- `removeFilter(key): void`
- `clearFilters(): void`
- `activeFiltersCount: number`
- `toQueryString(): string`

---

### useSafeLoad.ts

**Export:** `useSafeLoad<T>(loadFn, deps?): SafeLoadState<T>`

Safe async loading with error handling.

**Returns:**

- `loading: boolean`
- `error: Error | null`
- `data: T | null`
- `retry(): void`

---

### useSlugValidation.ts

**Export:** `useSlugValidation(slug, checkFn): SlugValidationState`

Validates URL slugs with API checking.

**Returns:**

- `valid: boolean`
- `checking: boolean`
- `error: string | null`
- `generateSlug(title): string`

---

### useHeaderStats.ts

**Export:** `useHeaderStats(): HeaderStatsState`

Fetches header statistics (cart count, notifications).

**Returns:**

- `cartCount: number`
- `notificationCount: number`
- `messageCount: number`
- `loading: boolean`
- `refetch(): Promise<void>`

---

### useConversationState.ts

**Export:** `useConversationState(conversationId): ConversationState`

Chat/messaging conversation state.

**Returns:**

- `messages: Message[]`
- `loading: boolean`
- `sendMessage(text): Promise<void>`
- `markAsRead(): Promise<void>`
- `typing: boolean`
- `loadMore(): Promise<void>`

---

## Common Patterns

### Hook Composition

Hooks are designed to be composable. Higher-level hooks use lower-level hooks internally.

Example:

```typescript
// useFetchResourceList uses:
// - useResourceListState
// - useLoadingState
```

### TypeScript Generics

Most hooks support generics for type safety:

```typescript
interface Product { id: string; name: string }
const { formData } = useFormState<Product>({ initialData: {...} });
```

### Return Object Pattern

Hooks return objects with state and functions:

```typescript
const { data, loading, error, refetch } = useHook();
```

### Cleanup

All hooks properly cleanup effects on unmount to prevent memory leaks.

### Performance

- Functions are memoized with `useCallback`
- Values are memoized with `useMemo` when expensive
- Debouncing/throttling for performance-critical operations
