# TypeScript Types

This folder contains TypeScript type definitions, interfaces, and type utilities for the application.

## Folder Structure

### shared/

**Purpose:** Shared types used by both backend and frontend

**Key Files:**

- `branded.ts` - **NEW: Branded types for type-safe IDs** ✅
- `common.types.ts` - Common utility types
- `api.types.ts` - API request/response types
- `error.types.ts` - Error types
- `pagination.types.ts` - Pagination types
- `filter.types.ts` - Filter types
- `sort.types.ts` - Sorting types

**Branded Types (branded.ts):**

Branded types provide compile-time type safety for IDs without runtime overhead.

**Available Branded Types:**
- `UserId`, `UserEmail`, `UserRole` - User identifiers
- `ProductId`, `ProductSku` - Product identifiers
- `OrderId`, `OrderNumber` - Order identifiers
- `CartId`, `CartItemId` - Cart identifiers
- `ShopId`, `ShopSlug` - Shop identifiers
- `CategoryId`, `CategorySlug` - Category identifiers
- `ReviewId` - Review identifiers
- `PaymentId`, `TransactionId` - Payment identifiers
- `AddressId` - Address identifiers
- `NotificationId` - Notification identifiers
- `ConversationId`, `MessageId` - Messaging identifiers
- `TicketId` - Support ticket identifiers
- `CouponId`, `CouponCode` - Coupon identifiers
- `ShipmentId`, `TrackingNumber` - Shipment identifiers

**Type Guards:**
- `isUserId()`, `isProductId()`, `isOrderId()`, etc.
- Validate values at runtime

**Helper Functions:**
- `createUserId()`, `createProductId()`, `createOrderId()`, etc.
- Create branded types with validation

**Usage Example:**
```typescript
import { UserId, ProductId, createUserId } from '@/types/shared/branded';

// Type-safe IDs
const userId: UserId = 'user123' as UserId;
const productId: ProductId = 'prod456' as ProductId;

// This will cause a TypeScript error:
// const wrongAssignment: UserId = productId; // Error!

// Create with validation
const validatedId = createUserId('user789'); // UserId

// Type guard
if (isUserId(someValue)) {
  // someValue is narrowed to UserId
}
```

**Common Types:**

- `PaginatedResponse<T>` - Paginated API response
- `ApiResponse<T>` - Standard API response
- `ApiError` - API error structure
- `Filters` - Generic filter object
- `SortOptions` - Sorting configuration
- `TimeRange` - Date range filter

---

### backend/

**Purpose:** Backend/API types (Database schemas, API responses)

**Key Files:**

- `user.types.ts` - User database schema
- `product.types.ts` - Product database schema
- `order.types.ts` - Order database schema
- `auction.types.ts` - Auction database schema
- `shop.types.ts` - Shop database schema
- `cart.types.ts` - Cart database schema
- `payment.types.ts` - Payment schemas
- `address.types.ts` - Address schemas
- `review.types.ts` - Review schemas
- `notification.types.ts` - Notification schemas

**Purpose:** Define exact structure of data as stored in database (Firestore).

---

### frontend/

**Purpose:** Frontend/UI types (Component props, UI state)

**Key Files:**

- `user.types.ts` - User UI types (UserFE)
- `product.types.ts` - Product UI types (ProductFE)
- `order.types.ts` - Order UI types (OrderFE)
- `auction.types.ts` - Auction UI types (AuctionFE)
- `shop.types.ts` - Shop UI types (ShopFE)
- `cart.types.ts` - Cart UI types (CartFE)

**Purpose:** Frontend-enriched types with computed properties, formatted values, and UI-specific fields.

**Example:**

```typescript
// Backend type (DB)
interface ProductDB {
  id: string;
  name: string;
  price: number;
}

// Frontend type (UI)
interface ProductFE extends ProductDB {
  formattedPrice: string; // "₹1,999"
  discountPercent: number; // 20
  inStock: boolean; // computed
  imageUrl: string; // full URL
}
```

---

### shared/

**Purpose:** Shared types used by both backend and frontend

**Key Files:**

- `common.types.ts` - Common utility types
- `api.types.ts` - API request/response types
- `error.types.ts` - Error types
- `pagination.types.ts` - Pagination types
- `filter.types.ts` - Filter types
- `sort.types.ts` - Sorting types

**Common Types:**

- `PaginatedResponse<T>` - Paginated API response
- `ApiResponse<T>` - Standard API response
- `ApiError` - API error structure
- `Filters` - Generic filter object
- `SortOptions` - Sorting configuration
- `TimeRange` - Date range filter

---

### transforms/

**Purpose:** Type transformation utilities (Backend ↔ Frontend)

**Key Files:**

- `product.transform.ts` - ProductDB → ProductFE
- `order.transform.ts` - OrderDB → OrderFE
- `user.transform.ts` - UserDB → UserFE
- `auction.transform.ts` - AuctionDB → AuctionFE

**Purpose:** Convert between database types and frontend types, adding computed properties and formatting.

**Example:**

```typescript
export function toProductFE(product: ProductDB): ProductFE {
  return {
    ...product,
    formattedPrice: formatINR(product.price),
    discountPercent: calculateDiscount(product.price, product.salePrice),
    inStock: product.stock > 0,
    imageUrl: getFullImageURL(product.image),
  };
}
```

---

## Common Type Patterns

### Database Types (Backend)

```typescript
// Firestore documents
interface ProductDB {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;

  // Product fields
  name: string;
  price: number;
  stock: number;
}
```

### Frontend Types

```typescript
// UI-enriched types
interface ProductFE {
  id: string;
  createdAt: Date; // Converted from Timestamp
  updatedAt: Date;
  createdBy: string;

  // Product fields
  name: string;
  price: number;
  stock: number;

  // Computed fields
  formattedPrice: string;
  inStock: boolean;
  discountPercent: number;
  imageUrl: string;
}
```

### API Types

```typescript
// Request types
interface CreateProductRequest {
  name: string;
  price: number;
  description: string;
}

// Response types
interface CreateProductResponse {
  success: boolean;
  data: ProductFE;
  message: string;
}
```

### Utility Types

```typescript
// Pagination
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

// Filters
interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}
```

---

## Type Utilities

### homepage.ts

**Exports:** Homepage configuration types

Types:

- `HeroSlide` - Hero carousel slide
- `FeaturedSection` - Featured section config
- `HomepageSettings` - Homepage configuration

---

### media.ts

**Exports:** Media/file types

Types:

- `MediaFile` - Uploaded file metadata
- `ImageDimensions` - Image width/height
- `VideoMetadata` - Video properties
- `UploadOptions` - Upload configuration

---

### inline-edit.ts

**Exports:** Inline editing types

Types:

- `InlineEditMode` - Edit mode state
- `EditableField` - Field configuration
- `ValidationRule` - Validation rules

---

## Best Practices

### Type Naming

- **Database types**: Suffix with `DB` (ProductDB)
- **Frontend types**: Suffix with `FE` (ProductFE)
- **API types**: Suffix with `Request` or `Response`
- **Enums**: Use PascalCase singular (ProductStatus)

### Type Organization

- **One type per concept**: Don't mix unrelated types
- **Group related types**: Keep related types in same file
- **Use namespaces**: Group under namespace if needed

### Type Composition

- **Extend base types**: Use `extends` for shared fields
- **Union types**: Use unions for variants
- **Intersection types**: Combine types with `&`
- **Generic types**: Use generics for reusable types

### Type Safety

- **Avoid `any`**: Use `unknown` instead
- **Strict null checks**: Use `null` and `undefined` explicitly
- **Discriminated unions**: Use discriminated unions for variants
- **Type guards**: Create type guard functions

### Documentation

- **JSDoc comments**: Document complex types
- **Example values**: Show example usage
- **Deprecation**: Mark deprecated types

---

## Common Type Definitions

### Timestamps

```typescript
// Backend (Firestore Timestamp)
createdAt: Timestamp;

// Frontend (Date)
createdAt: Date;
```

### IDs

```typescript
// String IDs
type UserId = string;
type ProductId = string;

// Branded types (more type-safe)
type UserId = string & { __brand: "UserId" };
```

### Enums vs Union Types

```typescript
// Enum
enum ProductStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

// Union type (preferred)
type ProductStatus = "draft" | "published" | "archived";
```

### Optional vs Nullable

```typescript
// Optional (may not exist)
interface User {
  nickname?: string;
}

// Nullable (exists but may be null)
interface User {
  nickname: string | null;
}
```

### Arrays

```typescript
// Array of items
products: ProductFE[];

// Readonly array
products: readonly ProductFE[];

// Tuple
coordinates: [number, number]; // [lat, lng]
```

---

## Type Export Strategy

### Named Exports

```typescript
// Preferred
export interface User {}
export type UserId = string;
```

### Default Exports

```typescript
// Avoid for types
export default interface User {} // ❌
```

### Barrel Exports

```typescript
// index.ts
export * from "./user.types";
export * from "./product.types";
```

---

## Type Validation

### Runtime Validation

Types are compile-time only. Use libraries for runtime validation:

- **Zod**: Schema validation
- **Yup**: Form validation
- **io-ts**: Runtime type checking

Example with Zod:

```typescript
import { z } from "zod";

const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(3),
  price: z.number().positive(),
});

type Product = z.infer<typeof ProductSchema>;
```

---

## Transform Utilities

### Backend → Frontend

```typescript
// Transform functions add computed properties
export function toProductFE(db: ProductDB): ProductFE {
  return {
    ...db,
    createdAt: db.createdAt.toDate(),
    formattedPrice: formatINR(db.price),
    inStock: db.stock > 0,
  };
}
```

### Frontend → Backend

```typescript
// Strip computed properties before saving
export function toProductDB(fe: ProductFE): ProductDB {
  const { formattedPrice, inStock, ...db } = fe;
  return {
    ...db,
    createdAt: Timestamp.fromDate(fe.createdAt),
  };
}
```

---

## Type Guards

### Custom Type Guards

```typescript
export function isProductFE(obj: any): obj is ProductFE {
  return typeof obj === "object" && "id" in obj && "formattedPrice" in obj;
}
```

### Discriminated Unions

```typescript
type Response =
  | { success: true; data: ProductFE }
  | { success: false; error: string };

function handleResponse(res: Response) {
  if (res.success) {
    // TypeScript knows res.data exists
    console.log(res.data);
  } else {
    // TypeScript knows res.error exists
    console.log(res.error);
  }
}
```
