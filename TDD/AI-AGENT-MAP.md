# AI-AGENT-GUIDE Quick Reference Map

> **Version**: 1.0  
> **Last Updated**: December 4, 2025  
> **Source**: AI-AGENT-GUIDE.md (1,491 lines)  
> **Purpose**: Fast navigation and lookup for AI coding agents

---

## 📖 Table of Contents

### 🚀 CRITICAL - USE THESE FIRST

- [Reusable Hooks](#reusable-hooks) - `useLoadingState`, `useDebounce`, `useFilters`
- [Wrapper Components](#wrapper-components) - `AdminResourcePage`, `FormField`, `Price`
- [Constants](#constants) - `COLLECTIONS`, `ROUTES`, `VALIDATION_RULES`
- [Validation Helpers](#validation-helpers) - `isValidEmail`, `isValidPhone`, `isValidGST`

### 📁 PROJECT STRUCTURE

- [File Organization](#file-organization) - Where files belong
- [Naming Conventions](#naming-conventions) - How to name things
- [File Size Limits](#file-size-limits) - When to split files

### 🎨 UI/UX PATTERNS

- [Dark Mode](#dark-mode) - Required classes for all components
- [Mobile Responsive](#mobile-responsive) - Breakpoint patterns
- [Form Components](#form-components) - Form fields, validation, submission
- [Value Display](#value-display) - Price, Date, Status badges

### 🔧 BACKEND PATTERNS

- [API Routes](#api-routes) - REST conventions, error handling
- [Database Operations](#database-operations) - Firestore queries, collections
- [Services Layer](#services-layer) - How to use service methods
- [Error Handling](#error-handling) - `logError`, try-catch patterns

### 🧪 TESTING & QUALITY

- [Testing Requirements](#testing-requirements) - What to test
- [Type Safety](#type-safety) - TypeScript patterns
- [Accessibility](#accessibility) - ARIA labels, keyboard nav

### 📦 COMMON TASKS

- [Create List Page](#create-list-page) - Admin/seller resource pages
- [Create Detail Page](#create-detail-page) - Product/auction/shop details
- [Create Form](#create-form) - Wizard steps, inline forms
- [Add API Endpoint](#add-api-endpoint) - REST routes with validation

---

## 🚀 CRITICAL - USE THESE FIRST

### Reusable Hooks

**Location**: `src/hooks/`

#### useLoadingState (MOST IMPORTANT)

```typescript
import { useLoadingState } from "@/hooks/useLoadingState";

const {
  isLoading: loading,
  error,
  data,
  setData,
  execute,
} = useLoadingState<T[]>({
  initialData: [],
  onLoadError: (error) => {
    logError(error, { component: "ComponentName.methodName" });
    toast.error("Failed to load");
  },
});

const loadData = () =>
  execute(async () => {
    return await service.getData();
  });
```

**Replaces**: Manual `useState(loading)`, `useState(error)`, `useState(data)`, try-catch-finally blocks

#### useDebounce (Search Inputs)

```typescript
import { useDebounce } from "@/hooks/useDebounce";

const [searchQuery, setSearchQuery] = useState("");
const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms delay
```

**Use for**: Search bars, category selectors, any user input that triggers API calls

#### useFilters (List Pages)

```typescript
import { useFilters } from "@/hooks/useFilters";

const { filters, updateFilter, resetFilters, activeFilterCount } =
  useFilters(initialFilters);
```

**Use for**: Product lists, auction lists, admin tables

#### useAdminLoad (Admin Pages Only)

```typescript
import { useAdminLoad } from "@/hooks/useAdminLoad";

const {
  data: users,
  loading,
  error,
  reload,
} = useAdminLoad<User>(COLLECTIONS.USERS, "Users");
```

**Use for**: Admin list pages that need auto-load

### Wrapper Components

**Location**: `src/components/`

#### AdminResourcePage (600-900 lines → 150 lines)

```typescript
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";

<AdminResourcePage
  title="Users"
  collection={COLLECTIONS.USERS}
  columns={userColumns}
  filters={userFilters}
  bulkActions={userBulkActions}
  onRowClick={(user) => router.push(`/admin/users/${user.id}`)}
/>;
```

**Use for**: ALL admin list pages (users, products, shops, orders, etc.)

#### FormField + FormInput (Replaces label + input)

```typescript
import { FormField, FormInput } from "@/components/forms";

<FormField label="Email" required error={errors.email}>
  <FormInput
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormField>;
```

#### Price (Replaces ₹{amount.toLocaleString()})

```typescript
import { Price } from '@/components/common/value/Price';

<Price amount={1234.56} /> // Output: ₹1,234.56
<Price amount={1234.56} variant="compact" /> // Output: ₹1.2K
```

#### DateDisplay (Replaces date.toLocaleDateString())

```typescript
import { DateDisplay } from '@/components/common/value/DateDisplay';

<DateDisplay date={new Date()} format="full" /> // December 4, 2025
<DateDisplay date={new Date()} format="relative" /> // 2 hours ago
```

#### StatusBadge (Replaces custom badge divs)

```typescript
import { StatusBadge } from '@/components/common/value/StatusBadge';

<StatusBadge status="active" label="Active" />
<StatusBadge status="pending" label="Pending Approval" />
```

### Constants

**Location**: `src/constants/`

#### COLLECTIONS (Database)

```typescript
import { COLLECTIONS } from "@/constants/database";

// ❌ DON'T: 'users', 'products', 'shops'
// ✅ DO:
COLLECTIONS.USERS;
COLLECTIONS.PRODUCTS;
COLLECTIONS.SHOPS;
COLLECTIONS.AUCTIONS;
```

#### ROUTES (Navigation)

```typescript
import { ROUTES } from "@/constants/routes";

router.push(ROUTES.SELLER.PRODUCTS.LIST);
router.push(ROUTES.ADMIN.USERS.DETAIL(userId));
```

#### VALIDATION_RULES & VALIDATION_MESSAGES (Forms)

```typescript
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

// In Zod schemas:
z.string()
  .min(VALIDATION_RULES.NAME.MIN_LENGTH, VALIDATION_MESSAGES.NAME.TOO_SHORT)
  .max(VALIDATION_RULES.NAME.MAX_LENGTH, VALIDATION_MESSAGES.NAME.TOO_LONG);
```

#### QUERY_LIMITS (Pagination)

```typescript
import { QUERY_LIMITS } from "@/constants/database";

const limit = QUERY_LIMITS.DEFAULT; // 20
const maxLimit = QUERY_LIMITS.MAX; // 100
```

### Validation Helpers

**Location**: `src/constants/validation-messages.ts`

```typescript
import {
  isValidEmail,
  isValidPhone,
  isValidGST,
  isValidPAN,
  isValidPassword,
} from "@/constants/validation-messages";

// Email validation
if (!isValidEmail(email)) {
  setError(VALIDATION_MESSAGES.EMAIL.INVALID);
}

// Phone validation (Indian 10-digit)
if (!isValidPhone(phone)) {
  setError(VALIDATION_MESSAGES.PHONE.INVALID);
}

// GST validation (22AAAAA0000A1Z5 format)
if (!isValidGST(gst)) {
  setError(VALIDATION_MESSAGES.GST.INVALID);
}

// PAN validation (ABCDE1234F format)
if (!isValidPAN(pan)) {
  setError(VALIDATION_MESSAGES.PAN.INVALID);
}

// Password strength
if (!isValidPassword(password)) {
  setError(VALIDATION_MESSAGES.PASSWORD.TOO_WEAK);
}
```

---

## 📁 PROJECT STRUCTURE

### File Organization

```
src/
├── app/                    # Next.js pages (routing)
│   ├── (auth)/            # Auth pages (login, register)
│   ├── admin/             # Admin dashboard pages
│   ├── seller/            # Seller dashboard pages
│   ├── user/              # User dashboard pages
│   ├── api/               # API routes (Backend)
│   │   ├── lib/          # API utilities
│   │   │   ├── firebase/  # Backend Firebase (Admin SDK, Firestore, Storage)
│   │   │   │   ├── admin.ts      # Firebase Admin initialization
│   │   │   │   ├── config.ts     # Firestore & Storage config
│   │   │   │   ├── collections.ts # Firestore collections helpers
│   │   │   │   ├── queries.ts    # Reusable Firestore queries
│   │   │   │   └── transactions.ts # Firestore transactions
│   │   │   ├── auth.ts    # Auth middleware
│   │   │   └── session.ts # Session management
│   │   └── [resource]/   # Resource-specific routes (products, users, etc.)
│   └── [public]/          # Public pages (products, auctions, shops)
├── components/            # React components (UI only)
│   ├── common/           # Shared components (Price, DateDisplay, StatusBadge)
│   ├── forms/            # Form components (FormField, FormInput)
│   ├── layout/           # Layout components (Header, Footer, Sidebar)
│   ├── admin/            # Admin-specific components
│   ├── seller/           # Seller-specific components
│   └── [feature]/        # Feature-specific components
├── constants/            # App-wide constants
├── hooks/                # Custom React hooks
├── lib/                  # Client-side utilities (UI only)
│   ├── firebase/         # Client Firebase (Auth, Realtime DB only)
│   │   ├── query-helpers.ts    # Client-side query helpers
│   │   └── timestamp-helpers.ts # Date/time utilities
│   └── [utility]/        # Other client utilities
├── services/             # API service layer (calls API routes)
├── types/                # TypeScript type definitions
└── styles/               # Global styles

Firebase Architecture:
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (src/lib/firebase/)                                │
│ - Firebase Auth (Client SDK)                                │
│ - Realtime Database (Client SDK) - Only for real-time UI    │
│ - NO direct Firestore/Storage access                        │
└─────────────────────────────────────────────────────────────┘
                          ↓ API Calls
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (src/app/api/lib/firebase/)                         │
│ - Firebase Admin SDK                                         │
│ - Firestore (Admin SDK) - All database operations           │
│ - Storage (Admin SDK) - File uploads/downloads              │
│ - Auth verification                                          │
└─────────────────────────────────────────────────────────────┘
```

### Naming Conventions

| Type           | Convention            | Example                        |
| -------------- | --------------------- | ------------------------------ |
| Component File | PascalCase.tsx        | `ProductCard.tsx`              |
| Hook File      | camelCase.ts          | `useLoadingState.ts`           |
| Service File   | kebab-case.service.ts | `products.service.ts`          |
| Constant File  | kebab-case.ts         | `validation-messages.ts`       |
| API Route      | kebab-case/route.ts   | `api/products/[slug]/route.ts` |
| Type File      | kebab-case.types.ts   | `product.types.ts`             |
| Component Name | PascalCase            | `ProductCard`                  |
| Hook Name      | useCamelCase          | `useLoadingState`              |
| Constant Name  | SCREAMING_SNAKE_CASE  | `COLLECTIONS.USERS`            |
| Function Name  | camelCase             | `getUserById`                  |
| Variable Name  | camelCase             | `productList`, `isLoading`     |

### File Size Limits

| File Type      | Max Lines | Action Required                  |
| -------------- | --------- | -------------------------------- |
| Page Component | 500       | Use `AdminResourcePage` or split |
| Component      | 300       | Split into sub-components        |
| Service        | 400       | Split by feature                 |
| Hook           | 200       | Split into separate hooks        |

**How to Split Large Files**:

1. Extract sections into separate components
2. Use wrapper components (`AdminResourcePage`, `FormField`)
3. Move logic to custom hooks
4. Move data fetching to services

---

## 🎨 UI/UX PATTERNS

### Dark Mode

**REQUIRED**: All components must support dark mode

```typescript
// Basic pattern:
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">

// Common classes:
bg-white dark:bg-gray-800           // Container backgrounds
bg-gray-50 dark:bg-gray-900         // Page backgrounds
bg-gray-100 dark:bg-gray-700        // Secondary backgrounds
text-gray-900 dark:text-white       // Primary text
text-gray-600 dark:text-gray-300    // Secondary text
border-gray-200 dark:border-gray-700 // Borders
hover:bg-gray-50 dark:hover:bg-gray-700 // Hover states
```

### Mobile Responsive

**Breakpoints**:

- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

**Common patterns**:

```typescript
// Grid: 1 col mobile → 2 col tablet → 4 col desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

// Text size: small mobile → larger desktop
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Padding: less mobile → more desktop
<div className="p-4 md:p-6 lg:p-8">

// Hidden on mobile, visible on desktop
<div className="hidden lg:block">

// Full width mobile, constrained desktop
<div className="w-full lg:max-w-4xl lg:mx-auto">
```

### Form Components

**Use FormField + FormInput**:

```typescript
import { FormField, FormInput, FormTextarea, FormSelect } from '@/components/forms';

// Text input
<FormField label="Product Name" required error={errors.name}>
  <FormInput
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Enter product name"
  />
</FormField>

// Textarea
<FormField label="Description" required error={errors.description}>
  <FormTextarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    rows={5}
  />
</FormField>

// Select
<FormField label="Category" required error={errors.category}>
  <FormSelect
    value={category}
    onChange={(e) => setCategory(e.target.value)}
  >
    <option value="">Select category</option>
    <option value="electronics">Electronics</option>
  </FormSelect>
</FormField>
```

**Form submission with useLoadingState**:

```typescript
const { execute } = useLoadingState();
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  await execute(async () => {
    await productsService.create(formData);
    toast.success("Product created");
    router.push(ROUTES.SELLER.PRODUCTS.LIST);
  });

  setSubmitting(false);
};
```

### Value Display

**Use value components instead of manual formatting**:

```typescript
import { Price, CompactPrice } from '@/components/common/value/Price';
import { DateDisplay, RelativeDate, DateRange } from '@/components/common/value/DateDisplay';
import { StatusBadge } from '@/components/common/value/StatusBadge';

// ❌ DON'T:
<span>₹{price.toLocaleString('en-IN')}</span>
<span>{new Date(date).toLocaleDateString()}</span>
<span className="bg-green-100 text-green-800">Active</span>

// ✅ DO:
<Price amount={price} />
<DateDisplay date={date} format="full" />
<StatusBadge status="active" />
```

---

## 🔧 BACKEND PATTERNS

### API Routes

**Location**: `src/app/api/[resource]/route.ts`

**REST conventions**:

- `GET /api/products` - List products
- `GET /api/products/[slug]` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/[slug]` - Update product
- `DELETE /api/products/[slug]` - Delete product

**Standard structure**:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/firebase-error-logger";
import { productsService } from "@/services/products.service";

export async function GET(request: NextRequest) {
  try {
    const products = await productsService.list();
    return NextResponse.json({ products });
  } catch (error) {
    logError(error, { component: "ProductsAPI.GET" });
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
```

### Database Operations

**IMPORTANT: Firestore is BACKEND ONLY**

```typescript
// ❌ NEVER in frontend/components:
import { db } from "@/lib/firebase/config";
const usersRef = db.collection("users"); // NO DIRECT FIRESTORE ACCESS

// ✅ ALWAYS use services in frontend:
import { usersService } from "@/services/users.service";
const users = await usersService.list(); // API call to backend

// ✅ Firestore ONLY in backend (src/app/api/**):
import { COLLECTIONS } from "@/constants/database";
import { adminDb } from "@/app/api/lib/firebase/config";

const usersRef = adminDb.collection(COLLECTIONS.USERS);
```

**Firestore query patterns (BACKEND ONLY - src/app/api/**):\*\*

```typescript
import { adminDb } from "@/app/api/lib/firebase/config";
import { COLLECTIONS } from "@/constants/database";

// Get by ID
const doc = await adminDb.collection(COLLECTIONS.USERS).doc(userId).get();

// Query with filters
const snapshot = await adminDb
  .collection(COLLECTIONS.PRODUCTS)
  .where("status", "==", "active")
  .where("price", "<=", 1000)
  .orderBy("createdAt", "desc")
  .limit(20)
  .get();

// Subcollection
const reviewsRef = adminDb
  .collection(COLLECTIONS.PRODUCTS)
  .doc(productId)
  .collection(COLLECTIONS.REVIEWS);
```

### Services Layer

**Always use service methods instead of direct API calls**:

```typescript
import { productsService } from "@/services/products.service";
import { auctionsService } from "@/services/auctions.service";
import { usersService } from "@/services/users.service";

// ❌ DON'T:
const response = await fetch("/api/products");
const products = await response.json();

// ✅ DO:
const products = await productsService.list();
const product = await productsService.getBySlug(slug);
```

**Service file structure**:

```typescript
// src/services/products.service.ts
import { Product } from "@/types/product.types";

class ProductsService {
  async list(): Promise<Product[]> {
    // Implementation
  }

  async getBySlug(slug: string): Promise<Product> {
    // Implementation
  }

  async create(data: Partial<Product>): Promise<Product> {
    // Implementation
  }

  async update(slug: string, data: Partial<Product>): Promise<Product> {
    // Implementation
  }

  async delete(slug: string): Promise<void> {
    // Implementation
  }
}

export const productsService = new ProductsService();
```

### Error Handling

**Use logError for all errors**:

```typescript
import { logError } from "@/lib/firebase-error-logger";

try {
  await productsService.create(data);
} catch (error) {
  logError(error, {
    component: "ProductWizard.handleSubmit",
    productData: data,
  });
  toast.error("Failed to create product");
}
```

**Error handling with useLoadingState**:

```typescript
const { execute } = useLoadingState({
  onLoadError: (error) => {
    logError(error, { component: "ProductList.loadProducts" });
    toast.error("Failed to load products");
  },
});

const loadProducts = () =>
  execute(async () => {
    return await productsService.list();
  });
```

---

## 🧪 TESTING & QUALITY

### Testing Requirements

**Unit tests**: Components, hooks, utilities
**Integration tests**: API routes, service methods
**E2E tests**: Critical user flows (checkout, bidding)

**Test file naming**:

- `ProductCard.test.tsx` - Component test
- `useLoadingState.test.ts` - Hook test
- `products.service.test.ts` - Service test

### Type Safety

**Always define types**:

```typescript
// ❌ DON'T:
const products: any[] = [];

// ✅ DO:
import { Product } from "@/types/product.types";
const products: Product[] = [];
```

**Avoid unsafe casts**:

```typescript
// ❌ DON'T:
const user = data as unknown as User;

// ✅ DO:
// Create proper type guard or validation
function isUser(obj: unknown): obj is User {
  return typeof obj === "object" && obj !== null && "id" in obj;
}
```

### Accessibility

**Required ARIA labels**:

```typescript
// Buttons
<button aria-label="Close modal">×</button>

// Inputs
<input aria-label="Search products" />

// Modals
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Confirm Delete</h2>
</div>

// Loading states
<div aria-busy="true" aria-live="polite">Loading...</div>
```

**Keyboard navigation**:

- All interactive elements must be focusable
- Tab order must be logical
- Escape key closes modals
- Enter/Space activates buttons

---

## 📦 COMMON TASKS

### Create List Page

**Use AdminResourcePage wrapper**:

```typescript
// src/app/admin/users/page.tsx
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { COLLECTIONS } from "@/constants/database";

const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "role", label: "Role", sortable: false },
  { key: "createdAt", label: "Joined", sortable: true },
];

const filters = [
  {
    type: "select",
    field: "role",
    label: "Role",
    options: ["buyer", "seller", "admin"],
  },
  {
    type: "select",
    field: "status",
    label: "Status",
    options: ["active", "suspended"],
  },
];

const bulkActions = [
  { id: "activate", label: "Activate", icon: CheckIcon },
  { id: "suspend", label: "Suspend", icon: XIcon },
];

export default function UsersPage() {
  return (
    <AdminResourcePage
      title="Users"
      collection={COLLECTIONS.USERS}
      columns={columns}
      filters={filters}
      bulkActions={bulkActions}
      searchFields={["name", "email"]}
      onRowClick={(user) => router.push(`/admin/users/${user.id}`)}
    />
  );
}
```

### Create Detail Page

**Standard pattern**:

```typescript
// src/app/products/[slug]/page.tsx
import { productsService } from "@/services/products.service";
import { useLoadingState } from "@/hooks/useLoadingState";

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const {
    isLoading: loading,
    data: product,
    execute,
  } = useLoadingState<Product>({
    onLoadError: (error) => {
      logError(error, { component: "ProductDetail.loadProduct" });
      toast.error("Failed to load product");
    },
  });

  useEffect(() => {
    execute(async () => {
      return await productsService.getBySlug(params.slug);
    });
  }, [params.slug]);

  if (loading) return <LoadingSpinner />;
  if (!product) return <NotFound />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <Price amount={product.price} />
      <p>{product.description}</p>
    </div>
  );
}
```

### Create Form

**Use FormField components and useLoadingState**:

```typescript
import {
  FormField,
  FormInput,
  FormTextarea,
  FormSelect,
} from "@/components/forms";
import { useLoadingState } from "@/hooks/useLoadingState";

export default function ProductForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { execute } = useLoadingState({
    onLoadError: (error) => {
      logError(error, { component: "ProductForm.handleSubmit" });
      toast.error("Failed to create product");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    await execute(async () => {
      await productsService.create({
        name,
        description,
        price: parseFloat(price),
      });
      toast.success("Product created successfully");
      router.push(ROUTES.SELLER.PRODUCTS.LIST);
    });

    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField label="Product Name" required>
        <FormInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter product name"
        />
      </FormField>

      <FormField label="Description" required>
        <FormTextarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
        />
      </FormField>

      <FormField label="Price" required>
        <FormInput
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
        />
      </FormField>

      <button type="submit" disabled={submitting} className="btn btn-primary">
        {submitting ? "Creating..." : "Create Product"}
      </button>
    </form>
  );
}
```

### Add API Endpoint

**Standard REST endpoint with validation**:

```typescript
// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/firebase-error-logger";
import { productsService } from "@/services/products.service";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

const productSchema = z.object({
  name: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH, VALIDATION_MESSAGES.NAME.TOO_SHORT)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH, VALIDATION_MESSAGES.NAME.TOO_LONG),
  price: z
    .number()
    .min(VALIDATION_RULES.PRICE.MIN, VALIDATION_MESSAGES.PRICE.INVALID),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const product = await productsService.create(validatedData);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    logError(error, { component: "ProductsAPI.POST" });
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const products = await productsService.list({ limit, offset });

    return NextResponse.json({ products });
  } catch (error) {
    logError(error, { component: "ProductsAPI.GET" });
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
```

---

## 🔍 Quick Lookup

### Find Component Location

| Component Type     | Location                               |
| ------------------ | -------------------------------------- |
| Form components    | `src/components/forms/`                |
| Value displays     | `src/components/common/value/`         |
| Layout components  | `src/components/layout/`               |
| Admin components   | `src/components/admin/`                |
| Seller components  | `src/components/seller/`               |
| Product components | `src/components/product/`              |
| Auction components | `src/components/auction/`              |
| Shop components    | `src/components/shop/`                 |
| Cart/Checkout      | `src/components/checkout/` or `/cart/` |
| Auth components    | `src/components/auth/`                 |

### Find Constant Location

| Constant Type        | File                                   |
| -------------------- | -------------------------------------- |
| Database collections | `src/constants/database.ts`            |
| Routes/URLs          | `src/constants/routes.ts`              |
| API endpoints        | `src/constants/api-routes.ts`          |
| Validation rules     | `src/constants/validation-messages.ts` |
| Query limits         | `src/constants/database.ts`            |
| Tab configurations   | `src/constants/tabs.ts`                |
| Navigation items     | `src/constants/navigation.ts`          |

### Find Hook Location

| Hook            | File                           |
| --------------- | ------------------------------ |
| useLoadingState | `src/hooks/useLoadingState.ts` |
| useDebounce     | `src/hooks/useDebounce.ts`     |
| useFilters      | `src/hooks/useFilters.ts`      |
| useAdminLoad    | `src/hooks/useAdminLoad.ts`    |
| useAuth         | `src/hooks/useAuth.ts`         |
| useCart         | `src/hooks/useCart.ts`         |

### Find Service Location

| Service    | File                                 |
| ---------- | ------------------------------------ |
| Products   | `src/services/products.service.ts`   |
| Auctions   | `src/services/auctions.service.ts`   |
| Shops      | `src/services/shops.service.ts`      |
| Users      | `src/services/users.service.ts`      |
| Orders     | `src/services/orders.service.ts`     |
| Categories | `src/services/categories.service.ts` |
| Reviews    | `src/services/reviews.service.ts`    |

---

## 📌 Quick Reminders

### Before Creating New Code

1. ✅ Check if `AdminResourcePage` / `SellerResourcePage` can be used
2. ✅ Check for existing similar components in `src/components/common/`
3. ✅ Check for existing hooks in `src/hooks/`
4. ✅ Use `COLLECTIONS.*` constants instead of hardcoded strings
5. ✅ Use `ROUTES.*` constants instead of hardcoded URLs
6. ✅ Use validation helpers (`isValidEmail`, `isValidPhone`, etc.)
7. ✅ Include dark mode classes (`dark:bg-gray-800`, `dark:text-white`)
8. ✅ Use services instead of direct `fetch()` calls
9. ✅ Use `useLoadingState` instead of manual loading states
10. ✅ Use `useDebounce(300)` for search inputs

### Common Mistakes to Avoid

| ❌ Don't                          | ✅ Do                                   |
| --------------------------------- | --------------------------------------- |
| `'users'`                         | `COLLECTIONS.USERS`                     |
| `'/seller/products'`              | `ROUTES.SELLER.PRODUCTS.LIST`           |
| `fetch('/api/products')`          | `productsService.list()`                |
| `₹{price.toLocaleString()}`       | `<Price amount={price} />`              |
| `new Date().toLocaleDateString()` | `<DateDisplay date={date} />`           |
| Manual `useState(loading)`        | `useLoadingState()`                     |
| No debounce on search             | `useDebounce(searchQuery, 300)`         |
| `<label><input /></label>`        | `<FormField><FormInput /></FormField>`  |
| `bg-white` only                   | `bg-white dark:bg-gray-800`             |
| `console.log(error)`              | `logError(error, { component: '...' })` |
| Admin list page 600+ lines        | `<AdminResourcePage />`                 |

---

## 📚 Full Documentation

For complete details, see:

- **AI-AGENT-GUIDE.md** - Full guide (1,491 lines)
- **README.md** - Project overview and setup
- **PRIORITY-CHECKLIST.md** - Implementation tasks
- **docs/** - Component documentation

---

_Last Updated: December 4, 2025_  
_Quick Reference Version: 1.0_
