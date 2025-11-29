# Code Quality Patterns

This document describes patterns used to reduce code duplication across the codebase.
Part of E030: Code Quality & SonarCloud Integration.

## API Handler Factory

Located at: `src/app/api/lib/handler-factory.ts`

### Problem

API routes have repeated patterns:

- Try/catch error handling
- Authentication checks
- Authorization/role checks
- Request body parsing
- Response formatting

### Solution

The `createHandler` factory wraps these common patterns:

```typescript
import {
  createHandler,
  successResponse,
  errorResponse,
  paginatedResponse,
  getPaginationParams,
  getFilterParams,
} from "@/app/api/lib/handler-factory";

// Simple handler with automatic error handling
export const GET = createHandler(async (req, ctx) => {
  const items = await fetchItems();
  return successResponse(items);
});

// Authenticated handler
export const POST = createHandler(
  async (req, ctx) => {
    // ctx.user is guaranteed to exist when auth: true
    const item = await createItem(ctx.body, ctx.user.uid);
    return successResponse(item, { status: 201 });
  },
  { auth: true, parseBody: true }
);

// Role-restricted handler
export const DELETE = createHandler(
  async (req, ctx) => {
    await deleteItem(ctx.params.id);
    return successResponse({ deleted: true });
  },
  { roles: ["admin"] }
);

// Paginated list handler
export const GET = createHandler(async (req, ctx) => {
  const { limit, startAfter, sortBy, sortOrder } = getPaginationParams(
    ctx.searchParams
  );
  const filters = getFilterParams(ctx.searchParams, ["status", "category"]);

  const { data, hasNextPage, nextCursor } = await fetchPaginatedItems({
    limit,
    startAfter,
    sortBy,
    sortOrder,
    ...filters,
  });

  return paginatedResponse(data, { limit, hasNextPage, nextCursor });
});
```

### CRUD Handler Factory

For standard CRUD operations:

```typescript
import { createCrudHandlers } from "@/app/api/lib/handler-factory";
import { Collections } from "@/app/api/lib/firebase/collections";

export const { GET, POST, PATCH, DELETE } = createCrudHandlers({
  collection: () => Collections.products(),
  resourceName: "Product",

  // Transform document data before returning
  transform: (id, data) => ({
    id,
    ...data,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }),

  // Custom access control
  canAccess: (user, data) => {
    if (!user) return data.status === "published";
    if (user.role === "admin") return true;
    return data.owner_id === user.uid;
  },

  // Custom modify permission
  canModify: (user, data) => {
    return user.role === "admin" || data.owner_id === user.uid;
  },

  // Required fields for creation
  requiredFields: ["name", "price", "category"],

  // Allowed fields for updates
  allowedUpdateFields: ["name", "price", "description", "status"],
});
```

## useLoadingState Hook

Located at: `src/hooks/useLoadingState.ts`

### Problem

Components have repeated patterns:

- Loading state management
- Error state management
- Initial data fetch
- Retry logic

### Solution

```typescript
import { useLoadingState } from "@/hooks/useLoadingState";

function ProductList() {
  const {
    data: products,
    isLoading,
    error,
    execute,
    retry,
  } = useLoadingState<Product[]>();

  useEffect(() => {
    execute(() => productService.getProducts());
  }, []);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} onRetry={retry} />;
  return <ProductGrid products={products} />;
}
```

### With Options

```typescript
const { data, isLoading, error, execute } = useLoadingState<Order>({
  initialData: null,
  onLoadStart: () => console.log("Loading..."),
  onLoadSuccess: (data) => console.log("Loaded:", data),
  onLoadError: (error) => trackError(error),
  errorAutoResetMs: 5000, // Clear error after 5 seconds
});
```

### Multiple Loaders

```typescript
import { useMultiLoadingState } from "@/hooks/useLoadingState";

function Dashboard() {
  const { states, executeAll, isAnyLoading, hasAnyError } =
    useMultiLoadingState({
      users: () => userService.getUsers(),
      orders: () => orderService.getOrders(),
      stats: () => statsService.getDashboardStats(),
    });

  useEffect(() => {
    executeAll();
  }, []);

  if (isAnyLoading) return <Spinner />;

  return (
    <DashboardView
      users={states.users.data}
      orders={states.orders.data}
      stats={states.stats.data}
    />
  );
}
```

## Existing Patterns (Already Implemented)

### BaseCard Component

`src/components/ui/BaseCard.tsx` - Reusable card for products, auctions, shops.

### BaseTable Component

`src/components/ui/BaseTable.tsx` - Reusable table with loading states, empty states, sorting.

### FormModal Component

`src/components/common/FormModal.tsx` - Base modal for forms with escape handling.

### useSafeLoad Hook

`src/hooks/useSafeLoad.ts` - Prevents infinite API calls with proper dependency tracking.

### Error Classes

`src/app/api/lib/errors.ts` - Consistent API error types (BadRequestError, NotFoundError, etc.)

### RBAC Middleware

`src/app/api/middleware/rbac-auth.ts` - Role-based access control (requireAuth, requireRole, etc.)

### Validation Middleware

`src/app/api/lib/validation-middleware.ts` - Request validation with schemas.

## Pattern Adoption Checklist

When creating new code:

1. **API Routes**

   - [ ] Use `createHandler` instead of raw try/catch
   - [ ] Use `successResponse`/`errorResponse` helpers
   - [ ] Use `getPaginationParams`/`getFilterParams` for list endpoints
   - [ ] Use `withErrorHandler` if not using `createHandler`

2. **Components**

   - [ ] Use `useLoadingState` for data fetching
   - [ ] Use `useSafeLoad` for complex dependency scenarios
   - [ ] Use `BaseCard` for card layouts
   - [ ] Use `BaseTable` for data tables
   - [ ] Use `FormModal` for modal dialogs

3. **Error Handling**
   - [ ] Throw typed errors (BadRequestError, NotFoundError, etc.)
   - [ ] Never return plain string errors
   - [ ] Always include error details in development mode
