# Quick Reference — Common Patterns

> Canonical patterns. Every snippet here complies with the mandatory rules in
> [`.github/copilot-instructions.md`](../.github/copilot-instructions.md).  
> **Last Updated**: February 21, 2026

---

## Import Patterns

```typescript
// ✅ Always use barrel imports — never deep paths
import { Button, FormField, DataTable, SideDrawer, Modal } from "@/components";
import {
  useApiQuery,
  useApiMutation,
  useAuth,
  useMessage,
  useUrlTable,
} from "@/hooks";
import { formatCurrency, formatDate, slugify, isValidEmail } from "@/utils";
import { groupBy, pick, omit, classNames } from "@/helpers";
import { cacheManager, logger, eventBus } from "@/classes";
import {
  ROUTES,
  API_ENDPOINTS,
  UI_LABELS,
  UI_PLACEHOLDERS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  THEME_CONSTANTS,
} from "@/constants";
import {
  userRepository,
  productRepository,
  orderRepository,
} from "@/repositories";
import type { UserDocument, ProductDocument } from "@/db/schema";
import { USER_COLLECTION, USER_FIELDS, SCHEMA_DEFAULTS } from "@/db/schema";
```

---

## API Route — GET (List with Sieve)

```typescript
// src/app/api/products/route.ts
import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse } from "@/lib/api-response";
import { productRepository } from "@/repositories";
import type { SieveModel } from "@/lib/query/firebase-sieve";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const model: SieveModel = {
      filters: searchParams.get("filters") ?? undefined,
      sorts: searchParams.get("sorts") ?? "-createdAt",
      page: searchParams.get("page") ?? "1",
      pageSize: searchParams.get("pageSize") ?? "25",
    };

    // Append named convenience params to Sieve filters
    const parts: string[] = [];
    const status = searchParams.get("status");
    if (status) parts.push(`status==${status}`);
    if (model.filters) parts.push(model.filters);
    model.filters = parts.join(",") || undefined;

    const result = await productRepository.list(model);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## API Route — POST (Authenticated Mutation)

```typescript
// src/app/api/products/route.ts
import { NextRequest } from "next/server";
import { verifySessionCookie } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors/error-handler";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { productRepository } from "@/repositories";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(3),
  price: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const sessionCookie = request.cookies.get("__session")?.value;
    if (!sessionCookie)
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    const token = await verifySessionCookie(sessionCookie);
    if (!token)
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.SESSION_EXPIRED);

    // 2. Role guard (if needed)
    if (token.role !== "seller" && token.role !== "admin") {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED);
    }

    // 3. Validate body
    const body = await request.json();
    const result = createSchema.safeParse(body);
    if (!result.success) return ApiErrors.validationError(result.error.issues);

    // 4. Repository (never direct Firestore)
    const product = await productRepository.create({
      ...result.data,
      sellerId: token.uid,
    });

    // 5. Return
    return successResponse(product, SUCCESS_MESSAGES.PRODUCT.CREATED);
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## Client Component — Data Fetching

```tsx
"use client";
import { useApiQuery } from "@/hooks";
import { API_ENDPOINTS, UI_LABELS } from "@/constants";
import { LoadingSpinner, EmptyState, Alert } from "@/components";

export function ProductList() {
  const { data, loading, error } = useApiQuery(API_ENDPOINTS.PRODUCTS.LIST);

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error" message={error.message} />;
  if (!data?.items?.length)
    return <EmptyState title={UI_LABELS.EMPTY.NO_DATA} />;

  return (
    <ul>
      {data.items.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
```

---

## Client Component — Mutation (POST / PUT / DELETE)

```tsx
"use client";
import { useApiMutation, useMessage } from "@/hooks";
import { API_ENDPOINTS, UI_LABELS, SUCCESS_MESSAGES } from "@/constants";
import { Button, FormField } from "@/components";

export function CreateProductForm() {
  const { showSuccess, showError } = useMessage();
  const { mutate, loading } = useApiMutation(API_ENDPOINTS.PRODUCTS.LIST, {
    method: "POST",
    onSuccess: () => showSuccess(SUCCESS_MESSAGES.PRODUCT.CREATED),
    onError: (e) => showError(e.message),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutate({ title: "New Product" });
      }}
    >
      <Button type="submit" isLoading={loading}>
        {UI_LABELS.ACTIONS.SAVE}
      </Button>
    </form>
  );
}
```

---

## Admin List Page with URL Filters

```tsx
"use client";
import { useApiQuery, useUrlTable } from "@/hooks";
import { API_ENDPOINTS } from "@/constants";
import { DataTable, AdminFilterBar, AdminPageHeader } from "@/components";

export default function AdminProductsPage() {
  const table = useUrlTable({
    defaults: { pageSize: "25", sort: "-createdAt" },
  });

  const { data, loading } = useApiQuery(
    `${API_ENDPOINTS.ADMIN.PRODUCTS}?${table.buildSieveParams()}`,
    { queryKey: ["admin-products", table.params.toString()] },
  );

  return (
    <>
      <AdminPageHeader title="Products" />
      <AdminFilterBar>
        {/* filter inputs call table.set('status', value) */}
      </AdminFilterBar>
      <DataTable columns={columns} data={data?.items ?? []} loading={loading} />
    </>
  );
}
```

---

## Form with Validation

```tsx
"use client";
import { useState } from "react";
import { useApiMutation, useMessage } from "@/hooks";
import { isValidEmail } from "@/utils";
import { FormField, Button, Alert } from "@/components";
import {
  API_ENDPOINTS,
  UI_LABELS,
  UI_PLACEHOLDERS,
  ERROR_MESSAGES,
} from "@/constants";

export function InviteForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { showSuccess } = useMessage();
  const { mutate, loading } = useApiMutation(API_ENDPOINTS.ADMIN.INVITE, {
    method: "POST",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL);
      return;
    }
    setError("");
    mutate({ email });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert type="error" message={error} />}
      <FormField
        label={UI_LABELS.FORM.EMAIL}
        name="email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder={UI_PLACEHOLDERS.EMAIL}
        error={error}
        required
      />
      <Button type="submit" isLoading={loading}>
        {UI_LABELS.ACTIONS.SUBMIT}
      </Button>
    </form>
  );
}
```

---

## Confirm Delete Modal

```tsx
import { ConfirmDeleteModal } from "@/components";
import { UI_LABELS } from "@/constants";

<ConfirmDeleteModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title={UI_LABELS.ACTIONS.DELETE}
  description="This action cannot be undone."
/>;
```

---

## Available Constants (Key Categories)

| Need                       | Constant                                    | Example keys                                                 |
| -------------------------- | ------------------------------------------- | ------------------------------------------------------------ |
| Button/action labels       | `UI_LABELS.ACTIONS.*`                       | `.SAVE` `.DELETE` `.CANCEL` `.SUBMIT`                        |
| Form field labels          | `UI_LABELS.FORM.*`                          | `.EMAIL` `.PASSWORD` `.PHONE`                                |
| Empty / loading states     | `UI_LABELS.EMPTY.*` · `UI_LABELS.LOADING.*` | `.NO_DATA` `.DEFAULT`                                        |
| Input placeholders         | `UI_PLACEHOLDERS.*`                         | `.EMAIL` `.SEARCH` `.PHONE`                                  |
| Error messages             | `ERROR_MESSAGES.<DOMAIN>.*`                 | `.AUTH.UNAUTHORIZED` `.VALIDATION.FAILED`                    |
| Success messages           | `SUCCESS_MESSAGES.<DOMAIN>.*`               | `.PRODUCT.CREATED` `.USER.UPDATED`                           |
| Page routes                | `ROUTES.<AREA>.*`                           | `.AUTH.LOGIN` `.ADMIN.DASHBOARD`                             |
| API paths                  | `API_ENDPOINTS.<AREA>.*`                    | `.PRODUCTS.LIST` `.ADMIN.USERS`                              |
| Tailwind patterns          | `THEME_CONSTANTS.*`                         | `.themed.bgPrimary` `.spacing.stack` `.typography.h2`        |
| Firestore collection names | `*_COLLECTION` from `@/db/schema`           | `USER_COLLECTION` `PRODUCT_COLLECTION`                       |
| Firestore field names      | `*_FIELDS.*` from `@/db/schema`             | `USER_FIELDS.EMAIL` `PRODUCT_FIELDS.STATUS_VALUES.PUBLISHED` |

---

## Available Repositories

```typescript
import {
  userRepository, // findById, findByEmail, create, update, delete
  productRepository, // + list(model), findBySlug, findByIdOrSlug
  orderRepository, // + listForSeller(productIds, model)
  reviewRepository, // + listForProduct(productId, model)
  sessionRepository,
  categoryRepository,
  couponRepository,
  bidRepository,
  faqRepository,
  siteSettingsRepository,
  carouselRepository,
  homepageSectionsRepository,
} from "@/repositories";
```

All extend `BaseRepository` which provides `sieveQuery()` — Firestore-native filtered/sorted/paginated lists.

---

## Throwing Errors (API Routes)

```typescript
import {
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";

throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
throw new AuthorizationError(ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED);
// handleApiError(error) in the catch block maps these → correct HTTP codes automatically
```

Never use `throw new Error('...')` — always use typed error classes.

---

## Logging

```typescript
// Client components
import { logger } from "@/classes";
logger.info("Component mounted", { componentName: "ProductCard" });

// API routes / server code
import { serverLogger } from "@/lib/server-logger";
serverLogger.info("Product created", { productId, sellerId });
serverLogger.error("DB write failed", { collection, error });
```

Never use `console.log` in production code.

---

## Key File Locations

```
constants/              src/constants/          (ui.ts, messages.ts, routes.ts, api-endpoints.ts, theme.ts)
db schemas              src/db/schema/          (users.ts, products.ts, orders.ts, …)
repositories            src/repositories/       (*.repository.ts)
hooks                   src/hooks/              (useApiQuery, useApiMutation, useUrlTable, useAuth, …)
utils                   src/utils/              (formatters, validators, converters, events)
helpers                 src/helpers/            (auth, data, ui)
classes                 src/classes/            (CacheManager, Logger, EventBus, StorageManager, Queue)
UI components           src/components/         (ui/, admin/, auth/, layout/, …)
feature modules         src/features/           (products/, cart/, auth/, seller/, user/, …)
API routes              src/app/api/
Firebase admin SDK      src/lib/firebase/admin.ts     ← API routes only
Firebase client SDK     src/lib/firebase/config.ts    ← client components only
Error classes           src/lib/errors/
API response helpers    src/lib/api-response.ts
Server logger           src/lib/server-logger.ts
Sieve query builder     src/lib/query/firebase-sieve.ts
```

---

## Checklist Before Submitting Code

✅ **DO:**

- Barrel imports only (`@/components`, `@/hooks`, `@/utils`, `@/constants`)
- `UI_LABELS` / `UI_PLACEHOLDERS` for all UI text
- `THEME_CONSTANTS` for repeated Tailwind class strings
- `ROUTES.*` for page links, `API_ENDPOINTS.*` for fetch URLs
- Repositories for all Firestore access
- `*_FIELDS.*` constants for Firestore field name strings
- Typed error classes + `handleApiError()` in all API routes
- `logger` (client) or `serverLogger` (API) — never `console.log`
- `useUrlTable` for any page with filters/sorting/pagination
- `router.replace()` for filter changes (never `router.push()`)

❌ **DON'T:**

- Deep imports (`@/components/ui/Button`, `@/hooks/useApiQuery`)
- Hardcoded UI strings, error messages, or route paths
- Raw Tailwind class strings that repeat across files
- Direct Firestore queries in pages or components
- `throw new Error('...')` in API routes
- `console.log` anywhere
- `alert()` / `confirm()` / `prompt()`
- `router.push()` for filter/sort state changes
