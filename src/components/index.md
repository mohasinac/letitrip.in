# Components Index

## Loading Skeletons

### Skeleton Components

**Directory**: [skeletons/](skeletons/)
**Status**: ✅ Complete

Loading skeleton components that match the layout of actual components for seamless loading states.

**Components**:

- **ProductCardSkeleton** - Skeleton for product card in grid view
  - Matches ProductCard layout with image, title, price, rating, shop name, and actions
  - ProductCardSkeletonGrid for grid layouts (configurable count)
  
- **ProductListSkeleton** - Skeleton for product list view
  - Horizontal layout with image, details, price, rating, shop info, and actions
  - ProductListSkeletonList for list layouts (configurable count)
  
- **UserProfileSkeleton** - Skeleton for user profile page
  - Profile header with avatar, user info, and stats
  - Personal and address information sections
  - Recent activity section
  
- **OrderCardSkeleton** - Skeleton for order cards
  - Order header with ID, date, and status badge
  - Order items with images and details
  - Order footer with total and actions
  - OrderCardSkeletonList for multiple orders (configurable count)

**Features**:

- ✅ Tailwind CSS animate-pulse animation
- ✅ Matches actual component dimensions and spacing
- ✅ Gray color scheme (gray-200) for neutral appearance
- ✅ Configurable count for grid/list variants
- ✅ Responsive design matching actual components
- ✅ No dependencies beyond Tailwind CSS

**Usage**:

```tsx
import { ProductCardSkeletonGrid, ProductListSkeletonList } from "@/components/skeletons";

// Product grid loading state
<ProductCardSkeletonGrid count={8} />

// Product list loading state
<ProductListSkeletonList count={5} />

// Single skeletons
<ProductCardSkeleton />
<OrderCardSkeleton />
<UserProfileSkeleton />
```

---

## Error Handling

### ErrorBoundary

**File**: [error-boundary.tsx](error-boundary.tsx)
**Status**: ✅ Complete

React 19 Error Boundary implementation with:

- Class component with componentDidCatch lifecycle
- Error logging integration via logServiceError
- Reset functionality (resetErrorBoundary method)
- Default error fallback UI with error display
- Custom fallback support via props
- Development mode error details (stack trace)
- Section-specific error boundary wrapper

**Usage**:

```tsx
// Global app wrapper
<ErrorBoundary>
  <App />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={(error, reset) => <CustomUI error={error} onReset={reset} />}>
  <Component />
</ErrorBoundary>

// Section-specific boundary
<SectionErrorBoundary sectionName="Product List">
  <ProductList />
</SectionErrorBoundary>
```

**Features**:

- Integrates with typed error system (isAppError)
- Error logger integration
- Graceful error recovery with retry
- User-friendly error messages
- Development vs production modes
- Go home and contact support actions
