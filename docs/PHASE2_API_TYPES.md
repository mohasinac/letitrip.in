# 🚀 Phase 2: API Type Definitions & Validation Schemas

**Start Date**: After Phase 1 ✅  
**Target Duration**: 3-5 days  
**Status**: 🟡 BLOCKED (waiting for Phase 1)

---

## 📋 Quick Start Checklist

- [ ] **2.1** Review all 47 Phase 2 type TODOs in `src/types/api.ts`
- [ ] **2.2** Implement Type Definitions (API Response Metadata)
- [ ] **2.3** Implement Advanced Filtering Types
- [ ] **2.4** Implement Product Management Types
- [ ] **2.5** Enhance Validation Schemas (23 TODOs)
- [ ] **VERIFICATION** No TypeScript errors, all types documented

---

## Phase 2.1: Analyze Existing API Types

### Subtask 2.1.1: Review Current Structure

**File**: `src/types/api.ts`

**Current State**: ~500 lines with 47 TODOs for Phase 2 features

**Organization**:

- Response types (ApiResponse, Pagination)
- Query parameters
- Request/Response DTOs
- Error types

### Subtask 2.1.2: Categorize TODOs

```bash
# Extract all TODOs with line numbers
grep -n "TODO" src/types/api.ts | head -47

# Count by category
grep -n "TODO" src/types/api.ts | \
  grep -o "TODO.*" | \
  sed 's/:.*//' | \
  sort | uniq -c | sort -rn
```

**Expected Categories**:

1. Response metadata (3)
2. Pagination (2)
3. Filtering (5)
4. Products (9)
5. Categories (4)
6. Reviews (7)
7. Sites/Carousel/Sections (6)
8. Other (11)

---

## Phase 2.2: API Response Metadata Types

### Subtask 2.2.1: Extended Response Wrapper

**Location**: `src/types/api.ts`

**Current**:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
```

**Enhanced**:

```typescript
/**
 * Extended API response with metadata
 * TODO: Add requestId, timestamp, version
 */
export interface ApiResponseWithMetadata<T> extends ApiResponse<T> {
  meta?: {
    requestId: string; // Unique request identifier
    timestamp: Date; // Response generation time
    version: string; // API version (e.g., "v1")
    duration?: number; // Response time in ms
  };
}

/**
 * HATEOAS Links for navigation
 * TODO: Add links for HATEOAS (next, prev, first, last)
 */
export interface HATEOASLink {
  rel: "self" | "first" | "last" | "next" | "prev";
  href: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  title?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta?: {
    pagination: PaginationMeta;
    links?: HATEOASLink[];
  };
}
```

**Implementation**:

- [ ] Add to all list endpoints (products, orders, users, etc.)
- [ ] Include request tracking for debugging
- [ ] Add API versioning header support
- [ ] Test HATEOAS links generation

---

### Subtask 2.2.2: Cursor-Based Pagination

**Current**: Offset-based pagination

```typescript
export interface PaginationParams {
  page: number;
  limit: number;
}
```

**Enhanced**: Add cursor support

```typescript
/**
 * TODO: Add cursor-based pagination support
 */
export interface CursorPaginationParams {
  cursor?: string; // Base64-encoded pagination marker
  limit: number;
  sort?: {
    field: string;
    direction: "asc" | "desc";
  };
}

export interface CursorPaginationMeta {
  nextCursor?: string; // Cursor for next page
  prevCursor?: string; // Cursor for previous page
  hasMore: boolean; // Whether more results exist
  total?: number; // Total count (optional, expensive)
}
```

**Benefits**:

- ✅ Better for large datasets
- ✅ Handles deletions gracefully
- ✅ More efficient than offset
- ✅ SEO-friendly

---

## Phase 2.3: Advanced Filtering Types (5 TODOs)

### Subtask 2.3.1: Complex Filter Operations

**Location**: `src/types/api.ts`

**Current**: Simple field=value filters

```typescript
export interface QueryFilter {
  [key: string]: any;
}
```

**Enhanced**: Logical operators

```typescript
/**
 * TODO: Add support for complex filters (OR, AND conditions)
 */
export type FilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "nin"
  | "exists"
  | "regex";

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface ComplexFilter {
  $and?: FilterCondition[];
  $or?: FilterCondition[];
  $nor?: FilterCondition[];
  conditions?: FilterCondition[];
}

// Example usage:
// {
//   "$or": [
//     { field: "status", operator: "eq", value: "active" },
//     { field: "featured", operator: "eq", value: true }
//   ]
// }
```

### Subtask 2.3.2: Sparse Fieldsets

```typescript
/**
 * TODO: Add support for field selection (sparse fieldsets)
 * Only return specified fields to reduce bandwidth
 *
 * Example: ?fields=id,name,price
 */
export interface FieldSelection {
  fields?: string[]; // Include-based field selection
  exclude?: string[]; // Exclude-based field selection
}

// Merge with query params
export interface AdvancedQueryParams extends FieldSelection {
  filter?: ComplexFilter;
  sort?: SortOptions[];
  pagination: CursorPaginationParams;
}
```

### Subtask 2.3.3: Relations/Includes Expansion

```typescript
/**
 * TODO: Add support for includes/relations expansion
 * Fetch related resources in single request
 *
 * Example: ?include=seller,reviews,images
 */
export interface IncludeOptions {
  include?: string[]; // Relations to expand
  depth?: number; // Nesting depth (default: 1)
  maxSize?: number; // Max size of related array
}

export interface ExpandedResource<T> {
  data: T;
  included?: {
    [key: string]: any[]; // Related resources by type
  };
}
```

---

## Phase 2.4: Product Management Types (9 TODOs)

### Subtask 2.4.1: Product Query Filters

**Location**: `src/types/api.ts`

```typescript
/**
 * TODO: Add price range filter (minPrice, maxPrice)
 * TODO: Add brand filter
 * TODO: Add condition filter (new, used, refurbished)
 * TODO: Add location-based filtering
 * TODO: Add availability filter (in_stock, out_of_stock)
 */
export interface ProductQueryParams extends AdvancedQueryParams {
  search?: string; // Full-text search
  category?: string; // Category ID
  minPrice?: number; // Minimum price
  maxPrice?: number; // Maximum price
  brand?: string; // Brand name
  condition?: "new" | "used" | "refurbished";
  location?: {
    city?: string;
    state?: string;
    country?: string;
    radius?: number; // km
  };
  inStock?: boolean; // true = in_stock, false = out_of_stock
  rating?: {
    min: number; // Min average rating (0-5)
  };
  featured?: boolean;
  sellerId?: string;
}

export interface ProductResponse {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    name: string;
    rating: number; // TODO: Add seller rating/reputation
    totalReviews: number;
  };
  rating: number; // TODO: Add average review rating
  reviewCount: number;
  viewCount?: number; // TODO: Add view count
  wishlistCount?: number; // TODO: Add favorite/wishlist count
  images: string[];
  condition: "new" | "used" | "refurbished";
  inStock: boolean;
  stockCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Subtask 2.4.2: Product Creation & Update

```typescript
/**
 * TODO: Add bulk creation support (array of products)
 * TODO: Add draft auto-save support
 * TODO: Add import from URL/CSV
 */
export interface ProductCreateRequest {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string; // Category ID
  images: string[]; // Image URLs or base64
  condition: "new" | "used" | "refurbished";
  stockCount?: number;
  sku?: string;
  tags?: string[];
  features?: Record<string, any>;
  isDraft?: boolean; // Draft auto-save
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: string;
}

/**
 * TODO: Add partial update support with PATCH semantics
 * TODO: Add optimistic locking with version field
 */
export interface ProductBulkCreateRequest {
  products: ProductCreateRequest[];
  importSource?: "csv" | "url" | "api";
  dryRun?: boolean; // Validate without creating
}

export interface BulkImportResponse {
  imported: number;
  failed: number;
  skipped: number;
  errors?: Array<{
    row: number;
    error: string;
  }>;
}
```

---

## Phase 2.5: Category Management Types (4 TODOs)

```typescript
/**
 * TODO: Add depth limit for tree queries
 * TODO: Add include/exclude inactive categories
 * TODO: Add bulk import support
 * TODO: Add category templates
 */
export interface CategoryTreeQueryParams {
  depth?: number; // Depth limit (default: 3)
  includeInactive?: boolean; // Include inactive categories
  expandChildren?: boolean; // Fetch all descendants
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  parent?: {
    id: string;
    name: string;
  };
  children?: CategoryResponse[];
  productCount?: number;
  image?: string;
  isActive: boolean;
  tier: number; // Depth in tree
  createdAt: Date;
}

export interface CategoryBulkImport {
  categories: Array<{
    name: string;
    parentId?: string;
    image?: string;
  }>;
}
```

---

## Phase 2.6: Review & Rating Types (7 TODOs)

```typescript
/**
 * TODO: Add media upload handling
 * TODO: Add review templates/quick reviews
 * TODO: Add filter by verification status
 * TODO: Add filter by helpful votes threshold
 * TODO: Add edit history tracking
 */
export interface ReviewCreateRequest {
  productId: string;
  rating: number; // 1-5
  title: string;
  content: string;
  media?: string[]; // Image/video URLs
  template?: "quick" | "detailed"; // Pre-filled template
  verified?: boolean; // Mark as verified purchase
}

export interface ReviewFilterParams {
  productId: string;
  rating?: number; // Filter by specific rating
  ratingRange?: [number, number];
  status?: "pending" | "approved" | "rejected";
  verifiedOnly?: boolean;
  minHelpful?: number; // TODO: threshold
  sortBy?: "recent" | "helpful" | "rating";
}

export interface ReviewResponse {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  media?: string[];
  helpful: number;
  notHelpful: number;
  status: "pending" | "approved" | "rejected";
  verified: boolean;
  history?: Array<{
    // TODO: edit history
    editedAt: Date;
    previousContent: string;
    previousRating?: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Phase 2.7: Carousel & Homepage Types (6 TODOs)

```typescript
/**
 * TODO: Add slide duplication feature
 * TODO: Add slide scheduling (start/end dates)
 */
export interface CarouselSlideCreateRequest {
  title: string;
  description?: string;
  image: string;
  link?: string;
  linkText?: string;
  order: number;
  active: boolean;
  startDate?: Date; // Scheduling
  endDate?: Date;
  template?: string; // Template reference
  duplicateFrom?: string; // Duplicate from another slide
}

export interface CarouselSlideResponse extends CarouselSlideCreateRequest {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TODO: Implement drag-and-drop ordering
 * TODO: Add section templates library
 */
export interface HomepageSectionCreateRequest {
  type: "welcome" | "featured" | "categories" | "trending" | "custom";
  title: string;
  description?: string;
  order: number;
  enabled: boolean;
  config?: {
    maxItems?: number;
    layout?: "grid" | "carousel" | "list";
    columns?: number; // For responsive layout
    template?: string; // Template reference
  };
}

export interface HomepageSectionResponse extends HomepageSectionCreateRequest {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Reordering operations (drag-and-drop)
 */
export interface ReorderRequest {
  itemId: string;
  newOrder: number;
  targetPosition?: "before" | "after";
  targetItemId?: string;
}

export interface ReorderResponse {
  success: boolean;
  items: Array<{
    id: string;
    order: number;
  }>;
}
```

---

## Phase 2.8: Enhance Validation Schemas (23 TODOs)

### Subtask 2.8.1: Review Current Schemas

**File**: `src/lib/validation/schemas.ts`

**Current**: Basic Zod schemas with 23 TODOs

### Subtask 2.8.2: Implement Password Validation

```typescript
/**
 * TODO: Advanced password rules
 */
const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password must be less than 128 characters")
  .refine((password) => {
    // At least one uppercase
    if (!/[A-Z]/.test(password)) return false;
    // At least one lowercase
    if (!/[a-z]/.test(password)) return false;
    // At least one digit
    if (!/\d/.test(password)) return false;
    // At least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
    return true;
  }, "Password must contain uppercase, lowercase, number, and special character")
  .refine((password) => {
    // TODO: Prevent keyboard patterns (qwerty, asdf, etc.)
    const patterns = ["qwerty", "asdf", "123456", "password"];
    return !patterns.some((p) => password.toLowerCase().includes(p));
  }, "Password contains common patterns");
```

### Subtask 2.8.3: Phone Validation

```typescript
/**
 * TODO: Phone number format validation
 */
const phoneSchema = z
  .string()
  .refine((phone) => {
    // TODO: E.164 format validation
    const e164Pattern = /^\+?[1-9]\d{1,14}$/;
    return e164Pattern.test(phone.replace(/\D/g, ""));
  }, "Invalid phone number format")
  .refine((phone) => {
    // Check length after removing non-digits
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }, "Phone number must have 10-15 digits");
```

### Subtask 2.8.4: Address Validation

```typescript
/**
 * TODO: Address field validation enhancements
 */
const addressSchema = z.object({
  street: z
    .string()
    .min(5, "Street address too short")
    .max(100, "Street address too long")
    .refine(
      (street) => !/^[\d\s]+$/.test(street),
      "Street must contain non-numeric characters",
    ),
  city: z
    .string()
    .min(2, "City name too short")
    .regex(/^[a-zA-Z\s\-']+$/, "Invalid city name"),
  state: z.string().min(2, "State code required").max(50, "Invalid state"),
  pincode: z
    .string()
    .refine((pin) => /^\d{5,6}$/.test(pin), "Invalid pincode format"),
  country: z
    .string()
    .length(2, "Country code must be 2 characters")
    .toUpperCase(),
});
```

### Subtask 2.8.5: Business Rule Validation

```typescript
/**
 * TODO: Business rule validation
 */
const orderSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z.string(),
          quantity: z.number().min(1),
          price: z.number().positive(),
        }),
      )
      .min(1),
    totalAmount: z.number().positive(),
  })
  .refine((order) => {
    // TODO: Minimum order value rule
    const minOrderValue = 100; // dollars
    return order.totalAmount >= minOrderValue;
  }, "Order must be at least $100")
  .refine((order) => {
    // TODO: Maximum items per order
    const maxItems = 50;
    const totalItems = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    return totalItems <= maxItems;
  }, "Order cannot exceed 50 items");

const bidSchema = z
  .object({
    productId: z.string(),
    amount: z.number().positive(),
    auctionId: z.string(),
  })
  .refine((bid) => {
    // TODO: Bid increment rules (e.g., min 5% higher)
    return true; // Validate against current bid
  }, "Bid must meet minimum increment rules");
```

---

## Phase 2.9: Verification & Sign-Off

### Checklist:

- [ ] All 47 type TODOs implemented and documented
- [ ] All 23 validation schema TODOs implemented and tested
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] All tests passing: `npm test src/lib/validation/schemas.test.ts`

### Test Execution:

```bash
# Type checking
npx tsc --noEmit

# Schema tests
npm test -- src/lib/validation/schemas.test.ts --verbose

# All tests
npm test
```

### Success Criteria:

✅ **Types**: All 47 TODOs converted to complete types  
✅ **Validation**: All 23 schemas enhanced with business logic  
✅ **Tests**: ≥ 95% test pass rate  
✅ **Docs**: All types documented with JSDoc

---

When Complete:

- Mark Phase 2 as ✅ COMPLETE in [IMPLEMENTATION_TRACKER.md](../IMPLEMENTATION_TRACKER.md)
- Proceed to Phase 3 (Feature Implementation)

---

Generated: February 12, 2026 | Next: [Phase 3 Plan](./PHASE3_ROUTE_TODOS.md)
