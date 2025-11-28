# E019: Common Code Architecture

## Epic Overview

**Epic ID**: E019
**Name**: Common Code Architecture
**Priority**: Critical (Foundation)
**Status**: Active

## Description

Defines the architectural patterns, code organization, and service layer implementation for the JustForView.in platform.

---

## Architecture Layers

### 1. UI Layer (Components)

```
/src/components/
├── admin/         # Admin panel components
├── auction/       # Auction-specific components
├── auth/          # Authentication components
├── cards/         # Reusable card components
├── cart/          # Shopping cart components
├── checkout/      # Checkout flow components
├── common/        # Shared utility components
├── faq/           # FAQ components
├── filters/       # Filter components
├── layout/        # Layout components (header, footer, nav)
├── legal/         # Legal page components
├── media/         # Media upload/display components
├── mobile/        # Mobile-specific components
├── product/       # Product display components
├── seller/        # Seller dashboard components
├── shop/          # Shop display components
└── ui/            # Base UI components (buttons, inputs, modals)
```

### 2. Service Layer

```
/src/services/
├── api.service.ts          # Base HTTP client with caching
├── address.service.ts      # Address management
├── analytics.service.ts    # Analytics tracking
├── auctions.service.ts     # Auction operations
├── auth.service.ts         # Authentication
├── blog.service.ts         # Blog operations
├── cart.service.ts         # Cart management
├── categories.service.ts   # Category operations
├── checkout.service.ts     # Checkout flow
├── coupons.service.ts      # Coupon operations
├── favorites.service.ts    # Wishlist/favorites
├── hero-slides.service.ts  # Homepage slides
├── homepage.service.ts     # Homepage data
├── media.service.ts        # Media upload/management
├── orders.service.ts       # Order management
├── payouts.service.ts      # Payout operations
├── products.service.ts     # Product operations
├── returns.service.ts      # Return management
├── reviews.service.ts      # Review operations
├── search.service.ts       # Search functionality
├── shops.service.ts        # Shop operations
├── support.service.ts      # Support tickets
└── users.service.ts        # User management
```

### 3. Library Layer (Utilities)

```
/src/lib/
├── analytics.ts            # Analytics helpers
├── api-errors.ts           # API error handling
├── batch-fetch.ts          # Batch request utilities
├── category-hierarchy.ts   # Category tree helpers
├── date-utils.ts           # Date formatting
├── error-logger.ts         # Error logging
├── error-redirects.ts      # Error page redirects
├── filter-helpers.ts       # Filter utilities
├── form-validation.ts      # Form validation
├── formatters.ts           # Data formatters
├── payment-logos.ts        # Payment method logos
├── performance.ts          # Performance tracking
├── price.utils.ts          # Price formatting
├── rbac-permissions.ts     # RBAC permission checks
├── rbac.ts                 # Role-based access control
├── utils.ts                # General utilities
├── firebase/               # Firebase configuration
├── media/                  # Media utilities
├── seo/                    # SEO helpers
├── utils/                  # Additional utilities
└── validation/             # Validation schemas
```

### 4. Type System

```
/src/types/
├── backend/                # Server-side types (Firestore documents)
│   ├── user.types.ts
│   ├── product.types.ts
│   ├── auction.types.ts
│   ├── order.types.ts
│   ├── shop.types.ts
│   ├── cart.types.ts
│   ├── review.types.ts
│   ├── coupon.types.ts
│   ├── return.types.ts
│   ├── category.types.ts
│   └── support-ticket.types.ts
├── frontend/               # Client-side types (UI display)
└── shared/                 # Shared types & enums
    └── common.types.ts
```

### 5. API Layer

```
/src/app/api/
├── auth/                   # Authentication endpoints
├── users/                  # User management
├── products/               # Product CRUD
├── auctions/               # Auction CRUD
├── orders/                 # Order management
├── shops/                  # Shop management
├── cart/                   # Cart operations
├── reviews/                # Review CRUD
├── coupons/                # Coupon management
├── returns/                # Return processing
├── tickets/                # Support tickets
├── payments/               # Payment processing
├── payouts/                # Payout management
├── categories/             # Category management
├── media/                  # Media upload
├── hero-slides/            # Homepage slides
├── search/                 # Search endpoints
├── checkout/               # Checkout flow
├── analytics/              # Analytics data
├── admin/                  # Admin-specific endpoints
└── seller/                 # Seller-specific endpoints
```

---

## User Stories

### US-019-001: Service Layer Usage

**As a** developer  
**I want** a consistent service layer pattern  
**So that** all API calls are centralized and type-safe

**Acceptance Criteria**:

- [ ] All API calls go through service layer
- [ ] Services use apiService for HTTP requests
- [ ] Type-safe request/response interfaces
- [ ] Consistent error handling
- [ ] No direct fetch() calls in components

**Implementation Pattern**:

```typescript
// ❌ Wrong - Direct API call in component
const ProductList = () => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);
};

// ✅ Correct - Using service layer
import { productsService } from "@/services";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    productsService.list({ status: "active" }).then(setProducts);
  }, []);
};
```

---

### US-019-002: RBAC Implementation

**As a** developer  
**I want** centralized RBAC permission checks  
**So that** access control is consistent across the application

**Acceptance Criteria**:

- [ ] Use /src/lib/rbac-permissions.ts for all permission checks
- [ ] Role hierarchy: admin(100) > seller(50) > user(10) > guest(0)
- [ ] Resource-based permissions (read, create, update, delete, bulk)
- [ ] Ownership checks for private resources

**Permission Functions**:

```typescript
import {
  canReadResource,
  canWriteResource,
  canDeleteResource,
  hasRole,
  isResourceOwner,
} from "@/lib/rbac-permissions";

// Check if user can read a product
const canRead = canReadResource(user, "products", product);

// Check if user can update an order
const canUpdate = canWriteResource(user, "orders", "update", order);

// Check if user is admin
const isAdmin = hasRole(user, "admin");
```

---

### US-019-003: API Route Constants

**As a** developer  
**I want** centralized API route constants  
**So that** route changes don't break the application

**Acceptance Criteria**:

- [ ] All routes defined in /src/constants/api-routes.ts
- [ ] Routes grouped by resource (AUTH, USER, PRODUCT, etc.)
- [ ] Dynamic route functions for parameterized paths
- [ ] No hardcoded API paths in services or components

**Usage Pattern**:

```typescript
import { API_ROUTES, buildUrl } from "@/constants/api-routes";

// Static route
const loginUrl = API_ROUTES.AUTH.LOGIN;

// Dynamic route
const productUrl = API_ROUTES.PRODUCT.BY_ID("prod_123");

// Route with query params
const searchUrl = buildUrl(API_ROUTES.SEARCH.PRODUCTS, {
  q: "laptop",
  category: "electronics",
});
```

---

### US-019-004: Type Safety Pattern

**As a** developer  
**I want** separate backend and frontend types  
**So that** database models and UI models are properly separated

**Acceptance Criteria**:

- [ ] Backend types in /src/types/backend/ (Firestore documents)
- [ ] Frontend types in /src/types/frontend/ (UI display)
- [ ] Shared enums in /src/types/shared/common.types.ts
- [ ] Transformation functions between BE/FE types

**Type Pattern**:

```typescript
// Backend type (Firestore document)
interface BackendProduct {
  id: string;
  name: string;
  price: number;
  createdAt: Timestamp;
  shopId: string;
}

// Frontend type (UI display)
interface FrontendProduct {
  id: string;
  name: string;
  displayPrice: string;
  createdAt: Date;
  shopName: string;
}
```

---

### US-019-005: Error Handling Pattern

**As a** developer  
**I want** consistent error handling across the application  
**So that** errors are properly logged and displayed

**Acceptance Criteria**:

- [ ] Use /src/lib/api-errors.ts for API error handling
- [ ] Use /src/lib/error-logger.ts for logging
- [ ] Proper HTTP status codes in API responses
- [ ] User-friendly error messages in UI

**Error Pattern**:

```typescript
// API Route error handling
import { createApiError, ApiErrorCode } from "@/lib/api-errors";

export async function GET(request: Request) {
  try {
    // ... logic
  } catch (error) {
    return createApiError(ApiErrorCode.INTERNAL_ERROR, "Failed to fetch data");
  }
}

// Service layer error handling
try {
  await productsService.create(data);
} catch (error) {
  logError("Product creation failed", error);
  toast.error(getErrorMessage(error));
}
```

---

### US-019-006: Caching Strategy

**As a** developer  
**I want** a centralized caching strategy  
**So that** API performance is optimized

**Acceptance Criteria**:

- [ ] Cache configuration in /src/config/cache.config.ts
- [ ] Stale-while-revalidate pattern for GET requests
- [ ] Cache invalidation on mutations
- [ ] Request deduplication

**Cache Pattern**:

```typescript
// apiService automatically handles caching
const products = await apiService.get("/products"); // Cached

// Invalidate cache after mutation
await apiService.post("/products", data);
apiService.invalidateCache("/products");
```

---

### US-019-007: Component Organization

**As a** developer  
**I want** consistent component organization  
**So that** the codebase is maintainable

**Acceptance Criteria**:

- [ ] Components grouped by feature/domain
- [ ] Shared UI components in /src/components/ui/
- [ ] Client/Server component separation
- [ ] Proper use of 'use client' directive

**Component Pattern**:

```
/src/components/product/
├── ProductCard.tsx           # Client component
├── ProductCard.server.tsx    # Server component
├── ProductList.tsx           # List component
├── ProductDetails.tsx        # Detail view
├── ProductForm.tsx           # Create/Edit form
└── index.ts                  # Barrel export
```

---

## API Response Standards

### Success Response

```typescript
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}
```

### Error Response

```typescript
interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
}
```

### Paginated Response

```typescript
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
```

---

## Hooks Organization

```
/src/hooks/
├── useAuth.ts              # Authentication state
├── useCart.ts              # Cart operations
├── useDebounce.ts          # Debounce utility
├── useFavorites.ts         # Favorites/wishlist
├── useInfiniteScroll.ts    # Infinite scroll
├── useMediaQuery.ts        # Responsive breakpoints
├── usePagination.ts        # Pagination logic
├── useSearch.ts            # Search functionality
└── useLocalStorage.ts      # Local storage
```

---

## Context Providers

```
/src/contexts/
├── AuthContext.tsx         # Authentication state
├── CartContext.tsx         # Shopping cart
├── ThemeContext.tsx        # Theme (dark/light)
└── NotificationContext.tsx # Toast notifications
```

---

## Testing Standards

### File Naming

- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- E2E tests: `/tests/e2e/*.spec.ts`

### Test Location

- Co-located with source files for unit tests
- `/tests/` folder for integration and E2E tests

### Coverage Requirements

- Minimum 80% coverage for services
- Minimum 70% coverage for components
- 100% coverage for lib utilities

---

## Related Files

- `/src/constants/api-routes.ts` - API route constants
- `/src/lib/rbac-permissions.ts` - RBAC logic
- `/src/services/api.service.ts` - Base HTTP client
- `/src/services/index.ts` - Service exports
- `/src/config/cache.config.ts` - Cache configuration
