# 🔌 API Routes, Middlewares & Contexts Reference

**Project:** HobbiesSpot.com - Beyblade Ecommerce Platform  
**Last Updated:** November 2, 2025

---

## Table of Contents

1. [API Routes Overview](#api-routes-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Middlewares](#middlewares)
4. [Contexts](#contexts)
5. [Usage Examples](#usage-examples)

---

## API Routes Overview

### Public Routes (No Auth Required)

#### `/api/health`

- **Method:** GET
- **Purpose:** Health check endpoint
- **Response:** Server status, uptime
- **Used in:** Monitoring, deployment verification

#### `/api/categories`

- **Method:** GET
- **Purpose:** Fetch product categories
- **Query Params:** `format` (tree/list), `search`, `limit`
- **Used in:** Category browsing, navigation, filters

#### `/api/products`

- **Method:** GET
- **Purpose:** List products with pagination
- **Query Params:** `page`, `limit`, `categoryId`, `search`
- **Used in:** Product listing pages, search results

#### `/api/beyblades`

- **Method:** GET
- **Purpose:** Fetch beyblade data for game
- **Used in:** Game lobby, beyblade selection

#### `/api/content/[slug]`

- **Method:** GET
- **Purpose:** Fetch markdown content (FAQ, policies)
- **Used in:** Static pages (about, privacy, terms)

#### `/api/sessions`

- **Methods:** GET, POST
- **Purpose:** Manage user sessions via cookies
- **Used in:** Session tracking, analytics

---

### Authentication Routes

#### `/api/auth/me`

- **Method:** GET
- **Auth:** Required (Bearer token)
- **Purpose:** Get current user data
- **Response:** User object with role, profile
- **Used in:** AuthContext, profile pages

#### `/api/auth/logout`

- **Method:** POST
- **Auth:** Required
- **Purpose:** Logout user, clear tokens
- **Used in:** Logout buttons, auth flow

---

### Admin Routes (Admin Only)

#### `/api/admin/categories`

- **Methods:** GET, POST, PUT, DELETE
- **Auth:** Admin only
- **Purpose:** CRUD operations for categories
- **Used in:** Admin category management

#### `/api/admin/users`

- **Method:** GET
- **Auth:** Admin only
- **Purpose:** List and manage users
- **Used in:** Admin user management panel

#### `/api/admin/hero-settings`

- **Methods:** GET, POST
- **Auth:** Admin only
- **Purpose:** Manage hero section products/carousels
- **Used in:** Homepage hero configuration

#### `/api/admin/hero-slides`

- **Methods:** GET, POST, PUT, DELETE
- **Auth:** Admin only
- **Purpose:** Manage homepage slides
- **Used in:** Homepage carousel management

---

### Seller Routes (Seller/Admin Access)

#### `/api/seller/products`

- **Methods:** GET, POST, PUT, DELETE
- **Auth:** Seller/Admin
- **Purpose:** Manage seller's products
- **Used in:** Seller product management

#### `/api/seller/orders`

- **Method:** GET
- **Auth:** Seller/Admin
- **Purpose:** List seller's orders
- **Used in:** Seller order dashboard

#### `/api/seller/orders/[id]`

- **Method:** GET
- **Auth:** Seller/Admin
- **Purpose:** Get order details
- **Used in:** Order detail pages

#### `/api/seller/shop`

- **Methods:** GET, PUT
- **Auth:** Seller/Admin
- **Purpose:** Manage shop settings
- **Used in:** Shop setup page

#### `/api/seller/coupons`

- **Methods:** GET, POST, PUT, DELETE
- **Auth:** Seller/Admin
- **Purpose:** Manage coupons
- **Used in:** Coupon management

#### `/api/seller/sales`

- **Methods:** GET, POST, PUT, DELETE
- **Auth:** Seller/Admin
- **Purpose:** Manage sales/promotions
- **Used in:** Sales management

#### `/api/seller/analytics/overview`

- **Method:** GET
- **Auth:** Seller/Admin
- **Query:** `period` (7days, 30days, 90days, 1year, all)
- **Purpose:** Get analytics overview
- **Used in:** Seller analytics dashboard

#### `/api/seller/analytics/export`

- **Method:** POST
- **Auth:** Seller/Admin
- **Purpose:** Export analytics data
- **Used in:** Analytics export feature

#### `/api/seller/invoices/generate`

- **Method:** POST
- **Auth:** Seller/Admin
- **Purpose:** Generate invoice HTML
- **Used in:** Order invoice generation

---

### Upload Routes

#### `/api/upload`

- **Method:** POST
- **Auth:** Required
- **Body:** FormData with file
- **Purpose:** Upload files to Firebase Storage
- **Used in:** Product images, shop assets, avatars

#### `/api/upload/avatar`

- **Method:** POST
- **Auth:** Required
- **Purpose:** Upload user avatar
- **Used in:** Profile picture upload

---

## Authentication & Authorization

### Authentication Flow

```typescript
// 1. Client: Get Firebase ID token
import { auth } from "@/lib/firebase/firebase";

const user = auth.currentUser;
const token = await user.getIdToken();

// 2. Client: Send to API with Bearer token
const response = await fetch("/api/protected-route", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// 3. Server: Verify token
import { verifyFirebaseToken } from "@/lib/auth/firebase-api-auth";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // User authenticated, proceed
}
```

### Authorization Helpers

#### `verifyFirebaseToken(request)`

- **Location:** `src/lib/auth/firebase-api-auth.ts`
- **Purpose:** Verify Firebase ID token
- **Returns:** User object or null
- **Usage:** All authenticated routes

#### `verifyAdmin(request)`

- **Location:** `src/lib/auth/firebase-api-auth.ts`
- **Purpose:** Verify user is admin
- **Returns:** User object or null
- **Usage:** Admin-only routes

#### `verifyRole(request, allowedRoles)`

- **Location:** `src/lib/auth/firebase-api-auth.ts`
- **Purpose:** Verify user has specific role
- **Returns:** User object or null
- **Usage:** Role-based access control

---

## Middlewares

### API Middleware (`src/lib/api/middleware.ts`)

#### `corsMiddleware`

```typescript
export const corsMiddleware: Middleware = async (request, next) => {
  // Handles CORS preflight and headers
};
```

- **Purpose:** Add CORS headers to responses
- **Used in:** All API routes via `createApiHandler`

#### `errorHandlingMiddleware`

```typescript
export const errorHandlingMiddleware: Middleware = async (request, next) => {
  try {
    return await next();
  } catch (error) {
    return handleApiError(error, request);
  }
};
```

- **Purpose:** Catch and format API errors
- **Used in:** All API routes

#### `rateLimitMiddleware`

```typescript
export const rateLimitMiddleware = (
  maxRequests = 100,
  windowMs = 60000
): Middleware => {
  // Rate limiting logic
};
```

- **Purpose:** Prevent abuse
- **Used in:** Optional, apply to sensitive endpoints

### Auth Middleware (`src/lib/auth/api-middleware.ts`)

#### `withAuth(request, options)`

```typescript
export async function withAuth(
  request: NextRequest,
  options?: AuthMiddlewareOptions
): Promise<{ user: JWTPayload } | { error: NextResponse }> {
  // Verify authentication
}
```

- **Purpose:** Verify user is authenticated
- **Returns:** User object or error response

#### `createAuthenticatedHandler(handler, options)`

```typescript
export function createAuthenticatedHandler<T>(
  handler: (
    request: NextRequest,
    user: JWTPayload,
    ...args: T
  ) => Promise<NextResponse>,
  options?: AuthMiddlewareOptions
) {
  // Wraps handler with auth check
}
```

- **Purpose:** Create authenticated API handler
- **Usage:**

```typescript
export const GET = createAuthenticatedHandler(async (request, user) => {
  // user is guaranteed to be authenticated
  return NextResponse.json({ data: "protected data" });
});
```

#### `createAdminHandler(handler)`

```typescript
export function createAdminHandler<T>(
  handler: (
    request: NextRequest,
    user: JWTPayload,
    ...args: T
  ) => Promise<NextResponse>
) {
  // Admin-only wrapper
}
```

- **Purpose:** Create admin-only handler
- **Usage:**

```typescript
export const POST = createAdminHandler(async (request, user) => {
  // user.role is guaranteed to be 'admin'
});
```

#### `createSellerHandler(handler)`

```typescript
export function createSellerHandler<T>(
  handler: (
    request: NextRequest,
    user: JWTPayload,
    ...args: T
  ) => Promise<NextResponse>
) {
  // Seller/Admin wrapper
}
```

- **Purpose:** Create seller/admin handler
- **Usage:**

```typescript
export const PUT = createSellerHandler(async (request, user) => {
  // user.role is 'seller' or 'admin'
});
```

### Request Validation Middleware

#### `validateRequestBody(request, schema)`

```typescript
import { z } from "zod";
import { validateRequestBody } from "@/lib/api/middleware/validation";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const result = await validateRequestBody(request, schema);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.errors },
      { status: 400 }
    );
  }

  const data = result.data; // Typed and validated
}
```

---

## Contexts

### 1. AuthContext (`src/contexts/AuthContext.tsx`)

**Purpose:** Manage authentication state globally

**Provides:**

```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}
```

**Usage:**

```tsx
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, loading, logout } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Login />;

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**Used in:**

- All protected pages
- Navigation headers
- Profile components
- Role-based access control

---

### 2. ModernThemeContext (`src/contexts/ModernThemeContext.tsx`)

**Purpose:** Manage theme (light/dark mode)

**Provides:**

```typescript
interface ModernThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}
```

**Usage:**

```tsx
import { useModernTheme } from "@/contexts/ModernThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useModernTheme();

  return (
    <button onClick={toggleTheme}>{theme === "light" ? "🌙" : "☀️"}</button>
  );
}
```

**Used in:**

- Layout components
- Theme toggle buttons
- Component styling

---

### 3. BreadcrumbContext (`src/contexts/BreadcrumbContext.tsx`)

**Purpose:** Manage breadcrumb navigation

**Provides:**

```typescript
interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
}

interface BreadcrumbItem {
  label: string;
  href: string;
}
```

**Usage:**

```tsx
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

function Page() {
  useBreadcrumbTracker([
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Current Product", href: "/products/123" },
  ]);

  return <div>Page content</div>;
}
```

**Used in:**

- All admin/seller pages
- Navigation components
- PageHeader component

---

## Usage Examples

### Example 1: Protected API Route

```typescript
// src/app/api/seller/products/route.ts
import { createSellerHandler } from "@/lib/auth/api-middleware";
import { getAdminDb } from "@/lib/database/admin";

export const GET = createSellerHandler(async (request, user) => {
  // user is guaranteed to be seller or admin
  const db = getAdminDb();

  const products = await db
    .collection("products")
    .where("sellerId", "==", user.uid)
    .get();

  return NextResponse.json({
    success: true,
    data: products.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
  });
});
```

### Example 2: Client-Side API Call

```typescript
// src/components/ProductList.tsx
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api/client";

export function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/api/products?limit=20")
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load products:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Example 3: Using Context with RoleGuard

```tsx
// src/app/seller/dashboard/page.tsx
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useAuth } from "@/contexts/AuthContext";

export default function SellerDashboard() {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={["seller", "admin"]}>
      <div>
        <h1>Welcome, {user?.name}</h1>
        <p>Your seller dashboard</p>
      </div>
    </RoleGuard>
  );
}
```

---

## API Response Format

All APIs follow standardized response format:

### Success Response

```typescript
{
  success: true,
  data: T, // Response data
  message?: string, // Optional success message
  meta?: {
    timestamp: string,
    requestId: string
  }
}
```

### Error Response

```typescript
{
  success: false,
  error: string, // Error message
  errors?: any, // Validation errors
  meta?: {
    timestamp: string,
    requestId: string
  }
}
```

---

## Quick Reference

### Auth Flow

```
Client → Firebase Auth → Get ID Token → API Route → Verify Token → Response
```

### Creating Protected Route

```typescript
import { createSellerHandler } from "@/lib/auth/api-middleware";

export const POST = createSellerHandler(async (request, user) => {
  // Your logic here
});
```

### Using Context

```tsx
const { user } = useAuth();
const { theme, toggleTheme } = useModernTheme();
useBreadcrumbTracker([
  /* breadcrumbs */
]);
```

---

_Last Updated: November 2, 2025_  
_For implementation details, see source files in `src/lib/auth/` and `src/lib/api/`_
